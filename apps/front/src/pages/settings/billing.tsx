import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { CreditCard, CheckCircle, AlertCircle, Crown, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '../../components/layouts/dashboard-layout';
import { Button } from '../../components/ui/button';
import { billingService } from '../../services/billing.service';
import { useOrganization } from '../../contexts/organization-context';

const STRIPE_PRICE_PREMIUM = import.meta.env.VITE_STRIPE_PRICE_PREMIUM || '';

export function BillingSettingsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentOrganization, currentMembership } = useOrganization();
  const isAdmin = currentMembership?.role === 'admin';

  // Handle success/cancel URL params from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success(t('settings.billing.checkoutSuccess'));
      setSearchParams({});
    } else if (canceled === 'true') {
      toast.info(t('settings.billing.checkoutCanceled'));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, t]);

  const {
    data: subscriptionInfo,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['billing', currentOrganization?.id],
    queryFn: () => billingService.getSubscriptionInfo(),
    enabled: !!currentOrganization?.id,
    refetchOnWindowFocus: true,
  });

  const checkoutMutation = useMutation({
    mutationFn: () => billingService.createCheckoutSession(STRIPE_PRICE_PREMIUM),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast.error(t('settings.billing.checkoutError'));
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => billingService.createPortalSession(),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast.error(t('settings.billing.portalError'));
    },
  });

  const isPremium = subscriptionInfo?.tier === 'premium';
  const isPastDue = subscriptionInfo?.status === 'past_due';
  const isCanceled = subscriptionInfo?.status === 'canceled';

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    if (!subscriptionInfo) return null;

    const statusConfig = {
      active: {
        color: 'bg-success/10 text-success',
        icon: CheckCircle,
        label: t('settings.billing.status.active'),
      },
      trialing: {
        color: 'bg-info/10 text-info',
        icon: CheckCircle,
        label: t('settings.billing.status.trialing'),
      },
      past_due: {
        color: 'bg-warning/10 text-warning',
        icon: AlertCircle,
        label: t('settings.billing.status.pastDue'),
      },
      canceled: {
        color: 'bg-error/10 text-error',
        icon: AlertCircle,
        label: t('settings.billing.status.canceled'),
      },
      incomplete: {
        color: 'bg-gray-500/10 text-gray-500',
        icon: AlertCircle,
        label: t('settings.billing.status.incomplete'),
      },
    };

    const config = statusConfig[subscriptionInfo.status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-8 max-w-2xl">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-premium" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl">
          <div className="glass-card p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t('settings.billing.error.title')}</h2>
            <p className="text-muted mb-4">{t('settings.billing.error.description')}</p>
            <Button variant="primary" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('settings.billing.title')}</h1>
          <p className="text-muted mt-1">{t('settings.billing.description')}</p>
        </div>

        {/* Current Plan */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t('settings.billing.currentPlan')}
              </h2>
              <p className="text-muted text-sm mt-1">
                {t('settings.billing.organization')}: {currentOrganization?.name}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-4 p-4 rounded-input bg-background/50 border border-gray-200 dark:border-gray-700">
            <div
              className={`p-3 rounded-full ${
                isPremium
                  ? 'bg-gold-500/10 text-gold-500'
                  : 'bg-gray-500/10 text-gray-500 dark:text-gray-400'
              }`}
            >
              {isPremium ? <Crown className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {isPremium ? t('settings.billing.plans.premium') : t('settings.billing.plans.free')}
              </h3>
              <p className="text-sm text-muted">
                {isPremium
                  ? t('settings.billing.plans.premiumDescription')
                  : t('settings.billing.plans.freeDescription')}
              </p>
            </div>
          </div>

          {/* Subscription details */}
          {isPremium && subscriptionInfo && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {subscriptionInfo.currentPeriodEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">
                    {subscriptionInfo.cancelAtPeriodEnd
                      ? t('settings.billing.endsOn')
                      : t('settings.billing.renewsOn')}
                  </span>
                  <span className="text-foreground font-medium">
                    {formatDate(subscriptionInfo.currentPeriodEnd)}
                  </span>
                </div>
              )}
              {subscriptionInfo.cancelAtPeriodEnd && (
                <p className="text-sm text-warning">{t('settings.billing.cancelScheduled')}</p>
              )}
            </div>
          )}

          {/* Past due warning */}
          {isPastDue && (
            <div className="mt-4 p-4 rounded-input bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning">
                    {t('settings.billing.pastDueWarning.title')}
                  </h4>
                  <p className="text-sm text-warning/80 mt-1">
                    {t('settings.billing.pastDueWarning.description')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              {t('settings.billing.actions')}
            </h2>

            <div className="space-y-4">
              {!isPremium && !isCanceled && (
                <div className="flex items-center justify-between p-4 rounded-input bg-gold-500/5 border border-gold-500/20">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {t('settings.billing.upgrade.title')}
                    </h3>
                    <p className="text-sm text-muted mt-1">
                      {t('settings.billing.upgrade.description')}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => checkoutMutation.mutate()}
                    isLoading={checkoutMutation.isPending}
                    disabled={!STRIPE_PRICE_PREMIUM}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {t('settings.billing.upgrade.button')}
                  </Button>
                </div>
              )}

              {(isPremium || subscriptionInfo?.stripeCustomerId) && (
                <div className="flex items-center justify-between p-4 rounded-input bg-background/50 border border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {t('settings.billing.manageSubscription.title')}
                    </h3>
                    <p className="text-sm text-muted mt-1">
                      {t('settings.billing.manageSubscription.description')}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => portalMutation.mutate()}
                    isLoading={portalMutation.isPending}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('settings.billing.manageSubscription.button')}
                  </Button>
                </div>
              )}

              {!STRIPE_PRICE_PREMIUM && (
                <div className="p-4 rounded-input bg-info/10 border border-info/20">
                  <p className="text-sm text-info">{t('settings.billing.stripeNotConfigured')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Not admin message */}
        {!isAdmin && (
          <div className="glass-card p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">
                  {t('settings.billing.adminOnly.title')}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {t('settings.billing.adminOnly.description')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Premium features list */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            {t('settings.billing.features.title')}
          </h2>

          <div className="grid gap-3">
            {[
              'settings.billing.features.feature1',
              'settings.billing.features.feature2',
              'settings.billing.features.feature3',
              'settings.billing.features.feature4',
            ].map((featureKey, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`p-1 rounded-full ${
                    isPremium ? 'bg-gold-500/10 text-gold-500' : 'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className={isPremium ? 'text-foreground' : 'text-muted'}>
                  {t(featureKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
