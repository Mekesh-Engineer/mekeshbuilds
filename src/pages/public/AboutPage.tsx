/**
 * AboutPage.tsx — Enhanced v3 (3D Immersive Edition)
 * ─────────────────────────────────────────────────────────────
 * Full 3D immersive About page for Mekesh Kumar's portfolio.
 * Design tokens: variables.css (--sys-bg-primary, --sys-accent, etc.)
 * Animations: Framer Motion + React Three Fiber
 *
 * Sections:
 *  1. HeroSection          — R3F WebGL scene, mouse parallax, collage, quick stats
 *  2. TimelineSection      — Education + industrial training timeline (NEW)
 *  3. ExpertiseSection     — Skills, certifications, stat cards
 *  4. CoreValuesSection    — 8 competency cards with mouse-spotlight glow
 *  5. AchievementsSection  — Award cards with 3D tilt + leadership (NEW)
 *  6. ProjectsSection      — Featured projects with 3D card tilt
 *  7. CtaSection           — Contact form with mouse-glow + contact links
 */

import React, {
    type FormEvent,
    type ReactNode,
    Suspense,
    useRef,
    useCallback,
    useState,
    useEffect,
    Component,
} from 'react';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Float,
    MeshDistortMaterial,
    MeshWobbleMaterial,
    Environment,
    ContactShadows,
    Stars,
} from '@react-three/drei';
import * as THREE from 'three';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer';

// ─── ErrorBoundary for R3F Canvas ────────────────────────────────────────────
class WebGLErrorBoundary extends Component<
    { children: ReactNode; fallback?: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--sys-bg-primary)]">
                        <p className="text-[var(--sys-text-secondary)] text-sm">3D scene unavailable</p>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}

// ─── Mobile / low-power detection ────────────────────────────────────────────
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768 || window.navigator.maxTouchPoints > 1);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const EASE = [0.32, 0.72, 0, 1] as const;
const SPRING_CFG = { stiffness: 110, damping: 20, mass: 0.9 } as const;

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: EASE },
    },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const floatAnimation = {
    y: [-8, 8, -8],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

const slowFloatAnimation = {
    y: [-12, 12, -12],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
};

// ─── 3D Scene Components ─────────────────────────────────────────────────────

/** Mouse-interactive torus knot — accent wireframe */
const InteractiveAbstractShape = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = THREE.MathUtils.lerp(
            meshRef.current.rotation.x, state.pointer.y * 0.5, 0.1,
        );
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
            meshRef.current.rotation.y, state.pointer.x * 0.5, 0.1,
        );
        meshRef.current.rotation.z += 0.004;
    });
    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <mesh ref={meshRef} scale={1.5}>
                <torusKnotGeometry args={[1, 0.3, 128, 32]} />
                <MeshDistortMaterial
                    color="#ff6b2c"
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    metalness={0.8}
                    roughness={0.2}
                    distort={0.2}
                    speed={2}
                    wireframe
                />
            </mesh>
        </Float>
    );
};

/** Slow-orbiting accent ring — independent axis rotation */
const OrbitalRing = ({
    radius, speed, color, opacity = 0.45,
}: { radius: number; speed: number; color: string; opacity?: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.x = state.clock.elapsedTime * speed * 0.4;
        groupRef.current.rotation.y = state.clock.elapsedTime * speed * 0.6;
    });
    return (
        <group ref={groupRef}>
            <mesh>
                <torusGeometry args={[radius, 0.012, 16, 100]} />
                <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} transparent opacity={opacity} />
            </mesh>
        </group>
    );
};

/** Floating metallic sphere accent */
const FloatingSphere = ({
    pos, size, color,
}: { pos: [number, number, number]; size: number; color: string }) => (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.5}>
        <mesh position={pos}>
            <sphereGeometry args={[size, 32, 32]} />
            <MeshWobbleMaterial color={color} metalness={0.9} roughness={0.05} factor={0.1} speed={1} />
        </mesh>
    </Float>
);

/** R3F Canvas loading spinner */
const CanvasLoader = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--sys-bg-primary)]">
        <div className="w-10 h-10 border-2 border-[var(--sys-accent)]/30 border-t-[var(--sys-accent)] rounded-full animate-spin" />
    </div>
);

