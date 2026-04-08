// src/components/Shared/Input.tsx
// Generic input with forwardRef + useId for accessibility.
import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string | undefined;
    error?: string | undefined;
    helperText?: string | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id: externalId, ...rest }, ref) => {
        const generatedId = useId();
        const id = externalId ?? generatedId;
        const errorId = `${id}-error`;
        const helperId = `${id}-helper`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="mb-1 block text-sm font-medium text-sys-text-primary"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : helperText ? helperId : undefined}
                    className={`w-full rounded-lg border bg-sys-bg-primary px-4 py-2.5 text-sm text-sys-text-primary placeholder:text-sys-text-secondary focus:outline-none focus:ring-2 focus:ring-sys-accent ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-sys-border'
                        } ${className}`}
                    {...rest}
                />
                {error && (
                    <p id={errorId} className="mt-1 text-xs text-red-400">
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p id={helperId} className="mt-1 text-xs text-sys-text-secondary">
                        {helperText}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';
