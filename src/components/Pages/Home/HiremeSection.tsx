/**
 * HireMe.tsx  —  Revised: 7-Ring Ripple + 3D Immersive Design
 * ─────────────────────────────────────────────────────────────
 * Design language mirrors HeroSection.tsx exactly:
 *  • 7 concentric accent-colour ripple rings behind the portrait
 *    — staggered scale / opacity pulse (sonar-wave cadence)
 *    — rings intensify and speed up on portrait hover
 *  • Mouse-tracked parallax on portrait, ring stack, and stat cards
 *  • 3D perspective tilt on the outer card (rotateX / rotateY)
 *  • Orange radial spotlight + layered glow bloom behind portrait
 *  • Drifting CSS particle field across the left pane
 *  • Subtle perspective grid overlay (CSS-only, no WebGL)
 *  • Glassmorphism stat cards with top-edge accent gradient
 *  • Energy aura halo that fades in on portrait hover
 *  • CTA button shell matching HeroSection's SplitCTAButton
 */

import {
    lazy,
    Suspense,
    useRef,
    useState,
    useCallback,
    useMemo,
} from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useInView,
    AnimatePresence,
} from "framer-motion";
import heroImg from "../../../assets/images/Hireme.png";
const hireMeStyles = `
/* src/styles/pages/home.css */
/* Home page-specific styles */

.hireme-section {
  --hireme-bg-start: var(--sys-bg-primary);
  --hireme-bg-end: var(--sys-bg-primary);
  --hireme-ring: rgba(255, 107, 44, 0.16);
  --hireme-ring-soft: rgba(255, 138, 87, 0.12);
  --hireme-pane-start: #1a202e;
  --hireme-pane-end: #202838;
  --hireme-title: #f3f4f6;
  --hireme-desc: #b0bacb;
  --hireme-stat-value: #f8fafc;
  --hireme-stat-label: #9ca8bc;
  --hireme-stat-card-bg: rgba(23, 27, 38, 0.7);
  --hireme-stat-card-border: #2d3546;
  --hireme-stat-card-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
  --hireme-stat-index: #7d8ba3;
  --hireme-divider: #30394b;
  --hireme-btn-primary-start: var(--sys-accent);
  --hireme-btn-primary-end: var(--sys-accent-dark);
  --hireme-btn-primary-shadow: 0 8px 20px rgba(255, 107, 44, 0.28);
  --hireme-btn-primary-hover-start: var(--sys-accent-light);
  --hireme-btn-primary-hover-end: var(--sys-accent);
  --hireme-btn-secondary-bg: rgba(26, 32, 46, 0.9);
  --hireme-btn-secondary-border: #344055;
  --hireme-btn-secondary-text: #e5e7eb;
  --hireme-btn-secondary-hover-bg: rgba(35, 43, 60, 0.96);

  background: linear-gradient(145deg, var(--hireme-bg-start) 0%, var(--hireme-bg-end) 100%);
  padding: 96px 0;
}

[data-mode='light'] .hireme-section {
  --hireme-ring: rgba(245, 160, 90, 0.12);
  --hireme-ring-soft: rgba(245, 160, 90, 0.1);
  --hireme-pane-start: #eef1f7;
  --hireme-pane-end: #e8ebf2;
  --hireme-title: #1f2533;
  --hireme-desc: #5f6779;
  --hireme-stat-value: #1f2533;
  --hireme-stat-label: #778197;
  --hireme-stat-card-bg: rgba(255, 255, 255, 0.72);
  --hireme-stat-card-border: #dde2ec;
  --hireme-stat-card-shadow: 0 8px 22px rgba(31, 37, 51, 0.06);
  --hireme-stat-index: #9aa3b8;
  --hireme-divider: #d7dce7;
  --hireme-btn-primary-start: #f5a05a;
  --hireme-btn-primary-end: #ef8d3e;
  --hireme-btn-primary-shadow: 0 8px 20px rgba(245, 160, 90, 0.28);
  --hireme-btn-primary-hover-start: #f6ab6b;
  --hireme-btn-primary-hover-end: #f29a4c;
  --hireme-btn-secondary-bg: rgba(255, 255, 255, 0.9);
  --hireme-btn-secondary-border: #d7dce7;
  --hireme-btn-secondary-text: #2d3445;
  --hireme-btn-secondary-hover-bg: #ffffff;
}

.hireme-content {
  max-width: 1400px;
}

.hireme-grid {
  min-height: 620px;
}

.hireme-bg-ring {
  background: radial-gradient(circle, var(--hireme-ring) 0%, transparent 70%);
}

.hireme-bg-right {
  background: radial-gradient(circle, var(--hireme-ring-soft) 0%, transparent 68%);
}

.hireme-left-pane {
  min-height: 560px;
  border-radius: 32px;
  background: linear-gradient(160deg, var(--hireme-pane-start) 0%, var(--hireme-pane-end) 100%);
}

.hireme-blob-wrap {
  width: 80%;
  max-width: 420px;
  aspect-ratio: 460 / 520;
}

.hireme-portrait {
  height: clamp(420px, 62vh, 640px);
  width: auto;
  max-width: 100%;
  object-fit: cover;
  object-position: top center;
}

.hireme-right {
  padding-right: clamp(0px, 1.5vw, 20px);
}

.hireme-title {
  font-size: clamp(44px, 5vw, 74px);
  color: var(--hireme-title);
  letter-spacing: -0.025em;
}

.hireme-title-accent {
  color: var(--sys-accent);
}

.hireme-description {
  color: var(--hireme-desc);
  max-width: 540px;
}

.hireme-stat-value {
  color: var(--hireme-stat-value);
  font-size: clamp(52px, 4.2vw, 72px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}

.hireme-stat-card {
  background: var(--hireme-stat-card-bg);
  border: 1px solid var(--hireme-stat-card-border);
  box-shadow: var(--hireme-stat-card-shadow);
}

.hireme-stat-index {
  color: var(--hireme-stat-index);
  line-height: 1;
}

.hireme-stat-label {
  margin-top: 8px;
  color: var(--hireme-stat-label);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.hireme-divider {
  background: var(--hireme-divider);
}

.hireme-btn-primary {
  background: linear-gradient(
    135deg,
    var(--hireme-btn-primary-start) 0%,
    var(--hireme-btn-primary-end) 100%
  );
  border: 1px solid transparent;
  color: #ffffff;
  min-width: 220px;
  font-weight: 800;
  letter-spacing: 0.01em;
  box-shadow: var(--hireme-btn-primary-shadow);
}

.hireme-btn-primary:hover {
  background: linear-gradient(
    135deg,
    var(--hireme-btn-primary-hover-start) 0%,
    var(--hireme-btn-primary-hover-end) 100%
  );
}

.hireme-btn-secondary {
  background: var(--hireme-btn-secondary-bg);
  border: 1px solid var(--hireme-btn-secondary-border);
  color: var(--hireme-btn-secondary-text);
}

.hireme-btn-secondary:hover {
  border-color: var(--sys-accent);
  color: var(--sys-accent-light);
  background: var(--hireme-btn-secondary-hover-bg);
}

@media (max-width: 1023px) {
  .hireme-section {
    padding: 72px 0;
  }

  .hireme-grid {
    min-height: auto;
  }

  .hireme-left-pane {
    min-height: 460px;
  }

  .hireme-portrait {
    height: clamp(340px, 48vh, 500px);
  }

  .hireme-title {
    font-size: clamp(36px, 8.5vw, 52px);
  }

  .hireme-stat-value {
    font-size: clamp(40px, 9vw, 56px);
  }

  .hireme-stat-label {
    font-size: 14px;
  }
}

`;;

