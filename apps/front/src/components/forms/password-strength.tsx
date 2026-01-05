import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();

  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' };

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2)
      return {
        level: 1,
        label: t('auth.signup.passwordStrength.weak'),
        color: 'bg-error',
      };
    if (score <= 4)
      return {
        level: 2,
        label: t('auth.signup.passwordStrength.medium'),
        color: 'bg-warning',
      };
    return {
      level: 3,
      label: t('auth.signup.passwordStrength.strong'),
      color: 'bg-success',
    };
  }, [password, t]);

  if (!password) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-700 ease-smooth ${
              level <= strength.level ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-sm font-medium ${strength.color.replace('bg-', 'text-')}`}>
        {strength.label}
      </p>
    </div>
  );
}
