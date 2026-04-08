/**
 * AdminLayout.tsx
 * ─────────────────────────────────────────────────────────────────
 * Root CMS shell — manages sidebar open/close state and passes it
 * down to Navbar (toggle button) and Sidebar (visibility).
 *
 * Structure:
 *   AdminLayout
 *     ├── Navbar          (fixed top bar — receives toggleSidebar)
 *     ├── Sidebar         (fixed left panel — receives isOpen / onClose)
 *     └── <main>          (content area — shifts right when sidebar open)
 *          └── <Outlet /> (react-router child pages)
 */

import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './AdminNavbar';
import { Sidebar } from './AdminSidebar';

export const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    return (
        <div className="min-h-screen bg-sys-bg-primary text-sys-text-primary">

            {/* ── Fixed top bar ── */}
            <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

            {/* ── Sidebar overlay backdrop (mobile) ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    aria-hidden="true"
                    onClick={closeSidebar}
                />
            )}

            {/* ── Fixed left sidebar ── */}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            {/* ── Main content — shifts right on desktop when sidebar open ── */}
            <main
                className={[
                    'transition-all duration-300 ease-in-out',
                    'pt-20',                              // navbar height (80px)
                    sidebarOpen ? 'lg:pl-60' : 'lg:pl-0', // sidebar width
                ].join(' ')}
            >
                {/* Inner scroll container */}
                <div className="h-[calc(100dvh-80px)] overflow-y-auto overflow-x-hidden
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-sys-bg-secondary
                    [&::-webkit-scrollbar-thumb]:bg-sys-accent/40
                    [&::-webkit-scrollbar-thumb]:rounded-full">

                    {/* Content wrapper */}
                    <div className="min-h-full rounded-tl-xl
                        bg-sys-bg-secondary
                        border-l border-t border-white/[0.06]">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};