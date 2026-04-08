/**
 * AdminNavbar.tsx
 * ─────────────────────────────────────────────────────────────────
 * Fixed top navigation bar for the Admin CMS.
 *
 * Sections (left → right):
 *  LEFT:  Logo · Sidebar toggle · Project dropdown · Team dropdown
 *  RIGHT: Ask AI · Docs · API · Notifications · Account dropdown
 *
 * Design: matches portfolio HeroSection
 *  • bg: sys-bg-primary with bottom border
 *  • Glassmorphism dropdowns with backdrop-blur
 *  • Orange (#ff6b2c) accent on active/hover states
 *  • All dropdowns: pure React useState (no Preline JS)
 *  • Keyboard-safe: escape closes open dropdown
 */

import {
    useCallback, useEffect, useRef, useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────
interface NavbarProps {
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
}

// ─── Animation presets ────────────────────────────────────────────
const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.97 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.18, ease: 'easeOut' as const }
    },
    exit: {
        opacity: 0, y: -6, scale: 0.97,
        transition: { duration: 0.14 }
    },
};

// ─── Reusable hook: close dropdown on outside click + Escape ──────
function useDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const toggle = useCallback(() => setOpen((v) => !v), []);
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) close();
        };
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open, close]);

    return { open, toggle, close, ref };
}

// ─── Sub-components ───────────────────────────────────────────────

/** Thin vertical separator between nav groups */
const NavSep = () => (
    <span aria-hidden="true"
        className="inline-block w-px h-4 bg-white/10 rounded-full" />
);

/** Glassmorphism dropdown shell */
const DropdownPanel = ({ children, className = '' }: {
    children: React.ReactNode; className?: string;
}) => (
    <motion.div
        role="menu"
        variants={dropdownVariants}
        initial="hidden" animate="visible" exit="exit"
        className={[
            'absolute top-full mt-2 z-50',
            'rounded-xl border border-white/10',
            'bg-sys-bg-primary/90 backdrop-blur-xl',
            'shadow-[0_16px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)]',
            'py-1 min-w-[200px]',
            className,
        ].join(' ')}
    >
        {children}
    </motion.div>
);

/** Standard dropdown menu item */
const DropdownItem = ({
    icon, children, onClick, href, destructive,
}: {
    icon?: React.ReactNode; children: React.ReactNode;
    onClick?: () => void; href?: string; destructive?: boolean;
}) => {
    const cls = [
        'flex items-center gap-2.5 w-full px-3 py-2 text-[13px] rounded-lg',
        'transition-colors duration-150 cursor-pointer',
        destructive
            ? 'text-red-400 hover:bg-red-500/10'
            : 'text-sys-text-secondary hover:text-sys-text-primary hover:bg-white/[0.06]',
    ].join(' ');

    if (href) return (
        <a href={href} className={cls} role="menuitem">
            {icon && <span className="opacity-60">{icon}</span>}
            {children}
        </a>
    );
    return (
        <button type="button" onClick={onClick} className={cls} role="menuitem">
            {icon && <span className="opacity-60">{icon}</span>}
            {children}
        </button>
    );
};

/** Hairline divider inside dropdown */
const DropdownDivider = () => (
    <div className="my-1 mx-2 h-px bg-white/[0.07]" />
);

