# ShipIt - Development Roadmap

This document tracks the development progress of the ShipIt SaaS boilerplate across all epics.

**Total Estimated Time:** 30-40 days

---

## Epic 1: Project Setup (3-4 days) ✅

**Goal:** Bootstrap Nx monorepo with all infrastructure dependencies

- [x] Initialize Nx workspace with pnpm
  - [x] Create nx.json with appropriate build/test configurations
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

## Epic 2: Authentication (4-5 days)

**Goal:** Implement complete authentication system with Better Auth

- [ ] Install and configure Better Auth
  - [ ] Install dependencies (@better-auth/core)
  - [ ] Create auth configuration module
  - [ ] Configure session management (7-day expiry)
  - [ ] Set up HttpOnly cookie configuration
- [ ] Email/Password Authentication
  - [ ] Implement POST /auth/signup endpoint
  - [ ] Implement POST /auth/login endpoint
  - [ ] Implement POST /auth/logout endpoint
  - [ ] Implement GET /auth/session endpoint
  - [ ] Hash passwords with Argon2
- [ ] Email Verification
  - [ ] Create VerificationToken model logic
  - [ ] Implement POST /auth/verify-email endpoint
  - [ ] Generate verification tokens
  - [ ] Create email verification template
- [ ] Password Reset
  - [ ] Implement POST /auth/forgot-password endpoint
  - [ ] Implement POST /auth/reset-password endpoint
  - [ ] Generate reset tokens with expiration
  - [ ] Create password reset email template
- [ ] OAuth Integration
  - [ ] Configure Google OAuth provider
  - [ ] Configure Apple OAuth provider
  - [ ] Implement GET /auth/oauth/:provider redirect
  - [ ] Handle OAuth callbacks
  - [ ] Link OAuth accounts to existing users
- [ ] Session Management
  - [ ] Create SessionGuard for protected routes
  - [ ] Implement session validation middleware
  - [ ] Create @CurrentUser() decorator
  - [ ] Track IP address and user agent in sessions
- [ ] Frontend Auth
  - [ ] Create login page UI
  - [ ] Create signup page UI
  - [ ] Create forgot password page UI
  - [ ] Create reset password page UI
  - [ ] Create email verification page UI
  - [ ] Implement auth context provider
  - [ ] Create protected route wrapper
  - [ ] Add OAuth buttons (Google, Apple)
- [ ] Testing
  - [ ] Unit tests for auth service
  - [ ] E2E tests for signup flow
  - [ ] E2E tests for login flow
  - [ ] E2E tests for password reset flow
  - [ ] E2E tests for email verification

---

## Epic 3: Multi-Tenancy (3-4 days)

**Goal:** Implement organization system with RBAC

- [ ] Organization CRUD
  - [ ] Implement POST /organizations endpoint
  - [ ] Implement GET /organizations endpoint
  - [ ] Auto-create "Personal" org on signup
  - [ ] Create organization context service
- [ ] Organization Members
  - [ ] Implement GET /organizations/:id/members endpoint
  - [ ] Implement PATCH /organizations/:id/members/:uid (role update)
  - [ ] Implement DELETE /organizations/:id/members/:uid (remove member)
  - [ ] Validate membership before operations
- [ ] Invitations System
  - [ ] Implement POST /organizations/:id/invitations endpoint
  - [ ] Implement POST /invitations/:token/accept endpoint
  - [ ] Generate invitation tokens
  - [ ] Handle invitation expiration
  - [ ] Create invitation email template
  - [ ] Prevent duplicate invitations
- [ ] RBAC Implementation
  - [ ] Create RolesGuard
  - [ ] Create @Roles() decorator
  - [ ] Implement role hierarchy (admin > member > viewer)
  - [ ] Create TenantGuard for org context
  - [ ] Implement @CurrentOrganization() decorator
  - [ ] Implement @CurrentMembership() decorator
- [ ] Tenant Middleware
  - [ ] Create TenantMiddleware
  - [ ] Validate X-Organization-Id header
  - [ ] Attach currentOrganization to request
  - [ ] Attach currentMembership to request
  - [ ] Handle missing or invalid org context
- [ ] Frontend Multi-Tenancy
  - [ ] Create organization switcher component
  - [ ] Persist selected org in local storage
  - [ ] Add X-Organization-Id to API client
  - [ ] Create team settings page UI
  - [ ] Create member management UI
  - [ ] Create invitation UI
  - [ ] Show current organization in layout
- [ ] Testing
  - [ ] Unit tests for organization service
  - [ ] Unit tests for RBAC guards
  - [ ] E2E tests for organization creation
  - [ ] E2E tests for member management
  - [ ] E2E tests for invitation flow
  - [ ] Test org context isolation

---

## Epic 4: User Profiles (2-3 days)

