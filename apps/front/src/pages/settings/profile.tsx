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

  const watchedLanguage = watch('language');
  const watchedNotifications = watch('notificationsEnabled');

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => usersService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

          {/* Personal Info Section */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-6 text-foreground">
              {t('settings.profile.personalInfo')}
            </h2>

            <div className="space-y-4">
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
            </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('settings.profile.theme')}</Label>
                </div>
                <ThemeToggle showLabel />
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">{t('settings.profile.notifications')}</Label>
                  <p className="text-sm text-muted">{t('settings.profile.notificationsHint')}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setValue('notificationsEnabled', !watchedNotifications, { shouldDirty: true })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 ${
                    watchedNotifications ? 'bg-gold-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      watchedNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Single Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!isDirty}
              isLoading={updateProfileMutation.isPending}
              className="px-8"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
