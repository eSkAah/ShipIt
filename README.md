# ShipIt - Production-Ready SaaS Boilerplate

A modern, production-ready SaaS boilerplate featuring authentication, billing, multi-tenancy, and admin capabilities. Built with React 19, NestJS 11, and Prisma 6.

## Features

- **Authentication**: Email/password + OAuth (Google, Apple) with Better Auth
- **Multi-tenancy**: Organization-based with role-based access control (RBAC)
- **Billing**: Stripe integration with subscription management
- **Admin Panel**: Super admin dashboard for user and organization management
- **Email System**: Transactional emails with Resend and React Email
- **File Storage**: Avatar uploads with Azure Blob Storage
- **Internationalization**: French and English support
- **Observability**: Sentry error tracking and structured logging
- **Modern Stack**: React 19, NestJS 11, Prisma 6, Tailwind CSS 4

## Tech Stack

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui v2
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Internationalization**: i18next

### Backend

- **Framework**: NestJS 11
- **ORM**: Prisma 6
- **Database**: PostgreSQL (Supabase)
- **Cache/Queue**: Redis (Upstash) + BullMQ
- **Authentication**: Better Auth
- **Payments**: Stripe
- **Email**: Resend + React Email
- **Storage**: Azure Blob Storage

### Infrastructure

- **Monorepo**: Nx + pnpm
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Azure Container Apps
- **Monitoring**: Sentry

## Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0
- **Docker**: For local PostgreSQL and Redis
- **Git**: For version control

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/eSkAah/ShipIt.git
cd ShipIt
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
# Copy the example environment file
cp .env.example .env

# Update the .env file with your actual values
# At minimum, set DATABASE_URL and REDIS_URL
```

### 4. Start infrastructure services

```bash
# Start PostgreSQL and Redis with Docker Compose
pnpm docker:up

# Verify services are running
docker ps
```

### 5. Set up the database

```bash
# Generate Prisma client
pnpm prisma:generate

# Create and run initial migration
pnpm prisma:migrate:dev

# (Optional) Seed the database with test data
pnpm prisma:seed
```

### 6. Start development servers

```bash
# Start both frontend and backend concurrently
pnpm dev

# Or start them separately:
pnpm dev:front  # Frontend on http://localhost:3000
pnpm dev:back   # Backend on http://localhost:3001
```

### 7. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Prisma Studio**: Run `pnpm prisma:studio` to access database GUI

## Available Scripts

### Development

```bash
pnpm dev              # Run both frontend and backend
pnpm dev:front        # Run frontend only
pnpm dev:back         # Run backend only
```

### Building

```bash
pnpm build            # Build both apps
pnpm build:front      # Build frontend only
pnpm build:back       # Build backend only
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:front       # Run frontend tests
pnpm test:back        # Run backend tests
pnpm test:front:watch # Run frontend tests in watch mode
pnpm test:back:watch  # Run backend tests in watch mode
pnpm e2e:front        # Run frontend E2E tests
pnpm test:back:e2e    # Run backend E2E tests
```

### Code Quality

```bash
pnpm lint             # Lint all projects
pnpm lint:front       # Lint frontend
pnpm lint:back        # Lint backend
pnpm format           # Format all files with Prettier
pnpm format:check     # Check formatting
pnpm typecheck        # Run TypeScript type checking
```

### Database

```bash
pnpm prisma:generate       # Generate Prisma client
pnpm prisma:migrate:dev    # Create and apply migrations
pnpm prisma:migrate:deploy # Deploy migrations (production)
pnpm prisma:studio         # Open Prisma Studio GUI
pnpm prisma:seed           # Seed database
```

### Docker

```bash
pnpm docker:up        # Start PostgreSQL and Redis
pnpm docker:down      # Stop all services
```

## Project Structure

```
ShipIt/
├── apps/
│   ├── back/                    # NestJS backend
│   │   └── src/
│   │       ├── modules/         # Feature modules
│   │       ├── common/          # Shared utilities
│   │       ├── config/          # Configuration
│   │       ├── database/        # Prisma service
│   │       └── health/          # Health checks
│   └── front/                   # React frontend
│       └── src/
│           ├── app/routes/      # File-based routing
│           ├── components/      # React components
│           ├── hooks/           # Custom hooks
│           ├── services/        # API services
│           └── i18n/            # Translations
├── libs/
│   ├── shared-types/            # Shared TypeScript types
│   ├── validators/              # Zod validation schemas
│   └── constants/               # Shared constants
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed script
├── docker-compose.yml           # Local development services
└── nx.json                      # Nx workspace configuration
```

## Environment Variables

See `.env.example` for a complete list of required environment variables.

### Required for Development

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `BETTER_AUTH_SECRET`: Secret for session encryption (min 32 characters)

### Optional (but recommended)

- `STRIPE_SECRET_KEY`: For billing features
- `RESEND_API_KEY`: For email sending
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `AZURE_STORAGE_CONNECTION_STRING`: For file uploads
- `SENTRY_DSN`: For error tracking

## Documentation

- **Architecture Guide**: See `CLAUDE.md` for detailed architecture documentation
- **Development Roadmap**: See `DEVELOPMENT.md` for epic-based development plan
- **Business Requirements**: See `docs/BRD.md` for complete BRD

## Testing

The project uses different testing tools for frontend and backend:

- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest + Supertest
- **E2E**: Playwright (frontend) + Supertest (backend)

Run tests with:

```bash
pnpm test              # All tests
pnpm test:front:watch  # Frontend tests in watch mode
pnpm test:back:watch   # Backend tests in watch mode
```

## Deployment

The project is configured for deployment to Azure Container Apps.

### Build for Production

```bash
pnpm build
```

### Docker Build

```bash
# Frontend
docker build -f apps/front/Dockerfile -t shipit-front .

# Backend
docker build -f apps/back/Dockerfile -t shipit-back .
```

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure tests pass: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Submit a pull request to `develop`

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
