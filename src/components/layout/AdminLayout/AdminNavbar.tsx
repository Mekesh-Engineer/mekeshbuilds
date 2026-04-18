/**
 * AdminNavbar.tsx — Enhanced v3 (Full Integration Pass)
 * Firebase Auth + all v2 improvements merged in.
 */

import {
    useCallback, useEffect, useRef, useState,
    type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase/client';
import { useAuthStore } from '@/stores/authStore';

const NAVBAR_H = '64px';
const EASE = [0.32, 0.72, 0, 1] as const;

export interface NavbarProps {
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
    pageTitle?: string;
}

interface UserProfile { id: string; full_name?: string; avatar_url?: string; email?: string; role?: string; }
interface Notification { id: string; msg: string; time: Date; read: boolean; type: 'success' | 'info' | 'warning'; }
interface SearchResult { id: string; label: string; category: string; href: string; }
type ThemeMode = 'light' | 'dark';
type IconProps = { size?: number; className?: string };

const NOTIFICATIONS: Notification[] = [
    { id: '1', msg: 'New contact form submission', time: new Date(Date.now() - 120_000), read: false, type: 'success' },
    { id: '2', msg: 'Backup completed — systems nominal', time: new Date(Date.now() - 3_600_000), read: false, type: 'info' },
    { id: '3', msg: 'Database usage at 80% capacity', time: new Date(Date.now() - 10_800_000), read: true, type: 'warning' },
];

const SEARCH_RESULTS: SearchResult[] = [
    { id: 's1', label: 'Dashboard Overview', category: 'Pages', href: '/dashboard' },
    { id: 's2', label: 'Manage Projects', category: 'Content', href: '/projects' },
    { id: 's4', label: 'Edit Resume', category: 'Content', href: '/resume' },
    { id: 's5', label: 'Content Editor', category: 'Content', href: '/content' },
    { id: 's6', label: 'Analytics Overview', category: 'Pages', href: '/analytics' },
    { id: 's7', label: 'Site Settings', category: 'Settings', href: '/settings' },
];

const QUICK_ACTIONS = [
    { id: 'q1', label: 'New Project', shortcut: '⌘N', icon: '✦' },
    { id: 'q2', label: 'View System Logs', shortcut: '⌘L', icon: '◈' },
    { id: 'q3', label: 'Export Portfolio PDF', shortcut: '⌘E', icon: '↗' },
    { id: 'q4', label: 'Preview Live Site', shortcut: '⌘P', icon: '◉' },
];

const NOTIF_COLORS: Record<Notification['type'], string> = {
    success: 'var(--sys-success)', info: 'var(--sys-accent)', warning: 'var(--sys-warning)',
};

const getInitials = (name?: string) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'A';

function relativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = (date.getTime() - Date.now()) / 1000;
    if (Math.abs(diff) < 60) return 'just now';
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
}

function setBodyScroll(locked: boolean) { document.body.style.overflow = locked ? 'hidden' : ''; }

function useDropdown(lockScroll = false) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const toggle = useCallback(() => setOpen(v => !v), []);
    const close = useCallback(() => setOpen(false), []);
    useEffect(() => { if (lockScroll) setBodyScroll(open); return () => { if (lockScroll) setBodyScroll(false); }; }, [open, lockScroll]);
    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
        const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') close(); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
    }, [open, close]);
    return { open, toggle, close, ref };
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        setIsMobile(mq.matches);
        const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', h);
        return () => mq.removeEventListener('change', h);
    }, []);
    return isMobile;
}

const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.97, pointerEvents: 'none' as const },
    visible: { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' as const, transition: { duration: 0.18, ease: 'easeOut' as const } },
    exit: { opacity: 0, y: -6, scale: 0.97, pointerEvents: 'none' as const, transition: { duration: 0.14 } },
};
const drawerVariants = { hidden: { y: '100%', opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.32, ease: EASE } }, exit: { y: '100%', opacity: 0, transition: { duration: 0.24, ease: EASE } } };
const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } }, exit: { opacity: 0, transition: { duration: 0.18 } } };
const paletteVariants = { hidden: { opacity: 0, scale: 0.96, y: -16 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: EASE } }, exit: { opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.16 } } };

