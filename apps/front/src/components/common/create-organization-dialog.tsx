import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { createOrganizationSchema, CreateOrganizationDto } from '@shipit/validators';
import {
  organizationsService,
  OrganizationWithMembership,
} from '../../services/organizations.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface CreateOrganizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (organization: OrganizationWithMembership) => void;
}

export function CreateOrganizationDialog({
  isOpen,
  onClose,
  onCreated,
}: CreateOrganizationDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizationDto>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => organizationsService.createOrganization(name),
    onSuccess: async (newOrg) => {
      await queryClient.refetchQueries({ queryKey: ['organizations'] });
      toast.success(t('settings.organization.createSuccess'));
      reset();
      onCreated(newOrg as OrganizationWithMembership);
    },
    onError: () => {
      toast.error(t('settings.organization.createError'));
    },
  });

  const onSubmit = async (data: CreateOrganizationDto) => {
    try {
      await createMutation.mutateAsync(data.name);
    } catch {
      // Error is handled by onError callback in mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md animate-fade-in"
        onClick={handleClose}
      />

      <div className="relative z-10 glass-card shadow-card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {t('settings.organization.createNew')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/5 dark:hover:bg-white/10 transition-all duration-300 text-muted"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="orgName">{t('settings.organization.newName')}</Label>
            <Input
              id="orgName"
              placeholder={t('settings.organization.newNamePlaceholder')}
              error={errors.name?.message}
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
              className="flex-1"
            >
              {t('settings.organization.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
