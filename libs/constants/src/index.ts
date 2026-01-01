// Enums
export enum Language {
  FR = 'fr',
  EN = 'en',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Role {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
}

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Role permissions
export const ROLE_PERMISSIONS = {
  [Role.ADMIN]: ['read', 'write', 'delete', 'invite', 'manage_members', 'manage_billing'],
  [Role.MEMBER]: ['read', 'write'],
  [Role.VIEWER]: ['read'],
} as const;

// Subscription plan details
export const SUBSCRIPTION_PLANS = {
  [SubscriptionTier.FREE]: {
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: ['1 user', 'Basic features', 'Community support'],
    limits: {
      maxMembers: 1,
    },
  },
  [SubscriptionTier.PREMIUM]: {
    name: 'Premium',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited users',
      'All features',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
    limits: {
      maxMembers: -1, // unlimited
    },
  },
} as const;

// Error codes
export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Organization errors
  ORGANIZATION_NOT_FOUND: 'ORGANIZATION_NOT_FOUND',
  NOT_ORGANIZATION_MEMBER: 'NOT_ORGANIZATION_MEMBER',
  DUPLICATE_MEMBER: 'DUPLICATE_MEMBER',
  CANNOT_REMOVE_LAST_ADMIN: 'CANNOT_REMOVE_LAST_ADMIN',

  // Invitation errors
  INVITATION_NOT_FOUND: 'INVITATION_NOT_FOUND',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  INVITATION_ALREADY_ACCEPTED: 'INVITATION_ALREADY_ACCEPTED',

  // Billing errors
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  SUBSCRIPTION_LIMIT_REACHED: 'SUBSCRIPTION_LIMIT_REACHED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // Generic errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// Rate limiting
export const RATE_LIMITS = {
  AUTH_ENDPOINTS: {
    points: 5, // Number of requests
    duration: 60, // Per 60 seconds
  },
  API_ENDPOINTS: {
    points: 100,
    duration: 60,
  },
} as const;

// Session configuration
export const SESSION_CONFIG = {
  EXPIRY_DAYS: 7,
  COOKIE_NAME: 'shipit_session',
} as const;

// Email verification
export const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AVATAR_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
