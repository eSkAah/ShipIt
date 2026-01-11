import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './modal';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { HoldToDeleteButton } from './hold-to-delete-button';

export interface DangerConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  warningMessage?: string;
  confirmText: string;
  confirmPlaceholder?: string;
  isLoading?: boolean;
}

export function DangerConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  warningMessage,
  confirmText,
  confirmPlaceholder,
  isLoading = false,
}: DangerConfirmModalProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  const isTextMatch = inputValue.trim().toLowerCase() === confirmText.trim().toLowerCase();

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      setInputValue('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      showCloseButton={!isLoading}
    >
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-premium">
          <div className="shrink-0">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-500">{t('common.dangerAction')}</p>
            {warningMessage && (
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">{warningMessage}</p>
            )}
          </div>
        </div>

        {/* Confirmation Input */}
        <div>
          <Label htmlFor="confirm-input">{t('common.typeToConfirm', { text: confirmText })}</Label>
          <Input
            id="confirm-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmPlaceholder || confirmText}
            disabled={isLoading}
            autoComplete="off"
            autoFocus
          />
          {inputValue && !isTextMatch && (
            <p className="mt-1 text-sm text-red-500">{t('common.textMismatch')}</p>
          )}
        </div>

        {/* Hold to Delete Instructions */}
        <div className="text-center text-sm text-black/60 dark:text-white/60">
          <p>{t('common.holdToDeleteInstructions')}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <HoldToDeleteButton
            onConfirm={onConfirm}
            disabled={!isTextMatch}
            isLoading={isLoading}
            holdDuration={3000}
            className="flex-1"
          >
            {t('common.delete')}
          </HoldToDeleteButton>
        </div>
      </div>
    </Modal>
  );
}
