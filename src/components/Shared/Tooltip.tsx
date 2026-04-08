// src/components/Shared/Tooltip.tsx
// Simple CSS tooltip using title attribute + hover styles.

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
    text,
    children,
    position = 'top',
}) => {
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="group relative inline-flex">
            {children}
            <div
                className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-sys-bg-tertiary px-2.5 py-1.5 text-xs text-sys-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100 ${positionClasses[position]}`}
                role="tooltip"
            >
                {text}
            </div>
        </div>
    );
};
