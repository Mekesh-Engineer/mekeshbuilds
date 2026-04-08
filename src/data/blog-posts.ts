import type { BlogCardItem } from '@/components/Shared/SkillCard';

export type BlogPostItem = BlogCardItem;

export const BLOG_POSTS: BlogPostItem[] = [
  {
    id: 'blog-1',
    title: 'Designing SCADA-Like Dashboards for Real-Time Monitoring',
    category: 'Industrial Automation',
    author: 'Mekesh',
    date: '10 Nov, 2023',
    readTime: '6 min read',
    tags: ['SCADA', 'Flask', 'Telemetry'],
    featured: true,
    achievementBadge: 'Applied in V2X platform',
    summary:
      'How I structured low-latency status panels, event streams, and fault visibility patterns for engineering operators.',
    image:
      'https://images.unsplash.com/photo-1551281044-8b45c8c4f8ba?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'blog-2',
    title: 'ESP32-CAM to AI Pipeline: From Frame Capture to Inference',
    category: 'Embedded + AI',
    author: 'Mekesh',
    date: '09 Oct, 2023',
    readTime: '7 min read',
    tags: ['ESP32-CAM', 'YOLOv8', 'OpenCV'],
    featured: true,
    achievementBadge: 'Inspection system case study',
    summary:
      'A practical breakdown of streaming architecture, latency bottlenecks, and integration decisions in edge AI inspection systems.',
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'blog-3',
    title: 'Building Role-Aware Full-Stack Engineering Portals',
    category: 'Full-Stack Engineering',
    author: 'Mekesh',
    date: '13 Aug, 2023',
    readTime: '5 min read',
    tags: ['React', 'Firebase', 'RBAC'],
    featured: false,
    achievementBadge: 'Portfolio platform architecture',
    summary:
      'Lessons from implementing route guards, schema-validated forms, and modular content managers in a production-style app.',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'blog-4',
    title: 'IoT Telemetry Patterns for Reliable Device Fleets',
    category: 'IoT Systems',
    author: 'Mekesh',
    date: '27 Jul, 2023',
    readTime: '6 min read',
    tags: ['UDP Discovery', 'WebSockets', 'Edge Devices'],
    featured: false,
    achievementBadge: 'Presented at 5 technical events',
    summary:
      'Reliable command pipelines, discovery mechanisms, and state synchronization strategies for distributed embedded nodes.',
    image:
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?q=80&w=1000&auto=format&fit=crop',
  },
];
