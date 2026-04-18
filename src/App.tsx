// src/App.tsx
// Root component — provider nesting in correct order.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AppRouter } from '@/routes/AppRouter';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GlobalSettingsSync } from '@/components/layout/GlobalSettingsSync';

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

export const App: React.FC = () => {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <GlobalSettingsSync />
                <AuthInitializer>
                    <AppRouter />
                </AuthInitializer>
            </QueryClientProvider>
        </HelmetProvider>
    );
};
