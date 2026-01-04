# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ShipIt** is a production-ready SaaS boilerplate featuring authentication, billing, multi-tenancy, and admin capabilities. Built as a Turborepo monorepo with React 19 frontend and NestJS 11 backend.

**Tech Stack:**

- Frontend: React 19, TypeScript, Tailwind CSS 4, shadcn/ui v2, TanStack Query, React Hook Form + Zod
- Backend: NestJS 11, TypeScript, Prisma 6, Better Auth, BullMQ, Swagger
- Infrastructure: Supabase (PostgreSQL), Upstash (Redis), Azure Blob Storage, Stripe, Resend, Sentry
- Monorepo: Turborepo + pnpm

## Development Commands

Since the project uses Turborepo monorepo, all commands are managed through pnpm scripts and Turborepo:

### Setup

```bash
pnpm install                    # Install dependencies
pnpm prisma:generate           # Generate Prisma client
pnpm prisma:migrate:dev        # Run database migrations
```

### Development

```bash
pnpm dev:front                   # Run frontend dev server (port 3000)
pnpm dev:back                   # Run backend dev server (port 3001)
pnpm dev                       # Run both web and api concurrently
```

### Database

```bash
pnpm prisma:studio             # Open Prisma Studio
pnpm prisma:migrate:dev        # Create and apply migration
pnpm prisma:seed               # Seed database
```

### Testing

```bash
# Frontend tests
pnpm test:front                  # Run all web tests
pnpm test:front:watch            # Run tests in watch mode
pnpm e2e:front                   # Run Playwright E2E tests

# Backend tests
pnpm test:back                  # Run all API tests
pnpm test:back:watch            # Run tests in watch mode
pnpm test:back:e2e              # Run Supertest E2E tests
```

### Build & Deployment

```bash
pnpm build:front                 # Build frontend for production
pnpm build:back                 # Build backend for production
pnpm build                     # Build both apps
```

### Code Quality

```bash
pnpm lint:front                  # Lint frontend
pnpm lint:back                  # Lint backend
pnpm format                    # Format code with Prettier
pnpm typecheck                 # Run TypeScript type checking
```

## Architecture

### Monorepo Structure

```
apps/
  front/          # React frontend with file-based routing
  back/          # NestJS backend with modular architecture
libs/
  shared-types/ # Shared TypeScript types between frontend/backend
  validators/   # Shared Zod validation schemas
  constants/    # Shared constants (roles, plans, error codes)
prisma/         # Database schema and migrations
```

### Backend (NestJS) Architecture

The API follows a **feature-based modular architecture**:

**Core Modules:**

- `auth/` - Authentication (Better Auth integration, signup, login, OAuth, email verification, password reset)
- `users/` - User management (profile CRUD, avatar uploads, preferences)
- `organizations/` - Multi-tenancy (org CRUD, members, invitations, RBAC)
- `billing/` - Stripe integration (checkout, webhooks, customer portal)
- `admin/` - Admin backoffice (user/org management, logs)
- `health/` - Health checks and readiness probes

**Common Layer:**

- `decorators/` - Custom decorators (@CurrentUser, @Roles, etc.)
- `guards/` - Auth guards (SessionGuard, RolesGuard, TenantGuard)
- `interceptors/` - Response transformers, logging interceptor
- `pipes/` - Validation pipes (Zod integration)
- `middleware/` - TenantMiddleware (org context), LoggerMiddleware
- `filters/` - Exception filters for consistent error responses

**Infrastructure:**

- `queue/` - BullMQ job processors (email sending, Stripe customer creation)
- `mail/` - Email templates and sending logic (Resend integration)
- `storage/` - Azure Blob Storage integration for file uploads
- `logger/` - Structured JSON logging with correlationId
- `database/` - Prisma service and utilities
- `config/` - Configuration management (environment variables)

### Frontend (React) Architecture

**Routing:** File-based routing with route groups in `app/routes/`:

- `(auth)/` - Login, signup, password reset, email verification
- `(marketing)/` - Landing page, pricing
- `(dashboard)/` - Protected dashboard, settings
- `(admin)/` - Admin backoffice pages

