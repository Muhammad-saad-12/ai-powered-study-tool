import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    )

    // Delete cookie by setting maxAge to 0 and empty value
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error occurred while logging out' },
      { status: 500 }
    )
  }
}