const SplitCTAButton = lazy(() => import("@/components/Shared/SplitCTAButton"));

// ─── Constants ────────────────────────────────────────────────────────────────
const EASE = [0.32, 0.72, 0, 1] as const;
const SPRING_CFG = { stiffness: 100, damping: 22, mass: 0.9 };

// ─── 7-ring ripple config ─────────────────────────────────────────────────────
// Rings grow outward from the portrait centre.
// Each entry: pixel diameter, pulse opacity triple, scale triple, duration, stagger delay.
const RINGS = [
    { size: 200, opacity: [0.72, 0.30, 0.72] as number[], scale: [1, 1.06, 1] as number[], duration: 2.8, delay: 0.00 },
    { size: 290, opacity: [0.55, 0.22, 0.55] as number[], scale: [1, 1.07, 1] as number[], duration: 3.0, delay: 0.22 },
    { size: 378, opacity: [0.40, 0.15, 0.40] as number[], scale: [1, 1.07, 1] as number[], duration: 3.2, delay: 0.44 },
    { size: 466, opacity: [0.28, 0.10, 0.28] as number[], scale: [1, 1.08, 1] as number[], duration: 3.4, delay: 0.66 },
    { size: 552, opacity: [0.18, 0.06, 0.18] as number[], scale: [1, 1.09, 1] as number[], duration: 3.6, delay: 0.88 },
    { size: 638, opacity: [0.11, 0.03, 0.11] as number[], scale: [1, 1.09, 1] as number[], duration: 3.8, delay: 1.10 },
    { size: 724, opacity: [0.06, 0.01, 0.06] as number[], scale: [1, 1.10, 1] as number[], duration: 4.0, delay: 1.32 },
] as const;

