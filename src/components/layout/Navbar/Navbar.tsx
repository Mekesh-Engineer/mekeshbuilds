import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase/client';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = { id: string; label: string; hasMegaMenu?: boolean };

interface UserProfile {
    id: string;
    full_name?: string | undefined;
    avatar_url?: string | undefined;
    email?: string | undefined;
    location?: string | undefined;
    date_of_birth?: string | undefined;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'service', label: 'Service', hasMegaMenu: true },
    { id: 'resume', label: 'Resume' },
    { id: 'project', label: 'Project' },
    { id: 'contact', label: 'Contact' },
];

const MEGA_MENU_ITEMS = [
    {
        icon: 'web',
        title: 'Web Development',
        description: 'Modern React applications with clean, performant architecture.',
        color: '#ff6b2c',
    },
    {
        icon: 'palette',
        title: 'UI/UX Design',
        description: 'Systematic design with purpose-driven flat aesthetics.',
        color: '#3b82f6',
    },
    {
        icon: 'terminal',
        title: 'Backend APIs',
        description: 'Scalable Node & Firebase powered REST services.',
        color: '#22c55e',
    },
    {
        icon: 'phone_iphone',
        title: 'Mobile Ready',
        description: 'Fully responsive layouts engineered for all viewports.',
        color: '#f59e0b',
    },
];