const Backdrop = ({ onClick }: { onClick: () => void }) => (
    <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClick} aria-hidden="true" />
);

const DropdownPanel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <motion.div role="menu" variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
        className={`absolute top-full mt-2 z-50 rounded-xl border border-[var(--sys-border)]/60 bg-[var(--sys-bg-primary)]/98 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)] py-1 max-w-[calc(100vw-1rem)] ${className}`}>
        {children}
    </motion.div>
);

const NavSep = () => <span aria-hidden="true" className="inline-block w-px h-4 bg-[var(--sys-border)] mx-0.5 opacity-50 shrink-0" />;

const Logo = () => (
    <a href="/" aria-label="MekeshBuilds Dashboard" className="flex items-center gap-2.5 group shrink-0 outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60">
        <motion.div whileHover={{ boxShadow: '0 0 18px rgba(255,107,44,0.6)' }} transition={{ duration: 0.25 }}
            className="relative flex w-10 h-10 items-center justify-center shrink-0 rounded-xl shadow-[0_4px_14px_rgba(255,107,44,0.45)]"
            style={{ background: 'linear-gradient(135deg, #ff6b2c 0%, #e65100 100%)' }}>
            <span className="material-icons-round text-white text-[20px]">
                dashboard_customize
            </span>
        </motion.div>
        <div className="hidden sm:flex flex-col leading-none scale-105 origin-left">
            <span className="text-[15px] font-bold text-[var(--sys-text-primary)] tracking-tight">Mekesh</span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--sys-accent)] mt-0.5">Builds</span>
        </div>
    </a>
);

const PageBreadcrumb = ({ title }: { title?: string | undefined }) => {
    if (!title) return null;
    return (
        <div className="hidden lg:flex items-center gap-1.5 text-[13px] text-[var(--sys-text-secondary)]">
            <span className="text-[var(--sys-border)] opacity-60">/</span>
            <motion.span key={title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease: EASE }}
                className="font-semibold text-[var(--sys-text-primary)] truncate max-w-[200px]">{title}</motion.span>
        </div>
    );
};