**Goal:** User profile management with avatar uploads

- [ ] Profile CRUD
  - [ ] Implement GET /users/me endpoint
  - [ ] Implement PATCH /users/me endpoint
  - [ ] Validate profile updates with Zod
  - [ ] Update user preferences (language, theme)
- [ ] Avatar Upload
  - [ ] Configure Azure Blob Storage connection
  - [ ] Implement POST /users/me/avatar endpoint
  - [ ] Validate file type (jpg, png, webp)
  - [ ] Validate file size (<5MB)
  - [ ] Generate unique blob names
  - [ ] Delete old avatar on update
  - [ ] Return avatar URL
- [ ] Preferences
  - [ ] Store language preference (fr/en)
  - [ ] Store theme preference (light/dark/system)
  - [ ] Store notification settings
- [ ] Frontend Profile
  - [ ] Create profile settings page UI
  - [ ] Create profile edit form
  - [ ] Create avatar upload component with preview
  - [ ] Create language switcher
  - [ ] Create theme switcher
  - [ ] Update i18n based on user preference
  - [ ] Apply theme based on user preference
- [ ] Testing
  - [ ] Unit tests for user service
  - [ ] E2E tests for profile updates
  - [ ] E2E tests for avatar upload
  - [ ] Test file validation logic

---

## Epic 5: Billing (3-4 days)

**Goal:** Stripe integration for subscriptions

- [ ] Stripe Configuration
  - [ ] Install Stripe SDK
  - [ ] Configure Stripe API keys
  - [ ] Create Stripe module in NestJS
  - [ ] Set up webhook endpoint security
- [ ] Customer Management
  - [ ] Create BullMQ job for customer creation
  - [ ] Trigger customer creation on org creation
  - [ ] Store Stripe customer ID in Organization
  - [ ] Handle customer creation failures
- [ ] Subscription Management
  - [ ] Implement GET /billing endpoint
  - [ ] Implement POST /billing/checkout endpoint
  - [ ] Create Stripe checkout session
  - [ ] Implement POST /billing/portal endpoint
  - [ ] Generate customer portal URL
- [ ] Webhook Handlers
  - [ ] Implement POST /billing/webhooks endpoint
  - [ ] Verify Stripe webhook signatures
  - [ ] Handle checkout.session.completed event
  - [ ] Handle customer.subscription.created event
  - [ ] Handle customer.subscription.updated event
  - [ ] Handle customer.subscription.deleted event
  - [ ] Handle invoice.payment_failed event
  - [ ] Update Subscription model from webhook data
- [ ] Subscription Guards
  - [ ] Create SubscriptionGuard
  - [ ] Check subscription status before premium features
  - [ ] Handle trial periods
  - [ ] Handle past_due status
- [ ] Frontend Billing
  - [ ] Create billing settings page UI
  - [ ] Show current subscription status
  - [ ] Show plan details (tier, status, renewal date)
  - [ ] Create upgrade/downgrade UI
  - [ ] Implement checkout redirect
  - [ ] Implement customer portal redirect
  - [ ] Show payment method info
- [ ] Testing
  - [ ] Unit tests for billing service
  - [ ] Test webhook handlers with Stripe test events
  - [ ] E2E tests for checkout flow
  - [ ] Test subscription guard logic

---

## Epic 6: Email System (2 days)

**Goal:** Email sending with templates and queue

- [ ] Email Infrastructure
  - [ ] Configure Resend API
  - [ ] Create email service in NestJS
  - [ ] Set up React Email for templates
  - [ ] Configure BullMQ email queue
- [ ] Email Templates
  - [ ] Create confirmation email template (React Email)
  - [ ] Create reset-password email template
  - [ ] Create welcome email template
  - [ ] Create invitation email template
  - [ ] Support internationalization in templates (FR/EN)
- [ ] Email Queue
  - [ ] Create email queue processor
  - [ ] Implement retry logic for failed sends
  - [ ] Log email send attempts
  - [ ] Handle Resend API errors gracefully
- [ ] Integration
  - [ ] Send confirmation email on signup
  - [ ] Send reset email on password reset request
  - [ ] Send welcome email after email verification
  - [ ] Send invitation email when user is invited
- [ ] Testing
  - [ ] Unit tests for email service
  - [ ] Test email queue processing
  - [ ] Test template rendering
  - [ ] Test internationalization in emails

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

**Completed Epics:** 1 / 12
**Completed Tasks:** ~50 / ~250

### Epic Status

- [x] E1: Project Setup (100%) ✅
- [ ] E2: Authentication (0%)
- [ ] E3: Multi-Tenancy (0%)
- [ ] E4: User Profiles (0%)
- [ ] E5: Billing (0%)
- [ ] E6: Email System (0%)
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
