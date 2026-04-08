/**
 * AdminSidebar.tsx
 * ─────────────────────────────────────────────────────────────────
 * Fixed left navigation panel.
 *
 * Features:
 *  • Slides in from left; controlled by AdminLayout state
 *  • NavLink active highlighting with orange accent + glow pill
 *  • Keyboard search shortcut display (⌘K)
 *  • Collapsible nav section groups
 *  • Expandable sub-menu items
 *  • Footer: What's new, Help, Sign out
 *  • Fully dark themed — matches sys-* token system
 *  • Smooth slide animation via Framer Motion
 */

import { useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
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
    items: NavItem[];
}

// ─── Nav data ─────────────────────────────────────────────────────
const NAV_SECTIONS: NavSection[] = [
    {
        title: 'Home',
        items: [
            {
                label: 'Dashboard',
                href: '/admin',
                icon: <GridIcon />,
            },
            {
                label: 'Analytics',
                href: '/admin/analytics',
                icon: <BarChartIcon />,
                badge: 'New',
            },
        ],
    },
    {
        title: 'Content',
        items: [
            {
                label: 'Posts',
                href: '/admin/posts',
                icon: <FileTextIcon />,
                children: [
                    { label: 'All Posts', href: '/admin/posts' },
                    { label: 'Create New', href: '/admin/posts/new' },
                    { label: 'Drafts', href: '/admin/posts/drafts', badge: 4 },
                    { label: 'Published', href: '/admin/posts/published' },
                ],
            },
            {
                label: 'Projects',
                href: '/admin/projects',
                icon: <BriefcaseIcon />,
                children: [
                    { label: 'All Projects', href: '/admin/projects' },
                    { label: 'Add Project', href: '/admin/projects/new' },
                ],
            },
            {
                label: 'Skills',
                href: '/admin/skills',
                icon: <ZapIcon />,
            },
            {
                label: 'Media',
                href: '/admin/media',
                icon: <ImageIcon />,
            },
        ],
    },
    {
        title: 'Audience',
        items: [
            {
                label: 'Members',
                href: '/admin/members',
                icon: <UsersIcon />,
                badge: 128,
            },
            {
                label: 'Messages',
                href: '/admin/messages',
                icon: <MessageIcon />,
                badge: 3,
            },
        ],
    },
    {
        title: 'Settings',
        items: [
            {
                label: 'Site Settings',
                href: '/admin/settings',
                icon: <SettingsIcon />,
            },
            {
                label: 'Integrations',
                href: '/admin/integrations',
                icon: <PlugIcon />,
            },
        ],
    },
];

// ─── Animated slide variants ──────────────────────────────────────
const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.28, ease: 'easeOut' as const } },
    closed: { x: -240, transition: { duration: 0.24, ease: 'easeOut' as const } },
};

const subMenuVariants = {
    open: { height: 'auto', opacity: 1, transition: { duration: 0.22 } },
    closed: { height: 0, opacity: 0, transition: { duration: 0.18 } },
};

