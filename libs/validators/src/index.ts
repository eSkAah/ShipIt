import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// User validators
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  address: z.record(z.unknown()).optional(),
  language: z.enum(['fr', 'en']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notificationsEnabled: z.boolean().optional(),
});

// Organization validators
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

// Billing validators
export const createCheckoutSessionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
});

// Admin validators
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const searchQuerySchema = z.object({
  search: z.string().optional(),
});

export const logsQuerySchema = paginationSchema.extend({
  level: z.enum(['info', 'warn', 'error']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// Support validators
export const createSupportRequestSchema = z.object({
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be at most 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
});

// Export types inferred from schemas
export type LoginDto = z.infer<typeof loginSchema>;
export type SignupDto = z.infer<typeof signupSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleSchema>;
export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;
export type CreateCheckoutSessionDto = z.infer<typeof createCheckoutSessionSchema>;
export type PaginationDto = z.infer<typeof paginationSchema>;
export type SearchQueryDto = z.infer<typeof searchQuerySchema>;
export type LogsQueryDto = z.infer<typeof logsQuerySchema>;
export type CreateSupportRequestDto = z.infer<typeof createSupportRequestSchema>;
