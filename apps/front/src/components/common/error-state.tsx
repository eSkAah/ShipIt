import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  showHomeLink = false,
  className = '',
}: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-error" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
        {title || t('common.errorTitle', 'Something went wrong')}
      </h3>

      {/* Description */}
      <p className="text-black/60 dark:text-white/60 max-w-sm mb-6">
        {description ||
          t('common.errorDescription', 'An unexpected error occurred. Please try again.')}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw size={16} />
            {t('common.retry')}
          </button>
        )}
        {showHomeLink && (
          <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2">
            <Home size={16} />
            {t('common.backToDashboard', 'Back to dashboard')}
          </Link>
        )}
      </div>
    </div>
  );
}

interface ErrorPageProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorPage({ title, description, onRetry }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorState title={title} description={description} onRetry={onRetry} showHomeLink />
    </div>
  );
}

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ message, onDismiss, className = '' }: ErrorAlertProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-premium bg-error/10 border border-error/30 ${className}`}
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
      <p className="text-sm text-error flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-error hover:text-error/80 transition-colors"
          aria-label="Dismiss"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>
      )}
    </div>
  );
}