// ─── Particle helpers ─────────────────────────────────────────────────────────
interface Particle {
    id: number; x: number; y: number;
    size: number; opacity: number; duration: number; delay: number; drift: number;
}

function makeParticles(n: number): Particle[] {
    return Array.from({ length: n }, (_, id) => ({
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.45 + 0.08,
        duration: Math.random() * 9 + 7,
        delay: Math.random() * 5,
        drift: (Math.random() - 0.5) * 50,
    }));
}

// ─── Stat data ────────────────────────────────────────────────────────────────
const STATS = [
    { value: "4+", label: "Major Engineering Projects", delay: 0.45 },
    { value: "5+", label: "Technical Presentations", delay: 0.55 },
    { value: "3+", label: "Competition Wins", delay: 0.65 },
    { value: "Multi", label: "Industrial Trainings", delay: 0.75 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Drifting orange particle dots — pure CSS/Framer, no WebGL */
const ParticleField = ({ particles }: { particles: Particle[] }) => (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {particles.map((p) => (
            <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: p.size,
                    height: p.size,
                    opacity: p.opacity,
                    background: "var(--sys-accent)",
                }}
                animate={{
                    y: [0, -36, 0],
                    x: [0, p.drift, 0],
                    opacity: [p.opacity, p.opacity * 1.9, p.opacity],
                }}
                transition={{
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        ))}
    </div>
);

/** Subtle perspective grid — mirrors HeroSection's GridOverlay */
const GridOverlay = () => (
    <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
        style={{
            backgroundImage: `
                linear-gradient(var(--sys-accent) 1px, transparent 1px),
                linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)
            `,
            backgroundSize: "58px 58px",
        }}
    />
);

/**
 * The 7 concentric ripple rings.
 * Mounted as a single motion.div so the whole stack parallaxes together.
 */
const RippleRings = ({
    hovered,
    ringX,
    ringY,
}: {
    hovered: boolean;
    ringX: ReturnType<typeof useSpring>;
    ringY: ReturnType<typeof useSpring>;
}) => (
    <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]"
        aria-hidden="true"
    >
        {RINGS.map((ring, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{
                    width: ring.size,
                    height: ring.size,
                    borderColor: "var(--sys-accent)",
                }}
                animate={{
                    scale: hovered
                        ? [1, (ring.scale[1] as number) * 1.04, 1]
                        : (ring.scale as unknown as number[]),
                    opacity: hovered
                        ? [
                            (ring.opacity[0] as number) * 1.6,
                            (ring.opacity[1] as number) * 1.6,
                            (ring.opacity[0] as number) * 1.6,
                        ]
                        : (ring.opacity as unknown as number[]),
                }}
                transition={{
                    duration: hovered ? ring.duration * 0.7 : ring.duration,
                    delay: ring.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        ))}
    </motion.div>
);

/** Orange radial spotlight + layered bloom centred behind the portrait */
const SpotlightBloom = ({ hovered }: { hovered: boolean }) => (
    <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[18%] rounded-full z-0"
        style={{ width: "clamp(200px,38vw,440px)", aspectRatio: "1/1" }}
        animate={{ opacity: hovered ? 1 : 0.82, scale: hovered ? 1.07 : 1 }}
        transition={{ duration: 0.72, ease: EASE }}
    >
        <div
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--sys-accent)" }}
        />
        <div
            className="absolute -inset-4 rounded-full opacity-40"
            style={{ background: "var(--sys-accent)", filter: "blur(28px)" }}
        />
        <div
            className="absolute -inset-10 rounded-full opacity-20"
            style={{ background: "var(--sys-accent)", filter: "blur(56px)" }}
        />
    </motion.div>
);

/** Energy aura halo — fades in on portrait hover (mirrors HeroSection's PortraitAura) */
const EnergyAura = ({ visible }: { visible: boolean }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-full pointer-events-none z-[8]"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0, scale: 1.14 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                    background:
                        "radial-gradient(ellipse 72% 78% at 50% 80%, rgba(255,107,44,0.46) 0%, rgba(255,107,44,0.14) 45%, transparent 72%)",
                    filter: "blur(6px)",
                }}
            />
        )}
    </AnimatePresence>
);

