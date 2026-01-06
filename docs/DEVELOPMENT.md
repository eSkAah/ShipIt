# ShipIt - Development Roadmap

This document tracks the development progress of the ShipIt SaaS boilerplate across all epics.

**Total Estimated Time:** 30-40 days

---

## Epic 1: Project Setup (3-4 days) ✅

**Goal:** Bootstrap Turborepo monorepo with all infrastructure dependencies

- [x] Initialize Turborepo workspace with pnpm
  - [x] Create turbo.json with appropriate build/test configurations
  - [x] Configure package.json workspaces
  - [x] Set up pnpm workspace structure
- [x] Create React application (apps/front/)
  - [x] Generate React app with Vite
  - [x] Configure Tailwind CSS 4
  - [x] Set up file-based routing structure
  - [x] Install and configure shadcn/ui v2
- [x] Create NestJS application (apps/back/)
  - [x] Generate NestJS app
  - [x] Set up modular folder structure
  - [x] Configure Swagger/OpenAPI documentation
- [x] Create shared libraries
  - [x] Generate libs/shared-types
  - [x] Generate libs/validators (Zod schemas)
  - [x] Generate libs/constants (enums, roles, plans)
- [x] Set up Prisma
  - [x] Initialize Prisma in /prisma directory
  - [x] Implement complete schema from BRD (User, Organization, Session, etc.)
  - [x] Create initial migration
  - [x] Configure Prisma client generation script
  - [x] Add seed script structure
- [x] Configure infrastructure
  - [x] Create Docker Compose (PostgreSQL, Redis)
  - [x] Set up Redis connection utilities (Upstash)
  - [x] Configure BullMQ basics
- [x] Environment configuration
  - [x] Create .env.example files for both apps
  - [x] Document all required environment variables
  - [x] Set up config module in NestJS
- [x] Code quality setup
  - [x] Configure TypeScript (strict mode) for all projects
  - [x] Set up ESLint with shared configs
  - [x] Configure Prettier with shared formatting rules
  - [x] Set up Husky pre-commit hooks
- [x] Basic health checks
  - [x] Implement GET /health endpoint
  - [x] Implement GET /health/ready with database check
  - [x] Implement GET /health/ready with Redis check
- [x] Initial documentation
  - [x] Update package.json scripts
  - [x] Verify CLAUDE.md is accurate
  - [x] Create basic README.md

---

## Epic 2: Authentication (4-5 days) - BACKEND COMPLETE ✅

**Goal:** Implement complete authentication system with Better Auth

- [x] Install and configure Better Auth
  - [x] Install dependencies (better-auth, argon2, resend, react-email, helmet)
  - [x] Create auth service module
  - [x] Configure session management (7-day expiry)
  - [x] Set up HttpOnly cookie configuration
- [x] Email/Password Authentication
  - [x] Implement POST /auth/signup endpoint
  - [x] Implement POST /auth/login endpoint
  - [x] Implement POST /auth/logout endpoint
  - [x] Implement GET /auth/session endpoint
  - [x] Hash passwords with Argon2
- [x] Email Verification
  - [x] Create VerificationToken model logic
  - [x] Implement POST /auth/verify-email endpoint
  - [x] Generate verification tokens
  - [x] Create email verification template
- [x] Password Reset
  - [x] Implement POST /auth/forgot-password endpoint
  - [x] Implement POST /auth/reset-password endpoint
  - [x] Generate reset tokens with expiration
  - [x] Create password reset email template
- [x] OAuth Integration (Backend Ready)
  - [x] Configure OAuth environment variables
  - [x] OAuth endpoints prepared (implementation ready for frontend)
  - [ ] Implement GET /auth/oauth/:provider redirect (deferred to frontend PR)
  - [ ] Handle OAuth callbacks (deferred to frontend PR)
  - [ ] Link OAuth accounts to existing users (deferred to frontend PR)
- [x] Session Management
  - [x] Create SessionGuard for protected routes
  - [x] Implement session validation middleware
  - [x] Create @CurrentUser() decorator
  - [x] Create @Public() decorator
  - [x] Track sessions in database
- [x] Infrastructure
  - [x] Create Queue module with BullMQ
  - [x] Create Mail service with email templates
  - [x] Create Rate limiting guard
  - [x] Create Exception filter
  - [x] Update main.ts with security middleware
  - [x] Auto-create "Personal" organization on signup
