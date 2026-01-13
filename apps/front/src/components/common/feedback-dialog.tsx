import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createFeedbackSchema, CreateFeedbackDto } from '@shipit/validators';
import { feedbackService } from '../../services/feedback.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Bug, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<'bug' | 'help'>('bug');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateFeedbackDto>({
    resolver: zodResolver(createFeedbackSchema),
    defaultValues: {
      type: 'bug',
      subject: '',
      message: '',
    },
  });

  const submitMutation = useMutation({
    mutationFn: feedbackService.submitFeedback,
    onSuccess: () => {
      toast.success(t('feedback.submitSuccess'));
      reset();
      onClose();
    },
    onError: () => {
      toast.error(t('feedback.submitError'));
    },
  });

  const onSubmit = (data: CreateFeedbackDto) => {
    submitMutation.mutate(data);
  };

  const handleTypeChange = (type: 'bug' | 'help') => {
    setSelectedType(type);
    setValue('type', type);
  };

  const handleClose = () => {
    reset();
    setSelectedType('bug');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      <div className="relative glass-card shadow-card w-full max-w-lg p-6 mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{t('feedback.title')}</h2>
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

        <p className="text-sm text-muted mb-6">{t('feedback.description')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Type Selection */}
          <div>
            <Label className="mb-3 block">{t('feedback.type')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('bug')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300',
                  selectedType === 'bug'
                    ? 'border-gold-500 bg-gold-500/10 dark:bg-gold-500/15'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300',
                    selectedType === 'bug'
                      ? 'bg-gold-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500',
                  )}
                >
                  <Bug className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      selectedType === 'bug'
                        ? 'text-gold-600 dark:text-gold-400'
                        : 'text-gray-700 dark:text-gray-300',
                    )}
                  >
                    {t('feedback.types.bug')}
                  </p>
                  <p className="text-xs text-muted">{t('feedback.types.bugDescription')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('help')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300',
                  selectedType === 'help'
                    ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/15'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300',
                    selectedType === 'help'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500',
                  )}
                >
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      selectedType === 'help'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300',
                    )}
                  >
                    {t('feedback.types.help')}
                  </p>
                  <p className="text-xs text-muted">{t('feedback.types.helpDescription')}</p>
                </div>
              </button>
            </div>
            <input type="hidden" {...register('type')} />
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">{t('feedback.subject')}</Label>
            <Input
              id="subject"
              placeholder={t('feedback.subjectPlaceholder')}
              error={errors.subject?.message}
              {...register('subject')}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">{t('feedback.message')}</Label>
            <Textarea
              id="message"
              placeholder={t('feedback.messagePlaceholder')}
              error={errors.message?.message}
              className="min-h-[140px]"
              {...register('message')}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitMutation.isPending}
              className="flex-1"
            >
              {t('feedback.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
