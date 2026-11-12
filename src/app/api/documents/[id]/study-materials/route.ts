import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
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

// Zod Schema for Structured Study Materials (6 Flashcards + 5 Multiple-Choice Questions)
const studyMaterialsSchema = z.object({
  flashcards: z
    .array(
      z.object({
        front: z
          .string()
          .describe('Front of card: Core concept, term, formula, or study prompt question'),
        back: z
          .string()
          .describe('Back of card: Clear, high-yield explanation, key takeaway, or definition'),
      })
    )
    .min(4)
    .max(10)
    .describe('6 high-yield study flashcards covering key concepts from the document'),
  quizQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe('Multiple-choice question testing comprehension of key ideas in the text'),
        options: z
          .array(z.string())
          .length(4)
          .describe('Array of exactly 4 distinct answer choices'),
        correctIndex: z
          .number()
          .int()
          .min(0)
          .max(3)
          .describe('0-based index of the correct answer (0, 1, 2, or 3)'),
        explanation: z
          .string()
          .describe('Concise explanation explaining why the correct answer is right and others are incorrect'),
      })
    )
    .min(3)
    .max(8)
    .describe('5 multiple-choice questions testing comprehension'),
})

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
      { error: 'Unauthorized: Please log in to generate study materials' },
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
      { error: 'Document not found or you do not have permission to access it' },
      { status: 404 }
    )
  }

  // 3. Check credits >= 1 (403 if 0)
  if (user.credits < 1) {
    return NextResponse.json(
      {
        error: 'Insufficient credits. You need at least 1 credit to generate study materials.',
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

  const systemPrompt = `You are a world-class academic tutor and exam preparation specialist.
Your goal is to parse the document and extract high-yield active-recall study materials:
1. Exactly 6 flashcards covering pivotal concepts, definitions, equations, or facts.
2. Exactly 5 multiple-choice questions with 4 distinct options each, identifying the correct option index (0 to 3) and providing a concise explanation.
Follow the JSON schema strictly.`

  const userPrompt = `Document Title: ${document.title} (${document.fileType.toUpperCase()})

Document Content:
${truncatedContent}

Generate the 6 flashcards and 5 multiple-choice quiz questions based on the text above.`

  // 6. Automatic retry & fallback loop across candidate models using generateObject
  let generatedData: z.infer<typeof studyMaterialsSchema> | null = null
  let selectedModel = ''
  let lastFailureError: unknown = null

  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const response = await generateObject({
          model: google(modelName),
          schema: studyMaterialsSchema,
          system: systemPrompt,
          prompt: userPrompt,
        })

        if (!response.object || !response.object.flashcards || !response.object.quizQuestions) {
          throw new Error(`Model ${modelName} returned incomplete study materials`)
        }

        generatedData = response.object
        selectedModel = modelName
        break
      } catch (err) {
        lastFailureError = err
        const isCongested = isRetryableOrCongestionError(err)
        console.warn(
          `[Study Materials] Model '${modelName}' attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL} failed (congestion=${isCongested}):`,
          err instanceof Error ? err.message : err
        )

        if (attempt < MAX_ATTEMPTS_PER_MODEL && isCongested) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS))
        }
      }
    }

    if (generatedData) {
      break
    }
  }

  // 7. If all models failed or congested, return 503 without deducting credit
  if (!generatedData) {
    console.error('[Study Materials] All candidate models failed. No credits deducted.')
    const errorDetails =
      lastFailureError instanceof Error
        ? lastFailureError.message
        : 'All AI models (gemini-3.5-flash-lite, gemini-3.1-flash-lite, gemini-3.8-flash) are temporarily congested.'

    return NextResponse.json(
      {
        error:
          'All AI study generation models are temporarily congested or unavailable. No credits were deducted. Please try again in a moment.',
        details: errorDetails,
      },
      { status: 503 }
    )
  }

  // 8. Deduct 1 credit and replace flashcards and quiz questions in an atomic transaction
  try {
    const [updatedUser, flashcards, quizQuestions] = await prisma.$transaction(
      async (tx) => {
        // Deduct 1 credit
        const u = await tx.user.update({
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

        // Delete existing flashcards and quiz questions for this document
        await tx.flashcard.deleteMany({
          where: { documentId: document.id },
        })
        await tx.quizQuestion.deleteMany({
          where: { documentId: document.id },
        })

        // Insert new flashcards
        await tx.flashcard.createMany({
          data: generatedData.flashcards.map((f) => ({
            front: f.front.trim(),
            back: f.back.trim(),
            documentId: document.id,
          })),
        })

        // Insert new quiz questions
        await tx.quizQuestion.createMany({
          data: generatedData.quizQuestions.map((q) => ({
            question: q.question.trim(),
            options: q.options.map((opt) => opt.trim()),
            correctIndex: q.correctIndex,
            explanation: q.explanation.trim(),
            documentId: document.id,
          })),
        })

        // Fetch freshly created items
        const cards = await tx.flashcard.findMany({
          where: { documentId: document.id },
          orderBy: { createdAt: 'asc' },
        })

        const quizzes = await tx.quizQuestion.findMany({
          where: { documentId: document.id },
          orderBy: { createdAt: 'asc' },
        })

        return [u, cards, quizzes] as const
      }
    )

    return NextResponse.json(
      {
        success: true,
        flashcards,
        quizQuestions,
        credits: updatedUser.credits,
        modelUsed: selectedModel,
      },
      { status: 200 }
    )
  } catch (dbErr) {
    console.error('Database transaction error saving study materials:', dbErr)
    return NextResponse.json(
      { error: 'Failed to save generated study materials to database' },
      { status: 500 }
    )
  }
}
