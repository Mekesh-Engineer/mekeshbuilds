import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import * as authService from '@/features/auth/services/authService';
import { useNotifications } from '@/hooks/useNotifications';

vi.mock('@/features/auth/services/authService', () => ({
    signInWithEmail: vi.fn(),
    signInWithGoogle: vi.fn(),
}));

vi.mock('@/hooks/useNotifications', () => ({
    useNotifications: vi.fn(),
}));

describe('AdminAccessPage Lockout Logic', () => {
    const mockShowError = vi.fn();

    beforeEach(() => {
        vi.mocked(useNotifications).mockReturnValue({
            showError: mockShowError,
            showSuccess: vi.fn(),
            showInfo: vi.fn(),
            showWarning: vi.fn(),
        } as any);
        localStorage.clear();
        // use Fake timers won't work well with React 18 user-event, let's stick to simple logic
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
    };

    const submitForm = async () => {
        const emailInput = screen.getByPlaceholderText(/owner@mekeshbuilds.dev/i);
        const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
        const btn = screen.getByRole('button', { name: /Sign In/i });

        // Bypass userEvent for form completion speed, fireEvent handles validation well enough
        // provided we await the result
        const { fireEvent } = await import('@testing-library/react');

        fireEvent.change(emailInput, { target: { value: 'owner@mekeshbuilds.dev' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

        // wrap form submit in act
        await act(async () => {
            fireEvent.submit(btn);
        });
    };

    it('locks out exactly after 5 failed attempts', async () => {
        vi.mocked(authService.signInWithEmail).mockRejectedValue(new Error('Invalid credentials'));

        renderComponent();

        // 1
        await submitForm();
        await waitFor(() => expect(mockShowError).toHaveBeenCalledWith('Invalid credentials'));
        expect(localStorage.getItem('admin_login_failures')).toBe('1');
        mockShowError.mockClear();

        // 2
        await submitForm();
        await waitFor(() => expect(mockShowError).toHaveBeenCalledWith('Invalid credentials'));
        expect(localStorage.getItem('admin_login_failures')).toBe('2');
        mockShowError.mockClear();

        // 3
        await submitForm();
        await waitFor(() => expect(mockShowError).toHaveBeenCalledWith('Invalid credentials'));
        expect(localStorage.getItem('admin_login_failures')).toBe('3');
        mockShowError.mockClear();

        // 4
        await submitForm();
        await waitFor(() => expect(mockShowError).toHaveBeenCalledWith('Invalid credentials'));
        expect(localStorage.getItem('admin_login_failures')).toBe('4');
        mockShowError.mockClear();

        // 5
        await submitForm();
        await waitFor(() => {
            expect(mockShowError).toHaveBeenCalledWith('Too many failed attempts. Try again in 15 minutes.');
        });
        expect(localStorage.getItem('admin_login_failures')).toBeNull();
        expect(localStorage.getItem('admin_lockout_until')).not.toBeNull();
        mockShowError.mockClear();
    });
});
