// src/components/Shared/Skeleton.tsx
// Shimmer loading placeholder.

interface SkeletonProps {
    width?: string;
    height?: string;
    rounded?: 'sm' | 'md' | 'lg' | 'full';
    className?: string;
}

const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
    width,
    height = '1rem',
    rounded = 'md',
    className = '',
}) => {
    return (
        <div
            className={`animate-pulse bg-sys-bg-tertiary ${roundedClasses[rounded]} ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
};
