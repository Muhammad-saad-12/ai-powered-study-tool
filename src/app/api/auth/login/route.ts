import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations/auth'
import { signAuthToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null)
    if (!json) {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      )
    }

    const parseResult = loginSchema.safeParse(json)
    if (!parseResult.success) {
      const issues = parseResult.error.flatten()
      const firstErrorMessage =
        issues.fieldErrors.email?.[0] ||
        issues.fieldErrors.password?.[0] ||
        'Validation failed'
      return NextResponse.json(
        { error: firstErrorMessage, details: issues },
        { status: 400 }
      )
    }

    const { email, password } = parseResult.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = await signAuthToken({ sub: user.id, email: user.email })

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully',
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    )

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error occurred while logging in' },
      { status: 500 }
    )
  }
}
