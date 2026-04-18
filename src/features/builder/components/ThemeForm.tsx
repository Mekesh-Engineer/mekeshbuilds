// src/components/Builder/ThemeForm.tsx
// Builder form for theme customization (colors, fonts, mode).
import { useBuilderStore } from '@/stores/builderStore';
import { useThemeEngine } from '@/hooks/useThemeEngine';

export const ThemeForm: React.FC = () => {
    const { profile, updateProfile } = useBuilderStore();
    const { applyTheme, setThemeMode } = useThemeEngine();

    const handleColorChange = (field: 'theme_color' | 'secondary_color', value: string) => {
        updateProfile({ [field]: value });
        applyTheme(
            field === 'theme_color' ? value : (profile?.theme_color ?? '#FF6B2C'),
            field === 'secondary_color' ? value : (profile?.secondary_color ?? '#FF8A57'),
        );
    };

    const handleModeChange = (mode: 'light' | 'dark') => {
        updateProfile({ theme_mode: mode });
        setThemeMode(mode);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-sys-text-primary">
                    Primary Color
                </label>
                <input
                    type="color"
                    value={profile?.theme_color ?? '#FF6B2C'}
                    onChange={(e) => handleColorChange('theme_color', e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-lg border border-sys-border"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-sys-text-primary">
                    Secondary Color
                </label>
                <input
                    type="color"
                    value={profile?.secondary_color ?? '#FF8A57'}
                    onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-lg border border-sys-border"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-sys-text-primary">
                    Theme Mode
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleModeChange('dark')}
                        className={`flex-1 rounded-lg border px-4 py-2 text-sm ${profile?.theme_mode === 'dark'
                            ? 'border-sys-accent bg-sys-accent/10 text-sys-accent'
                            : 'border-sys-border text-sys-text-secondary'
                            }`}
                    >
                        Dark
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('light')}
                        className={`flex-1 rounded-lg border px-4 py-2 text-sm ${profile?.theme_mode === 'light'
                            ? 'border-sys-accent bg-sys-accent/10 text-sys-accent'
                            : 'border-sys-border text-sys-text-secondary'
                            }`}
                    >
                        Light
                    </button>
                </div>
            </div>
        </div>
    );
};
