/**
 * TechArsenalSection.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium recruiter-focused "Tech Arsenal" homepage section.
 * Clean, data-driven skill presentation integrating a highly interactive 3D 
 * portrait container with dynamic category-driven accent colors.
 *
 * Data: 100% driven from SkillData.ts
 * Visuals: 7-ring ripples, dynamic aura, perspective tilt, and glassmorphism.
 * Motion: Refined springs, gentler easing, and long micro-transitions
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
} from 'framer-motion';
import {
  MdAnalytics,
  MdArchitecture,
  MdAutoAwesome,
  MdBiotech,
  MdBuild,
  MdCalculate,
  MdCode,
  MdCloudUpload,
  MdDeveloperBoard,
  MdElectricBolt,
  MdForkRight,
  MdGridView,
  MdMemory,
  MdPrecisionManufacturing,
  MdPsychology,
  MdSchedule,
  MdScience,
  MdSensors,
  MdStorage,
  MdTerminal,
  MdTune,
  MdViewInAr,
} from 'react-icons/md';
import { SiNodedotjs, SiOpencv, SiPytorch, SiReact } from 'react-icons/si';

import heroCenterImg from '@/assets/images/hero1.png';
import {
  SKILL_CATEGORIES,
  type Skill,
  type SkillCategory,
} from '@/forms/SkillData';
import CategorySegmentedTabs from '@/components/common/CategorySegmentedTabs';

/* ─────────────────────────────────────────────────────────────────
   KEYFRAME INJECTION
───────────────────────────────────────────────────────────────── */
const KF_ID = 'ta-v3-kf';
if (typeof document !== 'undefined' && !document.getElementById(KF_ID)) {
  const s = document.createElement('style');
  s.id = KF_ID;
  s.textContent = `
    @keyframes ta-marquee  { from { transform:translateX(0) } to { transform:translateX(-50%) } }
    @keyframes ta-shimmer {
      0%   { left:-70%; }
      100% { left:170%; }
    }
    @keyframes ta-breathe {
      0%,100% { transform:scale(1);   opacity:.55; }
      50%      { transform:scale(1.5); opacity:1; }
    }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────────────────────
  ICON MAP
───────────────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ReactNode> = {
  electric_bolt: <MdElectricBolt aria-hidden />,
  sensors: <MdSensors aria-hidden />,
  tune: <MdTune aria-hidden />,
  memory: <MdMemory aria-hidden />,
  developer_board: <MdDeveloperBoard aria-hidden />,
  settings_input_component: <MdPrecisionManufacturing aria-hidden />,
  science: <MdScience aria-hidden />,
  calculate: <MdCalculate aria-hidden />,
  biotech: <MdBiotech aria-hidden />,
  grid_view: <MdGridView aria-hidden />,
  architecture: <MdArchitecture aria-hidden />,
  view_in_ar: <MdViewInAr aria-hidden />,
  code: <MdCode aria-hidden />,
  cloud_upload: <MdCloudUpload aria-hidden />,
  schedule: <MdSchedule aria-hidden />,
  build: <MdBuild aria-hidden />,
  terminal: <MdTerminal aria-hidden />,
  react: <SiReact aria-hidden />,
  nodejs: <SiNodedotjs aria-hidden />,
  storage: <MdStorage aria-hidden />,
  fork_right: <MdForkRight aria-hidden />,
  psychology: <MdPsychology aria-hidden />,
  opencv: <SiOpencv aria-hidden />,
  pytorch: <SiPytorch aria-hidden />,
  analytics: <MdAnalytics aria-hidden />,
  auto_awesome: <MdAutoAwesome aria-hidden />,
};

function resolveIcon(key: string): React.ReactNode {
  return ICON_MAP[key] ?? <MdBuild aria-hidden />;
}

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS & CONFIG
───────────────────────────────────────────────────────────────── */
const ACCENT = 'var(--sys-accent)';
const EASE_C = [0.25, 0.1, 0.25, 1] as const;
const SPRING_CFG = { stiffness: 100, damping: 22, mass: 0.9 };
const PLANE_BG_START = 'var(--sys-bg-primary)';
const PLANE_BG_END = 'var(--sys-bg-primary)';
const PLANE_SURFACE = 'rgba(255, 255, 255, 0.04)';
const PLANE_BORDER = 'rgba(255, 255, 255, 0.1)';
const PLANE_BORDER_SOFT = 'rgba(255, 255, 255, 0.05)';
const PLANE_TEXT = 'var(--sys-text-primary)';
const PLANE_TEXT_SOFT = 'var(--sys-text-secondary)';
const PLANE_TEXT_MUTED = 'color-mix(in srgb, var(--sys-text-secondary) 60%, transparent)';
const PLANE_CHIP_BG = 'rgba(0, 0, 0, 0.2)';

const PORTRAIT_HEIGHT_DESKTOP = 'clamp(470px,68vh,700px)';
const PORTRAIT_HEIGHT_MOBILE = 'clamp(380px,54vh,580px)';

type RingConfig = {
  size: number;
  opacity: [number, number, number];
  scale: [number, number, number];
  duration: number;
  delay: number;
};

const RINGS: RingConfig[] = [
  { size: 200, opacity: [0.72, 0.30, 0.72], scale: [1, 1.06, 1], duration: 2.8, delay: 0.00 },
  { size: 290, opacity: [0.55, 0.22, 0.55], scale: [1, 1.07, 1], duration: 3.0, delay: 0.22 },
  { size: 378, opacity: [0.40, 0.15, 0.40], scale: [1, 1.07, 1], duration: 3.2, delay: 0.44 },
  { size: 466, opacity: [0.28, 0.10, 0.28], scale: [1, 1.08, 1], duration: 3.4, delay: 0.66 },
  { size: 552, opacity: [0.18, 0.06, 0.18], scale: [1, 1.09, 1], duration: 3.6, delay: 0.88 },
  { size: 638, opacity: [0.11, 0.03, 0.11], scale: [1, 1.09, 1], duration: 3.8, delay: 1.10 },
  { size: 724, opacity: [0.06, 0.01, 0.06], scale: [1, 1.10, 1], duration: 4.0, delay: 1.32 },
];

const TREND_DISPLAY: Record<Skill['trend'], { label: string; icon: string }> = {
  mastered: { label: 'Mastered', icon: '◆' },
  growing: { label: 'Growing', icon: '▲' },
  active: { label: 'Active', icon: '●' },
};

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
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

function useIsDesktop() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const h = () => setOk(window.innerWidth >= 1024);
    h();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return ok;
}

/* ─────────────────────────────────────────────────────────────────
   IMAGE CONTAINER SUB-COMPONENTS
───────────────────────────────────────────────────────────────── */

const GridOverlay: React.FC<{ color: string }> = ({ color }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 z-0 opacity-[0.05]"
    style={{
      backgroundImage: `
              linear-gradient(${color} 1px, transparent 1px),
              linear-gradient(90deg, ${color} 1px, transparent 1px)
          `,
      backgroundSize: "58px 58px",
      transition: "background-image 0.5s ease"
    }}
  />
);

const ParticleField: React.FC<{ particles: Particle[]; color: string }> = ({ particles, color }) => (
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
          background: color,
          transition: "background 0.5s ease"
        }}
        animate={{
          y: [0, -36, 0],
          x: [0, p.drift, 0],
          opacity: [p.opacity, p.opacity * 1.9, p.opacity],
        }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const RippleRings: React.FC<{ hovered: boolean; ringX: any; ringY: any; color: string }> = ({ hovered, ringX, ringY, color }) => (
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
          borderColor: color,
          transition: "border-color 0.5s ease"
        }}
        animate={{
          scale: hovered ? [1, ring.scale[1] * 1.04, 1] : ring.scale,
          opacity: hovered ? [ring.opacity[0] * 1.6, ring.opacity[1] * 1.6, ring.opacity[0] * 1.6] : ring.opacity,
        }}
        transition={{ duration: hovered ? ring.duration * 0.7 : ring.duration, delay: ring.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </motion.div>
);

const SpotlightBloom: React.FC<{ hovered: boolean; color: string }> = ({ hovered, color }) => (
  <motion.div
    aria-hidden="true"
    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[18%] rounded-full z-0"
    style={{ width: "clamp(200px,38vw,440px)", aspectRatio: "1/1" }}
    animate={{ opacity: hovered ? 1 : 0.82, scale: hovered ? 1.07 : 1 }}
    transition={{ duration: 0.72, ease: EASE_C }}
  >
    <div className="absolute inset-0 rounded-full" style={{ background: color, transition: "background 0.5s ease" }} />
    <div className="absolute -inset-4 rounded-full opacity-40" style={{ background: color, filter: "blur(28px)", transition: "background 0.5s ease" }} />
    <div className="absolute -inset-10 rounded-full opacity-20" style={{ background: color, filter: "blur(56px)", transition: "background 0.5s ease" }} />
  </motion.div>
);

const EnergyAura: React.FC<{ visible: boolean; color: string }> = ({ visible, color }) => (
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
          background: `radial-gradient(ellipse 72% 78% at 50% 80%, color-mix(in srgb, ${color} 46%, transparent) 0%, color-mix(in srgb, ${color} 14%, transparent) 45%, transparent 72%)`,
          filter: "blur(6px)",
          transition: "background 0.5s ease"
        }}
      />
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────────────────────────────
   SKILL PANEL SUB-COMPONENTS
───────────────────────────────────────────────────────────────── */

const ProfRing: React.FC<{ pct: number; catColor: string; size?: number }> = ({ pct, catColor, size = 76 }) => {
  const r = (size / 2) * 0.72;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }} aria-label={`${pct}% proficiency`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb,var(--sys-border) 80%,transparent)" strokeWidth={size * 0.07} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={catColor} strokeWidth={size * 0.14} strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" opacity={0.14} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={catColor} strokeWidth={size * 0.075} strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct / 100) }} transition={{ duration: 0.72, ease: 'easeOut' }} style={{ filter: `drop-shadow(0 0 4px ${catColor})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        <motion.span key={pct} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ fontSize: size * 0.195, fontWeight: 900, lineHeight: 1, color: 'var(--sys-text-primary)', letterSpacing: '-0.02em' }}>{pct}</motion.span>
        <span style={{ fontSize: size * 0.12, fontWeight: 700, color: catColor, letterSpacing: '0.06em', opacity: 0.85, transition: 'color 0.4s' }}>%</span>
      </div>
    </div>
  );
};

