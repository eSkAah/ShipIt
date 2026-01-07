import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
} from 'lucide-react';
import { AdminLayout } from '../../components/layouts/admin-layout';
import { adminService } from '../../services/admin.service';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const levelIcons: Record<string, typeof Info> = {
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
  debug: Bug,
};

const levelColors: Record<string, string> = {
  info: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  warn: 'bg-gold-500/10 text-gold-400 border-gold-500/30',
  error: 'bg-red-500/10 text-red-400 border-red-500/30',
  debug: 'bg-white/5 text-white/40 border-white/10',
};

export function AdminLogsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [level, setLevel] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'logs', { page, limit, search, level: level || undefined }],
    queryFn: () => adminService.getLogs({ page, limit, search, level: level || undefined }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  const toggleLogExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.logs.title')}</h1>
          <p className="text-white/60 mt-1">{t('admin.logs.description')}</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.logs.search')}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Button type="submit" variant="secondary">
              {t('common.search')}
            </Button>
          </form>

          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">{t('admin.logs.allLevels')}</option>
            <option value="info">{t('admin.logs.levels.info')}</option>
            <option value="warn">{t('admin.logs.levels.warn')}</option>
            <option value="error">{t('admin.logs.levels.error')}</option>
            <option value="debug">{t('admin.logs.levels.debug')}</option>
          </select>
        </div>

        {/* Logs List */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-white/60">{t('admin.logs.noLogs')}</div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map((log) => {
                const Icon = levelIcons[log.level] || Info;
                const colorClass = levelColors[log.level] || levelColors.info;
                const isExpanded = expandedLog === log.id;

                return (
                  <div
                    key={log.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => log.context && toggleLogExpand(log.id)}
                  >
                    <div className="p-4 flex items-start gap-4">
                      <div className={`p-2 rounded-lg border ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${colorClass}`}
                          >
                            {log.level}
                          </span>
                          <span className="text-white/40 text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          {log.requestId && (
                            <span className="text-white/30 text-xs font-mono">
                              {log.requestId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                        <p className="text-white break-all">{log.message}</p>
                        {log.context && (
                          <p className="text-white/40 text-sm mt-1">
                            {isExpanded ? 'Click to collapse' : 'Click to expand context'}
                          </p>
                        )}
                      </div>
                    </div>
                    {isExpanded && log.context && (
                      <div className="px-4 pb-4 ml-14">
                        <pre className="p-3 bg-black/30 rounded-lg text-sm text-white/80 overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
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
