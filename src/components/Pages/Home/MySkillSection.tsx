import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    SiEspressif,
    SiOpencv,
    SiReact,
} from "react-icons/si";
import { MdBolt, MdPrecisionManufacturing, MdSensors } from "react-icons/md";
import SkillCard, { type SkillCardItem } from "@/components/Shared/SkillCard";

const DEFAULT_CARDS: SkillCardItem[] = [
    {
        id: "embedded",
        title: "Embedded Systems Development",
        category: "Hardware",
        description: "ESP32, ARM, real-time firmware, sensor interfacing.",
        icon: <SiEspressif className="h-5 w-5" />,
        image: "https://images.unsplash.com/photo-1555617162-e2e1a6c6dd9b?w=600&h=400&fit=crop",
    },
    {
        id: "automation",
        title: "Industrial Automation Systems",
        category: "Systems",
        description: "SCADA-like dashboards, control logic, monitoring systems.",
        icon: <MdPrecisionManufacturing className="h-5 w-5" />,
        image: "https://images.unsplash.com/photo-1581092918249-20a169e4e3e0?w=600&h=400&fit=crop",
    },
    {
        id: "cv-ai",
        title: "Computer Vision & AI Systems",
        category: "AI / ML",
        description: "YOLOv8, OpenCV, real-time inspection.",
        icon: <SiOpencv className="h-5 w-5" />,
        image: "https://images.unsplash.com/photo-1677442135109-5fba4e72d4d0?w=600&h=400&fit=crop",
    },
    {
        id: "fullstack",
        title: "Full-Stack Engineering",
        category: "Software",
        description: "React, Flask, WebSockets, Firebase.",
        icon: <SiReact className="h-5 w-5" />,
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    },
    {
        id: "iot",
        title: "IoT & Smart Systems",
        category: "Cloud",
        description: "Edge devices, cloud integration, telemetry.",
        icon: <MdSensors className="h-5 w-5" />,
        image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop",
    },
    {
        id: "electrical",
        title: "Electrical System Design",
        category: "Design",
        description: "Power electronics, circuit design, simulation tools.",
        icon: <MdBolt className="h-5 w-5" />,
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop",
    },
];

interface ServicesSectionProps {
    cards?: SkillCardItem[];
}

const EASE = [0.32, 0.72, 0, 1] as const;

const normalizeCards = (inputCards: SkillCardItem[]) => {
    if (inputCards.length === 0) return [];

    return Array.from({ length: 6 }, (_, index) => {
        const source = inputCards[index % inputCards.length]!;
        return {
            ...source,
            id: `${source.id}-${index}`,
        };
    });
};

const getCircularOffset = (index: number, activeIndex: number, total: number): number => {
    const delta = (index - activeIndex + total) % total;
    const normalized = delta > total / 2 ? delta - total : delta;

    if (normalized < -2 || normalized > 2) return 3;
    return normalized;
};

