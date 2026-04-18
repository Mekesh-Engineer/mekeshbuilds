// src/components/Shared/Badge.tsx
// Small colored label / tag component.

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-sys-bg-tertiary text-sys-text-secondary',
    success: 'bg-green-500/15 text-green-400',
    warning: 'bg-yellow-500/15 text-yellow-400',
    danger: 'bg-red-500/15 text-red-400',
    info: 'bg-sys-accent/15 text-sys-accent',
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = '',
}) => {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    );
};
