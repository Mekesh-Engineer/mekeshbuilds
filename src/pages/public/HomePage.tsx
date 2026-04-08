// src/pages/HomePage.tsx
// The SaaS marketing homepage. Fully static — no backend queries.
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer';
import HeroSection from '@/components/Pages/Home/HeroSection';
import MySkillSection from '@/components/Pages/Home/MySkillSection';
import ProjectSection from '@/components/Pages/Home/ProjectSection';
import BlogSection from '@/components/Pages/Home/BlogSection';
import HireMe from '@/components/Pages/Home/HiremeSection';
import TechArsenal from '@/components/Pages/Home/TechArsenalSection';
import Achievements from '@/components/Pages/Home/Achievements';
import QuantifiableImpact from '@/components/Pages/Home/QuantifiableImpact';
import TestimonialsSection from '@/components/Pages/Home/TestimonialSection';
import CTASection from '@/components/Pages/Home/Ctasection';
import MapSection from '@/components/Pages/Home/MapSection';

export const HomePage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>MekeshBuilds — Portfolio Builder for Engineers</title>
                <meta
                    name="description"
                    content="Build a stunning engineering portfolio with real-time editing, theme customization, and PDF resume export."
                />
            </Helmet>

            <Navbar />

            <main className="relative bg-sys-bg-primary text-sys-text-primary">
                <HeroSection />

                <div aria-label="Feature sections" className="relative">
                    <MySkillSection />
                    <HireMe />
                    <TechArsenal />
                    <ProjectSection />
                    <Achievements />
                    <BlogSection />
                    <QuantifiableImpact />
                    <MapSection />
                </div>

                <TestimonialsSection />
                <CTASection />
            </main>

            <Footer />
        </>
    );
};
