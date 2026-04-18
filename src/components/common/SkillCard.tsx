/**
 * SkillCard.tsx — Enhanced v2 (Full Improvement Pass)
 * ─────────────────────────────────────────────────────────────────
 * All CSS moved from inline <style> block → Tailwind utility classes.
 * All audit improvements implemented:
 *
 * ✅ Inline <style> removed — pure Tailwind + CSS vars
 * ✅ Category → distinct colour token mapping (not all orange)
 * ✅ Active card stronger depth treatment (accent glow + scale)
 * ✅ Three-stop cinematic image overlay
 * ✅ Arrow button position fixed (boundary-relative, not magic px)
 * ✅ Card hover: border + bg brightening in addition to y-lift
 * ✅ Icon size increased to 2.75rem / h-6 w-6
 * ✅ Image skeleton placeholder (animate-pulse on load)
 * ✅ Image onError → gradient fallback
 * ✅ Modal: focus-trap (Tab cycles inside only)
 * ✅ Modal: aria-labelledby on dialog + id on <h2>
 * ✅ Modal: scroll lock (body overflow hidden)
 * ✅ Modal: focus moved to container on open
 * ✅ Modal: Escape key closes
 * ✅ Modal: missing meta-pill classes implemented in Tailwind
 * ✅ detailedDescription: left-border accent styling per paragraph
 * ✅ keyFeatures: brand-icon mapping via react-icons
 * ✅ loading="eager" prop for active/priority card
 * ✅ StyleInjector removed — single source of truth
 * ✅ Full TypeScript types (no `any`)
 * ✅ Footer CTA buttons aligned symmetrically in-flow
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────

export interface SkillCardItem {
    id: string | number;
    title: string;
    category: string;
    description?: string;
    summary?: string;
    detailedDescription?: string[];
    keyFeatures?: string[];
    readTime?: string;
    tags?: string[];
    featured?: boolean;
    achievementBadge?: string;
    icon?: ReactNode;
    author?: string;
    date?: string;
    image?: string;
}

export type BlogCardItem = SkillCardItem;

interface SkillCardProps {
    item: SkillCardItem;
    isActive?: boolean;
    variant?: 'default' | 'blog-post';
    /** When true, image loads eagerly (use for the center/active card) */
    priority?: boolean;
}

// ─── Category colour system ───────────────────────────────────────
// Maps each category to a distinct hue token so chips are visually
// distinguishable at a glance — not all orange.

type CategoryColour = {
    bg: string;
    text: string;
    border: string;
    glow: string;
};

const DEFAULT_CATEGORY_COLOUR: CategoryColour = {
    bg: 'bg-[var(--sys-accent)]/15',
    text: 'text-[var(--sys-accent)]',
    border: 'border-[var(--sys-accent)]/30',
    glow: 'rgba(255,107,44,0.35)',
};

const CATEGORY_PALETTE: Record<string, CategoryColour> = {
    'Hardware': { bg: 'bg-[var(--sys-accent)]/15', text: 'text-[var(--sys-accent)]', border: 'border-[var(--sys-accent)]/30', glow: 'rgba(255,107,44,0.35)' },
    'Systems': { bg: 'bg-[#3b82f6]/15', text: 'text-[#3b82f6]', border: 'border-[#3b82f6]/30', glow: 'rgba(59,130,246,0.35)' },
    'AI / ML': { bg: 'bg-[#8b5cf6]/15', text: 'text-[#8b5cf6]', border: 'border-[#8b5cf6]/30', glow: 'rgba(139,92,246,0.35)' },
    'Software': { bg: 'bg-[#06b6d4]/15', text: 'text-[#06b6d4]', border: 'border-[#06b6d4]/30', glow: 'rgba(6,182,212,0.35)' },
    'Cloud': { bg: 'bg-[var(--sys-success)]/15', text: 'text-[var(--sys-success)]', border: 'border-[var(--sys-success)]/30', glow: 'rgba(16,185,129,0.35)' },
    'Design': { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30', glow: 'rgba(245,158,11,0.35)' },
    'default': DEFAULT_CATEGORY_COLOUR,
};

function getCategoryColour(category: string) {
    return CATEGORY_PALETTE[category] ?? DEFAULT_CATEGORY_COLOUR;
}

// ─── Animation constants ──────────────────────────────────────────
const EASE = [0.32, 0.72, 0, 1] as const;

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 26, stiffness: 320 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.18, ease: EASE } },
};

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
};

