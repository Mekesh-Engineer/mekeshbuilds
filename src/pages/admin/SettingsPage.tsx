// src/pages/SettingsPage.tsx
// Account configuration, SEO, security, and danger zone.
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/store/authStore';
import { Card, Button, Input } from '@/components/Shared';

type SettingsTab = 'account' | 'seo' | 'security' | 'danger';

export const SettingsPage: React.FC = () => {
    const user = useAuthStore((s) => s.user);
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    const tabs: { key: SettingsTab; label: string }[] = [
        { key: 'account', label: 'Account' },
        { key: 'seo', label: 'SEO' },
        { key: 'security', label: 'Security' },
        { key: 'danger', label: 'Danger Zone' },
    ];

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
                        <div className="max-w-lg space-y-5">
                            <Input
                                label="Page Title"
                                placeholder="Your Name — Portfolio"
                                helperText="Max 60 characters"
                            />
                            <div>
                                <label className="mb-1 block text-sm font-medium text-sys-text-primary">
                                    Meta Description
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={160}
                                    className="w-full rounded-lg border border-sys-border bg-sys-bg-primary px-4 py-2.5 text-sm text-sys-text-primary placeholder:text-sys-text-secondary focus:outline-none focus:ring-2 focus:ring-sys-accent"
                                    placeholder="A brief description of your portfolio..."
                                />
                                <p className="mt-1 text-xs text-sys-text-secondary">
                                    Max 160 characters
                                </p>
                            </div>
                            <Button>Save SEO Settings</Button>
                        </div>
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
