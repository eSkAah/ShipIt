import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '../../contexts/auth-context';
import { DashboardLayout } from '../../components/layouts/dashboard-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { AvatarUpload } from '../../components/ui/avatar-upload';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { usersService, UpdateProfileData } from '../../services/users.service';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  language: z.enum(['fr', 'en']),
  notificationsEnabled: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      language: user?.language || 'fr',
      notificationsEnabled: user?.notificationsEnabled ?? true,
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        language: user.language,
        notificationsEnabled: user.notificationsEnabled,
      });
    }
  }, [user, reset]);

  // Watch language to update i18n
  const watchedLanguage = watch('language');

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => usersService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      // Update i18n language if changed
      if (updatedUser.language !== i18n.language) {
        i18n.changeLanguage(updatedUser.language);
      }
      toast.success(t('settings.profile.updateSuccess'));
    },
    onError: () => {
      toast.error(t('settings.profile.updateError'));
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => usersService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success(t('settings.profile.avatar.uploadSuccess'));
    },
    onError: () => {
      toast.error(t('settings.profile.avatar.uploadError'));
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: () => usersService.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success(t('settings.profile.avatar.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('settings.profile.avatar.deleteError'));
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch {
      // Error handled in mutation
    }
  };

  const languageOptions = [
    { value: 'fr', label: t('settings.profile.languages.fr') },
    { value: 'en', label: t('settings.profile.languages.en') },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('settings.profile.title')}</h1>
          <p className="text-muted mt-1">{t('settings.profile.description')}</p>
        </div>

        {/* Avatar Section */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-6 text-foreground">
            {t('settings.profile.avatar.title')}
          </h2>
          <AvatarUpload
            currentAvatarUrl={user?.avatarUrl}
            onUpload={uploadAvatarMutation.mutateAsync}
            onDelete={deleteAvatarMutation.mutateAsync}
            isUploading={uploadAvatarMutation.isPending}
            isDeleting={deleteAvatarMutation.isPending}
          />
        </div>

        {/* Profile Form */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-6 text-foreground">
            {t('settings.profile.personalInfo')}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('settings.profile.firstName')}</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">{t('settings.profile.lastName')}</Label>
                <Input id="lastName" {...register('lastName')} error={errors.lastName?.message} />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t('settings.profile.email')}</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
              <p className="mt-1 text-xs text-muted">{t('settings.profile.emailHint')}</p>
            </div>

            <div>
              <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder={t('settings.profile.phonePlaceholder')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!isDirty}
              isLoading={updateProfileMutation.isPending}
            >
              {t('common.save')}
            </Button>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-6 text-foreground">
            {t('settings.profile.preferences')}
          </h2>

          <div className="space-y-6">
            {/* Language */}
            <div>
              <Label htmlFor="language">{t('settings.profile.language')}</Label>
              <Select
                id="language"
                options={languageOptions}
                value={watchedLanguage}
                onChange={(value) => {
                  setValue('language', value as 'fr' | 'en', { shouldDirty: true });
                }}
              />
            </div>

            {/* Theme */}
            <div>
              <Label>{t('settings.profile.theme')}</Label>
              <div className="mt-2">
                <ThemeToggle showLabel />
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">{t('settings.profile.notifications')}</Label>
                <p className="text-sm text-muted">{t('settings.profile.notificationsHint')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('notificationsEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 dark:peer-focus:ring-gold-500/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-500 dark:peer-checked:bg-gold-500"></div>
              </label>
            </div>

            {isDirty && (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit(onSubmit)}
                isLoading={updateProfileMutation.isPending}
              >
                {t('common.save')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