/** Complete hero 3D scene — wrapped with Suspense + ErrorBoundary */
const HeroScene = () => (
    <WebGLErrorBoundary>
        <Suspense fallback={<CanvasLoader />}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 2]}
                performance={{ min: 0.5 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ff6b2c" />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ff8a57" />
                <Environment preset="city" />
                <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={0.7} />
                <InteractiveAbstractShape />
                <OrbitalRing radius={2.8} speed={0.25} color="#ff6b2c" />
                <OrbitalRing radius={3.5} speed={-0.14} color="#ff8a57" opacity={0.25} />
                <OrbitalRing radius={4.2} speed={0.08} color="#ffffff" opacity={0.08} />
                <FloatingSphere pos={[3.6, 1.6, -1]} size={0.22} color="#ff6b2c" />
                <FloatingSphere pos={[-3.3, -1.3, -1.5]} size={0.15} color="#ff8a57" />
                <FloatingSphere pos={[2.9, -2.1, -0.5]} size={0.1} color="#ffffff" />
                <FloatingSphere pos={[-2.5, 2.2, -2]} size={0.12} color="#ff6b2c" />
                <ContactShadows position={[0, -2.8, 0]} opacity={0.3} scale={20} blur={2} far={4} color="#ff6b2c" />
            </Canvas>
        </Suspense>
    </WebGLErrorBoundary>
);

/** Lightweight mobile fallback — animated gradient + floating dots (no WebGL) */
const MobileHeroFallback = () => (
    <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orb */}
        <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] bg-gradient-to-br from-[var(--sys-accent)] to-[var(--sys-accent-dark)]"
        />
        {/* Floating accent dots */}
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                className="absolute rounded-full bg-[var(--sys-accent)]"
                style={{
                    width: 4 + i * 2, height: 4 + i * 2,
                    top: `${15 + (i * 10) % 70}%`,
                    left: `${10 + (i * 13) % 80}%`,
                }}
            />
        ))}
    </div>
);

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURED_PROJECTS = [
    {
        id: 1,
        name: 'V2X Fleet Monitoring',
        role: 'Python · Flask · WebSockets · ESP32 · UDP',
        tag: 'Embedded / IoT',
        img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80',
        events: '5 Events',
        featured: true,
        award: '🏆 Presented at 5 inter-collegiate events incl. Robofiesta 2K25',
    },
    {
        id: 2,
        name: 'Smart IoT Event Platform',
        role: 'React 19 · Firebase · YOLOv8 · ESP32-CAM',
        tag: 'IoT / AI / Full Stack',
        img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80',
        events: '1st Prize',
        award: '🥇 Tamizhanskills Ideathon 2026 — 1st Prize',
    },
    {
        id: 3,
        name: 'Rod Inspection System',
        role: 'OpenCV · YOLOv8 · Flask · ESP32-CAM · C++',
        tag: 'Machine Vision',
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
        events: 'Industry',
        award: '⚙️ SCADA-like multi-threaded dashboard',
    },
    {
        id: 4,
        name: 'Cosmic Strikes 3D',
        role: 'React · Three.js · React Three Fiber · Node.js',
        tag: 'Full Stack / WebGL',
        img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
        events: 'WebGL',
        award: '🎮 60 FPS 3D arcade shooter + JWT leaderboard',
    },
    {
        id: 5,
        name: 'IoT Waste Segregation',
        role: 'C++ · ESP32 · Blynk IoT · Servo · Multi-Sensor',
        tag: 'Embedded Systems',
        img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80',
        events: 'IoT',
        featured: false,
        award: '🗑️ Autonomous multi-sensor sorting system',
    },
    {
        id: 6,
        name: 'MekeshBuilds Portfolio',
        role: 'React 19 · TypeScript · Firebase · Framer Motion · Zod',
        tag: 'Full Stack / SaaS',
        img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
        events: 'Production',
        featured: false,
        award: '🌐 Full-stack portfolio platform with R3F + autosave',
    },
    {
        id: 7,
        name: 'Fuzzy Energy Manager',
        role: 'Arduino Mega · Fuzzy Logic · Proteus · ACS712',
        tag: 'Power Electronics',
        img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80',
        events: 'Smart Grid',
        featured: false,
        award: '⚡ Fuzzy logic hybrid energy optimisation',
    },
    {
        id: 8,
        name: 'GPS Smart Horn System',
        role: 'ESP32 · GPS NEO-6M · L298N · PWM · Web Server',
        tag: 'Embedded / Transport',
        img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80',
        events: 'Transport',
        featured: false,
        award: '🚓 Geofence-aware automated speed & horn regulation',
    },
];

const VISION_ITEMS = [
    {
        id: '001', title: 'Embedded Systems',
        desc: 'Robust firmware and hardware interfaces for real-time control using ESP32, ARM, I2C, SPI, UART, and FreeRTOS.',
    },
    {
        id: '002', title: 'Full Stack Solutions',
        desc: 'Seamless React 19 + Firebase / Supabase web apps that connect edge devices to the cloud via WebSockets.',
    },
    {
        id: '003', title: 'IoT Integration',
        desc: 'Smart, connected environments for industrial automation — OTA updates, edge telemetry, and Blynk IoT dashboards.',
    },
    {
        id: '004', title: 'PCB & Circuit Design',
        desc: 'Efficient circuit layouts using AutoCAD Electrical, Proteus, OrCAD PSpice, and power electronics principles.',
    },
    {
        id: '005', title: 'Computer Vision',
        desc: 'YOLOv8 + OpenCV AI pipelines for automated inspection, defect detection, and crowd density analysis.',
    },
    {
        id: '006', title: 'Power Electronics',
        desc: 'EV motor drivers, relay switching, fuzzy logic energy management, and smart grid load optimisation.',
    },
    {
        id: '007', title: 'Industrial Automation',
        desc: 'SCADA-like monitoring dashboards, multi-sensor fusion, and real-time control logic for manufacturing.',
    },
    {
        id: '008', title: 'Continuous Learning',
        desc: 'ARM certification via Maven Silicon, Google AI APIs, and executive roles in ISTE & NSS at KEC.',
    },
];

const ACHIEVEMENTS = [
    {
        id: 1, medal: '🥇', rank: '1st Prize', color: '#f59e0b',
        project: 'Smart IoT Event & Venue Management Platform',
        event: 'Tamizhanskills Ideathon 2026',
        institution: 'New Prince Shri Bhavani College of Engineering, Chennai',
        year: '2026',
    },
    {
        id: 2, medal: '🥉', rank: '3rd Prize', color: '#cd7f32',
        project: 'ROV-Based Underwater Crack Detection System',
        event: 'Project Prism – Oracle 2025',
        institution: 'Govt. College of Technology, Coimbatore',
        year: '2025',
    },
    {
        id: 3, medal: '🥉', rank: '3rd Prize', color: '#cd7f32',
        project: 'Smart IoT Event & Venue Management Platform',
        event: 'Elixir 2026 Technical Event',
        institution: 'Govt. College of Engineering, Erode',
        year: '2026',
    },
    {
        id: 4, medal: '🏅', rank: 'School First Rank', color: '#ff6b2c',
        project: 'Higher Secondary Examination (84%)',
        event: 'HSE Board Examinations 2023',
        institution: 'Govt. Boys Higher Secondary School, Palacode',
        year: '2023',
    },
];

const TIMELINE = [
    {
        id: 1, year: '2020 – 21', title: 'SSLC',
        sub: 'DDCSM Matriculation School, Palacode', result: '84%',
        type: 'education', icon: '🎓',
    },
    {
        id: 2, year: '2021 – 23', title: 'Higher Secondary (HSE)',
        sub: 'Govt. Boys Higher Secondary School, Palacode, Tamil Nadu', result: '84%',
        type: 'education', icon: '📚',
    },
    {
        id: 3, year: '2023 – Present', title: 'B.E. Electrical & Electronics Engineering',
        sub: 'Kongu Engineering College, Perundurai', result: 'CGPA 7.71',
        type: 'education', icon: '⚡',
    },
    {
        id: 4, year: 'Jul 2024', title: 'In-Plant Training — Manufacturing Operations',
        sub: 'Hatsun Agro Products Ltd., Vellichandai', result: '5 Days',
        type: 'industry', icon: '🏭',
    },
    {
        id: 5, year: 'Jan 2025', title: 'In-Plant Training — Quality Control & Instrumentation',
        sub: 'Pavithran Aseptic Fruit Products', result: '5 Days',
        type: 'industry', icon: '🔧',
    },
    {
        id: 6, year: 'Nov 2024', title: 'Industrial Visit — Radio Astronomy Centre, Ooty',
        sub: 'Large-scale RF signal processing systems', result: 'RF Systems',
        type: 'visit', icon: '📡',
    },
    {
        id: 7, year: 'Mar 2025', title: 'Industrial Visit — Kodaikanal Solar Observatory',
        sub: 'Precision instrumentation and data acquisition', result: 'Instrumentation',
        type: 'visit', icon: '🔭',
    },
];

