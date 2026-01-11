import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { DotGrid } from '../components/ui/dot-grid';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center section-padding relative overflow-hidden">
      <DotGrid />

      <div className="text-center max-w-md relative z-10 animate-fade-in">
        <div className="text-8xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('errors.notFound.title')}</h1>
        <p className="text-muted mb-8">{t('errors.notFound.description')}</p>
        <Link to="/">
          <Button variant="primary">{t('errors.notFound.backHome')}</Button>
        </Link>
      </div>
    </div>
  );
}
