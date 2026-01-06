import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface HoldToDeleteButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  holdDuration?: number;
  children: React.ReactNode;
  className?: string;
}

export function HoldToDeleteButton({
  onConfirm,
  disabled = false,
  isLoading = false,
  holdDuration = 3000,
  children,
  className,
}: HoldToDeleteButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
    setProgress(newProgress);

    if (newProgress >= 100) {
      setIsUnlocked(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [holdDuration]);

  const handleMouseEnter = useCallback(() => {
    if (disabled || isLoading || isUnlocked) return;

    setIsHovering(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(updateProgress, 16);
  }, [disabled, isLoading, isUnlocked, updateProgress]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;

    if (!isUnlocked) {
      setProgress(0);
    }
  }, [isUnlocked]);

  const handleClick = useCallback(() => {
    if (isUnlocked && !disabled && !isLoading) {
      onConfirm();
    }
  }, [isUnlocked, disabled, isLoading, onConfirm]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || isLoading}
      className={cn(
        'relative overflow-hidden rounded-full px-4 h-10 font-semibold transition-all duration-300',
        'border-2',
        isUnlocked
          ? 'bg-red-500 text-white border-red-500 cursor-pointer hover:bg-red-600'
          : 'bg-transparent text-red-500 border-red-500/50 cursor-default',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      aria-label={
        isUnlocked ? 'Click to delete' : `Hold for ${holdDuration / 1000} seconds to enable delete`
      }
    >
      {/* Progress bar background */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 bg-red-500/30 transition-opacity duration-100',
          isHovering && !isUnlocked ? 'opacity-100' : 'opacity-0',
        )}
        style={{ width: `${progress}%` }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
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
        ) : null}
        {children}
      </span>
    </button>
  );
}