const CERTIFICATIONS = [
    { title: 'Embedded ARM Processors', issuer: 'Maven Silicon', year: '2025', color: '#ff6b2c' },
    { title: 'AutoCAD Electrical', issuer: 'Cadcentre Cochin', year: '2023', color: '#3b82f6' },
    { title: 'Generative AI', issuer: 'Google Cloud', year: '2024', color: '#10b981' },
    { title: 'Java Foundations', issuer: 'Infosys Springboard', year: '2024', color: '#8b5cf6' },
    { title: 'Energy Literacy', issuer: 'Energy Swaraj Foundation', year: '2023', color: '#f59e0b' },
];

const LANGUAGES = [
    { lang: 'Tamil', level: 'Native', flag: '🇮🇳', proficiency: 100 },
    { lang: 'English', level: 'Professional', flag: '🇬🇧', proficiency: 85 },
    { lang: 'Hindi', level: 'Working', flag: '🇮🇳', proficiency: 60 },
];

const TIMELINE_COLOR: Record<string, string> = {
    education: 'var(--sys-accent)',
    industry: 'var(--sys-info)',
    visit: 'var(--sys-success)',
};
const TIMELINE_BG: Record<string, string> = {
    education: 'rgba(255,107,44,0.12)',
    industry: 'rgba(59,130,246,0.12)',
    visit: 'rgba(16,185,129,0.12)',
};

// ─── Section: Hero ───────────────────────────────────────────────────────────

