import { useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSupportRequestSchema, CreateSupportRequestDto } from '@shipit/validators';
import { supportService } from '../../services/support.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

interface SupportPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

export function SupportPopover({ isOpen, onClose, collapsed }: SupportPopoverProps) {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSupportRequestDto>({
    resolver: zodResolver(createSupportRequestSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: supportService.createSupportRequest,
    onSuccess: () => {
      toast.success(t('support.success'));
      reset();
      onClose();
    },
    onError: () => {
      toast.error(t('support.error'));
    },
  });

  const onSubmit = (data: CreateSupportRequestDto) => {
    mutation.mutate(data);
  };

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={cn(
        'absolute bottom-full mb-2 dropdown-surface overflow-hidden animate-fade-in z-50 w-80',
        collapsed ? 'left-0' : 'left-0 right-0',
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t('support.title')}</h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-500"
            aria-label={t('common.cancel')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('support.description')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="support-subject">{t('support.subject')}</Label>
            <Input
              id="support-subject"
              type="text"
              placeholder={t('support.subjectPlaceholder')}
              error={errors.subject?.message}
              {...register('subject')}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="support-message">{t('support.message')}</Label>
            <textarea
              id="support-message"
              rows={4}
              placeholder={t('support.messagePlaceholder')}
              className={cn(
                'input-field w-full font-sans text-base focus:outline-none focus:ring-2 resize-none',
                errors.message && 'border-error focus:border-error focus:ring-error/20',
              )}
              {...register('message')}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={mutation.isPending}
              className="flex-1"
            >
              {t('support.send')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
