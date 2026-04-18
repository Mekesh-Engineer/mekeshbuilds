// src/pages/AuthCallbackPage.tsx
// Handles OAuth redirect after Google sign-in.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase/client';
import { Spinner } from '@/components/common';

export const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/admin-access', { replace: true });
                return;
            }
            navigate('/dashboard', { replace: true });
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-sys-bg-primary">
            <Spinner size="lg" />
        </div>
    );
};