const HeroSection = () => {
    const isMobile = useIsMobile();
    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const mouseX = useSpring(rawMouseX, SPRING_CFG);
    const mouseY = useSpring(rawMouseY, SPRING_CFG);
    const glowX = useTransform(mouseX, [-400, 400], [-30, 30]);
    const glowY = useTransform(mouseY, [-300, 300], [-20, 20]);
    const imgParallaxX = useTransform(mouseX, [-400, 400], [-14, 14]);
    const imgParallaxY = useTransform(mouseY, [-300, 300], [-10, 10]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            rawMouseX.set(e.clientX - (rect.left + rect.width / 2));
            rawMouseY.set(e.clientY - (rect.top + rect.height / 2));
        },
        [rawMouseX, rawMouseY],
    );

    return (
        <section
            className="relative pt-24 pb-0 overflow-hidden bg-[var(--sys-bg-primary)] min-h-screen"
            aria-label="About hero"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { rawMouseX.set(0); rawMouseY.set(0); }}
        >
            {/* ── 3D WebGL Canvas (conditionally rendered for mobile perf) ── */}
            <div aria-hidden="true" className="absolute inset-0 z-0">
                {isMobile ? <MobileHeroFallback /> : <HeroScene />}
            </div>

            {/* ── Background decorations ── */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
                {/* Perspective dot grid */}
                <div
                    className="absolute inset-0 opacity-[0.032]"
                    style={{
                        backgroundImage:
                            'linear-gradient(var(--sys-accent) 1px, transparent 1px), linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                    }}
                />
                {/* Mouse-tracked radial glow */}
                <motion.div
                    className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
                    style={{
                        x: glowX, y: glowY,
                        background: 'radial-gradient(circle, rgba(255,107,44,0.16), transparent 70%)',
                    }}
                />
            </div>

            {/* ── Fade-to-bg blend ── */}
            <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-[var(--sys-bg-primary)]/20 via-[var(--sys-bg-primary)]/55 to-[var(--sys-bg-primary)]" />

            {/* ── Text content ── */}
            <div className="relative z-10 app-shell max-w-4xl text-center pt-16">
                {/* Status badge */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeUp}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] text-[var(--sys-accent)] mb-8 bg-[var(--sys-accent)]/10 border border-[var(--sys-accent)]/25"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sys-accent)] opacity-75" />
                        <span className="relative rounded-full h-2 w-2 bg-[var(--sys-accent)]" />
                    </span>
                    Final Year EEE Undergraduate · Kongu Engineering College
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial="hidden" animate="visible" variants={fadeUp}
                    transition={{ delay: 0.1 }}
                    className="font-sans text-5xl md:text-7xl text-[var(--sys-text-primary)] mb-6 leading-[1.05] tracking-[-0.03em] font-extrabold"
                >
                    Bridging the Gap Between
                    <br className="hidden md:block" />
                    <em className="not-italic bg-clip-text text-transparent bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-light)]">
                        Hardware &amp; Software
                    </em>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial="hidden" animate="visible" variants={fadeUp}
                    transition={{ delay: 0.2 }}
                    className="text-[var(--sys-text-secondary)] text-lg leading-relaxed mb-5 max-w-xl mx-auto"
                >
                    I'm <strong className="text-[var(--sys-text-primary)]">Mekesh Kumar</strong>, an aspiring Graduate
                    Engineering Trainee specialising in Embedded Systems, Industrial Automation, IoT, and Full-Stack Development.
                </motion.p>

                {/* Quick stat pills */}
                <motion.div
                    initial="hidden" animate="visible" variants={staggerContainer}
                    transition={{ delay: 0.25 }}
                    className="flex flex-wrap justify-center gap-2.5 mb-8"
                >
                    {[
                        { val: '7.71', label: 'CGPA' },
                        { val: '11+', label: 'Events' },
                        { val: '4', label: 'Awards' },
                        { val: '8+', label: 'Projects' },
                        { val: '2', label: 'Memberships' },
                    ].map((s) => (
                        <motion.div
                            key={s.label}
                            variants={fadeUp}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sys-bg-secondary)]/60 backdrop-blur-sm border border-[var(--sys-border)] text-[var(--sys-text-primary)]"
                        >
                            <span className="text-sm font-black text-[var(--sys-accent)]">{s.val}</span>
                            <span className="text-xs text-[var(--sys-text-secondary)] font-semibold">{s.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeUp}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <a
                        href="#contact"
                        className="flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-semibold transition-all hover:shadow-[0_0_26px_var(--sys-accent)] hover:-translate-y-0.5 bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-dark)]"
                    >
                        Hire Me
                        <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                            </svg>
                        </span>
                    </a>
                    <a
                        href="#projects"
                        className="flex items-center gap-2 px-8 py-4 rounded-full text-[var(--sys-text-primary)] font-semibold border border-[var(--sys-border)] hover:border-[var(--sys-accent)] hover:text-[var(--sys-accent)] hover:bg-[var(--sys-bg-secondary)] transition-all"
                    >
                        View Projects
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                    </a>
                </motion.div>
            </div>

            {/* ── Hero Collage (parallax-tracked) ── */}
            <motion.div
                initial="hidden" animate="visible" variants={fadeUp}
                transition={{ delay: 0.5 }}
                className="flex gap-5 justify-center items-end pt-16 overflow-hidden relative z-10"
                style={{ x: imgParallaxX, y: imgParallaxY }}
            >
                {/* Left image */}
                <motion.div animate={slowFloatAnimation} className="relative z-0 hidden md:block">
                    <img
                        src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80"
                        alt="Hardware engineering"
                        className="w-48 lg:w-56 h-72 lg:h-80 rounded-3xl object-cover shadow-2xl -ml-6 border border-[var(--sys-border)] opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute -top-4 -right-4 bg-[var(--sys-bg-tertiary)]/80 backdrop-blur-md border border-[var(--sys-border)] rounded-2xl px-4 py-3 shadow-lg">
                        <p className="text-[10px] text-[var(--sys-text-secondary)] font-semibold uppercase tracking-wider">CGPA</p>
                        <p className="text-sm font-bold text-[var(--sys-accent)] tabular-nums">7.71</p>
                    </div>
                </motion.div>

                {/* Center image */}
                <div className="relative z-10">
                    <img
                        src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80"
                        alt="Software development"
                        className="w-[90vw] md:w-[480px] lg:w-[560px] h-[300px] md:h-[360px] lg:h-[400px] rounded-3xl object-cover shadow-2xl border border-[var(--sys-border)]"
                    />
                    {/* Pulsing demo button */}
                    <button
                        className="absolute -top-5 -right-5 w-14 h-14 bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-full shadow-xl flex items-center justify-center group transition-transform hover:scale-110"
                        aria-label="Watch demo"
                    >
                        <span className="absolute inset-0 rounded-full bg-[var(--sys-accent)]/20 animate-ping opacity-75" />
                        <svg className="w-5 h-5 text-[var(--sys-accent)] relative z-10 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </button>
                    {/* Status card */}
                    <div className="absolute -bottom-6 -left-4 md:-left-6 bg-[var(--sys-bg-secondary)]/80 backdrop-blur-xl border border-[var(--sys-border)] rounded-2xl p-4 shadow-xl min-w-[200px]">
                        <p className="text-[10px] text-[var(--sys-text-secondary)] font-semibold uppercase tracking-wider mb-2">Current Status</p>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-[var(--sys-accent)]/20 flex items-center justify-center text-[var(--sys-accent)] font-bold text-xs">MK</div>
                            <div>
                                <p className="text-xs font-bold text-[var(--sys-text-primary)]">Mekesh Kumar</p>
                                <p className="text-[10px] text-[var(--sys-text-secondary)]">Available for Hire</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--sys-success)] bg-[var(--sys-success)]/10 px-2.5 py-1.5 rounded-lg border border-[var(--sys-success)]/20">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Seeking GET Roles
                        </div>
                    </div>
                </div>

                {/* Right image */}
                <motion.div animate={floatAnimation} className="relative z-0 hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1580983546522-383796850c95?auto=format&fit=crop&q=80"
                        alt="PCB circuit design"
                        className="w-56 h-80 rounded-3xl object-cover shadow-2xl -mr-6 border border-[var(--sys-border)] opacity-80 hover:opacity-100 transition-opacity"
                    />
                    {/* Tech stack floating card */}
                    <div className="absolute -top-4 -left-4 bg-[var(--sys-bg-tertiary)]/80 backdrop-blur-md border border-[var(--sys-border)] rounded-2xl px-4 py-3 shadow-lg">
                        <p className="text-[10px] text-[var(--sys-text-secondary)] font-semibold uppercase tracking-wider mb-1.5">Tech Stack</p>
                        <div className="flex gap-1 flex-wrap max-w-[130px]">
                            {['ESP32', 'R3F', 'React', 'YOLOv8'].map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--sys-accent)]/15 text-[var(--sys-accent)] border border-[var(--sys-accent)]/20">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

// ─── Section: Timeline ───────────────────────────────────────────────────────