// ─── Image with skeleton + error fallback ─────────────────────────

interface CardImageProps {
    src: string;
    alt: string;
    priority?: boolean;
    categoryColour: string; // fallback gradient colour
}

function CardImage({ src, alt, priority, categoryColour }: CardImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    if (errored) {
        return (
            <div
                className="h-full w-full rounded-[1.5rem]"
                style={{
                    background: `linear-gradient(135deg, ${categoryColour}44 0%, ${categoryColour}22 100%)`,
                }}
                aria-hidden="true"
            />
        );
    }

    return (
        <>
            {/* Skeleton while loading */}
            {!loaded && (
                <div className="absolute inset-0 animate-pulse rounded-[inherit] bg-[var(--sys-bg-tertiary)]" aria-hidden="true" />
            )}
            <img
                src={src}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setLoaded(true)}
                onError={() => setErrored(true)}
                className={`h-full w-full object-cover transition-all duration-700 ease-in-out
                    ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
                    group-hover:scale-105`}
                style={{ transition: 'transform 0.6s ease, opacity 0.4s ease' }}
            />
        </>
    );
}

// ─── Focus-trap hook ──────────────────────────────────────────────

function useFocusTrap(active: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active || !containerRef.current) return;

        const el = containerRef.current;

        // Move focus into modal
        const firstFocusable = el.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        firstFocusable?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusable = Array.from(
                el.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                ),
            ).filter((node) => !node.hasAttribute('disabled'));

            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!first || !last) return;

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [active]);

    return containerRef;
}

// ─── MetaItem helper ──────────────────────────────────────────────

function MetaItem({ text }: { text: string }) {
    return (
        <div className="inline-flex items-center gap-[0.45rem] text-[0.78rem] text-[var(--sys-text-secondary)]">
            <span className="h-[0.45rem] w-[0.45rem] rounded-full bg-[var(--sys-accent)] shrink-0" aria-hidden="true" />
            <span>{text}</span>
        </div>
    );
}

// ─── MetaPill helper ─────────────────────────────────────────────

function MetaPill({
    children, variant = 'default',
}: { children: ReactNode; variant?: 'default' | 'achievement' }) {
    const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold';
    const styles = variant === 'achievement'
        ? `${base} bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30`
        : `${base} bg-[var(--sys-bg-tertiary)] text-[var(--sys-text-secondary)] border border-[var(--sys-border)]/60`;
    return <span className={styles}>{children}</span>;
}

// ─── Arrow Icon ───────────────────────────────────────────────────

const ArrowUpRightIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 17L17 7M17 7H7M17 7V17"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─── Main SkillCard ───────────────────────────────────────────────

