//AdminSidebar

import {
    useCallback,
    useState,
    useEffect,
} from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/client';

// ─── Types ────────────────────────────────────────────────────────
export interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    /** Optional: pass to open the navbar command palette from sidebar search */
    onOpenSearch?: () => void;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string | number;
    children?: Omit<NavItem, 'icon' | 'children'>[];
}

interface NavSection {
    title: string;
    collapsible?: boolean;
    items: NavItem[];
}

// ─── Nav data ─────────────────────────────────────────────────────
const NAV_SECTIONS: NavSection[] = [
    {
        title: 'Home',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: <GridIcon /> },
            { label: 'Analytics', href: '/analytics', icon: <BarChartIcon />, badge: 'New' },
        ],
    },
    {
        title: 'Content',
        collapsible: false,
        items: [
            { label: 'Content Editor', href: '/content', icon: <FileTextIcon /> },
            { label: 'Projects', href: '/projects', icon: <BriefcaseIcon /> },
            { label: 'Resume', href: '/resume', icon: <ZapIcon /> },
            { label: 'Builder', href: '/builder', icon: <ImageIcon /> },
        ],
    },
    {
        title: 'Communication',
        collapsible: false,
        items: [
            { label: 'Chats', href: '/chats', icon: <MessageSquareIcon />, badge: 'Live' },
            { label: 'Visitors', href: '/visitors', icon: <UsersIcon /> },
        ],
    },
    {
        title: 'Configuration',
        collapsible: true,
        items: [
            { label: 'Site Settings', href: '/settings', icon: <SettingsIcon /> }
        ],
    },
];

// ─── Animation variants ───────────────────────────────────────────
const EASE = [0.32, 0.72, 0, 1] as const;

const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { duration: 0.28, ease: EASE } },
    closed: { x: '-100%', opacity: 0, transition: { duration: 0.24, ease: EASE } },
};

const subMenuVariants = {
    open: { height: 'auto', opacity: 1, transition: { duration: 0.24, ease: EASE } },
    closed: { height: 0, opacity: 0, transition: { duration: 0.18, ease: EASE } },
};

const sectionVariants = {
    open: { height: 'auto', opacity: 1, transition: { duration: 0.22, ease: EASE } },
    closed: { height: 0, opacity: 0, transition: { duration: 0.16, ease: EASE } },
};

