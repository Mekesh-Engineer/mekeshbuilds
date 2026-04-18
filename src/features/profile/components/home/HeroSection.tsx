/**
 * HeroSection.tsx  —  v4 (Split-CTA + Full Enhancement Pass)
 * ─────────────────────────────────────────────────────────────
 * Improvements in this revision
 *  • NEW: Split dual-purpose CTA button (Portfolio ↗ | Hire Me)
 *    – Left half: deep-orange gradient  →  "Portfolio ↗"
 *    – Right half: lighter-orange gradient  →  "Hire Me"
 *    – Shared rounded-pill shell, inner divider, unified hover state
 *    – Shimmer sweep, lift shadow, and micro-arrow animations
 *  • Lazy R3F canvas with low-end / prefers-reduced-motion guard
 *  • Portrait hover → 3D energy aura + canvas effects
 *  • Mouse parallax on portrait, circle, and glassmorphism cards
 *  • Full modular component breakdown with JSDoc comments
 *  • Accessibility: aria-labels, role="img", semantic HTML
 */

import React, {
    lazy, Suspense,
    useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useBuilderStore } from '@/stores/builderStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/client';
import {
    motion, AnimatePresence,
    useMotionValue, useSpring, useTransform,
    useReducedMotion,
} from 'framer-motion';
import {
    SiEspressif,
    SiFirebase,
    SiFlask,
    SiGithub,
    SiOpencv,
    SiReact,
    SiSupabase,
    SiYolo,
} from 'react-icons/si';
import { MdFunctions, MdWavingHand } from 'react-icons/md';
import heroImg from '@/assets/images/hero.png';
import hero2Img from '@/assets/images/hero1.png';
import { auth } from '@/services/firebase/client';
import { HERO_DATA } from '@/data/useHeroContent';
// Lazy-load heavy R3F scene — zero blocking on slow devices
const HeroCanvas = lazy(() => import('@/components/Canvas/HeroCanvasR3F'));
const SplitCTAButton = lazy(() => import('@/components/common/SplitCTAButton'));
import TiltHoverCard from '@/components/common/TiltHoverCard';

// ─── Constants ────────────────────────────────────────────────────────────────
const EASE = [0.32, 0.72, 0, 1] as const;
const SPRING = { stiffness: 120, damping: 18, mass: 0.8 };

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
    full_name?: string;
    avatar_url?: string;
    email?: string;
    headline?: string;
    bio?: string;
    hero_badges?: string[];
    hero_image_url?: string;
    availability_status?: string;
}

interface Particle {
    id: number; x: number; y: number;
    size: number; opacity: number; duration: number; delay: number; drift: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, id) => ({
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 6,
        drift: (Math.random() - 0.5) * 60,
    }));
}

/** Disable WebGL canvas on devices with < 4 CPU cores or old iOS */
function isLowEndDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    const cores = navigator.hardwareConcurrency ?? 4;
    const oldIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
        && /OS 1[0-4]_/.test(navigator.userAgent);
    return cores < 4 || oldIOS;
}

// ─── SVG Decorations ──────────────────────────────────────────────────────────

/** Animated sparkle rays that draw in on mount */
const SparkleRays = ({ className = '' }: { className?: string }) => (
    <svg width="44" height="38" viewBox="0 0 44 38" fill="none" aria-hidden="true"
        className={`w-8 h-8 md:w-10 md:h-10 ${className}`}>
        {([
            [8, 28, 20, 8, 0.8],
            [20, 18, 36, 8, 1.0],
            [26, 26, 42, 24, 1.2],
        ] as [number, number, number, number, number][]).map(([x1, y1, x2, y2, d], i) => (
            <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="var(--sys-accent)" strokeWidth="3.2" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: d }} />
        ))}
    </svg>
);

/** Animated swoosh arc pair */
const SwooshArcs = () => (
    <svg width="96" height="62" viewBox="0 0 96 62" fill="none" aria-hidden="true">
        {(['M4 14 C 26 2, 58 28, 92 12', 'M4 40 C 26 28, 58 54, 92 38'] as const).map((d, i) => (
            <motion.path key={i} d={d}
                stroke="var(--sys-accent)" strokeWidth="5" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 + i * 0.2 }} />
        ))}
    </svg>
);