const TimelineSection = () => (
    <section className="py-28 relative overflow-hidden bg-[var(--sys-bg-primary)]" aria-label="Education and training timeline">
        {/* Accent glow blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute left-[-80px] top-[60px] h-[400px] w-[260px] rounded-full blur-[90px] opacity-[0.1]"
            style={{ background: 'radial-gradient(circle, var(--sys-accent), transparent 70%)' }} />
        <div aria-hidden="true" className="pointer-events-none absolute right-[-60px] bottom-[40px] h-[300px] w-[200px] rounded-full blur-[70px] opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, var(--sys-info), transparent 70%)' }} />

        <div className="relative z-10 app-shell max-w-5xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-14">
                <motion.span variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block">
                    Journey
                </motion.span>
                <motion.h2 variants={fadeUp} className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]">
                    Education &amp; <span className="text-[var(--sys-accent)]">Training</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[var(--sys-text-secondary)] max-w-lg mx-auto text-sm leading-relaxed">
                    From classroom fundamentals to real-world industrial exposure — a path built on curiosity, precision, and hands-on engineering.
                </motion.p>
            </motion.div>

            {/* Timeline spine + cards */}
            <div className="relative">
                {/* Vertical accent spine */}
                <div
                    className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block"
                    style={{ background: 'linear-gradient(to bottom, transparent, var(--sys-accent) 10%, var(--sys-accent) 90%, transparent)' }}
                />

                <div className="space-y-8">
                    {TIMELINE.map((item, i) => {
                        const isLeft = i % 2 === 0;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: isLeft ? -44 : 44 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.65, ease: EASE, delay: i * 0.06 }}
                                className={`flex items-center gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                            >
                                {/* Card */}
                                <div className="flex-1">
                                    <motion.div
                                        whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(255,107,44,0.14)' }}
                                        transition={{ duration: 0.25 }}
                                        className="group bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-2xl p-5 hover:border-[var(--sys-accent)]/40 transition-colors relative overflow-hidden"
                                    >
                                        {/* Hover top accent line */}
                                        <div
                                            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{ backgroundColor: TIMELINE_COLOR[item.type] }}
                                        />
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span
                                                    className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
                                                    style={{ color: TIMELINE_COLOR[item.type] }}
                                                >
                                                    {item.year}
                                                </span>
                                                <h3 className="text-sm font-bold text-[var(--sys-text-primary)] leading-snug">{item.title}</h3>
                                                <p className="text-[11px] text-[var(--sys-text-secondary)] mt-0.5">{item.sub}</p>
                                            </div>
                                            <span className="text-2xl ml-3 shrink-0">{item.icon}</span>
                                        </div>
                                        <span
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-1"
                                            style={{
                                                color: TIMELINE_COLOR[item.type],
                                                backgroundColor: TIMELINE_BG[item.type],
                                                borderColor: TIMELINE_COLOR[item.type] + '35',
                                            }}
                                        >
                                            {item.result}
                                        </span>
                                    </motion.div>
                                </div>

                                {/* Center node dot */}
                                <div
                                    className="hidden md:flex shrink-0 w-5 h-5 rounded-full border-2 items-center justify-center z-10 shadow-[0_0_12px_rgba(255,107,44,0.4)]"
                                    style={{ borderColor: TIMELINE_COLOR[item.type], backgroundColor: 'var(--sys-bg-primary)' }}
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIMELINE_COLOR[item.type] }} />
                                </div>

                                {/* Spacer (alternating side) */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    </section>
);

// ─── Section: Expertise ──────────────────────────────────────────────────────

const ExpertiseSection = () => (
    <section className="py-28 bg-[var(--sys-bg-primary)] relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute right-[-100px] top-[40px] h-[380px] w-[280px] rounded-full blur-[90px] opacity-[0.1]"
            style={{ background: 'radial-gradient(circle, var(--sys-accent), transparent 70%)' }} />

        <div className="relative z-10 app-shell">
            <div className="grid lg:grid-cols-3 gap-8 mb-20">
                {/* Header + certification chips */}
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                    variants={staggerContainer} className="flex flex-col justify-center pr-8"
                >
                    <motion.span variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3">My Arsenal</motion.span>
                    <motion.h2 variants={fadeUp} className="font-sans font-extrabold text-4xl text-[var(--sys-text-primary)] mb-5 leading-tight tracking-[-0.02em]">
                        Technical &amp; Engineering Expertise
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-[var(--sys-text-secondary)] text-sm leading-relaxed mb-8">
                        I build end-to-end systems from the PCB schematic to the cloud dashboard. Embedded C, React, YOLOv8, and everything in between.
                    </motion.p>
                    {/* Certifications as hoverable chips */}
                    <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                        {CERTIFICATIONS.map((c) => (
                            <motion.span
                                key={c.title}
                                whileHover={{ scale: 1.06 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border cursor-default"
                                style={{
                                    color: c.color,
                                    backgroundColor: c.color + '15',
                                    borderColor: c.color + '35',
                                }}
                            >
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {c.issuer} · {c.year}
                            </motion.span>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Card 1: Education snapshot */}
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-[var(--sys-accent)]/50 transition-all duration-300"
                >
                    <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[var(--sys-accent)]/10 rounded-full group-hover:scale-110 transition-transform duration-500 blur-2xl" />
                    <h3 className="text-lg font-bold text-[var(--sys-text-primary)] mb-2 relative z-10">Hands-on Industrial Training</h3>
                    <p className="text-[var(--sys-text-secondary)] text-sm mb-6 leading-relaxed relative z-10">
                        Practical exposure to manufacturing workflows at Hatsun Agro Products and Pavithran Aseptic — production lines, quality control, and industrial instrumentation.
                    </p>
                    <div className="bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] rounded-2xl p-4 shadow-sm relative z-10 mt-auto">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-[var(--sys-accent)] flex items-center justify-center text-white font-bold ring-2 ring-[var(--sys-accent)]/30 text-[10px]">KEC</div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--sys-success)] rounded-full border-2 border-[var(--sys-bg-tertiary)]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[var(--sys-text-secondary)] font-semibold uppercase tracking-wider">Education</p>
                                <p className="text-xs font-bold text-[var(--sys-text-primary)]">Kongu Engineering College</p>
                            </div>
                        </div>
                        <div className="rounded-xl p-3 text-white bg-gradient-to-br from-[var(--sys-accent)] to-[var(--sys-accent-dark)]">
                            <p className="text-[10px] opacity-80 font-semibold uppercase tracking-wider mb-1">Graduating Year</p>
                            <div className="flex justify-between items-center">
                                <p className="text-xs font-semibold">B.E. EEE — CGPA 7.71</p>
                                <p className="text-xs font-bold">2023 – Present</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Skill bars */}
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-[2.5rem] p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
                >
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--sys-text-secondary)] mb-3 block">Skill Metrics</span>
                        <h3 className="text-lg font-bold text-[var(--sys-text-primary)] mb-2 leading-snug">
                            Proficiency across <span className="text-[var(--sys-accent)]">domains</span>
                        </h3>
                        <p className="text-[var(--sys-text-secondary)] text-xs leading-relaxed mb-6">
                            Evaluating capabilities across hardware and software stacks.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Embedded C / C++ / ARM', val: 90, color: '#ff6b2c' },
                            { label: 'React · TypeScript · Firebase', val: 85, color: '#3b82f6' },
                            { label: 'IoT · YOLOv8 · Automation', val: 88, color: '#10b981' },
                            { label: 'Python · Flask · WebSockets', val: 82, color: '#8b5cf6' },
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-[11px] font-semibold mb-1">
                                    <span className="text-[var(--sys-text-secondary)]">{s.label}</span>
                                    <span className="text-[var(--sys-text-primary)]">{s.val}%</span>
                                </div>
                                <div className="h-1.5 bg-[var(--sys-bg-tertiary)] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${s.val}%` }}
                                        transition={{ duration: 1.1, delay: 0.1 + i * 0.1, ease: EASE }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: s.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { val: '11+', label: 'Technical Presentations at Events', num: '001', color: 'var(--sys-accent)' },
                    { val: '8+', label: 'Engineering Projects Built', num: '002', color: 'var(--sys-info)' },
                    { val: '2', label: 'Executive Memberships — ISTE & NSS', num: '003', color: 'var(--sys-success)' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp} transition={{ delay: i * 0.1 }}
                        className="group flex items-center justify-between p-8 rounded-3xl bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] hover:border-[var(--sys-accent)]/50 hover:bg-[var(--sys-bg-tertiary)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl font-black text-[var(--sys-text-primary)] tabular-nums">{s.val}</span>
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: s.color + '20', color: s.color }}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--sys-text-secondary)] font-medium">{s.label}</p>
                        </div>
                        <span
                            className="text-4xl font-black select-none transition-colors"
                            style={{ color: 'transparent', WebkitTextStroke: `1px var(--sys-border)` }}
                        >
                            {s.num}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

