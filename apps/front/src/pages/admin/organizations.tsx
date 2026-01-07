import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Crown, Users, Building2 } from 'lucide-react';
import { AdminLayout } from '../../components/layouts/admin-layout';
import { adminService } from '../../services/admin.service';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export function AdminOrganizationsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tier, setTier] = useState<'free' | 'premium' | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'organizations', { page, limit, search, tier: tier || undefined }],
    queryFn: () => adminService.getOrganizations({ page, limit, search, tier: tier || undefined }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const organizations = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.organizations.title')}</h1>
          <p className="text-white/60 mt-1">{t('admin.organizations.description')}</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.organizations.search')}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Button type="submit" variant="secondary">
              {t('common.search')}
            </Button>
          </form>

          <select
            value={tier}
            onChange={(e) => {
              setTier(e.target.value as '' | 'free' | 'premium');
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('admin.organizations.allTiers')}</option>
            <option value="free">{t('admin.organizations.tier.free')}</option>
            <option value="premium">{t('admin.organizations.tier.premium')}</option>
          </select>
        </div>

        {/* Total count */}
        {pagination && (
          <p className="text-sm text-white/60">
            {t('admin.organizations.total', { count: pagination.total })}
          </p>
        )}

        {/* Organizations Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.organizations.columns.organization')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.organizations.columns.tier')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.organizations.columns.status')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.organizations.columns.members')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.organizations.columns.createdAt')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan={5} className="p-4">
                        <div className="h-10 bg-white/5 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : organizations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/60">
                      {t('admin.organizations.noOrganizations')}
                    </td>
                  </tr>
                ) : (
                  organizations.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{org.name}</p>
                            <p className="text-white/40 text-sm">{org.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {org.subscriptionTier === 'premium' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-500/10 text-gold-400 text-xs font-medium">
                            <Crown className="w-3.5 h-3.5" />
                            {t('admin.organizations.tier.premium')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium">
                            {t('admin.organizations.tier.free')}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            org.subscriptionStatus === 'active'
                              ? 'bg-green-500/10 text-green-400'
                              : org.subscriptionStatus === 'past_due'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : org.subscriptionStatus === 'canceled'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {t(`admin.organizations.subscriptionStatus.${org.subscriptionStatus}`)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-white/80">
                          <Users className="w-4 h-4 text-white/40" />
                          {org.memberCount}
                        </span>
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                Page {pagination.page} / {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-white/60 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="text-white/60 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