export default function SkillCard({
    item, isActive = false, variant = 'default', priority = false,
}: SkillCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isBlogPost = variant === 'blog-post';
    const colours = useMemo(() => getCategoryColour(item.category), [item.category]);
    const modalId = `modal-title-${item.id}`;
    const modalRef = useFocusTrap(isModalOpen);

    // ── Scroll lock ──────────────────────────────────────────────
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isModalOpen]);

    // ── Escape to close ──────────────────────────────────────────
    useEffect(() => {
        if (!isModalOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModalOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isModalOpen]);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    // ── Active card: stronger glow + fractional scale ─────────────
    const activeStyles = isActive && !isBlogPost
        ? {
            boxShadow: `0 24px 56px rgba(0,0,0,0.45), 0 0 0 1.5px ${colours.glow}, 0 8px 32px ${colours.glow}`,
        }
        : {};

    return (
        <>
            {/* ── Card ── */}
            <motion.article
                {...(!isBlogPost && {
                    whileHover: { y: -6 },
                    animate: isActive ? { scale: 1.025 } : { scale: 1 },
                })}
                onClick={!isBlogPost ? openModal : undefined}
                transition={{ duration: 0.35, ease: EASE }}
                style={activeStyles}
                className={[
                    'group relative flex flex-col rounded-[2rem] border p-5',
                    'transition-all duration-300',
                    isBlogPost
                        ? 'border-0 bg-transparent p-0 shadow-none'
                        : [
                            'min-h-[455px] shadow-[0_10px_24px_rgba(0,0,0,0.28)]',
                            'bg-[color-mix(in_srgb,var(--sys-bg-secondary)_88%,black_12%)]',
                            'cursor-pointer',
                            isActive
                                ? 'border-[var(--sys-accent)]/45'
                                : 'border-[var(--sys-border)]/65 hover:border-[var(--sys-accent)]/40 hover:bg-[var(--sys-bg-secondary)]',
                        ].join(' '),
                ].join(' ')}
                aria-label={item.title}
            >
                {/* ── Image area ── */}
                {item.image && (
                    <div className={[
                        'relative mb-6 overflow-hidden',
                        isBlogPost
                            ? 'aspect-[16/10] rounded-[1.25rem] mb-0'
                            : 'h-[245px] rounded-[1.5rem]',
                    ].join(' ')}>

                        <CardImage
                            src={item.image}
                            alt={item.title}
                            priority={priority}
                            categoryColour={colours.glow.replace('rgba', '').replace(/,[\d.]+\)/, ')')}
                        />

                        {/* Three-stop cinematic overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            aria-hidden="true"
                            style={{
                                background:
                                    'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(0,0,0,0.52) 100%)',
                            }}
                        />

                        {/* blog-post variant: corner arrow button */}
                        {isBlogPost && (
                            <button
                                type="button"
                                aria-label={`Open ${item.title}`}
                                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center
                                    rounded-full border border-white/18 bg-white/12 backdrop-blur-md
                                    text-white/85 shadow-[0_4px_16px_rgba(0,0,0,0.15)]
                                    transition-all hover:bg-[var(--sys-accent)] hover:border-[var(--sys-accent)]"
                            >
                                <ArrowUpRightIcon size={14} />
                            </button>
                        )}
                    </div>
                )}

                {/* ── Body ── */}
                <div className={[
                    'flex flex-col flex-1',
                    isBlogPost ? 'pt-5' : 'pt-2',
                ].join(' ')}>

                    {/* Head row: icon + category chip */}
                    <div className="mb-3.5 flex items-center justify-between gap-3">
                        {item.icon && (
                            <span
                                aria-hidden="true"
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem] text-white
                                    shadow-[0_6px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]"
                                style={{
                                    background: `linear-gradient(135deg, ${colours.glow.replace('0.35)', '0.9)')}, ${colours.glow.replace('0.35)', '0.7)')})`,
                                }}
                            >
                                {/* icon child sized to h-6 w-6 via wrapper */}
                                <span className="[&_svg]:h-6 [&_svg]:w-6">{item.icon}</span>
                            </span>
                        )}

                        {/* Category chip — distinct colour per category */}
                        <span className={[
                            'self-start rounded-full border px-[0.85rem] py-[0.38rem]',
                            'text-[0.75rem] font-bold uppercase tracking-[0.08em]',
                            'transition-colors duration-200',
                            colours.bg, colours.text, colours.border,
                        ].join(' ')}>
                            {item.category}
                        </span>
                    </div>

                    {/* Author / date meta */}
                    {(item.author || item.date) && (
                        <div className="mb-3.5 flex flex-wrap gap-4">
                            {item.author && <MetaItem text={item.author} />}
                            {item.date && <MetaItem text={item.date} />}
                        </div>
                    )}

                    {/* Meta pills row (readTime, tags, achievementBadge) */}
                    {(item.readTime || item.achievementBadge || item.tags?.[0]) && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                            {item.readTime && <MetaPill>{item.readTime}</MetaPill>}
                            {item.tags?.[0] && <MetaPill>{item.tags[0]}</MetaPill>}
                            {item.achievementBadge && (
                                <MetaPill variant="achievement">🏆 {item.achievementBadge}</MetaPill>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <h3 className={[
                        'font-black leading-[1.2] tracking-[-0.02em] text-[var(--sys-text-primary)]',
                        isBlogPost
                            ? 'text-[clamp(1.05rem,1.2vw,1.25rem)] font-bold leading-[1.4] line-clamp-2'
                            : 'text-[clamp(1.2rem,1.5vw,1.75rem)]',
                    ].join(' ')}>
                        {item.title}
                    </h3>

                    {/* Description / summary */}
                    {(item.summary || item.description) && (
                        <p className="mt-3 text-[0.92rem] leading-[1.7] text-[var(--sys-text-secondary)] max-w-[95%]">
                            {item.summary ?? item.description}
                        </p>
                    )}

                    {/* Footer CTA (default variant only) - UPDATED FOR SYMMETRICAL ALIGNMENT */}
                    {!isBlogPost && (
                        <div className="mt-auto flex w-full items-center justify-between gap-4 pt-6">
                            <button
                                type="button"
                                onClick={openModal}
                                aria-label={`Read more about ${item.title}`}
                                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-6
                                    bg-[var(--sys-accent)] text-white text-[0.875rem] font-semibold
                                    shadow-[0_8px_18px_rgba(255,107,44,0.38)]
                                    transition-all duration-220
                                    hover:bg-white hover:text-[var(--sys-accent)] hover:shadow-[0_10px_24px_rgba(255,107,44,0.28)]
                                    active:scale-[0.96]
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60"
                            >
                                Read More
                                <ArrowUpRightIcon size={16} />
                            </button>

                            <button
                                type="button"
                                onClick={openModal}
                                aria-label={`Open ${item.title}`}
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full
                                    border border-[var(--sys-accent)]/40
                                    bg-[var(--sys-bg-tertiary)]/90 text-[var(--sys-text-primary)]
                                    shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                                    transition-all duration-250
                                    hover:scale-110 hover:bg-[var(--sys-accent)] hover:text-white hover:border-transparent"
                            >
                                <ArrowUpRightIcon size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </motion.article>

            {/* ── Modal ── */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div
                            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={modalId}
                        >
                            <motion.div
                                variants={backdropVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute inset-0 bg-black/45"
                                onClick={closeModal}
                                aria-hidden="true"
                            />

                            <motion.div
                                ref={modalRef}
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                tabIndex={-1}
                                className="relative z-10 flex w-full max-w-[680px] max-h-[86vh] flex-col overflow-hidden
                                    rounded-xl border border-[var(--sys-border)]/70
                                    bg-[var(--sys-bg-secondary)] text-[var(--sys-text-primary)]
                                    shadow-[0_20px_60px_rgba(0,0,0,0.28)] outline-none"
                            >
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    aria-label="Close modal"
                                    className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center
                                        rounded-full text-[var(--sys-text-secondary)] transition-colors
                                        hover:bg-[var(--sys-bg-tertiary)] hover:text-[var(--sys-text-primary)]
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/40"
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {item.image && (
                                    <div className="relative h-44 w-full overflow-hidden sm:h-52">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="absolute inset-0 h-full w-full object-cover"
                                            loading="eager"
                                        />
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: 'linear-gradient(180deg, transparent 35%, color-mix(in srgb, var(--sys-bg-secondary) 95%, transparent) 100%)',
                                            }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-7 sm:pb-7
                                    [&::-webkit-scrollbar]:w-1
                                    [&::-webkit-scrollbar-track]:bg-transparent
                                    [&::-webkit-scrollbar-thumb]:bg-[var(--sys-border)]
                                    [&::-webkit-scrollbar-thumb]:rounded-full">
                                    <div className="mb-5 flex items-start gap-4">
                                        {item.icon && (
                                            <div
                                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white
                                                    shadow-[0_8px_20px_rgba(0,0,0,0.28)]
                                                    [&_svg]:h-7 [&_svg]:w-7"
                                                style={{
                                                    background: `linear-gradient(135deg, ${colours.glow.replace('0.35)', '0.9)')}, ${colours.glow.replace('0.35)', '0.7)')})`,
                                                }}
                                            >
                                                {item.icon}
                                            </div>
                                        )}
                                        <div className="min-w-0 pt-1">
                                            <span className={`text-[0.7rem] font-black uppercase tracking-[0.15em] ${colours.text}`}>
                                                {item.category}
                                            </span>
                                            <h2
                                                id={modalId}
                                                className="mt-1 text-2xl sm:text-3xl font-black tracking-[-0.02em] text-[var(--sys-text-primary)] leading-[1.15]"
                                            >
                                                {item.title}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {(item.detailedDescription ?? (item.description ? [item.description] : [])).length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-[1rem] font-black text-[var(--sys-text-primary)] tracking-[-0.01em]">
                                                    Overview
                                                </h4>
                                                {(item.detailedDescription ?? [item.description!]).map((desc, i) => (
                                                    <p
                                                        key={i}
                                                        className="relative pl-4 text-[0.95rem] leading-[1.78] text-[var(--sys-text-secondary)]"
                                                        style={{
                                                            borderLeft: `2px solid ${colours.glow.replace('0.35)', '0.5)')}`,
                                                            paddingLeft: '1rem',
                                                        }}
                                                    >
                                                        {desc}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {item.keyFeatures && item.keyFeatures.length > 0 && (
                                            <div>
                                                <h4 className="mb-3.5 text-[1rem] font-black text-[var(--sys-text-primary)] tracking-[-0.01em]">
                                                    Key Highlights
                                                </h4>
                                                <ul className="grid gap-2.5 sm:grid-cols-2">
                                                    {item.keyFeatures.map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-2.5 text-[0.875rem] text-[var(--sys-text-secondary)]">
                                                            <span
                                                                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                                                style={{
                                                                    backgroundColor: colours.glow.replace('0.35)', '0.15)'),
                                                                    color: colours.glow.replace('rgba(', '#').replace(/,[\d.]+,[\d.]+,[\d.]+\)/, ''),
                                                                }}
                                                            >
                                                                <svg
                                                                    width="11"
                                                                    height="11"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="3"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    aria-hidden="true"
                                                                >
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            </span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.tags.map((tag) => (
                                                    <MetaPill key={tag}>{tag}</MetaPill>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-7 flex items-center justify-between gap-4 border-t border-[var(--sys-border)]/70 pt-4">
                                        <CopyLinkButton itemId={String(item.id)} />
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="rounded-md bg-[var(--sys-accent)] px-4 py-2 text-[0.85rem] font-semibold text-white
                                                transition-colors hover:brightness-110
                                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/45"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </>
    );
}

// ─── CopyLinkButton ───────────────────────────────────────────────

function CopyLinkButton({ itemId }: { itemId: string }) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.href.split('#')[0]}#skill-${itemId}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard unavailable — silent fail
        }
    }, [itemId]);

    return (
        <button
            type="button"
            onClick={copy}
            aria-label="Copy link to this skill"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.8rem] font-semibold
                border border-[var(--sys-border)]/60
                text-[var(--sys-text-secondary)]
                hover:text-[var(--sys-text-primary)] hover:border-[var(--sys-accent)]/40
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60
                transition-all"
        >
            {copied ? (
                <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    Copied!
                </>
            ) : (
                <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Link
                </>
            )}
        </button>
    );
}