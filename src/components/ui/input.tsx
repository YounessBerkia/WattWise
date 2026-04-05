'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

/**
 * Input component with label and error state
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="space-y-2.5">
        {label && (
          <label htmlFor={inputId} className="text-text block text-sm font-medium tracking-tight">
            {label}
            {props.required && <span className="text-critical ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-2xl border px-4 py-3 text-[15px]',
            'text-text bg-white/78 shadow-sm dark:bg-white/8',
            'border-white/65 dark:border-white/10',
            'placeholder:text-text-secondary/75',
            'focus-visible:border-primary/40 focus-visible:bg-white dark:focus-visible:bg-white/10',
            'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:ring-primary/10 focus-visible:ring-4',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-300',
            error &&
              'border-critical/60 focus-visible:border-critical focus-visible:outline-critical focus-visible:ring-critical/10',
            className,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-critical text-sm">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
