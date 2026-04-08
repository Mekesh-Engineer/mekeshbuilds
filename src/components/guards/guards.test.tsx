import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useAuthStore } from '@/store/authStore';

const AdminAccessProbe = () => {
    const location = useLocation();
    return <div>{`Admin Access Page${location.search}`}</div>;
};

function renderAuthGuard(initialPath: string = '/dashboard') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route
                    path="/dashboard"
                    element={
                        <AuthGuard>
                            <div>Private Content</div>
                        </AuthGuard>
                    }
                />
                <Route path="/admin-access" element={<AdminAccessProbe />} />
            </Routes>
        </MemoryRouter>,
    );
}

function renderAdminGuard() {
    return render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
                <Route
                    path="/dashboard"
                    element={
                        <AdminGuard>
                            <div>Owner Content</div>
                        </AdminGuard>
                    }
                />
                <Route path="/" element={<div>Public Home</div>} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('Route guards', () => {
    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isOwner: false,
            isLoading: false,
        });
    });

    it('AuthGuard redirects unauthenticated users to admin access with redirectBack param', () => {
        renderAuthGuard('/dashboard?tab=analytics');

        expect(screen.getByText(/Admin Access Page/)).toBeInTheDocument();
        expect(screen.getByText(/redirectBack=%2Fdashboard%3Ftab%3Danalytics/)).toBeInTheDocument();
    });

    it('AuthGuard renders children when authenticated', () => {
        useAuthStore.setState({
            isAuthenticated: true,
            isOwner: true,
            isLoading: false,
        });

        renderAuthGuard('/dashboard');

        expect(screen.getByText('Private Content')).toBeInTheDocument();
    });

    it('AdminGuard redirects authenticated non-owner users to public home', () => {
        useAuthStore.setState({
            isAuthenticated: true,
            isOwner: false,
            isLoading: false,
        });

        renderAdminGuard();

        expect(screen.getByText('Public Home')).toBeInTheDocument();
    });

    it('AdminGuard renders children for owner users', () => {
        useAuthStore.setState({
            isAuthenticated: true,
            isOwner: true,
            isLoading: false,
        });

        renderAdminGuard();

        expect(screen.getByText('Owner Content')).toBeInTheDocument();
    });
});
