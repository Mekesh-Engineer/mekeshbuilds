import { useId, useMemo } from 'react';
import { motion } from 'framer-motion';

export interface CategoryTabItem {
    id: string;
    label: string;
    count?: number;
}

export interface CategoryTabProps {
    categories: CategoryTabItem[];
    active: string;
    onChange: (id: string) => void;
    ariaLabel?: string;
    className?: string;
}

const HOVER_EASE = [0.22, 1, 0.36, 1] as const;

export default function CategorySegmentedTabs({
    categories,
    active,
    onChange,
    ariaLabel = 'Categories',
    className = '',
}: CategoryTabProps) {
    const layoutSeed = useId();

    const activeIndex = useMemo(
        () => categories.findIndex((category) => category.id === active),
        [categories, active],
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (categories.length === 0) return;

        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % categories.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + categories.length) % categories.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = categories.length - 1;

        if (nextIndex !== index) {
            event.preventDefault();
            onChange(categories[nextIndex]!.id);
        }
    };

    if (categories.length === 0) return null;

    return (
        <motion.div
            initial="rest"
            animate="rest"
            whileHover="hover"
            className={`group relative isolate w-full overflow-x-auto touch-pan-x rounded-full p-1 [&::-webkit-scrollbar]:hidden ${className}`}
            style={{
                scrollbarWidth: 'none',
                border: '1px solid color-mix(in srgb, var(--sys-border) 65%, transparent)',
                background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--sys-bg-primary) 92%, white 8%) 0%, color-mix(in srgb, var(--sys-bg-secondary) 94%, white 6%) 100%)',
                backdropFilter: 'blur(22px) saturate(170%)',
                boxShadow:
                    '0 12px 36px color-mix(in srgb, var(--sys-bg-primary) 42%, black 58%), inset 0 1px 0 color-mix(in srgb, var(--sys-text-primary) 22%, transparent)',
            }}
            role="tablist"
            aria-label={ariaLabel}
            aria-orientation="horizontal"
        >
            {/* Inner Border / Glow ring */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[1px] rounded-full border"
                style={{ borderColor: 'color-mix(in srgb, var(--sys-border) 40%, transparent)' }}
            />

            {/* Hover Sweep Animation */}
            <motion.div
                aria-hidden="true"
                variants={{ rest: { x: '-140%', opacity: 0 }, hover: { x: '220%', opacity: 0.7 } }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-0 z-[1] -skew-x-12"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--sys-text-primary) 38%, transparent) 45%, transparent 100%)',
                }}
            />

            {/* Responsive Flex Container: 
              Using flex-auto ensures items grow proportionally to their natural content length,
              providing a tighter, more evenly spaced look without arbitrary stretching.
            */}
            <div className="relative z-10 flex w-max min-w-full flex-nowrap items-stretch gap-0.5 md:w-full">
                {categories.map((category, index) => {
                    const isActive = category.id === active;
                    return (
                        <div
                            key={category.id}
                            // Mobile: content-width buttons in one row with horizontal pan.
                            // Desktop: balanced equal-width segments for cleaner rhythm.
                            className="relative flex shrink-0 basis-auto min-w-[112px] md:min-w-0 md:flex-1 md:basis-0"
                        >
                            <motion.button
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                tabIndex={isActive ? 0 : -1}
                                title={category.label}
                                onClick={() => onChange(category.id)}
                                onKeyDown={(event) => handleKeyDown(event, index)}
                                whileHover={{ y: -1.5, scale: 1.01 }}
                                whileTap={{ y: 0, scale: 0.99 }}
                                transition={{ duration: 0.24, ease: HOVER_EASE }}
                                // Reduced padding to decrease overall button length while keeping it breathable
                                className="relative flex w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-[0.45rem] text-[0.74rem] font-semibold leading-none tracking-[0.01em] whitespace-nowrap transition-colors duration-200 sm:px-3 sm:text-[0.79rem]"
                                style={{
                                    color: isActive ? 'var(--sys-text-primary)' : 'var(--sys-text-secondary)',
                                }}
                            >
                                {/* Active State Background */}
                                {isActive && (
                                    <motion.span
                                        layoutId={`category-tabs-active-${layoutSeed}`}
                                        className="absolute inset-0 rounded-full"
                                        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.65 }}
                                        style={{
                                            background:
                                                'linear-gradient(135deg, color-mix(in srgb, var(--sys-accent) 72%, #ff8c52 28%) 0%, var(--sys-accent) 52%, color-mix(in srgb, var(--sys-accent) 76%, #ff6b2c 24%) 100%)',
                                            boxShadow:
                                                '0 12px 28px color-mix(in srgb, var(--sys-accent) 50%, transparent), inset 0 1px 0 rgba(255,255,255,0.32)',
                                        }}
                                    />
                                )}

                                {/* Label: stays on one line and truncates gracefully when space is constrained */}
                                <span className="relative z-10 max-w-full truncate text-center">{category.label}</span>

                                {/* Count Badge */}
                                {typeof category.count === 'number' && (
                                    <span
                                        className="relative z-10 inline-flex items-center justify-evenly gap-2 rounded-full pl-3 pr-2 py-1.5 text-[16px] font-semibold w-fit"
                                        style={{
                                            color: isActive ? 'var(--sys-text-primary)' : 'color-mix(in srgb, var(--sys-text-secondary) 86%, transparent)',
                                            background: isActive
                                                ? 'color-mix(in srgb, black 22%, transparent)'
                                                : 'color-mix(in srgb, var(--sys-bg-primary) 30%, transparent)',
                                            border: isActive
                                                ? '1px solid color-mix(in srgb, white 30%, transparent)'
                                                : '1px solid color-mix(in srgb, var(--sys-border) 70%, transparent)',
                                        }}
                                    >
                                        {category.count}
                                    </span>
                                )}
                            </motion.button>

                            {/* Separator Line */}
                            {index < categories.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-0 top-1/2 h-[50%] w-px -translate-y-1/2"
                                    style={{
                                        background:
                                            'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--sys-border) 82%, transparent), transparent)',
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Ambient Group Hover Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-[5px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(62% 95% at 50% 50%, color-mix(in srgb, var(--sys-accent) 20%, transparent) 0%, transparent 72%)',
                }}
            />

            {/* Accessibility Announcement */}
            <span className="sr-only">Active category: {categories[activeIndex]?.label ?? 'None'}</span>
        </motion.div>
    );
}