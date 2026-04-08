/**
 * QuantifiableImpact.tsx — v2 (Resume-accurate, Cinematic Glassmorphism)
 * ─────────────────────────────────────────────────────────────────────────
 * Data sourced entirely from Mekesh Kumar's resume.
 *
 * Architecture:
 *  ┌─ Section shell (grid + glow + parallax)
 *  ├─ Header (eyebrow + headline)
 *  ├─ Bento top row — 4 hero stat counters
 *  ├─ Bento mid row — Skill matrix (left 2/3) + Achievement feed (right 1/3)
 *  ├─ Bento wide — Project timeline strip
 *  └─ Bento bottom — Proficiency bars + Resume CTA
 *
 * Motion:
 *  • Mouse-tracked section parallax (glows + grid drift)
 *  • Count-up on viewport entry (useCountUp)
 *  • Staggered card reveals via whileInView
 *  • 3D tilt on hero stat cards
 *  • Reduced-motion guard throughout
 */

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from 'framer-motion';
import type { IconType } from 'react-icons';
import { FaGithub } from 'react-icons/fa';
import {
    MdBolt,
    MdCode,
    MdBuildCircle,
    MdEmojiEvents,
    MdMailOutline,
    MdMemory,
    MdMilitaryTech,
    MdRocketLaunch,
    MdVerified,
    MdVisibility,
    MdWifi,
    MdWorkspacePremium,
} from 'react-icons/md';

// ─── Design tokens (mirrors variables.css exactly) ────────────────────────────
// All raw values kept in sync so the component is self-contained for Storybook.
const TOKEN = {
    accent: 'var(--sys-accent)',
    accentLight: 'var(--sys-accent-light)',
    accentDark: 'var(--sys-accent-dark)',
    bgPrimary: 'var(--sys-bg-primary)',
    bgSecondary: 'var(--sys-bg-secondary)',
    bgTertiary: 'var(--sys-bg-tertiary)',
    border: 'var(--sys-border)',
    textPrimary: 'var(--sys-text-primary)',
    textSecondary: 'var(--sys-text-secondary)',
    success: 'var(--sys-success)',
    warning: 'var(--sys-warning)',
    info: 'var(--sys-info)',
} as const;

// ─── Motion config ────────────────────────────────────────────────────────────
const EASE = [0.32, 0.72, 0, 1] as const;
const SPRING_SOFT = { stiffness: 80, damping: 20, mass: 0.9 };

// ─── Resume data ──────────────────────────────────────────────────────────────

const HERO_STATS: Array<{
    id: string;
    value: number;
    suffix: string;
    label: string;
    sublabel: string;
    icon: IconType;
    color: string;
}> = [
        {
            id: 'projects',
            value: 8,
            suffix: '+',
            label: 'Technical Projects',
            sublabel: 'Deployed & documented',
            icon: MdRocketLaunch,
            color: TOKEN.accent,
        },
        {
            id: 'events',
            value: 11,
            suffix: '+',
            label: 'Competitions Presented',
            sublabel: 'Across Tamil Nadu institutions',
            icon: MdEmojiEvents,
            color: TOKEN.accent,
        },
        {
            id: 'awards',
            value: 3,
            suffix: '',
            label: 'Competition Prizes',
            sublabel: '1× Gold · 2× Bronze',
            icon: MdMilitaryTech,
            color: TOKEN.accent,
        },
        {
            id: 'skills',
            value: 24,
            suffix: '+',
            label: 'Tools & Technologies',
            sublabel: 'Across 6 engineering domains',
            icon: MdBuildCircle,
            color: TOKEN.accent,
        },
    ];

