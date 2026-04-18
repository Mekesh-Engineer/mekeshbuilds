// src/components/guards/AdminGuard.tsx
// Ensures the authenticated user is the portfolio owner.
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AdminGuardProps {
    children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isOwner = useAuthStore((s) => s.isOwner);

    if (!isAuthenticated) {
        return <Navigate to="/admin-access" replace />;
    }

    if (!isOwner) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
