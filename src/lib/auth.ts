import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const AUTH_COOKIE_NAME = 'auth_token'
const JWT_EXPIRES_IN = '7d'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    // In production, enforce secret configuration
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is not defined')
    }
    return new TextEncoder().encode('fallback-development-secret-key-32-chars-minimum-safe')
  }
  return new TextEncoder().encode(secret)
}

export interface TokenPayload {
  sub: string
  email: string
  [key: string]: unknown
}

export async function signAuthToken(payload: { sub: string; email: string }): Promise<string> {
  const secretKey = getJwtSecretKey()
  return new SignJWT({ sub: payload.sub, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey)
}

export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getJwtSecretKey()
    const { payload } = await jwtVerify(token, secretKey)
    return payload as TokenPayload
  } catch {
    return null
  }
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: COOKIE_MAX_AGE,
}

export async function getCurrentUserFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return null
  }
  return verifyAuthToken(token)
}
