import type { IconType } from 'react-icons';
import { MdRocketLaunch, MdEmojiEvents, MdMilitaryTech, MdBuildCircle, MdMemory, MdCode, MdVisibility, MdWifi, MdBolt, MdWorkspacePremium, MdVerified } from 'react-icons/md';
const TOKEN = { accent: 'var(--sys-accent)', success: 'var(--sys-success)', warning: 'var(--sys-warning)', info: 'var(--sys-info)' };
// ─── Resume data ──────────────────────────────────────────────────────────────

export const HERO_STATS: Array<{
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

export const SKILL_DOMAINS: Array<{
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

export const ACHIEVEMENTS: Array<{
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

export const PROJECTS = [
    { name: 'Rod & Pipe Inspection', stack: 'YOLOv8 · OpenCV · ESP32-CAM', category: 'Vision' },
    { name: 'V2X Fleet Monitor', stack: 'Flask · WebSockets · ESP32', category: 'IoT' },
    { name: 'Smart Venue Platform', stack: 'React 19 · Firebase · YOLOv8', category: 'Full-Stack' },
    { name: 'Waste Segregation', stack: 'ESP32 · Blynk · Multi-Sensor', category: 'Embedded' },
    { name: 'Portfolio Builder', stack: 'React 19 · Vite · Zustand · Zod', category: 'Web' },
    { name: 'Hybrid Energy HEMS', stack: 'Arduino · Fuzzy Logic · Proteus', category: 'Power' },
    { name: 'GPS Horn Regulation', stack: 'ESP32 · GPS NEO-6M · PWM', category: 'Embedded' },
    { name: 'Cosmic Strikes 3D', stack: 'Three.js · R3F · Node.js', category: 'Full-Stack' },
];

export const CATEGORY_COLORS: Record<string, string> = {
    Vision: '#8b5cf6',
    IoT: '#f59e0b',
    'Full-Stack': '#3b82f6',
    Embedded: '#ff6b2c',
    Web: '#22c55e',
    Power: '#ef4444',
};
function buildHeatmap(): number[][] {
    const weeks: number[][] = [];
    const peaks = new Set([8, 9, 14, 15, 22, 23, 28, 29, 35, 36, 44, 45, 50, 51]);
    for (let w = 0; w < 52; w++) {
        const week = [];
        const isPeak = peaks.has(w);
        for (let d = 0; d < 7; d++) {
            let val = 0;
            if (isPeak) val = Math.random() > 0.3 ? Math.floor(Math.random() * 2) + 3 : 2;
            else val = Math.random() > 0.6 ? Math.floor(Math.random() * 3) : 0;
            week.push(val);
        }
        weeks.push(week);
    }
    return weeks;
}

export const HEATMAP = buildHeatmap();
export const HEATMAP_INTENSITY = [
    'bg-sys-bg-tertiary/30',
    'bg-sys-accent/20',
    'bg-sys-accent/45',
    'bg-sys-accent/75',
    'bg-sys-accent',
] as const;