/** Glassmorphism stat card with parallax tilt + top-edge accent gradient */
const StatBlock = ({
    index, value, label, delay = 0,
    mouseX, mouseY,
}: {
    index: number; value: string; label: string; delay?: number;
    mouseX: ReturnType<typeof useMotionValue<number>>;
    mouseY: ReturnType<typeof useMotionValue<number>>;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });

    const rotateX = useTransform(mouseY, [-400, 400], [4, -4]);
    const rotateY = useTransform(mouseX, [-400, 400], [-4, 4]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay, ease: EASE }}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 900,
                background:
                    "rgba(255,255,255,0.04)",
                boxShadow:
                    "0 6px 28px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
            className="relative flex flex-col rounded-2xl p-4 md:p-5 border border-white/10 backdrop-blur-md overflow-hidden"
        >
            {/* Top-edge accent gradient — exact detail from HeroSection's floating cards */}
            <div
                className="absolute -top-px left-4 right-4 h-px"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, var(--sys-accent), transparent)",
                }}
            />

            <span
                className="mb-2 text-[12px] font-bold tracking-[0.18em]"
                style={{ color: "var(--sys-accent)" }}
            >
                {String(index + 1).padStart(2, "0")}
            </span>

            <motion.span
                className="hireme-stat-value text-[42px] font-black leading-none tracking-tight md:text-[50px]"
                initial={{ opacity: 0, scale: 0.78 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: delay + 0.1, ease: "backOut" }}
            >
                {value}
            </motion.span>

            <span className="hireme-stat-label mt-1.5 text-[14px] font-medium">
                {label}
            </span>
        </motion.div>
    );
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function HireMe() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-80px" });

    const [portraitHovered, setPortraitHovered] = useState(false);

    const particles = useMemo(() => makeParticles(28), []);

    // ── Raw mouse motion values ──
    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);

    // ── Smoothed springs (same config as HeroSection) ──
    const mouseX = useSpring(rawMouseX, SPRING_CFG);
    const mouseY = useSpring(rawMouseY, SPRING_CFG);

    // ── Parallax layer offsets ──
    const portraitX = useTransform(mouseX, [-500, 500], [-14, 14]);
    const portraitY = useTransform(mouseY, [-500, 500], [-8, 8]);
    const ringX = useTransform(mouseX, [-500, 500], [-8, 8]);
    const ringY = useTransform(mouseY, [-500, 500], [-4, 4]);

    // Spring-wrap the transforms so they ease smoothly
    const portraitXS = useSpring(portraitX, SPRING_CFG);
    const portraitYS = useSpring(portraitY, SPRING_CFG);
    const ringXS = useSpring(ringX, SPRING_CFG);
    const ringYS = useSpring(ringY, SPRING_CFG);

    // 3-D card tilt (driven by the smoothed springs, not raw)
    const cardRotateX = useTransform(mouseY, [-500, 500], [3.5, -3.5]);
    const cardRotateY = useTransform(mouseX, [-500, 500], [-4.5, 4.5]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            const rect = sectionRef.current?.getBoundingClientRect();
            if (!rect) return;
            rawMouseX.set(e.clientX - (rect.left + rect.width / 2));
            rawMouseY.set(e.clientY - (rect.top + rect.height / 2));
        },
        [rawMouseX, rawMouseY],
    );

    const handleMouseLeave = useCallback(() => {
        rawMouseX.set(0);
        rawMouseY.set(0);
        setPortraitHovered(false);
    }, [rawMouseX, rawMouseY]);

    return (
        <>
            <style>{hireMeStyles}</style>
            <section
                ref={sectionRef}
                aria-label="Why hire me"
                className="hireme-section relative overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
            {/* ── Ambient background accents ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,107,44,0.09) 0%, transparent 70%)",
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-1/2 h-[560px] w-[560px]
                           -translate-y-1/2 translate-x-1/3 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,107,44,0.05) 0%, transparent 70%)",
                }}
            />

            {/* ── Outer layout ── */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">

                {/* ══ 3D-tilting outer card ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.72, ease: EASE }}
                    style={{
                        rotateX: cardRotateX,
                        rotateY: cardRotateY,
                        transformPerspective: 1400,
                    }}
                    className="hireme-card overflow-hidden rounded-4xl"
                >
                    <div className="grid grid-cols-1 items-center lg:grid-cols-2">

                        {/* ════════════════════════════════════════════════════
                            LEFT — Portrait with 7-ring ripple stack
                        ════════════════════════════════════════════════════ */}
                        <motion.div
                            initial={{ opacity: 0, x: -36 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.72, delay: 0.1, ease: EASE }}
                            className="hireme-left-pane relative flex items-end justify-center
                                       overflow-hidden rounded-4xl lg:rounded-none lg:rounded-l-4xl"
                            style={{ minHeight: "clamp(360px,52vw,580px)" }}
                        >
                            {/* Subtle grid overlay */}
                            <GridOverlay />

                            {/* CSS particle cloud */}
                            <ParticleField particles={particles} />

                            {/* ── 7 Ripple rings (parallax-tracked) ── */}
                            <RippleRings
                                hovered={portraitHovered}
                                ringX={ringXS}
                                ringY={ringYS}
                            />

                            {/* ── Orange radial spotlight + glow bloom ── */}
                            <SpotlightBloom hovered={portraitHovered} />

                            {/* ── Energy aura halo (hover-only) ── */}
                            <div className="absolute inset-0 z-[6] pointer-events-none">
                                <EnergyAura visible={portraitHovered} />
                            </div>

                            {/* ── Portrait with parallax ── */}
                            <motion.div
                                style={{ x: portraitXS, y: portraitYS }}
                                className="relative z-10 h-full flex items-end justify-center"
                            >
                                <motion.img
                                    src={heroImg}
                                    alt="Jenny — available for hire"
                                    draggable={false}
                                    className="hireme-portrait block select-none cursor-crosshair"
                                    style={{
                                        filter: portraitHovered
                                            ? "drop-shadow(0 0 36px rgba(255,107,44,0.55)) drop-shadow(0 24px 52px rgba(0,0,0,0.65))"
                                            : "drop-shadow(0 20px 44px rgba(0,0,0,0.58))",
                                        transition: "filter 0.5s ease",
                                    }}
                                    initial={{ scale: 0.94, opacity: 0 }}
                                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                                    transition={{ duration: 0.8, delay: 0.22, ease: EASE }}
                                    onHoverStart={() => setPortraitHovered(true)}
                                    onHoverEnd={() => setPortraitHovered(false)}
                                    whileHover={{ scale: 1.025, y: -6 }}
                                />
                            </motion.div>

                            {/* ── Hover inner-rim glow on the left pane ── */}
                            <AnimatePresence>
                                {portraitHovered && (
                                    <motion.div
                                        aria-hidden="true"
                                        className="absolute inset-0 pointer-events-none z-20
                                                   rounded-4xl lg:rounded-none lg:rounded-l-4xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        style={{
                                            boxShadow: "inset 0 0 60px rgba(255,107,44,0.18)",
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* ════════════════════════════════════════════════════
                            RIGHT — Copy, glassmorphism stats, CTA
                        ════════════════════════════════════════════════════ */}
                        <div className="flex flex-col justify-center px-8 py-12 md:px-12 lg:px-14 lg:py-16">

                            {/* Eyebrow */}
                            <motion.p
                                initial={{ opacity: 0, x: 16 }}
                                animate={inView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.48, delay: 0.18, ease: EASE }}
                                className="hireme-eyebrow mb-3 text-[12px] font-bold uppercase tracking-[0.2em]"
                            >
                                Open to opportunities
                            </motion.p>

                            {/* Headline */}
                            <motion.h2
                                initial={{ opacity: 0, y: 16 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.26, ease: EASE }}
                                className="hireme-title mb-6 font-black leading-[1.05] tracking-tight whitespace-nowrap"
                            >
                                Why <span className="hireme-title-accent">Hire me?</span>
                            </motion.h2>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 12 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.55, delay: 0.34, ease: EASE }}
                                className="hireme-description mb-10 leading-[1.72] text-[15px] md:text-[16px]"
                            >
                                I design and build real-world engineering systems — from embedded firmware
                                and IoT architectures to AI-powered industrial applications. My work focuses
                                on reliability, scalability, and practical deployment.
                            </motion.p>

                            {/* Glassmorphism stat cards 2×2 */}
                            <motion.div
                                className="mb-10 grid grid-cols-2 gap-4 md:gap-5"
                                initial={{ opacity: 0 }}
                                animate={inView ? { opacity: 1 } : {}}
                                transition={{ delay: 0.38 }}
                            >
                                {STATS.map((s, idx) => (
                                    <StatBlock
                                        key={s.label}
                                        index={idx}
                                        value={s.value}
                                        label={s.label}
                                        delay={s.delay}
                                        mouseX={mouseX}
                                        mouseY={mouseY}
                                    />
                                ))}
                            </motion.div>

                            {/* Thin accent divider */}
                            <motion.div
                                className="hireme-divider mb-10 h-px w-full"
                                initial={{ scaleX: 0, originX: 0 }}
                                animate={inView ? { scaleX: 1 } : {}}
                                transition={{ duration: 0.62, delay: 0.72 }}
                            />

                            {/* Split CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
                                className="flex flex-col items-center w-full"
                            >
                                <Suspense fallback={<div className="h-[58px] w-full max-w-[420px]" />}>
                                    <SplitCTAButton />
                                </Suspense>

                                <motion.p
                                    className="mt-5 text-[11px] uppercase font-semibold tracking-wider text-white/40"
                                    initial={{ opacity: 0 }}
                                    animate={inView ? { opacity: 1 } : {}}
                                    transition={{ delay: 1.1 }}
                                >
                                    Available for internships &amp; full-time roles
                                </motion.p>
                            </motion.div>

                        </div>
                    </div>
                </motion.div>
            </div>
            </section>
        </>
    );
}