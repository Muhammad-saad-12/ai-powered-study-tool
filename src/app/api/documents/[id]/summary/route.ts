import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth'

async function getAuthenticatedUser(request: NextRequest) {
  const cookieStore = await cookies()
  let token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) return null

  const payload = await verifyAuthToken(token)
  if (!payload?.sub) return null

  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, credits: true },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Please log in to generate summaries' },
      { status: 401 }
    )
  }

  const { id: documentId } = await params
  if (!documentId) {
    return NextResponse.json(
      { error: 'Document ID is required' },
      { status: 400 }
    )
  }

  // 2. Verify document ownership
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  })

  if (!document) {
    return NextResponse.json(
      { error: 'Document not found or you do not have permission to view it' },
      { status: 404 }
    )
  }

  // 3. Check credits >= 1 (403 if 0)
  if (user.credits < 1) {
    return NextResponse.json(
      {
        error: 'Insufficient credits. You need at least 1 credit to generate a summary.',
        credits: user.credits,
      },
      { status: 403 }
    )
  }

  // 4. API Key resolution for Gemini (GEMINI_API_KEY with GOOGLE_GENERATIVE_AI_API_KEY fallback)
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey || apiKey === 'dummy-gemini-key-for-development') {
    // If running in development/test without real Gemini key, handle gracefully
    // Check if real key is present
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in environment variables' },
        { status: 500 }
      )
    }
  }

  // Set fallback env for library consistency
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY
  }

  const google = createGoogleGenerativeAI({
    apiKey: apiKey!,
  })

  // 5. Deduct 1 credit from user
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: {
        decrement: 1,
      },
    },
    select: {
      id: true,
      credits: true,
    },
  })

  // 6. Truncate document content safely to 30,000 characters
  const truncatedContent = (document.content || '').slice(0, 30000)

  try {
    const result = streamText({
      model: google('gemini-3.8-flash'),
      system: `You are an expert academic tutor and AI productivity assistant.
Your task is to analyze the document and provide a high-yield, structured Markdown study summary.
Format your output strictly using the following three Markdown section headers:

## Executive Overview
A clear, high-level summary of the document's central thesis, purpose, and background.

## Key Concepts
Bullet points highlighting core concepts, technical terms, definitions, and important arguments.

## Actionable Takeaways
Concrete conclusions, key lessons, practical implications, or recommended next steps.`,
      prompt: `Document Title: ${document.title} (${document.fileType.toUpperCase()})

Document Content:
${truncatedContent}

Please generate the structured Markdown study summary now.`,
      onFinish: async ({ text }) => {
        try {
          await prisma.document.update({
            where: { id: document.id },
            data: { summary: text },
          })
        } catch (dbErr) {
          console.error('Failed to save document summary to database:', dbErr)
        }
      },
    })

    return result.toTextStreamResponse({
      headers: {
        'X-Remaining-Credits': String(updatedUser.credits),
      },
    })
  } catch (err) {
    console.error('Error initiating Gemini summary stream:', err)
    // Refund credit if initialization failed before streaming
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { increment: 1 } },
    })

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Failed to generate study summary with Gemini',
      },
      { status: 500 }
    )
  }
}
