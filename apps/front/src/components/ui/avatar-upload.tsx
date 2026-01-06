import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Trash2, User } from 'lucide-react';
import { Button } from './button';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  isUploading?: boolean;
  isDeleting?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function AvatarUpload({
  currentAvatarUrl,
  onUpload,
  onDelete,
  isUploading = false,
  isDeleting = false,
  size = 'lg',
}: AvatarUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t('settings.profile.avatar.invalidType');
      }
      if (file.size > MAX_SIZE) {
        return t('settings.profile.avatar.tooLarge');
      }
      return null;
    },
    [t],
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      try {
        await onUpload(file);
        setPreview(null); // Clear preview after successful upload
      } catch {
        setError(t('settings.profile.avatar.uploadError'));
        setPreview(null);
      }
    },
    [onUpload, validateFile, t],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDeleteClick = async () => {
    if (onDelete) {
      try {
        await onDelete();
        setPreview(null);
      } catch {
        setError(t('settings.profile.avatar.deleteError'));
      }
    }
  };

  const displayUrl = preview || currentAvatarUrl;
  const isLoading = isUploading || isDeleting;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar display/upload area */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden transition-all duration-300 ${
          dragActive ? 'ring-4 ring-gold-500 ring-offset-2' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Background/Avatar */}
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={t('settings.profile.avatar.alt')}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className={`${iconSizes[size]} text-gray-400`} />
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-white"
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
        {!isLoading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
            aria-label={t('settings.profile.avatar.change')}
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
        aria-label={t('settings.profile.avatar.selectFile')}
      />

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Camera className="w-4 h-4" />
          {t('settings.profile.avatar.change')}
        </Button>

        {currentAvatarUrl && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            {t('settings.profile.avatar.delete')}
          </Button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted text-center">{t('settings.profile.avatar.hint')}</p>
    </div>
  );
}