**Components:** Organized by purpose in `components/`:

- `ui/` - shadcn/ui base components (button, input, dialog, etc.)
- `common/` - Shared presentational components
- `forms/` - Form components with React Hook Form + Zod
- `layouts/` - Layout components (DashboardLayout, AuthLayout)
- `features/` - Feature-specific components

**Data Fetching:** TanStack Query for server state management

- Query keys defined in `services/` alongside API calls
- Optimistic updates for better UX
- Automatic retries and caching

**State Management:**

- Server state: TanStack Query
- Auth state: Context + TanStack Query
- Form state: React Hook Form
- UI state: Component state + URL params

## Multi-Tenancy Implementation

**Critical: All business queries MUST include organizationId filtering.**

The multi-tenancy system uses a shared database model with organization-based isolation:

1. **Request Flow:**
   - SessionMiddleware validates session cookie → attaches `req.user`
   - TenantMiddleware validates `X-Organization-Id` header → attaches `req.currentOrganization` and `req.currentMembership`
   - Controllers use `@CurrentOrganization()` decorator to access org context

2. **Database Queries:**

   ```typescript
   // ALWAYS include organizationId in queries
   await prisma.resource.findMany({
     where: { organizationId: currentOrganization.id },
   });
   ```

3. **Organization Context:**
   - Frontend sends `X-Organization-Id` header with all requests
   - Organization switcher in UI allows switching between user's orgs
   - Membership determines role-based permissions within org

## Authentication & Authorization

**Authentication:** Session-based with HttpOnly cookies

- Sessions expire after 7 days
- Better Auth library handles session management
- OAuth providers: Google, Apple
- Email verification required before full access

**Authorization Layers:**

1. **Session Guard** - Validates user is authenticated
2. **Roles Guard** - Checks user role within organization (admin, member, viewer)
3. **Tenant Guard** - Validates X-Organization-Id and user membership
4. **Super Admin** - Special `isSuperAdmin` flag for platform-wide admin access

**Decorators:**

```typescript
@UseGuards(SessionGuard, RolesGuard)
@Roles('admin', 'member')
async updateResource(@CurrentUser() user, @CurrentOrganization() org) {}
```

## Critical Flows

### Signup Flow

1. Create User (email, password, firstName, lastName)
2. Create Organization with name "Personal"
3. Create OrganizationMember (role: admin)
4. Queue confirmation email via BullMQ
5. Return user (requires email verification to fully activate)

### Tenant Isolation

- All queries for business resources MUST filter by `organizationId`
- TenantMiddleware extracts org context from `X-Organization-Id` header
- Guards verify user has membership in requested organization

### Stripe Customer Creation

- Created asynchronously via BullMQ job after organization creation
- Webhook handlers process subscription events (active, canceled, past_due)
- Customer ID stored in Organization.stripeCustomerId

### Avatar Upload

1. Validate file type (jpg/png/webp) and size (<5MB)
2. Upload to Azure Blob Storage
3. Store URL in User.avatarUrl
4. Return URL to frontend

### Email Sending

- All emails queued via BullMQ for async processing
- Templates: confirmation, reset-password, welcome, invitation
- Resend API for delivery
- React Email for templates

## Database Schema (Prisma)

**Key Models:**

- `User` - User accounts with auth, profile, and preferences
- `Session` - Better Auth session tracking
- `Account` - OAuth provider accounts (Google, Apple)
- `VerificationToken` - Email verification and password reset tokens
- `Organization` - Tenant/workspace with billing info
- `OrganizationMember` - User-org relationship with role
- `Invitation` - Pending team invitations
- `Subscription` - Stripe subscription details
- `AppLog` - Structured application logs

**Enums:**

- `Language`: fr, en
- `Theme`: light, dark, system
- `Role`: admin, member, viewer
- `SubscriptionTier`: free, premium
- `SubscriptionStatus`: active, past_due, canceled, trialing, incomplete
- `InvitationStatus`: pending, accepted, expired, canceled

## API Endpoints

