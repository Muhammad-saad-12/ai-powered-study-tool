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

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, credits: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Increment credits by 5, capped at a maximum of 20 credits
    const newCredits = Math.min(20, user.credits + 5)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: newCredits },
      select: { credits: true },
    })

    return NextResponse.json(
      {
        success: true,
        credits: updatedUser.credits,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error refilling credits:', error)
    return NextResponse.json(
      { error: 'Internal server error while refilling credits' },
      { status: 500 }
    )
  }
}