// ─── Logo ─────────────────────────────────────────────────────────
const Logo = () => (
    <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center
            bg-gradient-to-br from-sys-accent-dark to-sys-accent
            shadow-[0_2px_10px_rgba(255,107,44,0.35)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Logo">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
        <span className="hidden sm:block text-[13px] font-bold text-sys-text-primary tracking-tight">
            Portfolio<span className="text-sys-accent">CMS</span>
        </span>
    </div>
);

// ─── Project Dropdown ─────────────────────────────────────────────
const PROJECTS = [
    { id: 1, name: 'My Portfolio', initial: 'MP', color: '#ff6b2c', active: true },
    { id: 2, name: 'Side Project', initial: 'SP', color: '#6b2cff', active: false },
];

const ProjectDropdown = () => {
    const { open, toggle, close, ref } = useDropdown();
    const [selected, setSelected] = useState<typeof PROJECTS[0]>(PROJECTS[0]!);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium
                    text-sys-text-primary hover:bg-white/[0.07] transition-colors duration-150"
            >
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px]
                    font-black text-white shrink-0"
                    style={{ background: selected.color }}>
                    {selected.initial}
                </span>
                {selected.name}
                <ChevronIcon open={open} />
            </button>

            <AnimatePresence>
                {open && (
                    <DropdownPanel className="left-0 w-56">
                        <div className="px-3 pt-2 pb-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider
                                text-sys-text-secondary opacity-50">
                                Projects ({PROJECTS.length})
                            </span>
                        </div>
                        {PROJECTS.map((p) => (
                            <button key={p.id} type="button"
                                onClick={() => { setSelected(p); close(); }}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px]
                                    text-sys-text-secondary hover:text-sys-text-primary
                                    hover:bg-white/[0.06] rounded-lg transition-colors"
                                role="menuitem">
                                <span className="w-5 h-5 rounded-md flex items-center justify-center
                                    text-[9px] font-black text-white shrink-0"
                                    style={{ background: p.color }}>
                                    {p.initial}
                                </span>
                                <span className="flex-1 text-left">{p.name}</span>
                                {selected.id === p.id && (
                                    <CheckIcon className="text-sys-accent" />
                                )}
                            </button>
                        ))}
                        <DropdownDivider />
                        <DropdownItem icon={<PlusIcon />} onClick={close}>Add project</DropdownItem>
                        <DropdownItem icon={<SettingsIcon />} onClick={close}>Manage projects</DropdownItem>
                    </DropdownPanel>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Team Dropdown ────────────────────────────────────────────────
const TEAMS = ['Engineering', 'Design', 'Marketing'];

const TeamDropdown = () => {
    const { open, toggle, close, ref } = useDropdown();
    const [selected, setSelected] = useState(TEAMS[0]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium
                    text-sys-text-primary hover:bg-white/[0.07] transition-colors duration-150"
            >
                {selected}
                <ChevronIcon open={open} />
            </button>

            <AnimatePresence>
                {open && (
                    <DropdownPanel className="left-0 w-44">
                        <div className="px-3 pt-2 pb-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider
                                text-sys-text-secondary opacity-50">
                                Teams ({TEAMS.length})
                            </span>
                        </div>
                        {TEAMS.map((t) => (
                            <button key={t} type="button"
                                onClick={() => { setSelected(t); close(); }}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px]
                                    text-sys-text-secondary hover:text-sys-text-primary
                                    hover:bg-white/[0.06] rounded-lg transition-colors"
                                role="menuitem">
                                <span className="flex-1 text-left">{t}</span>
                                {selected === t && <CheckIcon className="text-sys-accent" />}
                            </button>
                        ))}
                        <DropdownDivider />
                        <DropdownItem icon={<PlusIcon />} onClick={close}>Add team</DropdownItem>
                    </DropdownPanel>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Account Dropdown ─────────────────────────────────────────────
const AccountDropdown = () => {
    const { open, toggle, ref } = useDropdown();
    const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
                className="w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-sys-accent/50
                    transition-all duration-200 overflow-hidden"
            >
                <img
                    src="https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?w=64&h=64&fit=facearea&facepad=3&q=80"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                />
            </button>

            <AnimatePresence>
                {open && (
                    <DropdownPanel className="right-0 w-60">
                        {/* User info */}
                        <div className="px-3.5 pt-3 pb-3">
                            <div className="flex items-center gap-2.5 mb-3">
                                <img
                                    src="https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?w=64&h=64&fit=facearea&facepad=3&q=80"
                                    alt="Avatar"
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-sys-accent/30"
                                />
                                <div>
                                    <p className="text-[13px] font-semibold text-sys-text-primary">Mekeshkumar</p>
                                    <p className="text-[11px] text-sys-text-secondary">mekesh@portfolio.dev</p>
                                </div>
                            </div>
                            {/* Upgrade pill */}
                            <button type="button"
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2
                                    text-[12px] font-bold text-white rounded-lg
                                    bg-gradient-to-r from-sys-accent-dark to-sys-accent
                                    hover:brightness-110 transition-all
                                    shadow-[0_4px_14px_rgba(255,107,44,0.35)]">
                                <StarIcon />
                                Upgrade to Pro
                            </button>
                        </div>

                        <DropdownDivider />

                        {/* Theme switcher */}
                        <div className="px-3.5 py-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[12px] text-sys-text-secondary">Theme</span>
                                <div className="flex items-center gap-0.5 p-0.5 rounded-full
                                    bg-white/[0.06] border border-white/[0.08]">
                                    {([
                                        { val: 'light' as const, icon: <SunIcon /> },
                                        { val: 'dark' as const, icon: <MoonIcon /> },
                                        { val: 'auto' as const, icon: <MonitorIcon /> },
                                    ] as const).map(({ val, icon }) => (
                                        <button key={val} type="button"
                                            onClick={() => setTheme(val)}
                                            aria-label={val}
                                            className={[
                                                'w-6 h-6 flex items-center justify-center rounded-full text-[11px]',
                                                'transition-all duration-150',
                                                theme === val
                                                    ? 'bg-sys-accent text-white shadow-sm'
                                                    : 'text-sys-text-secondary hover:text-sys-text-primary',
                                            ].join(' ')}>
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DropdownDivider />

                        <DropdownItem icon={<UserIcon />} href="#">Profile</DropdownItem>
                        <DropdownItem icon={<SettingsIcon />} href="#">Settings</DropdownItem>
                        <DropdownItem icon={<LogOutIcon />} href="#" destructive>Log out</DropdownItem>
                    </DropdownPanel>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Notification Bell ────────────────────────────────────────────
const NotificationBell = () => {
    const { open, toggle, ref } = useDropdown();
    const [hasNew] = useState(true);

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={toggle} aria-label="Notifications"
                className="relative w-8 h-8 flex items-center justify-center rounded-lg
                    text-sys-text-secondary hover:text-sys-text-primary hover:bg-white/[0.07]
                    transition-colors duration-150">
                <BellIcon />
                {hasNew && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full
                        bg-sys-accent ring-2 ring-sys-bg-primary" />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <DropdownPanel className="right-0 w-72">
                        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
                            <span className="text-[12px] font-bold text-sys-text-primary uppercase tracking-wider">
                                Notifications
                            </span>
                            <button type="button" className="text-[11px] text-sys-accent hover:opacity-80">
                                Mark all read
                            </button>
                        </div>
                        <DropdownDivider />
                        {[
                            { msg: 'New blog post published', time: '2m ago', dot: true },
                            { msg: 'Firebase sync complete', time: '1h ago', dot: false },
                            { msg: 'Build successful ✓', time: '3h ago', dot: false },
                        ].map(({ msg, time, dot }) => (
                            <div key={msg} className="flex items-start gap-2.5 px-3 py-2.5
                                hover:bg-white/[0.04] transition-colors cursor-pointer">
                                <span className={[
                                    'mt-1.5 w-1.5 h-1.5 rounded-full shrink-0',
                                    dot ? 'bg-sys-accent' : 'bg-white/10',
                                ].join(' ')} />
                                <div>
                                    <p className="text-[12px] text-sys-text-primary leading-snug">{msg}</p>
                                    <p className="text-[11px] text-sys-text-secondary mt-0.5">{time}</p>
                                </div>
                            </div>
                        ))}
                    </DropdownPanel>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Navbar ──────────────────────────────────────────────────
export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, sidebarOpen }) => (
    <header className="fixed top-0 inset-x-0 z-50 h-20
        bg-sys-bg-primary/95 backdrop-blur-xl
        border-b border-white/[0.07]
        shadow-[0_1px_0_rgba(255,255,255,0.04)]">
        <nav className="h-full px-4 flex items-center gap-2">

            {/* ── LEFT GROUP ── */}
            <div className="flex items-center gap-2">

                {/* Logo */}
                <Logo />

                <NavSep />

                {/* Sidebar toggle */}
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    aria-expanded={sidebarOpen}
                    className="w-8 h-8 flex items-center justify-center rounded-lg
                        text-sys-text-secondary hover:text-sys-text-primary hover:bg-white/[0.07]
                        transition-colors duration-150"
                >
                    {sidebarOpen ? <SidebarCloseIcon /> : <SidebarOpenIcon />}
                </button>

                <NavSep />

                {/* Project switcher */}
                <ProjectDropdown />

                {/* Breadcrumb separator */}
                <span className="text-white/20 text-sm font-light select-none">/</span>

                {/* Team switcher */}
                <TeamDropdown />
            </div>

            {/* ── RIGHT GROUP ── */}
            <div className="ml-auto flex items-center gap-1.5">

                {/* Ask AI (desktop) */}
                <button type="button"
                    className="hidden lg:flex items-center gap-1.5 h-7 px-2.5 rounded-lg
                        text-[12px] font-semibold text-sys-text-primary
                        bg-white/[0.06] border border-white/[0.08]
                        hover:bg-sys-accent/10 hover:border-sys-accent/30
                        hover:text-sys-accent transition-all duration-150">
                    <SparkleIcon />
                    Ask AI
                </button>

                {/* Docs / API links (desktop) */}
                <NavSep />
                {['Docs', 'API'].map((label) => (
                    <a key={label} href="#"
                        className="hidden lg:inline-flex items-center h-7 px-2.5 rounded-lg
                            text-[12px] font-medium text-sys-text-secondary
                            hover:text-sys-text-primary hover:bg-white/[0.06]
                            transition-colors duration-150">
                        {label}
                    </a>
                ))}

                <NavSep />

                {/* Notifications */}
                <NotificationBell />

                {/* Account */}
                <AccountDropdown />
            </div>
        </nav>
    </header>
);

// ─── Inline SVG Icons ─────────────────────────────────────────────
// Keeping icons co-located for zero-dep portability

const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
        className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon = ({ className = '' }) => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={className}>
        <path d="M2 7l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PlusIcon = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const UserIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const LogOutIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="m16 17 5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StarIcon = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828z" />
    </svg>
);

const SparkleIcon = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-sys-accent">
        <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31z" />
    </svg>
);

const BellIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SidebarOpenIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2"
            stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m10 15-3-3 3-3" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SidebarCloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2"
            stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m12 9 3 3-3 3" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SunIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3v1M12 20v1M3 12h1M20 12h1m-2.636-6.364-.707.707M6.343 17.657l-.707.707M5.636 5.636l.707.707m11.314 11.314.707.707"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const MoonIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MonitorIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2"
            stroke="currentColor" strokeWidth="2" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);