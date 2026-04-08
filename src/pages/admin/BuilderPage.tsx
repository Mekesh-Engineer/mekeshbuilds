// src/pages/BuilderPage.tsx
// Core WYSIWYG editor — the hook composition pattern page.
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useThemeEngine } from '@/hooks/useThemeEngine';

// Builder forms
import { PersonalInfoForm } from '@/components/Builder/PersonalInfoForm';
import { ExperienceForm } from '@/components/Builder/ExperienceForm';
import { SkillsForm } from '@/components/Builder/SkillsForm';
import { ProjectsForm } from '@/components/Builder/ProjectsForm';
import { ThemeForm } from '@/components/Builder/ThemeForm';

// Canvas sections
import {
    HeroSection,
    AboutSection,
    TimelineSection,
    SkillsSection,
    ProjectsSection,
} from '@/components/Canvas';

type AccordionSection = 'personal' | 'experience' | 'skills' | 'projects' | 'theme';

export const BuilderPage: React.FC = () => {
    const profile = useBuilderStore((s) => s.profile);
    const experiences = useBuilderStore((s) => s.experiences);
    const skills = useBuilderStore((s) => s.skills);
    const projects = useBuilderStore((s) => s.projects);
    const activeViewport = useBuilderStore((s) => s.activeViewport);
    const setActiveViewport = useBuilderStore((s) => s.setViewport);

    const { saveStatus } = useAutoSave();
    useThemeEngine();

    const [openSection, setOpenSection] = useState<AccordionSection | null>('personal');

    const toggleSection = (section: AccordionSection) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    const themeColor = profile?.theme_color ?? '#6366F1';

    return (
        <>
            <Helmet>
                <title>Builder — MekeshBuilds</title>
            </Helmet>

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* Editor Panel */}
                <div className="w-full shrink-0 overflow-y-auto border-r border-sys-border bg-sys-bg-primary p-4 lg:w-[40vw]">
                    {/* Save Status */}
                    <div className="mb-4 flex items-center gap-2 text-xs text-sys-text-secondary">
                        <span
                            className={`h-2 w-2 rounded-full ${saveStatus === 'saved'
                                    ? 'bg-green-500'
                                    : saveStatus === 'saving'
                                        ? 'bg-yellow-500 animate-pulse'
                                        : 'bg-red-500'
                                }`}
                        />
                        {saveStatus === 'saved' && 'Saved'}
                        {saveStatus === 'saving' && 'Saving…'}
                        {saveStatus === 'unsaved' && 'Unsaved Changes'}
                    </div>

                    {/* Accordion Sections */}
                    <div className="space-y-2">
                        {([
                            { key: 'personal' as const, label: 'Personal Info', Component: PersonalInfoForm },
                            { key: 'experience' as const, label: 'Experience', Component: ExperienceForm },
                            { key: 'skills' as const, label: 'Skills & Tools', Component: SkillsForm },
                            { key: 'projects' as const, label: 'Projects', Component: ProjectsForm },
                            { key: 'theme' as const, label: 'Theme', Component: ThemeForm },
                        ]).map(({ key, label, Component }) => (
                            <div
                                key={key}
                                className="rounded-xl border border-sys-border bg-sys-bg-secondary"
                            >
                                <button
                                    onClick={() => toggleSection(key)}
                                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-sys-text-primary"
                                >
                                    <span>{label}</span>
                                    <span className="material-icons-round text-base">
                                        {openSection === key ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>
                                {openSection === key && (
                                    <div className="border-t border-sys-border px-4 py-4">
                                        <Component />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Canvas Preview Panel */}
                <div
                    id="live-canvas"
                    className={`hidden flex-1 overflow-y-auto bg-sys-bg-primary p-8 lg:block ${activeViewport === 'mobile' ? 'mx-auto max-w-93.75' : ''
                        }`}
                >
                    {/* Canvas Toolbar */}
                    <div className="mb-6 flex items-center gap-2">
                        <button
                            onClick={() => setActiveViewport('desktop')}
                            className={`rounded-lg p-2 ${activeViewport === 'desktop'
                                    ? 'bg-sys-accent/10 text-sys-accent'
                                    : 'text-sys-text-secondary'
                                }`}
                        >
                            <span className="material-icons-round text-xl">monitor</span>
                        </button>
                        <button
                            onClick={() => setActiveViewport('mobile')}
                            className={`rounded-lg p-2 ${activeViewport === 'mobile'
                                    ? 'bg-sys-accent/10 text-sys-accent'
                                    : 'text-sys-text-secondary'
                                }`}
                        >
                            <span className="material-icons-round text-xl">smartphone</span>
                        </button>
                    </div>

                    {/* Canvas Sections (prop-driven) */}
                    {profile && (
                        <>
                            <HeroSection
                                profile={profile}
                                themeColor={themeColor}
                            />
                            <AboutSection
                                bio={profile.bio}
                                location={profile.city}
                                themeColor={themeColor}
                            />
                            <TimelineSection
                                experiences={experiences}
                                themeColor={themeColor}
                            />
                            <SkillsSection skills={skills} themeColor={themeColor} />
                            <ProjectsSection projects={projects} themeColor={themeColor} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