export default function MySkillSection({ cards = DEFAULT_CARDS }: ServicesSectionProps) {
    const sliderCards = useMemo(() => normalizeCards(cards), [cards]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (sliderCards.length < 2) return;

        const timer = window.setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % sliderCards.length);
        }, 3000);

        return () => window.clearInterval(timer);
    }, [sliderCards.length]);

    if (sliderCards.length === 0) {
        return null;
    }

    const getVariant = (slot: number) => {
        if (slot === 3) return { x: "-50%", scale: 0.5, rotate: 0, opacity: 0, zIndex: 1 };
        
        if (isMobile) {
            if (slot === 2 || slot === -2) {
                return { x: "-50%", scale: 0.65, rotate: 0, opacity: 0, zIndex: 1 };
            }
            if (slot === 1) return { x: "calc(-50% + 155px)", scale: 0.82, rotate: 6, opacity: 0.42, zIndex: 6 };
            if (slot === -1) return { x: "calc(-50% - 155px)", scale: 0.82, rotate: -6, opacity: 0.42, zIndex: 6 };
        }

        const variants: Record<number, any> = {
            0: { x: "-50%", scale: 1, rotate: 0, opacity: 1, zIndex: 7 },
            1: { x: "calc(-50% + 300px)", scale: 0.88, rotate: 8, opacity: 0.62, zIndex: 6 },
            2: { x: "calc(-50% + 590px)", scale: 0.74, rotate: 14, opacity: 0.2, zIndex: 5 },
            [-1]: { x: "calc(-50% - 300px)", scale: 0.88, rotate: -8, opacity: 0.62, zIndex: 6 },
            [-2]: { x: "calc(-50% - 590px)", scale: 0.74, rotate: -14, opacity: 0.2, zIndex: 5 },
        };
        return variants[slot] || { x: "-50%", scale: 0.5, rotate: 0, opacity: 0, zIndex: 1 };
    };

    return (
        <section className="relative overflow-hidden pt-[72px] pb-[64px] bg-sys-bg-primary" aria-label="My Services">
            
            <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
                aria-hidden="true"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 15%, var(--sys-accent) 0%, transparent 34%),
                        radial-gradient(circle at 80% 85%, var(--sys-accent) 0%, transparent 28%)
                    `
                }} 
            />
            
            <div className="pointer-events-none absolute left-[-110px] top-[18px] h-[360px] w-[250px] rounded-full blur-[12px]" 
                 aria-hidden="true"
                 style={{ background: 'radial-gradient(circle at 30% 40%, rgba(255, 107, 44, 0.32) 0%, transparent 72%)' }} />
            
            <div className="pointer-events-none absolute right-[-90px] bottom-[24px] h-[320px] w-[230px] rounded-full blur-[12px]" 
                 aria-hidden="true"
                 style={{ background: 'radial-gradient(circle at 70% 60%, rgba(245, 160, 90, 0.28) 0%, transparent 72%)' }} />

            <div className="relative z-10 mx-auto max-w-[80rem] px-6 lg:px-12 w-full">
                <motion.div
                    initial={{ opacity: 0, y: -18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="mb-5 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between"
                >
                    <div>
                        <motion.p
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="m-0 mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-sys-accent"
                        >
                            What I offer
                        </motion.p>

                        <h2 className="m-0 text-[clamp(2.1rem,3.8vw,3.45rem)] font-black leading-[1.05] tracking-[-0.02em] text-sys-text-primary">
                            Core <span className="text-sys-accent">Skills</span>
                        </h2>
                    </div>

                    <p className="m-0 max-w-[31rem] text-[0.94rem] leading-[1.75] text-sys-text-secondary md:text-right">
                        A 3D-immersive skill showcase blending embedded systems, automation, AI, and full-stack
                        engineering into one unified experience.
                    </p>
                </motion.div>

                <div 
                    className="relative mt-9 h-[550px] lg:h-[560px] w-full" 
                    role="region" 
                    aria-live="polite" 
                    aria-label="Services slider"
                >
                    {sliderCards.map((card, index) => {
                        const slot = getCircularOffset(index, activeIndex, sliderCards.length);
                        const isHidden = slot === 3;

                        return (
                            <motion.article
                                key={card.id}
                                className={`absolute left-1/2 top-0 w-[min(420px,88vw)] origin-center ${isHidden ? 'pointer-events-none' : ''}`}
                                aria-hidden={isHidden}
                                animate={getVariant(slot)}
                                transition={{ duration: 0.75, ease: EASE }}
                            >
                                <SkillCard item={card} isActive={slot === 0} />
                            </motion.article>
                        );
                    })}
                </div>

                <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Select service card">
                    {sliderCards.map((card, index) => {
                        const isActive = activeIndex === index;
                        return (
                            <button
                                key={card.id}
                                role="tab"
                                aria-selected={isActive}
                                aria-label={`Go to service card ${index + 1}`}
                                className={`h-[0.625rem] rounded-full border-none transition-all duration-250 ease-in-out ${isActive ? 'w-7 bg-sys-accent' : 'w-[0.625rem] bg-white/30'}`}
                                onClick={() => setActiveIndex(index)}
                                type="button"
                            />
                        )
                    })}
                </div>
            </div>
        </section>
    );
}