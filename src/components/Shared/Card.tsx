// src/components/Shared/Card.tsx
// Reusable card container.
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
    children,
    padding = 'md',
    className = '',
    ...rest
}) => {
    return (
        <div
            className={`rounded-xl border border-sys-border bg-sys-bg-secondary ${paddingClasses[padding]} ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
};
