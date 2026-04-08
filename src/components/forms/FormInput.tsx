import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: string;
    error?: string | undefined;
    rightSlot?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, icon, error, rightSlot, ...rest }, ref) => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-semibold" style={{ color: 'var(--sys-text-primary)' }}>
                {label}
            </label>
            <div className="relative flex items-center w-full">
                {icon && (
                    <span
                        className="material-icons-round pointer-events-none absolute left-4 text-[18px] select-none"
                        style={{ color: 'var(--sys-text-secondary)' }}
                    >
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    {...rest}
                    style={{
                        width: '100%',
                        height: 48,
                        background: 'var(--sys-bg-tertiary)',
                        border: error ? '1.5px solid var(--sys-error)' : '1.5px solid var(--sys-border)',
                        borderRadius: 12,
                        padding: icon ? '0 44px 0 44px' : '0 16px',
                        fontSize: 15,
                        color: 'var(--sys-text-primary)',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => {
                        e.currentTarget.style.borderColor = error ? 'var(--sys-error)' : 'var(--sys-accent)';
                        e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.16)' : '0 0 0 3px rgba(255,107,44,0.18)';
                        if (rest.onFocus) rest.onFocus(e);
                    }}
                    onBlur={e => {
                        e.currentTarget.style.borderColor = error ? 'var(--sys-error)' : 'var(--sys-border)';
                        e.currentTarget.style.boxShadow = 'none';
                        if (rest.onBlur) rest.onBlur(e);
                    }}
                />
                {rightSlot && <div className="absolute right-3">{rightSlot}</div>}
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.22 }}
                        className="flex items-center gap-1.5 text-[12px] font-medium"
                        style={{ color: 'var(--sys-error)' }}
                        role="alert"
                    >
                        <span className="material-icons-round text-[13px]">error_outline</span>
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
);

FormInput.displayName = 'FormInput';
