import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signupSchema, type SignupDto } from '@shipit/validators';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { FormField } from '../components/forms/form-field';
import { PasswordStrength } from '../components/forms/password-strength';
import { OAuthButton } from '../components/auth/oauth-button';
import { authService } from '../services/auth.service';

export function SignupPage() {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupDto>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: SignupDto) => {
    try {
      setError(null);
      await signup(data);
      setSuccess(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error && err.message.includes('email')
          ? t('auth.signup.errors.emailExists')
          : t('auth.signup.errors.serverError');
      setError(errorMessage);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center section-padding bg-white">
        <div className="w-full max-w-md animate-fade-in text-center">
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
            <h2 className="text-2xl font-bold">{t('auth.signup.success')}</h2>
            <Link to="/login">
              <Button variant="primary" className="mt-4">
                {t('auth.login.title')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center section-padding bg-white">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-section font-bold leading-section mb-2">{t('auth.signup.title')}</h1>
          <p className="text-base text-black/60">{t('auth.signup.subtitle')}</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-input bg-error/10 border border-error animate-fade-in">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                {...register('firstName')}
                id="firstName"
                type="text"
                label={t('auth.signup.firstName')}
                error={errors.firstName?.message}
                autoComplete="given-name"
              />

              <FormField
                {...register('lastName')}
                id="lastName"
                type="text"
                label={t('auth.signup.lastName')}
                error={errors.lastName?.message}
                autoComplete="family-name"
              />
            </div>

            <FormField
              {...register('email')}
              id="email"
              type="email"
              label={t('auth.signup.email')}
              error={errors.email?.message}
              autoComplete="email"
            />

            <div className="space-y-2">
              <FormField
                {...register('password')}
                id="password"
                type="password"
                label={t('auth.signup.password')}
                error={errors.password?.message}
                autoComplete="new-password"
              />
              <PasswordStrength password={password || ''} />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              {t('auth.signup.submit')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-black/60">{t('auth.signup.orContinueWith')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <OAuthButton provider="google" onClick={authService.loginWithGoogle} />
            <OAuthButton provider="apple" onClick={authService.loginWithApple} />
          </div>

          <p className="text-center text-sm text-black/60">
            {t('auth.signup.hasAccount')}{' '}
            <Link
              to="/login"
              className="text-gold-500 hover:text-gold-600 font-semibold transition-colors duration-300"
            >
              {t('auth.signup.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
