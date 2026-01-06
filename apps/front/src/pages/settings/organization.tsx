import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createOrganizationSchema, CreateOrganizationDto } from '@shipit/validators';
import { useAuth } from '../../contexts/auth-context';
import { DashboardLayout } from '../../components/layouts/dashboard-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { DangerConfirmModal } from '../../components/ui/danger-confirm-modal';
import { organizationsService } from '../../services/organizations.service';

export function OrganizationSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentOrganization, organizations, setCurrentOrganization } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    formState: { errors: updateErrors, isDirty },
  } = useForm<CreateOrganizationDto>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: currentOrganization?.name || '',
    },
  });

  // Reset form when organization changes (e.g., via organization switcher)
  useEffect(() => {
    if (currentOrganization) {
      resetUpdate({ name: currentOrganization.name });
      setShowDeleteModal(false);
    }
  }, [currentOrganization, resetUpdate]);

  const updateMutation = useMutation({
    mutationFn: (data: CreateOrganizationDto) =>
      organizationsService.updateOrganization(currentOrganization!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success(t('settings.organization.updateSuccess'));
    },
    onError: () => {
      toast.error(t('settings.organization.updateError'));
    },
  });

  // Delete mutation (only called when user confirms in modal)
  const deleteMutation = useMutation({
    mutationFn: () => organizationsService.deleteOrganization(currentOrganization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      const otherOrg = organizations.find((o) => o.id !== currentOrganization?.id);
      if (otherOrg) {
        setCurrentOrganization(otherOrg);
      }
      toast.success(t('settings.organization.deleteSuccess'));
      setShowDeleteModal(false);
      navigate('/dashboard');
    },
    onError: () => {
      toast.error(t('settings.organization.deleteError'));
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => organizationsService.leaveOrganization(currentOrganization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      const otherOrg = organizations.find((o) => o.id !== currentOrganization?.id);
      if (otherOrg) {
        setCurrentOrganization(otherOrg);
      }
      toast.success(t('settings.organization.leaveSuccess'));
      navigate('/dashboard');
    },
    onError: () => {
      toast.error(t('settings.organization.leaveError'));
    },
  });

  const onUpdate = async (data: CreateOrganizationDto) => {
    try {
      await updateMutation.mutateAsync(data);
    } catch {
      // Error is handled by onError callback in mutation
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleCloseDeleteModal = () => {
    if (!deleteMutation.isPending) {
      setShowDeleteModal(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(t('settings.organization.leaveConfirm'))) return;
    try {
      await leaveMutation.mutateAsync();
    } catch {
      // Error is handled by onError callback in mutation
    }
  };

  const isAdmin = currentOrganization?.role === 'admin';
  const canDelete = organizations.length > 1 && isAdmin;
  const canLeave = organizations.length > 1 && !isAdmin;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('settings.organization.title')}</h1>
          <p className="text-muted mt-1">{t('settings.organization.description')}</p>
        </div>

        {isAdmin && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              {t('settings.organization.general')}
            </h2>
            <form onSubmit={handleSubmitUpdate(onUpdate)} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('settings.organization.name')}</Label>
                <Input id="name" {...registerUpdate('name')} error={updateErrors.name?.message} />
                {updateErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{updateErrors.name.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty}
                isLoading={updateMutation.isPending}
              >
                {t('common.save')}
              </Button>
            </form>
          </div>
        )}

        <div className="glass-card p-6 border-red-500/30">
          <h2 className="text-lg font-semibold text-red-500 mb-4">
            {t('settings.organization.dangerZone')}
          </h2>

          <div className="space-y-4">
            {canLeave && (
              <div className="flex items-center justify-between p-4 border border-red-500/30 rounded-premium">
                <div>
                  <p className="font-medium text-foreground">
                    {t('settings.organization.leaveTitle')}
                  </p>
                  <p className="text-sm text-muted">
                    {t('settings.organization.leaveDescription')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLeave}
                  isLoading={leaveMutation.isPending}
                  className="text-red-500 hover:bg-red-500/10"
                >
                  {t('settings.organization.leave')}
                </Button>
              </div>
            )}

            {canDelete && (
              <div className="flex items-center justify-between p-4 border border-red-500/30 rounded-premium">
                <div>
                  <p className="font-medium text-foreground">
                    {t('settings.organization.deleteTitle')}
                  </p>
                  <p className="text-sm text-muted">
                    {t('settings.organization.deleteDescription')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleDeleteClick}
                  className="text-red-500 hover:bg-red-500/10"
                >
                  {t('settings.organization.delete')}
                </Button>
              </div>
            )}

            {!canDelete && !canLeave && (
              <p className="text-sm text-muted text-center py-4">
                {t('settings.organization.cannotDelete')}
              </p>
            )}
          </div>
        </div>
      </div>

      <DangerConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t('settings.organization.deleteTitle')}
        warningMessage={t('settings.organization.deleteConfirmDescription')}
        confirmText={currentOrganization?.name || ''}
        confirmPlaceholder={t('settings.organization.typeOrgName')}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
