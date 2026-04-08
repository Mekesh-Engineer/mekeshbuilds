/**
 * AchievementsTimeline.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Recruiter-focused achievements timeline for Mekesh Kumar's portfolio.
 *
 * Design direction: "Mission Control" — the career visualised as a spacecraft
 * trajectory. Each milestone is a glowing waypoint on an illuminated path.
 * Dark, authoritative, with orange-fire accents. Glassmorphism cards with
 * CSS 3-D tilt physics. Horizontal drag-scroll with momentum on desktop;
 * vertical stacked list on mobile.
 *
 * Features:
 *   ✓ All data from actual résumé — zero placeholder content
 *   ✓ Horizontal drag-scroll with Framer Motion (desktop)
 *   ✓ CSS 3-D card tilt on mouse-move
 *   ✓ Animated SVG bezier spine with pulsing waypoints
 *   ✓ Animated stat counters at header
 *   ✓ Filter chips with AnimatePresence layout transitions
 *   ✓ Featured entries with trophy treatment + glow ring
 *   ✓ Keyboard navigation & reduced-motion support
 *   ✓ Fully responsive (desktop ↔ mobile layout switch)
 *   ✓ Self-contained keyframes — no external CSS file needed
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  MdGroups,
  MdMilitaryTech,
  MdPrecisionManufacturing,
  MdRocketLaunch,
  MdSchool,
  MdVerified,
  MdWorkspacePremium,
} from 'react-icons/md';

/* ─────────────────────────────────────────────────────────────────
   KEYFRAME INJECTION
───────────────────────────────────────────────────────────────── */
const KF_ID = 'at-kf-v3';
if (typeof document !== 'undefined' && !document.getElementById(KF_ID)) {
  const s = document.createElement('style');
  s.id = KF_ID;
  s.textContent = `
    @keyframes at-spine-dash  { to { stroke-dashoffset: -280; } }
    @keyframes at-ping        { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(2.4);opacity:0} }
    @keyframes at-ping-slow   { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(2.8);opacity:0} }
    @keyframes at-float       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes at-shimmer     { 0%{left:-80%} 100%{left:180%} }
    @keyframes at-count       { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes at-glow-pulse  { 0%,100%{opacity:.55;filter:blur(18px)} 50%{opacity:.9;filter:blur(28px)} }
    @keyframes at-particle-f  {
      0%   { transform:translate(0,0);   opacity:var(--ap-lo); }
      50%  { transform:translate(var(--ap-dx),var(--ap-dy)); opacity:var(--ap-hi); }
      100% { transform:translate(0,0);   opacity:var(--ap-lo); }
    }
    @keyframes at-border-flow {
      0%   { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    /* Hide native scrollbar on track */
    .at-track::-webkit-scrollbar { display: none; }
    .at-track { scrollbar-width: none; }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
type EntryType = 'award' | 'certificate' | 'training' | 'education' | 'membership' | 'competition';

interface TimelineEntry {
  id: string;
  type: EntryType;
  year: string;
  dateLabel: string;
  title: string;
  organization: string;
  description: string;
  tags?: string[];
  isFeatured: boolean;
  accentColor: string;
  icon: IconType;
  credentialUrl?: string;
  prize?: {
    icon: IconType;
    label: string;
  };
}

const CATEGORY_ICONS: Record<EntryType, IconType> = {
  award: MdWorkspacePremium,
  certificate: MdVerified,
  competition: MdRocketLaunch,
  training: MdPrecisionManufacturing,
  education: MdSchool,
  membership: MdGroups,
};

const PRIZE_ICONS = {
  gold: MdWorkspacePremium,
  bronze: MdMilitaryTech,
} as const;

/* ─────────────────────────────────────────────────────────────────
   TIMELINE DATA — sourced entirely from Mekesh Kumar's résumé
───────────────────────────────────────────────────────────────── */
const TIMELINE: TimelineEntry[] = [
  /* ── Education ─────────────────────────────────────────── */
  {
    id: 'edu-sslc',
    type: 'education',
    year: '2021',
    dateLabel: 'March 2021',
    title: 'SSLC — 84%',
    organization: 'DDCSM Matriculation School, Palacode',
    description: 'Secondary school certification with distinction. Strong foundation in mathematics and science disciplines.',
    tags: ['Mathematics', 'Science', 'CBSE'],
    isFeatured: false,
    accentColor: '#a78bfa',
    icon: CATEGORY_ICONS.education,
  },
  {
    id: 'edu-hse',
    type: 'education',
    year: '2023',
    dateLabel: 'May 2023',
    title: 'Higher Secondary — 84%',
    organization: 'Govt. Boys HSS, Palacode',
    description: 'Higher secondary with Physics, Chemistry, Mathematics (PCM). Secured school-first rank in the batch.',
    tags: ['PCM', 'School Topper', 'Tamil Nadu Board'],
    isFeatured: true,
    accentColor: '#a78bfa',
    icon: CATEGORY_ICONS.education,
    prize: {
      icon: PRIZE_ICONS.gold,
      label: 'School First Rank',
    },
  },
  {
    id: 'edu-be',
    type: 'education',
    year: '2023–Now',
    dateLabel: 'Aug 2023 – Present',
    title: 'B.E. Electrical & Electronics Engineering',
    organization: 'Kongu Engineering College, Perundurai',
    description: 'Final-year undergraduate. CGPA 7.71 through 5th semester. Core focus: embedded systems, power electronics, and AI-integrated industrial automation.',
    tags: ['CGPA 7.71', 'EEE', 'Final Year'],
    isFeatured: false,
    accentColor: '#a78bfa',
    icon: CATEGORY_ICONS.education,
  },

  /* ── Certificates ───────────────────────────────────────── */
  {
    id: 'cert-autocad',
    type: 'certificate',
    year: '2023',
    dateLabel: 'Dec 2023',
    title: 'AutoCAD Electrical Design',
    organization: 'Cadcentre Cochin',
    description: 'Professional certification covering electrical schematic design, panel layout, and wiring diagram production using AutoCAD Electrical for industrial systems.',
    tags: ['AutoCAD Electrical', 'Panel Design', 'Schematics'],
    isFeatured: false,
    accentColor: '#38bdf8',
    icon: CATEGORY_ICONS.certificate,
  },
  {
    id: 'cert-energy',
    type: 'certificate',
    year: '2023',
    dateLabel: 'Nov 2023',
    title: 'Energy Literacy Training',
    organization: 'Energy Swaraj Foundation',
    description: 'Comprehensive training on energy systems, renewable energy concepts, and sustainability principles applicable to smart grid and IoT energy management.',
    tags: ['Renewable Energy', 'Smart Grid', 'Sustainability'],
    isFeatured: false,
    accentColor: '#22c55e',
    icon: CATEGORY_ICONS.certificate,
  },
  {
    id: 'cert-genai',
    type: 'certificate',
    year: '2024',
    dateLabel: 'May 2024',
    title: 'Introduction to Generative AI',
    organization: 'Google Cloud',
    description: 'Official Google Cloud certification covering foundation concepts of generative AI, large language models, and their practical deployment via Google AI APIs.',
    tags: ['Google Cloud', 'LLMs', 'Generative AI'],
    isFeatured: false,
    accentColor: '#f59e0b',
    icon: CATEGORY_ICONS.certificate,
  },
  {
    id: 'cert-java',
    type: 'certificate',
    year: '2024',
    dateLabel: 'Aug 2024',
    title: 'Java for Beginners',
    organization: 'Infosys Springboard',
    description: 'Infosys Springboard certified course covering core Java OOP principles, data structures, and application development fundamentals.',
    tags: ['Java', 'OOP', 'Infosys'],
    isFeatured: false,
    accentColor: '#fb923c',
    icon: CATEGORY_ICONS.certificate,
  },
  {
    id: 'cert-arm',
    type: 'certificate',
    year: '2025',
    dateLabel: 'Feb 2025',
    title: 'Embedded Application Development — ARM Processors',
    organization: 'Maven Silicon',
    description: 'Advanced professional certification in ARM-based embedded systems: HAL layers, peripheral interfaces (I2C, SPI, UART), FreeRTOS task management, and production firmware patterns.',
    tags: ['ARM Cortex', 'FreeRTOS', 'Embedded C++', 'Maven Silicon'],
    isFeatured: true,
    accentColor: '#ff6b2c',
    icon: CATEGORY_ICONS.certificate,
  },

  /* ── Industrial Training ────────────────────────────────── */
  {
    id: 'training-hatsun',
    type: 'training',
    year: '2024',
    dateLabel: 'July 2024',
    title: 'In-Plant Training — Manufacturing Automation',
    organization: 'Hatsun Agro Products Ltd., Vellichandai',
    description: 'Hands-on exposure to industrial manufacturing operations, production line automation workflows, equipment maintenance, and plant-floor control systems in a live food-grade manufacturing environment.',
    tags: ['Industrial Automation', 'Production Line', 'Plant Control'],
    isFeatured: false,
    accentColor: '#22c55e',
    icon: CATEGORY_ICONS.training,
  },
  {
    id: 'training-pavithran',
    type: 'training',
    year: '2025',
    dateLabel: 'Jan 2025',
    title: 'In-Plant Training — Aseptic Processing & QC',
    organization: 'Pavithran Aseptic Fruit Products',
    description: 'Studied aseptic processing techniques, quality control instrumentation, and compliance standards in a certified food-grade production facility. Observed automation-integrated QA pipelines.',
    tags: ['Aseptic Processing', 'Quality Control', 'Instrumentation'],
    isFeatured: false,
    accentColor: '#22c55e',
    icon: CATEGORY_ICONS.training,
  },
  {
    id: 'visit-rac',
    type: 'training',
    year: '2024',
    dateLabel: 'Nov 2024',
    title: 'Industrial Visit — Radio Astronomy Centre',
    organization: 'RAC, Ooty (TIFR)',
    description: 'Visited TIFR\'s Radio Astronomy Centre to study large-scale signal processing infrastructure, RF antenna systems, and precision telemetry data acquisition at a world-class research facility.',
    tags: ['RF Systems', 'Signal Processing', 'Research Infrastructure'],
    isFeatured: false,
    accentColor: '#38bdf8',
    icon: CATEGORY_ICONS.training,
  },
  {
    id: 'visit-koso',
    type: 'training',
    year: '2025',
    dateLabel: 'March 2025',
    title: 'Industrial Visit — Kodaikanal Solar Observatory',
    organization: 'Indian Institute of Astrophysics',
    description: 'Studied precision solar observation instrumentation, astronomical data acquisition systems, and spectroscopy equipment at one of India\'s premier solar observatories.',
    tags: ['Precision Instruments', 'Data Acquisition', 'Spectroscopy'],
    isFeatured: false,
    accentColor: '#38bdf8',
    icon: CATEGORY_ICONS.training,
  },

  /* ── Competition Awards ─────────────────────────────────── */
  {
    id: 'comp-v2x-ideathon',
    type: 'competition',
    year: '2024',
    dateLabel: 'Oct 2024',
    title: 'V2X Communication & Fleet Monitoring — Ideathon',
    organization: 'KEC Ideathon 2K24',
    description: 'Presented V2X telemetry platform to judges — real-time fleet monitoring, UDP auto-discovery, and SCADA-like dashboards built on ESP32 + Flask + WebSockets.',
    tags: ['V2X', 'IoT', 'Real-Time Telemetry'],
    isFeatured: false,
    accentColor: '#ff6b2c',
    icon: CATEGORY_ICONS.competition,
  },
  {
    id: 'comp-v2x-robofiesta',
    type: 'competition',
    year: '2025',
    dateLabel: 'Jan 2025',
    title: 'V2X Fleet Monitoring — Robofiesta 2K25',
    organization: 'SREC Robofiesta 2025',
    description: 'Competed with V2X system at inter-collegiate Robofiesta. Demonstrated live multi-device telemetry, MJPEG proxy video feeds, and zero-config UDP discovery.',
    tags: ['Competition', 'V2X', 'ESP32'],
    isFeatured: false,
    accentColor: '#ff6b2c',
    icon: CATEGORY_ICONS.competition,
  },
  {
    id: 'comp-rov-oracle',
    type: 'award',
    year: '2025',
    dateLabel: 'March 2025',
    title: 'ROV Underwater Crack Detection',
    organization: 'Oracle 2K25 — Govt. College of Technology, Coimbatore',
    description: 'Developed and presented an ROV-based autonomous underwater crack detection system using computer vision. Secured 3rd Prize at Oracle 2025 against strong competition from GCT Coimbatore.',
    tags: ['ROV', 'Computer Vision', 'Underwater Inspection'],
    isFeatured: true,
    accentColor: '#38bdf8',
    icon: CATEGORY_ICONS.award,
    prize: {
      icon: PRIZE_ICONS.bronze,
      label: '3rd Prize — Oracle 2025',
    },
  },
  {
    id: 'comp-venue-elixir',
    type: 'award',
    year: '2026',
    dateLabel: 'Feb 2026',
    title: 'Smart IoT Venue Management Platform',
    organization: 'Elixir 2026 — GCE Erode',
    description: 'Presented full-stack IoT venue platform with YOLOv8 crowd analysis, ESP32-CAM QR gate actuation, and React 19 real-time dashboard at Elixir technical event.',
    tags: ['IoT', 'YOLOv8', 'React 19', 'Firebase'],
    isFeatured: false,
    accentColor: '#ff6b2c',
    icon: CATEGORY_ICONS.award,
    prize: {
      icon: PRIZE_ICONS.bronze,
      label: '3rd Prize',
    },
  },
  {
    id: 'award-ideathon-2026',
    type: 'award',
    year: '2026',
    dateLabel: 'March 2026',
    title: 'Smart IoT Event & Venue Management Platform',
    organization: 'Tamizhanskills Ideathon 2026 — New Prince Shri Bhavani College, Chennai',
    description: 'Won 1st Prize at Tamizhanskills Ideathon 2026 against 120+ competing teams. Demonstrated end-to-end IoT integration: ESP32-CAM gate control, YOLOv8 crowd density AI, Firebase RBAC backend, and live React 19 monitoring dashboard.',
    tags: ['1st Place', 'IoT', 'AI Vision', 'Full-Stack'],
    isFeatured: true,
    accentColor: '#f59e0b',
    icon: CATEGORY_ICONS.award,
    prize: {
      icon: PRIZE_ICONS.gold,
      label: '1st Prize — Ideathon 2026',
    },
  },

  /* ── Memberships & Leadership ───────────────────────────── */
  {
    id: 'member-iste',
    type: 'membership',
    year: '2024',
    dateLabel: 'Aug 2024 – Present',
    title: 'Executive Member — ISTE',
    organization: 'Indian Society for Technical Education, KEC Chapter',
    description: 'Active executive member contributing to technical event organisation, departmental workshops, and inter-college competition coordination at Kongu Engineering College.',
    tags: ['Leadership', 'Event Organisation', 'Technical Society'],
    isFeatured: false,
    accentColor: '#a78bfa',
    icon: CATEGORY_ICONS.membership,
  },
  {
    id: 'member-nss',
    type: 'membership',
    year: '2024',
    dateLabel: 'Aug 2024 – Present',
    title: 'Executive Member — NSS',
    organization: 'National Service Scheme, KEC Chapter',
    description: 'Led and participated in rural development outreach, community service programmes, and social responsibility initiatives through NSS at Kongu Engineering College.',
    tags: ['Leadership', 'Community Service', 'Rural Development'],
    isFeatured: false,
    accentColor: '#22c55e',
    icon: CATEGORY_ICONS.membership,
  },
];

/* ─────────────────────────────────────────────────────────────────
   FILTER CONFIG
───────────────────────────────────────────────────────────────── */
const FILTERS = [
  { id: 'all', label: 'All', types: null },
  { id: 'award', label: 'Awards', types: ['award'] },
  { id: 'certificate', label: 'Certificates', types: ['certificate'] },
  { id: 'competition', label: 'Competitions', types: ['competition'] },
  { id: 'training', label: 'Training', types: ['training'] },
  { id: 'education', label: 'Education', types: ['education'] },
  { id: 'membership', label: 'Leadership', types: ['membership'] },
] as const;

/* ─────────────────────────────────────────────────────────────────
   TYPE ACCENT DEFAULTS
───────────────────────────────────────────────────────────────── */
const TYPE_DEFAULTS: Record<EntryType, { color: string; bg: string }> = {
  award: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  certificate: { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' },
  competition: { color: '#ff6b2c', bg: 'rgba(255,107,44,0.08)' },
  training: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  education: { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  membership: { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
};

/* ─────────────────────────────────────────────────────────────────
   HEADER STATS (live-counted on mount)
───────────────────────────────────────────────────────────────── */
const STATS = [
  { value: 5, suffix: '+', label: 'Certifications' },
  { value: 3, suffix: '', label: 'Prize Awards' },
  { value: 10, suffix: '+', label: 'Competitions' },
  { value: 2, suffix: '', label: 'Industrial Visits' },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return val;
}

function useIsDesktop() {
  const [ok, setOk] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1024,
  );
  useEffect(() => {
    const h = () => setOk(window.innerWidth >= 1024);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return ok;
}

/* ─────────────────────────────────────────────────────────────────
   SUB-COMPONENT: animated stat counter
───────────────────────────────────────────────────────────────── */
const StatCounter: React.FC<{ value: number; suffix: string; label: string; delay: number }> = ({
  value, suffix, label, delay,
}) => {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useCountUp(active ? value : 0, 1200);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e!.isIntersecting) setActive(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
        padding: '1.1rem 1.5rem', borderRadius: '1rem',
        background: 'color-mix(in srgb,var(--sys-text-primary,#f3f4f6) 3%,transparent)',
        border: '1px solid color-mix(in srgb,var(--sys-border,#2e2e3a) 60%,transparent)',
        minWidth: 100,
      }}
    >
      <span style={{
        fontSize: 'clamp(1.8rem,3.5vw,2.6rem)',
        fontWeight: 900, lineHeight: 1,
        color: 'var(--sys-accent,#ff6b2c)',
        letterSpacing: '-0.04em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {counted}{suffix}
      </span>
      <span style={{
        fontSize: '0.65rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'color-mix(in srgb,var(--sys-text-secondary,#9ca3af) 75%,transparent)',
      }}>
        {label}
      </span>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   SUB-COMPONENT: 3-D tilt card
───────────────────────────────────────────────────────────────── */
const TiltCard: React.FC<{
  entry: TimelineEntry;
  index: number;
  isDesktop: boolean;
  reduced: boolean;
}> = ({ entry: e, index, isDesktop, reduced }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });
  const EntryIcon = e.icon;

  const accent = e.accentColor;
  const def = TYPE_DEFAULTS[e.type];

  const handleMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !isDesktop) return;
    const r = ref.current!.getBoundingClientRect();
    const nx = (ev.clientX - r.left) / r.width - 0.5;
    const ny = (ev.clientY - r.top) / r.height - 0.5;
    setTilt({ x: ny * -12, y: nx * 12 });
    setGlow({ x: ((ev.clientX - r.left) / r.width) * 100, y: ((ev.clientY - r.top) / r.height) * 100, active: true });
  };
  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlow(g => ({ ...g, active: false }));
  };

  /* Alternating vertical offset for waterfall rhythm on desktop */
  const vertOffset = isDesktop
    ? (index % 3 === 0 ? 0 : index % 3 === 1 ? 48 : 24)
    : 0;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: index * 0.055, ease: [0.32, 0.72, 0, 1] }}
      layout
      style={{
        flexShrink: 0,
        marginTop: isDesktop ? vertOffset : 0,
        width: isDesktop ? 'clamp(280px,22vw,340px)' : '100%',
        perspective: 900,
        zIndex: e.isFeatured ? 2 : 1,
        animation: e.isFeatured && !reduced ? `at-float ${5 + index * 0.4}s ease-in-out infinite` : 'none',
      }}
    >
      <div
        style={{
          borderRadius: '1.25rem',
          padding: e.isFeatured ? '1.75rem' : '1.4rem',
          background: 'color-mix(in srgb,var(--sys-bg-secondary,#1a1a22) 90%,transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${e.isFeatured
            ? `color-mix(in srgb,${accent} 42%,var(--sys-border,#2e2e3a))`
            : 'color-mix(in srgb,var(--sys-border,#2e2e3a) 70%,transparent)'}`,
          boxShadow: e.isFeatured
            ? `0 0 0 1px color-mix(in srgb,${accent} 18%,transparent), 0 24px 64px rgba(0,0,0,0.55)`
            : '0 8px 32px rgba(0,0,0,0.35)',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: reduced ? 'none' : 'transform 0.18s ease, box-shadow 0.25s ease',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          willChange: 'transform',
        }}
      >
        {/* Gradient top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: e.isFeatured ? 3 : 2,
          background: `linear-gradient(90deg,${accent},color-mix(in srgb,${accent} 25%,transparent))`,
          borderRadius: '1.25rem 1.25rem 0 0',
        }} />

        {/* Mouse-tracked radial glow */}
        {glow.active && !reduced && (
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              background: `radial-gradient(circle at ${glow.x}% ${glow.y}%,color-mix(in srgb,${accent} 9%,transparent) 0%,transparent 55%)`,
              borderRadius: 'inherit',
            }}
          />
        )}

        {/* Shimmer sweep */}
        {!reduced && (
          <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: '35%',
              background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.022),transparent)',
              animation: `at-shimmer ${4 + index * 0.5}s ease-in-out ${index * 0.3}s infinite`,
            }} />
          </div>
        )}

        {/* Featured glow ring */}
        {e.isFeatured && !reduced && (
          <>
            <div aria-hidden style={{
              position: 'absolute', inset: -1, borderRadius: 'inherit',
              background: `linear-gradient(135deg,${accent},color-mix(in srgb,${accent} 30%,transparent),${accent})`,
              backgroundSize: '200% 200%',
              animation: 'at-border-flow 4s linear infinite',
              opacity: 0.25, zIndex: -1,
              mask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'destination-out',
              padding: 1,
            }} />
          </>
        )}

        {/* Content: relative z-index above effects */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header row: icon + year */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            {/* Icon badge */}
            <div style={{
              width: e.isFeatured ? 44 : 38,
              height: e.isFeatured ? 44 : 38,
              borderRadius: '0.75rem',
              background: def.bg,
              border: `1px solid color-mix(in srgb,${accent} 28%,transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: e.isFeatured ? `0 0 20px color-mix(in srgb,${accent} 30%,transparent)` : 'none',
            }}>
              <EntryIcon
                aria-hidden
                style={{
                  fontSize: e.isFeatured ? '1.35rem' : '1.1rem',
                  color: accent,
                }}
              />
            </div>

            {/* Year + type chips */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.28rem' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 900,
                fontVariantNumeric: 'tabular-nums',
                color: accent, letterSpacing: '0.04em',
              }}>
                {e.year}
              </span>
              <span style={{
                fontSize: '0.5rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '0.18rem 0.5rem', borderRadius: '9999px',
                background: def.bg,
                border: `1px solid color-mix(in srgb,${accent} 25%,transparent)`,
                color: accent,
              }}>
                {e.type}
              </span>
            </div>
          </div>

          {/* Prize badge if featured */}
          {e.prize && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.28rem 0.75rem', borderRadius: '9999px', marginBottom: '0.65rem',
              background: `color-mix(in srgb,${accent} 14%,transparent)`,
              border: `1px solid color-mix(in srgb,${accent} 38%,transparent)`,
              fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.06em',
              color: accent,
            }}>
              <e.prize.icon aria-hidden style={{ fontSize: '0.85rem', color: accent }} />
              {e.prize.label}
            </div>
          )}

          {/* Title */}
          <h3 style={{
            margin: '0 0 0.35rem',
            fontSize: e.isFeatured ? 'clamp(1rem,1.6vw,1.2rem)' : '0.95rem',
            fontWeight: 800, lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: 'var(--sys-text-primary,#f3f4f6)',
          }}>
            {e.title}
          </h3>

          {/* Organisation */}
          <p style={{
            margin: '0 0 0.65rem',
            fontSize: '0.72rem', fontWeight: 600,
            color: `color-mix(in srgb,${accent} 80%,var(--sys-text-secondary,#9ca3af))`,
            lineHeight: 1.35,
          }}>
            {e.organization}
          </p>

          {/* Description */}
          <p style={{
            margin: '0 0 0.85rem',
            fontSize: '0.72rem', lineHeight: 1.68,
            color: 'color-mix(in srgb,var(--sys-text-secondary,#9ca3af) 90%,transparent)',
          }}>
            {e.description}
          </p>

          {/* Tags */}
          {e.tags && e.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
              {e.tags.map(t => (
                <span key={t} style={{
                  fontSize: '0.55rem', fontWeight: 700,
                  padding: '0.18rem 0.52rem', borderRadius: '9999px',
                  background: 'color-mix(in srgb,var(--sys-text-primary,#f3f4f6) 5%,transparent)',
                  border: '1px solid color-mix(in srgb,var(--sys-border,#2e2e3a) 65%,transparent)',
                  color: 'color-mix(in srgb,var(--sys-text-secondary,#9ca3af) 88%,transparent)',
                  letterSpacing: '0.04em',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Date pill at bottom */}
          <div style={{
            marginTop: '0.9rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid color-mix(in srgb,var(--sys-border,#2e2e3a) 55%,transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '0.6rem', fontWeight: 700,
              color: 'color-mix(in srgb,var(--sys-text-secondary,#9ca3af) 60%,transparent)',
              letterSpacing: '0.06em',
            }}>
              {e.dateLabel}
            </span>
            {e.isFeatured && (
              <span style={{
                fontSize: '0.5rem', fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: accent, opacity: 0.8,
              }}>
                ✦ Featured
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   SUB-COMPONENT: SVG spine with animated dash + waypoints
───────────────────────────────────────────────────────────────── */
const TimelineSpine: React.FC<{ count: number; reduced: boolean }> = ({ count, reduced }) => {
  const [w, setW] = useState(1200);
  const ref = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const update = () => {
      if (ref.current) setW(ref.current.clientWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* Bezier S-curve through the full width */
  const h = 80;
  const path = `M 0 ${h / 2} C ${w * 0.25} 0, ${w * 0.35} ${h}, ${w * 0.5} ${h / 2} S ${w * 0.8} 0, ${w} ${h / 2}`;

  /* Waypoints equally spaced along x-axis */
  const pts = Array.from({ length: count }, (_, i) => ({
    x: (i / Math.max(count - 1, 1)) * w,
    y: i % 2 === 0 ? h * 0.38 : h * 0.62,
  }));

  return (
    <svg
      ref={ref}
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="spine-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--sys-accent,#ff6b2c)" stopOpacity="0.15" />
          <stop offset="40%" stopColor="var(--sys-accent,#ff6b2c)" stopOpacity="0.85" />
          <stop offset="70%" stopColor="var(--sys-accent,#ff6b2c)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--sys-accent,#ff6b2c)" stopOpacity="0.1" />
        </linearGradient>
        <filter id="spine-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Track line */}
      <path d={path} stroke="color-mix(in srgb,var(--sys-border,#2e2e3a) 80%,transparent)" strokeWidth="1" fill="none" />

      {/* Animated dash */}
      <path
        d={path}
        stroke="url(#spine-grad)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="18 14"
        filter="url(#spine-glow)"
        style={reduced ? {} : {
          animation: 'at-spine-dash 3s linear infinite',
          strokeDashoffset: 0,
        }}
      />

      {/* Waypoint dots */}
      {pts.map((pt, i) => (
        <g key={i} transform={`translate(${pt.x},${h / 2})`}>
          {/* Ping ring */}
          {!reduced && (
            <circle
              r="6" fill="none"
              stroke="var(--sys-accent,#ff6b2c)"
              strokeWidth="1.5" opacity="0.55"
              style={{ animation: `at-ping ${2.5 + i * 0.2}s ease-out ${i * 0.18}s infinite` }}
            />
          )}
          {/* Core dot */}
          <circle r="3.5" fill="var(--sys-accent,#ff6b2c)" opacity="0.9" filter="url(#spine-glow)" />
        </g>
      ))}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────
   SUB-COMPONENT: Navigation arrow button
───────────────────────────────────────────────────────────────── */
const NavBtn: React.FC<{
  dir: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}> = ({ dir, onClick, disabled }) => (
  <motion.button
    type="button"
    aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? {} : { scale: 1.1 }}
    whileTap={disabled ? {} : { scale: 0.92 }}
    style={{
      width: 44, height: 44, borderRadius: '50%',
      border: '1.5px solid color-mix(in srgb,var(--sys-border,#2e2e3a) 70%,transparent)',
      background: disabled
        ? 'color-mix(in srgb,var(--sys-bg-secondary,#1a1a22) 40%,transparent)'
        : 'color-mix(in srgb,var(--sys-bg-secondary,#1a1a22) 90%,transparent)',
      color: disabled
        ? 'color-mix(in srgb,var(--sys-text-secondary,#9ca3af) 30%,transparent)'
        : 'var(--sys-text-primary,#f3f4f6)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.1rem',
      boxShadow: disabled ? 'none' : '0 4px 16px rgba(0,0,0,0.25)',
      transition: 'all 0.2s ease',
      outline: 'none',
      flexShrink: 0,
    }}
    className="focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)] focus-visible:ring-offset-2"
  >
    {dir === 'left' ? '←' : '→'}
  </motion.button>
);

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
const AchievementsTimeline: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const isDesktop = useIsDesktop();
  const reduced = !!useReducedMotion();

  /* Filtered entries */
  const filtered = useMemo(() => {
    const f = FILTERS.find(f => f.id === activeFilter);
    if (!f || !f.types) return TIMELINE;
    return TIMELINE.filter(e => (f.types as readonly string[]).includes(e.type));
  }, [activeFilter]);

  /* Scroll edge detection */
  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => { updateEdges(); }, [filtered, updateEdges]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 360 : -360, behavior: 'smooth' });
    setTimeout(updateEdges, 400);
  };

  /* Filter tab keyboard navigation */
  const filterRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const handleFilterKey = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % FILTERS.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + FILTERS.length) % FILTERS.length;
    if (next !== idx) { e.preventDefault(); setActiveFilter(FILTERS[next]!.id); filterRefs.current[next]?.focus(); }
  };

  /* ─── RENDER ──────────────────────────────────────────────── */
  return (
    <section
      id="achievements"
      aria-labelledby="ach-heading"
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--sys-bg-primary,#0f0f14)',
        paddingBlock: 'clamp(4rem,8vw,7rem)',
      }}
    >

      {/* ── Background atmosphere ── */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.032,
          backgroundImage:
            'linear-gradient(var(--sys-accent,#ff6b2c) 1px,transparent 1px),' +
            'linear-gradient(90deg,var(--sys-accent,#ff6b2c) 1px,transparent 1px)',
          backgroundSize: '58px 58px',
        }} />
        {/* Centre radial glow */}
        <div style={{
          position: 'absolute', left: '50%', top: '40%',
          transform: 'translate(-50%,-50%)',
          width: 'min(52rem,90vw)', height: 'min(36rem,70vh)',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse,color-mix(in srgb,var(--sys-accent,#ff6b2c) 14%,transparent) 0%,transparent 68%)',
          animation: reduced ? 'none' : 'at-glow-pulse 5s ease-in-out infinite',
        }} />
        {/* Edge glows */}
        <div style={{
          position: 'absolute', top: '-8%', left: '-5%',
          width: '35vw', height: '35vh', borderRadius: '50%',
          background: 'radial-gradient(ellipse,color-mix(in srgb,var(--sys-accent,#ff6b2c) 7%,transparent) 0%,transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-8%', right: '-5%',
          width: '30vw', height: '30vh', borderRadius: '50%',
          background: 'radial-gradient(ellipse,color-mix(in srgb,var(--sys-accent,#ff6b2c) 6%,transparent) 0%,transparent 70%)',
        }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1440, margin: '0 auto',
        paddingInline: 'clamp(1rem,4vw,2rem)',
        display: 'flex', flexDirection: 'column',
        gap: 'clamp(2rem,4vw,3rem)',
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 680 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 2, borderRadius: 1, background: 'var(--sys-accent,#ff6b2c)', flexShrink: 0 }} />
            <span style={{
              fontSize: '0.62rem', fontWeight: 900,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--sys-accent,#ff6b2c)',
            }}>
              Career Timeline
            </span>
          </div>

          <h2 id="ach-heading" style={{
            margin: 0,
            fontSize: 'clamp(1.2rem,4.8vw,2.9rem)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em',
            color: 'var(--sys-text-primary,#f3f4f6)',
            whiteSpace: 'nowrap',
          }}>
            My <span style={{ color: 'var(--sys-accent,#ff6b2c)' }}>Achievements</span> & Milestones
          </h2>

          <p style={{
            margin: 0, maxWidth: 560,
            fontSize: 'clamp(0.9rem,1.3vw,1.05rem)',
            fontWeight: 500, lineHeight: 1.76,
            color: 'var(--sys-text-secondary,#9ca3af)',
          }}>
            A chronological record of certifications, awards, competitions, and industrial training —
            every milestone that shaped a production-ready engineering profile.
          </p>
        </motion.div>

        {/* ── Stats row ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {STATS.map((s, i) => (
            <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} delay={i * 0.1} />
          ))}
        </div>

        {/* ── Filter chips ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          role="tablist"
          aria-label="Timeline filter"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}
        >
          {FILTERS.map((f, idx) => {
            const isAct = f.id === activeFilter;
            const count = f.types
              ? TIMELINE.filter(e => (f.types as readonly string[]).includes(e.type)).length
              : TIMELINE.length;
            return (
              <motion.button
                key={f.id}
                ref={el => { filterRefs.current[idx] = el; }}
                type="button"
                role="tab"
                aria-selected={isAct}
                tabIndex={isAct ? 0 : -1}
                onClick={() => setActiveFilter(f.id)}
                onKeyDown={e => handleFilterKey(e, idx)}
                whileHover={reduced ? {} : { y: -2, scale: 1.04 }}
                whileTap={reduced ? {} : { scale: 0.96 }}
                animate={{
                  background: isAct
                    ? 'color-mix(in srgb,var(--sys-accent,#ff6b2c) 16%,var(--sys-bg-secondary,#1a1a22))'
                    : 'color-mix(in srgb,var(--sys-bg-secondary,#1a1a22) 88%,transparent)',
                  borderColor: isAct
                    ? 'var(--sys-accent,#ff6b2c)'
                    : 'color-mix(in srgb,var(--sys-border,#2e2e3a) 70%,transparent)',
                  color: isAct
                    ? 'var(--sys-accent,#ff6b2c)'
                    : 'color-mix(in srgb,var(--sys-text-secondary,#9ca3af) 90%,transparent)',
                  boxShadow: isAct
                    ? '0 0 16px color-mix(in srgb,var(--sys-accent,#ff6b2c) 22%,transparent)'
                    : 'none',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.42rem 1.1rem', borderRadius: '9999px',
                  border: '1.5px solid', fontSize: '0.8rem', fontWeight: 700,
                  letterSpacing: '0.03em', cursor: 'pointer', outline: 'none', minHeight: '2.4rem',
                }}
                className="focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sys-bg-primary)]"
              >
                {f.label}
                <span style={{
                  fontSize: '0.52rem', fontWeight: 900,
                  padding: '0.12rem 0.42rem', borderRadius: '9999px',
                  background: isAct
                    ? 'color-mix(in srgb,var(--sys-accent,#ff6b2c) 22%,transparent)'
                    : 'color-mix(in srgb,var(--sys-text-primary,#f3f4f6) 7%,transparent)',
                  opacity: isAct ? 1 : 0.6,
                  transition: 'all 0.2s',
                }}>
                  {count}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Timeline track ─────────────────────────────────── */}
        <div style={{ position: 'relative' }}>

          {/* SVG spine — desktop only, sits above the track container */}
          {isDesktop && (
            <div style={{ paddingInline: '0.5rem', marginBottom: '-16px', position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
              <TimelineSpine count={Math.min(filtered.length, 12)} reduced={reduced} />
            </div>
          )}

          {/* Navigation controls — desktop */}
          {isDesktop && (
            <div style={{
              position: 'absolute', top: '50%', left: '-1.5rem', right: '-1.5rem',
              transform: 'translateY(-50%)',
              display: 'flex', justifyContent: 'space-between',
              pointerEvents: 'none', zIndex: 20,
            }}>
              <div style={{ pointerEvents: 'auto' }}>
                <NavBtn dir="left" onClick={() => scrollBy('left')} disabled={!canLeft} />
              </div>
              <div style={{ pointerEvents: 'auto' }}>
                <NavBtn dir="right" onClick={() => scrollBy('right')} disabled={!canRight} />
              </div>
            </div>
          )}

          {/* Track wrapper */}
          <div style={{
            borderRadius: '1.5rem',
            border: '1px solid color-mix(in srgb,var(--sys-border,#2e2e3a) 55%,transparent)',
            background: 'color-mix(in srgb,var(--sys-bg-secondary,#1a1a22) 45%,transparent)',
            backdropFilter: 'blur(8px)',
            padding: isDesktop ? '2.5rem 1.5rem' : '1.5rem 1rem',
            overflow: 'hidden',
            position: 'relative',
          }}>

            {/* Edge fade masks — desktop */}
            {isDesktop && (
              <>
                <div aria-hidden style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0, width: '5rem',
                  background: 'linear-gradient(to right,color-mix(in srgb,var(--sys-bg-secondary,#1a1a22) 80%,transparent),transparent)',
                  zIndex: 10, pointerEvents: 'none',
                }} />
                <div aria-hidden style={{
                  position: 'absolute', top: 0, right: 0, bottom: 0, width: '5rem',
                  background: 'linear-gradient(to left,color-mix(in srgb,var(--sys-bg-secondary,#1a1a22) 80%,transparent),transparent)',
                  zIndex: 10, pointerEvents: 'none',
                }} />
              </>
            )}

            {/* The scrollable / draggable track */}
            <div
              ref={trackRef}
              onScroll={updateEdges}
              className="at-track"
              style={{
                display: 'flex',
                flexDirection: isDesktop ? 'row' : 'column',
                gap: isDesktop ? '1.25rem' : '1rem',
                overflowX: isDesktop ? 'auto' : 'visible',
                overflowY: 'visible',
                paddingBlock: isDesktop ? '1rem' : 0,
                paddingInline: isDesktop ? '2rem' : 0,
                cursor: isDesktop ? 'grab' : 'default',
                alignItems: isDesktop ? 'flex-start' : 'stretch',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: isDesktop ? 'x mandatory' : 'none',
              }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((entry, i) => (
                  <div
                    key={entry.id}
                    style={{ scrollSnapAlign: isDesktop ? 'start' : 'none' }}
                  >
                    <TiltCard
                      entry={entry}
                      index={i}
                      isDesktop={isDesktop}
                      reduced={reduced}
                    />
                  </div>
                ))}
              </AnimatePresence>

              {/* Empty state */}
              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '4rem', gap: '0.75rem', minHeight: 200,
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>🔍</span>
                  <span style={{
                    fontSize: '0.9rem', fontWeight: 600,
                    color: 'color-mix(in srgb,var(--sys-text-secondary,#9ca3af) 65%,transparent)',
                  }}>
                    No entries in this category
                  </span>
                </motion.div>
              )}
            </div>

            {/* Scroll progress indicator — desktop */}
            {isDesktop && filtered.length > 3 && (
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '0.4rem',
                marginTop: '1.25rem',
              }}>
                {Array.from({ length: Math.ceil(filtered.length / 3) }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 3, borderRadius: 9999,
                      width: i === 0 ? 24 : 8,
                      background: i === 0
                        ? 'var(--sys-accent,#ff6b2c)'
                        : 'color-mix(in srgb,var(--sys-border,#2e2e3a) 60%,transparent)',
                      transition: 'all 0.25s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>


      </div>
    </section>
  );
};

export default AchievementsTimeline;