// ─── Section: Core Competencies ──────────────────────────────────────────────

const CoreValuesSection = () => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState<Record<string, { x: number; y: number }>>({});

    const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, id: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos((prev) => ({
            ...prev,
            [id]: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        }));
    }, []);

    return (
        <section
            className="py-28 bg-[var(--sys-bg-secondary)] border-t border-[var(--sys-border)] relative overflow-hidden"
            aria-labelledby="vision-heading"
        >
            <div className="app-shell">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
                    <motion.span variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block">
                        Areas of Interest
                    </motion.span>
                    <motion.h2 variants={fadeUp} id="vision-heading" className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]">
                        Core Competencies
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-[var(--sys-text-secondary)] max-w-xl mx-auto text-sm leading-relaxed">
                        Applying strong fundamentals across hardware design, firmware development, and intelligent software integration.
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {VISION_ITEMS.map((item, i) => {
                        const pos = mousePos[item.id];
                        return (
                            <motion.div
                                key={item.id}
                                initial="hidden" whileInView="visible" viewport={{ once: true }}
                                variants={fadeUp} transition={{ delay: i * 0.05 }}
                                className="group bg-[var(--sys-bg-primary)] p-8 rounded-3xl text-left border border-[var(--sys-border)] hover:border-[var(--sys-accent)] transition-all hover:-translate-y-1 cursor-crosshair relative overflow-hidden"
                                onMouseMove={(e) => handleCardMouseMove(e, item.id)}
                                onMouseEnter={() => setHoveredId(item.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Mouse-spotlight glow */}
                                {hoveredId === item.id && pos && (
                                    <div
                                        className="absolute pointer-events-none rounded-full transition-opacity duration-300"
                                        style={{
                                            width: 130, height: 130,
                                            left: pos.x - 65, top: pos.y - 65,
                                            background: 'radial-gradient(circle, rgba(255,107,44,0.2), transparent 70%)',
                                            filter: 'blur(10px)',
                                        }}
                                    />
                                )}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <span className="text-[10px] font-bold text-[var(--sys-text-secondary)] font-mono">{item.id}</span>
                                    <div className="w-9 h-9 bg-[var(--sys-bg-secondary)] group-hover:bg-[var(--sys-accent)]/10 rounded-xl flex items-center justify-center text-[var(--sys-text-secondary)] group-hover:text-[var(--sys-accent)] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="font-bold text-sm mb-2 text-[var(--sys-text-primary)] group-hover:text-[var(--sys-accent)] transition-colors relative z-10">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-[var(--sys-text-secondary)] leading-relaxed relative z-10">{item.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ─── Section: Achievements ───────────────────────────────────────────────────

const AchievementsSection = () => (
    <section className="py-28 bg-[var(--sys-bg-primary)] relative overflow-hidden" aria-label="Achievements and recognition">
        {/* Gold-toned ambient glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full blur-[130px] opacity-[0.06]"
                style={{ background: 'radial-gradient(circle, var(--sys-warning), transparent 70%)' }}
            />
        </div>

        <div className="relative z-10 app-shell">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
                <motion.span variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block">Recognition</motion.span>
                <motion.h2 variants={fadeUp} className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]">
                    Awards &amp; <span className="text-[var(--sys-accent)]">Achievements</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[var(--sys-text-secondary)] max-w-lg mx-auto text-sm leading-relaxed">
                    Recognised at multiple inter-collegiate ideathons, hackathons, and technical exhibitions across Tamil Nadu.
                </motion.p>
            </motion.div>

            {/* Award cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {ACHIEVEMENTS.map((a, i) => (
                    <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                        whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                        style={{ transformPerspective: 900 }}
                        className="group relative bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-3xl p-7 overflow-hidden hover:border-[var(--sys-accent)]/35 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300"
                    >
                        {/* Hover top accent line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ backgroundColor: a.color }}
                        />
                        {/* Corner glow bloom */}
                        <div
                            className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-500"
                            style={{ backgroundColor: a.color }}
                        />
                        <div className="flex items-start gap-5">
                            {/* Medal icon */}
                            <div
                                className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border"
                                style={{ backgroundColor: a.color + '18', borderColor: a.color + '35' }}
                            >
                                {a.medal}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: a.color }}>{a.rank}</span>
                                    <span className="text-[10px] font-bold text-[var(--sys-text-secondary)] bg-[var(--sys-bg-tertiary)] px-2 py-0.5 rounded-full">{a.year}</span>
                                </div>
                                <h3 className="text-sm font-bold text-[var(--sys-text-primary)] mb-1 leading-snug">{a.project}</h3>
                                <p className="text-[11px] text-[var(--sys-text-secondary)] mb-0.5 font-semibold">{a.event}</p>
                                <p className="text-[10px] text-[var(--sys-text-secondary)] opacity-65">{a.institution}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Leadership memberships */}
            <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                {[
                    {
                        org: 'ISTE', full: 'Indian Society for Technical Education',
                        role: 'Executive Member (2024 – Present)', icon: '🏛️',
                        desc: 'Organised technical events, workshops, and inter-departmental competitions at Kongu Engineering College.',
                    },
                    {
                        org: 'NSS', full: 'National Service Scheme',
                        role: 'Executive Member (2024 – Present)', icon: '🤝',
                        desc: 'Led community outreach, rural development, and social responsibility programmes.',
                    },
                ].map((org) => (
                    <motion.div
                        key={org.org} variants={fadeUp}
                        className="flex gap-4 p-6 rounded-2xl bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] hover:border-[var(--sys-accent)]/35 transition-all"
                    >
                        <div className="text-3xl shrink-0">{org.icon}</div>
                        <div>
                            <p className="text-xs font-black text-[var(--sys-accent)] uppercase tracking-wider mb-0.5">{org.org} · {org.role}</p>
                            <p className="text-sm font-bold text-[var(--sys-text-primary)] mb-1">{org.full}</p>
                            <p className="text-[11px] text-[var(--sys-text-secondary)] leading-relaxed">{org.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </section>
);

// ─── Section: Projects ───────────────────────────────────────────────────────

const ProjectsSection = () => (
    <section
        id="projects"
        className="py-28 bg-[var(--sys-bg-secondary)] border-t border-[var(--sys-border)] relative overflow-hidden"
    >
        <div className="relative z-10 app-shell">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
                <motion.span variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block">My Work</motion.span>
                <motion.h2 variants={fadeUp} className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]">
                    Featured Projects
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[var(--sys-text-secondary)] text-sm max-w-md mx-auto">
                    Presented at multiple technical events, ideathons, and hackathons including IEEE, ISTE, and Govt College of Technology.
                </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ gridAutoRows: '1fr' }}>
                {FEATURED_PROJECTS.map((proj, i) => (
                    <motion.article
                        key={proj.id}
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp} transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -8, rotateX: 3, rotateY: -3 }}
                        style={{ transformPerspective: 900 }}
                        className={`group relative rounded-[2.5rem] p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer ${proj.featured
                            ? 'bg-[var(--sys-bg-primary)] border-2 border-[var(--sys-accent)] shadow-[0_0_24px_rgba(255,107,44,0.18)]'
                            : 'bg-[var(--sys-bg-primary)] border border-[var(--sys-border)]'
                            }`}
                    >
                        {proj.featured && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                <span className="px-4 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-dark)] shadow-lg">
                                    ⭐ Award Winning
                                </span>
                            </div>
                        )}
                        <div className="aspect-[4/5] bg-[var(--sys-bg-tertiary)] rounded-3xl mb-5 overflow-hidden relative">
                            <img
                                src={proj.img} alt={proj.name}
                                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${!proj.featured && 'grayscale group-hover:grayscale-0'}`}
                            />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[var(--sys-bg-primary)]/80 to-transparent" />
                            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <span className="bg-[var(--sys-bg-primary)]/60 backdrop-blur-md text-[var(--sys-text-primary)] border border-[var(--sys-border)] text-[10px] font-bold px-2.5 py-1 rounded-full">
                                    {proj.tag}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-[var(--sys-text-primary)] mb-1">{proj.name}</h3>
                            <p className="text-[var(--sys-text-secondary)] text-[11px] mb-2 font-medium leading-snug">{proj.role}</p>
                            <p className="text-[10px] font-bold text-[var(--sys-accent)]">{proj.award}</p>
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    </section>
);

// ─── Section: CTA / Contact ──────────────────────────────────────────────────

const CtaSection = () => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus('sending');
        await new Promise((r) => setTimeout(r, 1200));
        setStatus('sent');
        setName('');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
    };

    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const mouseX = useSpring(rawMouseX, SPRING_CFG);
    const mouseY = useSpring(rawMouseY, SPRING_CFG);
    const glowX = useTransform(mouseX, [-400, 400], [-28, 28]);
    const glowY = useTransform(mouseY, [-300, 300], [-18, 18]);
    const tiltX = useTransform(mouseY, [-300, 300], [3, -3]);
    const tiltY = useTransform(mouseX, [-400, 400], [-4, 4]);

    return (
        <section
            id="contact"
            className="py-24 relative bg-[var(--sys-bg-primary)] overflow-hidden"
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                rawMouseX.set(e.clientX - (rect.left + rect.width / 2));
                rawMouseY.set(e.clientY - (rect.top + rect.height / 2));
            }}
            onMouseLeave={() => { rawMouseX.set(0); rawMouseY.set(0); }}
        >
            {/* Background grid */}
            <div aria-hidden="true" className="absolute inset-0 opacity-[0.032]"
                style={{
                    backgroundImage: 'linear-gradient(var(--sys-accent) 1px, transparent 1px), linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                }} />
            {/* Mouse-tracked glow */}
            <motion.div aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
                style={{ x: glowX, y: glowY, background: 'radial-gradient(circle, rgba(255,107,44,0.16), transparent 70%)' }}
            />

            <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
                className="app-shell rounded-[2.5rem] overflow-hidden relative bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] shadow-2xl"
            >
                {/* Top edge accent gradient */}
                <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-[var(--sys-accent)] to-transparent" />
                {/* Spinning decorative rings */}
                <motion.div aria-hidden="true"
                    className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-[var(--sys-accent)]/12"
                    animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div aria-hidden="true"
                    className="absolute top-8 right-8 w-32 h-32 rounded-full border-2 border-dashed border-[var(--sys-border)]"
                    animate={{ rotate: [360, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div aria-hidden="true"
                    className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full border border-white/5"
                    animate={{ rotate: [0, 360] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                />

                <div className="relative z-10 py-20 px-8 md:px-20 flex flex-col md:flex-row items-center gap-12">
                    {/* Left: copy + contact links */}
                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] px-3 py-1 rounded-full text-[11px] font-semibold text-[var(--sys-text-primary)] mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sys-success)] opacity-75" />
                                <span className="relative rounded-full h-2 w-2 bg-[var(--sys-success)]" />
                            </span>
                            Actively Seeking GET Roles
                        </div>
                        <h2 className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-6 leading-tight tracking-[-0.03em]">
                            Let's build the<br />future of<br />
                            <em className="not-italic text-[var(--sys-accent)]">automation.</em>
                        </h2>
                        <p className="text-[var(--sys-text-secondary)] text-sm leading-relaxed max-w-md mb-8">
                            Reach out to discuss GET opportunities in embedded systems, industrial IoT, or full-stack engineering. I respond within 24 hours.
                        </p>
                        {/* Quick contact links */}
                        <div className="flex flex-wrap gap-2.5">
                            <a
                                href="mailto:mekesh.engineer@gmail.com"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] text-[var(--sys-text-secondary)] hover:text-[var(--sys-accent)] hover:border-[var(--sys-accent)]/50 transition-all text-xs font-semibold"
                            >
                                📧 mekesh.engineer@gmail.com
                            </a>
                            <a
                                href="https://linkedin.com/in/mekeshkumar" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] text-[var(--sys-text-secondary)] hover:text-[var(--sys-accent)] hover:border-[var(--sys-accent)]/50 transition-all text-xs font-semibold"
                            >
                                🔗 linkedin.com/in/mekeshkumar
                            </a>
                            <a
                                href="https://github.com/Mekesh-Engineer" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] text-[var(--sys-text-secondary)] hover:text-[var(--sys-accent)] hover:border-[var(--sys-accent)]/50 transition-all text-xs font-semibold"
                            >
                                💻 github.com/Mekesh-Engineer
                            </a>
                        </div>
                    </div>

                    {/* Right: contact form */}
                    <div className="flex-1 max-w-md w-full">
                        <div className="bg-[var(--sys-bg-primary)] border border-[var(--sys-border)] rounded-[2rem] p-8 shadow-2xl">
                            <h3 className="font-bold text-[var(--sys-text-primary)] text-lg mb-5">Send a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                <div>
                                    <label htmlFor="cta-name" className="block text-xs font-semibold text-[var(--sys-text-secondary)] mb-1.5">Full Name</label>
                                    <input
                                        id="cta-name" type="text" value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="w-full bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-xl px-4 py-3 text-sm text-[var(--sys-text-primary)] placeholder:text-[var(--sys-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--sys-accent)]/30 focus:border-[var(--sys-accent)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cta-email" className="block text-xs font-semibold text-[var(--sys-text-secondary)] mb-1.5">Email Address</label>
                                    <input
                                        id="cta-email" type="email" value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="jane@email.com"
                                        className="w-full bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-xl px-4 py-3 text-sm text-[var(--sys-text-primary)] placeholder:text-[var(--sys-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--sys-accent)]/30 focus:border-[var(--sys-accent)] transition-all"
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 22px rgba(255,107,44,0.4)' }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-dark)] disabled:opacity-60 transition-all"
                                >
                                    {status === 'sending' ? 'Sending…' : status === 'sent' ? '✓ Message Sent!' : 'Get in Touch →'}
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

// ─── Section: Languages ──────────────────────────────────────────────────────

const LanguagesSection = () => (
    <section className="py-28 bg-[var(--sys-bg-primary)] relative overflow-hidden" aria-label="Languages">
        <div aria-hidden="true" className="pointer-events-none absolute right-[-80px] top-[50px] h-[350px] w-[250px] rounded-full blur-[80px] opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, var(--sys-accent), transparent 70%)' }} />
        <div className="relative z-10 app-shell max-w-5xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-14">
                <motion.span variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block">
                    Communication
                </motion.span>
                <motion.h2 variants={fadeUp} className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]">
                    Languages
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[var(--sys-text-secondary)] max-w-md mx-auto text-sm leading-relaxed">
                    Multilingual proficiency for effective collaboration across diverse teams and environments.
                </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {LANGUAGES.map((lang, i) => (
                    <motion.div
                        key={lang.lang}
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp} transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(255,107,44,0.14)' }}
                        className="group bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-3xl p-7 text-center hover:border-[var(--sys-accent)]/40 transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Hover bloom */}
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[var(--sys-accent)]/10 rounded-full group-hover:scale-110 transition-transform duration-500 blur-2xl" />
                        <div className="relative z-10">
                            <span className="text-4xl mb-4 block">{lang.flag}</span>
                            <h3 className="text-lg font-bold text-[var(--sys-text-primary)] mb-1">{lang.lang}</h3>
                            <p className="text-xs font-semibold text-[var(--sys-accent)] uppercase tracking-wider mb-4">{lang.level}</p>
                            {/* Proficiency bar */}
                            <div className="h-1.5 bg-[var(--sys-bg-tertiary)] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${lang.proficiency}%` }}
                                    transition={{ duration: 1.1, delay: 0.2 + i * 0.15, ease: EASE }}
                                    className="h-full rounded-full bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-light)]"
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AboutPage() {
    return (
        <>
            <Helmet>
                <title>About Mekesh Kumar — Embedded Systems · IoT · Full-Stack Engineer</title>
                <meta
                    name="description"
                    content="Final-year EEE undergraduate at Kongu Engineering College. Specialising in embedded systems, industrial automation, IoT, and full-stack development. Award-winning engineer with 8+ projects and 11+ technical presentations."
                />
                <meta property="og:title" content="About Mekesh Kumar — Engineer & Builder" />
                <meta property="og:description" content="Bridging the gap between hardware & software. View projects, achievements, and career timeline." />
                <meta property="og:type" content="profile" />
            </Helmet>

            <Navbar />

            <div className="min-h-screen bg-[var(--sys-bg-primary)] font-sans text-[var(--sys-text-primary)] selection:bg-[var(--sys-accent)] selection:text-white overflow-x-hidden">
                <main id="main-content">
                    <HeroSection />
                    <TimelineSection />
                    <ExpertiseSection />
                    <CoreValuesSection />
                    <AchievementsSection />
                    <ProjectsSection />
                    <LanguagesSection />
                    <CtaSection />
                </main>
            </div>

            <Footer />
        </>
    );
}