- [x] Frontend Auth
  - [x] Create login page UI
  - [x] Create signup page UI
  - [x] Create forgot password page UI
  - [x] Create reset password page UI
  - [x] Create email verification page UI
  - [x] Implement auth context provider
  - [x] Create protected route wrapper
  - [x] Add OAuth buttons (Google, Apple)
- [ ] Testing (Next PR)
  - [ ] Unit tests for auth service
  - [ ] E2E tests for signup flow
  - [ ] E2E tests for login flow
  - [ ] E2E tests for password reset flow
  - [ ] E2E tests for email verification

---

## Epic 3: Multi-Tenancy (3-4 days) ✅

**Goal:** Implement organization system with RBAC

- [x] Organization CRUD
  - [x] Implement POST /organizations endpoint
  - [x] Implement GET /organizations endpoint
  - [x] Auto-create "Personal" org on signup
  - [x] Create organization context service
- [x] Organization Members
  - [x] Implement GET /organizations/:id/members endpoint
  - [x] Implement PATCH /organizations/:id/members/:uid (role update)
  - [x] Implement DELETE /organizations/:id/members/:uid (remove member)
  - [x] Validate membership before operations
- [x] Invitations System
  - [x] Implement POST /organizations/:id/invitations endpoint
  - [x] Implement POST /invitations/:token/accept endpoint
  - [x] Generate invitation tokens
  - [x] Handle invitation expiration
  - [x] Create invitation email template
  - [x] Prevent duplicate invitations
- [x] RBAC Implementation
  - [x] Create RolesGuard
  - [x] Create @Roles() decorator
  - [x] Implement role hierarchy (admin > member > viewer)
  - [x] Create TenantGuard for org context
  - [x] Implement @CurrentOrganization() decorator
  - [x] Implement @CurrentMembership() decorator
- [x] Tenant Middleware
  - [x] Create TenantGuard (used instead of middleware)
  - [x] Validate X-Organization-Id header
  - [x] Attach currentOrganization to request
  - [x] Attach currentMembership to request
  - [x] Handle missing or invalid org context
- [x] Frontend Multi-Tenancy
  - [x] Create organization switcher component
  - [x] Persist selected org in local storage
  - [x] Add X-Organization-Id to API client
  - [x] Create team settings page UI
  - [x] Create member management UI
  - [x] Create invitation UI
  - [x] Show current organization in layout
- [ ] Testing
  - [ ] Unit tests for organization service
  - [ ] Unit tests for RBAC guards
  - [ ] E2E tests for organization creation
  - [ ] E2E tests for member management
  - [ ] E2E tests for invitation flow
  - [ ] Test org context isolation

---

## Epic 4: User Profiles (2-3 days) ✅

**Goal:** User profile management with avatar uploads

- [x] Profile CRUD
  - [x] Implement GET /users/me endpoint
  - [x] Implement PATCH /users/me endpoint
  - [x] Validate profile updates with Zod
  - [x] Update user preferences (language, theme)
- [x] Avatar Upload
  - [x] Configure Azure Blob Storage connection
  - [x] Implement POST /users/me/avatar endpoint
  - [x] Validate file type (jpg, png, webp)
  - [x] Validate file size (<5MB)
  - [x] Generate unique blob names
  - [x] Delete old avatar on update
  - [x] Return avatar URL
- [x] Preferences
  - [x] Store language preference (fr/en)
  - [x] Store theme preference (light/dark/system)
  - [x] Store notification settings
- [x] Frontend Profile
  - [x] Create profile settings page UI
  - [x] Create profile edit form
  - [x] Create avatar upload component with preview
  - [x] Create language switcher
  - [x] Create theme switcher
  - [x] Update i18n based on user preference
  - [x] Apply theme based on user preference
- [x] Testing
  - [x] Unit tests for UsersService (getProfile, updateProfile, uploadAvatar, deleteAvatar)
  - [x] Unit tests for StorageService (file validation, mime types, file size)
  - [x] Frontend tests for ProfileSettingsPage
  - [x] Frontend tests for UserMenu component

---

## Epic 5: Billing (3-4 days) ✅

**Goal:** Stripe integration for subscriptions