const OrbitPill: React.FC<{ skill: Skill; catColor: string; isSelected: boolean; reduced: boolean; onClick: () => void }> = ({ skill, catColor: _, isSelected, reduced, onClick }) => {
  const accent = ACCENT;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Select ${skill.name}`}
      whileHover={reduced ? {} : { scale: 1.06, y: -3 }}
      whileTap={reduced ? {} : { scale: 0.94 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.44rem 1.1rem', borderRadius: '9999px',
        border: isSelected ? '1px solid transparent' : `1px solid color-mix(in srgb, var(--sys-text-primary) 15%, transparent)`,
        cursor: 'pointer', outline: 'none', flexShrink: 0,
        whiteSpace: 'nowrap',
        background: isSelected ? `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 80%, black 20%) 100%)` : PLANE_SURFACE,
        boxShadow: isSelected ? `0 8px 16px color-mix(in srgb, ${accent} 30%, transparent)` : '0 4px 12px rgba(0,0,0,0.1)',
        color: isSelected ? '#ffffff' : PLANE_TEXT,
        transition: 'border-color 0.25s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.25s cubic-bezier(0.25,0.1,0.25,1), background 0.25s cubic-bezier(0.25,0.1,0.25,1), color 0.25s',
      }}
      className="focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sys-bg-primary)] backdrop-blur-sm"
    >
      <span style={{ display: 'flex', fontSize: '1.1rem', color: isSelected ? '#ffffff' : accent, flexShrink: 0 }}>{resolveIcon(skill.iconKey)}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'inherit', letterSpacing: '-0.01em' }}>{skill.name}</span>
      {isSelected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', flexShrink: 0, animation: 'ta-breathe 2s ease-in-out infinite', transition: 'background 0.4s' }} />}
    </motion.button>
  );
};

const FloatingSkillOrb: React.FC<{ skill: Skill; total: number; index: number; catColor: string; isSelected: boolean; onClick: () => void }> = ({ skill, total, index, catColor: _, isSelected, onClick }) => {
  const accent = ACCENT;
  // Distribute along an ellipse (wider X to handle text safely)
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // Starts from top
  const radiusX = 36; // % from center
  const radiusY = 36; // % from center

  const top = `${50 + Math.sin(angle) * radiusY}%`;
  const left = `${50 + Math.cos(angle) * radiusX}%`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Select ${skill.name}`}
      aria-pressed={isSelected}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.94 }}
      style={{
        position: 'absolute',
        top,
        left,
        x: '-50%',
        y: '-50%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 1rem',
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
        background: isSelected ? `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 80%, black 20%) 100%)` : 'color-mix(in srgb, var(--sys-text-primary) 5%, var(--sys-bg-primary))',
        color: isSelected ? '#ffffff' : 'var(--sys-text-primary)',
        border: `1px solid ${isSelected ? 'transparent' : 'color-mix(in srgb, var(--sys-text-primary) 20%, transparent)'}`,
        boxShadow: isSelected
          ? `0 8px 20px color-mix(in srgb, ${accent} 40%, transparent)`
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s, color 0.3s',
        zIndex: 30, // Hovered or selected skills need to be above the portrait
      }}
      className="focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sys-bg-primary)] backdrop-blur-md"
    >
      <span style={{ fontSize: '1.2rem', color: isSelected ? '#ffffff' : accent, flexShrink: 0, transition: 'color 0.3s' }}>
        {resolveIcon(skill.iconKey)}
      </span>
      <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0 }}>
        {skill.name}
      </span>
    </motion.button>
  );
};

