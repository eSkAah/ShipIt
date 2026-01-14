import { type RouteConfig, route, index, prefix } from '@react-router/dev/routes';

export default [
  // Public routes
  index('routes/_index.tsx'),

  // Auth routes
  route('login', 'routes/login.tsx'),
  route('signup', 'routes/signup.tsx'),
  route('forgot-password', 'routes/forgot-password.tsx'),
  route('reset-password', 'routes/reset-password.tsx'),
  route('verify-email', 'routes/verify-email.tsx'),

  // Invitation acceptance (public but with token)
  route('invitations/:token/accept', 'routes/invitations.accept.tsx'),

  // Protected dashboard routes
  route('dashboard', 'routes/dashboard.tsx'),

  // Protected settings routes
  ...prefix('settings', [
    route('profile', 'routes/settings.profile.tsx'),
    route('team', 'routes/settings.team.tsx'),
    route('organization', 'routes/settings.organization.tsx'),
    route('billing', 'routes/settings.billing.tsx'),
  ]),

  // Admin routes (super admin only)
  ...prefix('admin', [
    index('routes/admin._index.tsx'),
    route('users', 'routes/admin.users.tsx'),
    route('organizations', 'routes/admin.organizations.tsx'),
    route('feedback', 'routes/admin.feedback.tsx'),
    route('logs', 'routes/admin.logs.tsx'),
  ]),

  // 404 catch-all
  route('*', 'routes/$.tsx'),
] satisfies RouteConfig;
