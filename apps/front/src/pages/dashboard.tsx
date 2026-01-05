import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/auth-context';
import { DashboardLayout } from '../components/layouts/dashboard-layout';

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, currentOrganization } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-section font-bold leading-section">
            {t('dashboard.welcome', { name: user?.firstName })}
          </h1>
          <p className="text-black/60 mt-2">{t('dashboard.overview')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gold-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Organisation</h3>
            </div>
            <p className="text-2xl font-bold">{currentOrganization?.name}</p>
            <p className="text-sm text-black/60">{currentOrganization?.membership.role}</p>
          </div>

          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Status</h3>
            </div>
            <p className="text-2xl font-bold capitalize">
              {currentOrganization?.subscriptionStatus}
            </p>
            <p className="text-sm text-black/60">{currentOrganization?.subscriptionTier}</p>
          </div>

          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-success"
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
              <h3 className="font-semibold text-lg">Email</h3>
            </div>
            <p className="text-base font-medium break-all">{user?.email}</p>
            <p className="text-sm text-black/60">
              {user?.emailVerified ? t('dashboard.emailVerified') : t('dashboard.emailNotVerified')}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
