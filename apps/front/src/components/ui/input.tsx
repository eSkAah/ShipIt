import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseStyles = 'input-field font-sans text-base focus:outline-none focus:ring-2';

    const errorStyles = error ? 'border-error focus:border-error focus:ring-error/20' : '';

    return <input ref={ref} className={`${baseStyles} ${errorStyles} ${className}`} {...props} />;
  },
);

Input.displayName = 'Input';
