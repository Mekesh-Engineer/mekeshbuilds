import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from 'framer-motion';

export interface TiltHoverCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    /** Maximum tilt angle in degrees */
    tiltAmount?: number;
    /** Allows external motion values to drive the tilt (like in HeroSection) */
    externalMouseX?: any;
    externalMouseY?: any;
}

const SPRING_CFG = { stiffness: 120, damping: 18, mass: 0.8 };

export default function TiltHoverCard({
    children,
    className = '',
    tiltAmount = 8,
    externalMouseX,
    externalMouseY,
    ...props
}: TiltHoverCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Local state if external values aren't provided
    const localX = useMotionValue(0);
    const localY = useMotionValue(0);

    const springX = useSpring(localX, SPRING_CFG);
    const springY = useSpring(localY, SPRING_CFG);

    // Use external mouse pos if provided (scale assumed to be -300 to 300 roughly)
    const effectiveX = externalMouseX ?? springX;
    const effectiveY = externalMouseY ?? springY;

    // We map -300 to 300 to the rotation range just like the original Hero section cards
    const rotateX = useTransform(effectiveY, [-300, 300], [tiltAmount, -tiltAmount]);
    const rotateY = useTransform(effectiveX, [-300, 300], [-tiltAmount, tiltAmount]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (externalMouseX || externalMouseY) return; // Ignore local if driven externally
        if (!ref.current) return;
        
        const rect = ref.current.getBoundingClientRect();
        // Calculate center-relative coordinates
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        
        localX.set(cx);
        localY.set(cy);
    };

    const handleMouseLeave = () => {
        if (externalMouseX || externalMouseY) return;
        localX.set(0);
        localY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative ${className}`}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 900,
                transformStyle: 'preserve-3d',
            }}
            {...props as any}
        >
            {children}
        </motion.div>
    );
}
