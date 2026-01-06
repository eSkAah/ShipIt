import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2, Camera, Trash2 } from 'lucide-react';
import { createOrganizationSchema, CreateOrganizationDto } from '@shipit/validators';
import { useAuth } from '../../contexts/auth-context';
import { DashboardLayout } from '../../components/layouts/dashboard-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { DangerConfirmModal } from '../../components/ui/danger-confirm-modal';
import { organizationsService } from '../../services/organizations.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function OrganizationSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentOrganization, organizations, setCurrentOrganization } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => organizationsService.uploadLogo(currentOrganization!.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setLogoPreview(null);
      toast.success(t('settings.organization.logoUploadSuccess'));
    },
    onError: () => {
      setLogoPreview(null);
      toast.error(t('settings.organization.logoUploadError'));
    },
  });

  const deleteLogoMutation = useMutation({
    mutationFn: () => organizationsService.deleteLogo(currentOrganization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success(t('settings.organization.logoDeleteSuccess'));
    },
    onError: () => {
      toast.error(t('settings.organization.logoDeleteError'));
    },
  });

  const validateLogoFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t('settings.organization.logo.invalidType');
      }
      if (file.size > MAX_SIZE) {
        return t('settings.organization.logo.tooLarge');
      }
      return null;
    },
    [t],
  );

  const handleLogoSelect = useCallback(
    async (file: File) => {
      const validationError = validateLogoFile(file);
      if (validationError) {
        setLogoError(validationError);
        return;
      }

      setLogoError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadLogoMutation.mutate(file);
    },
    [validateLogoFile, uploadLogoMutation],
  );

  const handleLogoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoSelect(file);
    }
    e.target.value = '';
  };

  const handleLogoDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleLogoDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleLogoSelect(file);
      }
    },
    [handleLogoSelect],
  );

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
          <>
            {/* Logo Upload Section */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                {t('settings.organization.logo.title')}
              </h2>
              <p className="text-sm text-muted mb-6">
                {t('settings.organization.logo.description')}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Logo Preview */}
                <div
                  className={`relative w-24 h-24 rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 ${
                    dragActive ? 'ring-4 ring-gold-500 ring-offset-2' : ''
                  }`}
                  onDragEnter={handleLogoDrag}
                  onDragLeave={handleLogoDrag}
                  onDragOver={handleLogoDrag}
                  onDrop={handleLogoDrop}
                >
                  {logoPreview || currentOrganization?.logoUrl ? (
                    <img
                      src={logoPreview || currentOrganization?.logoUrl || ''}
                      alt={currentOrganization?.name || 'Organization logo'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold-400 to-purple-500 flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                  )}

                  {/* Loading overlay */}
                  {(uploadLogoMutation.isPending || deleteLogoMutation.isPending) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <svg
                        className="animate-spin h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Camera overlay button */}
                  {!uploadLogoMutation.isPending && !deleteLogoMutation.isPending && (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                      aria-label={t('settings.organization.logo.change')}
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={handleLogoInputChange}
                  className="hidden"
                  aria-label={t('settings.organization.logo.selectFile')}
                />

                {/* Action buttons and info */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadLogoMutation.isPending || deleteLogoMutation.isPending}
                    >
                      <Camera className="w-4 h-4" />
                      {t('settings.organization.logo.change')}
                    </Button>

                    {currentOrganization?.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLogoMutation.mutate()}
                        disabled={uploadLogoMutation.isPending || deleteLogoMutation.isPending}
                        className="text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('settings.organization.logo.delete')}
                      </Button>
                    )}
                  </div>

                  {/* Error message */}
                  {logoError && <p className="text-sm text-red-500">{logoError}</p>}

                  {/* Helper text */}
                  <p className="text-xs text-muted">{t('settings.organization.logo.hint')}</p>
                </div>
              </div>
            </div>

            {/* General Settings Section */}
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
          </>
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
