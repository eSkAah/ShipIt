import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  error?: string;
  onChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, error, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full appearance-none rounded-input border px-4 py-2 pr-10
            bg-white dark:bg-gray-900
            text-foreground
            border-gray-300 dark:border-gray-700
            focus:border-purple-500 dark:focus:border-gold-500
            focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-gold-500/20
            focus:outline-none
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
            ${className}
          `}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    );
  },
);

Select.displayName = 'Select';
