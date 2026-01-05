import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createOrganizationSchema, CreateOrganizationDto } from '@shipit/validators';
import { useAuth } from '../../contexts/auth-context';
import { DashboardLayout } from '../../components/layouts/dashboard-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { organizationsService } from '../../services/organizations.service';

export function OrganizationSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentOrganization, organizations, setCurrentOrganization } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: updateErrors, isDirty },
  } = useForm<CreateOrganizationDto>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: currentOrganization?.name || '',
    },
  });

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateOrganizationDto>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateOrganizationDto) =>
      organizationsService.updateOrganization(currentOrganization!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => organizationsService.createOrganization(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      resetCreate();
      setShowCreateForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => organizationsService.deleteOrganization(currentOrganization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      const otherOrg = organizations.find((o) => o.id !== currentOrganization?.id);
      if (otherOrg) {
        setCurrentOrganization(otherOrg);
      }
      navigate('/dashboard');
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
      navigate('/dashboard');
    },
  });

  const onUpdate = async (data: CreateOrganizationDto) => {
    await updateMutation.mutateAsync(data);
  };

  const onCreate = async (data: CreateOrganizationDto) => {
    await createMutation.mutateAsync(data.name);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  const handleLeave = async () => {
    if (!window.confirm(t('settings.organization.leaveConfirm'))) return;
    await leaveMutation.mutateAsync();
  };

  const isAdmin = currentOrganization?.role === 'admin';
  const canDelete = organizations.length > 1 && isAdmin;
  const canLeave = organizations.length > 1 && !isAdmin;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.organization.title')}</h1>
          <p className="text-black/60 mt-1">{t('settings.organization.description')}</p>
        </div>

        {isAdmin && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('settings.organization.general')}</h2>
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

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('settings.organization.createNew')}</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? t('common.cancel') : t('settings.organization.createButton')}
            </Button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleSubmitCreate(onCreate)} className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="newName">{t('settings.organization.newName')}</Label>
                <Input
                  id="newName"
                  placeholder={t('settings.organization.newNamePlaceholder')}
                  {...registerCreate('name')}
                  error={createErrors.name?.message}
                />
                {createErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{createErrors.name.message}</p>
                )}
              </div>

              <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
                {t('settings.organization.create')}
              </Button>
            </form>
          )}
        </div>

        <div className="glass-card p-6 border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            {t('settings.organization.dangerZone')}
          </h2>

          <div className="space-y-4">
            {canLeave && (
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-premium">
                <div>
                  <p className="font-medium">{t('settings.organization.leaveTitle')}</p>
                  <p className="text-sm text-black/60">
                    {t('settings.organization.leaveDescription')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLeave}
                  isLoading={leaveMutation.isPending}
                  className="text-red-500 hover:bg-red-50"
                >
                  {t('settings.organization.leave')}
                </Button>
              </div>
            )}

            {canDelete && (
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-premium">
                <div>
                  <p className="font-medium">{t('settings.organization.deleteTitle')}</p>
                  <p className="text-sm text-black/60">
                    {t('settings.organization.deleteDescription')}
                  </p>
                </div>
                {showDeleteConfirm ? (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      isLoading={deleteMutation.isPending}
                      className="text-red-500 bg-red-50 hover:bg-red-100"
                    >
                      {t('settings.organization.confirmDelete')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    {t('settings.organization.delete')}
                  </Button>
                )}
              </div>
            )}

            {!canDelete && !canLeave && (
              <p className="text-sm text-black/60 text-center py-4">
                {t('settings.organization.cannotDelete')}
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