All endpoints return JSON. Protected endpoints require session cookie and appropriate headers.

**Auth:**

- `POST /auth/signup` - Create account
- `POST /auth/login` - Login (returns session cookie)
- `POST /auth/logout` - Logout
- `GET /auth/session` - Get current session
- `GET /auth/oauth/:provider` - OAuth redirect
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

**Users:**

- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `POST /users/me/avatar` - Upload avatar (multipart/form-data)

**Organizations (require X-Organization-Id):**

- `GET /organizations` - List user's organizations
- `POST /organizations` - Create new organization
- `GET /organizations/:id/members` - List members
- `POST /organizations/:id/invitations` - Invite member
- `PATCH /organizations/:id/members/:uid` - Update member role
- `DELETE /organizations/:id/members/:uid` - Remove member
- `POST /invitations/:token/accept` - Accept invitation

**Billing (require admin role + X-Organization-Id):**

- `GET /billing` - Get subscription info
- `POST /billing/checkout` - Create Stripe checkout session
- `POST /billing/portal` - Get customer portal URL
- `POST /billing/webhooks` - Stripe webhook handler

**Admin (require isSuperAdmin=true):**

- `GET /admin/users` - List all users (pagination, search)
- `GET /admin/organizations` - List all organizations (filter by tier)
- `GET /admin/logs` - Query application logs

**Health:**

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe (checks database + Redis)

## Testing Standards

**Frontend Tests:**

- Use Jest + React Testing Library
- Place component tests co-located with components or in `__tests__/`
- Mock API calls using MSW (Mock Service Worker)
- Test user interactions and accessibility
- Follow test hook requirements in `.claude/hooks/test.md`

**Backend Tests:**

- Use Jest for unit tests
- Use Supertest for API endpoint tests
- Mock Prisma client for unit tests
- Use test database for integration tests
- Test validation, authorization, and error cases

**E2E Tests:**

- Use Playwright for critical user flows
- Test authentication, organization switching, billing
- Run against local dev environment

## Internationalization (i18n)

**Supported Languages:** French (default), English

**Implementation:**

- Frontend: i18next with translation files in `src/i18n/locales/`
- Backend: User.language preference stored and honored in emails
- Language switcher in user settings
- Format: Namespace-based translation keys

## Security Best Practices

1. **Validation:** All inputs validated with Zod schemas (shared in `libs/validators/`)
2. **Rate Limiting:** Redis-based, stricter limits on auth endpoints
3. **CORS:** Whitelist only FRONTEND_URL
4. **Headers:** Helmet.js for security headers (CSP, X-Frame-Options, etc.)
5. **Passwords:** Argon2 hashing (handled by Better Auth)
6. **Webhooks:** Stripe signature verification required
7. **Sessions:** HttpOnly, Secure cookies with 7-day expiration

## Observability

**Error Tracking:** Sentry integration on both frontend and backend

- Capture exceptions automatically
- Include user context and organization info
- Track performance metrics

**Logging:** Structured JSON logs with correlationId

- All logs stored in AppLog table
- Query via admin panel
- Include request context (userId, organizationId, endpoint)

**Monitoring:**

- `/health` - Simple status check
- `/health/ready` - Database and Redis connectivity check
- Use for container orchestration readiness probes

## Coding Conventions

- **Files:** kebab-case (e.g., `user.service.ts`)
- **Classes:** PascalCase (e.g., `UserService`)
- **Variables/Functions:** camelCase
- **Constants:** SCREAMING_SNAKE_CASE
- **Components:** PascalCase with co-located hooks
- **Tests:** `*.spec.ts` co-located with source files

## Key Environment Variables

Required for development:

- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `REDIS_URL` - Redis connection string (Upstash)
- `BETTER_AUTH_SECRET` - Min 32 characters for session encryption
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` - Stripe integration
- `RESEND_API_KEY` - Email sending
- `AZURE_STORAGE_CONNECTION_STRING` - File storage
- `SENTRY_DSN` - Error tracking
- OAuth credentials for Google/Apple (optional for development)

See docs/BRD.md for complete environment variable list.
