import { useTranslation } from 'react-i18next';
import { Member } from '../../services/organizations.service';
import { MemberCard } from './member-card';

interface MemberListProps {
  members: Member[];
  currentUserId: string;
  currentUserRole: 'admin' | 'member' | 'viewer';
  onUpdateRole: (userId: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

export function MemberList({
  members,
  currentUserId,
  currentUserRole,
  onUpdateRole,
  onRemove,
  isLoading,
}: MemberListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-premium border border-theme animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted/20" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted/20 rounded" />
                <div className="h-3 w-48 bg-muted/20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p>{t('settings.team.noMembers')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onUpdateRole={onUpdateRole}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
