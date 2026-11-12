import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateText } from 'ai'
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

// Fallback models in priority order
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
] as const

const MAX_ATTEMPTS_PER_MODEL = 2
const RETRY_BACKOFF_MS = 1000

function isRetryableOrCongestionError(err: unknown): boolean {
  if (!err) return false

  const status =
    (err as { status?: number })?.status ||
    (err as { statusCode?: number })?.statusCode ||
    (err as { response?: { status?: number } })?.response?.status

  if (status === 503 || status === 429) {
    return true
  }

  const message = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return (
    message.includes('503') ||
    message.includes('429') ||
    message.includes('resource_exhausted') ||
    message.includes('unavailable') ||
    message.includes('overloaded') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('rate_limit') ||
    message.includes('too many requests') ||
    message.includes('service unavailable')
  )
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
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in environment variables' },
        { status: 500 }
      )
    }
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY
  }

  const google = createGoogleGenerativeAI({
    apiKey: apiKey!,
  })

  // 5. Truncate document content to 15,000 characters
  const truncatedContent = (document.content || '').slice(0, 15000)

  const systemPrompt = `You are an expert academic tutor and AI productivity assistant.
Your task is to analyze the document and provide a high-yield, structured Markdown study summary.
Format your output strictly using the following three Markdown section headers:

## Executive Overview
A clear, high-level summary of the document's central thesis, purpose, and background.

## Key Concepts
Bullet points highlighting core concepts, technical terms, definitions, and important arguments.

## Actionable Takeaways
Concrete conclusions, key lessons, practical implications, or recommended next steps.`

  const userPrompt = `Document Title: ${document.title} (${document.fileType.toUpperCase()})

Document Content:
${truncatedContent}

Please generate the structured Markdown study summary now.`

  // 6. Automatic retry and fallback loop across candidate models using generateText
  let completeSummary = ''
  let selectedModel = ''
  let lastFailureError: unknown = null

  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const response = await generateText({
          model: google(modelName),
          maxOutputTokens: 1200,
          system: systemPrompt,
          prompt: userPrompt,
        })

        const text = (response.text || '').trim()
        if (!text) {
          throw new Error(`Model ${modelName} returned an empty summary`)
        }

        completeSummary = text
        selectedModel = modelName
        break
      } catch (err) {
        lastFailureError = err
        const isCongested = isRetryableOrCongestionError(err)
        console.warn(
          `[Summary] Model '${modelName}' attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL} failed (congestion=${isCongested}):`,
          err instanceof Error ? err.message : err
        )

        // 1-second backoff on 503/429 congestion before retry
        if (attempt < MAX_ATTEMPTS_PER_MODEL && isCongested) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS))
        }
      }
    }

    if (completeSummary) {
      break
    }
  }

  // 7. If all models are congested / failed, return 503 without deducting credit
  if (!completeSummary) {
    console.error('[Summary] All candidate models failed. No credits deducted.')
    const errorDetails =
      lastFailureError instanceof Error
        ? lastFailureError.message
        : 'All AI models (gemini-3.5-flash-lite, gemini-3.1-flash-lite, gemini-3.8-flash) are temporarily congested or unavailable.'

    return NextResponse.json(
      {
        error:
          'All AI summary models are temporarily congested or unavailable. No credits were deducted. Please try again in a few moments.',
        details: errorDetails,
      },
      { status: 503 }
    )
  }

  // 8. Deduct 1 credit and save the full summary to Document record in an atomic transaction
  const [updatedUser, updatedDoc] = await prisma.$transaction([
    prisma.user.update({
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
    }),
    prisma.document.update({
      where: { id: document.id },
      data: {
        summary: completeSummary,
      },
      select: {
        id: true,
        summary: true,
      },
    }),
  ])

  // 9. Return clean JSON response
  return NextResponse.json(
    {
      success: true,
      summary: updatedDoc.summary,
      credits: updatedUser.credits,
      modelUsed: selectedModel,
    },
    { status: 200 }
  )
}
