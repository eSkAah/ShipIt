// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Record<string, unknown>;
  avatarUrl?: string;
  language: 'fr' | 'en';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  emailVerified: boolean;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session types
export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionTier: 'free' | 'premium';
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  user?: User;
  organization?: Organization;
}

// Invitation types
export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'canceled';
  invitedById: string;
  expiresAt: Date;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Record<string, unknown>;
  language?: 'fr' | 'en';
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Billing types
export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface CheckoutSessionData {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface PortalSessionResult {
  url: string;
}
