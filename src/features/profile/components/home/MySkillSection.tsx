/**
 * MySkillSection.tsx — Enhanced v2 (Full Improvement Pass)
 * ─────────────────────────────────────────────────────────────────
 *  ✅ Pause-on-hover (interval clears on mouseenter, restarts on mouseleave)
 *  ✅ Accessible pause/play toggle button (WCAG 2.1 SC 2.2.2)
 *  ✅ Arrow-key navigation on dot tabs (←/→)
 *  ✅ Swipe gesture support via pointer events (no extra deps)
 *  ✅ normalizeCards — only pads if < 5 cards, no duplicate-key bugs
 *  ✅ getVariant fully typed — no `any`
 *  ✅ Visibility change pause (stops timer on hidden tab)
 *  ✅ Slider overflow fixed — container clips fan bleed
 *  ✅ Category filter tabs above the carousel
 *  ✅ useSkillCards hook — async-ready, Firestore-swappable
 *  ✅ StyleInjector removed — SkillCard uses pure Tailwind
 *  ✅ Priority="true" on active (slot 0) card for eager image load
 *  ✅ Tokens use var(--sys-*) not bg-sys-* raw classes
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { motion, type TargetAndTransition } from 'framer-motion';
import SkillCard, { type SkillCardItem } from '@/components/common/SkillCard';
import { DEFAULT_CARDS } from '@/data/useSkills';

interface ServicesSectionProps {
    cards?: SkillCardItem[];
}

// ─── Constants ────────────────────────────────────────────────────

const EASE = [0.32, 0.72, 0, 1] as const;
const AUTO_ADVANCE_MS = 1000;
const MIN_FAN_CARDS = 5; // minimum unique items before we duplicate

// ─── Custom hook: skill cards with async-ready structure ──────────
// Drop-in for future Firestore hydration — swap body for a useQuery.

function useSkillCards(inputCards?: SkillCardItem[]) {
    const [cards, setCards] = useState<SkillCardItem[]>(inputCards ?? DEFAULT_CARDS);

    // If a parent passes new cards, sync them
    useEffect(() => {
        if (inputCards && inputCards.length > 0) {
            setCards(inputCards);
        }
    }, [inputCards]);

    return { cards };
}

// ─── normalizeCards — no duplicate-key bugs ───────────────────────
// Only pads if input has fewer than MIN_FAN_CARDS unique items.
// Otherwise returns the input as-is with guaranteed unique id suffixes.

function normalizeCards(inputCards: SkillCardItem[]): SkillCardItem[] {
    if (inputCards.length === 0) return [];

    const targetCount = inputCards.length >= MIN_FAN_CARDS
        ? inputCards.length
        : MIN_FAN_CARDS;

    return Array.from({ length: targetCount }, (_, i) => {
        const source = inputCards[i % inputCards.length]!;
        return { ...source, id: `${source.id}__${i}` };
    });
}

// ─── getCircularOffset ────────────────────────────────────────────

function getCircularOffset(index: number, activeIndex: number, total: number): number {
    const delta = (index - activeIndex + total) % total;
    const normalized = delta > total / 2 ? delta - total : delta;
    if (normalized < -2 || normalized > 2) return 3;
    return normalized;
}

// ─── getVariant — fully typed ─────────────────────────────────────

function getVariant(slot: number, isMobile: boolean): TargetAndTransition {
    // Hidden
    if (slot === 3) return { x: '-50%', scale: 0.5, rotate: 0, opacity: 0, zIndex: 1 };

    if (isMobile) {
        if (slot === 2 || slot === -2)
            return { x: '-50%', scale: 0.65, rotate: 0, opacity: 0, zIndex: 1 };
        if (slot === 1)
            return { x: 'calc(-50% + 108px)', scale: 0.82, rotate: 5, opacity: 0.38, zIndex: 6 };
        if (slot === -1)
            return { x: 'calc(-50% - 108px)', scale: 0.82, rotate: -5, opacity: 0.38, zIndex: 6 };
    }

    const MAP: Record<number, TargetAndTransition> = {
        0: { x: '-50%', scale: 1, rotate: 0, opacity: 1, zIndex: 7 },
        1: { x: 'calc(-50% + 280px)', scale: 0.88, rotate: 8, opacity: 0.60, zIndex: 6 },
        2: { x: 'calc(-50% + 540px)', scale: 0.74, rotate: 14, opacity: 0.18, zIndex: 5 },
        [-1]: { x: 'calc(-50% - 280px)', scale: 0.88, rotate: -8, opacity: 0.60, zIndex: 6 },
        [-2]: { x: 'calc(-50% - 540px)', scale: 0.74, rotate: -14, opacity: 0.18, zIndex: 5 },
    };

    return MAP[slot] ?? { x: '-50%', scale: 0.5, rotate: 0, opacity: 0, zIndex: 1 };
}

// ─── Category filter chip ─────────────────────────────────────────

function FilterChip({
    label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-full px-4 py-1.5 text-[0.78rem] font-bold uppercase tracking-[0.1em]',
                'border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60',
                active
                    ? 'bg-[var(--sys-accent)] border-[var(--sys-accent)] text-white shadow-[0_4px_14px_rgba(255,107,44,0.35)]'
                    : 'bg-transparent border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)] hover:border-[var(--sys-accent)]/50 hover:text-[var(--sys-text-primary)]',
            ].join(' ')}
        >
            {label}
        </button>
    );
}

// ─── Pause/Play icon ──────────────────────────────────────────────

function PauseIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
    );
}

function PlayIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5 3l14 9-14 9V3z" />
        </svg>
    );
}

// ─── Main Section ─────────────────────────────────────────────────

export default function MySkillSection({ cards: inputCards }: ServicesSectionProps) {
    const { cards: rawCards } = useSkillCards(inputCards);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('All');

    // Pointer-event swipe tracking
    const swipeStartX = useRef<number | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Responsive detection ──────────────────────────────────────
    useEffect(() => {
        const handle = () => setIsMobile(window.innerWidth < 1024);
        handle();
        window.addEventListener('resize', handle);
        return () => window.removeEventListener('resize', handle);
    }, []);

    // ── Derived category list for filter ─────────────────────────
    const categories = useMemo(() => {
        const unique = ['All', ...new Set(rawCards.map((c) => c.category))];
        return unique;
    }, [rawCards]);

    // ── Filtered cards (reset index on filter change) ─────────────
    const filteredRaw = useMemo(() => {
        if (activeFilter === 'All') return rawCards;
        return rawCards.filter((c) => c.category === activeFilter);
    }, [rawCards, activeFilter]);

    const visibleCards = useMemo(() => normalizeCards(filteredRaw), [filteredRaw]);

    useEffect(() => {
        setActiveIndex(0);
    }, [activeFilter]);

    // ── Auto-advance interval ─────────────────────────────────────
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (visibleCards.length < 2) return;

        timerRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % visibleCards.length);
        }, AUTO_ADVANCE_MS);
    }, [visibleCards.length]);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isPaused) {
            startTimer();
        } else {
            stopTimer();
        }
        return stopTimer;
    }, [isPaused, startTimer, stopTimer]);

    // ── Pause on hidden tab (visibilitychange) ────────────────────
    useEffect(() => {
        const handler = () => {
            if (document.hidden) stopTimer();
            else if (!isPaused) startTimer();
        };
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    }, [isPaused, startTimer, stopTimer]);

    // ── Navigation helpers ────────────────────────────────────────
    const goTo = useCallback((i: number) => {
        setActiveIndex(((i % visibleCards.length) + visibleCards.length) % visibleCards.length);
    }, [visibleCards.length]);

    const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
    const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

    // ── Swipe gestures ────────────────────────────────────────────
    const onPointerDown = useCallback((e: React.PointerEvent) => {
        swipeStartX.current = e.clientX;
    }, []);

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        if (swipeStartX.current === null) return;
        const delta = e.clientX - swipeStartX.current;
        swipeStartX.current = null;
        if (Math.abs(delta) < 40) return; // not a real swipe
        if (delta < 0) next(); else prev();
    }, [next, prev]);

    // ── Dot keyboard navigation (←/→) ────────────────────────────
    const onDotKeyDown = useCallback((e: React.KeyboardEvent, i: number) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(i + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(i - 1); }
        if (e.key === 'Home') { e.preventDefault(); goTo(0); }
        if (e.key === 'End') { e.preventDefault(); goTo(visibleCards.length - 1); }
    }, [goTo, visibleCards.length]);

    if (visibleCards.length === 0) return null;

    return (
        <section
            className="relative overflow-hidden pt-[72px] pb-[64px] bg-[var(--sys-bg-primary)]"
            aria-label="Core Skills"
        >
            {/* ── Ambient background glows ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 15%, var(--sys-accent) 0%, transparent 34%),
                        radial-gradient(circle at 80% 85%, var(--sys-accent) 0%, transparent 28%)
                    `,
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[-110px] top-[18px] h-[360px] w-[250px] rounded-full blur-[90px]"
                style={{ background: 'radial-gradient(circle at 30% 40%, rgba(255,107,44,0.28) 0%, transparent 72%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-90px] bottom-[24px] h-[320px] w-[230px] rounded-full blur-[80px]"
                style={{ background: 'radial-gradient(circle at 70% 60%, rgba(245,160,90,0.24) 0%, transparent 72%)' }}
            />

            <div className="relative z-10 mx-auto max-w-[80rem] px-6 lg:px-12 w-full">

                {/* ── Section header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="mb-6 flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between"
                >
                    <div>
                        <motion.p
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="m-0 mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[var(--sys-accent)]"
                        >
                            What I offer
                        </motion.p>
                        <h2 className="m-0 text-[clamp(2.1rem,3.8vw,3.45rem)] font-black leading-[1.05] tracking-[-0.02em] text-[var(--sys-text-primary)]">
                            Core <span className="text-[var(--sys-accent)]">Skills</span>
                        </h2>
                    </div>

                    <p className="m-0 max-w-[31rem] text-[0.94rem] leading-[1.75] text-[var(--sys-text-secondary)] md:text-right">
                        A 3D-immersive skill showcase blending embedded systems, automation, AI, and full-stack
                        engineering into one unified experience.
                    </p>
                </motion.div>

                {/* ── Category filter tabs ── */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.45, ease: EASE }}
                    className="mb-8 flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filter skills by category"
                >
                    {categories.map((cat) => (
                        <FilterChip
                            key={cat}
                            label={cat}
                            active={activeFilter === cat}
                            onClick={() => setActiveFilter(cat)}
                        />
                    ))}
                </motion.div>

                {/* ── Fan slider ── */}
                <div
                    ref={sliderRef}
                    className="relative mt-9 h-[540px] lg:h-[600px] w-full overflow-hidden"
                    role="region"
                    aria-live="polite"
                    aria-label="Skills carousel"
                    aria-roledescription="carousel"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerCancel={() => { swipeStartX.current = null; }}
                >
                    {visibleCards.map((card, index) => {
                        const slot = getCircularOffset(index, activeIndex, visibleCards.length);
                        const isHidden = slot === 3;
                        const isCenter = slot === 0;

                        return (
                            <motion.article
                                key={card.id}
                                aria-hidden={isHidden}
                                aria-roledescription="slide"
                                aria-label={`Skill ${index + 1} of ${visibleCards.length}: ${card.title}`}
                                className={[
                                    'absolute left-1/2 top-0 w-[min(430px,90vw)] origin-center',
                                    isHidden ? 'pointer-events-none' : '',
                                ].join(' ')}
                                animate={getVariant(slot, isMobile)}
                                transition={{ type: 'spring', stiffness: 92, damping: 18, mass: 0.85 }}
                            >
                                <SkillCard
                                    item={card}
                                    isActive={isCenter}
                                    priority={isCenter}
                                />
                            </motion.article>
                        );
                    })}
                </div>

                {/* ── Controls row: dots + pause + arrows ── */}
                <div className="mt-6 flex items-center justify-center gap-4">
                    {/* Prev arrow */}
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous skill"
                        className="w-8 h-8 flex items-center justify-center rounded-full
                            border border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)]
                            hover:border-[var(--sys-accent)]/50 hover:text-[var(--sys-accent)]
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60
                            transition-all"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    {/* Dot pagination */}
                    <div
                        ref={dotsRef}
                        role="tablist"
                        aria-label="Select skill card"
                        className="flex gap-2"
                    >
                        {visibleCards.map((card, index) => {
                            const isActive = activeIndex === index;
                            return (
                                <button
                                    key={card.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-label={`Go to slide ${index + 1}: ${card.title}`}
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={() => goTo(index)}
                                    onKeyDown={(e) => onDotKeyDown(e, index)}
                                    type="button"
                                    className={[
                                        'h-2.5 rounded-full border-none transition-all duration-250 ease-in-out',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60',
                                        isActive
                                            ? 'w-7 bg-[var(--sys-accent)]'
                                            : 'w-2.5 bg-white/30 hover:bg-white/50',
                                    ].join(' ')}
                                />
                            );
                        })}
                    </div>

                    {/* Pause / Play toggle (WCAG 2.2.2) */}
                    <button
                        type="button"
                        onClick={() => setIsPaused((v) => !v)}
                        aria-label={isPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
                        aria-pressed={isPaused}
                        className={[
                            'w-8 h-8 flex items-center justify-center rounded-full border transition-all',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60',
                            isPaused
                                ? 'border-[var(--sys-accent)]/60 text-[var(--sys-accent)] bg-[var(--sys-accent)]/10'
                                : 'border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)] hover:border-[var(--sys-accent)]/50 hover:text-[var(--sys-accent)]',
                        ].join(' ')}
                    >
                        {isPaused ? <PlayIcon /> : <PauseIcon />}
                    </button>

                    {/* Next arrow */}
                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next skill"
                        className="w-8 h-8 flex items-center justify-center rounded-full
                            border border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)]
                            hover:border-[var(--sys-accent)]/50 hover:text-[var(--sys-accent)]
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60
                            transition-all"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>

                {/* Screen-reader live region */}
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                    Showing skill {activeIndex + 1} of {visibleCards.length}: {visibleCards[activeIndex]?.title}
                </p>
            </div>
        </section>
    );
}