const CommandPalette = ({ onClose }: { onClose: () => void }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const filtered = query.trim().length > 0
        ? SEARCH_RESULTS.filter(r => r.label.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase()))
        : [];
    const categories = [...new Set(filtered.map(r => r.category))];

    useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); setBodyScroll(true); return () => setBodyScroll(false); }, []);

    return (
        <AnimatePresence>
            <Backdrop onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
                <motion.div variants={paletteVariants} initial="hidden" animate="visible" exit="exit"
                    className="w-full max-w-xl rounded-2xl border border-[var(--sys-border)]/60 bg-[var(--sys-bg-secondary)]/98 backdrop-blur-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.07)]">
                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--sys-accent)] to-transparent" />
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--sys-border)]/60">
                        <SearchIcon size={16} className="text-[var(--sys-text-secondary)] shrink-0" />
                        <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Escape' && onClose()}
                            placeholder="Search sections, pages, settings…"
                            className="flex-1 bg-transparent text-[14px] text-[var(--sys-text-primary)] placeholder:text-[var(--sys-text-secondary)]/50 outline-none" />
                        <kbd className="shrink-0 text-[10px] px-1.5 py-0.5 rounded border border-[var(--sys-border)] bg-[var(--sys-bg-tertiary)] text-[var(--sys-text-secondary)]">Esc</kbd>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto overscroll-contain">
                        {query.trim().length === 0 ? (
                            <div className="p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--sys-text-secondary)] px-2 mb-2 opacity-60">Quick Actions</p>
                                {QUICK_ACTIONS.map(action => (
                                    <button key={action.id} type="button" onClick={onClose}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--sys-bg-tertiary)] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60">
                                        <span className="w-6 h-6 rounded-lg bg-[var(--sys-accent)]/10 text-[var(--sys-accent)] flex items-center justify-center text-xs font-bold">{action.icon}</span>
                                        <span className="flex-1 text-left text-[13px] text-[var(--sys-text-primary)]">{action.label}</span>
                                        <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--sys-border)] bg-[var(--sys-bg-primary)] text-[var(--sys-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">{action.shortcut}</kbd>
                                    </button>
                                ))}
                            </div>
                        ) : filtered.length > 0 ? (
                            <div className="p-3 space-y-3">
                                {categories.map(cat => (
                                    <div key={cat}>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--sys-text-secondary)] px-2 mb-1.5 opacity-60">{cat}</p>
                                        {filtered.filter(r => r.category === cat).map(result => (
                                            <button key={result.id} type="button" onClick={() => { navigate(result.href); onClose(); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--sys-bg-tertiary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60">
                                                <span className="w-5 h-5 rounded border border-[var(--sys-border)] flex items-center justify-center text-[9px] text-[var(--sys-text-secondary)]">↗</span>
                                                <span className="text-[13px] text-[var(--sys-text-primary)]">{result.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-[13px] text-[var(--sys-text-secondary)]">No results for "<span className="text-[var(--sys-text-primary)]">{query}</span>"</p>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--sys-border)]/60">
                        {[{ key: '↵', label: 'select' }, { key: '↑↓', label: 'navigate' }, { key: 'Esc', label: 'close' }].map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-1">
                                <kbd className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--sys-border)] bg-[var(--sys-bg-tertiary)] text-[var(--sys-text-secondary)]">{key}</kbd>
                                <span className="text-[10px] text-[var(--sys-text-secondary)]">{label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const DesktopSearch = ({ onOpenPalette }: { onOpenPalette: () => void }) => (
    <button type="button" onClick={onOpenPalette} aria-label="Open command palette (⌘K)"
        className="w-full flex items-center gap-2.5 h-10 px-4 rounded-xl text-[14px] bg-[var(--sys-bg-tertiary)] border border-[var(--sys-border)]/60 hover:border-[var(--sys-accent)]/50 text-[var(--sys-text-secondary)] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 transition-all">
        <SearchIcon size={16} className="shrink-0 opacity-60" />
        <span className="flex-1 text-left opacity-60">Search or jump to…</span>
        <div className="flex items-center gap-0.5 shrink-0">
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-[var(--sys-text-secondary)] bg-[var(--sys-bg-primary)] rounded border border-[var(--sys-border)]">⌘</kbd>
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-[var(--sys-text-secondary)] bg-[var(--sys-bg-primary)] rounded border border-[var(--sys-border)]">K</kbd>
        </div>
    </button>
);

const MobileSearchToggle = ({ onOpenPalette }: { onOpenPalette: () => void }) => (
    <button type="button" onClick={onOpenPalette} aria-label="Open search"
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)] hover:border-[var(--sys-accent)]/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 transition-all">
        <SearchIcon size={18} />
    </button>
);

const NotificationBell = () => {
    const isMobile = useIsMobile();
    const { open, toggle, close, ref } = useDropdown(false);
    const [notifications, setNotifications] = useState(NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.read).length;

    const NotifList = () => (
        <>
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[var(--sys-border)]/60">
                <span className="text-[12px] font-bold text-[var(--sys-text-primary)] uppercase tracking-[0.12em]">Notifications</span>
                {unreadCount > 0 && <button type="button" onClick={() => setNotifications(p => p.map(n => ({ ...n, read: true })))} className="text-[11px] font-semibold text-[var(--sys-accent)] hover:opacity-80 transition-opacity">Mark all read</button>}
            </div>
            <div className="divide-y divide-[var(--sys-border)]/40">
                {notifications.map(n => (
                    <div key={n.id} onClick={() => setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--sys-bg-tertiary)] transition-colors ${!n.read ? 'bg-[var(--sys-accent)]/[0.03]' : ''}`}>
                        <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: n.read ? 'transparent' : NOTIF_COLORS[n.type], border: n.read ? '1px solid var(--sys-border)' : 'none' }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-[var(--sys-text-primary)] leading-snug">{n.msg}</p>
                            <p className="text-[11px] text-[var(--sys-text-secondary)] mt-0.5">{relativeTime(n.time)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={toggle} aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`} aria-haspopup="dialog" aria-expanded={open}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)] hover:border-[var(--sys-accent)]/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 transition-all">
                <BellIcon size={18} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[var(--sys-accent)] ring-2 ring-[var(--sys-bg-primary)] text-[10px] font-black text-white leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
            <AnimatePresence>
                {open && !isMobile && <DropdownPanel className="right-0 w-80 py-0 overflow-hidden"><NotifList /></DropdownPanel>}
                {open && isMobile && (
                    <>
                        <Backdrop onClick={close} />
                        <motion.div role="dialog" aria-label="Notifications" variants={drawerVariants} initial="hidden" animate="visible" exit="exit"
                            className="fixed bottom-0 inset-x-0 z-50 rounded-t-2xl overflow-hidden bg-[var(--sys-bg-secondary)] border-t border-[var(--sys-border)]/60 shadow-[0_-16px_48px_rgba(0,0,0,0.5)] max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-[var(--sys-border)]" /></div>
                            <NotifList />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'account' | 'seo' | 'security' | 'theme' | 'danger'>('account');

    useEffect(() => { setBodyScroll(true); return () => setBodyScroll(false); }, []);

    return (
        <AnimatePresence>
            <Backdrop onClick={onClose} />
            <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[15vh]">
                <motion.div role="dialog" aria-label="System Settings"
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="w-full max-w-3xl h-[85vh] md:h-[65vh] flex flex-col rounded-2xl overflow-hidden border border-[var(--sys-border)]/60 bg-[var(--sys-bg-secondary)]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
                >
                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--sys-accent)] to-transparent shrink-0" />

                    <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--sys-border)]/60 shrink-0">
                        <div>
                            <h2 className="text-[16px] font-bold text-[var(--sys-text-primary)]">System Settings</h2>
                            <p className="text-[12px] text-[var(--sys-text-secondary)] mt-0.5">Manage global configuration and user preferences.</p>
                        </div>
                        <button type="button" onClick={onClose} aria-label="Close settings"
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)] hover:border-[var(--sys-accent)]/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 transition-all">
                            <CloseIcon size={16} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        {/* Sidebar Tabs */}
                        <div className="w-full md:w-56 shrink-0 bg-[var(--sys-bg-primary)]/30 md:border-r border-b md:border-b-0 border-[var(--sys-border)]/60 p-4 space-y-1 overflow-x-auto md:overflow-y-auto flex md:block">
                            {(['account', 'seo', 'security', 'theme', 'danger'] as const).map((tab) => (
                                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap w-full flex items-center px-4 py-3 rounded-xl text-[14px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 ${activeTab === tab ? 'bg-[var(--sys-accent)]/10 text-[var(--sys-accent)] font-semibold' : 'text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)]'}`}>
                                    {tab === 'account' && 'Account'}
                                    {tab === 'seo' && 'SEO'}
                                    {tab === 'security' && 'Security'}
                                    {tab === 'theme' && 'Theme Studio'}
                                    {tab === 'danger' && 'Danger Zone'}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto overscroll-contain bg-[var(--sys-bg-secondary)]/20">
                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <h3 className="text-[15px] font-bold text-[var(--sys-text-primary)] mb-5">Account (Profile Information)</h3>
                                    <div className="p-5 rounded-2xl border border-[var(--sys-border)]/60 bg-[var(--sys-bg-primary)]/50">
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--sys-text-secondary)] mb-2">Features</h4>
                                        <p className="text-[14px] leading-relaxed text-[var(--sys-text-primary)] mb-6">Granular input fields for Display Name, Username, Contact Email, Phone, and City.</p>
                                        
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--sys-text-secondary)] mb-2">Functionality</h4>
                                        <p className="text-[14px] leading-relaxed text-[var(--sys-text-primary)] text-opacity-80">Forms the core identity foundation. Currently resting as a UI layout placeholder, this tab serves as the centralized zone where your fundamental Firebase User node data will be fetched and mutated, controlling how your persona is represented globally.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'seo' && (
                                <div className="space-y-6">
                                    <h3 className="text-[15px] font-bold text-[var(--sys-text-primary)] mb-5">SEO (Search Engine Optimization)</h3>
                                    <div className="p-5 rounded-2xl border border-[var(--sys-border)]/60 bg-[var(--sys-bg-primary)]/50">
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--sys-text-secondary)] mb-2">Features</h4>
                                        <p className="text-[14px] leading-relaxed text-[var(--sys-text-primary)] mb-6">Deeply constrained inputs for Page Title (Max 60 chars) and Meta Description (Max 160 chars).</p>
                                        
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--sys-text-secondary)] mb-2">Functionality</h4>
                                        <p className="text-[14px] leading-relaxed text-[var(--sys-text-primary)] text-opacity-80">Fully synchronized in real-time. It leverages advanced zod validation and react-hook-form arrays. Clicking "Save" securely streams this metadata upwards into a global Firebase document (settings/global). Immediately, the global {"<Helmet>"} wrapper intercepts this and swaps out the {"<head>"} tags natively across your entire web application structure without requiring a system refresh.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h3 className="text-[15px] font-bold text-[var(--sys-text-primary)] mb-5">Security</h3>
                                    <div className="p-5 rounded-2xl border border-[var(--sys-border)]/60 bg-[var(--sys-bg-primary)]/50">
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--sys-text-secondary)] mb-2">Features</h4>
                                        <p className="text-[14px] leading-relaxed text-[var(--sys-text-primary)] mb-6">Masked input arrays to capture Current Password, New Password, and Confirm New Password.</p>
                                        
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--sys-text-secondary)] mb-2">Functionality</h4>
                                        <p className="text-[14px] leading-relaxed text-[var(--sys-text-primary)] text-opacity-80">Represents a secure UI stub currently reserving the grid architecture where standard Firebase Authentication credential execution methods will be securely triggered to handle authentication cycling.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'theme' && (
                                <div className="space-y-6">
                                    <h3 className="text-[15px] font-bold text-[var(--sys-text-primary)] mb-5">Theme (Theme Studio Engine)</h3>
                                    <div className="p-5 rounded-2xl border border-[var(--sys-border)]/60 bg-[var(--sys-bg-primary)]/50">
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--sys-text-secondary)] mb-2">Features</h4>
                                        <ul className="list-disc list-inside text-[14px] leading-relaxed text-[var(--sys-text-primary)] mb-6 space-y-2">
                                            <li><strong className="text-[var(--sys-accent)]">Preset Modules:</strong> 6 carefully curated, distinct global aesthetics (Sunset Orange, Emerald, Slate, etc.).</li>
                                            <li><strong className="text-[var(--sys-accent)]">Custom Palette Array:</strong> Native hex color engines injecting unrestricted access to overwrite the precise Primary and Secondary accent channels.</li>
                                            <li><strong className="text-[var(--sys-accent)]">Interface Node:</strong> Simple, high-contrast binary toggles forcing your application into pure Light or Dark modes.</li>
                                            <li><strong className="text-[var(--sys-accent)]">Font Pairing Matrix:</strong> 5 elite typographical mappings (e.g. Space Grotesk / DM Sans, Poppins / Inter).</li>
                                        </ul>
                                        
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--sys-text-secondary)] mb-2">Functionality</h4>
                                        <p className="text-[14px] leading-relaxed text-[var(--sys-text-primary)] text-opacity-80">Fully Operable Global Engine. Clicking individual features instantly simulates and applies the CSS variables strictly to your local preview screen securely. Clicking robust "Apply Global Theme" commits your specific localized array into the real-time Firebase backend. Instantly, {"<GlobalSettingsSync>"} extracts those tokens and drives them directly into the root :root pseudo-class level, forcing an immediate, synchronized global UI restyle.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'danger' && (
                                <div className="space-y-6">
                                    <h3 className="text-[15px] font-bold text-red-500 mb-5">Danger Zone</h3>
                                    <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5">
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-red-500/80 mb-2">Features</h4>
                                        <p className="text-[14px] leading-relaxed text-red-500 mb-6">Master "Enable Maintenance Mode" boolean switch alongside extreme-action buttons like "Export All Data" and "Delete Account".</p>
                                        
                                        <h4 className="text-[13px] font-bold uppercase tracking-[0.1em] text-red-500/80 mb-2">Functionality</h4>
                                        <p className="text-[14px] leading-relaxed text-red-500 text-opacity-80">Structured rigorously as a visual scaffold anticipating advanced Firebase Cloud Functions. Due to the high computational destructiveness of exporting massive nested arrays or burning global Auth tokens, this zone is strictly partitioned to act as a launch pad for future server-side execution scripts.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-5 border-t border-[var(--sys-border)]/60 bg-[var(--sys-bg-primary)]/40 flex items-center justify-end gap-3 shrink-0">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-[var(--sys-border)] text-[14px] font-semibold text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:border-[var(--sys-accent)]/40 transition-all">
                            Cancel
                        </button>
                        <button type="button" onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-[var(--sys-accent)] text-white text-[14px] font-semibold hover:opacity-90 hover:shadow-[0_4px_16px_rgba(255,107,44,0.35)] transition-all">
                            Save Preferences
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const SettingsButton = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} aria-label="System Settings"
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)] hover:border-[var(--sys-accent)]/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 transition-all">
                <SettingsIcon size={18} />
            </button>
            <AnimatePresence>{open && <SettingsModal onClose={() => setOpen(false)} />}</AnimatePresence>
        </>
    );
};

const LogoutConfirmDialog = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
    useEffect(() => { setBodyScroll(true); return () => setBodyScroll(false); }, []);
    return (
        <AnimatePresence>
            <Backdrop onClick={onCancel} />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.93, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }} transition={{ duration: 0.22, ease: EASE }}
                    className="w-full max-w-sm rounded-2xl overflow-hidden border border-[var(--sys-border)]/60 bg-[var(--sys-bg-secondary)]/98 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.65)]">
                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--sys-error)] to-transparent" />
                    <div className="p-6">
                        <div className="w-12 h-12 rounded-full bg-[var(--sys-error)]/10 flex items-center justify-center mx-auto mb-4">
                            <LogOutIcon size={20} className="text-[var(--sys-error)]" />
                        </div>
                        <h3 className="text-[15px] font-bold text-[var(--sys-text-primary)] text-center mb-1.5">Confirm Sign Out</h3>
                        <p className="text-[12px] text-[var(--sys-text-secondary)] text-center leading-relaxed mb-6">You'll be signed out of Portfolio CMS. Unsaved changes may be lost.</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={onCancel}
                                className="flex-1 py-2.5 rounded-xl border border-[var(--sys-border)] text-[13px] font-semibold text-[var(--sys-text-secondary)] hover:border-[var(--sys-accent)]/50 hover:text-[var(--sys-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 transition-all">
                                Cancel
                            </button>
                            <button type="button" onClick={onConfirm}
                                className="flex-1 py-2.5 rounded-xl bg-[var(--sys-error)] text-[13px] font-semibold text-white hover:opacity-90 hover:shadow-[0_4px_16px_rgba(239,68,68,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-error)]/60 transition-all">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const AccountDropdown = () => {
    const { open, toggle, close, ref } = useDropdown();
    const [userProfile, setUserProfile] = useState<UserProfile & { location?: string; date_of_birth?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate();
    const isAuth = useAuthStore(s => s.isAuthenticated);
    const isAdmin = useAuthStore(s => s.isOwner);

    useEffect(() => {
        if (!isAuth || !isAdmin) { setLoading(false); return; }
        let mounted = true;

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                if (mounted) setLoading(false);
                return;
            }

            if (mounted) {
                setUserProfile({
                    id: user.uid,
                    full_name: user.displayName || undefined,
                    email: user.email || undefined,
                    avatar_url: user.photoURL || undefined,
                } as any);
            }

            try {
                const snap = await getDoc(doc(db, 'profiles', user.uid));
                if (!mounted) return;

                if (snap.exists()) {
                    const data = snap.data();
                    setUserProfile(prev => ({
                        ...(prev as any),
                        full_name: data.full_name || user.displayName || undefined,
                        avatar_url: user.photoURL || data.avatar_url || undefined,
                        email: user.email || data.email || undefined,
                        location: data.location_context,
                        date_of_birth: data.date_of_birth,
                    }));
                } else {
                    const fallbackSnap = await getDoc(doc(db, 'users', user.uid));
                    if (fallbackSnap.exists()) {
                        setUserProfile(prev => ({
                            ...(prev as any),
                            ...(fallbackSnap.data() as any)
                        }));
                    }
                }
            } catch (e) {
                console.error("[AdminNavbar] Profile fetch fallback triggered:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        });

        return () => { mounted = false; unsubscribe(); };
    }, [isAuth, isAdmin]);

    const handleSignOut = async () => {
        setShowLogout(false);
        try { await signOut(auth); navigate('/'); } catch { /* silent */ }
    };

    if (!isAuth) return null;

    const name = userProfile?.full_name ?? 'System User';
    const initials = loading ? '…' : getInitials(name);
    const avatarEl = userProfile?.avatar_url
        ? <img src={userProfile.avatar_url} alt={name} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #ff6b2c 0%, #e65100 100%)' }}>
            {initials}
        </div>;

    const formatDOB = (dob: string) => new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <div ref={ref} className="relative flex items-center justify-center">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggle}
                    className="flex items-center gap-2.5 rounded-xl border border-[var(--sys-border)]/60 bg-[var(--sys-bg-secondary)] py-1.5 pl-1.5 pr-3 text-[14px] font-medium text-[var(--sys-text-primary)] transition-all hover:border-[var(--sys-accent)]/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60"
                >
                    <div className="relative h-7 w-7 rounded-md overflow-hidden shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                        {avatarEl}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[var(--sys-bg-secondary)]"
                            style={{ background: 'var(--sys-success)' }} />
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none max-w-[130px]">
                        <span className="truncate w-full">{loading ? 'Loading…' : (name.split(' ')[0] ?? 'Profile')}</span>
                        {userProfile?.email && <span className="text-[10px] text-[var(--sys-text-secondary)] font-normal truncate w-full mt-1.5 opacity-80">{userProfile.email}</span>}
                    </div>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} className="material-icons-round text-[16px] text-[var(--sys-text-secondary)] shrink-0 ml-1">expand_more</motion.span>
                </motion.button>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                            className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-[var(--sys-border)]"
                            style={{ background: 'var(--sys-bg-primary)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                        >
                            <div className="relative h-16 w-full" style={{ background: 'linear-gradient(135deg, rgba(255,107,44,0.3) 0%, rgba(59,130,246,0.15) 100%)' }}>
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,107,44,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.4) 0%, transparent 50%)' }} />
                            </div>
                            <div className="px-4 pb-4">
                                <div className="-mt-7 mb-3 flex items-end justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative rounded-2xl border-2 border-[var(--sys-bg-primary)] overflow-hidden h-14 w-14 shrink-0"
                                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                                            {avatarEl}
                                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--sys-bg-primary)] bg-[var(--sys-success)]" />
                                        </div>
                                        <div className="flex flex-col pt-5">
                                            <h3 className="text-[15px] font-bold text-[var(--sys-text-primary)]">{name}</h3>
                                            {userProfile?.email && <p className="text-[11px] text-[var(--sys-text-secondary)] font-medium truncate max-w-[140px]">{userProfile.email}</p>}
                                        </div>
                                    </div>
                                    <span className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white mb-1" style={{ background: 'rgba(255,107,44,0.2)', color: 'var(--sys-accent)' }}>
                                        {isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </div>
                                {(userProfile?.location || userProfile?.date_of_birth) && (
                                    <div className="mb-3 rounded-xl border border-[var(--sys-border)]/60 bg-[var(--sys-bg-secondary)]/50 p-3 space-y-2">
                                        {userProfile.location && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-icons-round text-[14px] text-[var(--sys-text-secondary)]">location_on</span>
                                                <span className="text-[12px] text-[var(--sys-text-secondary)]">{userProfile.location}</span>
                                            </div>
                                        )}
                                        {userProfile.date_of_birth && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-icons-round text-[14px] text-[var(--sys-text-secondary)]">cake</span>
                                                <span className="text-[12px] text-[var(--sys-text-secondary)]">{formatDOB(userProfile.date_of_birth)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-0.5">
                                    {[
                                        { icon: 'person', label: 'Profile Page', action: () => navigate('/profile') },
                                        { icon: 'settings', label: 'Settings', action: () => navigate('/settings') }
                                    ].map((item) => (
                                        <motion.button key={item.label} whileHover={{ x: 2 }} onClick={() => { close(); item.action(); }}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-[var(--sys-text-secondary)] transition-colors hover:bg-[var(--sys-bg-secondary)] hover:text-[var(--sys-text-primary)]">
                                            <span className="material-icons-round text-[18px]">{item.icon}</span>{item.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-[var(--sys-border)]/60 px-4 py-3">
                                <motion.button whileHover={{ x: 2 }} onClick={() => { close(); setShowLogout(true); }}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[var(--sys-error)]/10" style={{ color: 'var(--sys-error)' }}>
                                    <span className="material-icons-round text-[16px]">logout</span>Sign out
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence>{showLogout && <LogoutConfirmDialog onConfirm={handleSignOut} onCancel={() => setShowLogout(false)} />}</AnimatePresence>
        </>
    );
};

export const Navbar = ({ onToggleSidebar, sidebarOpen, pageTitle }: NavbarProps) => {
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
        document.documentElement.getAttribute('data-mode') === 'light' ? 'light' : 'dark');

    useEffect(() => { document.documentElement.setAttribute('data-mode', themeMode); }, [themeMode]);

    useEffect(() => {
        const handler = (e: globalThis.KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(v => !v); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    return (
        <>
            <header style={{ '--navbar-h': NAVBAR_H, willChange: 'backdrop-filter' } as React.CSSProperties}
                className="fixed top-0 inset-x-0 z-50 h-[var(--navbar-h)] bg-[var(--sys-bg-primary)]/98 backdrop-blur-xl border-b border-[var(--sys-border)]/60 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--sys-accent)]/30 to-transparent" />
                <nav className="h-full px-4 md:px-6 flex items-center justify-between gap-3" aria-label="Admin navigation">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Logo />
                        <NavSep />
                        <button type="button" onClick={onToggleSidebar} aria-label="Toggle sidebar (⌘B)" aria-expanded={sidebarOpen} title="Toggle sidebar (⌘B)"
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--sys-border)]/60 shrink-0 text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)] hover:border-[var(--sys-accent)]/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 transition-all">
                            {sidebarOpen ? <SidebarCloseIcon size={18} /> : <SidebarOpenIcon size={18} />}
                        </button>
                        <PageBreadcrumb title={pageTitle} />
                    </div>
                    <div className="hidden md:block w-full max-w-md xl:max-w-xl flex-none">
                        <DesktopSearch onOpenPalette={() => setPaletteOpen(true)} />
                    </div>
                    <div className="flex items-center justify-end gap-1.5 flex-1">
                        <MobileSearchToggle onOpenPalette={() => setPaletteOpen(true)} />
                        <button type="button" onClick={() => setThemeMode(m => m === 'dark' ? 'light' : 'dark')}
                            aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--sys-border)]/60 text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)] hover:border-[var(--sys-accent)]/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 transition-all">
                            {themeMode === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                        </button>
                        <NotificationBell />
                        <SettingsButton />
                        <NavSep />
                        <AccountDropdown />
                    </div>
                </nav>
            </header>
            <AnimatePresence>{paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}</AnimatePresence>
        </>
    );
};

export default Navbar;

const SearchIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const BellIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SettingsIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>;
const LogOutIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SidebarOpenIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const SidebarCloseIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M3 6h18M3 12h12M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M17 15l-3-3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SunIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><path d="M12 3v1M12 20v1M3 12h1M20 12h1m-2.636-6.364-.707.707M6.343 17.657l-.707.707M5.636 5.636l.707.707m11.314 11.314.707.707" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const MoonIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const CloseIcon = ({ size = 16, className = '' }: IconProps) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;