import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { LinksFunction } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '../src/contexts/auth-context';
import { OrganizationProvider } from '../src/contexts/organization-context';
import { ThemeProvider, useTheme } from '../src/contexts/theme-context';
import { ErrorBoundary as SentryErrorBoundary } from '../src/components/common/error-boundary';
import { initSentry } from '../src/lib/sentry';
import '../src/i18n/config';

import stylesheet from '../src/styles/globals.css?url';

// Initialize Sentry
initSentry();

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
];

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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ShipIt - Production-ready SaaS Boilerplate</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <svg
          className="animate-spin h-12 w-12 text-gold-500 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-4 text-muted">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SentryErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemedToaster />
          <AuthProvider>
            <OrganizationProvider>
              <Outlet />
            </OrganizationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SentryErrorBoundary>
  );
}
