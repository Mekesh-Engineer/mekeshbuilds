// src/pages/ContentEditorPage.tsx
// CMS for blog posts, gallery items, testimonials, and about content.
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, Button } from '@/components/common';

type ContentTab = 'blog' | 'gallery' | 'testimonials' | 'about';

export const ContentEditorPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ContentTab>('blog');

    const tabs: { key: ContentTab; label: string; icon: string }[] = [
        { key: 'blog', label: 'Blog', icon: 'article' },
        { key: 'gallery', label: 'Gallery', icon: 'photo_library' },
        { key: 'testimonials', label: 'Testimonials', icon: 'format_quote' },
        { key: 'about', label: 'About', icon: 'person' },
    ];

    return (
        <>
            <Helmet>
                <title>Content Editor — MekeshBuilds</title>
            </Helmet>

            <div className="space-y-8">
                <h1 className="text-2xl font-bold text-sys-text-primary">
                    Content Editor
                </h1>

                {/* Tab Navigation */}
                <div className="flex gap-1 rounded-xl border border-sys-border bg-sys-bg-secondary p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.key
                                    ? 'bg-sys-accent/10 text-sys-accent'
                                    : 'text-sys-text-secondary hover:text-sys-text-primary'
                                }`}
                        >
                            <span className="material-icons-round text-lg">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'blog' && (
                    <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-sys-text-primary">
                                Blog Posts
                            </h3>
                            <Button size="sm">New Post</Button>
                        </div>
                        <p className="mt-4 text-sm text-sys-text-secondary">
                            No blog posts yet. Create your first post to start sharing your
                            engineering insights.
                        </p>
                    </Card>
                )}

                {activeTab === 'gallery' && (
                    <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-sys-text-primary">
                                Gallery
                            </h3>
                            <Button size="sm">Upload Images</Button>
                        </div>
                        <p className="mt-4 text-sm text-sys-text-secondary">
                            No gallery items yet. Upload images of your hardware projects,
                            prototypes, and builds.
                        </p>
                    </Card>
                )}

                {activeTab === 'testimonials' && (
                    <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-sys-text-primary">
                                Testimonials
                            </h3>
                            <Button size="sm">Add Testimonial</Button>
                        </div>
                        <p className="mt-4 text-sm text-sys-text-secondary">
                            No testimonials yet. Add endorsements from colleagues, supervisors,
                            and clients.
                        </p>
                    </Card>
                )}

                {activeTab === 'about' && (
                    <Card>
                        <h3 className="mb-4 text-lg font-semibold text-sys-text-primary">
                            About Content
                        </h3>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-sys-text-primary">
                                    Extended Bio (Markdown)
                                </label>
                                <textarea
                                    rows={12}
                                    className="w-full rounded-lg border border-sys-border bg-sys-bg-primary px-4 py-3 text-sm text-sys-text-primary placeholder:text-sys-text-secondary focus:outline-none focus:ring-2 focus:ring-sys-accent"
                                    placeholder="Write your extended bio in Markdown..."
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-sys-text-primary">
                                    Location Context (Markdown)
                                </label>
                                <textarea
                                    rows={12}
                                    className="w-full rounded-lg border border-sys-border bg-sys-bg-primary px-4 py-3 text-sm text-sys-text-primary placeholder:text-sys-text-secondary focus:outline-none focus:ring-2 focus:ring-sys-accent"
                                    placeholder="Describe your local tech scene..."
                                />
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
};