// ─── NavItem component ────────────────────────────────────────────
const SidebarNavItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const location = useLocation();
    const [subOpen, setSubOpen] = useState(
        // Auto-expand if a child route is active
        item.children?.some((c) => location.pathname.startsWith(c.href)) ?? false,
    );

    const hasChildren = (item.children?.length ?? 0) > 0;
    const isExactActive = location.pathname === item.href;
    const isChildActive = item.children?.some((c) => location.pathname.startsWith(c.href)) ?? false;

    const toggle = useCallback(() => setSubOpen((v) => !v), []);

    // Common inner content for leaf items
    const innerContent = (
        <>
            {depth === 0 && (
                <span className="shrink-0 opacity-60 group-[.active-link]:opacity-100
                    transition-opacity">
                    {item.icon}
                </span>
            )}
            {depth > 0 && (
                <span className={[
                    'w-1.5 h-1.5 rounded-full shrink-0 transition-all',
                    isExactActive
                        ? 'bg-sys-accent scale-125'
                        : 'bg-white/20',
                ].join(' ')} />
            )}
            <span className="flex-1 min-w-0 truncate">{item.label}</span>
            {item.badge !== undefined && (
                <span className={[
                    'shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    typeof item.badge === 'number'
                        ? 'bg-sys-accent/20 text-sys-accent'
                        : 'bg-sys-accent text-white',
                ].join(' ')}>
                    {item.badge}
                </span>
            )}
        </>
    );

    // Parent item with children
    if (hasChildren) {
        return (
            <li>
                <button
                    type="button"
                    onClick={toggle}
                    className={[
                        'group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg',
                        'text-[13px] font-medium transition-all duration-150 text-left',
                        (isChildActive || subOpen)
                            ? 'text-sys-text-primary bg-white/[0.07]'
                            : 'text-sys-text-secondary hover:text-sys-text-primary hover:bg-white/[0.05]',
                    ].join(' ')}
                >
                    <span className={[
                        'shrink-0 transition-opacity',
                        (isChildActive || subOpen) ? 'opacity-100' : 'opacity-60',
                    ].join(' ')}>
                        {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                            bg-sys-accent/20 text-sys-accent">
                            {item.badge}
                        </span>
                    )}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                        className={`shrink-0 transition-transform duration-200 opacity-40
                            ${subOpen ? 'rotate-180' : ''}`}>
                        <path d="M2 4l4 4 4-4" stroke="currentColor"
                            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <AnimatePresence initial={false}>
                    {subOpen && (
                        <motion.div
                            variants={subMenuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="overflow-hidden"
                        >
                            <ul className="mt-0.5 ms-[18px] ps-3 border-l border-white/[0.08]
                                flex flex-col gap-0.5 pb-1">
                                {item.children!.map((child) => (
                                    <SidebarNavItem key={child.href}
                                        item={{ ...child, icon: item.icon }}
                                        depth={1} />
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </li>
        );
    }

    // Leaf item
    return (
        <li>
            <NavLink
                to={item.href}
                end={item.href === '/admin'}
                className={({ isActive }) => [
                    'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg',
                    'text-[13px] font-medium transition-all duration-150',
                    isActive
                        ? 'active-link text-sys-text-primary bg-sys-accent/[0.12] text-sys-accent'
                        : 'text-sys-text-secondary hover:text-sys-text-primary hover:bg-white/[0.05]',
                ].join(' ')}
            >
                {innerContent}
            </NavLink>
        </li>
    );
};

// ─── Search bar ───────────────────────────────────────────────────
const SidebarSearch = () => (
    <button type="button"
        className="w-full flex items-center gap-2 px-2.5 h-9 rounded-lg text-[13px]
            text-sys-text-secondary
            bg-white/[0.04] border border-white/[0.07]
            hover:bg-white/[0.07] hover:border-white/[0.12]
            transition-all duration-150"
        aria-label="Search (⌘K)">
        <SearchIcon />
        <span className="flex-1 text-left">Search…</span>
        <span className="flex items-center gap-0.5 ms-auto">
            <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-white/[0.12]
                bg-white/[0.05] text-sys-text-secondary leading-none">
                ⌘
            </kbd>
            <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-white/[0.12]
                bg-white/[0.05] text-sys-text-secondary leading-none">
                K
            </kbd>
        </span>
    </button>
);

// ─── Section separator ────────────────────────────────────────────
const SectionTitle = ({ title }: { title: string }) => (
    <span className="block px-2.5 mb-1.5 mt-0.5 text-[10px] font-semibold uppercase
        tracking-[0.12em] text-sys-text-secondary opacity-40">
        {title}
    </span>
);

// ─── Sidebar footer ───────────────────────────────────────────────
const SidebarFooter = () => (
    <footer className="mt-auto pt-3 border-t border-white/[0.07] flex flex-col gap-0.5">
        {[
            { label: "What's new", icon: <FlameIcon />, href: '#' },
            { label: 'Help & support', icon: <ChatIcon />, href: '#' },
            { label: 'Knowledge Base', icon: <BookIcon />, href: '#' },
        ].map(({ label, icon, href }) => (
            <a key={label} href={href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px]
                    text-sys-text-secondary hover:text-sys-text-primary hover:bg-white/[0.05]
                    transition-all duration-150">
                <span className="opacity-50">{icon}</span>
                {label}
            </a>
        ))}

        {/* App version */}
        <div className="mt-2 px-2.5 py-2 flex items-center justify-between">
            <span className="text-[11px] text-sys-text-secondary opacity-30 font-mono">
                v1.0.0
            </span>
            <span className="text-[11px] text-sys-accent opacity-60 font-medium">
                Portfolio CMS
            </span>
        </div>
    </footer>
);

// ─── Main Sidebar ─────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => (
    <>
        {/* Desktop: always in DOM, translate into/out of view */}
        <motion.aside
            aria-label="Sidebar navigation"
            variants={sidebarVariants}
            animate={isOpen ? 'open' : 'closed'}
            initial="closed"
            className={[
                'fixed top-0 left-0 bottom-0 z-50 w-60',
                'flex flex-col pt-20',            // clear the 80px navbar
                'bg-sys-bg-primary/95 backdrop-blur-xl',
                'border-r border-white/[0.07]',
                'shadow-[2px_0_24px_rgba(0,0,0,0.4)]',
            ].join(' ')}
        >
            <div className="flex flex-col h-full overflow-hidden">

                {/* Mobile close row */}
                <div className="lg:hidden flex items-center justify-between px-3 py-3
                    border-b border-white/[0.07]">
                    <span className="text-[13px] font-bold text-sys-text-primary">Navigation</span>
                    <button type="button" onClick={onClose}
                        aria-label="Close sidebar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg
                            text-sys-text-secondary hover:text-sys-text-primary hover:bg-white/[0.07]
                            transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                {/* Scrollable nav body */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-0
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-white/10
                    [&::-webkit-scrollbar-thumb]:rounded-full">

                    {/* Search */}
                    <SidebarSearch />

                    {/* Accent line — visual rhythm */}
                    <div className="my-3 h-px bg-gradient-to-r from-sys-accent/20 via-white/5 to-transparent" />

                    {/* Nav sections */}
                    <div className="flex flex-col gap-4">
                        {NAV_SECTIONS.map((section) => (
                            <div key={section.title}>
                                <SectionTitle title={section.title} />
                                <ul className="flex flex-col gap-0.5">
                                    {section.items.map((item) => (
                                        <SidebarNavItem key={item.href} item={item} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <div className="px-3 pb-3">
                    <SidebarFooter />
                </div>
            </div>
        </motion.aside>
    </>
);

// ─── Icons ────────────────────────────────────────────────────────

function GridIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
}
function BarChartIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}
function FileTextIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
}
function BriefcaseIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
}
function ZapIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
}
function ImageIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
}
function UsersIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function MessageIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
function SettingsIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function PlugIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6l-6 6M5 19l4-4m5-5l4 4m-4-4l-1.5-1.5" /><path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" /></svg>;
}
function SearchIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function FlameIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>;
}
function ChatIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>;
}
function BookIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>;
}
function CloseIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>;
}