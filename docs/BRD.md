# SaaS Boilerplate — BRD

> Template SaaS production-ready : Auth, Billing, Multi-tenancy, Admin

---

## Stack

```yaml
Frontend: React 19, TypeScript, Tailwind 4, shadcn/ui v2, TanStack Query, React Hook Form + Zod, Sonner, i18next
Backend: NestJS 11, TypeScript, Prisma 6, Better Auth, BullMQ, Swagger
Infra: Supabase (PostgreSQL), Upstash (Redis), Azure Blob Storage, Azure Container Apps, Stripe, Resend, Sentry
Monorepo: Nx + pnpm
```

---

## Structure

```
apps/
├── web/src/
│   ├── app/routes/(auth|dashboard|marketing|admin)/
│   ├── components/(ui|common|forms|layouts|features)/
│   ├── hooks/, services/, lib/, i18n/, styles/
│   └── e2e/
└── api/src/
    ├── modules/(auth|users|organizations|billing|health|admin)/
    ├── common/(decorators|filters|guards|interceptors|pipes|middleware)/
    ├── config/, database/, queue/, mail/, storage/, logger/
libs/
├── shared-types/    # TS types
├── validators/      # Zod schemas
└── constants/       # Roles, plans, errors
prisma/schema.prisma
docker/, .github/workflows/
```

---

## Prisma Schema

```prisma
enum Language { fr en }
enum Theme { light dark system }
enum Role { admin member viewer }
enum SubscriptionTier { free premium }
enum SubscriptionStatus { active past_due canceled trialing incomplete }
enum InvitationStatus { pending accepted expired canceled }

model User {
  id                   String    @id @default(uuid()) @db.Uuid
  email                String    @unique
  passwordHash         String?   @map("password_hash")
  firstName            String    @map("first_name")
  lastName             String    @map("last_name")
  phone                String?
  address              Json?
  avatarUrl            String?   @map("avatar_url")
  language             Language  @default(fr)
  theme                Theme     @default(system)
  notificationsEnabled Boolean   @default(true) @map("notifications_enabled")
  emailVerified        Boolean   @default(false) @map("email_verified")
  isSuperAdmin         Boolean   @default(false) @map("is_super_admin")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  sessions             Session[]
  accounts             Account[]
  memberships          OrganizationMember[]
  @@map("users")
}

model Session {
  id visé     String   @id @default(uuid())
  userId      String   @map("user_id") @db.Uuid
  expiresAt   DateTime @map("expires_at")
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

model Account {
  id                String  @id @default(uuid()) @db.Uuid
  userId            String  @map("user_id") @db.Uuid
  provider          String  // google, apple
  providerAccountId String  @map("provider_account_id")
  accessToken       String? @map("access_token")
  refreshToken      String? @map("refresh_token")
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model VerificationToken {
  id        String   @id @default(uuid()) @db.Uuid
  token     String   @unique
  email     String
  type      String   // email_verification, password_reset
  expiresAt DateTime @map("expires_at")
  @@map("verification_tokens")
}

model Organization {
  id                   String             @id @default(uuid()) @db.Uuid
  name                 String
  slug                 String             @unique
  stripeCustomerId     String?            @unique @map("stripe_customer_id")
  stripeSubscriptionId String?            @unique @map("stripe_subscription_id")
  subscriptionTier     SubscriptionTier   @default(free) @map("subscription_tier")
  subscriptionStatus   SubscriptionStatus @default(active) @map("subscription_status")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")
  members              OrganizationMember[]
  invitations          Invitation[]
  @@map("organizations")
}

model OrganizationMember {
  id             String       @id @default(uuid()) @db.Uuid
  userId         String       @map("user_id") @db.Uuid
  organizationId String       @map("organization_id") @db.Uuid
  role           Role         @default(member)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@unique([userId, organizationId])
  @@map("organization_members")
}

model Invitation {
  id             String           @id @default(uuid()) @db.Uuid
  email          String
  organizationId String           @map("organization_id") @db.Uuid
  role           Role             @default(member)
  token          String           @unique
  status         InvitationStatus @default(pending)
  invitedById    String           @map("invited_by_id") @db.Uuid
  expiresAt      DateTime         @map("expires_at")
  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@map("invitations")
}

model AppLog {
  id        String   @id @default(uuid()) @db.Uuid
  level     String   // info, warn, error
  message   String
  context   Json?
  userId    String?  @map("user_id") @db.Uuid
  orgId     String?  @map("org_id") @db.Uuid
  requestId String?  @map("request_id")
  timestamp DateTime @default(now())
  @@map("app_logs")
}
```

---

## Auth & RBAC

**Methods:** Email/password (Argon2) + OAuth Google/Apple via Better Auth
**Sessions:** Database-stored, HttpOnly secure cookies, 7 days expiry
**Email verification:** Required before login

**Roles per Organization:**
| Role | Permissions |
|------|-------------|
| super_admin | Global: /admin access, all tenants |
| admin | Org: billing, invite, manage members |
| member | Org: read/write business data |
| viewer | Org: read-only |

**Guards:** `AuthGuard`, `RolesGuard`, `SuperAdminGuard`

---

## Multi-tenancy

- **Strategy:** Shared DB with `organization_id` filtering
- **Middleware:** `TenantMiddleware` reads `X-Organization-Id` header, validates membership, attaches `req.currentOrganization`
- **Auto-create:** On signup → create Organization + OrganizationMember(admin)
- **Switching:** Frontend stores `currentOrgId` in localStorage, sends in header

---

## Billing (Stripe)

**Plans:** Free (no Stripe), Premium (Stripe price)

**Flow:**

