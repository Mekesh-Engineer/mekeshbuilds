import type { IconType } from 'react-icons';
import { MdGroups, MdMilitaryTech, MdPrecisionManufacturing, MdRocketLaunch, MdSchool, MdVerified, MdWorkspacePremium } from 'react-icons/md';

export type EntryType = 'award' | 'certificate' | 'training' | 'education' | 'membership' | 'competition';

export interface TimelineEntry {
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

export const CATEGORY_ICONS: Record<EntryType, IconType> = {
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
export const TIMELINE: TimelineEntry[] = [
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
export const FILTERS = [
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
export const TYPE_DEFAULTS: Record<EntryType, { color: string; bg: string }> = {
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
export const STATS = [
  { value: 5, suffix: '+', label: 'Certifications' },
  { value: 3, suffix: '', label: 'Prize Awards' },
  { value: 10, suffix: '+', label: 'Competitions' },
  { value: 2, suffix: '', label: 'Industrial Visits' },
];
