import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { resetPasswordSchema, type ResetPasswordDto } from '@shipit/validators';
import { Button } from '../components/ui/button';
import { FormField } from '../components/forms/form-field';
import { PasswordStrength } from '../components/forms/password-strength';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { DotGrid } from '../components/ui/dot-grid';
import { authService } from '../services/auth.service';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordDto>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordDto) => {
    try {
      setError(null);
      await authService.resetPassword(data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(t('auth.resetPassword.errors.invalidToken'));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center section-padding relative overflow-hidden">
        <DotGrid />
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md animate-fade-in text-center relative z-10">
          <div className="glass-card p-8 space-y-4">
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
            <h2 className="text-2xl font-bold text-foreground">
              {t('auth.resetPassword.errors.invalidToken')}
            </h2>
            <Link to="/forgot-password">
              <Button variant="secondary" className="mt-4">
                {t('auth.forgotPassword.title')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {t('auth.resetPassword.success')}
            </h2>
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
            {t('auth.resetPassword.title')}
          </h1>
          <p className="text-base text-muted">{t('auth.resetPassword.subtitle')}</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-input bg-error/10 border border-error animate-fade-in">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('token')} />

            <div className="space-y-2">
              <FormField
                {...register('password')}
                id="password"
                type="password"
                label={t('auth.resetPassword.password')}
                error={errors.password?.message}
                autoComplete="new-password"
              />
              <PasswordStrength password={password || ''} />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              {t('auth.resetPassword.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
