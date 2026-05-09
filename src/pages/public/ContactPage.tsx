import React, { useState, useRef, useCallback, FormEvent } from 'react';
import * as THREE from 'three';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Torus, MeshDistortMaterial, Environment } from '@react-three/drei';
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaPaperPlane, FaCircleCheck } from 'react-icons/fa6';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/layout/Navbar/Navbar';


// Animation Constants
const EASE = [0.32, 0.72, 0, 1] as const;
const SPRING_CFG = { stiffness: 150, damping: 20, mass: 0.5 };
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// 3D Background Shapes (React Three Fiber)
const FloatingShapes = () => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                <Icosahedron args={[1, 0]} position={[-4, 2, -5]} scale={1.5}>
                    <MeshDistortMaterial color="#ff6b2c" wireframe distort={0.2} speed={2} transparent opacity={0.15} />
                </Icosahedron>
            </Float>
            <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
                <Torus args={[1.2, 0.2, 16, 100]} position={[5, -1, -3]} rotation={[1, 0.5, 0]}>
                    <meshStandardMaterial color="#ff8a57" roughness={0.2} metalness={0.8} transparent opacity={0.2} />
                </Torus>
            </Float>
        </group>
    );
};

// 3D Tilt Card Component
const TiltCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const shouldReduceMotion = useReducedMotion();
    const ref = useRef<HTMLAnchorElement | HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, SPRING_CFG);
    const mouseYSpring = useSpring(y, SPRING_CFG);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (shouldReduceMotion || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    }, [x, y, shouldReduceMotion]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    return (
        <motion.div
            ref={ref as any}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={shouldReduceMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
            whileHover={shouldReduceMotion ? {} : { scale: 1.02, zIndex: 10 }}
            className={`relative ${className}`}
        >
            <div style={{ transform: shouldReduceMotion ? 'none' : 'translateZ(30px)' }} className="h-full w-full">
                {children}
            </div>
        </motion.div>
    );
};

// Contact Methods Data
const CONTACT_METHODS = [
    { id: 'email', label: 'Email', value: 'hello@mekeshbuilds.dev', icon: FaEnvelope, href: 'mailto:hello@mekeshbuilds.dev', color: 'var(--sys-accent)' },
    { id: 'phone', label: 'Phone', value: '+91 77990 04007', icon: FaPhone, href: 'tel:+917799004007', color: '#10b981' },
    { id: 'linkedin', label: 'LinkedIn', value: 'in/mekeshkumar', icon: FaLinkedin, href: 'https://linkedin.com/in/mekeshkumar', color: '#3b82f6' },
    { id: 'github', label: 'GitHub', value: 'Mekesh-Engineer', icon: FaGithub, href: 'https://github.com/Mekesh-Engineer', color: '#8b5cf6' },
];