- [x] Stripe Configuration
  - [x] Install Stripe SDK
  - [x] Configure Stripe API keys (via ConfigService)
  - [x] Create Stripe module in NestJS (BillingModule)
  - [x] Set up webhook endpoint security (signature verification)
- [x] Customer Management
  - [x] Create BullMQ job for customer creation (stripe queue)
  - [x] Trigger customer creation on org creation
  - [x] Store Stripe customer ID in Organization
  - [x] Handle customer creation failures (graceful fallback)
- [x] Subscription Management
  - [x] Implement GET /billing endpoint
  - [x] Implement POST /billing/checkout endpoint
  - [x] Create Stripe checkout session
  - [x] Implement POST /billing/portal endpoint
  - [x] Generate customer portal URL
- [x] Webhook Handlers
  - [x] Implement POST /billing/webhooks endpoint
  - [x] Verify Stripe webhook signatures
  - [x] Handle checkout.session.completed event
  - [x] Handle customer.subscription.created event
  - [x] Handle customer.subscription.updated event
  - [x] Handle customer.subscription.deleted event
  - [x] Handle invoice.payment_failed event
  - [x] Update Subscription model from webhook data
- [x] Subscription Guards
  - [x] Create SubscriptionGuard
  - [x] Check subscription status before premium features
  - [x] Handle trial periods
  - [x] Handle past_due status
- [x] Frontend Billing
  - [x] Create billing settings page UI
  - [x] Show current subscription status
  - [x] Show plan details (tier, status, renewal date)
  - [x] Create upgrade/downgrade UI
  - [x] Implement checkout redirect
  - [x] Implement customer portal redirect
  - [x] Show payment method info
- [x] Testing
  - [x] Unit tests for billing service
  - [x] Frontend tests for billing page
  - [ ] E2E tests for checkout flow (requires Stripe test keys)
  - [ ] Test webhook handlers with Stripe CLI (requires Stripe test keys)

---

## Epic 6: Email System (2 days) ✅

**Goal:** Email sending with templates and queue

- [x] Email Infrastructure
  - [x] Configure Resend API
  - [x] Create email service in NestJS
  - [x] Set up React Email for templates
  - [x] Configure BullMQ email queue
- [x] Email Templates
  - [x] Create confirmation email template (React Email)
  - [x] Create reset-password email template
  - [x] Create welcome email template
  - [x] Create invitation email template
  - [x] Support internationalization in templates (FR/EN)
- [x] Email Queue
  - [x] Create email queue processor
  - [x] Implement retry logic for failed sends
  - [x] Log email send attempts
  - [x] Handle Resend API errors gracefully
- [x] Integration
  - [x] Send confirmation email on signup
  - [x] Send reset email on password reset request
  - [x] Send welcome email after email verification
  - [x] Send invitation email when user is invited
- [x] Testing
  - [x] Unit tests for email service
  - [x] Test email queue processing
  - [x] Test template rendering
  - [x] Test internationalization in emails

---

## Epic 7: Landing & UI Foundation (3-4 days)

**Goal:** Marketing pages and design system

- [ ] Design System
  - [ ] Configure Tailwind CSS 4 with zinc palette
  - [ ] Set up shadcn/ui components
  - [ ] Create custom component variants
  - [ ] Implement dark mode support
  - [ ] Create theme provider
- [ ] Layout Components
  - [ ] Create marketing layout (header, footer)
  - [ ] Create auth layout (centered forms)
  - [ ] Create dashboard layout (sidebar)
  - [ ] Create admin layout
- [ ] Landing Page
  - [ ] Create hero section
  - [ ] Create features section
  - [ ] Create pricing section
  - [ ] Create CTA sections
  - [ ] Add smooth scrolling
  - [ ] Implement responsive design
- [ ] Common Components
  - [ ] Create loading states
  - [ ] Create error states
  - [ ] Create empty states
  - [ ] Configure Sonner toast notifications
  - [ ] Create confirmation dialogs
- [ ] Internationalization
  - [ ] Set up i18next configuration
  - [ ] Create French translations
  - [ ] Create English translations
  - [ ] Create language switcher component
  - [ ] Add translation keys to all UI text
- [ ] Testing
  - [ ] Component tests for layouts
  - [ ] Component tests for common components
  - [ ] Visual regression tests (optional)
  - [ ] Accessibility tests

