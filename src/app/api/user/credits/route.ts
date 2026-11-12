import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
      { error: 'Unauthorized: Please log in' },
      { status: 401 }
    )
  }

  try {

    const payload = await verifyAuthToken(token)
    if (!payload?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const action = body.action || 'use' // 'use' (deduct 1) or 'reset' (reset to 10)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let updatedCredits = user.credits

    if (action === 'use') {
      if (user.credits <= 0) {
        return NextResponse.json(
          { error: 'Insufficient credits! Please reset or recharge.' },
          { status: 400 }
        )
      }
      updatedCredits = user.credits - 1
    } else if (action === 'reset') {
      updatedCredits = 10
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.sub },
      data: { credits: updatedCredits },
      select: {
        id: true,
        email: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message:
        action === 'use'
          ? `Used 1 credit for AI task. ${updatedCredits} credits remaining.`
          : 'Credits reset to 10.',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating credits:', error)
    return NextResponse.json(
      { error: 'Internal server error while updating credits' },
      { status: 500 }
    )
  }
}
