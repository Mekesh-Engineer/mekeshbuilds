// src/App.tsx
// Root component — provider nesting in correct order.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AppRouter } from '@/routes/AppRouter';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeEngine } from '@/hooks/useThemeEngine';
import { useEffect } from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Auth initializer — runs onAuthStateChange on mount
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    useAuth();
    return <>{children}</>;
};

// Applies persisted system mode (light/dark) on first render
const ThemeInitializer: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { getPersistedMode, setSystemMode } = useThemeEngine();
    useEffect(() => {
        setSystemMode(getPersistedMode());
    }, [getPersistedMode, setSystemMode]);
    return <>{children}</>;
};

export const App: React.FC = () => {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeInitializer>
                    <AuthInitializer>
                        <AppRouter />
                    </AuthInitializer>
                </ThemeInitializer>
            </QueryClientProvider>
        </HelmetProvider>
    );
};
