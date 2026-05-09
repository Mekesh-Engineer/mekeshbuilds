/**
 * AboutPage.tsx — Enhanced v4 (Premium Engineering Dossier Edition)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Implements the full "Premium About Page" spec:
 * NEW SECTIONS / IMPROVEMENTS:
 * ✅ AboutIntelligenceSection  — split 60/40 layout with cinematic identity stage
 * ✅ IdentityStage (left)      — portrait, 7 ripple rings, bloom gradient, dot grid,
 * floating particles, 3-layer parallax, 3D tilt
 * ✅ EngineeringPanel (right)  — bio narrative, philosophy block, capability matrix,
 * experience signals, project thinking snapshot,
 * toolchain ecosystem chips, soft skills
 * ✅ CapabilityMatrix          — domain cards with visual confidence bars + ring
 * ✅ ToolchainEcosystem        — grouped chips (Hardware/Sim/Programming/AI)
 * ✅ ProjectThinkingSnapshot   — Problem → Approach → Outcome format
 * ✅ EngineeringPhilosophy     — principles card with bullet points
 * ✅ ExperienceSignals         — stat cards with icons
 * ✅ Micro-interactions        — chip scale+glow, card lift+shadow, scroll reveals
 * ✅ Reduced-motion respect    — all animations wrapped with prefers-reduced-motion
 * ✅ Semantic HTML             — <section>, <header>, <article>, role attrs
 * ✅ WCAG focus states         — focus-visible rings on all interactive elements
 * ✅ Mobile stacking order     — Identity → Bio → Panels → Modules
 * ✅ All previous sections preserved (Timeline, Expertise, CoreValues,
 * Achievements, Projects, Languages, CTA)
 *
 * Design tokens: variables.css (--sys-bg-*, --sys-accent, --sys-text-*, etc.)
 * Motion: Framer Motion + React Three Fiber
 */

import React, {
  type FormEvent,
  type ReactNode,
  Suspense,
  useRef,
  useCallback,
  useState,
  useEffect,
  useMemo,
  Component,
} from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Environment,
  ContactShadows,
  Stars,
} from '@react-three/drei';
import {
  FaArrowDown,
  FaArrowRight,
  FaAward,
  FaBolt,
  FaBookOpen,
  FaBuildingColumns,
  FaCalendarDays,
  FaCar,
  FaCode,
  FaDiagramProject,
  FaEnvelope,
  FaGamepad,
  FaGithub,
  FaGlobe,
  FaEarthAsia,
  FaEarthEurope,
  FaGraduationCap,
  FaIndustry,
  FaLinkedin,
  FaMagnifyingGlass,
  FaMedal,
  FaMicrochip,
  FaPeopleGroup,
  FaPlay,
  FaRecycle,
  FaSatelliteDish,
  FaScrewdriverWrench,
  FaBinoculars,
  FaTrophy,
  FaFileLines,
  FaLink,
  FaRobot,
} from 'react-icons/fa6';
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

// ─── Hooks ───────────────────────────────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const check = () =>
        setIsMobile(
          window.innerWidth < 768 || (window.navigator && window.navigator.maxTouchPoints > 1),
        );
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }
  }, []);
  return isMobile;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const EASE = [0.32, 0.72, 0, 1] as const;
const SPRING_CFG = { stiffness: 110, damping: 20, mass: 0.9 } as const;

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const floatAnimation = {
  y: [-8, 8, -8],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};
const slowFloatAnimation = {
  y: [-12, 12, -12],
  transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
};

// ─── 3D Components ────────────────────────────────────────────────────────────
const InteractiveAbstractShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      state.pointer.y * 0.5,
      0.1,
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      state.pointer.x * 0.5,
      0.1,
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

const OrbitalRing = ({
  radius,
  speed,
  color,
  opacity = 0.45,
}: {
  radius: number;
  speed: number;
  color: string;
  opacity?: number;
}) => {
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
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

const FloatingSphere = ({
  pos,
  size,
  color,
}: {
  pos: [number, number, number];
  size: number;
  color: string;
}) => (
  <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.5}>
    <mesh position={pos}>
      <sphereGeometry args={[size, 32, 32]} />
      <MeshWobbleMaterial color={color} metalness={0.9} roughness={0.05} factor={0.1} speed={1} />
    </mesh>
  </Float>
);

const CanvasLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-[var(--sys-bg-primary)]">
    <div className="w-10 h-10 border-2 border-[var(--sys-accent)]/30 border-t-[var(--sys-accent)] rounded-full animate-spin" />
  </div>
);

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
        <ContactShadows
          position={[0, -2.8, 0]}
          opacity={0.3}
          scale={20}
          blur={2}
          far={4}
          color="#ff6b2c"
        />
      </Canvas>
    </Suspense>
  </WebGLErrorBoundary>
);

const MobileHeroFallback = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] bg-gradient-to-br from-[var(--sys-accent)] to-[var(--sys-accent-dark)]"
    />
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        className="absolute rounded-full bg-[var(--sys-accent)]"
        style={{
          width: 4 + i * 2,
          height: 4 + i * 2,
          top: `${15 + ((i * 10) % 70)}%`,
          left: `${10 + ((i * 13) % 80)}%`,
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
    featured: true,
    awardIcon: FaTrophy,
    award: 'Presented at 5 inter-collegiate events incl. Robofiesta 2K25',
  },
  {
    id: 2,
    name: 'Smart IoT Event Platform',
    role: 'React 19 · Firebase · YOLOv8 · ESP32-CAM',
    tag: 'IoT / AI / Full Stack',
    img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80',
    awardIcon: FaAward,
    award: 'Tamizhanskills Ideathon 2026 — 1st Prize',
  },
  {
    id: 3,
    name: 'Rod Inspection System',
    role: 'OpenCV · YOLOv8 · Flask · ESP32-CAM · C++',
    tag: 'Machine Vision',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
    awardIcon: FaDiagramProject,
    award: 'SCADA-like multi-threaded dashboard',
  },
  {
    id: 4,
    name: 'Cosmic Strikes 3D',
    role: 'React · Three.js · React Three Fiber · Node.js',
    tag: 'Full Stack / WebGL',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
    awardIcon: FaGamepad,
    award: '60 FPS 3D arcade shooter + JWT leaderboard',
  },
  {
    id: 5,
    name: 'IoT Waste Segregation',
    role: 'C++ · ESP32 · Blynk IoT · Servo · Multi-Sensor',
    tag: 'Embedded Systems',
    img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80',
    awardIcon: FaRecycle,
    award: 'Autonomous multi-sensor sorting system',
  },
  {
    id: 6,
    name: 'MekeshBuilds Portfolio',
    role: 'React 19 · TypeScript · Firebase · Framer Motion · Zod',
    tag: 'Full Stack / SaaS',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
    awardIcon: FaGlobe,
    award: 'Full-stack portfolio platform with R3F + autosave',
  },
  {
    id: 7,
    name: 'Fuzzy Energy Manager',
    role: 'Arduino Mega · Fuzzy Logic · Proteus · ACS712',
    tag: 'Power Electronics',
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80',
    awardIcon: FaBolt,
    award: 'Fuzzy logic hybrid energy optimisation',
  },
  {
    id: 8,
    name: 'GPS Smart Horn System',
    role: 'ESP32 · GPS NEO-6M · L298N · PWM · Web Server',
    tag: 'Embedded / Transport',
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80',
    awardIcon: FaCar,
    award: 'Geofence-aware automated speed & horn regulation',
  },
];