// ─── Nav item ─────────────────────────────────────────────────────
const SidebarNavItem = ({
    item, depth = 0,
}: { item: NavItem; depth?: number }) => {
    const location = useLocation();

    const hasChildren = (item.children?.length ?? 0) > 0;
    const isChildActive = item.children?.some(
        (c) => location.pathname.startsWith(c.href),
    ) ?? false;

    const [subOpen, setSubOpen] = useState(isChildActive);

    // Auto-open if navigating to a child
    useEffect(() => {
        if (isChildActive) setSubOpen(true);
    }, [isChildActive]);

    const toggle = useCallback(() => setSubOpen((v) => !v), []);

    // Inner content reused by both NavLink and parent button
    const iconSlot = depth === 0 ? (
        <span className="shrink-0 transition-all duration-150 text-inherit">{item.icon}</span>
    ) : (
        <span
            className={[
                'w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200',
                location.pathname === item.href
                    ? 'bg-[var(--sys-accent)] scale-125 shadow-[0_0_6px_var(--sys-accent)]'
                    : 'bg-[var(--sys-border)]',
            ].join(' ')}
        />
    );

    const badgeSlot = item.badge !== undefined && (
        <span
            className={[
                'shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none',
                typeof item.badge === 'number'
                    ? 'bg-[var(--sys-accent)]/15 text-[var(--sys-accent)] border border-[var(--sys-accent)]/25'
                    : 'bg-[var(--sys-accent)] text-white',
            ].join(' ')}
        >
            {item.badge}
        </span>
    );

    const itemBase = [
        'group relative flex items-center gap-2.5 w-full rounded-xl text-[13px] font-medium',
        'transition-all duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60 focus-visible:ring-offset-1',
        'focus-visible:ring-offset-[var(--sys-bg-primary)]',
        depth === 0 ? 'px-2.5 py-2.5' : 'pl-7 pr-2.5 py-1.5',
    ].join(' ');

    // Parent with collapsible children
    if (hasChildren) {
        const isActive = isChildActive || subOpen;
        return (
            <li>
                <button
                    type="button"
                    onClick={toggle}
                    aria-expanded={subOpen}
                    className={[
                        itemBase,
                        isActive
                            ? 'text-[var(--sys-text-primary)] bg-[var(--sys-bg-tertiary)]'
                            : 'text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)]/70',
                    ].join(' ')}
                >
                    <span className={`shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                        {item.icon}
                    </span>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {badgeSlot}
                    <ChevronIcon
                        className={[
                            'shrink-0 transition-transform duration-200',
                            subOpen ? 'rotate-180' : '',
                        ].join(' ')}
                    />
                </button>

                <AnimatePresence initial={false}>
                    {subOpen && (
                        <motion.ul
                            key="sub"
                            variants={subMenuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="overflow-hidden mt-0.5 space-y-0.5"
                        >
                            {item.children!.map((child) => (
                                <SidebarNavItem key={child.href} item={child as NavItem} depth={1} />
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </li>
        );
    }

    // Leaf item — NavLink
    return (
        <li className="relative">
            <NavLink
                to={item.href}
                aria-current={location.pathname === item.href ? 'page' : undefined}
                className={({ isActive }) =>
                    [
                        itemBase,
                        isActive
                            ? 'text-[var(--sys-accent)] bg-[var(--sys-accent)]/10'
                            : 'text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)] hover:bg-[var(--sys-bg-tertiary)]/70',
                    ].join(' ')
                }
            >
                {({ isActive }) => (
                    <>
                        {/* Active left-edge pill */}
                        {isActive && depth === 0 && (
                            <motion.span
                                layoutId="nav-active-pill"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5
                                    bg-[var(--sys-accent)] rounded-full
                                    shadow-[0_0_8px_var(--sys-accent)]"
                            />
                        )}
                        <span
                            className={[
                                'shrink-0 transition-opacity duration-150',
                                isActive ? 'opacity-100' : 'opacity-55',
                            ].join(' ')}
                        >
                            {iconSlot}
                        </span>
                        <span className="flex-1 truncate">{item.label}</span>
                        {badgeSlot}
                    </>
                )}
            </NavLink>
        </li>
    );
};

// ─── Section wrapper (with optional collapse) ─────────────────────
const NavSection = ({ section }: { section: NavSection }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div>
            <button
                type="button"
                onClick={() => section.collapsible && setCollapsed((v) => !v)}
                disabled={!section.collapsible}
                className={[
                    'w-full flex items-center justify-between px-2.5 mb-2 mt-0.5',
                    'outline-none group',
                    section.collapsible
                        ? 'cursor-pointer focus-visible:ring-1 focus-visible:ring-[var(--sys-accent)]/40 rounded'
                        : 'cursor-default',
                ].join(' ')}
                aria-expanded={section.collapsible ? !collapsed : undefined}
            >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]
                    text-[var(--sys-text-secondary)] opacity-50
                    group-hover:opacity-70 transition-opacity">
                    {section.title}
                </span>
                {section.collapsible && (
                    <ChevronIcon
                        className={`opacity-30 group-hover:opacity-60 transition-all duration-200 ${collapsed ? '-rotate-90' : ''}`}
                        size={10}
                    />
                )}
            </button>

            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.ul
                        variants={sectionVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="overflow-hidden flex flex-col gap-0.5"
                    >
                        {section.items.map((item) => (
                            <SidebarNavItem key={item.href} item={item} />
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Sidebar search button ────────────────────────────────────────
const SidebarSearch = ({ onOpenSearch }: { onOpenSearch?: (() => void) | undefined }) => (
    <button
        type="button"
        onClick={onOpenSearch}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px]
            text-[var(--sys-text-secondary)] bg-[var(--sys-bg-tertiary)]
            border border-[var(--sys-border)]/60
            hover:border-[var(--sys-accent)]/40 hover:text-[var(--sys-text-primary)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60
            transition-all duration-200 group"
        aria-label="Search (⌘K)"
    >
        <SearchIcon className="opacity-50 group-hover:opacity-80 transition-opacity" />
        <span className="flex-1 text-left opacity-60 group-hover:opacity-90 transition-opacity">
            Search…
        </span>
        <span className="flex items-center gap-0.5 shrink-0">
            <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-[var(--sys-border)]/60
                bg-[var(--sys-bg-primary)]/60 text-[var(--sys-text-secondary)] leading-none">
                ⌘
            </kbd>
            <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-[var(--sys-border)]/60
                bg-[var(--sys-bg-primary)]/60 text-[var(--sys-text-secondary)] leading-none">
                K
            </kbd>
        </span>
    </button>
);

// ─── Sidebar footer ───────────────────────────────────────────────
const SidebarFooter = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <footer className="pt-3 border-t border-[var(--sys-border)]/50 flex flex-col gap-1">
            <a
                href="#"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px]
                    text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)]
                    hover:bg-[var(--sys-bg-tertiary)]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60
                    transition-all duration-150"
            >
                <span className="opacity-50 shrink-0"><ChatIcon /></span>
                <span className="flex-1">Help & Support</span>
            </a>

            {/* Version + brand */}
            <div className="mt-2 px-2.5 py-2 flex items-center justify-between">
                <span className="text-[10px] text-[var(--sys-text-secondary)] opacity-30 font-mono">
                    v1.0.0
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full
                    bg-[var(--sys-accent)]/10 border border-[var(--sys-accent)]/20
                    text-[var(--sys-accent)] font-semibold">
                    MekeshBuilds
                </span>
            </div>

            <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] font-medium
        rounded-xl text-white 
        bg-orange-500 hover:bg-orange-600 
        dark:bg-orange-600 dark:hover:bg-orange-500
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 dark:focus-visible:ring-orange-400/60
        shadow-sm hover:shadow
        transition-all duration-150"
            >
                <span className="shrink-0"><LogOutIcon /></span>
                <span className="flex-1 text-left">Log out</span>
            </button>

        </footer>
    );
};

// ─── Main Sidebar ─────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({
    isOpen, onClose, onOpenSearch,
}) => (
    <motion.aside
        aria-label="Sidebar navigation"
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        initial="closed"
        className={[
            /* Position — sits just below fixed navbar */
            'fixed left-0 bottom-0 z-40 w-60',
            'flex flex-col',
            /* Surfaces — correct var() syntax */
            'bg-[var(--sys-bg-primary)]',
            'border-r border-[var(--sys-border)]/60',
            'shadow-[2px_0_32px_rgba(0,0,0,0.45)]',
        ].join(' ')}
        style={{ top: 'var(--navbar-h, 64px)' }}
    >
        <div className="flex flex-col h-full overflow-hidden">

            {/* ── Mobile close row ── */}
            <div className="lg:hidden flex items-center justify-between px-3 py-2.5
                border-b border-[var(--sys-border)]/50">
                <span className="text-[13px] font-bold text-[var(--sys-text-primary)]">
                    Navigation
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close navigation"
                    className="w-8 h-8 flex items-center justify-center rounded-xl
                        text-[var(--sys-text-secondary)] hover:text-[var(--sys-text-primary)]
                        hover:bg-[var(--sys-bg-tertiary)]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]/60
                        transition-colors"
                >
                    <CloseIcon />
                </button>
            </div>

            {/* ── Scrollable nav body ── */}
            <nav
                className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-0
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-[var(--sys-border)]
                    [&::-webkit-scrollbar-thumb]:rounded-full"
                aria-label="Main navigation"
            >
                {/* Search shortcut button */}
                <SidebarSearch onOpenSearch={onOpenSearch} />

                {/* Accent gradient divider */}
                <div
                    className="my-3.5 h-px"
                    style={{
                        background: 'linear-gradient(to right, var(--sys-accent), transparent)',
                        opacity: 0.18,
                    }}
                />

                {/* Nav sections */}
                <div className="flex flex-col gap-5 pb-4">
                    {NAV_SECTIONS.map((section) => (
                        <NavSection key={section.title} section={section} />
                    ))}
                </div>
            </nav>

            {/* ── Footer ── */}
            <div className="px-3 pb-3">
                <SidebarFooter />
            </div>
        </div>
    </motion.aside>
);

export default Sidebar;

// ─── Icons ────────────────────────────────────────────────────────
type IconProps = { size?: number; className?: string };

function GridIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}
function BarChartIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}
function FileTextIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    );
}
function BriefcaseIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    );
}
function ZapIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );
}
function ImageIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}
function SettingsIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function SearchIcon({ size = 14, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    );
}

function ChatIcon({ size = 14, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
    );
}

function ChevronIcon({ size = 12, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}
function CloseIcon({ size = 14, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" className={className}>
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}
function MessageSquareIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
function UsersIcon({ size = 15, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function LogOutIcon({ size = 14, className = '' }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}