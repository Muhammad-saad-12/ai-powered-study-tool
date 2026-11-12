import { z } from 'zod'

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
})

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
