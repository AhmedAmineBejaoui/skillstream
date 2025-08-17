import { z } from 'zod';

export interface User {
  id: number;
  publicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  age?: number | null;
  passwordHash: string;
  role: 'student' | 'instructor' | 'admin';
  isVerified: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  age: z.number().int().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'instructor', 'admin']).optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