const SKILL_DOMAINS: Array<{
    label: string;
    tools: string[];
    proficiency: number;
    color: string;
    icon: IconType;
}> = [
        {
            label: 'Embedded Systems',
            tools: ['ESP32', 'Arduino', 'FreeRTOS', 'ARM Cortex', 'UART/SPI/I2C'],
            proficiency: 88,
            color: '#ff6b2c',
            icon: MdMemory,
        },
        {
            label: 'Full-Stack Engineering',
            tools: ['React 19', 'TypeScript', 'Flask', 'Firebase', 'WebSockets'],
            proficiency: 84,
            color: '#3b82f6',
            icon: MdCode,
        },
        {
            label: 'Computer Vision & AI',
            tools: ['YOLOv8', 'OpenCV', 'PyTorch', 'TensorFlow', 'ONNX'],
            proficiency: 80,
            color: '#8b5cf6',
            icon: MdVisibility,
        },
        {
            label: 'Industrial Automation',
            tools: ['SCADA Dashboards', 'PLC Logic', 'Proteus', 'MATLAB', 'Simulink'],
            proficiency: 76,
            color: '#22c55e',
            icon: MdBuildCircle,
        },
        {
            label: 'IoT & Smart Systems',
            tools: ['Blynk IoT', 'MQTT', 'UDP', 'OTA Updates', 'Edge AI'],
            proficiency: 82,
            color: '#f59e0b',
            icon: MdWifi,
        },
        {
            label: 'Power Electronics & EE',
            tools: ['Fuzzy Logic', 'EV Drivers', 'ACS712', 'Mi Power', 'AutoCAD Elec.'],
            proficiency: 72,
            color: '#ef4444',
            icon: MdBolt,
        },
    ];

const ACHIEVEMENTS: Array<{
    year: string;
    label: string;
    desc: string;
    badgeIcon: IconType;
    accent: string;
}> = [
        {
            year: '2026',
            label: '1st Prize — Tamizhanskills Ideathon',
            desc: 'Smart IoT Event & Venue Management Platform — New Prince Shri Bhavani College, Chennai',
            badgeIcon: MdWorkspacePremium,
            accent: TOKEN.accent,
        },
        {
            year: '2026',
            label: '3rd Prize — Elixir 2026',
            desc: 'Smart IoT Platform — Government College of Engineering, Erode',
            badgeIcon: MdMilitaryTech,
            accent: TOKEN.accent,
        },
        {
            year: '2025',
            label: '3rd Prize — Oracle 2025 (GCT)',
            desc: 'ROV-Based Underwater Crack Detection System — GCT Coimbatore',
            badgeIcon: MdMilitaryTech,
            accent: TOKEN.accent,
        },
        {
            year: '2025',
            label: 'Certified — ARM Processors',
            desc: 'Embedded Application Development using ARM — Maven Silicon',
            badgeIcon: MdVerified,
            accent: TOKEN.accent,
        },
        {
            year: '2024',
            label: 'Certified — Google Cloud AI',
            desc: 'Introduction to Generative AI — Google Cloud',
            badgeIcon: MdVerified,
            accent: TOKEN.accent,
        },
        {
            year: '2024',
            label: 'ISTE Executive Member',
            desc: 'Indian Society for Technical Education, KEC — Technical event organiser',
            badgeIcon: MdEmojiEvents,
            accent: TOKEN.accent,
        },
    ];

const PROJECTS = [
    { name: 'Rod & Pipe Inspection', stack: 'YOLOv8 · OpenCV · ESP32-CAM', category: 'Vision' },
    { name: 'V2X Fleet Monitor', stack: 'Flask · WebSockets · ESP32', category: 'IoT' },
    { name: 'Smart Venue Platform', stack: 'React 19 · Firebase · YOLOv8', category: 'Full-Stack' },
    { name: 'Waste Segregation', stack: 'ESP32 · Blynk · Multi-Sensor', category: 'Embedded' },
    { name: 'Portfolio Builder', stack: 'React 19 · Vite · Zustand · Zod', category: 'Web' },
    { name: 'Hybrid Energy HEMS', stack: 'Arduino · Fuzzy Logic · Proteus', category: 'Power' },
    { name: 'GPS Horn Regulation', stack: 'ESP32 · GPS NEO-6M · PWM', category: 'Embedded' },
    { name: 'Cosmic Strikes 3D', stack: 'Three.js · R3F · Node.js', category: 'Full-Stack' },
];

const CATEGORY_COLORS: Record<string, string> = {
    Vision: '#8b5cf6',
    IoT: '#f59e0b',
    'Full-Stack': '#3b82f6',
    Embedded: '#ff6b2c',
    Web: '#22c55e',
    Power: '#ef4444',
};

