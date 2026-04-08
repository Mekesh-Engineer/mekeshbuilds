import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { sendCtaEmail } from "../../../services/ctaMailService";
import { isValidEmail } from "@/utils/validators";

const E = [0.32, 0.72, 0, 1] as const;

type BadgeType = "star" | "award" | "check";

interface CtaBadge {
    id: string;
    type: BadgeType;
    label: string;
}

export interface CtaSectionData {
    titleLineOne: string;
    accentText: string;
    inputPlaceholder: string;
    sendLabel: string;
    sentLabel: string;
    targetEmail: string;
    badges: CtaBadge[];
}

interface CTASectionProps {
    data?: Partial<CtaSectionData>;
}

const DEFAULT_DATA: CtaSectionData = {
    titleLineOne: "Have an Awesome Project Idea?",
    accentText: "Let's Discuss",
    inputPlaceholder: "Enter Email Address",
    sendLabel: "Send",
    sentLabel: "Sent ✓",
    targetEmail: "mekesh.engineer@gmail.com",
    badges: [
        { id: "rating", type: "star", label: "4.9/5 Average Ratings" },
        { id: "awards", type: "award", label: "25+ Winning Awards" },
        { id: "certified", type: "check", label: "Certified Product Designer" },
    ],
};

// ─── Trust badge icons ────────────────────────────────────────────────────────
const IconStar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
            fill="#f97316" stroke="#f97316" strokeWidth="0.5" strokeLinejoin="round" />
        <circle cx="19" cy="5" r="3.5" fill="#f97316" stroke="white" strokeWidth="1.2" />
        <path d="M17.5 5l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconAward = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="10" r="7" stroke="#374151" strokeWidth="1.8" />
        <circle cx="12" cy="10" r="4.5" stroke="#374151" strokeWidth="1.4" strokeDasharray="2 1.5" />
        <path d="M9 21l3-4 3 4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2" fill="#374151" />
    </svg>
);

const IconCheck = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
            fill="#374151" />
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const iconByType: Record<BadgeType, ReactNode> = {
    star: <IconStar />,
    award: <IconAward />,
    check: <IconCheck />,
};