/** Spring-in animated star icon */
const Star = ({ delay = 0 }: { delay?: number }) => (
    <motion.svg viewBox="0 0 24 24" fill="var(--sys-accent)" aria-hidden="true"
        className="h-4 w-4 md:h-5 md:w-5"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.3, rotate: 10 }}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </motion.svg>
);

// ─── Background Elements ───────────────────────────────────────────────────────

/** Drifting accent-coloured dot particles (CSS — not WebGL) */
const ParticleField = ({ particles }: { particles: Particle[] }) => (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {particles.map((p) => (
            <motion.div key={p.id} className="absolute rounded-full bg-sys-accent"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
                animate={{ y: [0, -40, 0], x: [0, p.drift, 0], opacity: [p.opacity, p.opacity * 1.8, p.opacity] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
    </div>
);

/** Subtle grid of accent lines at 3% opacity */
const GridOverlay = () => (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
        style={{
            backgroundImage: `
        linear-gradient(var(--sys-accent) 1px, transparent 1px),
        linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)
      `,
            backgroundSize: '60px 60px',
        }} />
);

// ─── Floating Side Cards ───────────────────────────────────────────────────────

/**
 * Glassmorphism testimonial card.
 * Floats vertically and tilts with mouse parallax.
 */
const TestimonialCard = ({
    firstName, className = '', mouseX, mouseY,
}: {
    firstName: string; className?: string;
    mouseX?: ReturnType<typeof useMotionValue<number>>;
    mouseY?: ReturnType<typeof useMotionValue<number>>;
}) => {
    return (
        <TiltHoverCard
            externalMouseX={mouseX}
            externalMouseY={mouseY}
            className={`flex flex-col gap-2 rounded-2xl border border-white/10 p-4 md:p-5 backdrop-blur-xl shadow-2xl ${className}`}
            style={{
                background: 'rgba(255,255,255,0.04)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
            {/* Top-edge accent gradient */}
            <div className="absolute -top-px left-4 right-4 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--sys-accent), transparent)' }} />

            {/* Decorative opening quote */}
            <span className="absolute -top-5 -left-1 text-[64px] leading-none opacity-30 font-serif"
                style={{ color: 'var(--sys-accent)' }}>&#x201C;</span>

            {/* Reviewer avatars */}
            <div className="flex -space-x-2 mb-2">
                {(['#e67e22', '#3498db', '#2ecc71'] as const).map((color, i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-sys-bg-primary"
                        style={{ background: color, zIndex: 3 - i }} />
                ))}
                <div className="h-6 w-14 rounded-full border-2 border-sys-bg-primary bg-sys-bg-secondary
          flex items-center justify-center text-[9px] font-bold text-sys-text-secondary">
                    {HERO_DATA.testimonial.socialProofCount}
                </div>
            </div>

            <p className="relative z-10 text-[12px] md:text-[13px] leading-relaxed text-sys-text-secondary">
                <strong className="text-sys-text-primary font-bold">{firstName}'s</strong>{' '}
                {HERO_DATA.testimonial.reviewTemplate.replace("{name}'s", "").trim()}
            </p>

            {/* Mini star row */}
            <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill="var(--sys-accent)" className="h-3 w-3 opacity-80">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                ))}
            </div>
        </TiltHoverCard>
    );
};

/**
 * Experience / stats badge.
 * Floats vertically and tilts with mouse parallax.
 * Shows optional signed-in user chip.
 */
const ExperienceStats = ({
    profile, className = '', mouseX, mouseY,
}: {
    profile: UserProfile | null; className?: string;
    mouseX?: ReturnType<typeof useMotionValue<number>>;
    mouseY?: ReturnType<typeof useMotionValue<number>>;
}) => {
    return (
        <TiltHoverCard
            externalMouseX={mouseX}
            externalMouseY={mouseY}
            tiltAmount={6}
            className={`flex flex-col items-start lg:items-end ${className}`}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
            <div className="rounded-2xl border border-white/10 p-4 md:p-5 backdrop-blur-xl"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
                }}>

                {/* 5-star row */}
                <div className="flex gap-1 mb-2" role="img" aria-label={`${HERO_DATA.experience.ratingStars} out of ${HERO_DATA.experience.ratingStars} stars`}>
                    {Array.from({ length: HERO_DATA.experience.ratingStars }).map((_, i) => <Star key={i} delay={0.6 + i * 0.08} />)}
                </div>

                <motion.p className="font-black leading-none tracking-tight text-sys-text-primary"
                    style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)' }}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.5, type: 'spring', stiffness: 160 }}>
                    {HERO_DATA.experience.yearsValue}
                </motion.p>

                <p className="mt-1 text-[11px] md:text-[13px] font-semibold uppercase tracking-widest text-sys-text-secondary">
                    {HERO_DATA.experience.title}
                </p>

                {/* Accent divider */}
                <div className="my-3 h-px w-full"
                    style={{ background: 'linear-gradient(90deg, var(--sys-accent), transparent)' }} />

                {/* Micro stats */}
                <div className="flex gap-4">
                    {HERO_DATA.experience.metrics.map(({ val, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-[15px] font-black text-sys-text-primary">{val}</p>
                            <p className="text-[10px] text-sys-text-secondary uppercase tracking-wider">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Signed-in user chip */}
                {profile && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10
            bg-sys-bg-secondary/60 px-3 py-1.5 backdrop-blur-sm">
                        {profile.avatar_url
                            ? <img src={profile.avatar_url} alt={profile.full_name ?? 'You'} className="h-6 w-6 rounded-md object-cover" />
                            : (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, var(--sys-accent-dark), var(--sys-accent))' }}>
                                    {(profile.full_name ?? 'U').slice(0, 2).toUpperCase()}
                                </div>
                            )}
                        <span className="max-w-[100px] truncate text-[11px] font-medium text-sys-text-secondary">
                            {profile.full_name ?? profile.email}
                        </span>
                    </div>
                )}
            </div>
        </TiltHoverCard>
    );
};

// ─── Scroll Indicator ─────────────────────────────────────────────────────────

const ScrollIndicator = () => (
    <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
    >
        <p className="text-[10px] uppercase tracking-[0.25em] text-sys-text-secondary opacity-60">{HERO_DATA.scrollIndicatorLabel}</p>
        <motion.div className="h-10 w-5 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div className="h-2 w-1 rounded-full bg-sys-accent"
                animate={{ y: [0, 16, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.div>
    </motion.div>
);

// ─── Portrait Aura (CSS — activated on portrait hover) ────────────────────────

/**
 * PortraitAura
 * A layered CSS overlay that appears when the user hovers the portrait.
 * Uses purple radial glow + breathing ring + orbiting accent dots.
 * Complements the WebGL energy effects in HeroCanvas.
 */
const PortraitAura = ({ visible }: { visible: boolean }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                className="absolute inset-0 z-[5] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(circle, rgba(107,44,255,0.28) 0%, transparent 75%)' }} />

                <motion.div className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: 'rgba(167,139,255,0.45)' }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity }} />

                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * 360;
                    return (
                        <motion.div key={i} className="absolute w-2.5 h-2.5 rounded-full"
                            style={{
                                background: i % 2 === 0 ? 'var(--sys-accent)' : '#a78bff',
                                top: `${50 + 48 * Math.sin(angle * Math.PI / 180)}%`,
                                left: `${50 + 48 * Math.cos(angle * Math.PI / 180)}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                            animate={{ scale: [0.5, 1.6, 0.5], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }} />
                    );
                })}
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function HeroSection() {
    // ── State ──
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [mounted, setMounted] = useState(false);
    const [portraitHovered, setPortraitHovered] = useState(false);
    const [canvasDisabled, setCanvasDisabled] = useState(true);   // SSR-safe default
    const [mouseNorm, setMouseNorm] = useState({ x: 0, y: 0 });
    const [portraitRect, setPortraitRect] = useState({ width: 0, height: 0, left: 0, top: 0 });

    // Sync profile data dynamically from Firestore using useRealtimeSync and db getters
    const { profile: storeProfile } = useBuilderStore();
    const userId = storeProfile?.id; // Assuming we get user ID via auth or initial store data

    useRealtimeSync(userId, async () => {
        if (!userId) return;
        const pRef = doc(db, 'profiles', userId);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) setProfile(pSnap.data() as unknown as UserProfile);
    });

    useEffect(() => {
        if (storeProfile) setProfile(storeProfile as unknown as UserProfile);
    }, [storeProfile]);

    // ── Refs ──
    const sectionRef = useRef<HTMLElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);

    // ── Motion ──
    const prefersReducedMotion = useReducedMotion();
    const particles = useMemo(() => generateParticles(30), []);

    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const mouseX = useSpring(rawX, SPRING);
    const mouseY = useSpring(rawY, SPRING);

    const imgX = useTransform(mouseX, [-400, 400], [-14, 14]);
    const imgY = useTransform(mouseY, [-400, 400], [-10, 10]);
    const circleX = useTransform(mouseX, [-400, 400], [-8, 8]);
    const circleY = useTransform(mouseY, [-400, 400], [-5, 5]);

    // ── Handlers ──
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        rawX.set(cx);
        rawY.set(cy);
        setMouseNorm({ x: cx / (rect.width / 2), y: -cy / (rect.height / 2) });
    }, [rawX, rawY]);

    const handleMouseLeave = useCallback(() => {
        rawX.set(0); rawY.set(0);
        setMouseNorm({ x: 0, y: 0 });
        setPortraitHovered(false);
    }, [rawX, rawY]);

    /** Re-measures portrait rect for canvas alignment */
    const updateRect = useCallback(() => {
        if (!measureRef.current || !sectionRef.current) return;
        const r = measureRef.current.getBoundingClientRect();
        const sr = sectionRef.current.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
            setPortraitRect({
                width: r.width,
                height: r.height,
                left: r.left - sr.left,
                top: r.top - sr.top,
            });
        }
    }, []);

    // ── Effects ──
    useEffect(() => {
        setMounted(true);
        setCanvasDisabled(!!(prefersReducedMotion) || isLowEndDevice());

        // Firebase profile fetch
        (async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;
                const snap = await getDoc(doc(db, 'profiles', user.uid));
                if (snap.exists()) {
                    setProfile(snap.data() as UserProfile);
                } else {
                    const fallback: UserProfile = {};
                    if (user.displayName) fallback.full_name = user.displayName;
                    if (user.photoURL) fallback.avatar_url = user.photoURL;
                    if (user.email) fallback.email = user.email;
                    setProfile(fallback);
                }
            } catch { /* silent */ }
        })();
    }, [prefersReducedMotion]);

    useEffect(() => {
        if (!mounted || canvasDisabled) return;
        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [mounted, canvasDisabled, updateRect]);

    // ── Derived ──
    const firstName = profile?.full_name?.split(' ')[0] ?? HERO_DATA.fallbackFirstName;

    const up = (delay = 0) => ({
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } },
    });
    const show = mounted ? 'visible' : 'hidden';

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <section
            ref={sectionRef}
            aria-label={HERO_DATA.sectionAriaLabelTemplate.replace("{name}", firstName)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex flex-col items-center justify-between min-h-[85svh] w-full overflow-hidden bg-sys-bg-primary pt-[12vh] pb-24 md:pb-28"
        >
            {/* ══ Z-LAYER 0: WebGL 3D Canvas ══ */}
            <Suspense fallback={null}>
                <HeroCanvas
                    mouseNorm={mouseNorm}
                    portraitHovered={portraitHovered}
                    disabled={canvasDisabled}
                    portraitRect={portraitRect}
                />
            </Suspense>

            {/* ══ Z-LAYER 1: CSS background decoration ══ */}
            <GridOverlay />
            <ParticleField particles={particles} />

            {/* Radial glows */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[70vh]"
                    style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,107,44,0.22) 0%, transparent 70%)' }} />
                <div className="absolute top-0 left-0 w-[55vw] h-[55vh]"
                    style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(167,139,255,0.12) 0%, transparent 65%)' }} />
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 65% 45% at 50% 55%, rgba(15,15,20,0) 0%, rgba(15,15,20,0.4) 100%)' }} />
            </div>

            {/* ══ HEADER: Greeting + Headline + Role tags + Desc ══ */}
            <header className="relative z-20 flex flex-col items-center w-full px-4 text-center">

                {/* Hello badge */}
                <motion.div initial="hidden" animate={show} variants={up(0.1)} className="relative mb-6">
                    <motion.div
                        className="rounded-full border border-white/15 px-6 py-2 text-[14px] font-bold flex items-center text-sys-text-primary"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                        whileHover={{ scale: 1.04, boxShadow: '0 0 0 2px var(--sys-accent)' }}
                    >
                        <motion.span className="mr-2 inline-block text-[18px] text-yellow-400" animate={{ rotate: [0, -20, 20, -20, 20, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}>
                            <MdWavingHand />
                        </motion.span>
                        {HERO_DATA.greetingBadgeText}
                    </motion.div>
                    <SparkleRays className="absolute -right-9 -top-3" />
                </motion.div>

                {/* H1 with blur-swap name */}
                <motion.h1
                    initial="hidden" animate={show} variants={up(0.2)}
                    className="font-black tracking-[-0.04em] text-sys-text-primary"
                    style={{ fontSize: 'clamp(2.6rem, 6.5vw, 6.2rem)', lineHeight: 1 }}
                >
                    {HERO_DATA.headingPrefix}{' '}
                    <AnimatePresence mode="wait">
                        <motion.span key={firstName}
                            initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(8px)' }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="inline-block"
                            style={{
                                color: 'var(--sys-accent)',
                            }}
                        >
                            {firstName}
                        </motion.span>
                    </AnimatePresence>,
                </motion.h1>

                {/* Role tags */}
                <motion.div initial="hidden" animate={show} variants={up(0.25)}
                    className="flex flex-wrap justify-center gap-2 mt-4">
                    {HERO_DATA.roleTags.map((tag, i) => (
                        <motion.span key={tag}
                            className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sys-text-secondary"
                            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.08 }}>
                            {tag}
                        </motion.span>
                    ))}
                </motion.div>

                {/* Description */}
                <motion.p initial="hidden" animate={show} variants={up(0.3)}
                    className="mt-5 max-w-2xl px-4 text-center font-medium leading-[1.75] text-sys-text-secondary"
                    style={{ fontSize: 'clamp(14px, 1.3vw, 18px)' }}>
                    {HERO_DATA.description.intro}{' '}
                    <span className="text-sys-text-primary font-bold">{HERO_DATA.description.highlightedInstitution}</span>
                    {HERO_DATA.description.middle}{' '}
                    <span className="text-sys-text-primary font-bold">{HERO_DATA.description.highlightedYear}</span>{HERO_DATA.description.outro}
                </motion.p>

                {/* Desktop swoosh accent */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                    animate={mounted ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.5, ease: 'backOut' }}
                    className="hidden lg:block absolute left-[20%] top-[85%] -translate-y-1/2 z-10">
                    <SwooshArcs />
                </motion.div>
            </header>

            {/* ══ MAIN: Portrait + side cards ══ */}
            <main className="relative flex-1 flex w-full max-w-[1400px] items-end justify-center mt-6 lg:mt-2">

                {/* Desktop left — Testimonial */}
                <motion.aside initial="hidden" animate={show} variants={up(0.45)}
                    className="hidden lg:block absolute left-8 xl:left-16 top-[35%] max-w-[280px] z-30">
                    <TestimonialCard firstName={firstName} mouseX={mouseX} mouseY={mouseY} />
                </motion.aside>

                {/* ── Center stage ── */}
                <div className="relative flex justify-center items-end w-full lg:w-auto h-[38vh] md:h-[48vh] lg:h-[58vh]">

                    {/* Pulsing rings */}
                    {[
                        { w: 'clamp(320px,52vw,680px)', opacity: [0.4, 0.2, 0.4] as number[], scale: [1, 1.04, 1] as number[], delay: 0 },
                        { w: 'clamp(290px,48vw,640px)', opacity: [0.3, 0.1, 0.3] as number[], scale: [1, 1.06, 1] as number[], delay: 0.5 },
                    ].map(({ w, opacity, scale, delay }, i) => (
                        <motion.div key={i}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[18%] rounded-full border border-sys-accent/25 z-[-1]"
                            style={{ width: w, aspectRatio: '1/1' }}
                            animate={{ scale, opacity }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay }} />
                    ))}

                    {/* Orange spotlight circle */}
                    <motion.div
                        style={{ x: circleX, y: circleY, width: 'clamp(260px,44vw,580px)', aspectRatio: '1/1' }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={mounted ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 1.2, delay: 0.15, ease: EASE }}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[15%] z-0 rounded-full"
                        aria-hidden="true"
                    >
                        <div className="absolute inset-0 rounded-full" style={{ background: 'var(--sys-accent)' }} />
                        <div className="absolute -inset-4 rounded-full opacity-40" style={{ background: 'var(--sys-accent)', filter: 'blur(24px)' }} />
                        <div className="absolute -inset-8 rounded-full opacity-20" style={{ background: 'var(--sys-accent)', filter: 'blur(48px)' }} />
                    </motion.div>

                    {/* CSS aura overlay */}
                    <div className="absolute inset-0 z-[6] pointer-events-none flex items-end justify-center">
                        <div className="relative h-full w-full">
                            <PortraitAura visible={portraitHovered} />
                        </div>
                    </div>

                    {/* Measurement anchor for canvas alignment */}
                    <div ref={measureRef} className="absolute inset-0 pointer-events-none z-0" />

                    {/* Portrait — parallax + hover detection */}
                    <motion.div style={{ x: imgX, y: imgY }} className="relative z-10 h-full">
                        <motion.img
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={mounted ? { opacity: canvasDisabled ? 1 : 0, y: 0, scale: 1 } : {}}
                            transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
                            whileHover={canvasDisabled ? { scale: 1.025 } : {}}
                            onHoverStart={() => setPortraitHovered(true)}
                            onHoverEnd={() => setPortraitHovered(false)}
                            src={heroImg}
                            alt={`${firstName} — ${HERO_DATA.portraitAltRole}`}
                            draggable={false}
                            className="block h-full w-auto object-contain object-bottom select-none cursor-crosshair relative z-10"
                            style={canvasDisabled ? { filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.6))' } : {}}
                        />
                        <motion.img
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={mounted ? { opacity: canvasDisabled ? 1 : 0, y: 0, scale: 1 } : {}}
                            transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
                            whileHover={canvasDisabled ? { scale: 1.025 } : {}}
                            src={hero2Img}
                            alt={`${firstName} — ${HERO_DATA.overlayAltRole}`}
                            draggable={false}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 block w-[100vw] md:w-[80vw] lg:w-[70vw] h-auto max-w-none object-contain object-bottom select-none pointer-events-none z-20"
                            style={canvasDisabled ? { filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.6))' } : {}}
                        />
                    </motion.div>

                    {/* Floating tech pills (desktop) */}
                    {HERO_DATA.techBadges.map(({ label, icon, iconColor, positionClass, delay }) => {
                        const Icon = {
                            react: SiReact,
                            firebase: SiFirebase,
                            esp32: SiEspressif,
                            opencv: SiOpencv,
                            yolov8: SiYolo,
                            flask: SiFlask,
                            supabase: SiSupabase,
                            matlab: MdFunctions,
                            github: SiGithub,
                            autocad: MdFunctions,
                        }[icon];
                        return (
                            <motion.div key={label}
                                className={`${positionClass} hidden lg:flex items-center gap-1.5 rounded-full px-3 py-1.5 z-20 shadow-md`}
                                style={{ background: '#ffffff' }}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay, type: 'spring', stiffness: 200 }}
                                whileHover={{ scale: 1.1, y: -2 }}>
                                {Icon && <Icon className="h-[13px] w-[13px]" style={{ color: iconColor }} aria-hidden="true" />}
                                <span className="text-[11px] font-bold text-black">{label}</span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Desktop right — Experience */}
                <motion.aside initial="hidden" animate={show} variants={up(0.5)}
                    className="hidden lg:flex absolute right-8 xl:right-16 top-[35%] z-30">
                    <ExperienceStats profile={profile} mouseX={mouseX} mouseY={mouseY} />
                </motion.aside>
            </main>

            {/* ══ MOBILE: Stacked side cards ══ */}
            <motion.div initial="hidden" animate={show} variants={up(0.6)}
                className="flex lg:hidden gap-4 w-full px-4 max-w-md mx-auto mt-5 mb-6 z-20">
                <TestimonialCard firstName={firstName} className="flex-1" />
                <ExperienceStats profile={profile} className="flex-1 items-end text-right" />
            </motion.div>

            {/* ══ FOOTER: Split CTA Button ══ */}
            <motion.footer
                initial="hidden" animate={show} variants={up(0.75)}
                className="relative z-30 flex flex-col items-center gap-3 w-full px-4 mt-auto mb-4"
            >
                <Suspense fallback={<div className="h-[58px] w-full max-w-[420px]" />}>
                    <SplitCTAButton
                        onPortfolioClick={() => { /* TODO: navigate to portfolio section */ }}
                        onHireMeClick={() => { /* TODO: navigate to contact section */ }}
                    />
                </Suspense>

                {/* Sub-label beneath the button */}
                <motion.p
                    className="text-[11px] text-white/70 tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 1.2 }}
                >
                    {HERO_DATA.availabilityNote}
                </motion.p>
            </motion.footer>

            <ScrollIndicator />
        </section>
    );
}