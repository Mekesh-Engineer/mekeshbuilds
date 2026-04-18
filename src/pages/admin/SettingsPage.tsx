// src/pages/SettingsPage.tsx
// Account configuration, SEO, security, and danger zone.
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, Button, Input } from '@/components/common';
import { useThemeEngine } from '@/hooks/useThemeEngine';

type SettingsTab = 'account' | 'seo' | 'security' | 'theme' | 'danger';

const seoSchema = z.object({
    title: z.string().max(60, "Max 60 characters"),
    metaDesc: z.string().max(160, "Max 160 characters"),
});
type SeoFormValues = z.infer<typeof seoSchema>;

export const SettingsPage: React.FC = () => {
    const user = useAuthStore((s) => s.user);
    const { settings, updateGlobalSettings } = useSettingsStore();
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    const tabs: { key: SettingsTab; label: string }[] = [
        { key: 'account', label: 'Account' },
        { key: 'seo', label: 'SEO' },
        { key: 'security', label: 'Security' },
        { key: 'theme', label: 'Theme' },
        { key: 'danger', label: 'Danger Zone' },
    ];

    const { applyTheme, applyFont, setThemeMode } = useThemeEngine();

    const presetSchemes = [
        { name: 'Sunset Orange', primary: '#FF6B2C', secondary: '#FF8A57' },
        { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#60A5FA' },
        { name: 'Emerald', primary: '#10B981', secondary: '#34D399' },
        { name: 'Amber', primary: '#F59E0B', secondary: '#FBBF24' },
        { name: 'Rose', primary: '#F43F5E', secondary: '#FB7185' },
        { name: 'Slate', primary: '#64748B', secondary: '#94A3B8' },
    ] as const;

    // Local theme state for previewing before pushing to remote
    const [previewTheme, setPreviewTheme] = useState(settings.theme);

    // React Hook Form for SEO Setup
    const {
        register: registerSeo,
        handleSubmit: handleSeoSubmit,
        reset: resetSeo,
        formState: { isSubmitting: isSubmittingSeo }
    } = useForm<SeoFormValues>({
        resolver: zodResolver(seoSchema),
        defaultValues: { title: settings.seo.title, metaDesc: settings.seo.metaDesc }
    });

    // Populate SEO form when remote settings load/update
    useEffect(() => {
        resetSeo(settings.seo);
        setPreviewTheme(settings.theme);
    }, [settings, resetSeo]);

    const onSeoSave = async (data: SeoFormValues) => {
        await updateGlobalSettings({ seo: data });
    };

    // Helper to preview locally
    const handlePresetTheme = (primary: string, secondary: string) => {
        setPreviewTheme(prev => ({ ...prev, primary, secondary }));
        applyTheme(primary, secondary);
    };

    const handleApplyGlobalTheme = async () => {
        await updateGlobalSettings({ theme: previewTheme });
    };

    return (
        <>
            <Helmet>
                <title>Settings — MekeshBuilds</title>
            </Helmet>

            <div className="space-y-8">
                <h1 className="text-2xl font-bold text-sys-text-primary">Settings</h1>

                {/* Tab Navigation */}
                <div className="flex gap-4 border-b border-sys-border">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${activeTab === tab.key
                                ? 'border-sys-accent text-sys-accent'
                                : 'border-transparent text-sys-text-secondary hover:text-sys-text-primary'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <Card>
                        <h3 className="mb-6 text-lg font-semibold text-sys-text-primary">
                            Profile Information
                        </h3>
                        <div className="max-w-lg space-y-5">
                            <Input
                                label="Display Name"
                                defaultValue={user?.fullName ?? ''}
                                placeholder="Your full name"
                            />
                            <Input
                                label="Username"
                                defaultValue={user?.username ?? ''}
                                placeholder="your-username"
                                helperText="This determines your public portfolio URL."
                            />
                            <Input
                                label="Contact Email"
                                type="email"
                                defaultValue={user?.email ?? ''}
                                placeholder="you@example.com"
                            />
                            <Input label="Phone" placeholder="+91XXXXXXXXXX" />
                            <Input label="City" placeholder="Chennai, India" />
                            <Button>Save Changes</Button>
                        </div>
                    </Card>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <Card>
                        <h3 className="mb-6 text-lg font-semibold text-sys-text-primary">
                            Search Engine Optimization
                        </h3>
                        <form onSubmit={handleSeoSubmit(onSeoSave)} className="max-w-lg space-y-5">
                            <Input
                                {...registerSeo('title')}
                                label="Page Title"
                                placeholder="Your Name — Portfolio"
                                helperText="Max 60 characters"
                            />
                            <div>
                                <label className="mb-1 block text-sm font-medium text-sys-text-primary">
                                    Meta Description
                                </label>
                                <textarea
                                    {...registerSeo('metaDesc')}
                                    rows={3}
                                    maxLength={160}
                                    className="w-full rounded-lg border border-sys-border bg-sys-bg-primary px-4 py-2.5 text-sm text-sys-text-primary placeholder:text-sys-text-secondary focus:outline-none focus:ring-2 focus:ring-sys-accent"
                                    placeholder="A brief description of your portfolio..."
                                />
                                <p className="mt-1 text-xs text-sys-text-secondary">
                                    Max 160 characters
                                </p>
                            </div>
                            <Button type="submit" disabled={isSubmittingSeo}>
                                {isSubmittingSeo ? 'Saving...' : 'Save SEO Settings'}
                            </Button>
                        </form>
                    </Card>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <Card>
                        <h3 className="mb-6 text-lg font-semibold text-sys-text-primary">
                            Security
                        </h3>
                        <div className="max-w-lg space-y-5">
                            <Input
                                label="Current Password"
                                type="password"
                                placeholder="••••••••"
                            />
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="••••••••"
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="••••••••"
                            />
                            <Button>Update Password</Button>
                        </div>
                    </Card>
                )}

                {/* Theme Tab */}
                {activeTab === 'theme' && (
                    <Card>
                        <h3 className="mb-6 text-lg font-semibold text-sys-text-primary">
                            Theme Studio
                        </h3>
                        <div className="max-w-2xl space-y-8">

                            {/* Preset Schemes */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold text-sys-text-primary">Preset Schemes</h4>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {presetSchemes.map((scheme) => (
                                        <button
                                            key={scheme.name}
                                            onClick={() => handlePresetTheme(scheme.primary, scheme.secondary)}
                                            className="rounded-xl border border-sys-border bg-sys-bg-secondary p-4 text-left transition-all hover:ring-2 hover:ring-sys-accent"
                                        >
                                            <div className="mb-2 flex gap-2">
                                                <div className="h-6 w-6 rounded-full" style={{ backgroundColor: scheme.primary }} />
                                                <div className="h-6 w-6 rounded-full" style={{ backgroundColor: scheme.secondary }} />
                                            </div>
                                            <p className="text-xs font-medium text-sys-text-primary">{scheme.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-sys-border/60" />

                            {/* Custom Colors & Mode */}
                            <div className="flex flex-col sm:flex-row gap-8">
                                <div className="flex-1">
                                    <h4 className="mb-3 text-sm font-semibold text-sys-text-primary">Custom Colors</h4>
                                    <div className="flex gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-[13px] text-sys-text-secondary">Primary</label>
                                            <input
                                                type="color"
                                                value={previewTheme.primary}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setPreviewTheme(p => ({ ...p, primary: val }));
                                                    applyTheme(val, previewTheme.secondary);
                                                }}
                                                className="h-10 w-16 cursor-pointer rounded-lg border-0 bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[13px] text-sys-text-secondary">Secondary</label>
                                            <input
                                                type="color"
                                                value={previewTheme.secondary}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setPreviewTheme(p => ({ ...p, secondary: val }));
                                                    applyTheme(previewTheme.primary, val);
                                                }}
                                                className="h-10 w-16 cursor-pointer rounded-lg border-0 bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h4 className="mb-3 text-sm font-semibold text-sys-text-primary">Interface Mode</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setPreviewTheme(p => ({ ...p, mode: 'dark' }));
                                                setThemeMode('dark');
                                            }}
                                            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${previewTheme.mode === 'dark' ? 'border-sys-accent bg-sys-accent/10 text-sys-accent' : 'border-sys-border bg-sys-bg-secondary text-sys-text-primary hover:border-sys-accent/50'}`}
                                        >Dark</button>
                                        <button
                                            onClick={() => {
                                                setPreviewTheme(p => ({ ...p, mode: 'light' }));
                                                setThemeMode('light');
                                            }}
                                            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${previewTheme.mode === 'light' ? 'border-sys-accent bg-sys-accent/10 text-sys-accent' : 'border-sys-border bg-sys-bg-secondary text-sys-text-primary hover:border-sys-accent/50'}`}
                                        >Light</button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-sys-border/60" />

                            {/* Font Pairing */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold text-sys-text-primary">Font Pairing</h4>
                                <div className="space-y-2.5">
                                    {[
                                        { id: 'inter-inter', label: 'Inter / Inter', heading: 'Inter', body: 'Inter' },
                                        { id: 'poppins-inter', label: 'Poppins / Inter', heading: 'Poppins', body: 'Inter' },
                                        { id: 'space-dm', label: 'Space Grotesk / DM Sans', heading: 'Space Grotesk', body: 'DM Sans' },
                                        { id: 'playfair-lato', label: 'Playfair Display / Lato', heading: 'Playfair Display', body: 'Lato' },
                                        { id: 'jetbrains-inter', label: 'JetBrains Mono / Inter', heading: 'JetBrains Mono', body: 'Inter' },
                                    ].map((pair) => (
                                        <button
                                            key={pair.id}
                                            onClick={() => {
                                                setPreviewTheme(p => ({ ...p, fontPrimary: pair.heading, fontSecondary: pair.body }));
                                                applyFont(pair.heading, pair.body);
                                            }}
                                            className={`w-full rounded-xl border px-4 py-3.5 text-left text-[14px] font-medium transition-colors ${previewTheme.fontPrimary === pair.heading && previewTheme.fontSecondary === pair.body ? 'border-sys-accent bg-sys-accent/5 text-sys-accent' : 'border-sys-border bg-sys-bg-secondary text-sys-text-primary hover:border-sys-accent/60'}`}
                                        >
                                            {pair.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button onClick={handleApplyGlobalTheme} className="w-full sm:w-auto">
                                    Apply Global Theme
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Danger Zone Tab */}
                {activeTab === 'danger' && (
                    <Card className="border-red-500/30">
                        <h3 className="mb-6 text-lg font-semibold text-red-400">
                            Danger Zone
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-sys-text-primary">
                                        Export All Data
                                    </p>
                                    <p className="text-xs text-sys-text-secondary">
                                        Download a JSON archive of your entire portfolio.
                                    </p>
                                </div>
                                <Button variant="secondary" size="sm">
                                    Export
                                </Button>
                            </div>
                            <div className="border-t border-sys-border" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-sys-text-primary">
                                        Delete All Content
                                    </p>
                                    <p className="text-xs text-sys-text-secondary">
                                        Remove all portfolio content. Your account will remain.
                                    </p>
                                </div>
                                <Button variant="danger" size="sm">
                                    Delete Content
                                </Button>
                            </div>
                            <div className="border-t border-sys-border" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-sys-text-primary">
                                        Delete Account
                                    </p>
                                    <p className="text-xs text-sys-text-secondary">
                                        Permanently delete your account and all data.
                                    </p>
                                </div>
                                <Button variant="danger" size="sm">
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
};