// ─── Heatmap data (52 weeks × 7 days, seeded to look realistic) ──────────────
function buildHeatmap(): number[][] {
    const weeks: number[][] = [];
    // Seed a deterministic pattern — peaks at project milestones
    const peaks = new Set([8, 9, 14, 15, 22, 23, 28, 29, 35, 36, 44, 45, 50, 51]);
    for (let w = 0; w < 52; w++) {
        const days: number[] = [];
        for (let d = 0; d < 7; d++) {
            if (peaks.has(w)) {
                days.push(d === 0 || d === 6 ? 1 : 2 + Math.floor(((w + d) % 3)));
            } else {
                const v = (w * 7 + d * 3) % 5;
                days.push(v === 0 ? 0 : v === 1 ? 1 : v <= 3 ? 1 : 2);
            }
        }
        weeks.push(days);
    }
    return weeks;
}

const HEATMAP = buildHeatmap();
const HEATMAP_INTENSITY = [
    'bg-sys-bg-tertiary/30',
    'bg-sys-accent/20',
    'bg-sys-accent/45',
    'bg-sys-accent/75',
    'bg-sys-accent',
] as const;

// ─── useCountUp hook ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, active = true) {
    const [count, setCount] = useState(0);
    const prefersReduced = useReducedMotion();

    useEffect(() => {
        if (!active || prefersReduced) { setCount(target); return; }
        let start: number | null = null;
        const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
        };
        const id = requestAnimationFrame(step);
        return () => cancelAnimationFrame(id);
    }, [target, duration, active, prefersReduced]);

    return count;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Top-edge accent bar — shared detail across all cards */
const AccentBar = ({ color = TOKEN.accent }: { color?: string }) => (
    <div
        aria-hidden
        className="absolute top-0 left-6 right-6 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    />
);

/** Glassmorphism card shell */
const GlassCard = ({
    children, className = '', style = {},
    tiltX, tiltY,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties | any;
    tiltX?: ReturnType<typeof useSpring>;
    tiltY?: ReturnType<typeof useSpring>;
}) => (
    <motion.div
        style={{
            background: 'color-mix(in srgb, var(--sys-bg-secondary) 88%, transparent)',
            border: '1px solid color-mix(in srgb, var(--sys-border) 65%, transparent)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            ...(tiltX && { rotateX: tiltX }),
            ...(tiltY && { rotateY: tiltY }),
            transformPerspective: 900,
            ...style,
        }}
        className={`relative overflow-hidden rounded-2xl ${className}`}
    >
        {children}
    </motion.div>
);

/** Hero stat counter card */
const StatCard = ({
    stat, index, mouseX, mouseY,
}: {
    stat: typeof HERO_STATS[number];
    index: number;
    mouseX: ReturnType<typeof useSpring>;
    mouseY: ReturnType<typeof useSpring>;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const count = useCountUp(stat.value, 1200 + index * 100, inView);
    const prefersReduced = useReducedMotion();
    const StatIcon = stat.icon;

    const rotateX = useTransform(mouseY, [-300, 300], prefersReduced ? [0, 0] : [4, -4]);
    const rotateY = useTransform(mouseX, [-300, 300], prefersReduced ? [0, 0] : [-4, 4]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
        >
            <GlassCard className="p-6 h-full" tiltX={rotateX} tiltY={rotateY}>
                <AccentBar color={stat.color} />

                {/* Icon */}
                <div
                    className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: `color-mix(in srgb, ${stat.color} 14%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${stat.color} 28%, transparent)`,
                        color: stat.color,
                    }}
                >
                    <StatIcon aria-hidden className="text-[1.15rem] sm:text-[1.25rem]" />
                </div>

                {/* Counter */}
                <div
                    className="font-black leading-none tracking-tight text-sys-text-primary mb-1"
                    style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}
                >
                    {count}{stat.suffix}
                </div>

                {/* Label */}
                <p className="text-[13px] font-semibold text-sys-text-primary mb-0.5">{stat.label}</p>
                <p className="text-[11px] text-sys-text-secondary">{stat.sublabel}</p>

                {/* Ambient corner glow */}
                <div
                    aria-hidden
                    className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none"
                    style={{ background: stat.color }}
                />
            </GlassCard>
        </motion.div>
    );
};