// Main Page Component
export default function ContactPage() {
    const shouldReduceMotion = useReducedMotion();
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [formData, setFormData] = useState({ name: '', email: '', service: '', message: '' });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        
        try {
            const endpoint = `https://formsubmit.co/ajax/hello@mekeshbuilds.dev`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    inquiryType: formData.service,
                    message: formData.message,
                    _subject: `New Contact Request - ${formData.service}`,
                    _template: 'table',
                }),
            });

            if (!response.ok) throw new Error('Submission failed');

            setStatus('sent');
            setFormData({ name: '', email: '', service: '', message: '' });
            setTimeout(() => setStatus('idle'), 4000);
        } catch (error) {
            console.error('Contact form submission error:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <>
            <Helmet>
                <title>Contact | MekeshBuilds</title>
                <meta name="description" content="Get in touch. Let's align your business goals with strategic execution and engineering excellence." />
            </Helmet>

            <Navbar />

            <main className="relative min-h-screen bg-[var(--sys-bg-primary)] overflow-hidden font-sans text-[var(--sys-text-primary)] selection:bg-[var(--sys-accent)] selection:text-white pt-24 pb-32">
                {/* Background Effects */}
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--sys-accent)]/5 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#3b82f6]/5 blur-[120px]" />
                    
                    {!shouldReduceMotion && (
                        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} className="absolute inset-0 opacity-60">
                            <ambientLight intensity={0.5} />
                            <Environment preset="city" />
                            <FloatingShapes />
                        </Canvas>
                    )}

                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
                    
                    {/* Left Column: Typography & Contact Cards */}
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="lg:col-span-5 flex flex-col pt-4 lg:pt-12"
                    >
                        <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--sys-accent)] mb-6 bg-[var(--sys-accent)]/10 border border-[var(--sys-accent)]/20 w-fit">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sys-accent)] opacity-75" />
                                <span className="relative rounded-full h-2 w-2 bg-[var(--sys-accent)]" />
                            </span>
                            Get in Touch
                        </motion.span>

                        <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                            Let's make <br />
                            <em className="not-italic bg-clip-text text-transparent bg-gradient-to-r from-[var(--sys-accent)] to-[var(--sys-accent-light)]">things happen.</em>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-lg text-[var(--sys-text-secondary)] leading-relaxed mb-12 max-w-md">
                            Whether you have questions about my services, want to explore collaboration opportunities, or need guidance on your next big project, I'd love to hear from you.
                        </motion.p>

                        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CONTACT_METHODS.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <motion.a
                                        key={method.id} variants={fadeUp} href={method.href} target="_blank" rel="noreferrer"
                                        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 rounded-2xl"
                                    >
                                        <TiltCard className="h-full bg-[var(--sys-bg-secondary)]/50 border border-[var(--sys-border)]/60 p-5 rounded-2xl backdrop-blur-md hover:bg-[var(--sys-bg-tertiary)] hover:border-[var(--sys-accent)]/40 transition-colors group">
                                            <div className="flex flex-col gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-transform duration-300 group-hover:scale-110"
                                                    style={{ backgroundColor: `${method.color}15`, borderColor: `${method.color}30`, color: method.color }}
                                                >
                                                    <Icon className="w-5 h-5" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sys-text-secondary)] mb-1">{method.label}</p>
                                                    <p className="text-[13px] font-semibold text-[var(--sys-text-primary)] group-hover:text-[var(--sys-accent)] transition-colors truncate">{method.value}</p>
                                                </div>
                                            </div>
                                        </TiltCard>
                                    </motion.a>
                                );
                            })}
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Glassmorphism Contact Form */}
                    <motion.div
                        initial="hidden" animate="visible" variants={fadeUp}
                        className="lg:col-span-7 lg:pl-10"
                    >
                        <div className="relative bg-[var(--sys-bg-secondary)]/80 backdrop-blur-2xl border border-[var(--sys-border)] rounded-[2.5rem] p-8 sm:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
                            {/* Decorative corner glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sys-accent)]/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
                            
                            <h3 className="text-2xl font-bold text-[var(--sys-text-primary)] mb-2 relative z-10">Send a Message</h3>
                            <p className="text-sm text-[var(--sys-text-secondary)] mb-8 relative z-10">Fill out the form below, and I will get back to you within 24 hours.</p>

                            <form onSubmit={handleSubmit} className="space-y-5 relative z-10" noValidate aria-label="Contact form">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-bold text-[var(--sys-text-secondary)] uppercase tracking-wider mb-2">Full Name <span className="text-[var(--sys-error)]">*</span></label>
                                        <input
                                            id="name" required type="text" placeholder="Jane Doe"
                                            value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className="w-full bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--sys-text-primary)] placeholder:text-[var(--sys-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sys-accent)]/50 focus:border-[var(--sys-accent)] transition-all shadow-inner"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-bold text-[var(--sys-text-secondary)] uppercase tracking-wider mb-2">Email Address <span className="text-[var(--sys-error)]">*</span></label>
                                        <input
                                            id="email" required type="email" placeholder="jane@example.com"
                                            value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                            className="w-full bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--sys-text-primary)] placeholder:text-[var(--sys-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sys-accent)]/50 focus:border-[var(--sys-accent)] transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="service" className="block text-xs font-bold text-[var(--sys-text-secondary)] uppercase tracking-wider mb-2">Inquiry Type <span className="text-[var(--sys-error)]">*</span></label>
                                    <div className="relative">
                                        <select
                                            id="service" required
                                            value={formData.service} onChange={e => setFormData(p => ({ ...p, service: e.target.value }))}
                                            className="w-full bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--sys-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--sys-accent)]/50 focus:border-[var(--sys-accent)] transition-all shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select an option</option>
                                            <option value="consulting">Engineering Consulting</option>
                                            <option value="development">Full-Stack Development</option>
                                            <option value="hardware">Embedded / Hardware Design</option>
                                            <option value="other">Other Inquiry</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--sys-text-secondary)]">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs font-bold text-[var(--sys-text-secondary)] uppercase tracking-wider mb-2">Message <span className="text-[var(--sys-error)]">*</span></label>
                                    <textarea
                                        id="message" required rows={5} placeholder="How can I help you?"
                                        value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                        className="w-full bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--sys-text-primary)] placeholder:text-[var(--sys-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--sys-accent)]/50 focus:border-[var(--sys-accent)] transition-all shadow-inner resize-none"
                                    />
                                </div>

                                <div className="pt-4">
                                    <motion.button
                                        type="submit" disabled={status === 'sending'}
                                        whileHover={status !== 'sending' && status !== 'sent' ? { scale: 1.02, y: -2, boxShadow: '0 8px 24px rgba(255,107,44,0.3)' } : {}}
                                        whileTap={status !== 'sending' && status !== 'sent' ? { scale: 0.98 } : {}}
                                        className="w-full sm:w-auto relative flex items-center justify-center gap-2 px-10 py-4 rounded-full text-[14px] font-bold text-white transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sys-bg-secondary)]"
                                        style={{
                                            background: status === 'sent' ? 'var(--sys-success)' : 'linear-gradient(135deg, var(--sys-accent) 0%, var(--sys-accent-dark) 100%)',
                                            opacity: status === 'sending' ? 0.8 : 1,
                                            cursor: status === 'sending' || status === 'sent' ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <AnimatePresence mode="wait">
                                            {status === 'sending' ? (
                                                <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Sending...
                                                </motion.div>
                                            ) : status === 'sent' ? (
                                                <motion.div key="sent" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                                                    <FaCircleCheck className="text-lg" aria-hidden="true" />
                                                    Message Sent!
                                                </motion.div>
                                            ) : (
                                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                                    Submit Request
                                                    <FaPaperPlane className="text-sm ml-1 opacity-90" aria-hidden="true" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {/* Glare effect */}
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </main>

          
        </>
    );
}