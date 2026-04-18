import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthGuard } from '@/routes/guards/AuthGuard';
import { AdminGuard } from '@/routes/guards/AdminGuard';
import { useAuthStore } from '@/stores/authStore';

const LoginProbe = () => {
    const location = useLocation();
    return <div>{`Login Page${location.search}`}</div>;
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
                <Route path="/auth/login" element={<LoginProbe />} />
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

    it('AuthGuard redirects unauthenticated users to login with redirectBack param', () => {
        renderAuthGuard('/dashboard?tab=analytics');

        expect(screen.getByText(/Login Page/)).toBeInTheDocument();
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