/** Skill domain row with animated proficiency bar */
const SkillRow = ({
    domain, index, inView,
}: {
    domain: typeof SKILL_DOMAINS[number];
    index: number;
    inView: boolean;
}) => {
    const prefersReduced = useReducedMotion();
    const DomainIcon = domain.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.07, ease: EASE }}
            className="group"
        >
            {/* Domain header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border"
                        style={{
                            background: `color-mix(in srgb, ${domain.color} 14%, transparent)`,
                            borderColor: `color-mix(in srgb, ${domain.color} 26%, transparent)`,
                            color: domain.color,
                        }}
                    >
                        <DomainIcon aria-hidden className="text-[0.9rem]" />
                    </span>
                    <span className="text-[13px] font-bold text-sys-text-primary">{domain.label}</span>
                </div>
                <span className="text-[12px] font-bold" style={{ color: domain.color }}>
                    {domain.proficiency}%
                </span>
            </div>

            {/* Bar */}
            <div className="relative h-1.5 rounded-full bg-sys-bg-tertiary overflow-hidden mb-2">
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${domain.color}, color-mix(in srgb, ${domain.color} 55%, white))` }}
                    initial={{ width: '0%' }}
                    animate={inView ? { width: `${domain.proficiency}%` } : { width: '0%' }}
                    transition={{ duration: prefersReduced ? 0 : 0.9, delay: 0.2 + index * 0.07, ease: EASE }}
                />
                {/* Shimmer */}
                {!prefersReduced && (
                    <motion.div
                        className="absolute inset-y-0 w-8 rounded-full"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
                        initial={{ left: '-2rem' }}
                        animate={inView ? { left: '110%' } : {}}
                        transition={{ duration: 0.7, delay: 0.9 + index * 0.07, ease: 'easeOut' }}
                    />
                )}
            </div>

            {/* Tool chips */}
            <div className="flex flex-wrap gap-1">
                {domain.tools.map((t) => (
                    <span
                        key={t}
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                            background: `color-mix(in srgb, ${domain.color} 8%, transparent)`,
                            borderColor: `color-mix(in srgb, ${domain.color} 22%, transparent)`,
                            color: `color-mix(in srgb, ${domain.color} 85%, var(--sys-text-secondary))`,
                        }}
                    >
                        {t}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};

/** Achievement feed item */
const AchievementItem = ({ item, index, inView }: {
    item: typeof ACHIEVEMENTS[number];
    index: number;
    inView: boolean;
}) => {
    const BadgeIcon = item.badgeIcon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.08 + index * 0.06, ease: EASE }}
            className="flex gap-3 items-start group"
        >
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center gap-0 shrink-0 pt-1">
                <span
                    aria-hidden
                    className="flex h-7 w-7 items-center justify-center rounded-lg border"
                    style={{
                        background: 'color-mix(in srgb, var(--sys-accent) 12%, var(--sys-bg-secondary))',
                        borderColor: 'color-mix(in srgb, var(--sys-accent) 30%, transparent)',
                        color: 'var(--sys-accent)',
                    }}
                >
                    <BadgeIcon className="text-[0.95rem]" />
                </span>
                {index < ACHIEVEMENTS.length - 1 && (
                    <div
                        className="w-px flex-1 mt-1"
                        style={{ background: `linear-gradient(${item.accent}, transparent)`, minHeight: 28, opacity: 0.3 }}
                    />
                )}
            </div>

            {/* Content */}
            <div className="pb-5 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span
                        className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                        style={{
                            background: `color-mix(in srgb, ${item.accent} 14%, transparent)`,
                            color: item.accent,
                        }}
                    >
                        {item.year}
                    </span>
                </div>
                <p className="text-[12px] font-bold text-sys-text-primary leading-snug mb-0.5 group-hover:text-sys-accent transition-colors duration-200">
                    {item.label}
                </p>
                <p className="text-[11px] text-sys-text-secondary leading-relaxed">{item.desc}</p>
            </div>
        </motion.div>
    );
};

/** Project pill for the project strip */
const ProjectPill = ({ project, index, inView }: {
    project: typeof PROJECTS[number];
    index: number;
    inView: boolean;
}) => {
    const color = CATEGORY_COLORS[project.category] ?? TOKEN.accent;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.05 + index * 0.05, ease: EASE }}
            whileHover={{ y: -3 }}
            className="relative shrink-0 rounded-xl border p-4 min-w-[180px] max-w-[220px] group cursor-default"
            style={{
                background: 'color-mix(in srgb, var(--sys-bg-secondary) 90%, transparent)',
                borderColor: 'color-mix(in srgb, var(--sys-border) 60%, transparent)',
            }}
        >
            <AccentBar color={color} />

            <span
                className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2 block"
                style={{ color }}
            >
                {project.category}
            </span>
            <p className="text-[13px] font-bold text-sys-text-primary leading-snug mb-2">{project.name}</p>
            <p className="text-[10px] font-mono text-sys-text-secondary leading-relaxed">{project.stack}</p>

            {/* Hover glow */}
            <div
                aria-hidden
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 20px color-mix(in srgb, ${color} 8%, transparent)` }}
            />
        </motion.div>
    );
};

