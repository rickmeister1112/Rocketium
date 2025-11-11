import { z } from 'zod';

export const createSessionSchema = z.object({
  name: z.string().trim().min(1),
  userId: z.string().min(1).optional(),
});

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().trim().min(1).max(64).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(64),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;


