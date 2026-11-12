import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
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
    select: { id: true, email: true },
  })
}

const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Document title cannot be empty')
    .max(200, 'Document title cannot exceed 200 characters'),
})

// PATCH /api/documents/[id] - Rename document title
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Please log in to update documents' },
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

  // Verify ownership
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  })

  if (!document) {
    return NextResponse.json(
      { error: 'Document not found or you do not have permission to modify it' },
      { status: 404 }
    )
  }

  const json = await request.json().catch(() => null)
  if (!json) {
    return NextResponse.json(
      { error: 'Invalid JSON request payload' },
      { status: 400 }
    )
  }

  const parsed = updateDocumentSchema.safeParse(json)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Invalid title'
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  try {
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: parsed.data.title,
      },
      include: {
        flashcards: { orderBy: { createdAt: 'asc' } },
        quizQuestions: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Document title updated successfully',
        document: updatedDocument,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error updating document:', err)
    return NextResponse.json(
      { error: 'Internal server error while updating document' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete document (cascade deletes flashcards and quiz questions)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Please log in to delete documents' },
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

  // Verify ownership
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  })

  if (!document) {
    return NextResponse.json(
      { error: 'Document not found or you do not have permission to delete it' },
      { status: 404 }
    )
  }

  try {
    await prisma.document.delete({
      where: { id: documentId },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Document and its study materials deleted successfully',
        id: documentId,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error deleting document:', err)
    return NextResponse.json(
      { error: 'Internal server error while deleting document' },
      { status: 500 }
    )
  }
}
