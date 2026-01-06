import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/auth-context';
import { OrganizationProvider } from './contexts/organization-context';
import { ThemeProvider, useTheme } from './contexts/theme-context';
import { ErrorBoundary } from './components/common/error-boundary';
import { ProtectedRoute } from './components/auth/protected-route';
import { LandingPage } from './pages/landing';
import { LoginPage } from './pages/login';
import { SignupPage } from './pages/signup';
import { ForgotPasswordPage } from './pages/forgot-password';
import { ResetPasswordPage } from './pages/reset-password';
import { VerifyEmailPage } from './pages/verify-email';
import { DashboardPage } from './pages/dashboard';
import { TeamSettingsPage } from './pages/settings/team';
import { OrganizationSettingsPage } from './pages/settings/organization';
import { ProfileSettingsPage } from './pages/settings/profile';
import { BillingSettingsPage } from './pages/settings/billing';
import { AcceptInvitationPage } from './pages/invitations/accept';
import { NotFoundPage } from './pages/not-found';
import './i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'font-sans rounded-premium border border-theme shadow-card',
          title: 'text-foreground font-semibold',
          description: 'text-muted',
          success: 'bg-success/10 border-success/30 text-success',
          error: 'bg-error/10 border-error/30 text-error',
          warning: 'bg-warning/10 border-warning/30 text-warning',
          info: 'bg-info/10 border-info/30 text-info',
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemedToaster />
          <BrowserRouter>
            <AuthProvider>
              <OrganizationProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/profile"
                    element={
                      <ProtectedRoute>
                        <ProfileSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/team"
                    element={
                      <ProtectedRoute>
                        <TeamSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/organization"
                    element={
                      <ProtectedRoute>
                        <OrganizationSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/billing"
                    element={
                      <ProtectedRoute>
                        <BillingSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/invitations/:token/accept" element={<AcceptInvitationPage />} />
                  <Route path="/" element={<LandingPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </OrganizationProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
