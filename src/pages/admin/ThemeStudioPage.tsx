// src/pages/ThemeStudioPage.tsx
// Dedicated visual workspace for exploring portfolio aesthetics.
import { Helmet } from 'react-helmet-async';
import { useThemeEngine } from '@/hooks/useThemeEngine';
import { Button } from '@/components/common';

const presetSchemes = [
    { name: 'Sunset Orange', primary: '#FF6B2C', secondary: '#FF8A57' },
    { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#60A5FA' },
    { name: 'Emerald', primary: '#10B981', secondary: '#34D399' },
    { name: 'Amber', primary: '#F59E0B', secondary: '#FBBF24' },
    { name: 'Rose', primary: '#F43F5E', secondary: '#FB7185' },
    { name: 'Slate', primary: '#64748B', secondary: '#94A3B8' },
] as const;

export const ThemeStudioPage: React.FC = () => {
    const { applyTheme, applyFont, setThemeMode } = useThemeEngine();

    return (
        <>
            <Helmet>
                <title>Theme Studio — MekeshBuilds</title>
            </Helmet>

            <div className="flex h-[calc(100vh-4rem)] gap-6 overflow-hidden">
                {/* Controls Panel */}
                <div className="w-full shrink-0 overflow-y-auto p-4 lg:w-[40%]">
                    <h1 className="mb-6 text-2xl font-bold text-sys-text-primary">
                        Theme Studio
                    </h1>

                    {/* Preset Schemes */}
                    <h3 className="mb-3 text-sm font-semibold text-sys-text-primary">
                        Preset Schemes
                    </h3>
                    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {presetSchemes.map((scheme) => (
                            <button
                                key={scheme.name}
                                onClick={() => applyTheme(scheme.primary, scheme.secondary)}
                                className="rounded-xl border border-sys-border bg-sys-bg-secondary p-4 text-left transition-all hover:ring-2 hover:ring-sys-accent"
                            >
                                <div className="mb-2 flex gap-2">
                                    <div
                                        className="h-6 w-6 rounded-full"
                                        style={{ backgroundColor: scheme.primary }}
                                    />
                                    <div
                                        className="h-6 w-6 rounded-full"
                                        style={{ backgroundColor: scheme.secondary }}
                                    />
                                </div>
                                <p className="text-xs font-medium text-sys-text-primary">
                                    {scheme.name}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Custom Colors */}
                    <h3 className="mb-3 text-sm font-semibold text-sys-text-primary">
                        Custom Colors
                    </h3>
                    <div className="mb-8 flex gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-sys-text-secondary">
                                Primary
                            </label>
                            <input
                                type="color"
                                defaultValue="#FF6B2C"
                                onChange={(e) =>
                                    applyTheme(
                                        e.target.value,
                                        document.documentElement.style.getPropertyValue(
                                            '--color-secondary',
                                        ) || '#FF8A57',
                                    )
                                }
                                className="h-10 w-16 cursor-pointer rounded-lg border-0"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-sys-text-secondary">
                                Secondary
                            </label>
                            <input
                                type="color"
                                defaultValue="#FF8A57"
                                onChange={(e) =>
                                    applyTheme(
                                        document.documentElement.style.getPropertyValue(
                                            '--color-primary',
                                        ) || '#FF6B2C',
                                        e.target.value,
                                    )
                                }
                                className="h-10 w-16 cursor-pointer rounded-lg border-0"
                            />
                        </div>
                    </div>

                    {/* Font Pairing */}
                    <h3 className="mb-3 text-sm font-semibold text-sys-text-primary">
                        Font Pairing
                    </h3>
                    <div className="mb-8 space-y-2">
                        {[
                            { id: 'inter-inter', label: 'Inter / Inter', heading: 'Inter', body: 'Inter' },
                            { id: 'poppins-inter', label: 'Poppins / Inter', heading: 'Poppins', body: 'Inter' },
                            { id: 'space-dm', label: 'Space Grotesk / DM Sans', heading: 'Space Grotesk', body: 'DM Sans' },
                            { id: 'playfair-lato', label: 'Playfair Display / Lato', heading: 'Playfair Display', body: 'Lato' },
                            { id: 'jetbrains-inter', label: 'JetBrains Mono / Inter', heading: 'JetBrains Mono', body: 'Inter' },
                        ].map((pair) => (
                            <button
                                key={pair.id}
                                onClick={() => applyFont(pair.heading, pair.body)}
                                className="w-full rounded-lg border border-sys-border bg-sys-bg-secondary px-4 py-3 text-left text-sm text-sys-text-primary transition-colors hover:ring-2 hover:ring-sys-accent"
                            >
                                {pair.label}
                            </button>
                        ))}
                    </div>

                    {/* Mode Toggle */}
                    <h3 className="mb-3 text-sm font-semibold text-sys-text-primary">
                        Mode
                    </h3>
                    <div className="mb-8 flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setThemeMode('dark')}
                        >
                            Dark
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setThemeMode('light')}
                        >
                            Light
                        </Button>
                    </div>

                    <Button className="w-full">Apply Theme</Button>
                </div>

                {/* Scaled Canvas Preview */}
                <div className="hidden flex-1 overflow-hidden rounded-2xl border border-sys-border lg:block">
                    <div
                        id="live-canvas"
                        className="origin-top-center"
                        style={{ transform: 'scale(0.6)', transformOrigin: 'top center' }}
                    >
                        <div className="bg-sys-bg-primary p-8">
                            <p className="text-sm text-sys-text-secondary">
                                Live canvas preview renders here with your theme changes applied
                                in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
