import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'input-field font-sans text-base focus:outline-none focus:ring-2',
          error && 'border-error focus:border-error focus:ring-error/20',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
