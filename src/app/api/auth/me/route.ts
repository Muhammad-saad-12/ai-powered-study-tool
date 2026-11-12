import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  let token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    return NextResponse.json(
      { user: null, error: 'Unauthorized: No authentication token found' },
      { status: 401 }
    )
  }

  try {
    const payload = await verifyAuthToken(token)
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { user: null, error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { user: null, error: 'Unauthorized: User does not exist' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json(
      { user: null, error: 'Internal server error while fetching current user' },
      { status: 500 }
    )
  }
}
