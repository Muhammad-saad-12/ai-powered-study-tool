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

// Fallback model list in order of precedence
const CANDIDATE_MODELS = [
  { name: 'gemini-3.5-flash-lite', maxRetries: 0 },
  { name: 'gemini-3.8-flash', maxRetries: 0 },
  { name: 'gemini-3.6-flash', maxRetries: 0 },
] as const

function isRetryableOrFallbackError(err: unknown): boolean {
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

  // 6. Truncate document content safely to 15,000 characters
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

  // 7. Iterate through models with automatic fallback on 503, 429, or empty stream
  let selectedModel = ''
  let initialChunk = ''
  let activeIterator: AsyncIterator<string> | null = null
  let lastFailureError: unknown = null

  for (const { name: modelName, maxRetries } of CANDIDATE_MODELS) {
    try {
      const result = streamText({
        model: google(modelName),
        maxRetries,
        system: systemPrompt,
        prompt: userPrompt,
      })

      const iterator = result.textStream[Symbol.asyncIterator]()
      const firstResult = await iterator.next()

      // Detect empty stream: completed with no text
      if (firstResult.done && (!firstResult.value || !firstResult.value.trim())) {
        console.warn(
          `[Summary Fallback] Model '${modelName}' produced an empty stream. Falling back to next model...`
        )
        continue
      }

      // Model successfully started and produced the initial chunk
      selectedModel = modelName
      initialChunk = firstResult.value || ''
      activeIterator = iterator
      break
    } catch (err) {
      lastFailureError = err
      const isExpectedFallback = isRetryableOrFallbackError(err)
      console.warn(
        `[Summary Fallback] Model '${modelName}' failed (retryable/503/429=${isExpectedFallback}):`,
        err instanceof Error ? err.message : err
      )

      // Fall back if 503, 429, or retryable
      if (isExpectedFallback || CANDIDATE_MODELS[CANDIDATE_MODELS.length - 1].name !== modelName) {
        continue
      }
    }
  }

  // If all candidate models failed or produced empty streams
  if (!activeIterator) {
    console.error('[Summary Fallback] All candidate models failed. Refunding credit.')
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { increment: 1 } },
    })

    const errorDetails =
      lastFailureError instanceof Error
        ? lastFailureError.message
        : 'All AI models (gemini-3.5-flash-lite, gemini-3.8-flash, gemini-3.6-flash) failed or returned empty streams.'

    return NextResponse.json(
      {
        error: `Summary generation failed after fallback attempts: ${errorDetails}`,
      },
      { status: 503 }
    )
  }

  // 8. Construct response stream and save full summary to Document record on completion
  const encoder = new TextEncoder()
  let accumulatedSummary = initialChunk

  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        if (initialChunk) {
          controller.enqueue(encoder.encode(initialChunk))
        }

        while (true) {
          const { done, value } = await activeIterator!.next()
          if (done) break
          if (value) {
            accumulatedSummary += value
            controller.enqueue(encoder.encode(value))
          }
        }

        controller.close()

        // Persist full summary to Document record in database
        if (accumulatedSummary.trim()) {
          await prisma.document.update({
            where: { id: document.id },
            data: { summary: accumulatedSummary },
          })
        }
      } catch (streamErr) {
        console.error('Error during active text stream transmission:', streamErr)
        controller.error(streamErr)
      }
    },
  })

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Remaining-Credits': String(updatedUser.credits),
      'X-Model-Used': selectedModel,
    },
  })
}