const VISION_ITEMS = [
  {
    id: '001',
    title: 'Embedded Systems',
    desc: 'Robust firmware and hardware interfaces for real-time control using ESP32, ARM, I2C, SPI, UART, and FreeRTOS.',
  },
  {
    id: '002',
    title: 'Full Stack Solutions',
    desc: 'Seamless React 19 + Firebase / Supabase web apps that connect edge devices to the cloud via WebSockets.',
  },
  {
    id: '003',
    title: 'IoT Integration',
    desc: 'Smart, connected environments for industrial automation — OTA updates, edge telemetry, and Blynk IoT dashboards.',
  },
  {
    id: '004',
    title: 'PCB & Circuit Design',
    desc: 'Efficient circuit layouts using AutoCAD Electrical, Proteus, OrCAD PSpice, and power electronics principles.',
  },
  {
    id: '005',
    title: 'Computer Vision',
    desc: 'YOLOv8 + OpenCV AI pipelines for automated inspection, defect detection, and crowd density analysis.',
  },
  {
    id: '006',
    title: 'Power Electronics',
    desc: 'EV motor drivers, relay switching, fuzzy logic energy management, and smart grid load optimisation.',
  },
  {
    id: '007',
    title: 'Industrial Automation',
    desc: 'SCADA-like monitoring dashboards, multi-sensor fusion, and real-time control logic for manufacturing.',
  },
  {
    id: '008',
    title: 'Continuous Learning',
    desc: 'ARM certification via Maven Silicon, Google AI APIs, and executive roles in ISTE & NSS at KEC.',
  },
];

const ACHIEVEMENTS = [
  {
    id: 1,
    icon: FaMedal,
    rank: '1st Prize',
    color: '#f59e0b',
    project: 'Smart IoT Event & Venue Management Platform',
    event: 'Tamizhanskills Ideathon 2026',
    institution: 'New Prince Shri Bhavani College of Engineering, Chennai',
    year: '2026',
  },
  {
    id: 2,
    icon: FaMedal,
    rank: '3rd Prize',
    color: '#cd7f32',
    project: 'ROV-Based Underwater Crack Detection System',
    event: 'Project Prism – Oracle 2025',
    institution: 'Govt. College of Technology, Coimbatore',
    year: '2025',
  },
  {
    id: 3,
    icon: FaMedal,
    rank: '3rd Prize',
    color: '#cd7f32',
    project: 'Smart IoT Event & Venue Management Platform',
    event: 'Elixir 2026 Technical Event',
    institution: 'Govt. College of Engineering, Erode',
    year: '2026',
  },
  {
    id: 4,
    icon: FaMedal,
    rank: 'School First Rank',
    color: '#ff6b2c',
    project: 'Higher Secondary Examination (84%)',
    event: 'HSE Board Examinations 2023',
    institution: 'Govt. Boys Higher Secondary School, Palacode',
    year: '2023',
  },
];

