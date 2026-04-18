// src/pages/PublicProfilePage.tsx
// Main public portfolio page — renders all Canvas sections.
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { Spinner } from '@/components/common';
import {
    HeroSection,
    AboutSection,
    TimelineSection,
    SkillsSection,
    ProjectsSection,
    ContactSection,
} from '@/components/Canvas';

export const PublicProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { portfolio, isLoading } = usePortfolioData(undefined, username);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sys-bg-primary">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!portfolio?.profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sys-bg-primary">
                <p className="text-sys-text-secondary">Portfolio not found.</p>
            </div>
        );
    }

    const { profile, experiences, skills, projects } = portfolio;
    const themeColor = profile.theme_color ?? '#6366F1';

    return (
        <>
            <Helmet>
                <title>
                    {profile.full_name} — Portfolio
                </title>
                <meta name="description" content={profile.meta_description ?? profile.bio ?? ''} />
            </Helmet>

            <div className="app-shell max-w-5xl py-6 sm:py-8">
                <HeroSection
                    profile={profile}
                    themeColor={themeColor}
                />
                <AboutSection
                    bio={profile.bio}
                    location={profile.city}
                    themeColor={themeColor}
                />
                {experiences && experiences.length > 0 && (
                    <TimelineSection experiences={experiences} themeColor={themeColor} />
                )}
                {skills && skills.length > 0 && (
                    <SkillsSection skills={skills} themeColor={themeColor} />
                )}
                {projects && projects.length > 0 && (
                    <ProjectsSection projects={projects} themeColor={themeColor} />
                )}
                <ContactSection themeColor={themeColor} />
            </div>
        </>
    );
};