---

## Epic 8: Dashboard (2-3 days)

**Goal:** Protected dashboard with navigation

- [ ] Dashboard Layout
  - [ ] Create sidebar navigation
  - [ ] Implement active link highlighting
  - [ ] Add organization switcher to sidebar
  - [ ] Create user dropdown menu
  - [ ] Add dark mode toggle
  - [ ] Make sidebar responsive (mobile drawer)
- [ ] Dashboard Home
  - [ ] Create dashboard overview page
  - [ ] Show user welcome message
  - [ ] Display organization info
  - [ ] Show quick stats/metrics
- [ ] Settings Pages
  - [ ] Create settings layout (tabs or sidebar)
  - [ ] Implement profile settings page
  - [ ] Implement team settings page
  - [ ] Implement billing settings page
  - [ ] Implement preferences page
- [ ] Navigation
  - [ ] Implement breadcrumbs
  - [ ] Handle nested routes
  - [ ] Add keyboard shortcuts (optional)
- [ ] Testing
  - [ ] E2E tests for dashboard navigation
  - [ ] Test organization switching
  - [ ] Test protected route access
  - [ ] Test responsive layout

---

## Epic 9: Admin Backoffice (2-3 days)

**Goal:** Super admin dashboard

- [ ] Admin Guard
  - [ ] Create SuperAdminGuard
  - [ ] Check isSuperAdmin flag
  - [ ] Redirect non-admins to dashboard
- [ ] User Management
  - [ ] Implement GET /admin/users endpoint
  - [ ] Add pagination support
  - [ ] Add search functionality
  - [ ] Create user list UI
  - [ ] Add user details view
  - [ ] Show user organizations and roles
- [ ] Organization Management
  - [ ] Implement GET /admin/organizations endpoint
  - [ ] Add pagination and filtering by tier
  - [ ] Create organization list UI
  - [ ] Show subscription details
  - [ ] Show member counts
- [ ] Logs Management
  - [ ] Implement GET /admin/logs endpoint
  - [ ] Add filtering by level, date range
  - [ ] Create logs viewer UI
  - [ ] Implement log search
  - [ ] Show structured log details
- [ ] Admin Layout
  - [ ] Create admin sidebar navigation
  - [ ] Add admin badge/indicator
  - [ ] Implement admin-specific styling
- [ ] Testing
  - [ ] Unit tests for admin endpoints
  - [ ] E2E tests for admin access control
  - [ ] Test admin user management
  - [ ] Test admin organization views

---

## Epic 10: Observability (2 days)

**Goal:** Error tracking, logging, and monitoring

- [ ] Sentry Integration
  - [ ] Install Sentry SDK (frontend)
  - [ ] Install Sentry SDK (backend)
  - [ ] Configure Sentry DSN
  - [ ] Set up source maps for frontend
  - [ ] Configure release tracking
- [ ] Error Tracking
  - [ ] Capture frontend exceptions
  - [ ] Capture backend exceptions
  - [ ] Add user context to errors
  - [ ] Add organization context to errors
  - [ ] Configure error sampling
- [ ] Structured Logging
  - [ ] Create Logger service
  - [ ] Implement correlationId generation
  - [ ] Log all HTTP requests
  - [ ] Log all database queries (optional)
  - [ ] Store logs in AppLog table
  - [ ] Implement log rotation strategy
- [ ] Performance Monitoring
  - [ ] Enable Sentry performance tracking
  - [ ] Track API endpoint performance
  - [ ] Track frontend page load times
  - [ ] Set up alerts for slow queries
- [ ] Rate Limiting
  - [ ] Implement Redis-based rate limiter
  - [ ] Apply strict limits on auth endpoints
  - [ ] Apply general limits on API endpoints
  - [ ] Return 429 Too Many Requests
  - [ ] Add rate limit headers
- [ ] Testing
  - [ ] Test Sentry error capture
  - [ ] Test logging middleware
  - [ ] Test rate limiting logic
  - [ ] Verify correlationId propagation

---

## Epic 11: Testing (3-4 days)

**Goal:** Comprehensive test coverage

- [ ] Backend Unit Tests
  - [ ] Auth service tests
  - [ ] User service tests
  - [ ] Organization service tests
  - [ ] Billing service tests
  - [ ] Email service tests
  - [ ] Mock Prisma client
  - [ ] Mock external services
