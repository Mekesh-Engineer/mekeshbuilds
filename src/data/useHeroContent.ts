export type HeroTechBadgeIconKey =
    | 'react'
    | 'firebase'
    | 'esp32'
    | 'opencv'
    | 'yolov8'
    | 'flask'
    | 'supabase'
    | 'matlab'
    | 'github'
    | 'autocad';

export interface HeroTechBadge {
    label: string;
    icon: HeroTechBadgeIconKey;
    iconColor: string;
    positionClass: string;
    delay: number;
}

export interface HeroMetric {
    val: string;
    label: string;
}

export interface HeroData {
    sectionAriaLabelTemplate: string;
    greetingBadgeText: string;
    headingPrefix: string;
    fallbackFirstName: string;
    roleTags: string[];
    description: {
        intro: string;
        highlightedInstitution: string;
        middle: string;
        highlightedYear: string;
        outro: string;
    };
    testimonial: {
        socialProofCount: string;
        reviewTemplate: string;
    };
    experience: {
        yearsValue: string;
        title: string;
        ratingStars: number;
        metrics: HeroMetric[];
    };
    techBadges: HeroTechBadge[];
    availabilityNote: string;
    scrollIndicatorLabel: string;
    portraitAltRole: string;
    overlayAltRole: string;
}

export const HERO_DATA: HeroData = {
    sectionAriaLabelTemplate: 'Hero - {name} profile',
    greetingBadgeText: 'hi',
    headingPrefix: "I'm",
    fallbackFirstName: 'Mekesh Kumar',

    // Updated role tags based on resume
    roleTags: [
        'Graduate Engineer Trainee (GET)',
        'Embedded Systems Engineer',
        'IoT & Automation Engineer',
        'AI and ML Engineer',
        'Full-Stack Developer',
    ],

    description: {
        intro: 'Final year Electrical & Electronics Engineering student at',
        highlightedInstitution: 'Kongu Engineering College',
        middle: ', graduating in',
        highlightedYear: '2027',
        outro: '. Passionate about building intelligent embedded systems, industrial automation, and AI-powered solutions.',
    },

    testimonial: {
        socialProofCount: '+12',
        reviewTemplate: "{name}'s projects demonstrate strong technical skills and practical engineering approach.",
    },

    // Updated experience section - realistic for a final-year student
    experience: {
        yearsValue: 'Final Year',
        title: 'Student',
        ratingStars: 5,
        metrics: [
            { val: '8+', label: 'Projects' },
            { val: '5+', label: 'Presentations' },
            { val: '3', label: 'Competition Wins' },
        ],
    },

    // Updated tech badges - aligned with your actual skills from resume
    techBadges: [
        {
            label: 'React',
            icon: 'react',
            iconColor: '#61DAFB',
            positionClass: 'absolute -left-6 top-[18%]',
            delay: 0.9,
        },
        {
            label: 'Firebase',
            icon: 'firebase',
            iconColor: '#FFCA28',
            positionClass: 'absolute -right-4 top-[28%]',
            delay: 1.0,
        },
        {
            label: 'ESP32',
            icon: 'esp32',
            iconColor: '#E53935',
            positionClass: 'absolute left-[8%] top-[8%]',
            delay: 1.1,
        },
        {
            label: 'OpenCV',
            icon: 'opencv',
            iconColor: '#5C3EE8',
            positionClass: 'absolute right-[6%] top-[12%]',
            delay: 1.2,
        },
        {
            label: 'YOLOv8',
            icon: 'yolov8',
            iconColor: '#7C4DFF',
            positionClass: 'absolute left-[12%] top-[55%]',
            delay: 1.3,
        },
        {
            label: 'Flask',
            icon: 'flask',
            iconColor: '#111827',
            positionClass: 'absolute right-[10%] top-[58%]',
            delay: 1.4,
        },
        {
            label: 'Supabase',
            icon: 'supabase',
            iconColor: '#3ECF8E',
            positionClass: 'absolute left-[20%] top-[72%]',
            delay: 1.5,
        },
        {
            label: 'MATLAB',
            icon: 'matlab',
            iconColor: '#0066CC',
            positionClass: 'absolute right-[18%] top-[75%]',
            delay: 1.6,
        },
        {
            label: 'AutoCAD',
            icon: 'autocad',
            iconColor: '#FF6B00',
            positionClass: 'absolute left-[35%] top-[5%]',
            delay: 1.7,
        },
    ],

    availabilityNote: 'Open to Graduate Engineer Trainee (GET) roles & Internships',
    scrollIndicatorLabel: 'Scroll to explore',
    portraitAltRole: 'Mekesh Kumar - Final Year EEE Student',
    overlayAltRole: 'Profile Overlay',
};
