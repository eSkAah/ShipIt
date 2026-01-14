import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'input-field font-sans text-base focus:outline-none focus:ring-2 min-h-[120px] resize-y',
          error && 'border-error focus:border-error focus:ring-error/20',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
