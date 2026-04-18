export interface ProjectItem {
  id: number;
  title: string;
  fullName: string;
  category: string;
  image: string;
  description: string;
  techStack: string[];
  achievements: string[];
  screenshots: string[];
}

export const PROJECT_LIST: ProjectItem[] = [
  {
    id: 1,
    title: 'RodInspect AI',
    fullName: 'Automated Rod and Pipe Inspection System',
    category: 'Industrial Automation',
    image:
      'https://images.unsplash.com/photo-1581092162384-8987c1d64718?q=80&w=1200&auto=format&fit=crop',
    description:
      'Machine-vision quality inspection platform replacing manual checks with AI-assisted, real-time dimensional and defect validation for manufacturing workflows.',
    techStack: ['Python', 'OpenCV', 'YOLOv8', 'Flask', 'ESP32-CAM', 'C++'],
    achievements: [
      'Built low-latency ESP32-CAM frame pipeline over Wi-Fi.',
      'Designed SCADA-like dashboard for FPS, latency, and live defect logs.',
      'Improved inspection repeatability through AI-assisted classification.',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?q=80&w=1400&auto=format&fit=crop',
    ],
  },
  {
    id: 2,
    title: 'FleetSync V2X',
    fullName: 'V2X Communication and Fleet Monitoring System',
    category: 'IoT Systems',
    image:
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?q=80&w=1200&auto=format&fit=crop',
    description:
      'Real-time telemetry and control platform for multi-device fleet orchestration with low-latency communication, auto-discovery, and industrial-grade state handling.',
    techStack: ['Python', 'Flask', 'WebSockets', 'SSE', 'UDP', 'ESP32', 'C++'],
    achievements: [
      'Presented at 5 technical events including Robofiesta 2K25 and Ideathon 2K24.',
      'Implemented UDP auto-discovery for zero-config edge onboarding.',
      'Built thread-safe command queueing for robust remote control delivery.',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1400&auto=format&fit=crop',
    ],
  },
  {
    id: 3,
    title: 'EventOps 360',
    fullName: 'Smart IoT-Based Event and Venue Management Platform',
    category: 'Full-Stack + AI + IoT',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    description:
      'A full-stack IoT platform combining cloud services, AI crowd analytics, and secure ticketing workflows for real-time venue operations and safety control.',
    techStack: ['React 19', 'TypeScript', 'Firebase', 'YOLOv8', 'ESP32-CAM', 'Python'],
    achievements: [
      'Won 1st Prize at Tamizhanskills Ideathon 2026.',
      'Implemented role-based access and atomic ticket inventory synchronization.',
      'Delivered real-time operational dashboard with live crowd and device health views.',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=1400&auto=format&fit=crop',
    ],
  },
  {
    id: 4,
    title: 'MekeshBuilds',
    fullName: 'Full-Stack Portfolio and Resume Builder Web App',
    category: 'Web Engineering',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200&auto=format&fit=crop',
    description:
      'Production-style web app for building and publishing engineering portfolios with authenticated workflows, dynamic sections, analytics, and reusable design systems.',
    techStack: [
      'React 19',
      'TypeScript',
      'Vite',
      'Firebase',
      'Framer Motion',
      'Zod',
      'Zustand',
      'Vitest',
    ],
    achievements: [
      'Built modular page architecture with reusable component layers and theme support.',
      'Added schema-validated forms and autosave-backed content editing pipelines.',
      'Integrated analytics and manager pages for recruiter-facing portfolio quality.',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop',
    ],
  },
  {
    id: 5,
    title: 'SmartSort IoT',
    fullName: 'IoT Automated Waste Segregation System',
    category: 'Embedded Systems',
    image:
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200&auto=format&fit=crop',
    description:
      'Autonomous embedded waste sorting system using multi-sensor fusion and cloud monitoring for classification logic, actuation reliability, and remote supervision.',
    techStack: [
      'C++',
      'ESP32',
      'Blynk IoT',
      'IR',
      'Inductive Sensor',
      'Capacitive Sensor',
      'Servo',
    ],
    achievements: [
      'Implemented sensor fusion pipeline for metal, plastic, and organic classification.',
      'Mapped sensor states to servo-based mechanical sorting logic.',
      'Published real-time system health and bin data over Wi-Fi via Blynk dashboard.',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092919535-7146ff1a5902?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=1400&auto=format&fit=crop',
    ],
  },
  {
    id: 6,
    title: 'FuzzyGrid EMS',
    fullName: 'Smart Hybrid Energy Management System using Fuzzy Logic',
    category: 'Energy Systems',
    image:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop',
    description:
      'An intelligent hybrid energy optimization system that dynamically manages load distribution between grid and renewable sources using fuzzy logic-based decision making.',
    techStack: [
      'Arduino Mega',
      'Fuzzy Logic (eFLL)',
      'Proteus',
      'Embedded C',
      'ACS712',
      'Power Electronics',
    ],
    achievements: [
      'Designed a multi-input Fuzzy Logic Controller for load and source decision optimization.',
      'Implemented real-time current and voltage monitoring for battery state estimation.',
      'Built relay-based dynamic source switching architecture and validated complete flow in Proteus.',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1400&auto=format&fit=crop',
    ],
  },
  {
    id: 7,
    title: 'GeoSafe Drive',
    fullName: 'GPS-Based Smart Vehicle Horn and Speed Regulation System',
    category: 'Intelligent Transportation',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop',
    description:
      'A geofence-aware smart vehicle platform that automatically controls speed and horn behavior in sensitive zones such as hospitals and educational campuses.',
    techStack: ['ESP32', 'GPS (NEO-6M)', 'L298N', 'Embedded C++', 'Wi-Fi', 'Web Server'],
    achievements: [
      'Implemented GPS geofencing using Haversine distance for real-time zone detection.',
      'Built adaptive PWM motor control to regulate speed in restricted areas.',
      'Integrated telemetry dashboard and state-based horn restriction logic for safety enforcement.',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1400&auto=format&fit=crop',
    ],
  },
  {
    id: 8,
    title: 'Cosmic Strikes',
    fullName: 'Cosmic Strikes - 3D Arcade Space Shooter',
    category: 'Interactive 3D Applications',
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    description:
      'A high-performance full-stack 3D arcade shooter combining real-time rendering, gameplay logic, and backend-driven leaderboard systems.',
    techStack: [
      'React',
      'TypeScript',
      'Three.js',
      'React Three Fiber',
      'Node.js',
      'Express',
      'MongoDB/SQLite',
    ],
    achievements: [
      'Engineered a WebGL-based rendering pipeline targeting smooth gameplay performance.',
      'Built backend APIs with authentication and leaderboard persistence.',
      'Implemented dynamic wave progression, difficulty scaling, and combo-based scoring systems.',
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1400&auto=format&fit=crop',
    ],
  },
];