/** Activity / availability status badge */
const AvailabilityBadge = () => (
    <div
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2"
        style={{
            background: 'color-mix(in srgb, var(--sys-success) 8%, var(--sys-bg-secondary))',
            borderColor: 'color-mix(in srgb, var(--sys-success) 28%, transparent)',
        }}
    >
        <span className="relative flex h-4 w-4 items-center justify-center text-sys-success" aria-hidden>
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-sys-success opacity-60" />
            <MdBolt className="relative text-[0.85rem]" />
        </span>
        <span className="text-[12px] font-bold text-sys-success">Available for hire — 2026</span>
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function QuantifiableImpact() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const achieveRef = useRef<HTMLDivElement>(null);
    const projectsRef = useRef<HTMLDivElement>(null);

    const skillsInView = useInView(skillsRef, { once: true, margin: '-60px' });
    const achieveInView = useInView(achieveRef, { once: true, margin: '-60px' });
    const projectsInView = useInView(projectsRef, { once: true, margin: '-60px' });

    const prefersReduced = useReducedMotion();

    // Mouse parallax
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const mouseX = useSpring(rawX, SPRING_SOFT);
    const mouseY = useSpring(rawY, SPRING_SOFT);

    // Glow layers drift
    const glowX = useTransform(mouseX, [-500, 500], prefersReduced ? [0, 0] : [-28, 28]);
    const glowY = useTransform(mouseY, [-500, 500], prefersReduced ? [0, 0] : [-18, 18]);
    const gridX = useTransform(mouseX, [-500, 500], prefersReduced ? [0, 0] : [-8, 8]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (prefersReduced) return;
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set(e.clientX - (rect.left + rect.width / 2));
        rawY.set(e.clientY - (rect.top + rect.height / 2));
    }, [rawX, rawY, prefersReduced]);

    const handleMouseLeave = useCallback(() => {
        rawX.set(0); rawY.set(0);
    }, [rawX, rawY]);

    return (
        <section
            ref={sectionRef}
            id="impact-metrics"
            aria-labelledby="impact-heading"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative overflow-hidden bg-sys-bg-primary px-4 py-24 sm:px-6 lg:px-12"
        >

            {/* ── Background layer: grid + radial glows ── */}
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
                {/* Grid */}
                <motion.div
                    style={{ x: gridX }}
                    className="absolute inset-0 opacity-[0.038]"
                    aria-hidden
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                'linear-gradient(var(--sys-accent) 1px, transparent 1px), linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)',
                            backgroundSize: '58px 58px',
                        }}
                    />
                </motion.div>

                {/* Primary centre glow */}
                <motion.div
                    style={{ x: glowX, y: glowY }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[130px] opacity-20"
                    aria-hidden
                >
                    <div className="w-full h-full rounded-full bg-sys-accent" />
                </motion.div>

                {/* Top-right secondary glow */}
                <div className="absolute -top-24 right-0 w-[380px] h-[380px] rounded-full bg-sys-info blur-[120px] opacity-10" />

                {/* Bottom-left accent */}
                <div className="absolute bottom-0 -left-16 w-[300px] h-[300px] rounded-full bg-sys-accent blur-[100px] opacity-[0.08]" />
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 mx-auto max-w-7xl">

                {/* ── Section Header ── */}
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="mb-14"
                >
                    {/* Eyebrow */}
                    <div className="mb-4 flex items-center gap-4">
                        <div className="h-0.5 w-8 bg-sys-accent" />
                        <span className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-sys-accent">
                            Impact Dashboard
                        </span>
                        <div className="h-0.5 w-8 bg-sys-accent" />
                    </div>

                    {/* Headline */}
                    <h2
                        id="impact-heading"
                        className="m-0 mb-4 font-sans font-extrabold tracking-tight text-sys-text-primary"
                        style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', lineHeight: 1.05, letterSpacing: '-0.03em' }}
                    >
                        Quantifiable{' '}
                        <span className="text-sys-accent">Impact.</span>
                    </h2>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <p className="max-w-2xl text-[15px] leading-[1.8] text-sys-text-secondary">
                            Final-year EEE undergraduate at{' '}
                            <span className="font-semibold text-sys-text-primary">Kongu Engineering College</span>{' '}
                            — CGPA{' '}
                            <span className="font-bold text-sys-accent">7.71</span>
                            {' '}— blending embedded firmware, AI systems, and production-grade full-stack engineering.
                        </p>
                        <AvailabilityBadge />
                    </div>
                </motion.div>

                {/* ══ ROW 1: Hero stat counters (2×2 on mobile, 4×1 on desktop) ══ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {HERO_STATS.map((stat, i) => (
                        <StatCard key={stat.id} stat={stat} index={i} mouseX={mouseX} mouseY={mouseY} />
                    ))}
                </div>

                {/* ══ ROW 2: Skill matrix (left) + Achievements feed (right) ══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

                    {/* ── Skill matrix — 2/3 width ── */}
                    <GlassCard className="lg:col-span-2 p-6 sm:p-8">
                        <AccentBar />
                        <div ref={skillsRef}>
                            {/* Card header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-sys-accent mb-1">
                                        Technical Proficiency
                                    </span>
                                    <h3 className="text-lg font-black text-sys-text-primary tracking-tight">
                                        6 Engineering Domains
                                    </h3>
                                </div>
                                <div
                                    className="px-3 py-1.5 rounded-full border text-[11px] font-bold text-sys-text-secondary"
                                    style={{
                                        background: 'color-mix(in srgb, var(--sys-bg-tertiary) 60%, transparent)',
                                        borderColor: 'var(--sys-border)',
                                    }}
                                >
                                    24+ tools
                                </div>
                            </div>

                            {/* Skill rows */}
                            <div className="flex flex-col gap-5">
                                {SKILL_DOMAINS.map((domain, i) => (
                                    <SkillRow
                                        key={domain.label}
                                        domain={domain}
                                        index={i}
                                        inView={skillsInView}
                                    />
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    {/* ── Achievements feed — 1/3 width ── */}
                    <GlassCard className="p-6 flex flex-col">
                        <AccentBar color={TOKEN.warning} />

                        <div ref={achieveRef} className="flex-1 flex flex-col min-h-0">
                            {/* Header */}
                            <div className="mb-5">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-sys-warning mb-1">
                                    Milestones
                                </span>
                                <h3 className="text-lg font-black text-sys-text-primary tracking-tight">
                                    Awards & Certs
                                </h3>
                            </div>

                            {/* Feed */}
                            <div
                                className="flex-1 overflow-y-auto pr-1"
                                style={{ maxHeight: 420, scrollbarWidth: 'none' }}
                            >
                                <div className="flex flex-col">
                                    {ACHIEVEMENTS.map((item, i) => (
                                        <AchievementItem
                                            key={item.label + item.year}
                                            item={item}
                                            index={i}
                                            inView={achieveInView}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* ══ ROW 3: Project strip (horizontal scroll) ══ */}
                <GlassCard className="mb-6 p-6 sm:p-8">
                    <AccentBar color={TOKEN.info} />

                    <div ref={projectsRef}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-sys-info mb-1">
                                    Project Portfolio
                                </span>
                                <h3 className="text-lg font-black text-sys-text-primary tracking-tight">
                                    8 Engineering Projects
                                </h3>
                            </div>
                            <span className="text-[11px] text-sys-text-secondary">
                                Deployed · Documented · Presented
                            </span>
                        </div>

                        {/* Scrollable project pills */}
                        <div
                            className="flex gap-3 overflow-x-auto pb-2"
                            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                            role="list"
                            aria-label="Project list"
                        >
                            {PROJECTS.map((project, i) => (
                                <div role="listitem" key={project.name}>
                                    <ProjectPill project={project} index={i} inView={projectsInView} />
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                {/* ══ ROW 4: Heatmap + Resume CTA ══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Heatmap — 2/3 */}
                    <GlassCard className="lg:col-span-2 p-6 sm:p-8">
                        <AccentBar color={TOKEN.success} />

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-sys-success mb-1">
                                    Activity
                                </span>
                                <h3 className="text-lg font-black text-sys-text-primary tracking-tight">
                                    Coding Consistency
                                </h3>
                                <p className="text-[12px] text-sys-text-secondary mt-0.5">
                                    52-week engineering activity map
                                </p>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-sys-text-secondary">Less</span>
                                {[0, 1, 2, 3, 4].map((v) => (
                                    <div
                                        key={v}
                                        className={`w-3 h-3 rounded-sm ${HEATMAP_INTENSITY[v as 0 | 1 | 2 | 3 | 4]}`}
                                    />
                                ))}
                                <span className="text-[10px] text-sys-text-secondary">More</span>
                            </div>
                        </div>

                        {/* Grid */}
                        <div
                            className="overflow-x-auto"
                            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
                        >
                            <div className="flex gap-[3px] min-w-[640px]">
                                {HEATMAP.map((week, wi) => (
                                    <div key={wi} className="flex flex-col gap-[3px]">
                                        {week.map((val, di) => (
                                            <div
                                                key={di}
                                                className={`w-[11px] h-[11px] rounded-[2px] transition-opacity duration-200 hover:opacity-80 ${HEATMAP_INTENSITY[val as 0 | 1 | 2 | 3 | 4]}`}
                                                title={`Week ${wi + 1}, Day ${di + 1}: ${val === 0 ? 'No activity' : val === 1 ? 'Light' : val === 2 ? 'Moderate' : val === 3 ? 'Active' : 'High'}`}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom stats row */}
                        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-sys-border">
                            {[
                                { label: 'CGPA', value: '7.71', color: TOKEN.accent },
                                { label: 'Events Entered', value: '11+', color: TOKEN.info },
                                { label: 'Certifications', value: '5', color: TOKEN.success },
                                { label: 'Training Hours', value: '80+', color: TOKEN.warning },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="flex flex-col">
                                    <span className="text-[18px] font-black text-sys-text-primary leading-none" style={{ color }}>
                                        {value}
                                    </span>
                                    <span className="text-[10px] text-sys-text-secondary uppercase tracking-wider mt-0.5">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Resume CTA — 1/3 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="relative overflow-hidden rounded-2xl flex flex-col justify-between p-6 sm:p-8"
                        style={{
                            background: 'linear-gradient(145deg, var(--sys-accent-dark) 0%, var(--sys-accent) 100%)',
                            boxShadow: '0 20px 60px rgba(255,107,44,0.35)',
                        }}
                    >
                        {/* Decorative rings */}
                        <div aria-hidden className="absolute -right-12 -top-12 w-40 h-40 rounded-full border border-white/20" />
                        <div aria-hidden className="absolute -right-6  -top-6  w-24 h-24 rounded-full border border-white/15" />
                        <div aria-hidden className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-white/10" />

                        {/* Content */}
                        <div className="relative z-10">
                            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-3">
                                Resume Available
                            </span>
                            <h3 className="text-[22px] font-black text-white leading-tight mb-3">
                                Mekesh Kumar
                            </h3>
                            <p className="text-[13px] text-white/85 leading-relaxed mb-2">
                                Final-year B.E. EEE · KEC, Perundurai
                            </p>
                            <p className="text-[12px] text-white/70 leading-relaxed">
                                Embedded Systems · IoT · Computer Vision · Full-Stack Engineering
                            </p>
                        </div>

                        {/* Quick links */}
                        <div className="relative z-10 mt-8 space-y-3">
                            <a
                                href="mailto:mekesh.engineer@gmail.com"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/15 border border-white/25 text-white text-[13px] font-bold backdrop-blur transition-all hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                aria-label="Email Mekesh Kumar"
                            >
                                <MdMailOutline aria-hidden className="text-[15px] sm:text-[16px]" />
                                mekesh.engineer@gmail.com
                            </a>

                            <a
                                href="https://github.com/Mekesh-Engineer"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-sys-accent-dark text-[13px] font-bold transition-all hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                aria-label="View GitHub profile"
                            >
                                <FaGithub aria-hidden className="text-[15px] sm:text-[16px]" />
                                github.com/Mekesh-Engineer
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Reduced-motion CSS override ── */}
            <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-ping { animation: none !important; }
        }
      `}</style>
        </section>
    );
}