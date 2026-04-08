// src/components/Shared/Avatar.tsx
// User avatar with fallback initials.

export interface AvatarProps {
    src?: string | null | undefined;
    alt?: string | undefined;
    size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
    fallback?: string | undefined;
    className?: string | undefined;
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
};

function getInitials(name?: string): string {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'Avatar',
    size = 'md',
    fallback,
    className = '',
}) => {
    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
            />
        );
    }

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-sys-accent font-semibold text-white ${sizeClasses[size]} ${className}`}
            aria-label={alt}
        >
            {getInitials(fallback ?? alt)}
        </div>
    );
};
