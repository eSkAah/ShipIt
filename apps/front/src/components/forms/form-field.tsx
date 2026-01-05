import { forwardRef } from 'react';
import { Input, InputProps } from '../ui/input';
import { Label } from '../ui/label';

export interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input ref={ref} id={id} error={error} {...props} />
        {error && <p className="text-sm text-error animate-fade-in">{error}</p>}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
