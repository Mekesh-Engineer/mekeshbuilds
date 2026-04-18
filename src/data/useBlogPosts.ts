import type { BlogCardItem } from '@/components/common/SkillCard';

export type BlogPostItem = BlogCardItem;

export const BLOG_POSTS: BlogPostItem[] = [
  {
    id: 'blog-1',
    title: 'Designing SCADA-Like Dashboards for Real-Time Monitoring',
    category: 'Industrial Automation',
    author: 'Mekesh Kumar',
    date: '10 Nov, 2025',
    readTime: '6 min read',
    tags: ['SCADA', 'UDP', 'Telemetry'],
    featured: true,
    achievementBadge: 'Applied in V2X platform',
    summary:
      'How I structured low-latency status panels, event streams, and dynamic IP resolution across fleet networks for engineering operators.',
    image:
      'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'blog-2',
    title: 'ESP32-CAM to AI Pipeline: From Frame Capture to Inference',
    category: 'Embedded + AI',
    author: 'Mekesh Kumar',
    date: '09 Oct, 2025',
    readTime: '7 min read',
    tags: ['ESP32-CAM', 'YOLOv8', 'OpenCV'],
    featured: true,
    achievementBadge: 'Inspection system case study',
    summary:
      'A practical breakdown of multi-threaded video streaming architecture, latency bottlenecks, and C++ integration in edge AI inspection systems.',
    image:
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'blog-3',
    title: 'Building Role-Aware Full-Stack Engineering Portals',
    category: 'Full-Stack Engineering',
    author: 'Mekesh Kumar',
    date: '13 Aug, 2025',
    readTime: '5 min read',
    tags: ['React 19', 'Firebase', 'RBAC'],
    featured: false,
    summary:
      'Lessons from implementing protected route guards, Zod schema-validated forms, and modular Zustand content managers in a production-style app.',
    image:
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'blog-4',
    title: 'Fuzzy Logic in Hybrid Energy Management',
    category: 'Energy Systems',
    author: 'Mekesh Kumar',
    date: '27 Jul, 2025',
    readTime: '8 min read',
    tags: ['Proteus', 'Embedded C', 'Smart Grid'],
    featured: true,
    achievementBadge: 'Power Electronics',
    summary:
      'Designing an intelligent controller that dynamically routes power between grid and renewable sources using ACS712 sensors and multi-parameter inputs.',
    image:
      'https://images.pexels.com/photos/3782226/pexels-photo-3782226.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'blog-5',
    title: 'Cryptographic QR Ticket Validation at the Edge',
    category: 'IoT Systems',
    author: 'Mekesh Kumar',
    date: '15 Jun, 2025',
    readTime: '6 min read',
    tags: ['Edge', 'Cloud Functions', 'Security'],
    featured: false,
    achievementBadge: '1st Prize — Tamizhanskills',
    summary:
      'Engineering a high-speed, serverless venue management platform utilizing decentralized ESP32 edge computing and Firestore synchronization.',
    image:
      'https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'blog-6',
    title: 'GPS Geofencing for Smart City Speed Regulation',
    category: 'Smart City',
    author: 'Mekesh Kumar',
    date: '02 May, 2025',
    readTime: '5 min read',
    tags: ['NEO-6M GPS', 'L298N', 'Haversine'],
    featured: false,
    summary:
      'Applying the Haversine distance formula on embedded hardware to dynamically regulate vehicle speed and restrict horn usage inside sensitive zones.',
    image:
      'https://images.pexels.com/photos/163100/pexels-photo-163100.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];