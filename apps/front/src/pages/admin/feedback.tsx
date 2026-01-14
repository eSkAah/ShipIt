import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Bug, HelpCircle, Mail } from 'lucide-react';
import { AdminLayout } from '../../components/layouts/admin-layout';
import { adminService, AdminFeedback } from '../../services/admin.service';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const typeConfig: Record<string, { icon: typeof Bug; colorClass: string }> = {
  bug: {
    icon: Bug,
    colorClass: 'bg-gold-500/10 text-gold-400 border-gold-500/30',
  },
  help: {
    icon: HelpCircle,
    colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
};

export function AdminFeedbackPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [type, setType] = useState<'bug' | 'help' | ''>('');
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'feedback', { page, limit, search, type: type || undefined }],
    queryFn: () => adminService.getFeedback({ page, limit, search, type: type || undefined }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const feedback = data?.data ?? [];
  const pagination = data?.pagination;

  const toggleExpand = (id: string) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserDisplayName = (item: AdminFeedback) => {
    if (item.user) {
      return `${item.user.firstName} ${item.user.lastName}`;
    }
    return t('admin.feedback.unknownUser');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.feedback.title')}</h1>
          <p className="text-white/60 mt-1">{t('admin.feedback.description')}</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.feedback.search')}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Button type="submit" variant="secondary">
              {t('common.search')}
            </Button>
          </form>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as 'bug' | 'help' | '');
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('admin.feedback.allTypes')}</option>
            <option value="bug">{t('admin.feedback.types.bug')}</option>
            <option value="help">{t('admin.feedback.types.help')}</option>
          </select>
        </div>

        {/* Stats */}
        {pagination && (
          <div className="text-sm text-white/60">
            {t('admin.feedback.total', { count: pagination.total })}
          </div>
        )}

        {/* Feedback List */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : feedback.length === 0 ? (
            <div className="p-8 text-center text-white/60">{t('admin.feedback.noFeedback')}</div>
          ) : (
            <div className="divide-y divide-white/5">
              {feedback.map((item) => {
                const config = typeConfig[item.type] || typeConfig['bug'];
                const Icon = config.icon;
                const isExpanded = expandedFeedback === item.id;

                return (
                  <div
                    key={item.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="p-4 flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg border', config.colorClass)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium uppercase',
                              config.colorClass,
                            )}
                          >
                            {t(`admin.feedback.types.${item.type}`)}
                          </span>
                          <span className="text-white/40 text-sm">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-white font-medium mb-1">{item.subject}</p>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Mail className="w-3 h-3" />
                          <span>{getUserDisplayName(item)}</span>
                          {item.user && (
                            <a
                              href={`mailto:${item.user.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-gold-400 hover:text-gold-300 transition-colors"
                            >
                              ({item.user.email})
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 ml-14">
                        <div className="p-4 bg-black/30 rounded-lg">
                          <p className="text-white/80 whitespace-pre-wrap">{item.message}</p>
                          {item.organizationId && (
                            <p className="mt-3 text-white/40 text-sm">
                              {t('admin.feedback.organizationId')}: {item.organizationId}
                            </p>
                          )}
                        </div>
                        {item.user && (
                          <div className="mt-3">
                            <a
                              href={`mailto:${item.user.email}?subject=Re: ${encodeURIComponent(item.subject)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black font-medium rounded-xl transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              {t('admin.feedback.reply')}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                {t('admin.feedback.pagination', {
                  current: pagination.page,
                  total: pagination.totalPages,
                })}
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
