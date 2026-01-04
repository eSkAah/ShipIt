import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseStyles =
      'w-full rounded-input border px-4 py-2 font-sans text-base transition-all duration-300 focus:outline-none focus:ring-2';

    const errorStyles = error
      ? 'border-error focus:border-error focus:ring-error/20'
      : 'border-gray-300 focus:border-gold-500 focus:ring-gold-500/20';

    return <input ref={ref} className={`${baseStyles} ${errorStyles} ${className}`} {...props} />;
  },
);

Input.displayName = 'Input';
