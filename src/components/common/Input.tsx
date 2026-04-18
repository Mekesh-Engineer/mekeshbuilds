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
                    className={`w-full rounded-lg border bg-sys-bg-tertiary px-4 text-sm text-sys-text-primary placeholder:text-sys-text-secondary/70 focus:outline-none focus-visible:ring-2 sm:text-[15px] ${error
                        ? 'border-sys-error focus-visible:border-sys-error focus-visible:ring-sys-error/25'
                        : 'border-sys-border'
                        } h-11 sm:h-12 ${className}`}
                    {...rest}
                />
                {error && (
                    <p id={errorId} className="mt-1 text-xs text-sys-error">
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
