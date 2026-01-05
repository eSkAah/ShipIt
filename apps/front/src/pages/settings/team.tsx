import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/auth-context';
import { DashboardLayout } from '../../components/layouts/dashboard-layout';
import { MemberList } from '../../components/settings/member-list';
import { InviteMemberDialog } from '../../components/settings/invite-member-dialog';
import { Button } from '../../components/ui/button';
import { organizationsService } from '../../services/organizations.service';
import { invitationsService } from '../../services/invitations.service';
import { Invitation } from '@shipit/shared-types';

export function TeamSettingsPage() {
  const { t } = useTranslation();
  const { user, currentOrganization } = useAuth();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ['members', currentOrganization?.id],
    queryFn: () => organizationsService.getMembers(currentOrganization!.id),
    enabled: !!currentOrganization,
  });

  const { data: invitations = [], isLoading: isInvitationsLoading } = useQuery({
    queryKey: ['invitations', currentOrganization?.id],
    queryFn: () => invitationsService.getInvitations(currentOrganization!.id),
    enabled: !!currentOrganization && currentOrganization.role === 'admin',
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'member' | 'viewer' }) =>
      organizationsService.updateMemberRole(currentOrganization!.id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', currentOrganization?.id] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      organizationsService.removeMember(currentOrganization!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', currentOrganization?.id] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'admin' | 'member' | 'viewer' }) =>
      invitationsService.createInvitation(currentOrganization!.id, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', currentOrganization?.id] });
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => invitationsService.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', currentOrganization?.id] });
    },
  });

  const handleUpdateRole = async (userId: string, role: 'admin' | 'member' | 'viewer') => {
    await updateRoleMutation.mutateAsync({ userId, role });
  };

  const handleRemoveMember = async (userId: string) => {
    await removeMemberMutation.mutateAsync(userId);
  };

  const handleInvite = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    await inviteMutation.mutateAsync({ email, role });
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!window.confirm(t('settings.team.cancelInviteConfirm'))) return;
    await cancelInvitationMutation.mutateAsync(invitationId);
  };

  const isAdmin = currentOrganization?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('settings.team.title')}</h1>
            <p className="text-black/60 mt-1">{t('settings.team.description')}</p>
          </div>
          {isAdmin && (
            <Button variant="primary" onClick={() => setShowInviteDialog(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {t('settings.team.inviteButton')}
            </Button>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t('settings.team.members')} ({members.length})
          </h2>
          <MemberList
            members={members}
            currentUserId={user?.id || ''}
            currentUserRole={currentOrganization?.role || 'viewer'}
            onUpdateRole={handleUpdateRole}
            onRemove={handleRemoveMember}
            isLoading={isMembersLoading}
          />
        </div>

        {isAdmin && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('settings.team.pendingInvitations')} ({invitations.length})
            </h2>

            {isInvitationsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-premium border border-gray-200 animate-pulse">
                    <div className="h-4 w-48 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : invitations.length === 0 ? (
              <p className="text-black/60 text-center py-4">{t('settings.team.noInvitations')}</p>
            ) : (
              <div className="space-y-3">
                {invitations.map((invitation: Invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 rounded-premium border border-gray-200"
                  >
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-black/60">
                        {t(`settings.team.role.${invitation.role}`)} -{' '}
                        {t('settings.team.expires', {
                          date: new Date(invitation.expiresAt).toLocaleDateString(),
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      {t('settings.team.cancelInvite')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <InviteMemberDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onInvite={handleInvite}
      />
    </DashboardLayout>
  );
}