const TIMELINE = [
  {
    id: 1,
    year: '2020 – 21',
    title: 'SSLC',
    sub: 'DDCSM Matriculation School, Palacode',
    result: '84%',
    type: 'education',
    icon: FaGraduationCap,
  },
  {
    id: 2,
    year: '2021 – 23',
    title: 'Higher Secondary (HSE)',
    sub: 'Govt. Boys Higher Secondary School, Palacode, Tamil Nadu',
    result: '84%',
    type: 'education',
    icon: FaBookOpen,
  },
  {
    id: 3,
    year: '2023 – Present',
    title: 'B.E. Electrical & Electronics Engineering',
    sub: 'Kongu Engineering College, Perundurai',
    result: 'CGPA 7.71',
    type: 'education',
    icon: FaBolt,
  },
  {
    id: 4,
    year: 'Jul 2024',
    title: 'In-Plant Training — Manufacturing Operations',
    sub: 'Hatsun Agro Products Ltd., Vellichandai',
    result: '5 Days',
    type: 'industry',
    icon: FaIndustry,
  },
  {
    id: 5,
    year: 'Jan 2025',
    title: 'In-Plant Training — Quality Control & Instrumentation',
    sub: 'Pavithran Aseptic Fruit Products',
    result: '5 Days',
    type: 'industry',
    icon: FaScrewdriverWrench,
  },
  {
    id: 6,
    year: 'Nov 2024',
    title: 'Industrial Visit — Radio Astronomy Centre, Ooty',
    sub: 'Large-scale RF signal processing systems',
    result: 'RF Systems',
    type: 'visit',
    icon: FaSatelliteDish,
  },
  {
    id: 7,
    year: 'Mar 2025',
    title: 'Industrial Visit — Kodaikanal Solar Observatory',
    sub: 'Precision instrumentation and data acquisition',
    result: 'Instrumentation',
    type: 'visit',
    icon: FaBinoculars,
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
  { lang: 'Tamil', level: 'Native', icon: FaEarthAsia, proficiency: 100 },
  { lang: 'English', level: 'Professional', icon: FaEarthEurope, proficiency: 85 },
  { lang: 'Hindi', level: 'Working', icon: FaEarthAsia, proficiency: 60 },
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

// ─── NEW DATA: Engineering Intelligence Panel ─────────────────────────────────
const CAPABILITY_MATRIX = [
  {
    domain: 'Core EEE',
    summary: 'Power systems, machines, drives & grid automation',
    tools: 'MATLAB · Simulink · OrCAD · Proteus',
    confidence: 88,
    color: '#f59e0b',
    icon: FaBolt,
  },
  {
    domain: 'Simulation & Modeling',
    summary: 'Digital circuit design, FPGA logic, and system-level sim',
    tools: 'Xilinx ISE · Quartus Prime · Simulink',
    confidence: 82,
    color: '#8b5cf6',
    icon: FaDiagramProject,
  },
  {
    domain: 'Embedded Systems',
    summary: 'Real-time firmware, RTOS, sensor interfacing & peripherals',
    tools: 'ESP32 · ARM Cortex · FreeRTOS · C/C++',
    confidence: 92,
    color: '#ff6b2c',
    icon: FaMicrochip,
  },
  {
    domain: 'Software Engineering',
    summary: 'Full-stack web platforms, APIs, real-time data flows',
    tools: 'React 19 · TypeScript · Firebase · Flask',
    confidence: 87,
    color: '#06b6d4',
    icon: FaCode,
  },
  {
    domain: 'AI / ML Integration',
    summary: 'Vision pipelines, object detection & edge inference',
    tools: 'YOLOv8 · OpenCV · ONNX · Python',
    confidence: 84,
    color: '#10b981',
    icon: FaRobot,
  },
];

const TOOLCHAIN_GROUPS = [
  {
    group: 'Hardware',
    color: '#ff6b2c',
    tools: ['ESP32', 'Arduino', 'ARM Cortex-M', 'GPS NEO-6M', 'L298N', 'ACS712', 'Servo Motors'],
  },
  {
    group: 'Simulation',
    color: '#f59e0b',
    tools: ['MATLAB', 'Simulink', 'Proteus', 'OrCAD PSpice', 'Xilinx ISE', 'Quartus Prime'],
  },
  {
    group: 'Programming',
    color: '#06b6d4',
    tools: ['Embedded C/C++', 'Python', 'TypeScript', 'React 19', 'Flask', 'Node.js', 'Firebase'],
  },
  {
    group: 'AI / CV',
    color: '#10b981',
    tools: ['YOLOv8', 'OpenCV', 'ONNX', 'Roboflow', 'Label Studio', 'CVAT.ai'],
  },
];

const EXPERIENCE_SIGNALS = [
  { val: '2+', label: 'Years Hands-On', icon: FaCalendarDays, color: '#ff6b2c' },
  { val: '8+', label: 'Projects Built', icon: FaScrewdriverWrench, color: '#06b6d4' },
  { val: '4', label: 'Awards Won', icon: FaTrophy, color: '#f59e0b' },
  { val: '5+', label: 'Domains Explored', icon: FaGlobe, color: '#10b981' },
];

const PHILOSOPHY_PRINCIPLES = [
  {
    label: 'Systems-first thinking',
    desc: 'Always model the full system before touching a line of code or wiring a single component.',
  },
  {
    label: 'Simulation before deployment',
    desc: 'Verify in MATLAB, Proteus, or unit tests first. Hardware is expensive to debug.',
  },
  {
    label: 'Hardware-software co-design',
    desc: 'Firmware and UI are designed in tandem — neither is an afterthought.',
  },
  {
    label: 'Iterative prototyping',
    desc: 'Ship a working core fast, measure it, then layer in sophistication.',
  },
];

const PROJECT_THINKING = [
  {
    project: 'V2X Fleet Monitoring System',
    problem: 'Real-time vehicle tracking with zero-config discovery across heterogeneous networks.',
    approach:
      'UDP broadcast for auto-discovery, multi-threaded Flask proxy, mutex-protected command queues.',
    outcome:
      'Sub-50ms latency monitoring across 5 vehicles — presented at 5 events including Robofiesta 2K25.',
  },
  {
    project: 'Smart IoT Event Platform',
    problem:
      'Venue management with live crowd density, ticket validation, and multi-role access control.',
    approach:
      'YOLOv8 crowd detection + cryptographic QR tokens + Firebase RBAC + ESP32-CAM edge nodes.',
    outcome: '1st Prize at Tamizhanskills Ideathon 2026 — validated at 300+ concurrent tickets.',
  },
];

const SOFT_SKILLS = [
  {
    skill: 'Debugging Mindset',
    icon: FaMagnifyingGlass,
    desc: 'Systematic fault isolation — hardware probe to log trace to root cause.',
  },
  {
    skill: 'System Integration',
    icon: FaLink,
    desc: 'Comfort bridging PCB-level circuits with cloud-facing APIs in one coherent design.',
  },
  {
    skill: 'Documentation Clarity',
    icon: FaFileLines,
    desc: 'Clean README, inline comments, and diagrams that survive handoff.',
  },
  {
    skill: 'Rapid Prototyping',
    icon: FaBolt,
    desc: 'From idea to working demo in 48 hours using the right minimal toolset.',
  },
];

// ─── IdentityStage — left 60% cinematic panel ────────────────────────────────
const IdentityStage = () => {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, SPRING_CFG);
  const mouseY = useSpring(rawMouseY, SPRING_CFG);

  const portraitX = useTransform(mouseX, [-300, 300], [-6, 6]);
  const portraitY = useTransform(mouseY, [-300, 300], [-4, 4]);
  const ringsX = useTransform(mouseX, [-300, 300], [-14, 14]);
  const ringsY = useTransform(mouseY, [-300, 300], [-10, 10]);
  const particleX = useTransform(mouseX, [-300, 300], [-22, 22]);
  const particleY = useTransform(mouseY, [-300, 300], [-16, 16]);

  const tiltX = useTransform(mouseY, [-300, 300], [6, -6]);
  const tiltY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || shouldReduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      rawMouseX.set(e.clientX - (rect.left + rect.width / 2));
      rawMouseY.set(e.clientY - (rect.top + rect.height / 2));
    },
    [isMobile, shouldReduceMotion, rawMouseX, rawMouseY],
  );

  const handleMouseLeave = useCallback(() => {
    rawMouseX.set(0);
    rawMouseY.set(0);
  }, [rawMouseX, rawMouseY]);

  const particles = useMemo(
    () =>
      [...Array(isMobile ? 6 : 14)].map((_, i) => ({
        id: i,
        size: 2 + (i % 4),
        top: `${8 + ((i * 6.5) % 82)}%`,
        left: `${5 + ((i * 7.3) % 88)}%`,
        duration: 5 + (i % 3) * 1.5,
        delay: i * 0.28,
      })),
    [isMobile],
  );

  return (
    <div
      className="relative flex items-center justify-center min-h-[520px] lg:min-h-[680px] select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.028] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--sys-accent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at bottom, rgba(255,107,44,0.32) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={shouldReduceMotion ? {} : { x: particleX, y: particleY }}
      >
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={shouldReduceMotion ? {} : { y: [-12, 12, -12], opacity: [0.2, 0.55, 0.2] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
            className="absolute rounded-full bg-[var(--sys-accent)]"
            style={{ width: p.size, height: p.size, top: p.top, left: p.left }}
          />
        ))}
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 pointer-events-none"
        style={shouldReduceMotion ? {} : { x: ringsX, y: ringsY }}
      >
        {[...Array(7)].map((_, i) => {
          const baseSize = 120 + i * 72;
          return (
            <motion.div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                width: baseSize,
                height: baseSize,
                top: '50%',
                left: '50%',
                borderColor: `rgba(255, 107, 44, ${0.22 - i * 0.026})`,
              }}
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: [1, 1.035 + i * 0.005, 1],
                      opacity: [0.55 - i * 0.055, 0.8 - i * 0.055, 0.55 - i * 0.055],
                    }
              }
              transition={{
                duration: 3.5 + i * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.18,
              }}
            />
          );
        })}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            background: 'radial-gradient(circle, rgba(255,107,44,0.35) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      <motion.div
        className="relative z-10"
        style={
          shouldReduceMotion
            ? {}
            : {
                x: portraitX,
                y: portraitY,
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 1000,
              }
        }
      >
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative group"
        >
          <div
            className="relative w-[clamp(200px,28vw,320px)] h-[clamp(260px,36vw,420px)] rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.55)]
                        border border-[var(--sys-accent)]/25
                        ring-1 ring-[var(--sys-accent)]/10"
          >
            <img
              src="https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=600"
              alt="Mekesh Kumar — Embedded Systems & Full-Stack Engineer"
              className="w-full h-full object-cover object-top
                                transition-transform duration-700 group-hover:scale-[1.04]"
              loading="eager"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,107,44,0.18) 0%, transparent 50%, transparent 100%)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(15,15,20,0.7) 0%, transparent 100%)',
              }}
              aria-hidden="true"
            />
          </div>

          <div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[90%]
                        bg-[var(--sys-bg-secondary)]/90 backdrop-blur-xl
                        border border-[var(--sys-border)]/60
                        rounded-2xl px-5 py-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          >
            <p className="text-[0.85rem] font-black text-[var(--sys-text-primary)] tracking-tight">
              Mekesh Kumar
            </p>
            <p className="text-[0.72rem] text-[var(--sys-accent)] font-semibold uppercase tracking-[0.12em] mt-0.5">
              Embedded Systems · IoT · Full-Stack
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sys-success)] opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-[var(--sys-success)]" />
              </span>
              <span className="text-[10px] font-semibold text-[var(--sys-success)]">
                Available for hire
              </span>
            </div>
          </div>

          <motion.div
            animate={shouldReduceMotion ? {} : { y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-3 -right-5
                            bg-[var(--sys-bg-tertiary)]/90 backdrop-blur-md
                            border border-[var(--sys-border)]/60
                            rounded-2xl px-4 py-2.5 shadow-lg"
          >
            <p className="text-[9px] text-[var(--sys-text-secondary)] font-bold uppercase tracking-widest">
              CGPA
            </p>
            <p className="text-base font-black text-[var(--sys-accent)] tabular-nums leading-tight">
              7.71
            </p>
          </motion.div>

          <motion.div
            animate={shouldReduceMotion ? {} : { y: [4, -4, 4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-1/3 -left-6
                            bg-[var(--sys-bg-secondary)]/90 backdrop-blur-md
                            border border-[var(--sys-border)]/60
                            rounded-2xl px-3 py-2 shadow-lg"
          >
            <p className="text-[9px] font-bold text-[var(--sys-text-secondary)] uppercase tracking-wider mb-1">
              Stack
            </p>
            <div className="flex flex-col gap-0.5">
              {['ESP32', 'React', 'YOLOv8'].map((t) => (
                <span
                  key={t}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded
                                    bg-[var(--sys-accent)]/15 text-[var(--sys-accent)] border border-[var(--sys-accent)]/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// ─── CapabilityMatrix — domain cards with confidence rings ────────────────────
const CapabilityMatrix = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-3" role="list" aria-label="Technical capability matrix">
      {CAPABILITY_MATRIX.map((cap, i) => (
        <motion.div
          key={cap.domain}
          role="listitem"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeUp}
          transition={{ delay: i * 0.07 }}
          whileHover={
            shouldReduceMotion
              ? {}
              : {
                  y: -3,
                  boxShadow: `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${cap.color}30`,
                }
          }
          className="group flex items-center gap-4 p-4 rounded-2xl
                        bg-[var(--sys-bg-tertiary)]/50 border border-[var(--sys-border)]/60
                        hover:border-[var(--sys-accent)]/30 hover:bg-[var(--sys-bg-tertiary)]
                        transition-all duration-300 cursor-default"
        >
          <div className="relative shrink-0 w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke={cap.color + '20'}
                strokeWidth="3.5"
              />
              <motion.circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke={cap.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 16}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                whileInView={{
                  strokeDashoffset: shouldReduceMotion
                    ? 0
                    : 2 * Math.PI * 16 * (1 - cap.confidence / 100),
                }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.15 + i * 0.08, ease: EASE }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg">
              {(() => {
                const Icon = cap.icon;
                return <Icon className="h-5 w-5" aria-hidden="true" focusable="false" />;
              })()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="text-[0.82rem] font-bold text-[var(--sys-text-primary)] group-hover:text-[var(--sys-accent)] transition-colors">
                {cap.domain}
              </h4>
              <span className="text-[10px] font-black tabular-nums" style={{ color: cap.color }}>
                {cap.confidence}%
              </span>
            </div>
            <p className="text-[0.72rem] text-[var(--sys-text-secondary)] leading-snug mb-1.5 truncate">
              {cap.summary}
            </p>
            <div className="flex flex-wrap gap-1">
              {cap.tools.split(' · ').map((tool) => (
                <span
                  key={tool}
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full
                                        bg-[var(--sys-bg-primary)] border border-[var(--sys-border)]/60
                                        text-[var(--sys-text-secondary)]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden lg:block w-20">
            <div className="h-1 bg-[var(--sys-bg-primary)] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: cap.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${cap.confidence}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + i * 0.07, ease: EASE }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── ToolchainEcosystem — grouped chips ───────────────────────────────────────
const ToolchainEcosystem = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="space-y-4" aria-label="Toolchain ecosystem">
      {TOOLCHAIN_GROUPS.map((group, gi) => (
        <motion.div
          key={group.group}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
          variants={staggerContainer}
          transition={{ delay: gi * 0.08 }}
        >
          <span
            className="text-[9px] font-black uppercase tracking-[0.18em] mb-2 block"
            style={{ color: group.color }}
          >
            {group.group}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {group.tools.map((tool) => (
              <motion.span
                key={tool}
                variants={fadeUp}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: 1.08,
                        boxShadow: `0 0 12px ${group.color}50`,
                        borderColor: group.color + '70',
                      }
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                    text-[10px] font-semibold border cursor-default transition-all duration-200
                                    bg-[var(--sys-bg-tertiary)] text-[var(--sys-text-secondary)]
                                    border-[var(--sys-border)]/60
                                    hover:text-[var(--sys-text-primary)]
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60"
                style={{}}
              >
                {tool}
              </motion.span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── ProjectThinkingSnapshot ──────────────────────────────────────────────────
const ProjectThinkingSnapshot = () => (
  <div className="space-y-5" aria-label="Project thinking examples">
    {PROJECT_THINKING.map((p, i) => (
      <motion.div
        key={p.project}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-30px' }}
        variants={fadeUp}
        transition={{ delay: i * 0.1 }}
        className="rounded-2xl border border-[var(--sys-border)]/60 overflow-hidden
                    bg-[var(--sys-bg-tertiary)]/40 hover:border-[var(--sys-accent)]/30 transition-colors"
      >
        <div
          className="px-4 py-2.5 border-b border-[var(--sys-border)]/40"
          style={{ background: 'rgba(255,107,44,0.06)' }}
        >
          <p className="text-[0.75rem] font-black text-[var(--sys-accent)] tracking-tight">
            {p.project}
          </p>
        </div>
        <div className="divide-y divide-[var(--sys-border)]/30">
          {[
            { label: 'Problem', value: p.problem, color: '#ef4444' },
            { label: 'Approach', value: p.approach, color: '#f59e0b' },
            { label: 'Outcome', value: p.outcome, color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex gap-3 px-4 py-2.5">
              <span
                className="shrink-0 text-[9px] font-black uppercase tracking-widest mt-0.5 w-14"
                style={{ color }}
              >
                {label}
              </span>
              <p className="text-[0.78rem] text-[var(--sys-text-secondary)] leading-relaxed">
                {value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    ))}
  </div>
);

// ─── EngineeringPhilosophy block ─────────────────────────────────────────────
const EngineeringPhilosophy = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="rounded-2xl border border-[var(--sys-accent)]/20
                bg-gradient-to-br from-[var(--sys-accent)]/[0.06] to-transparent
                p-5 relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(255,107,44,0.12)' }}
      />
      <h4 className="text-[0.82rem] font-black text-[var(--sys-text-primary)] mb-3.5 relative z-10 tracking-tight">
        How I Approach Problems
      </h4>
      <ul className="space-y-3 relative z-10">
        {PHILOSOPHY_PRINCIPLES.map((p, i) => (
          <motion.li
            key={p.label}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: i * 0.08 }}
            className="flex gap-2.5"
          >
            <span
              className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center
                                bg-[var(--sys-accent)]/15 text-[var(--sys-accent)]"
              aria-hidden="true"
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div>
              <p className="text-[0.78rem] font-bold text-[var(--sys-text-primary)] mb-0.5">
                {p.label}
              </p>
              <p className="text-[0.72rem] text-[var(--sys-text-secondary)] leading-relaxed">
                {p.desc}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

// ─── ExperienceSignals ────────────────────────────────────────────────────────
const ExperienceSignals = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="grid grid-cols-2 gap-3" role="list" aria-label="Experience highlights">
      {EXPERIENCE_SIGNALS.map((s, i) => (
        <motion.div
          key={s.label}
          role="listitem"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: i * 0.08 }}
          whileHover={
            shouldReduceMotion ? {} : { y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.35)' }
          }
          className="group flex flex-col gap-1 p-4 rounded-2xl border border-[var(--sys-border)]/60
                        bg-[var(--sys-bg-tertiary)]/40 hover:border-[var(--sys-accent)]/30
                        transition-all duration-250 cursor-default"
        >
          <div className="flex items-center justify-between">
            {(() => {
              const Icon = s.icon;
              return <Icon className="h-5 w-5" aria-hidden="true" focusable="false" />;
            })()}
            <span className="text-2xl font-black tabular-nums" style={{ color: s.color }}>
              {s.val}
            </span>
          </div>
          <p className="text-[0.72rem] font-semibold text-[var(--sys-text-secondary)] group-hover:text-[var(--sys-text-primary)] transition-colors">
            {s.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// ─── SoftSkills ───────────────────────────────────────────────────────────────
const SoftSkills = () => (
  <div
    className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
    role="list"
    aria-label="Engineer-relevant soft skills"
  >
    {SOFT_SKILLS.map((s, i) => (
      <motion.div
        key={s.skill}
        role="listitem"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        transition={{ delay: i * 0.07 }}
        className="flex gap-3 p-3.5 rounded-xl border border-[var(--sys-border)]/60
                    bg-[var(--sys-bg-tertiary)]/30 hover:border-[var(--sys-accent)]/25
                    hover:bg-[var(--sys-bg-tertiary)]/60 transition-all duration-200 cursor-default"
      >
        {(() => {
          const Icon = s.icon;
          return (
            <Icon
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sys-accent)]"
              aria-hidden="true"
              focusable="false"
            />
          );
        })()}
        <div>
          <p className="text-[0.78rem] font-bold text-[var(--sys-text-primary)] mb-0.5">
            {s.skill}
          </p>
          <p className="text-[0.7rem] text-[var(--sys-text-secondary)] leading-relaxed">{s.desc}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

// ─── EngineeringPanel — right 40% intelligence panels ────────────────────────
const EngineeringPanel = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'toolchain' | 'thinking'>('matrix');

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'matrix', label: 'Capability Matrix' },
    { id: 'toolchain', label: 'Toolchain' },
    { id: 'thinking', label: 'Project Thinking' },
  ];

  return (
    <div className="flex flex-col gap-7">
      <header>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-[0.72rem] font-black uppercase tracking-[0.22em] text-[var(--sys-accent)] mb-2"
        >
          Engineering Profile
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.06 }}
          className="text-[clamp(1.7rem,2.8vw,2.6rem)] font-black leading-[1.08] tracking-[-0.03em]
                        text-[var(--sys-text-primary)] mb-3"
        >
          About Me —{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-light)]">
            Built for Systems Thinking.
          </span>
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="text-[0.875rem] text-[var(--sys-text-secondary)] leading-relaxed"
        >
          Designing, simulating, and deploying intelligent systems across embedded, electrical, and
          software domains.
        </motion.p>
      </header>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="space-y-3"
      >
        {[
          'Final-year B.E. EEE student at Kongu Engineering College, specialising in embedded systems firmware, industrial automation, AI-driven computer vision, and full-stack web platforms — simultaneously.',
          "I don't treat hardware and software as separate disciplines. I treat them as two layers of the same system. My projects consistently bridge the PCB to the cloud: ESP32 at the edge, React 19 on the dashboard, YOLOv8 making decisions in between.",
          "Every project I've built has been presented at a technical event, validated in production, or recognised at an ideathon. I build for outcome, not just completion.",
        ].map((para, i) => (
          <motion.p
            key={i}
            variants={fadeUp}
            transition={{ delay: i * 0.08 }}
            className="text-[0.875rem] text-[var(--sys-text-secondary)] leading-[1.8]
                            border-l-2 border-[var(--sys-accent)]/30 pl-3.5"
          >
            {para}
          </motion.p>
        ))}
      </motion.div>

      <div>
        <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[var(--sys-text-secondary)] mb-3 opacity-60">
          Experience Signals
        </p>
        <ExperienceSignals />
      </div>

      <EngineeringPhilosophy />

      <div>
        <div
          role="tablist"
          aria-label="Technical detail panels"
          className="flex gap-0 mb-5 rounded-xl overflow-hidden border border-[var(--sys-border)]/60 bg-[var(--sys-bg-tertiary)]/40"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex-1 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 focus-visible:ring-inset',
                activeTab === tab.id
                  ? 'bg-[var(--sys-accent)] text-white'
                  : 'text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'matrix' && <CapabilityMatrix />}
          {activeTab === 'toolchain' && (
            <div>
              <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[var(--sys-text-secondary)] mb-4 opacity-60">
                Toolchain Ecosystem
              </p>
              <ToolchainEcosystem />
            </div>
          )}
          {activeTab === 'thinking' && <ProjectThinkingSnapshot />}
        </div>
      </div>

      <div>
        <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[var(--sys-text-secondary)] mb-3 opacity-60">
          Engineer-Relevant Strengths
        </p>
        <SoftSkills />
      </div>
    </div>
  );
};

// ─── AboutIntelligenceSection — the premium split layout ─────────────────
const AboutIntelligenceSection = () => (
  <section
    id="about"
    className="relative overflow-hidden py-24 lg:py-32 bg-[var(--sys-bg-secondary)] border-t border-[var(--sys-border)]/60"
    aria-label="About Mekesh Kumar — Engineering profile"
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-[-120px] top-0 h-[500px] w-[350px] rounded-full blur-[120px] opacity-[0.08]"
      style={{ background: 'radial-gradient(circle, var(--sys-accent), transparent 70%)' }}
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-80px] bottom-0 h-[400px] w-[280px] rounded-full blur-[100px] opacity-[0.06]"
      style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
    />

    <div className="relative z-10 mx-auto max-w-[90rem] px-6 lg:px-14">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 xl:gap-20 items-start">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeIn}
          className="order-1 lg:order-1"
        >
          <IdentityStage />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="order-2 lg:order-2 pt-10 lg:pt-6"
        >
          <EngineeringPanel />
        </motion.div>
      </div>
    </div>
  </section>
);

// ─── Section: Hero ────────────────────────────────────────────────────────────
const HeroSection = () => {
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();
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
      if (shouldReduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      rawMouseX.set(e.clientX - (rect.left + rect.width / 2));
      rawMouseY.set(e.clientY - (rect.top + rect.height / 2));
    },
    [shouldReduceMotion, rawMouseX, rawMouseY],
  );

  return (
    <section
      className="relative pt-24 pb-0 overflow-hidden bg-[var(--sys-bg-primary)] min-h-screen"
      aria-label="About hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        rawMouseX.set(0);
        rawMouseY.set(0);
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 z-0">
        {isMobile ? <MobileHeroFallback /> : <HeroScene />}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.032]"
          style={{
            backgroundImage:
              'linear-gradient(var(--sys-accent) 1px, transparent 1px), linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{
            x: glowX,
            y: glowY,
            background: 'radial-gradient(circle, rgba(255,107,44,0.16), transparent 70%)',
          }}
        />
      </div>
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-[var(--sys-bg-primary)]/20 via-[var(--sys-bg-primary)]/55 to-[var(--sys-bg-primary)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pt-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] text-[var(--sys-accent)] mb-8 bg-[var(--sys-accent)]/10 border border-[var(--sys-accent)]/25"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sys-accent)] opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-[var(--sys-accent)]" />
          </span>
          Final Year EEE Undergraduate · Kongu Engineering College
        </motion.div>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="font-sans text-5xl md:text-7xl text-[var(--sys-text-primary)] mb-6 leading-[1.05] tracking-[-0.03em] font-extrabold"
        >
          Bridging the Gap Between
          <br className="hidden md:block" />
          <em className="not-italic bg-clip-text text-transparent bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-light)]">
            Hardware &amp; Software
          </em>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="text-[var(--sys-text-secondary)] text-lg leading-relaxed mb-5 max-w-xl mx-auto"
        >
          I'm <strong className="text-[var(--sys-text-primary)]">Mekesh Kumar</strong>, an aspiring
          Graduate Engineering Trainee specialising in Embedded Systems, Industrial Automation, IoT,
          and Full-Stack Development.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
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
              <span className="text-xs text-[var(--sys-text-secondary)] font-semibold">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href="#about"
            className="flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-semibold transition-all hover:shadow-[0_0_26px_var(--sys-accent)] hover:-translate-y-0.5 bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-dark)]"
          >
            About Me
            <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
              <FaArrowDown className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
            </span>
          </a>
          <a
            href="#projects"
            className="flex items-center gap-2 px-8 py-4 rounded-full text-[var(--sys-text-primary)] font-semibold border border-[var(--sys-border)] hover:border-[var(--sys-accent)] hover:text-[var(--sys-accent)] hover:bg-[var(--sys-bg-secondary)] transition-all"
          >
            View Projects
            <FaArrowRight className="h-4 w-4" aria-hidden="true" focusable="false" />
          </a>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ delay: 0.5 }}
        className="flex gap-5 justify-center items-end pt-16 overflow-hidden relative z-10"
        style={shouldReduceMotion ? {} : { x: imgParallaxX, y: imgParallaxY }}
      >
        <motion.div
          animate={shouldReduceMotion ? {} : slowFloatAnimation}
          className="relative z-0 hidden md:block"
        >
          <img
            src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80"
            alt="Hardware engineering"
            className="w-48 lg:w-56 h-72 lg:h-80 rounded-3xl object-cover shadow-2xl -ml-6 border border-[var(--sys-border)] opacity-80 hover:opacity-100 transition-opacity"
          />
          <div className="absolute -top-4 -right-4 bg-[var(--sys-bg-tertiary)]/80 backdrop-blur-md border border-[var(--sys-border)] rounded-2xl px-4 py-3 shadow-lg">
            <p className="text-[10px] text-[var(--sys-text-secondary)] font-semibold uppercase tracking-wider">
              CGPA
            </p>
            <p className="text-sm font-bold text-[var(--sys-accent)] tabular-nums">7.71</p>
          </div>
        </motion.div>
        <div className="relative z-10">
          <img
            src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80"
            alt="Software development"
            className="w-[90vw] md:w-[480px] lg:w-[560px] h-[300px] md:h-[360px] lg:h-[400px] rounded-3xl object-cover shadow-2xl border border-[var(--sys-border)]"
          />
          <button
            className="absolute -top-5 -right-5 w-14 h-14 bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-full shadow-xl flex items-center justify-center group transition-transform hover:scale-110"
            aria-label="Watch demo"
          >
            <span className="absolute inset-0 rounded-full bg-[var(--sys-accent)]/20 animate-ping opacity-75" />
            <FaPlay
              className="relative z-10 h-4 w-4 translate-x-0.5 text-[var(--sys-accent)]"
              aria-hidden="true"
              focusable="false"
            />
          </button>
          <div className="absolute -bottom-6 -left-4 md:-left-6 bg-[var(--sys-bg-secondary)]/80 backdrop-blur-xl border border-[var(--sys-border)] rounded-2xl p-4 shadow-xl min-w-[200px]">
            <p className="text-[10px] text-[var(--sys-text-secondary)] font-semibold uppercase tracking-wider mb-2">
              Current Status
            </p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[var(--sys-accent)]/20 flex items-center justify-center text-[var(--sys-accent)] font-bold text-xs">
                MK
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--sys-text-primary)]">Mekesh Kumar</p>
                <p className="text-[10px] text-[var(--sys-text-secondary)]">Available for Hire</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--sys-success)] bg-[var(--sys-success)]/10 px-2.5 py-1.5 rounded-lg border border-[var(--sys-success)]/20">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Seeking GET Roles
            </div>
          </div>
        </div>
        <motion.div
          animate={shouldReduceMotion ? {} : floatAnimation}
          className="relative z-0 hidden lg:block"
        >
          <img
            src="https://images.unsplash.com/photo-1580983546522-383796850c95?auto=format&fit=crop&q=80"
            alt="PCB circuit design"
            className="w-56 h-80 rounded-3xl object-cover shadow-2xl -mr-6 border border-[var(--sys-border)] opacity-80 hover:opacity-100 transition-opacity"
          />
          <div className="absolute -top-4 -left-4 bg-[var(--sys-bg-tertiary)]/80 backdrop-blur-md border border-[var(--sys-border)] rounded-2xl px-4 py-3 shadow-lg">
            <p className="text-[10px] text-[var(--sys-text-secondary)] font-semibold uppercase tracking-wider mb-1.5">
              Tech Stack
            </p>
            <div className="flex gap-1 flex-wrap max-w-[130px]">
              {['ESP32', 'R3F', 'React', 'YOLOv8'].map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--sys-accent)]/15 text-[var(--sys-accent)] border border-[var(--sys-accent)]/20"
                >
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

// ─── Preserved sections (Timeline, Expertise, CoreValues, Achievements, Projects, Languages, CTA) ──
const TimelineSection = () => (
  <section
    className="py-28 relative overflow-hidden bg-[var(--sys-bg-primary)]"
    aria-label="Education and training timeline"
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-[-80px] top-[60px] h-[400px] w-[260px] rounded-full blur-[90px] opacity-[0.1]"
      style={{ background: 'radial-gradient(circle, var(--sys-accent), transparent 70%)' }}
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-60px] bottom-[40px] h-[300px] w-[200px] rounded-full blur-[70px] opacity-[0.08]"
      style={{ background: 'radial-gradient(circle, var(--sys-info), transparent 70%)' }}
    />
    <div className="relative z-10 mx-auto max-w-5xl px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center mb-14"
      >
        <motion.span
          variants={fadeUp}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block"
        >
          Journey
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]"
        >
          Education &amp; <span className="text-[var(--sys-accent)]">Training</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-[var(--sys-text-secondary)] max-w-lg mx-auto text-sm leading-relaxed"
        >
          From classroom fundamentals to real-world industrial exposure — a path built on curiosity,
          precision, and hands-on engineering.
        </motion.p>
      </motion.div>
      <div className="relative">
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--sys-accent) 10%, var(--sys-accent) 90%, transparent)',
          }}
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
                <div className="flex-1">
                  <motion.div
                    whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(255,107,44,0.14)' }}
                    transition={{ duration: 0.25 }}
                    className="group bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-2xl p-5 hover:border-[var(--sys-accent)]/40 transition-colors relative overflow-hidden"
                  >
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
                        <h3 className="text-sm font-bold text-[var(--sys-text-primary)] leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-[var(--sys-text-secondary)] mt-0.5">
                          {item.sub}
                        </p>
                      </div>
                      {(() => {
                        const Icon = item.icon;
                        return (
                          <Icon
                            className="h-6 w-6 ml-3 shrink-0 text-[var(--sys-text-primary)]"
                            aria-hidden="true"
                            focusable="false"
                          />
                        );
                      })()}
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
                <div
                  className="hidden md:flex shrink-0 w-5 h-5 rounded-full border-2 items-center justify-center z-10 shadow-[0_0_12px_rgba(255,107,44,0.4)]"
                  style={{
                    borderColor: TIMELINE_COLOR[item.type],
                    backgroundColor: 'var(--sys-bg-primary)',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: TIMELINE_COLOR[item.type] }}
                  />
                </div>
                <div className="flex-1 hidden md:block" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

const ExpertiseSection = () => (
  <section className="py-28 bg-[var(--sys-bg-primary)] relative overflow-hidden">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-100px] top-[40px] h-[380px] w-[280px] rounded-full blur-[90px] opacity-[0.1]"
      style={{ background: 'radial-gradient(circle, var(--sys-accent), transparent 70%)' }}
    />
    <div className="relative z-10 mx-auto max-w-[80rem] px-6 lg:px-12">
      <div className="grid lg:grid-cols-3 gap-8 mb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="flex flex-col justify-center pr-8"
        >
          <motion.span
            variants={fadeUp}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3"
          >
            My Arsenal
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-sans font-extrabold text-4xl text-[var(--sys-text-primary)] mb-5 leading-tight tracking-[-0.02em]"
          >
            Technical &amp; Engineering Expertise
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[var(--sys-text-secondary)] text-sm leading-relaxed mb-8"
          >
            I build end-to-end systems from the PCB schematic to the cloud dashboard. Embedded C,
            React, YOLOv8, and everything in between.
          </motion.p>
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
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {c.issuer} · {c.year}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-[var(--sys-accent)]/50 transition-all duration-300"
        >
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[var(--sys-accent)]/10 rounded-full group-hover:scale-110 transition-transform duration-500 blur-2xl" />
          <h3 className="text-lg font-bold text-[var(--sys-text-primary)] mb-2 relative z-10">
            Hands-on Industrial Training
          </h3>
          <p className="text-[var(--sys-text-secondary)] text-sm mb-6 leading-relaxed relative z-10">
            Practical exposure to manufacturing workflows at Hatsun Agro Products and Pavithran
            Aseptic — production lines, quality control, and industrial instrumentation.
          </p>
          <div className="bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] rounded-2xl p-4 shadow-sm relative z-10 mt-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[var(--sys-accent)] flex items-center justify-center text-white font-bold ring-2 ring-[var(--sys-accent)]/30 text-[10px]">
                  KEC
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--sys-success)] rounded-full border-2 border-[var(--sys-bg-tertiary)]" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--sys-text-secondary)] font-semibold uppercase tracking-wider">
                  Education
                </p>
                <p className="text-xs font-bold text-[var(--sys-text-primary)]">
                  Kongu Engineering College
                </p>
              </div>
            </div>
            <div className="rounded-xl p-3 text-white bg-gradient-to-br from-[var(--sys-accent)] to-[var(--sys-accent-dark)]">
              <p className="text-[10px] opacity-80 font-semibold uppercase tracking-wider mb-1">
                Graduating Year
              </p>
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold">B.E. EEE — CGPA 7.71</p>
                <p className="text-xs font-bold">2023 – Present</p>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-[2.5rem] p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--sys-text-secondary)] mb-3 block">
              Skill Metrics
            </span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            val: '11+',
            label: 'Technical Presentations at Events',
            num: '001',
            color: 'var(--sys-accent)',
          },
          { val: '8+', label: 'Engineering Projects Built', num: '002', color: 'var(--sys-info)' },
          {
            val: '2',
            label: 'Executive Memberships — ISTE & NSS',
            num: '003',
            color: 'var(--sys-success)',
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: i * 0.1 }}
            className="group flex items-center justify-between p-8 rounded-3xl bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] hover:border-[var(--sys-accent)]/50 hover:bg-[var(--sys-bg-tertiary)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-black text-[var(--sys-text-primary)] tabular-nums">
                  {s.val}
                </span>
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: s.color + '20', color: s.color }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-[var(--sys-text-secondary)] font-medium">{s.label}</p>
            </div>
            <span
              className="text-4xl font-black select-none"
              style={{ color: 'transparent', WebkitTextStroke: '1px var(--sys-border)' }}
            >
              {s.num}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

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
      <div className="mx-auto max-w-[80rem] px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block"
          >
            Areas of Interest
          </motion.span>
          <motion.h2
            variants={fadeUp}
            id="vision-heading"
            className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]"
          >
            Core Competencies
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[var(--sys-text-secondary)] max-w-xl mx-auto text-sm leading-relaxed"
          >
            Applying strong fundamentals across hardware design, firmware development, and
            intelligent software integration.
          </motion.p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VISION_ITEMS.map((item, i) => {
            const pos = mousePos[item.id];
            return (
              <motion.div
                key={item.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="group bg-[var(--sys-bg-primary)] p-8 rounded-3xl text-left border border-[var(--sys-border)] hover:border-[var(--sys-accent)] transition-all hover:-translate-y-1 cursor-crosshair relative overflow-hidden"
                onMouseMove={(e) => handleCardMouseMove(e, item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {hoveredId === item.id && pos && (
                  <div
                    className="absolute pointer-events-none rounded-full"
                    style={{
                      width: 130,
                      height: 130,
                      left: pos.x - 65,
                      top: pos.y - 65,
                      background: 'radial-gradient(circle, rgba(255,107,44,0.2), transparent 70%)',
                      filter: 'blur(10px)',
                    }}
                  />
                )}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="text-[10px] font-bold text-[var(--sys-text-secondary)] font-mono">
                    {item.id}
                  </span>
                  <div className="w-9 h-9 bg-[var(--sys-bg-secondary)] group-hover:bg-[var(--sys-accent)]/10 rounded-xl flex items-center justify-center text-[var(--sys-text-secondary)] group-hover:text-[var(--sys-accent)] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-2 text-[var(--sys-text-primary)] group-hover:text-[var(--sys-accent)] transition-colors relative z-10">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--sys-text-secondary)] leading-relaxed relative z-10">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const AchievementsSection = () => (
  <section
    className="py-28 bg-[var(--sys-bg-primary)] relative overflow-hidden"
    aria-label="Achievements and recognition"
  >
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full blur-[130px] opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, var(--sys-warning), transparent 70%)' }}
      />
    </div>
    <div className="relative z-10 mx-auto max-w-[80rem] px-6 lg:px-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.span
          variants={fadeUp}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block"
        >
          Recognition
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]"
        >
          Awards &amp; <span className="text-[var(--sys-accent)]">Achievements</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-[var(--sys-text-secondary)] max-w-lg mx-auto text-sm leading-relaxed"
        >
          Recognised at multiple inter-collegiate ideathons, hackathons, and technical exhibitions
          across Tamil Nadu.
        </motion.p>
      </motion.div>
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
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: a.color }}
            />
            <div
              className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-500"
              style={{ backgroundColor: a.color }}
            />
            <div className="flex items-start gap-5">
              <div
                className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border"
                style={{ backgroundColor: a.color + '18', borderColor: a.color + '35' }}
              >
                {(() => {
                  const Icon = a.icon;
                  return (
                    <Icon
                      className="h-7 w-7"
                      style={{ color: a.color }}
                      aria-hidden="true"
                      focusable="false"
                    />
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className="text-xs font-black uppercase tracking-wider"
                    style={{ color: a.color }}
                  >
                    {a.rank}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--sys-text-secondary)] bg-[var(--sys-bg-tertiary)] px-2 py-0.5 rounded-full">
                    {a.year}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--sys-text-primary)] mb-1 leading-snug">
                  {a.project}
                </h3>
                <p className="text-[11px] text-[var(--sys-text-secondary)] mb-0.5 font-semibold">
                  {a.event}
                </p>
                <p className="text-[10px] text-[var(--sys-text-secondary)] opacity-65">
                  {a.institution}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {[
          {
            org: 'ISTE',
            full: 'Indian Society for Technical Education',
            role: 'Executive Member (2024 – Present)',
            icon: FaBuildingColumns,
            desc: 'Organised technical events, workshops, and inter-departmental competitions at Kongu Engineering College.',
          },
          {
            org: 'NSS',
            full: 'National Service Scheme',
            role: 'Executive Member (2024 – Present)',
            icon: FaPeopleGroup,
            desc: 'Led community outreach, rural development, and social responsibility programmes.',
          },
        ].map((org) => (
          <motion.div
            key={org.org}
            variants={fadeUp}
            className="flex gap-4 p-6 rounded-2xl bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] hover:border-[var(--sys-accent)]/35 transition-all"
          >
            {(() => {
              const Icon = org.icon;
              return (
                <Icon
                  className="h-8 w-8 shrink-0 text-[var(--sys-accent)]"
                  aria-hidden="true"
                  focusable="false"
                />
              );
            })()}
            <div>
              <p className="text-xs font-black text-[var(--sys-accent)] uppercase tracking-wider mb-0.5">
                {org.org} · {org.role}
              </p>
              <p className="text-sm font-bold text-[var(--sys-text-primary)] mb-1">{org.full}</p>
              <p className="text-[11px] text-[var(--sys-text-secondary)] leading-relaxed">
                {org.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

const ProjectsSection = () => (
  <section
    id="projects"
    className="py-28 bg-[var(--sys-bg-secondary)] border-t border-[var(--sys-border)] relative overflow-hidden"
  >
    <div className="relative z-10 mx-auto max-w-[80rem] px-6 lg:px-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.span
          variants={fadeUp}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block"
        >
          My Work
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]"
        >
          Featured Projects
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-[var(--sys-text-secondary)] text-sm max-w-md mx-auto"
        >
          Presented at multiple technical events, ideathons, and hackathons including IEEE, ISTE,
          and Govt College of Technology.
        </motion.p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURED_PROJECTS.map((proj, i) => (
          <motion.article
            key={proj.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -8, rotateX: 3, rotateY: -3 }}
            style={{ transformPerspective: 900 }}
            className={`group relative rounded-[2.5rem] p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer ${proj.featured ? 'bg-[var(--sys-bg-primary)] border-2 border-[var(--sys-accent)] shadow-[0_0_24px_rgba(255,107,44,0.18)]' : 'bg-[var(--sys-bg-primary)] border border-[var(--sys-border)]'}`}
          >
            {proj.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <span className="px-4 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-dark)] shadow-lg">
                  <span className="inline-flex items-center gap-1.5">
                    <FaTrophy className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                    Award Winning
                  </span>
                </span>
              </div>
            )}
            <div className="aspect-[4/5] bg-[var(--sys-bg-tertiary)] rounded-3xl mb-5 overflow-hidden relative">
              <img
                src={proj.img}
                alt={proj.name}
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
              <h3 className="font-bold text-base text-[var(--sys-text-primary)] mb-1">
                {proj.name}
              </h3>
              <p className="text-[var(--sys-text-secondary)] text-[11px] mb-2 font-medium leading-snug">
                {proj.role}
              </p>
              <p className="flex items-start gap-1.5 text-[10px] font-bold text-[var(--sys-accent)]">
                {(() => {
                  const AwardIcon = proj.awardIcon;
                  return (
                    <AwardIcon
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                      focusable="false"
                    />
                  );
                })()}
                <span>{proj.award}</span>
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

const LanguagesSection = () => (
  <section
    className="py-28 bg-[var(--sys-bg-primary)] relative overflow-hidden"
    aria-label="Languages"
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-80px] top-[50px] h-[350px] w-[250px] rounded-full blur-[80px] opacity-[0.08]"
      style={{ background: 'radial-gradient(circle, var(--sys-accent), transparent 70%)' }}
    />
    <div className="relative z-10 mx-auto max-w-5xl px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center mb-14"
      >
        <motion.span
          variants={fadeUp}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sys-accent)] mb-3 block"
        >
          Communication
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-4 tracking-[-0.02em]"
        >
          Languages
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-[var(--sys-text-secondary)] max-w-md mx-auto text-sm leading-relaxed"
        >
          Multilingual proficiency for effective collaboration across diverse teams and
          environments.
        </motion.p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {LANGUAGES.map((lang, i) => (
          <motion.div
            key={lang.lang}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(255,107,44,0.14)' }}
            className="group bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-3xl p-7 text-center hover:border-[var(--sys-accent)]/40 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[var(--sys-accent)]/10 rounded-full group-hover:scale-110 transition-transform duration-500 blur-2xl" />
            <div className="relative z-10">
              <span className="text-4xl mb-4 flex justify-center text-[var(--sys-accent)]">
                {(() => {
                  const Icon = lang.icon;
                  return <Icon aria-hidden="true" focusable="false" />;
                })()}
              </span>
              <h3 className="text-lg font-bold text-[var(--sys-text-primary)] mb-1">{lang.lang}</h3>
              <p className="text-xs font-semibold text-[var(--sys-accent)] uppercase tracking-wider mb-4">
                {lang.level}
              </p>
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
      onMouseLeave={() => {
        rawMouseX.set(0);
        rawMouseY.set(0);
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage:
            'linear-gradient(var(--sys-accent) 1px, transparent 1px), linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
        style={{
          x: glowX,
          y: glowY,
          background: 'radial-gradient(circle, rgba(255,107,44,0.16), transparent 70%)',
        }}
      />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
        className="mx-auto max-w-[80rem] px-6 lg:px-12"
      >
        <div className="rounded-[2.5rem] overflow-hidden relative bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] shadow-2xl">
          <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-[var(--sys-accent)] to-transparent" />
          <motion.div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-[var(--sys-accent)]/12"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute top-8 right-8 w-32 h-32 rounded-full border-2 border-dashed border-[var(--sys-border)]"
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative z-10 py-20 px-8 md:px-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] px-3 py-1 rounded-full text-[11px] font-semibold text-[var(--sys-text-primary)] mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sys-success)] opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-[var(--sys-success)]" />
                </span>
                Actively Seeking GET Roles
              </div>
              <h2 className="font-sans font-extrabold text-4xl md:text-5xl text-[var(--sys-text-primary)] mb-6 leading-tight tracking-[-0.03em]">
                Let's build the
                <br />
                future of
                <br />
                <em className="not-italic text-[var(--sys-accent)]">automation.</em>
              </h2>
              <p className="text-[var(--sys-text-secondary)] text-sm leading-relaxed max-w-md mb-8">
                Reach out to discuss GET opportunities in embedded systems, industrial IoT, or
                full-stack engineering. I respond within 24 hours.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  {
                    href: 'mailto:mekesh.engineer@gmail.com',
                    label: 'mekesh.engineer@gmail.com',
                    icon: FaEnvelope,
                  },
                  {
                    href: 'https://linkedin.com/in/mekeshkumar',
                    label: 'linkedin.com/in/mekeshkumar',
                    icon: FaLinkedin,
                  },
                  {
                    href: 'https://github.com/Mekesh-Engineer',
                    label: 'github.com/Mekesh-Engineer',
                    icon: FaGithub,
                  },
                ].map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] text-[var(--sys-text-secondary)] hover:text-[var(--sys-accent)] hover:border-[var(--sys-accent)]/50 transition-all text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60"
                  >
                    <Icon
                      className="h-3.5 w-3.5 shrink-0 text-[var(--sys-accent)]"
                      aria-hidden="true"
                      focusable="false"
                    />
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex-1 max-w-md w-full">
              <div className="bg-[var(--sys-bg-primary)] border border-[var(--sys-border)] rounded-[2rem] p-8 shadow-2xl">
                <h3 className="font-bold text-[var(--sys-text-primary)] text-lg mb-5">
                  Send a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="cta-name"
                      className="block text-xs font-semibold text-[var(--sys-text-secondary)] mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="cta-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[var(--sys-bg-secondary)] border border-[var(--sys-border)] rounded-xl px-4 py-3 text-sm text-[var(--sys-text-primary)] placeholder:text-[var(--sys-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--sys-accent)]/30 focus:border-[var(--sys-accent)] transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cta-email"
                      className="block text-xs font-semibold text-[var(--sys-text-secondary)] mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="cta-email"
                      type="email"
                      value={email}
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
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-dark)] disabled:opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60"
                  >
                    {status === 'sending'
                      ? 'Sending…'
                      : status === 'sent'
                        ? '✓ Message Sent!'
                        : 'Get in Touch →'}
                  </motion.button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
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
        <meta
          property="og:description"
          content="Bridging the gap between hardware & software. View projects, achievements, and career timeline."
        />
        <meta property="og:type" content="profile" />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-[var(--sys-bg-primary)] font-sans text-[var(--sys-text-primary)] selection:bg-[var(--sys-accent)] selection:text-white overflow-x-hidden">
        <main id="main-content">
          {/* 1. Cinematic hero */}
          <HeroSection />

          {/* 2. NEW: About Intelligence — split layout engineering dossier */}
          <AboutIntelligenceSection />

          {/* 3. Education & training timeline */}
          <TimelineSection />

          {/* 4. Technical expertise + certifications + skill bars */}
          <ExpertiseSection />

          {/* 5. Core competencies (8 spotlight cards) */}
          <CoreValuesSection />

          {/* 6. Awards & achievements + leadership */}
          <AchievementsSection />

          {/* 7. Featured projects grid */}
          <ProjectsSection />

          {/* 8. Languages */}
          <LanguagesSection />

          {/* 9. CTA / Contact */}
          <CtaSection />
        </main>
      </div>

      <Footer />
    </>
  );
}
