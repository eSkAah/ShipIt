import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { DotGrid } from '../components/ui/dot-grid';
import { authService } from '../services/auth.service';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    // Prevent double execution in React Strict Mode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center section-padding relative overflow-hidden">
      <DotGrid />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in text-center relative z-10">
        <div className="glass-card p-8 space-y-4">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto">
                <svg
                  className="animate-spin h-8 w-8 text-gold-500"
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
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t('auth.verifyEmail.verifying')}
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t('auth.verifyEmail.success')}
              </h2>
              <Link to="/login">
                <Button variant="primary" className="mt-4">
                  {t('auth.verifyEmail.backToLogin')}
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-error"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t('auth.verifyEmail.error')}</h2>
              <Link to="/login">
                <Button variant="secondary" className="mt-4">
                  {t('auth.verifyEmail.backToLogin')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
