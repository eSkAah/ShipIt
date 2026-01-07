import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, CheckCircle, Clock, Shield } from 'lucide-react';
import { AdminLayout } from '../../components/layouts/admin-layout';
import { adminService } from '../../services/admin.service';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export function AdminUsersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, limit, search }],
    queryFn: () => adminService.getUsers({ page, limit, search }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.users.title')}</h1>
          <p className="text-white/60 mt-1">{t('admin.users.description')}</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('admin.users.search')}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <Button type="submit" variant="secondary">
            {t('common.search')}
          </Button>
        </form>

        {/* Total count */}
        {pagination && (
          <p className="text-sm text-white/60">
            {t('admin.users.total', { count: pagination.total })}
          </p>
        )}

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.users.columns.user')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.users.columns.email')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.users.columns.status')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.users.columns.organizations')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-white/60">
                    {t('admin.users.columns.createdAt')}
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
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/60">
                      {t('admin.users.noUsers')}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {user.firstName?.charAt(0)}
                                {user.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {user.firstName} {user.lastName}
                              {user.isSuperAdmin && <Shield className="w-4 h-4 text-purple-400" />}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white/80">{user.email}</td>
                      <td className="p-4">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('admin.users.status.verified')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {t('admin.users.status.pending')}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.memberships.slice(0, 2).map((m) => (
                            <span
                              key={m.id}
                              className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-xs"
                            >
                              {m.organization.name}
                            </span>
                          ))}
                          {user.memberships.length > 2 && (
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
                              +{user.memberships.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
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
