/**
 * SplitCTAButton.tsx — Enhanced Futuristic Version (Dynamic Orange Flow)
 * Improvements:
 * • Dynamic orange color smoothly flows between the two buttons on hover
 * • Stronger unified energy capsule design
 * • Dramatic flowing shimmer across both sides
 * • Enhanced hover lift + inner holographic glow
 * • Pulsing outer energy ring on hover
 * • More dynamic arrow animation
 * • Premium depth and futuristic feel
 */

import { useState } from "react";
import { motion } from "framer-motion";

export interface SplitCTAButtonProps {
    onPortfolioClick?: () => void;
    onHireMeClick?: () => void;
}

export default function SplitCTAButton({
    onPortfolioClick,
    onHireMeClick,
}: SplitCTAButtonProps) {
    const [hovered, setHovered] = useState<"portfolio" | "hire" | null>(null);

    return (
        <div className="relative inline-flex w-full max-w-[420px] justify-center">
            {/* Pulsing outer energy glow ring */}
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 rounded-full blur-3xl"
                animate={hovered ? { opacity: 0.95, scale: 1.05 } : { opacity: 0.35, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: "radial-gradient(62% 95% at 50% 50%, color-mix(in srgb, var(--sys-accent) 38%, transparent) 0%, transparent 68%)",
                }}
            />

            <motion.div
                className="relative isolate flex w-full overflow-hidden rounded-full p-1"
                style={{
                    border: "1px solid color-mix(in srgb, var(--sys-border) 65%, transparent)",
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--sys-bg-primary) 92%, white 8%) 0%, color-mix(in srgb, var(--sys-bg-secondary) 94%, white 6%) 100%)",
                    backdropFilter: "blur(22px) saturate(170%)",
                    boxShadow: "0 16px 48px color-mix(in srgb, var(--sys-bg-primary) 40%, black 60%), inset 0 1px 0 color-mix(in srgb, var(--sys-text-primary) 22%, transparent)",
                }}
                whileHover={{
                    y: -5,
                    scale: 1.03,
                }}
                whileTap={{ y: -2, scale: 0.97 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {/* Inner subtle border */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-[1px] rounded-full border"
                    style={{ borderColor: "color-mix(in srgb, var(--sys-border) 40%, transparent)" }}
                />

                {/* Dynamic flowing shimmer */}
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 -skew-x-12"
                    style={{
                        background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--sys-text-primary) 48%, transparent) 45%, transparent 100%)",
                    }}
                    initial={{ x: "-140%" }}
                    whileHover={{ x: "260%" }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                />

                {/* Hire Me - Left Side */}
                <button
                    type="button"
                    aria-label="Hire Me"
                    onClick={onHireMeClick}
                    onMouseEnter={() => setHovered("hire")}
                    onMouseLeave={() => setHovered(null)}
                    className="relative z-20 flex flex-1 items-center justify-center gap-2.5 rounded-full px-8 py-[15px] text-[15.5px] font-semibold tracking-[0.01em] text-white transition-all duration-200"
                    style={{
                        background:
                            hovered === "hire"
                                ? "linear-gradient(135deg, #ff8c52 0%, var(--sys-accent) 45%, #ff6b2c 100%)"
                                : hovered === "portfolio"
                                ? "transparent"
                                : "linear-gradient(135deg, #ff8c52 0%, var(--sys-accent) 55%, #ff6b2c 100%)",
                        boxShadow:
                            hovered === "hire"
                                ? "0 14px 36px color-mix(in srgb, var(--sys-accent) 58%, transparent), inset 0 1px 0 rgba(255,255,255,0.35)"
                                : "0 8px 24px color-mix(in srgb, var(--sys-accent) 40%, transparent)",
                    }}
                >
                    <span className="relative z-10">Hire Me</span>
                    <motion.span
                        className="relative z-10 text-xl"
                        animate={hovered === "hire" ? { x: 5, y: -2 } : { x: 0, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        ↗
                    </motion.span>
                </button>

                {/* Divider */}
                <div
                    aria-hidden="true"
                    className="relative z-20 my-2 w-px"
                    style={{
                        background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--sys-border) 80%, transparent), transparent)",
                    }}
                />

                {/* View Portfolio - Right Side */}
                <button
                    type="button"
                    aria-label="View Portfolio"
                    onClick={onPortfolioClick}
                    onMouseEnter={() => setHovered("portfolio")}
                    onMouseLeave={() => setHovered(null)}
                    className="relative z-20 flex flex-1 items-center justify-center gap-2.5 rounded-full px-8 py-[15px] text-[15.5px] font-semibold tracking-[0.01em] transition-all duration-200"
                    style={{
                        color: hovered === "portfolio" ? "var(--sys-text-primary)" : "var(--sys-text-secondary)",
                        background:
                            hovered === "portfolio"
                                ? "linear-gradient(135deg, #ff8c52 0%, var(--sys-accent) 45%, #ff6b2c 100%)"
                                : "transparent",
                        boxShadow:
                            hovered === "portfolio"
                                ? "0 14px 36px color-mix(in srgb, var(--sys-accent) 58%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)"
                                : "none",
                    }}
                >
                    <span className="relative z-10">View Portfolio</span>
                    <motion.span
                        className="relative z-10 text-xl"
                        animate={hovered === "portfolio" ? { x: 5, y: -2 } : { x: 0, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        ↗
                    </motion.span>
                </button>
            </motion.div>
        </div>
    );
}