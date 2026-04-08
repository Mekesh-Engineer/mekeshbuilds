import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Animation constants
const EASE = [0.32, 0.72, 0, 1] as const;

/** Brand icon tile — matches Navbar exactly */
export const BrandIcon = ({ size = 40 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <defs>
            <linearGradient id="lp-tile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b2c" />
                <stop offset="55%" stopColor="#ff8a57" />
                <stop offset="100%" stopColor="#e65100" />
            </linearGradient>
            <linearGradient id="lp-sheen" x1="0%" y1="0%" x2="70%" y2="70%">
                <stop offset="0%" stopColor="white" stopOpacity={0.22} />
                <stop offset="100%" stopColor="white" stopOpacity={0} />
            </linearGradient>
        </defs>
        <rect x="56" y="56" width="400" height="400" rx="96" ry="96" fill="url(#lp-tile)" />
        <rect x="56" y="56" width="400" height="400" rx="96" ry="96" fill="url(#lp-sheen)" />
        <g transform="translate(145 145) scale(9.25)">
            <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3z" fill="white" />
            <path d="M18 13h-2v3h-3v2h3v3h2v-3h3v-2h-3z" fill="white" />
        </g>
    </svg>
);

/** Google "G" logo SVG */
export const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

/** Lock shield icon */
export const ShieldIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const Spinner = ({ size = 18, color = 'white' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ color }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const BrandPanel = () => (
    <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{
            background: 'linear-gradient(145deg, #1a1014 0%, #0f0d0c 50%, #1a1108 100%)',
            minWidth: 0,
            flex: '0 0 45%',
            padding: '48px',
        }}
    >
        {/* Diagonal wavy lines texture */}
        <svg
            viewBox="0 0 600 900" fill="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.055]"
            preserveAspectRatio="xMidYMid slice"
        >
            {Array.from({ length: 30 }).map((_, i) => (
                <path key={i}
                    d={`M${-100 + i * 38} 0 Q${200 + i * 38} 450, ${-100 + i * 38 + 340} 900`}
                    stroke="white" strokeWidth="1.2" fill="none"
                />
            ))}
        </svg>

        {/* Bottom-left warm glow */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72"
            style={{ background: 'radial-gradient(circle at 0% 100%, rgba(180,80,10,0.30) 0%, transparent 65%)' }} />

        {/* Top-right accent */}
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48"
            style={{ background: 'radial-gradient(circle at 100% 0%, rgba(255,107,44,0.10) 0%, transparent 65%)' }} />

        {/* Logo + wordmark */}
        <motion.div
            className="relative z-10 flex items-center gap-3"
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
        >
            <div style={{ boxShadow: '0 4px 20px rgba(255,107,44,0.42)', borderRadius: 18 }}>
                <BrandIcon size={44} />
            </div>
            <div>
                <p className="text-[17px] font-black leading-none tracking-tight text-white"
                    style={{ letterSpacing: '-0.025em' }}>
                    Mekesh<span style={{ color: '#ff6b2c' }}>Builds</span>
                </p>
                <p className="mt-0.5 text-[11px] font-medium tracking-widest uppercase"
                    style={{ color: '#9ca3af' }}>
                    Portfolio OS
                </p>
            </div>
        </motion.div>

        {/* Centre feature card stack */}
        <motion.div
            className="relative z-10 flex flex-col gap-4"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.18, ease: EASE }}
        >
            <div className="overflow-hidden rounded-2xl"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    padding: '18px 20px',
                }}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: 'rgba(255,107,44,0.9)' }}>
                    Dashboard Preview
                </p>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Projects', val: '24' },
                        { label: 'Visitors', val: '1.2k' },
                        { label: 'Messages', val: '08' },
                    ].map(({ label, val }) => (
                        <div key={label} className="rounded-xl p-2.5 text-center"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-[18px] font-black leading-none text-white">{val}</p>
                            <p className="mt-1 text-[9px]" style={{ color: '#9ca3af' }}>{label}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex items-end gap-1" style={{ height: 36 }}>
                    {[40, 65, 45, 80, 55, 90, 70, 60, 85, 75].map((h, i) => (
                        <motion.div key={i}
                            className="flex-1 rounded-sm"
                            style={{ background: i === 9 ? '#ff6b2c' : 'rgba(255,255,255,0.12)' }}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.5 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                        />
                    ))}
                </div>
            </div>

            {[
                { icon: 'edit_note', text: 'Manage all portfolio content' },
                { icon: 'analytics', text: 'Real-time visitor analytics' },
                { icon: 'mark_email_read', text: 'Inbox & contact management' },
            ].map(({ icon, text }, i) => (
                <motion.div key={text}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.1, duration: 0.45, ease: EASE }}
                >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ background: 'rgba(255,107,44,0.14)', border: '1px solid rgba(255,107,44,0.22)' }}>
                        <span className="material-icons-round text-[15px]" style={{ color: '#ff8a57' }}>{icon}</span>
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: '#d1d5db' }}>{text}</p>
                </motion.div>
            ))}
        </motion.div>

        <motion.p
            className="relative z-10 text-[12px] leading-relaxed"
            style={{ color: 'rgba(156,163,175,0.6)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >
            © {new Date().getFullYear()} MekeshBuilds — Owner portal
        </motion.p>
    </div>
);


export const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
            style={{ background: 'var(--sys-bg-primary)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative flex w-full overflow-hidden shadow-2xl"
                style={{
                    maxWidth: 900,
                    minHeight: 560,
                    borderRadius: 24,
                    border: '1px solid var(--sys-border)',
                    background: 'var(--sys-bg-primary)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
            >
                <BrandPanel />
                <div
                    className="relative flex flex-1 flex-col justify-center px-8 py-12 sm:px-10"
                    style={{ background: 'var(--sys-bg-secondary)', minWidth: 0 }}
                >
                    {/* Mobile logo */}
                    <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                        <div style={{ boxShadow: '0 4px 14px rgba(255,107,44,0.4)', borderRadius: 12 }}>
                            <BrandIcon size={34} />
                        </div>
                        <p className="text-[15px] font-black tracking-tight" style={{ color: 'var(--sys-text-primary)', letterSpacing: '-0.025em' }}>
                            Mekesh<span style={{ color: '#ff6b2c' }}>Builds</span>
                        </p>
                    </div>

                    {children}

                </div>
            </motion.div>
        </div>
    );
};
