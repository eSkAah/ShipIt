import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, CheckCircle, Crown } from 'lucide-react';
import { AdminLayout } from '../../components/layouts/admin-layout';
import { adminService } from '../../services/admin.service';

export function AdminOverviewPage() {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getStats,
  });

  const statCards = [
    {
      label: t('admin.overview.stats.totalUsers'),
      value: stats?.totalUsers ?? '-',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: t('admin.overview.stats.totalOrganizations'),
      value: stats?.totalOrganizations ?? '-',
      icon: Building2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: t('admin.overview.stats.verifiedUsers'),
      value: stats?.verifiedUsers ?? '-',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: t('admin.overview.stats.premiumOrgs'),
      value: stats?.premiumOrgs ?? '-',
      icon: Crown,
      color: 'text-gold-500',
      bgColor: 'bg-gold-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.overview.title')}</h1>
          <p className="text-white/60 mt-1">{t('admin.overview.description')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {isLoading ? (
                        <span className="inline-block w-12 h-6 bg-white/10 rounded animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions or additional info can go here */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {t('admin.overview.quickStats')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">{t('admin.overview.stats.freeOrgs')}</span>
                <span className="text-white font-medium">
                  {isLoading ? '-' : (stats?.freeOrgs ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">{t('admin.overview.stats.unverifiedUsers')}</span>
                <span className="text-white font-medium">
                  {isLoading ? '-' : (stats?.unverifiedUsers ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {t('admin.overview.platformHealth')}
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white">{t('admin.overview.allSystemsOperational')}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
