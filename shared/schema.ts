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

// Content Management
export const blogPostSchema = z.object({
  title: z.string(),
  content: z.string()
});

export const testimonialSchema = z.object({
  author: z.string(),
  message: z.string(),
  rating: z.number().min(1).max(5)
});

// Assessment & Certification
export const quizAnswerSchema = z.object({
  answers: z.record(z.string(), z.number())
});

// Newsletter
export const newsletterSubscribeSchema = z.object({
  email: z.string().email(),
  preferences: z.object({
    promotions: z.boolean().default(true),
    updates: z.boolean().default(true)
  }).default({ promotions: true, updates: true })
});

export const newsletterEmailSchema = z.object({
  email: z.string().email()
});

export const newsletterPreferenceSchema = z.object({
  email: z.string().email(),
  preferences: z.object({
    promotions: z.boolean().optional(),
    updates: z.boolean().optional()
  })
});

export const newsletterCampaignSchema = z.object({
  subject: z.string(),
  content: z.string(),
  type: z.enum(['promotions', 'updates'])
});

export type BlogPost = z.infer<typeof blogPostSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type QuizAnswers = z.infer<typeof quizAnswerSchema>;
export type NewsletterSubscribe = z.infer<typeof newsletterSubscribeSchema>;
export type NewsletterEmail = z.infer<typeof newsletterEmailSchema>;
export type NewsletterPreference = z.infer<typeof newsletterPreferenceSchema>;
export type NewsletterCampaign = z.infer<typeof newsletterCampaignSchema>;
