import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Member } from '../../services/organizations.service';
import { Button } from '../ui/button';

interface MemberCardProps {
  member: Member;
  currentUserId: string;
  currentUserRole: 'admin' | 'member' | 'viewer';
  onUpdateRole: (userId: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

export function MemberCard({
  member,
  currentUserId,
  currentUserRole,
  onUpdateRole,
  onRemove,
}: MemberCardProps) {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const isCurrentUser = member.userId === currentUserId;
  const canManage = currentUserRole === 'admin' && !isCurrentUser;

  const roles: Array<'admin' | 'member' | 'viewer'> = ['admin', 'member', 'viewer'];

  const handleRoleChange = async (newRole: 'admin' | 'member' | 'viewer') => {
    if (newRole === member.role) {
      setShowRoleMenu(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateRole(member.userId, newRole);
    } finally {
      setIsUpdating(false);
      setShowRoleMenu(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(t('settings.team.removeConfirm'))) return;

    setIsUpdating(true);
    try {
      await onRemove(member.userId);
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-gold-500/20 text-gold-600 dark:text-gold-400',
    member: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    viewer: 'bg-muted/20 text-muted',
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-premium border border-theme hover:border-gold-500/50 transition-all duration-300">
      <div className="flex items-center gap-4">
        {member.user.avatarUrl ? (
          <img
            src={member.user.avatarUrl}
            alt={`${member.user.firstName} ${member.user.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-gold-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {getInitials(member.user.firstName, member.user.lastName)}
          </div>
        )}

        <div>
          <p className="font-medium text-foreground">
            {member.user.firstName} {member.user.lastName}
            {isCurrentUser && (
              <span className="ml-2 text-sm text-muted">({t('settings.team.you')})</span>
            )}
          </p>
          <p className="text-sm text-muted">{member.user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {canManage ? (
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              disabled={isUpdating}
              className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[member.role]} hover:opacity-80 transition-all duration-300`}
            >
              {t(`settings.team.role.${member.role}`)}
              <svg
                className={`inline-block w-4 h-4 ml-1 transition-transform duration-300 ${showRoleMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 glass-card shadow-card animate-fade-in z-10">
                <div className="p-1">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full text-left px-3 py-2 rounded-input text-sm transition-all duration-300 text-foreground ${
                        role === member.role
                          ? 'bg-gold-500/10 font-semibold'
                          : 'hover:bg-white/5 dark:hover:bg-white/10'
                      }`}
                    >
                      {t(`settings.team.role.${role}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[member.role]}`}>
            {t(`settings.team.role.${member.role}`)}
          </span>
        )}

        {canManage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-red-500 hover:bg-red-500/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