const NOTIFICATIONS = [
    {
        id: 1,
        type: 'success',
        color: 'var(--sys-success)',
        title: 'New submission',
        message: 'John Doe submitted a contact request.',
        time: '2m ago',
        read: false,
    },
    {
        id: 2,
        type: 'info',
        color: 'var(--sys-info)',
        title: 'System update',
        message: 'Backup completed — all systems nominal.',
        time: '1h ago',
        read: false,
    },
    {
        id: 3,
        type: 'warning',
        color: 'var(--sys-warning)',
        title: 'Storage warning',
        message: 'Database usage is at 80% capacity.',
        time: '3h ago',
        read: true,
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name?: string) => {
    if (!name) return 'JC';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const formatDOB = (dob?: string) => {
    if (!dob) return null;
    return new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

type ThemeMode = 'dark' | 'light' | 'auto';

const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'auto';

    try {
        const stored = localStorage.getItem('mekeshbuilds-mode') as ThemeMode | null;
        if (stored && ['light', 'dark', 'auto'].includes(stored)) return stored;
    } catch {
        // Storage unavailable — fall back to auto.
    }

    return 'auto';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated glow ring behind the logo */
const LogoGlow: React.FC = () => (
    <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,44,0.35) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
);

/** Thin accent line that tracks scroll progress */
const ScrollProgressBar: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
    return (
        <motion.div
            className="absolute bottom-0 left-0 h-0.5 w-full origin-left"
            style={{
                scaleX,
                background: 'linear-gradient(90deg, #ff6b2c, #ff8a57, #ff6b2c)',
            }}
        />
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Navbar: React.FC = () => {
    // ── State ──────────────────────────────────────────────────────────────────
    const navigate = useNavigate();
    const location = useLocation();
    const isAuth = useAuthStore((s) => s.isAuthenticated);
    const isAdmin = useAuthStore((s) => s.isOwner);
    const signOut = useAuthStore((s) => s.signOut);

    const [activeItem, setActiveItem] = useState('home');
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

    const [unreadCount, setUnreadCount] = useState(
        NOTIFICATIONS.filter((n) => !n.read).length,
    );
    const [notifications, setNotifications] = useState(NOTIFICATIONS);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep highlighted nav item in sync with the current route.
    useEffect(() => {
        const path = location.pathname.toLowerCase();

        if (path === '/') {
            setActiveItem('home');
            return;
        }

        if (path.startsWith('/about')) {
            setActiveItem('about');
            return;
        }

        if (path.startsWith('/resume')) {
            setActiveItem('resume');
            return;
        }

        if (path.startsWith('/projects') || path.startsWith('/project')) {
            setActiveItem('project');
            return;
        }

        if (path.startsWith('/contact')) {
            setActiveItem('contact');
        }
    }, [location.pathname]);

    // Keep the mobile drawer in sync with route transitions.
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Ensure mobile drawer is closed when switching to desktop width.
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Keep system mode synced and persisted across sessions.
    // Time-based checker
    useEffect(() => {
        const applyTheme = () => {
            let modeToApply: 'light' | 'dark';
            if (theme === 'auto') {
                const hour = new Date().getHours();
                modeToApply = (hour >= 6 && hour < 18) ? 'light' : 'dark';
            } else {
                modeToApply = theme;
            }

            document.documentElement.setAttribute('data-mode', modeToApply);
            try {
                localStorage.setItem('mekeshbuilds-mode', theme);
            } catch {
                // Storage unavailable
            }
        };

        applyTheme();

        // 24-hour interval checker to auto toggle if left open
        if (theme === 'auto') {
            const interval = setInterval(applyTheme, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [theme]);

    // Lock background scroll and support Escape key while mobile drawer is open.
    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMobileMenuOpen(false);
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isMobileMenuOpen]);

    // ── Firebase: fetch current user profile ──────────────────────────────────
    useEffect(() => {
        if (!isAuth) {
            setUserProfile(null);
            return;
        }

        let isMounted = true;

        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const user = auth.currentUser;
                if (!user || !isMounted) return;
                const snapshot = await getDoc(doc(db, 'profiles', user.uid));
                if (!isMounted) return;

                if (snapshot.exists()) {
                    const data = snapshot.data() as { full_name?: string; avatar_url?: string; email?: string; location_context?: string };
                    setUserProfile({
                        id: user.uid,
                        full_name: data.full_name ?? undefined,
                        avatar_url: data.avatar_url ?? undefined,
                        email: data.email ?? user.email ?? undefined,
                        location: data.location_context ?? undefined,
                    });
                } else {
                    setUserProfile({
                        id: user.uid,
                        email: user.email ?? undefined,
                        full_name: user.displayName ?? undefined,
                        avatar_url: user.photoURL ?? undefined,
                    });
                }
            } catch {
                // silently fall through — UI shows fallback initials
            } finally {
                if (isMounted) setProfileLoading(false);
            }
        };
        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [isAuth]);

    // ── Scroll tracking ────────────────────────────────────────────────────────
    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            setIsScrolled(y > 20);
            if (y <= 80) {
                setScrollDirection('up');
            } else if (y > lastY) {
                setScrollDirection('down');
            } else if (y < lastY) {
                setScrollDirection('up');
            }
            lastY = Math.max(y, 0);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Theme toggle ───────────────────────────────────────────────────────────
    const toggleTheme = () => {
        setTheme((prev) => {
            if (prev === 'auto') return 'dark';
            if (prev === 'dark') return 'light';
            return 'auto'; // light -> auto
        });
    };

    // ── Dropdown helpers (debounced close) ─────────────────────────────────────
    const openDropdown = (id: string) => {
        if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
        setActiveDropdown(id);
    };

    const closeDropdown = () => {
        dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 120);
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleNavItemClick = (itemId: string) => {
        setActiveItem(itemId);

        if (itemId === 'home') {
            navigate('/');
            return;
        }

        if (itemId === 'about') {
            navigate('/about');
            return;
        }

        if (itemId === 'contact') {
            navigate('/contact');
            return;
        }

        const target = document.getElementById(itemId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // ── Variants ───────────────────────────────────────────────────────────────
    const navVariants = {
        visible: { y: 0, transition: { duration: 0.35 } },
        hidden: { y: '-110%', transition: { duration: 0.35 } },
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: 8, scale: 0.97 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { duration: 0.22 },
        },
        exit: {
            opacity: 0, y: 6, scale: 0.97,
            transition: { duration: 0.16 },
        },
    };

    const staggerChildren = {
        visible: { transition: { staggerChildren: 0.06 } },
    };

    const itemFadeUp = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── Main Navbar ── */}
            <motion.nav
                variants={navVariants}
                initial="visible"
                animate={scrollDirection === 'down' ? 'hidden' : 'visible'}
                className="fixed left-0 right-0 top-0 z-50 py-3 transition-all duration-300 will-change-transform"
            >
                {/* Scroll progress bar */}
                <div className={`transition-opacity duration-200 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
                    <ScrollProgressBar />
                </div>

                <div className="app-shell">
                    <div className={`flex h-14 items-center justify-between gap-4 rounded-full border px-4 ${isScrolled
                        ? 'border-sys-border bg-sys-bg-primary/95 shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
                        : 'border-sys-border/70 bg-sys-bg-primary/90'
                        }`}>

                        {/* ── LEFT: Brand Logo ── */}
                        <motion.button
                            type="button"
                            onClick={() => navigate('/')}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="relative flex items-center gap-3 select-none shrink-0 rounded-xl px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent"
                            aria-label="Home"
                            title="Home"
                        >
                            {/* Icon badge */}
                            <div className="relative flex items-center justify-center">
                                <LogoGlow />
                                <div
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl z-10"
                                    style={{
                                        background: 'linear-gradient(135deg, #ff6b2c 0%, #e65100 100%)',
                                        boxShadow: '0 4px 14px rgba(255,107,44,0.45)',
                                    }}
                                >
                                    <span className="material-icons-round text-white text-[20px]">
                                        dashboard_customize
                                    </span>
                                </div>
                            </div>

                            {/* Wordmark */}
                            <div className="flex flex-col leading-none">
                                <span className="text-[15px] font-bold tracking-tight text-sys-text-primary">
                                    Mekesh
                                </span>
                                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-sys-accent">
                                    Builds
                                </span>
                            </div>
                            <span className="hidden sm:inline-flex items-center rounded-full border border-sys-border/60 bg-sys-bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sys-text-secondary">
                                Home
                            </span>
                        </motion.button>

                        {/* ── CENTER: Desktop Nav Links ── */}
                        <div
                            className="hidden items-center gap-0.5 p-1 md:flex"
                        >
                            {NAV_ITEMS.map((item) => {
                                const isActive = activeItem === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        className="relative"
                                        onMouseEnter={() => item.hasMegaMenu && openDropdown(item.id)}
                                        onMouseLeave={() => item.hasMegaMenu && closeDropdown()}
                                    >
                                        <button
                                            onClick={() => handleNavItemClick(item.id)}
                                            className={`relative flex h-9 items-center rounded-xl px-4 text-[13px] font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent/40 ${isActive
                                                ? 'bg-sys-accent text-white shadow-[0_2px_10px_rgba(255,107,44,0.4)]'
                                                : 'text-sys-text-secondary hover:bg-sys-bg-tertiary hover:text-sys-text-primary'
                                                }`}
                                        >
                                            <span className="relative z-10 flex items-center gap-1.5">
                                                {item.label}
                                                {item.hasMegaMenu && (
                                                    <motion.span
                                                        animate={{ rotate: activeDropdown === item.id ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="material-icons-round text-[14px]"
                                                    >
                                                        expand_more
                                                    </motion.span>
                                                )}
                                            </span>
                                        </button>

                                        {/* ── Mega Menu ── */}
                                        <AnimatePresence>
                                            {item.hasMegaMenu && activeDropdown === item.id && (
                                                <motion.div
                                                    variants={dropdownVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    onMouseEnter={() => openDropdown(item.id)}
                                                    onMouseLeave={closeDropdown}
                                                    className="absolute left-1/2 top-full mt-3 w-[42rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-sys-border"
                                                    style={{
                                                        background: 'var(--sys-bg-primary)',
                                                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                                                    }}
                                                >
                                                    {/* Header */}
                                                    <div className="px-4 pt-4 pb-3 border-b border-sys-border/60">
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-sys-text-secondary">
                                                            What I offer
                                                        </p>
                                                    </div>

                                                    {/* Grid */}
                                                    <motion.div
                                                        className="grid grid-cols-2 gap-2 p-3"
                                                        variants={staggerChildren}
                                                        initial="hidden"
                                                        animate="visible"
                                                    >
                                                        {MEGA_MENU_ITEMS.map((svc) => (
                                                            <motion.div
                                                                key={svc.title}
                                                                variants={itemFadeUp}
                                                                whileHover={{ scale: 1.02 }}
                                                                className="group/svc cursor-pointer rounded-xl border border-transparent p-3 transition-colors hover:border-sys-border hover:bg-sys-bg-secondary"
                                                            >
                                                                <div
                                                                    className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                                                                    style={{ background: `${svc.color}22` }}
                                                                >
                                                                    <span
                                                                        className="material-icons-round text-[18px]"
                                                                        style={{ color: svc.color }}
                                                                    >
                                                                        {svc.icon}
                                                                    </span>
                                                                </div>
                                                                <h4 className="text-[13px] font-semibold text-sys-text-primary mb-0.5">
                                                                    {svc.title}
                                                                </h4>
                                                                <p className="text-[11px] leading-relaxed text-sys-text-secondary">
                                                                    {svc.description}
                                                                </p>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>

                                                    {/* Footer CTA */}
                                                    <div className="border-t border-sys-border/60 bg-sys-bg-secondary/50 px-4 py-3 flex items-center justify-between">
                                                        <span className="text-[12px] text-sys-text-secondary">
                                                            Ready to collaborate?
                                                        </span>
                                                        <a
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                navigate('/contact');
                                                            }}
                                                            className="flex items-center gap-1.5 text-[12px] font-semibold text-sys-accent hover:text-sys-accent-light transition-colors cursor-pointer"
                                                        >
                                                            Get in touch
                                                            <span className="material-icons-round text-[14px]">arrow_forward</span>
                                                        </a>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── RIGHT: Actions ── */}
                        <div className="hidden md:flex items-center gap-2 shrink-0">

                            {/* Theme Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.93 }}
                                onClick={toggleTheme}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-sys-border/60 bg-sys-bg-secondary text-sys-text-secondary transition-colors hover:border-sys-border hover:text-sys-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent/40"
                                aria-label="Toggle theme"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={theme}
                                        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                        exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                                        transition={{ duration: 0.2 }}
                                        className="material-icons-round text-[18px]"
                                    >
                                        {theme === 'auto'
                                            ? 'brightness_auto'
                                            : theme === 'dark'
                                                ? 'light_mode'
                                                : 'dark_mode'}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.button>

                            {/* ── Notifications ── */}
                            {isAuth && isAdmin && (
                                <div
                                    className="relative"
                                    onMouseEnter={() => openDropdown('notifications')}
                                    onMouseLeave={closeDropdown}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.93 }}
                                        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-sys-border/60 bg-sys-bg-secondary text-sys-text-secondary transition-colors hover:border-sys-border hover:text-sys-text-primary"
                                        aria-label="Notifications"
                                    >
                                        <span className="material-icons-round text-[18px]">notifications</span>
                                        {unreadCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-sys-bg-primary text-[9px] font-bold text-white"
                                                style={{ background: 'var(--sys-error)' }}
                                            >
                                                {unreadCount}
                                            </motion.span>
                                        )}
                                    </motion.button>

                                    <AnimatePresence>
                                        {activeDropdown === 'notifications' && (
                                            <motion.div
                                                variants={dropdownVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                onMouseEnter={() => openDropdown('notifications')}
                                                onMouseLeave={closeDropdown}
                                                className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-2xl border border-sys-border"
                                                style={{
                                                    background: 'var(--sys-bg-primary)',
                                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                                                }}
                                            >
                                                {/* Header */}
                                                <div className="flex items-center justify-between border-b border-sys-border/60 px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-icons-round text-sys-accent text-[18px]">
                                                            notifications_active
                                                        </span>
                                                        <h4 className="text-[13px] font-semibold text-sys-text-primary">
                                                            Notifications
                                                        </h4>
                                                        {unreadCount > 0 && (
                                                            <span
                                                                className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                                                                style={{ background: 'var(--sys-accent)' }}
                                                            >
                                                                {unreadCount} new
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={markAllRead}
                                                        className="text-[11px] font-medium text-sys-accent hover:text-sys-accent-light transition-colors"
                                                    >
                                                        Mark all read
                                                    </button>
                                                </div>

                                                {/* List */}
                                                <motion.div
                                                    className="divide-y divide-sys-border/40"
                                                    variants={staggerChildren}
                                                    initial="hidden"
                                                    animate="visible"
                                                >
                                                    {notifications.map((n) => (
                                                        <motion.div
                                                            key={n.id}
                                                            variants={itemFadeUp}
                                                            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-sys-bg-secondary cursor-pointer ${!n.read ? 'bg-sys-bg-secondary/40' : ''
                                                                }`}
                                                        >
                                                            <div
                                                                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                                                style={{ background: `${n.color}22` }}
                                                            >
                                                                <div
                                                                    className="h-2 w-2 rounded-full"
                                                                    style={{ background: n.color }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-[12px] font-semibold text-sys-text-primary truncate">
                                                                        {n.title}
                                                                    </p>
                                                                    <span className="text-[10px] text-sys-text-secondary shrink-0">
                                                                        {n.time}
                                                                    </span>
                                                                </div>
                                                                <p className="mt-0.5 text-[11px] leading-relaxed text-sys-text-secondary">
                                                                    {n.message}
                                                                </p>
                                                            </div>
                                                            {!n.read && (
                                                                <div
                                                                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                                                    style={{ background: 'var(--sys-accent)' }}
                                                                />
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </motion.div>

                                                {/* Footer */}
                                                <div className="border-t border-sys-border/60 bg-sys-bg-secondary/30 px-4 py-2.5">
                                                    <button className="flex w-full items-center justify-center gap-1.5 text-[12px] font-medium text-sys-text-secondary hover:text-sys-text-primary transition-colors">
                                                        View all activity
                                                        <span className="material-icons-round text-[14px]">arrow_forward</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* ── Profile Button & Dropdown ── */}
                            {isAuth ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => openDropdown('profile')}
                                    onMouseLeave={closeDropdown}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-2 rounded-xl border border-sys-border/60 bg-sys-bg-secondary py-1.5 pl-1.5 pr-3 text-[13px] font-medium text-sys-text-primary transition-colors hover:border-sys-border"
                                    >
                                        {/* Avatar */}
                                        <div className="relative">
                                            {userProfile?.avatar_url ? (
                                                <img
                                                    src={userProfile.avatar_url}
                                                    alt={userProfile.full_name ?? 'Profile'}
                                                    className="h-6 w-6 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                                                    style={{ background: 'linear-gradient(135deg, #ff6b2c, #e65100)' }}
                                                >
                                                    {profileLoading ? '…' : getInitials(userProfile?.full_name)}
                                                </div>
                                            )}
                                            {/* Online dot */}
                                            <span
                                                className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-sys-bg-secondary"
                                                style={{ background: 'var(--sys-success)' }}
                                            />
                                        </div>
                                        <span className="max-w-20 truncate">
                                            {profileLoading ? 'Loading…' : (userProfile?.full_name?.split(' ')[0] ?? 'Profile')}
                                        </span>
                                        <motion.span
                                            animate={{ rotate: activeDropdown === 'profile' ? 180 : 0 }}
                                            className="material-icons-round text-[14px] text-sys-text-secondary"
                                        >
                                            expand_more
                                        </motion.span>
                                    </motion.button>

                                    {/* Profile Dropdown */}
                                    <AnimatePresence>
                                        {activeDropdown === 'profile' && (
                                            <motion.div
                                                variants={dropdownVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                onMouseEnter={() => openDropdown('profile')}
                                                onMouseLeave={closeDropdown}
                                                className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-sys-border"
                                                style={{
                                                    background: 'var(--sys-bg-primary)',
                                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                                                }}
                                            >
                                                {/* Hero banner */}
                                                <div
                                                    className="relative h-16 w-full"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(255,107,44,0.3) 0%, rgba(59,130,246,0.15) 100%)',
                                                    }}
                                                >
                                                    <div
                                                        className="absolute inset-0 opacity-20"
                                                        style={{
                                                            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,107,44,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.4) 0%, transparent 50%)',
                                                        }}
                                                    />
                                                </div>

                                                {/* Avatar overlap */}
                                                <div className="px-4 pb-4">
                                                    <div className="-mt-7 mb-3 flex items-end justify-between">
                                                        <div className="relative">
                                                            {userProfile?.avatar_url ? (
                                                                <img
                                                                    src={userProfile.avatar_url}
                                                                    alt="Profile"
                                                                    className="h-14 w-14 rounded-2xl border-2 border-sys-bg-primary object-cover"
                                                                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-sys-bg-primary text-lg font-bold text-white"
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #ff6b2c 0%, #e65100 100%)',
                                                                        boxShadow: '0 4px 12px rgba(255,107,44,0.35)',
                                                                    }}
                                                                >
                                                                    {getInitials(userProfile?.full_name)}
                                                                </div>
                                                            )}
                                                            <span
                                                                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-sys-bg-primary"
                                                                style={{ background: 'var(--sys-success)' }}
                                                            />
                                                        </div>
                                                        <span
                                                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                                                            style={{ background: 'rgba(255,107,44,0.2)', color: 'var(--sys-accent)' }}
                                                        >
                                                            {isAdmin ? 'Admin' : 'User'}
                                                        </span>
                                                    </div>

                                                    {/* Name & email */}
                                                    <div className="mb-3">
                                                        <h3 className="text-[15px] font-bold text-sys-text-primary">
                                                            {userProfile?.full_name ?? 'Welcome back'}
                                                        </h3>
                                                        {userProfile?.email && (
                                                            <p className="text-[12px] text-sys-text-secondary truncate">
                                                                {userProfile.email}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Details grid */}
                                                    {(userProfile?.location || userProfile?.date_of_birth) && (
                                                        <div className="mb-3 rounded-xl border border-sys-border/60 bg-sys-bg-secondary/50 p-3 space-y-2">
                                                            {userProfile.location && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-icons-round text-[14px] text-sys-text-secondary">
                                                                        location_on
                                                                    </span>
                                                                    <span className="text-[12px] text-sys-text-secondary">
                                                                        {userProfile.location}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {userProfile.date_of_birth && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-icons-round text-[14px] text-sys-text-secondary">
                                                                        cake
                                                                    </span>
                                                                    <span className="text-[12px] text-sys-text-secondary">
                                                                        {formatDOB(userProfile.date_of_birth)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Menu items */}
                                                    <div className="space-y-0.5">
                                                        {[
                                                            {
                                                                icon: 'dashboard',
                                                                label: 'Dashboard',
                                                                adminOnly: true,
                                                                action: () => navigate('/dashboard'),
                                                            },
                                                            {
                                                                icon: 'manage_accounts',
                                                                label: 'Builder',
                                                                adminOnly: true,
                                                                action: () => navigate('/builder'),
                                                            },
                                                            {
                                                                icon: 'settings',
                                                                label: 'Settings',
                                                                adminOnly: true,
                                                                action: () => navigate('/settings'),
                                                            },
                                                        ]
                                                            .filter((item) => !item.adminOnly || isAdmin)
                                                            .map((item) => (
                                                                <motion.button
                                                                    key={item.label}
                                                                    whileHover={{ x: 2 }}
                                                                    onClick={() => {
                                                                        setActiveDropdown(null);
                                                                        item.action();
                                                                    }}
                                                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-sys-text-secondary transition-colors hover:bg-sys-bg-secondary hover:text-sys-text-primary"
                                                                >
                                                                    <span className="material-icons-round text-[16px]">
                                                                        {item.icon}
                                                                    </span>
                                                                    {item.label}
                                                                </motion.button>
                                                            ))}
                                                    </div>
                                                </div>

                                                {/* Sign out */}
                                                <div className="border-t border-sys-border/60 px-4 py-3">
                                                    <motion.button
                                                        whileHover={{ x: 2 }}
                                                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors hover:bg-sys-error/10"
                                                        style={{ color: 'var(--sys-error)' }}
                                                        onClick={async () => {
                                                            await signOut();
                                                            setActiveDropdown(null);
                                                            navigate('/');
                                                        }}
                                                    >
                                                        <span className="material-icons-round text-[16px]">logout</span>
                                                        Sign out
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                    <Link
                                        to="/auth/login"
                                        className="inline-flex rounded-xl px-5 py-2 text-[13px] font-semibold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent/40"
                                        style={{
                                            background: 'linear-gradient(135deg, #ff6b2c 0%, #e65100 100%)',
                                            boxShadow: '0 2px 10px rgba(255,107,44,0.4)',
                                        }}
                                    >
                                        Sign In
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        {/* ── Mobile Hamburger ── */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-sys-border/60 bg-sys-bg-secondary text-sys-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent/40 md:hidden"
                            aria-label="Open navigation menu"
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-nav-drawer"
                        >
                            <span className="material-icons-round text-[20px]">menu</span>
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* ── Mobile Drawer ── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
                            aria-hidden="true"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            id="mobile-nav-drawer"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation menu"
                            className="fixed bottom-0 right-0 top-0 z-[70] flex w-72 max-w-[90vw] flex-col border-l border-sys-border bg-sys-bg-primary"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between border-b border-sys-border/60 p-5">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                                        style={{ background: 'linear-gradient(135deg, #ff6b2c, #e65100)' }}
                                    >
                                        <span className="material-icons-round text-white text-[16px]">
                                            dashboard_customize
                                        </span>
                                    </div>
                                    <span className="text-[15px] font-bold text-sys-text-primary">Menu</span>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-sys-bg-secondary text-sys-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent/40"
                                    aria-label="Close navigation menu"
                                >
                                    <span className="material-icons-round text-[18px]">close</span>
                                </motion.button>
                            </div>

                            {/* Nav Links */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <motion.div
                                    className="flex flex-col gap-1"
                                    variants={staggerChildren}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {NAV_ITEMS.map((item) => (
                                        <motion.button
                                            key={item.id}
                                            variants={itemFadeUp}
                                            onClick={() => {
                                                handleNavItemClick(item.id);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium transition-colors ${activeItem === item.id
                                                ? 'text-white'
                                                : 'text-sys-text-primary hover:bg-sys-bg-secondary'
                                                }`}
                                            style={
                                                activeItem === item.id
                                                    ? { background: 'linear-gradient(135deg, #ff6b2c, #e65100)' }
                                                    : {}
                                            }
                                        >
                                            <span className="material-icons-round text-[18px] opacity-70">
                                                {item.id === 'home' ? 'home' :
                                                    item.id === 'about' ? 'person' :
                                                        item.id === 'service' ? 'layers' :
                                                            item.id === 'resume' ? 'description' :
                                                                item.id === 'project' ? 'work' : 'mail'}
                                            </span>
                                            {item.label}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="border-t border-sys-border/60 p-4 space-y-2">
                                {userProfile && (
                                    <div className="flex items-center gap-3 rounded-xl bg-sys-bg-secondary p-3 mb-3">
                                        {userProfile.avatar_url ? (
                                            <img
                                                src={userProfile.avatar_url}
                                                alt="Profile"
                                                className="h-9 w-9 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                                                style={{ background: 'linear-gradient(135deg, #ff6b2c, #e65100)' }}
                                            >
                                                {getInitials(userProfile.full_name)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-sys-text-primary truncate">
                                                {userProfile.full_name ?? 'User'}
                                            </p>
                                            <p className="text-[11px] text-sys-text-secondary truncate">
                                                {userProfile.email}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={toggleTheme}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-sys-border bg-sys-bg-secondary py-2.5 text-[13px] font-medium text-sys-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent/40"
                                >
                                    <span className="material-icons-round text-[16px]">
                                        {theme === 'auto' ? 'brightness_auto' : theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                    </span>
                                    {theme === 'auto' ? 'Auto Mode' : theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                </button>

                                {isAuth ? (
                                    <button
                                        onClick={async () => {
                                            await signOut();
                                            setIsMobileMenuOpen(false);
                                            navigate('/');
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium transition-colors hover:bg-sys-error/10"
                                        style={{ color: 'var(--sys-error)' }}
                                    >
                                        <span className="material-icons-round text-[16px]">logout</span>
                                        Sign Out
                                    </button>
                                ) : (
                                    <Link
                                        to="/auth/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sys-accent/40"
                                        style={{
                                            background: 'linear-gradient(135deg, #ff6b2c 0%, #e65100 100%)',
                                            boxShadow: '0 2px 10px rgba(255,107,44,0.4)',
                                        }}
                                    >
                                        <span className="material-icons-round text-[16px]">login</span>
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;