const SkillPanel: React.FC<{ skill: Skill; category: SkillCategory }> = ({ skill: sk, category: cat }) => {
  const accent = ACCENT;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sk.id}
        initial={{ rotateY: -55, opacity: 0, scale: 0.96 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        exit={{ rotateY: 55, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.45, ease: EASE_C }}
        style={{
          height: '100%', borderRadius: '1.5rem',
          border: `1px solid color-mix(in srgb,${accent} 16%,${PLANE_BORDER})`,
          background: PLANE_SURFACE,
          boxShadow: [
            `0 0 0 1px color-mix(in srgb,${accent} 8%,transparent)`,
            '0 12px 40px rgba(0,0,0,0.45)',
            'inset 0 1px 0 rgba(255,255,255,0.12)',
          ].join(', '),
          backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg,${accent},color-mix(in srgb,${accent} 30%,transparent))`, transition: 'background 0.5s ease' }} />
        <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: 220, height: 220, background: `radial-gradient(circle at top left,color-mix(in srgb,${accent} 7%,transparent) 0%,transparent 68%)`, pointerEvents: 'none', transition: 'background 0.5s ease' }} />
        <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: '35%', background: 'linear-gradient(90deg,transparent,rgba(154,163,184,0.14),transparent)', animation: 'ta-shimmer 5s ease-in-out 0.8s infinite' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.52rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, transition: 'color 0.4s' }}>Active Selection</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: PLANE_TEXT_MUTED, letterSpacing: '0.04em' }}>{cat.tagline}</span>
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: 'clamp(1.3rem,2.1vw,1.65rem)', fontWeight: 900, lineHeight: 1.1, color: PLANE_TEXT, letterSpacing: '-0.03em' }}>{sk.name}</h3>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.22rem 0.65rem', borderRadius: '9999px', border: `1px solid color-mix(in srgb,${accent} 40%,transparent)`, background: `color-mix(in srgb,${accent} 10%,transparent)`, color: accent, transition: 'all 0.4s' }}>{cat.label}</span>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.06em', color: sk.trend === 'active' ? PLANE_TEXT_SOFT : accent, padding: '0.22rem 0.55rem', borderRadius: '9999px', border: `1px solid ${PLANE_BORDER_SOFT}`, transition: 'color 0.4s' }}>{TREND_DISPLAY[sk.trend].icon} {TREND_DISPLAY[sk.trend].label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ProfRing key={sk.id} pct={sk.proficiency} catColor={accent} size={76} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.4rem', flex: 1 }}>
              {([{ label: 'Experience', value: sk.experience }, { label: 'Projects', value: String(sk.projects) }, { label: 'Level', value: sk.level }] as const).map(({ label, value }) => (
                <div key={label} style={{ background: PLANE_CHIP_BG, border: `1px solid ${PLANE_BORDER_SOFT}`, borderRadius: '0.55rem', padding: '0.45rem' }}>
                  <span style={{ display: 'block', fontSize: '0.46rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PLANE_TEXT_MUTED, marginBottom: '0.16rem' }}>{label}</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 900, color: PLANE_TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: PLANE_BORDER_SOFT }} />
          <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.74, color: PLANE_TEXT_SOFT }}>{sk.extendedDesc}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {sk.tags.map(t => (<span key={t} style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.24rem 0.6rem', borderRadius: '9999px', border: `1px solid color-mix(in srgb,${accent} 34%,transparent)`, background: `color-mix(in srgb,${accent} 9%,transparent)`, color: accent, transition: 'all 0.4s' }}>{t}</span>))}
          </div>

          <div style={{ height: 1, background: PLANE_BORDER_SOFT }} />

          <div>
            <span style={{ display: 'block', fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: PLANE_TEXT_MUTED, marginBottom: '0.44rem' }}>Highlights</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.36rem' }}>
              {sk.achievements.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: accent, fontSize: '0.7rem', flexShrink: 0, marginTop: '0.05rem', fontWeight: 900, transition: 'color 0.4s' }}>✓</span>
                  <span style={{ fontSize: '0.75rem', lineHeight: 1.6, color: PLANE_TEXT_SOFT }}>{a}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: PLANE_TEXT_MUTED, marginBottom: '0.38rem' }}>Ecosystem</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {sk.ecosystem.map(t => (<span key={t} style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.22rem 0.55rem', borderRadius: '9999px', border: `1px solid ${PLANE_BORDER_SOFT}`, background: PLANE_CHIP_BG, color: PLANE_TEXT_SOFT }}>{t}</span>))}
            </div>
          </div>

          {sk.relatedProjects && sk.relatedProjects.length > 0 && sk.relatedProjects[0] !== 'All Projects' && (
            <div>
              <span style={{ display: 'block', fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: PLANE_TEXT_MUTED, marginBottom: '0.38rem' }}>Applied In</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {sk.relatedProjects.map(p => (
                  <span key={p} style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.22rem 0.6rem', borderRadius: '9999px', border: `1px solid color-mix(in srgb,${accent} 22%,transparent)`, background: `color-mix(in srgb,${accent} 6%,transparent)`, color: `color-mix(in srgb,${accent} 85%,${PLANE_TEXT_SOFT})`, transition: 'all 0.4s' }}>→ {p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT — TechArsenalSection
───────────────────────────────────────────────────────────────── */
const TechArsenalSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  /* ── State ── */
  const [activeCatId, setActiveCatId] = useState<string>(SKILL_CATEGORIES[0]!.id);
  const [selectedId, setSelectedId] = useState<string>(SKILL_CATEGORIES[0]!.skills[0]!.id);
  const [portraitHovered, setPortraitHovered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  /* ── Derived data ── */
  const activeCategory = useMemo(
    () => SKILL_CATEGORIES.find(c => c.id === activeCatId) ?? SKILL_CATEGORIES[0]!,
    [activeCatId],
  );
  const visSkills = activeCategory.skills;
  const selectedSkill = useMemo(
    () => visSkills.find(s => s.id === selectedId) ?? visSkills[0]!,
    [visSkills, selectedId],
  );
  const categoryTabs = useMemo(
    () => SKILL_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      count: cat.skills.length,
    })),
    [],
  );
  const categoryRailClass = 'w-full max-w-[1120px] pl-3 sm:pl-4 lg:pl-5';

  /* ── Hooks ── */
  const isDesktop = useIsDesktop();
  const reduced = !!useReducedMotion();

  useEffect(() => { setParticles(makeParticles(28)); }, []);

  useEffect(() => {
    if (!visSkills.some(s => s.id === selectedId)) {
      setSelectedId(visSkills[0]!.id);
    }
  }, [visSkills, selectedId]);

  /* ── Mouse Tracking for Parallax (Left Pane) ── */
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, SPRING_CFG);
  const mouseY = useSpring(rawMouseY, SPRING_CFG);

  const portraitXS = useTransform(mouseX, [-500, 500], [-14, 14]);
  const portraitYS = useTransform(mouseY, [-500, 500], [-8, 8]);
  const ringXS = useTransform(mouseX, [-500, 500], [-8, 8]);
  const ringYS = useTransform(mouseY, [-500, 500], [-4, 4]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawMouseX.set(e.clientX - (rect.left + rect.width / 2));
    rawMouseY.set(e.clientY - (rect.top + rect.height / 2));
  }, [rawMouseX, rawMouseY]);

  const handleMouseLeave = useCallback(() => {
    rawMouseX.set(0);
    rawMouseY.set(0);
    setPortraitHovered(false);
  }, [rawMouseX, rawMouseY]);

  const handleCatSelect = useCallback((id: string) => {
    setActiveCatId(id);
    const cat = SKILL_CATEGORIES.find(c => c.id === id);
    if (cat?.skills[0]) setSelectedId(cat.skills[0].id);
  }, []);

  /* ─── RENDER ─────────────────────────────────────────────────── */
  return (
    <section
      id="tech-arsenal"
      ref={sectionRef}
      aria-labelledby="ta-heading"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative', width: '100%', overflow: 'hidden',
        background: `linear-gradient(145deg, ${PLANE_BG_START} 0%, ${PLANE_BG_END} 100%)`,
        paddingTop: 0,
        paddingBottom: 'clamp(4rem,8vw,7rem)',
        paddingInline: 0,
      }}
    >
      <div className="app-shell" style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        gap: 'clamp(2rem,4vw,3.5rem)',
      }}>

        {/* Section header */}
        <motion.header
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE_C }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 680, margin: 0, textAlign: 'left', alignItems: 'flex-start' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 2, borderRadius: 1, background: ACCENT, flexShrink: 0 }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: ACCENT }}>FEATURE STACK</span>
            <div style={{ width: 32, height: 2, borderRadius: 1, background: ACCENT, flexShrink: 0 }} />
          </div>
          <h2 id="ta-heading" style={{ margin: 0, fontSize: 'clamp(2.4rem,5.5vw,4rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: PLANE_TEXT }}>
            Tech <span className="text-[var(--sys-accent)]">Arsenal.</span>
          </h2>
          <p style={{ margin: 0, maxWidth: 580, fontSize: 'clamp(0.88rem,1.3vw,1.05rem)', fontWeight: 500, lineHeight: 1.76, color: PLANE_TEXT_SOFT }}>
            Quantifiable engineering impact — embedded systems, AI vision, full-stack IoT, and industrial automation. Built for production and enterprise scale.
          </p>
        </motion.header>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_500px] gap-[clamp(1.05rem,2vw,1.45rem)] items-stretch">

          {/* ════════════════════════════════════════════════════
              LEFT — Interactive Image Container
          ════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.72, delay: 0.1, ease: EASE_C }}
            className="relative flex items-end justify-center overflow-hidden rounded-3xl"
            style={{
              minHeight: "clamp(380px,54vw,620px)",
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: `1px solid ${PLANE_BORDER}`
            }}
          >
            <GridOverlay color={ACCENT} />
            <ParticleField particles={particles} color={ACCENT} />

            <RippleRings hovered={portraitHovered} ringX={ringXS} ringY={ringYS} color={ACCENT} />
            <SpotlightBloom hovered={portraitHovered} color={ACCENT} />

            <div className="absolute inset-0 z-[6] pointer-events-none">
              <EnergyAura visible={portraitHovered} color={ACCENT} />
            </div>

            <motion.div
              style={{ x: portraitXS, y: portraitYS }}
              className="relative z-10 h-full flex items-end justify-center"
            >
              <motion.img
                src={heroCenterImg}
                alt="Engineering Portfolio Visual"
                draggable={false}
                className="block select-none cursor-crosshair w-auto max-w-full"
                style={{
                  height: isDesktop ? PORTRAIT_HEIGHT_DESKTOP : PORTRAIT_HEIGHT_MOBILE,
                  objectFit: "contain",
                  filter: portraitHovered
                    ? `drop-shadow(0 0 36px color-mix(in srgb, ${ACCENT} 55%, transparent)) drop-shadow(0 24px 52px rgba(0,0,0,0.65))`
                    : "drop-shadow(0 20px 44px rgba(0,0,0,0.58))",
                  transition: "filter 0.5s ease",
                }}
                initial={{ scale: 0.94, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.22, ease: EASE_C }}
                onHoverStart={() => setPortraitHovered(true)}
                onHoverEnd={() => setPortraitHovered(false)}
                whileHover={{ scale: 1.025, y: -6 }}
              />
            </motion.div>

            <AnimatePresence>
              {portraitHovered && (
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none z-20 rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    boxShadow: `inset 0 0 60px color-mix(in srgb, ${ACCENT} 18%, transparent)`,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Floating Skill Pills */}
            <div className="absolute inset-0 z-30 pointer-events-none">
              <AnimatePresence>
                {visSkills.map((skill, index) => (
                  <FloatingSkillOrb
                    key={skill.id}
                    skill={skill}
                    total={visSkills.length}
                    index={index}
                    catColor={ACCENT}
                    isSelected={selectedSkill.id === skill.id}
                    onClick={() => setSelectedId(skill.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════════
              RIGHT — Skill Detail Panel
          ════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.72, delay: 0.14, ease: EASE_C }}
            className="w-full max-w-[500px] justify-self-end self-stretch"
            style={{ perspective: 900, minHeight: isDesktop ? 0 : 'clamp(400px,50vw,520px)' }}
          >
            <SkillPanel skill={selectedSkill} category={activeCategory} />
          </motion.div>
        </div>

        {/* Category tabs + marquee */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE_C }}
          className="flex w-full flex-col gap-1.5"
        >
          {/* Category tabs */}
          <div className={`${categoryRailClass} flex items-center gap-3`}>
            <div className="min-w-0 flex-1">
              <CategorySegmentedTabs
                categories={categoryTabs}
                active={activeCatId}
                onChange={handleCatSelect}
                ariaLabel="Technology categories"
                className="w-full"
              />
            </div>

            <AnimatePresence mode="wait">
              {isDesktop && (
                <motion.span
                  key={activeCatId}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.28 }}
                  className="hidden shrink-0 whitespace-nowrap text-[0.68rem] font-medium italic leading-none xl:inline-block"
                  style={{ color: PLANE_TEXT_MUTED }}
                >
                  — {activeCategory.tagline}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Marquee */}
          <div className={categoryRailClass}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeCatId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.32 }}
                style={{ position: 'relative', width: '100%', overflow: 'hidden', paddingBlock: '0.42rem', maskImage: 'linear-gradient(to right,black 0%,black 95%,transparent)', WebkitMaskImage: 'linear-gradient(to right,black 0%,black 95%,transparent)' }}
                className="group"
              >
                <style>{`.ta-mq { display:flex; width:max-content; gap:0.55rem; } .group:hover .ta-mq { animation-play-state:paused !important; }`}</style>
                <div className="ta-mq" style={{ animation: reduced ? 'none' : 'ta-marquee 28s linear infinite' }}>
                  {[...visSkills, ...visSkills, ...visSkills, ...visSkills, ...visSkills, ...visSkills].map((skill, i) => (
                    <OrbitPill key={`mq-${skill.id}-${i}`} skill={skill} catColor={ACCENT} isSelected={selectedSkill.id === skill.id} reduced={reduced} onClick={() => setSelectedId(skill.id)} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechArsenalSection;