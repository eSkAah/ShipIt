import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox, FileText, Users, FolderOpen, Search } from 'lucide-react';

type EmptyStateIcon = 'inbox' | 'file' | 'users' | 'folder' | 'search';

interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const iconComponents: Record<EmptyStateIcon, typeof Inbox> = {
  inbox: Inbox,
  file: FileText,
  users: Users,
  folder: FolderOpen,
  search: Search,
};

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const IconComponent = iconComponents[icon];

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <IconComponent className="w-8 h-8 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-black/60 dark:text-white/60 max-w-sm mb-6">{description}</p>
      )}

      {/* Action */}
      {action && <div>{action}</div>}
    </div>
  );
}

interface NoResultsProps {
  query?: string;
  onClear?: () => void;
  clearLabel?: string;
}

export function NoResults({ query, onClear, clearLabel }: NoResultsProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon="search"
      title={t('common.noResultsFound')}
      description={query ? t('common.noResultsQuery', { query }) : t('common.noResultsHint')}
      action={
        onClear && (
          <button
            onClick={onClear}
            className="text-purple-600 dark:text-gold-500 hover:underline font-medium"
          >
            {clearLabel || t('common.clearSearch')}
          </button>
        )
      }
    />
  );
}

interface NoDataProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function NoData({ title, description, action }: NoDataProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon="folder"
      title={title || t('common.noDataYet')}
      description={description || t('common.noDataDescription')}
      action={action}
    />
  );
}
