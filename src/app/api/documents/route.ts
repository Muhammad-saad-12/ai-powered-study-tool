import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import { extractTextFromPdf } from '@/lib/pdf'

async function getAuthenticatedUser(request: NextRequest) {
  const cookieStore = await cookies()
  let token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    return null
  }

  const payload = await verifyAuthToken(token)
  if (!payload?.sub) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, credits: true },
  })

  return user
}

// GET /api/documents - Fetch list of user's uploaded documents
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Please log in to view documents' },
      { status: 401 }
    )
  }

  try {
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      include: {
        flashcards: {
          orderBy: { createdAt: 'asc' },
        },
        quizQuestions: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      {
        success: true,
        documents,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching documents' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Upload/parse document, deduct 1 credit, save in transaction
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Please log in to upload documents' },
      { status: 401 }
    )
  }

  // Credit check: require at least 1 credit (403 if 0)
  if (user.credits < 1) {
    return NextResponse.json(
      {
        error: 'Insufficient credits. You need at least 1 credit to parse or upload a document.',
        credits: user.credits,
      },
      { status: 403 }
    )
  }

  const contentType = request.headers.get('content-type') || ''
  let title = ''
  let content = ''
  let fileType = 'text'

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const formTitle = (formData.get('title') as string | null)?.trim()
      const formContent = (formData.get('content') as string | null)?.trim()
      const formFileType = (formData.get('fileType') as string | null)?.trim()

      if (file && file.size > 0) {
        const fileName = file.name
        const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
        const mimeType = file.type.toLowerCase()

        title = formTitle || fileName

        if (fileExt === 'pdf' || mimeType.includes('pdf')) {
          fileType = 'pdf'
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          try {
            content = await extractTextFromPdf(buffer)
          } catch (pdfErr) {
            console.error('PDF parsing error:', pdfErr)
            return NextResponse.json(
              { error: 'Failed to parse PDF file. The file may be corrupt or encrypted.' },
              { status: 400 }
            )
          }
        } else if (fileExt === 'txt' || mimeType.includes('text')) {
          fileType = 'txt'
          content = await file.text()
        } else {
          // Fallback: try reading as text
          fileType = fileExt || 'txt'
          content = await file.text()
        }
      } else if (formContent) {
        // Pasted text submitted via FormData
        title = formTitle || `Pasted Document (${new Date().toLocaleTimeString()})`
        content = formContent
        fileType = formFileType || 'text'
      } else {
        return NextResponse.json(
          { error: 'Please provide either a file (PDF/TXT) or pasted text content' },
          { status: 400 }
        )
      }
    } else {
      // JSON payload (pasted text / title)
      const json = await request.json().catch(() => null)
      if (!json) {
        return NextResponse.json(
          { error: 'Invalid JSON request payload' },
          { status: 400 }
        )
      }

      title = (json.title as string | undefined)?.trim() || `Pasted Document (${new Date().toLocaleTimeString()})`
      content = (json.content as string | undefined)?.trim() || ''
      fileType = (json.fileType as string | undefined)?.trim() || 'text'
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document content is empty. Please provide readable text or a valid document.' },
        { status: 400 }
      )
    }

    if (!title || title.trim().length === 0) {
      title = 'Untitled Document'
    }

    // Execute credit deduction and document creation in a Prisma transaction
    const [updatedUser, document] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: 1,
          },
        },
        select: {
          id: true,
          email: true,
          credits: true,
        },
      }),
      prisma.document.create({
        data: {
          title,
          content,
          fileType,
          userId: user.id,
        },
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        message: 'Document parsed and saved successfully. 1 credit deducted.',
        document,
        remainingCredits: updatedUser.credits,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving document:', error)
    return NextResponse.json(
      { error: 'Internal server error while processing document' },
      { status: 500 }
    )
  }
}
