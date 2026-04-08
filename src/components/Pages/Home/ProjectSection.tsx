import { useEffect, useMemo, useRef, useState } from 'react';
import {
    AnimatePresence,
    motion,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
} from 'framer-motion';
import { PROJECT_LIST, type ProjectItem } from '@/data/project-list';
import TiltHoverCard from '@/components/Shared/TiltHoverCard';

const EASE = [0.32, 0.72, 0, 1] as const;
const AUTO_SCROLL_MS = 5600;
const PROGRESS_RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

const ALL_CATEGORY = 'All Projects';

export default function ProjectSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
    const [selectedShot, setSelectedShot] = useState(0);

    const carouselRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.1 });

    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const smx = useSpring(mouseX, { damping: 30, stiffness: 150 });
    const smy = useSpring(mouseY, { damping: 30, stiffness: 150 });

    const tiltX = useTransform(smy, [0, 1], [4, -4]);
    const tiltY = useTransform(smx, [0, 1], [-4, 4]);

    const categories = useMemo(
        () => [ALL_CATEGORY, ...Array.from(new Set(PROJECT_LIST.map((project) => project.category)))],
        [],
    );

    const filteredProjects = useMemo(() => {
        if (activeCategory === ALL_CATEGORY) return PROJECT_LIST;
        return PROJECT_LIST.filter((project) => project.category === activeCategory);
    }, [activeCategory]);

    const activeProject = filteredProjects[activeIndex] ?? filteredProjects[0] ?? null;

    useEffect(() => {
        setActiveIndex(0);
        if (carouselRef.current) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }, [activeCategory]);

    useEffect(() => {
        if (!isAutoPlay || !inView || filteredProjects.length <= 1) return;

        const timer = window.setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % filteredProjects.length;
                if (carouselRef.current) {
                    const cardWidth = carouselRef.current.clientWidth / (window.innerWidth >= 768 ? 2.1 : 1);
                    carouselRef.current.scrollTo({ left: next * cardWidth, behavior: 'smooth' });
                }
                return next;
            });
        }, AUTO_SCROLL_MS);

        return () => window.clearInterval(timer);
    }, [filteredProjects.length, inView, isAutoPlay]);

    useEffect(() => {
        if (!selectedProject) {
            document.body.style.overflow = '';
            return;
        }
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedProject]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };

    const handleScroll = () => {
        if (!carouselRef.current) return;
        const scrollPosition = carouselRef.current.scrollLeft;
        const cardWidth = carouselRef.current.clientWidth / (window.innerWidth >= 768 ? 2 : 1);
        const newIndex = Math.round(scrollPosition / cardWidth);

        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < filteredProjects.length) {
            setActiveIndex(newIndex);
        }
    };

    const scrollTo = (index: number) => {
        if (!carouselRef.current) return;
        const cardWidth = carouselRef.current.clientWidth / (window.innerWidth >= 768 ? 2.1 : 1);
        carouselRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
        setActiveIndex(index);
    };

    const goNext = () => {
        if (filteredProjects.length === 0) return;
        const next = (activeIndex + 1) % filteredProjects.length;
        scrollTo(next);
    };

    const goPrev = () => {
        if (filteredProjects.length === 0) return;
        const prev = (activeIndex - 1 + filteredProjects.length) % filteredProjects.length;
        scrollTo(prev);
    };

    if (!activeProject) return null;

    return (
        <section
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                mouseX.set(0.5);
                mouseY.set(0.5);
            }}
            className="relative w-full overflow-hidden bg-(--sys-bg-primary) px-4 py-24 perspective-[1200px] sm:px-6 lg:px-12"
        >
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
                <motion.div
                    className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sys-accent)/10 blur-[120px]"
                    style={{
                        x: useTransform(smx, [0, 1], [-50, 50]),
                        y: useTransform(smy, [0, 1], [-50, 50]),
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
                >
                    <div className="max-w-3xl">
                        <span className="mb-4 inline-flex items-center gap-4 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-(--sys-accent)">
                            <span className="inline-block h-0.5 w-8 bg-(--sys-accent)" />
                            Featured work
                            <span className="inline-block h-0.5 w-8 bg-(--sys-accent)" />
                        </span>

                        <h2 className="m-0 whitespace-nowrap font-sans text-[clamp(1.5rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-(--sys-text-primary)">
                            Let&apos;s have a look at my <span className="text-(--sys-accent)">Projects.</span>
                        </h2>

                        <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-(--sys-text-secondary)">
                            Recruiter-friendly highlights with engineering outcomes, stack depth, and deployment-ready implementation detail.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(var(--sys-accent-rgb), 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            className="w-fit shrink-0 rounded-full border border-white/10 bg-linear-to-r from-(--sys-accent) to-[#ff8c52] px-8 py-3.5 text-[15px] font-bold text-white shadow-lg transition-all"
                            type="button"
                        >
                            See All
                        </motion.button>

                        <div className="flex items-center gap-2 rounded-full border border-(--sys-border) bg-white/5 px-2 py-1 backdrop-blur-md">
                            <button
                                className="flex h-9 w-9 items-center justify-center rounded-full text-(--sys-text-secondary) transition hover:bg-white/10 hover:text-(--sys-text-primary)"
                                onClick={goPrev}
                                aria-label="Previous project"
                                type="button"
                            >
                                <span className="material-icons-round text-[20px]">chevron_left</span>
                            </button>

                            <button
                                className="flex h-10 w-10 items-center justify-center"
                                onClick={() => setIsAutoPlay((prev) => !prev)}
                                aria-label={isAutoPlay ? 'Pause auto scroll' : 'Resume auto scroll'}
                                type="button"
                            >
                                <svg width="42" height="42" viewBox="0 0 52 52" className="overflow-visible">
                                    <circle
                                        cx="26"
                                        cy="26"
                                        r={PROGRESS_RADIUS}
                                        stroke="color-mix(in srgb, var(--sys-border) 70%, transparent)"
                                        strokeWidth="3"
                                        fill="transparent"
                                    />
                                    <motion.circle
                                        key={`${activeIndex}-${isAutoPlay}-${activeCategory}`}
                                        cx="26"
                                        cy="26"
                                        r={PROGRESS_RADIUS}
                                        stroke="var(--sys-accent)"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        strokeDasharray={CIRCUMFERENCE}
                                        strokeDashoffset={CIRCUMFERENCE}
                                        transform="rotate(-90 26 26)"
                                        animate={isAutoPlay ? { strokeDashoffset: 0 } : { strokeDashoffset: CIRCUMFERENCE }}
                                        transition={isAutoPlay ? { duration: AUTO_SCROLL_MS / 1000, ease: 'linear' } : { duration: 0.2 }}
                                    />
                                </svg>
                                <span className="absolute text-(--sys-text-primary)">
                                    <span className="material-icons-round text-[16px]">
                                        {isAutoPlay ? 'pause' : 'play_arrow'}
                                    </span>
                                </span>
                            </button>

                            <button
                                className="flex h-9 w-9 items-center justify-center rounded-full text-(--sys-text-secondary) transition hover:bg-white/10 hover:text-(--sys-text-primary)"
                                onClick={goNext}
                                aria-label="Next project"
                                type="button"
                            >
                                <span className="material-icons-round text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                    style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}
                    className="relative mb-8 w-full"
                >
                    <div
                        ref={carouselRef}
                        onScroll={handleScroll}
                        className="hide-scrollbar relative z-20 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-8 pt-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {filteredProjects.map((project, idx) => {
                            const isActive = activeIndex === idx;
                            return (
                                <motion.div
                                    key={project.id}
                                    className={`group min-w-[90vw] shrink-0 cursor-pointer snap-center transition-all duration-500 md:min-w-[48%] ${isActive ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-60 hover:opacity-100'
                                        }`}
                                    whileHover={{ y: -8 }}
                                >
                                    <TiltHoverCard
                                        tiltAmount={6}
                                        className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl transition-all group-hover:border-(--sys-accent)/40 dark:border-white/5 dark:bg-[rgba(255,255,255,0.02)]"
                                    >
                                        <div className="absolute left-0 top-0 h-[1px] w-full bg-linear-to-r from-transparent via-(--sys-accent)/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                        <div className="absolute inset-0 z-0 bg-(--sys-accent)/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                                        <div className="relative z-10 h-80 w-full overflow-hidden rounded-3xl md:h-100">
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                            />

                                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                                            <div className="absolute bottom-5 left-5 translate-y-2 opacity-80 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                                <div className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[14px] font-bold text-white shadow-lg backdrop-blur-md md:text-[15px]">
                                                    {project.title}
                                                </div>
                                            </div>

                                            <button
                                                className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-(--sys-accent) group-hover:bg-(--sys-accent) group-hover:shadow-[0_0_20px_rgba(var(--sys-accent-rgb),0.5)]"
                                                onClick={() => {
                                                    setSelectedShot(0);
                                                    setSelectedProject(project);
                                                }}
                                                aria-label={`Open details for ${project.fullName}`}
                                                type="button"
                                            >
                                                <span className="material-icons-round text-xl">arrow_forward</span>
                                            </button>
                                        </div>
                                    </TiltHoverCard>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.4 }}
                    className="mb-12 flex items-center justify-center gap-2.5"
                >
                    {filteredProjects.map((project, idx) => (
                        <button
                            key={project.id}
                            onClick={() => scrollTo(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`h-2.5 rounded-full transition-all duration-500 ${activeIndex === idx
                                ? 'w-8 bg-(--sys-accent) shadow-[0_0_8px_rgba(var(--sys-accent-rgb),0.6)]'
                                : 'w-2.5 bg-(--sys-border) hover:bg-(--sys-text-secondary)'
                                }`}
                            type="button"
                        />
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
                    className="relative z-20 mb-16 flex flex-wrap justify-center gap-3"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`rounded-full px-6 py-2.5 text-[14px] font-medium transition-all duration-300 backdrop-blur-sm ${activeCategory === category
                                ? 'bg-(--sys-text-primary) text-(--sys-bg-primary) shadow-lg'
                                : 'border border-(--sys-border) bg-white/5 text-(--sys-text-secondary) hover:border-(--sys-accent)/50 hover:bg-white/10 hover:text-(--sys-text-primary)'
                                }`}
                            type="button"
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="relative z-20 mx-auto flex max-w-3xl flex-col items-center text-center"
                >
                    <div className="mb-6 flex items-center justify-center gap-4">
                        <h3 className="text-2xl font-bold tracking-tight text-(--sys-text-primary) md:text-4xl">
                            {activeProject.fullName}
                        </h3>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 45, boxShadow: '0px 0px 15px rgba(var(--sys-accent-rgb), 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--sys-accent) text-white shadow-lg transition-all"
                            aria-label="View project case study"
                            onClick={() => {
                                setSelectedShot(0);
                                setSelectedProject(activeProject);
                            }}
                            type="button"
                        >
                            <span className="material-icons-round text-2xl">arrow_upward</span>
                        </motion.button>
                    </div>

                    <p className="mx-auto max-w-2xl text-[15px] leading-[1.8] text-(--sys-text-secondary) md:text-[16px]">
                        {activeProject.description}
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                        {activeProject.techStack.slice(0, 6).map((tech) => (
                            <span
                                key={tech}
                                className="rounded-full border border-(--sys-border) bg-white/5 px-3 py-1.5 text-[12px] font-semibold tracking-wide text-(--sys-text-secondary)"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedProject(null)}
                    >
                        <motion.div
                            className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-(--sys-bg-secondary) shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
                            initial={{ opacity: 0, y: 26, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-(--sys-border) px-5 py-4 md:px-7">
                                <div>
                                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-(--sys-accent)">
                                        {selectedProject.category}
                                    </p>
                                    <h4 className="mt-1 text-[22px] font-black tracking-tight text-(--sys-text-primary) md:text-[28px]">
                                        {selectedProject.fullName}
                                    </h4>
                                </div>
                                <button
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-(--sys-border) text-(--sys-text-secondary) transition hover:border-(--sys-accent) hover:text-(--sys-text-primary)"
                                    onClick={() => setSelectedProject(null)}
                                    aria-label="Close project details"
                                    type="button"
                                >
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>

                            <div className="grid max-h-[calc(88vh-84px)] grid-cols-1 overflow-y-auto lg:grid-cols-[1.25fr_1fr]">
                                <div className="border-b border-(--sys-border) p-5 lg:border-b-0 lg:border-r md:p-7">
                                    <div className="relative overflow-hidden rounded-2xl border border-white/10">
                                        <img
                                            src={selectedProject.screenshots[selectedShot] ?? selectedProject.image}
                                            alt={`${selectedProject.title} screenshot ${selectedShot + 1}`}
                                            className="h-[270px] w-full object-cover md:h-[360px]"
                                        />
                                    </div>

                                    <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                        {selectedProject.screenshots.map((shot, index) => (
                                            <button
                                                key={shot}
                                                onClick={() => setSelectedShot(index)}
                                                className={`relative h-20 min-w-[120px] overflow-hidden rounded-xl border transition ${selectedShot === index
                                                    ? 'border-(--sys-accent) shadow-[0_0_0_2px_color-mix(in_srgb,var(--sys-accent)_35%,transparent)]'
                                                    : 'border-(--sys-border)'
                                                    }`}
                                                aria-label={`View screenshot ${index + 1}`}
                                                type="button"
                                            >
                                                <img src={shot} alt={`${selectedProject.title} thumb ${index + 1}`} className="h-full w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 md:p-7">
                                    <p className="text-[15px] leading-[1.85] text-(--sys-text-secondary)">
                                        {selectedProject.description}
                                    </p>

                                    <div className="mt-6">
                                        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-(--sys-text-secondary)">
                                            Tech Stack
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProject.techStack.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="rounded-full border border-(--sys-border) bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-(--sys-text-primary)"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-7">
                                        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-(--sys-text-secondary)">
                                            Achievements
                                        </p>
                                        <ul className="space-y-2.5">
                                            {selectedProject.achievements.map((achievement) => (
                                                <li key={achievement} className="flex gap-2.5 text-[14px] leading-[1.7] text-(--sys-text-secondary)">
                                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-(--sys-accent)" />
                                                    <span>{achievement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
}
