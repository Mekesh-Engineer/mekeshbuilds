import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: string;
    error?: string | undefined;
    rightSlot?: ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, icon, error, rightSlot, className = '', id: externalId, ...rest }, ref) => {
        const generatedId = useId();
        const inputId = externalId ?? generatedId;
        const errorId = `${inputId}-error`;
        const hasError = Boolean(error);

        return (
            <div className="flex w-full flex-col gap-1.5">
                <label htmlFor={inputId} className="text-[13px] font-semibold text-sys-text-primary sm:text-sm">
                    {label}
                </label>
                <div className="relative flex w-full items-center">
                    {icon && (
                        <span className="material-icons-round pointer-events-none absolute left-3.5 select-none text-[18px] text-sys-text-secondary">
                            {icon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? errorId : undefined}
                        className={`h-11 w-full rounded-xl border bg-sys-bg-tertiary text-[14px] text-sys-text-primary placeholder:text-sys-text-secondary/70 outline-none sm:h-12 sm:text-[15px] ${icon ? 'pl-11 pr-11' : rightSlot ? 'pl-4 pr-11' : 'px-4'
                            } ${hasError
                                ? 'border-sys-error focus-visible:border-sys-error focus-visible:ring-sys-error/25'
                                : 'border-sys-border focus-visible:border-sys-accent focus-visible:ring-sys-accent/30'
                            } ${className}`}
                        {...rest}
                    />
                    {rightSlot && <div className="absolute right-2.5">{rightSlot}</div>}
                </div>
                <AnimatePresence>
                    {error && (
                        <motion.p
                            id={errorId}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.22 }}
                            className="flex items-center gap-1.5 text-[12px] font-medium text-sys-error"
                            role="alert"
                        >
                            <span className="material-icons-round text-[13px]">error_outline</span>
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