1. POST /billing/checkout → Stripe Checkout Session URL
2. User pays on Stripe
3. Webhook `checkout.session.completed` → update org.subscriptionTier
4. POST /billing/portal → Customer Portal URL

**Webhooks to handle:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`

---

## API Endpoints

### Auth

```
POST /auth/signup        { email, password, firstName, lastName } → 201
POST /auth/login         { email, password } → 200 + session cookie
POST /auth/logout        → 200
GET  /auth/session       → { user, session }
GET  /auth/oauth/:provider → 302 redirect
POST /auth/verify-email  { token } → 200
POST /auth/forgot-password { email } → 200
POST /auth/reset-password { token, password } → 200
```

### Users

```
GET   /users/me          → User
PATCH /users/me          { firstName?, lastName?, phone?, address?, language?, theme? } → User
POST  /users/me/avatar   multipart/form-data → { avatarUrl }
```

### Organizations

```
GET   /organizations                    → Organization[]
POST  /organizations                    { name } → Organization
GET   /organizations/:id/members        → Member[]
POST  /organizations/:id/invitations    { email, role? } → Invitation
PATCH /organizations/:id/members/:uid   { role } → Member
DELETE /organizations/:id/members/:uid  → 200
POST  /invitations/:token/accept        → { organization }
```

### Billing (requires admin role + X-Organization-Id)

```
GET  /billing           → { tier, status, ... }
POST /billing/checkout  { priceId } → { url }
POST /billing/portal    → { url }
POST /billing/webhooks  (Stripe signature) → 200
```

### Admin (requires super_admin)

```
GET /admin/users         ?page,limit,search → User[]
GET /admin/organizations ?page,limit,tier   → Organization[]
GET /admin/logs          ?level,from,to     → AppLog[]
```

### Health

```
GET /health       → { status: 'ok' }
GET /health/ready → { status, info: { database, redis } }
```

---

## UI Pages

**Public:** `/` (landing: Hero, Features, CTA), `/login`, `/signup`, `/forgot-password`, `/reset-password`

**Protected:** `/dashboard`, `/settings/profile`, `/settings/team`, `/settings/billing`

**Admin:** `/admin/users`, `/admin/organizations`, `/admin/logs`

**Layout:** Sidebar (Home, Settings) + Org switcher + User dropdown + Dark mode toggle

**Design:** Zinc palette, minimalist (Apple/Tesla), Sonner toasts, i18n FR/EN

---

## Emails (Resend + React Email)

Templates: `confirmation`, `reset-password`, `welcome`, `invitation`
Queue: BullMQ processor for async sending

---

## Security

- Validation: Zod on all inputs
- Headers: Helmet (CSP, X-Frame-Options, etc.)
- Rate limiting: Redis-based, stricter on auth endpoints
- CORS: Whitelist FRONTEND_URL only
- Passwords: Argon2 hash
- Webhooks: Stripe signature verification

---

## Observability

- Errors: Sentry (frontend + backend)
- Logs: Structured JSON with correlationId → AppLog table
- Health: `/health`, `/health/ready` (DB + Redis check)

---

## Epics

| #   | Epic                                                    | Days |
| --- | ------------------------------------------------------- | ---- |
| E1  | Project Setup (Nx, Prisma, Redis, Docker)               | 3-4  |
| E2  | Auth (Better Auth, signup, login, OAuth, verify, reset) | 4-5  |
| E3  | Multi-tenancy (orgs, members, invitations, RBAC guards) | 3-4  |
| E4  | User Profile (CRUD, avatar upload, preferences)         | 2-3  |
| E5  | Billing (Stripe checkout, webhooks, portal)             | 3-4  |
| E6  | Emails (Resend, templates, queue)                       | 2    |
| E7  | Landing + UI Foundation (Tailwind, shadcn, i18n)        | 3-4  |
| E8  | Dashboard (layout, sidebar, org switcher, Sonner)       | 2-3  |
| E9  | Admin Backoffice (users, orgs, logs pages)              | 2-3  |
| E10 | Observability (Sentry, logging, health, rate limit)     | 2    |
| E11 | Testing (Playwright E2E, Jest unit, Supertest)          | 3-4  |
| E12 | CI/CD (GitHub Actions, Azure deploy)                    | 2-3  |

**Total: 30-40 days**

---

## Environment Variables

```bash
# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Auth
BETTER_AUTH_SECRET=min-32-chars
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM=price_...

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@domain.com

# Storage
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER=uploads

# Observability
SENTRY_DSN=https://...
```

---

## Conventions

- **Files:** kebab-case (`user.service.ts`)
- **Classes:** PascalCase (`UserService`)
- **Variables/functions:** camelCase
- **Constants:** SCREAMING_SNAKE_CASE
- **Components:** PascalCase, co-located with hooks
- **Tests:** `*.spec.ts` co-located or in `test/`

---

## Key Implementation Notes

1. **Signup flow:** Create User → Create Organization (name: "Personal") → Create OrganizationMember (role: admin) → Queue confirmation email → Return user
2. **Tenant isolation:** All business queries MUST include `where: { organizationId }`
3. **Session check:** Middleware validates session cookie, attaches `req.user`
4. **Org context:** TenantMiddleware validates X-Organization-Id header, attaches `req.currentOrganization` and `req.currentMembership`
5. **Stripe customer:** Created async via BullMQ job after org creation
6. **Avatar:** Validate type (jpg/png/webp) + size (<5MB), upload to Azure Blob, store URL
7. **i18n:** Default to user.language, fallback to browser, store in localStorage
8. **Dark mode:** Respect user.theme, apply via Tailwind dark: classes