- [ ] Backend Integration Tests
  - [ ] Database integration tests
  - [ ] Redis integration tests
  - [ ] Queue integration tests
- [ ] Backend E2E Tests (Supertest)
  - [ ] Auth flow tests
  - [ ] User CRUD tests
  - [ ] Organization management tests
  - [ ] Billing webhook tests
  - [ ] Admin endpoint tests
- [ ] Frontend Unit Tests
  - [ ] Component tests
  - [ ] Hook tests
  - [ ] Utility function tests
  - [ ] Form validation tests
- [ ] Frontend Integration Tests
  - [ ] API service tests with MSW
  - [ ] Auth context tests
  - [ ] Organization context tests
- [ ] E2E Tests (Playwright)
  - [ ] Complete signup flow
  - [ ] Complete login flow
  - [ ] Email verification flow
  - [ ] Password reset flow
  - [ ] Organization switching
  - [ ] Team member invitation
  - [ ] Billing checkout flow
  - [ ] Profile updates
  - [ ] Admin backoffice access
- [ ] Test Infrastructure
  - [ ] Set up test database
  - [ ] Set up test Redis instance
  - [ ] Configure CI test runners
  - [ ] Set up coverage reporting
  - [ ] Aim for >80% coverage

---

## Epic 12: CI/CD & Deployment (2-3 days)

**Goal:** Automated deployment pipeline

- [ ] GitHub Actions Setup
  - [ ] Create CI workflow file
  - [ ] Run linting on PRs
  - [ ] Run type checking on PRs
  - [ ] Run unit tests on PRs
  - [ ] Run E2E tests on PRs
  - [ ] Generate coverage reports
- [ ] Docker Configuration
  - [ ] Create Dockerfile for frontend
  - [ ] Create Dockerfile for backend
  - [ ] Optimize Docker image sizes
  - [ ] Set up multi-stage builds
  - [ ] Create docker-compose.yml for production
- [ ] Azure Container Apps Deployment
  - [ ] Configure Azure Container Registry
  - [ ] Set up Container App environment
  - [ ] Configure frontend container app
  - [ ] Configure backend container app
  - [ ] Set up environment variables
  - [ ] Configure health checks
  - [ ] Set up scaling rules
- [ ] Database Migrations
  - [ ] Create migration deployment strategy
  - [ ] Run migrations before deployment
  - [ ] Set up rollback procedure
- [ ] Deployment Workflow
  - [ ] Create deployment workflow
  - [ ] Deploy on main branch push
  - [ ] Deploy frontend to Azure
  - [ ] Deploy backend to Azure
  - [ ] Run database migrations
  - [ ] Verify deployment health
- [ ] Monitoring & Alerts
  - [ ] Set up uptime monitoring
  - [ ] Configure Sentry deployment notifications
  - [ ] Set up error rate alerts
  - [ ] Configure performance alerts
- [ ] Documentation
  - [ ] Document deployment process
  - [ ] Create runbook for common issues
  - [ ] Document rollback procedures
  - [ ] Update README with deployment info

---

## Progress Summary

**Completed Epics:** 6 / 12
**Completed Tasks:** ~200 / ~250

### Epic Status

- [x] E1: Project Setup (100%) ✅
- [x] E2: Authentication (90%) ✅ (Backend complete, Frontend complete, Testing pending)
- [x] E3: Multi-Tenancy (90%) ✅ (Backend + Frontend complete, Testing pending)
- [x] E4: User Profiles (90%) ✅ (Backend + Frontend complete, Testing pending)
- [x] E5: Billing (95%) ✅ (Backend + Frontend complete, E2E tests pending Stripe keys)
- [x] E6: Email System (100%) ✅ (React Email templates, BullMQ queue, full test coverage)
- [ ] E7: Landing & UI Foundation (0%)
- [ ] E8: Dashboard (0%)
- [ ] E9: Admin Backoffice (0%)
- [ ] E10: Observability (0%)
- [ ] E11: Testing (0%)
- [ ] E12: CI/CD & Deployment (0%)

---

## Notes

- Update this document as tasks are completed by checking off boxes
- Add implementation notes or blockers under each task as needed
- Adjust time estimates based on actual progress
- Some tasks may be parallelized across epics
