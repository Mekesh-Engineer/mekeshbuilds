import { useMemo, useRef, useState } from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";

const EASE = [0.32, 0.72, 0, 1] as const;
const BASE_LOCATION = {
    lat: 11.2734,
    lng: 77.6067,
    label: "Kongu Engineering College, Perundurai",
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
        size: Math.random() * 2.8 + 0.8,
        opacity: Math.random() * 0.4 + 0.08,
        duration: Math.random() * 9 + 7,
        delay: Math.random() * 5,
        drift: (Math.random() - 0.5) * 48,
    }));
}

const OrbitIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path d="M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13.2 7.3a5 5 0 1 0 3.5 8.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="17.5" cy="8" r="1.4" fill="currentColor" />
    </svg>
);

export default function MapSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-90px" });
    const particles = useMemo(() => makeParticles(24), []);

    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const mouseX = useSpring(rawMouseX, { stiffness: 110, damping: 20, mass: 0.9 });
    const mouseY = useSpring(rawMouseY, { stiffness: 110, damping: 20, mass: 0.9 });

    const mapRotateX = useTransform(mouseY, [-380, 380], [4, -4]);
    const mapRotateY = useTransform(mouseX, [-380, 380], [-6, 6]);
    const mapGlowX = useTransform(mouseX, [-380, 380], [-30, 30]);
    const mapGlowY = useTransform(mouseY, [-380, 380], [-20, 20]);

    const [mapCenter, setMapCenter] = useState(BASE_LOCATION);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState("");

    const mapEmbedSrc = useMemo(
        () => `https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=15&output=embed`,
        [mapCenter.lat, mapCenter.lng],
    );

    const openMapUrl = useMemo(
        () => `https://www.google.com/maps/search/?api=1&query=${mapCenter.lat},${mapCenter.lng}`,
        [mapCenter.lat, mapCenter.lng],
    );

    const directionsUrl = useMemo(
        () => `https://www.google.com/maps/dir/?api=1&destination=${BASE_LOCATION.lat},${BASE_LOCATION.lng}`,
        [],
    );

    const handleUseMyLocation = () => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setLocationError("Geolocation is not supported on this browser.");
            return;
        }

        setIsLocating(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setMapCenter({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    label: "Your live location",
                });
                setIsLocating(false);
            },
            () => {
                setLocationError("Unable to access your location. Please allow location permission.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 20000 },
        );
    };

    const resetToBaseLocation = () => {
        setMapCenter(BASE_LOCATION);
        setLocationError("");
    };

    return (
        <section
            id="location"
            ref={sectionRef}
            className="relative overflow-hidden bg-(--sys-bg-primary) py-24"
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
            aria-label="Location and collaboration section"
        >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--sys-accent) 1px, transparent 1px), linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)",
                        backgroundSize: "58px 58px",
                    }}
                />
                <motion.div
                    className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
                    style={{
                        x: mapGlowX,
                        y: mapGlowY,
                        background: "radial-gradient(circle, rgba(var(--sys-accent-rgb),0.20), transparent 70%)",
                    }}
                />
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
                        animate={{
                            y: [0, -34, 0],
                            x: [0, p.drift, 0],
                            opacity: [p.opacity, p.opacity * 1.6, p.opacity],
                        }}
                        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>

            <div className="relative z-10 app-shell">
                <motion.header
                    initial={{ opacity: 0, y: 22 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.62, ease: EASE }}
                    className="mb-16 flex flex-col items-start text-left pt-8 md:pt-16"
                >
                    <div className="flex flex-col flex-wrap md:flex-row items-start md:items-baseline gap-4 md:gap-6 justify-start w-full">
                        {/* Eyebrow */}
                        <span className="flex items-center justify-start gap-4 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-(--sys-accent) mb-4 md:mb-0">
                            <span className="inline-block w-8 h-0.5 bg-(--sys-accent)" />
                            Collaboration map
                            <span className="inline-block w-8 h-0.5 bg-(--sys-accent)" />
                        </span>

                        {/* Title */}
                        <h2 className="m-0 font-sans text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-(--sys-text-primary)">
                            Where engineering meets <span className="text-(--sys-accent)">global delivery</span>.
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between w-full items-start md:items-end gap-6 md:gap-0 mt-4">
                        <p className="m-0 max-w-xl text-[clamp(0.95rem,1.4vw,1.08rem)] leading-relaxed text-(--sys-text-secondary)">
                            Built for recruiter confidence: location-aware collaboration, timezone-friendly communication,
                            and execution workflows tuned for fast hiring decisions.
                        </p>

                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-(--sys-text-secondary) backdrop-blur-md">
                            <OrbitIcon />
                            Hybrid ready
                        </div>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.72, delay: 0.08, ease: EASE }}
                        style={{ rotateX: mapRotateX, rotateY: mapRotateY, transformPerspective: 1200 }}
                        className="relative lg:col-span-8"
                    >
                        <div className="relative h-[560px] overflow-hidden rounded-4xl border border-white/12 bg-white/[0.04] shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                            <div className="absolute -top-px left-12 right-12 h-px bg-linear-to-r from-transparent via-(--sys-accent) to-transparent" />

                            <iframe
                                title="Live Google Map"
                                src={mapEmbedSrc}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 h-full w-full"
                                allowFullScreen
                            />

                            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/20 via-black/25 to-black/70" />

                            <div className="absolute left-5 top-5 z-10 rounded-2xl border border-white/15 bg-black/50 p-4 backdrop-blur-md">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-(--sys-accent)">Live map mode</p>
                                <p className="mt-1 text-sm font-semibold text-white">{mapCenter.label}</p>
                                <p className="mt-2 text-xs leading-relaxed text-white/75">
                                    Interactive Google Maps with zoom, drag, and accurate location centering.
                                </p>
                            </div>

                            <div className="absolute bottom-5 left-5 z-10 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
                                {mapCenter.lat.toFixed(4)}°, {mapCenter.lng.toFixed(4)}°
                            </div>

                            <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleUseMyLocation}
                                    disabled={isLocating}
                                    className="rounded-full border border-white/15 bg-black/50 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur transition hover:border-(--sys-accent)/60 hover:text-(--sys-accent) disabled:opacity-60"
                                >
                                    {isLocating ? "Locating..." : "Use my live location"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetToBaseLocation}
                                    className="rounded-full border border-white/15 bg-black/50 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur transition hover:border-(--sys-accent)/60 hover:text-(--sys-accent)"
                                >
                                    Reset to base
                                </button>

                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full border border-white/15 bg-black/50 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur transition hover:border-(--sys-accent)/60 hover:text-(--sys-accent)"
                                >
                                    Get directions
                                </a>

                                <a
                                    href={openMapUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full border border-white/15 bg-black/50 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur transition hover:border-(--sys-accent)/60 hover:text-(--sys-accent)"
                                >
                                    Open in Google Maps
                                </a>
                            </div>

                            {locationError ? (
                                <p className="absolute left-5 top-[108px] z-10 max-w-[280px] rounded-xl border border-red-400/35 bg-red-500/20 px-3 py-2 text-xs text-red-200 backdrop-blur-md">
                                    {locationError}
                                </p>
                            ) : null}
                        </div>
                    </motion.div>

                    <div className="space-y-6 lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.62, delay: 0.14, ease: EASE }}
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md"
                        >
                            <div className="absolute -top-px left-8 right-8 h-px bg-linear-to-r from-transparent via-(--sys-accent) to-transparent" />
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--sys-accent)">Engagement model</p>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-(--sys-text-primary)">Remote-first, onsite-ready.</h3>
                            <p className="mt-3 text-sm leading-relaxed text-(--sys-text-secondary)">
                                For internships, full-time roles, and project collaborations where ownership, communication, and technical quality matter.
                            </p>

                            <div className="mt-5 space-y-2.5 text-sm text-(--sys-text-secondary)">
                                <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">Structured weekly progress reporting</p>
                                <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">Architecture-first delivery approach</p>
                                <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">Fast proof-of-concept to production path</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.62, delay: 0.2, ease: EASE }}
                            className="relative overflow-hidden rounded-3xl border border-(--sys-accent)/40 bg-linear-to-br from-(--sys-accent) to-[#ff8c52] p-6 text-white shadow-[0_16px_44px_rgba(var(--sys-accent-rgb),0.35)]"
                        >
                            <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-white/25" />
                            <div className="absolute -right-2 -bottom-8 h-28 w-28 rounded-full border border-white/15" />

                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">Availability</p>
                            <h4 className="mt-2 text-2xl font-black tracking-tight">Open to 2026 opportunities</h4>
                            <p className="mt-3 text-sm leading-relaxed text-white/90">
                                Internships, graduate roles, and collaborative product engineering assignments.
                            </p>

                            <button
                                type="button"
                                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
                            >
                                Schedule intro call
                                <span aria-hidden="true">↗</span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}