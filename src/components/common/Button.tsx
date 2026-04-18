// src/components/Shared/Button.tsx
// Generic button component extending native button props.
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-sys-accent text-white shadow-[0_8px_20px_rgba(255,107,44,0.28)] hover:bg-sys-accent-light active:bg-sys-accent-dark',
    secondary:
        'border border-sys-border bg-sys-bg-secondary text-sys-text-primary hover:border-sys-border/90 hover:bg-sys-bg-tertiary active:bg-sys-bg-elevated',
    ghost: 'text-sys-text-secondary hover:bg-sys-bg-secondary hover:text-sys-text-primary',
    danger: 'bg-sys-error text-white hover:brightness-110 active:brightness-95',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 text-sm sm:h-11',
    lg: 'h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            className = '',
            children,
            disabled,
            ...rest
        },
        ref,
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`inline-flex w-auto min-w-[2.5rem] items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sys-bg-primary disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
                {...rest}
            >
                {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    },
);

Button.displayName = 'Button';
