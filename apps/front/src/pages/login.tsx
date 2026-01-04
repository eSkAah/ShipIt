import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginSchema, type LoginDto } from '@shipit/validators';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { FormField } from '../components/forms/form-field';
import { OAuthButton } from '../components/auth/oauth-button';
import { authService } from '../services/auth.service';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      setError(null);
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(t('auth.login.errors.invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-padding bg-white">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-section font-bold leading-section mb-2">{t('auth.login.title')}</h1>
          <p className="text-base text-black/60">{t('auth.login.subtitle')}</p>
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
              label={t('auth.login.email')}
              error={errors.email?.message}
              autoComplete="email"
            />

            <FormField
              {...register('password')}
              id="password"
              type="password"
              label={t('auth.login.password')}
              error={errors.password?.message}
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-gold-500 hover:text-gold-600 transition-colors duration-300"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              {t('auth.login.submit')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-black/60">{t('auth.login.orContinueWith')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <OAuthButton provider="google" onClick={authService.loginWithGoogle} />
            <OAuthButton provider="apple" onClick={authService.loginWithApple} />
          </div>

          <p className="text-center text-sm text-black/60">
            {t('auth.login.noAccount')}{' '}
            <Link
              to="/signup"
              className="text-gold-500 hover:text-gold-600 font-semibold transition-colors duration-300"
            >
              {t('auth.login.signupLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
