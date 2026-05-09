import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsStore } from '@/stores/settingsStore';

export const GlobalSettingsSync: React.FC = () => {
    const { settings, initSync } = useSettingsStore();

    // Launch Realtime Sync stream on global mount
    useEffect(() => {
        initSync();
    }, [initSync]);

    // Push Firebase Theme mappings deeply natively down into the root document CSS variables globally
    useEffect(() => {
        if (!settings.theme) return;

        const root = document.documentElement;

        root.style.setProperty('--color-primary', settings.theme.primary);
        root.style.setProperty('--color-secondary', settings.theme.secondary);

        root.style.setProperty('--font-primary', settings.theme.fontPrimary);
        root.style.setProperty('--font-secondary', settings.theme.fontSecondary);

        let modeToApply = settings.theme.mode;
        if (modeToApply === 'auto') {
            const hour = new Date().getHours();
            modeToApply = (hour >= 6 && hour < 18) ? 'light' : 'dark';
        }

        root.setAttribute('data-mode', modeToApply);

        // Also persist mode to localStorage for ultra-fast startup reads before Firebase payload returns
        try {
            localStorage.setItem('mekeshbuilds-mode', settings.theme.mode);
        } catch { /* silent fallback */ }
    }, [settings.theme]);

    return (
        <Helmet>
            <title>{settings.seo.title}</title>
            <meta name="description" content={settings.seo.metaDesc} />
        </Helmet>
    );
};
