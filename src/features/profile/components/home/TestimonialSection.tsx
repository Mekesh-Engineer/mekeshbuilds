import { REVIEWS, ReviewData } from '@/data/useTestimonials';
import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
    motion,
    type MotionValue,
    type Variants,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";





const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
    },
};

const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    duration: number;
    delay: number;
    drift: number;
}

function makeParticles(n: number): Particle[] {
    return Array.from({ length: n }, (_, id) => ({
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.45 + 0.08,
        duration: Math.random() * 9 + 7,
        delay: Math.random() * 5,
        drift: (Math.random() - 0.5) * 46,
    }));
}

const ArrowRightIcon = ({ className = "", size = 18 }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const QuoteIcon = ({ className = "", size = 40 }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7.2 19c2.4 0 4.2-1.9 4.2-4.2 0-2.3-1.8-4.1-4.1-4.1-.3 0-.6 0-.8.1.4-1.9 1.8-3.3 3.9-3.8V4c-4.3.6-7.2 3.8-7.2 8.2C3.2 16.2 4.8 19 7.2 19Zm9.6 0c2.4 0 4.2-1.9 4.2-4.2 0-2.3-1.8-4.1-4.1-4.1-.3 0-.6 0-.8.1.4-1.9 1.8-3.3 3.9-3.8V4c-4.3.6-7.2 3.8-7.2 8.2 0 4 1.6 6.8 4 6.8Z" />
    </svg>
);

const CheckCircleIcon = ({ className = "", size = 14 }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12.5l2.4 2.4L16.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CameraIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 8h3l1.2-2h7.6L17 8h3v10H4V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const StarIcon = ({ active }: { active: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" className={active ? "text-[#f59e0b]" : "text-sys-text-secondary/60"} fill="currentColor" aria-hidden="true">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

const ReviewCard = ({
    data,
    rotateX,
    rotateY,
}: {
    data: ReviewData;
    rotateX: MotionValue<number>;
    rotateY: MotionValue<number>;
}) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            variants={fadeInUp}
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="group relative w-full min-w-[340px] max-w-[400px] flex-shrink-0 pt-3 pl-3 md:min-w-[400px]"
        >
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-4xl border border-sys-border bg-linear-to-br from-sys-bg-secondary to-sys-bg-primary opacity-50 transition-transform duration-300 ease-out group-hover:translate-x-4 group-hover:translate-y-4 group-hover:rotate-1" />

            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-4xl border border-sys-border bg-sys-bg-secondary p-6 shadow-xl shadow-black/20 transition-all duration-300">
                <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-sys-accent via-sys-accent-light to-sys-accent opacity-80" />

                <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between">
                        <QuoteIcon className="-translate-x-1 -translate-y-1 text-sys-accent/20" size={40} />
                        <div className="flex gap-1 rounded-full border border-sys-border bg-sys-bg-primary/70 px-3 py-1.5">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} active={i < data.rating} />
                            ))}
                        </div>
                    </div>

                    <div className="mb-6 flex-grow">
                        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-sys-text-primary transition-colors group-hover:text-sys-accent">
                            &ldquo;{data.title}&rdquo;
                        </h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-sys-text-secondary">
                            {data.description}
                        </p>
                    </div>

                    <div className="mt-auto space-y-5">
                        <div className="flex items-center gap-3 rounded-2xl border border-sys-border/70 bg-sys-bg-primary/40 p-3">
                            <div className="relative h-10 w-10 rounded-full bg-linear-to-br from-sys-accent to-sys-accent-light p-[2px] shadow-sm">
                                <div className="relative h-full w-full overflow-hidden rounded-full bg-sys-bg-secondary">
                                    <img src={data.avatar} alt={data.reviewerName} className="h-full w-full object-cover" />
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="truncate text-sm font-bold text-sys-text-primary">{data.reviewerName}</p>
                                    <CheckCircleIcon className="text-sys-success" size={14} />
                                </div>
                                <p className="truncate text-xs text-sys-text-secondary">{data.reviewerContext}</p>
                            </div>
                        </div>

                        <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-sys-border/70 transition-all group-hover:shadow-md">
                            <img
                                src={data.imageSrc}
                                alt={`Experience at ${data.reviewerContext}`}
                                className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                <span className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">
                                    Verified Visit
                                </span>
                                <CameraIcon className="text-white/80" size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function TestimonialsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-70px" });
    const particles = useMemo(() => makeParticles(26), []);

    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const mouseX = useSpring(rawMouseX, { stiffness: 110, damping: 20, mass: 0.9 });
    const mouseY = useSpring(rawMouseY, { stiffness: 110, damping: 20, mass: 0.9 });

    const cardRotateX = useTransform(mouseY, [-380, 380], [4, -4]);
    const cardRotateY = useTransform(mouseX, [-380, 380], [-4, 4]);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-(--sys-bg-primary) py-24"
            aria-label="Testimonials"
            onMouseMove={(e) => {
                const rect = sectionRef.current?.getBoundingClientRect();
                if (!rect) return;
                rawMouseX.set(e.clientX - (rect.left + rect.width / 2));
                rawMouseY.set(e.clientY - (rect.top + rect.height / 2));
            }}
            onMouseLeave={() => {
                rawMouseX.set(0);
                rawMouseY.set(0);
            }}
        >
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--sys-accent) 1px, transparent 1px), linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)",
                        backgroundSize: "58px 58px",
                    }}
                />
                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-sys-accent opacity-10 blur-[110px]" />
                <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-sys-accent-light opacity-10 blur-[110px]" />

                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: p.size,
                            height: p.size,
                            opacity: p.opacity,
                            background: "var(--sys-accent)",
                        }}
                        animate={{ y: [0, -30, 0], x: [0, p.drift, 0], opacity: [p.opacity, p.opacity * 1.8, p.opacity] }}
                        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>

            <div className="app-shell">

                <motion.div
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={fadeInUp}
                    className="mb-16 flex flex-col items-start text-left pt-8 md:pt-16"
                >
                    <div className="flex flex-col flex-wrap md:flex-row items-start md:items-baseline gap-4 md:gap-6 justify-start w-full">
                        {/* Eyebrow */}
                        <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sys-accent">
                            <span className="inline-block w-7 h-0.5 rounded-full bg-sys-accent" />
                            Recruiter validation
                        </span>

                        {/* Title */}
                        <h2 className="m-0 font-sans text-[clamp(1.8rem,4vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-sys-text-primary">
                            Teams trust me for <span className="text-sys-accent">delivery quality</span>
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between w-full items-start md:items-end gap-6 md:gap-0 mt-4">
                        <p className="m-0 max-w-xl text-[clamp(0.95rem,1.4vw,1.08rem)] leading-relaxed text-sys-text-secondary/84">
                            Feedback from collaborators focused on execution speed, architecture quality, and reliable communication under real project pressure.
                        </p>

                        <div className="flex items-center gap-3">
                            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sys-text-secondary backdrop-blur-md">
                                6 verified testimonials
                            </div>

                            <Link
                                to="/reviews"
                                className="group flex items-center gap-2 rounded-full border border-sys-border bg-sys-bg-secondary px-6 py-2 shadow-sm transition-all hover:border-sys-accent hover:text-sys-accent hover:shadow-md text-sm font-semibold"
                            >
                                <span>See All Reviews</span>
                                <ArrowRightIcon className="transition-transform group-hover:translate-x-1" size={16} />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-8 overflow-x-auto px-4 pb-12 pt-4 scroll-smooth sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                >
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="snap-center">
                            <ReviewCard data={review} rotateX={cardRotateX} rotateY={cardRotateY} />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}