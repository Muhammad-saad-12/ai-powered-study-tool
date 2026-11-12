import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'
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

    const parseResult = registerSchema.safeParse(json)
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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        PasswordHash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const token = await signAuthToken({ sub: user.id, email: user.email })

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully',
        user,
      },
      { status: 201 }
    )

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error occurred while registering' },
      { status: 500 }
    )
  }
}
