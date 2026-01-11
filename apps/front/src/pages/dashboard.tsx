import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Building2, CreditCard, Mail, Users, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { DashboardLayout } from '../components/layouts/dashboard-layout';
import { organizationsService } from '../services/organizations.service';

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, currentOrganization } = useAuth();

  const { data: members } = useQuery({
    queryKey: ['organization-members', currentOrganization?.id],
    queryFn: () => organizationsService.getMembers(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });

  const memberCount = members?.length || 0;

  const stats = [
    {
      label: t('dashboard.stats.organization'),
      value: currentOrganization?.name || '-',
      subValue: currentOrganization?.role
        ? t(`settings.team.role.${currentOrganization.role}`)
        : '',
      icon: Building2,
      color: 'gold',
      href: '/settings/organization',
    },
    {
      label: t('dashboard.stats.subscription'),
      value: currentOrganization?.subscriptionStatus
        ? t(`settings.billing.status.${currentOrganization.subscriptionStatus}`)
        : '-',
      subValue: currentOrganization?.subscriptionTier
        ? t(`settings.billing.plans.${currentOrganization.subscriptionTier}`)
        : '',
      icon: CreditCard,
      color: 'purple',
      href: '/settings/billing',
    },
    {
      label: t('dashboard.stats.teamMembers'),
      value: memberCount.toString(),
      subValue: t('settings.team.members'),
      icon: Users,
      color: 'success',
      href: '/settings/team',
    },
    {
      label: t('dashboard.stats.email'),
      value: user?.email || '-',
      subValue: user?.emailVerified
        ? t('dashboard.emailVerified')
        : t('dashboard.emailNotVerified'),
      icon: Mail,
      color: user?.emailVerified ? 'success' : 'warning',
      href: '/settings/profile',
    },
  ];

  const quickActions = [
    {
      label: t('dashboard.viewTeam'),
      href: '/settings/team',
      icon: Users,
    },
    {
      label: t('dashboard.manageBilling'),
      href: '/settings/billing',
      icon: CreditCard,
    },
    {
      label: t('dashboard.editProfile'),
      href: '/settings/profile',
      icon: User,
    },
  ];

  const colorClasses = {
    gold: {
      bg: 'bg-gold-500/20 dark:bg-gold-500/10',
      text: 'text-gold-600 dark:text-gold-400',
    },
    purple: {
      bg: 'bg-purple-500/20 dark:bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
    },
    success: {
      bg: 'bg-success/20 dark:bg-success/10',
      text: 'text-success',
    },
    warning: {
      bg: 'bg-warning/20 dark:bg-warning/10',
      text: 'text-warning',
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t('dashboard.welcome', { name: user?.firstName })}
          </h1>
          <p className="text-muted mt-2">{t('dashboard.overview')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colors = colorClasses[stat.color as keyof typeof colorClasses];

            return (
              <Link
                key={stat.label}
                to={stat.href}
                className="glass-card p-5 space-y-3 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1 truncate">
                    {stat.value}
                  </p>
                  {stat.subValue && <p className="text-sm text-muted truncate">{stat.subValue}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-theme hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 dark:bg-gold-500/5 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  </div>
                  <span className="font-medium text-foreground">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
