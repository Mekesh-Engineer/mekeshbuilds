// src/components/guards/AuthGuard.tsx
// Redirects unauthenticated users to /admin-access.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Spinner } from '@/components/common';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sys-bg-primary">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={`/admin-access?redirectBack=${encodeURIComponent(location.pathname + location.search)}`}
                replace
            />
        );
    }

    return <>{children}</>;
};
