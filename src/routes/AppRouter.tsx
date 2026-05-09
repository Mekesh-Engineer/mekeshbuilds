// src/routes/AppRouter.tsx
// Complete React Router v7 route tree with guards and lazy loading.
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layout wrappers
import { AdminLayout } from '@/components/layout/AdminLayout/AdminLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';

// Guards
import { AuthGuard } from '@/routes/guards/AuthGuard';
import { AdminGuard } from '@/routes/guards/AdminGuard';

// Spinner fallback for lazy
import { Spinner } from '@/components/common';

// Lazy-loaded pages — code-split for performance
// Public pages
const HomePage = lazy(() =>
    import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })),
);
const AboutPage = lazy(() =>
    import('@/pages/public/AboutPage'),
);
const ContactPage = lazy(() =>
    import('@/pages/public/ContactPage'),
);
const NotFoundPage = lazy(() =>
    import('@/pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const PublicProfilePage = lazy(() =>
    import('@/pages/public/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage })),
);

// Auth pages
const AuthCallbackPage = lazy(() =>
    import('@/pages/auth/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })),
);
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));

// Admin pages
const DashboardPage = lazy(() =>
    import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const BuilderPage = lazy(() =>
    import('@/pages/admin/BuilderPage').then((m) => ({ default: m.BuilderPage })),
);
const AnalyticsPage = lazy(() =>
    import('@/pages/admin/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const ResumeManagerPage = lazy(() =>
    import('@/pages/admin/ResumeManagerPage').then((m) => ({
        default: m.ResumeManagerPage,
    })),
);
const ProjectsManagerPage = lazy(() =>
    import('@/pages/admin/ProjectsManagerPage').then((m) => ({
        default: m.ProjectsManagerPage,
    })),
);
const ContentEditorPage = lazy(() =>
    import('@/pages/admin/ContentEditorPage').then((m) => ({
        default: m.ContentEditorPage,
    })),
);
const SettingsPage = lazy(() =>
    import('@/pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const ThemeStudioPage = lazy(() =>
    import('@/pages/admin/ThemeStudioPage').then((m) => ({
        default: m.ThemeStudioPage,
    })),
);

const SuspenseFallback = (
    <div className="flex min-h-screen items-center justify-center bg-sys-bg-primary">
        <Spinner size="lg" />
    </div>
);

function withSuspense(element: React.ReactNode) {
    return <Suspense fallback={SuspenseFallback}>{element}</Suspense>;
}

const router = createBrowserRouter([
    // Public routes
    {
        path: '/',
        element: withSuspense(<HomePage />),
        errorElement: withSuspense(<NotFoundPage />),
    },
    {
        path: '/about',
        element: withSuspense(<AboutPage />),
    },
    {
        path: '/contact',
        element: withSuspense(<ContactPage />),
    },
    {
        path: '/auth/callback',
        element: withSuspense(<AuthCallbackPage />),
    },
    {
        path: '/auth/login',
        element: withSuspense(<LoginPage />),
    },
    {
        path: '/auth/register',
        element: withSuspense(<RegisterPage />),
    },
    {
        path: '/auth/forgot-password',
        element: withSuspense(<ForgotPasswordPage />),
    },

    // Public portfolio routes
    {
        path: '/:username',
        element: <PublicLayout />,
        errorElement: withSuspense(<NotFoundPage />),
        children: [
            {
                index: true,
                element: withSuspense(<PublicProfilePage />),
            },
            // Additional public sub-pages can be added here:
            // resume, projects, skills, blog, gallery, testimonials, contact, about
        ],
    },

    // Protected admin routes
    {
        element: (
            <AuthGuard>
                <AdminGuard>
                    <AdminLayout />
                </AdminGuard>
            </AuthGuard>
        ),
        errorElement: withSuspense(<NotFoundPage />),
        children: [
            {
                path: '/dashboard',
                element: (
                    <Suspense fallback={SuspenseFallback}>
                        <DashboardPage />
                    </Suspense>
                ),
            },
            {
                path: '/builder',
                element: (
                    <Suspense fallback={SuspenseFallback}>
                        <BuilderPage />
                    </Suspense>
                ),
            },
            {
                path: '/analytics',
                element: (
                    <Suspense fallback={SuspenseFallback}>
                        <AnalyticsPage />
                    </Suspense>
                ),
            },
            {
                path: '/resume',
                element: (
                    <Suspense fallback={SuspenseFallback}>
                        <ResumeManagerPage />
                    </Suspense>
                ),
            },
            {
                path: '/projects',
                element: (
                    <Suspense fallback={SuspenseFallback}>
                        <ProjectsManagerPage />
                    </Suspense>
                ),
            },
            {
                path: '/content',
                element: (
                    <Suspense fallback={SuspenseFallback}>
                        <ContentEditorPage />
                    </Suspense>
                ),
            },
            {
                path: '/settings',
                element: (
                    <Suspense fallback={SuspenseFallback}>
                        <SettingsPage />
                    </Suspense>
                ),
            },
            {
                path: '/themes',
                element: (
                    <Suspense fallback={SuspenseFallback}>
                        <ThemeStudioPage />
                    </Suspense>
                ),
            },
        ],
    },

    // Catch-all
    {
        path: '*',
        element: withSuspense(<NotFoundPage />),
    },
]);

export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};