// ─── Envelope SVG ─────────────────────────────────────────────────────────────
const Envelope = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="white" />
        <path d="M2 8l10 6 10-6" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const PulseRing = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function CTASection({ data }: CTASectionProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [feedback, setFeedback] = useState("");
    const [focused, setFocused] = useState(false);

    const content = useMemo<CtaSectionData>(
        () => ({
            ...DEFAULT_DATA,
            ...data,
            badges: data?.badges ?? DEFAULT_DATA.badges,
        }),
        [data],
    );

    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const mouseX = useSpring(rawMouseX, { stiffness: 110, damping: 20, mass: 0.9 });
    const mouseY = useSpring(rawMouseY, { stiffness: 110, damping: 20, mass: 0.9 });

    const cardRotateX = useTransform(mouseY, [-300, 300], [3, -3]);
    const cardRotateY = useTransform(mouseX, [-300, 300], [-4, 4]);
    const glowX = useTransform(mouseX, [-300, 300], [-24, 24]);
    const glowY = useTransform(mouseY, [-300, 300], [-16, 16]);

    const handleSend = async (event: FormEvent) => {
        event.preventDefault();

        const normalizedEmail = email.trim();
        if (!isValidEmail(normalizedEmail)) {
            setStatus("error");
            setFeedback("Enter a valid email address.");
            return;
        }

        setStatus("sending");
        setFeedback("");

        try {
            await sendCtaEmail({
                targetEmail: content.targetEmail,
                senderEmail: normalizedEmail,
            });

            setStatus("sent");
            setFeedback("Message sent successfully.");
            window.setTimeout(() => {
                setStatus("idle");
                setFeedback("");
            }, 2400);
        } catch {
            setStatus("error");
            setFeedback(`Unable to send now. Please email ${content.targetEmail} directly.`);
        }

        setEmail("");
    };

    return (
        <section
            id="contact"
            aria-label="Contact CTA"
            className="relative overflow-hidden bg-(--sys-bg-primary) px-6 py-24 sm:px-8 lg:px-12"
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                rawMouseX.set(e.clientX - (rect.left + rect.width / 2));
                rawMouseY.set(e.clientY - (rect.top + rect.height / 2));
            }}
            onMouseLeave={() => {
                rawMouseX.set(0);
                rawMouseY.set(0);
            }}
        >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--sys-accent) 1px, transparent 1px), linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)",
                        backgroundSize: "58px 58px",
                    }}
                />

                <motion.div
                    className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
                    style={{
                        x: glowX,
                        y: glowY,
                        background: "radial-gradient(circle, rgba(var(--sys-accent-rgb),0.22), transparent 70%)",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-90px" }}
                    transition={{ duration: 0.68, ease: E }}
                    style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformPerspective: 1200 }}
                    className="relative overflow-hidden rounded-4xl border border-white/12 bg-white/[0.04] p-8 shadow-[0_26px_72px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-12"
                >
                    <div className="absolute -top-px left-12 right-12 h-px bg-linear-to-r from-transparent via-(--sys-accent) to-transparent" />
                    <motion.div
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-(--sys-accent)/35"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        aria-hidden="true"
                    />
                    <motion.div
                        className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full border border-white/10"
                        animate={{ rotate: [360, 0] }}
                        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                        aria-hidden="true"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: E }}
                    >
                        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-(--sys-accent)">
                            <PulseRing />
                            Opportunity ready
                        </span>

                        <h2 className="m-0 flex flex-col leading-none" style={{ fontFamily: "var(--font-sans)" }}>
                            <span
                                className="text-[clamp(1.9rem,4.6vw,3.3rem)] font-light tracking-[-0.02em]"
                                style={{ color: "color-mix(in srgb, var(--sys-text-primary) 45%, transparent)" }}
                            >
                                {content.titleLineOne}
                            </span>
                            <span
                                className="relative mt-1 w-fit text-[clamp(2.3rem,5.8vw,4.3rem)] font-black italic tracking-[-0.03em]"
                                style={{ fontFamily: "var(--font-display)", color: "var(--sys-text-primary)" }}
                            >
                                {content.accentText}
                                <span className="absolute -bottom-2 left-1 h-[3px] w-[64%] rounded-full bg-linear-to-r from-(--sys-accent) to-transparent" />
                            </span>
                        </h2>

                        <p className="mt-4 max-w-3xl text-[15px] leading-[1.85] text-(--sys-text-secondary)">
                            Recruiter-friendly contact flow: send your email and I will respond with role fit, project links,
                            and next-step availability.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.58, delay: 0.12, ease: E }}
                        className="mt-8"
                    >
                        <form onSubmit={handleSend} noValidate>
                            <div className={`flex flex-col gap-3 rounded-2xl border bg-black/30 p-3 backdrop-blur-md md:flex-row md:items-center ${focused ? "border-(--sys-accent)/70" : "border-white/12"} ${status === "error" ? "border-red-400/80" : ""}`}>
                                <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-(--sys-accent)">
                                    <Envelope />
                                </div>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    placeholder={content.inputPlaceholder}
                                    aria-label="Email address"
                                    className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-(--sys-text-primary) outline-none placeholder:text-(--sys-text-secondary)"
                                />

                                <motion.button
                                    whileHover={{ scale: 1.03, boxShadow: "0 10px 24px rgba(var(--sys-accent-rgb),0.40)" }}
                                    whileTap={{ scale: 0.96 }}
                                    type="submit"
                                    aria-label="Send"
                                    className="h-12 rounded-xl bg-linear-to-r from-(--sys-accent) to-[#ff8c52] px-6 text-sm font-bold text-white"
                                    disabled={status === "sending"}
                                >
                                    {status === "sending"
                                        ? "Sending..."
                                        : status === "sent"
                                            ? content.sentLabel
                                            : content.sendLabel}
                                </motion.button>
                            </div>

                            {feedback ? (
                                <p className={`mt-3 text-sm ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
                                    {feedback}
                                </p>
                            ) : null}
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.2, ease: E }}
                        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {content.badges.map(({ id, type, label }, i) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.28 + i * 0.08, duration: 0.45, ease: E }}
                                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-(--sys-text-secondary)"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85">
                                    {iconByType[type]}
                                </span>
                                <span>{label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}