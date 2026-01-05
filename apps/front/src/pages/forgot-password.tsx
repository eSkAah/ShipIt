import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPasswordSchema, type ForgotPasswordDto } from '@shipit/validators';
import { Button } from '../components/ui/button';
import { FormField } from '../components/forms/form-field';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { DotGrid } from '../components/ui/dot-grid';
import { authService } from '../services/auth.service';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordDto) => {
    try {
      setError(null);
      await authService.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError(t('auth.forgotPassword.errors.serverError'));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center section-padding relative overflow-hidden">
        <DotGrid />
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md animate-fade-in text-center relative z-10">
          <div className="glass-card p-8 space-y-4">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {t('auth.forgotPassword.success')}
            </h2>
            <Link to="/login">
              <Button variant="secondary" className="mt-4">
                {t('auth.forgotPassword.backToLogin')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center section-padding relative overflow-hidden">
      <DotGrid />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-foreground">
            {t('auth.forgotPassword.title')}
          </h1>
          <p className="text-base text-muted">{t('auth.forgotPassword.subtitle')}</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-input bg-error/10 border border-error animate-fade-in">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              {...register('email')}
              id="email"
              type="email"
              label={t('auth.forgotPassword.email')}
              error={errors.email?.message}
              autoComplete="email"
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              {t('auth.forgotPassword.submit')}
            </Button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-purple-600 dark:text-gold-500 hover:text-purple-700 dark:hover:text-gold-400 transition-colors duration-300"
            >
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
