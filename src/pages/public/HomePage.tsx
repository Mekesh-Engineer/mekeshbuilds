import { Helmet } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer';
import HeroSection from '@/features/profile/components/home/HeroSection';
import SectionLoader from '@/components/common/SectionLoader';

// Performance enhancement: Lazy load all sections below the fold
const MySkillSection = lazy(() => import('@/features/profile/components/home/MySkillSection'));
const HireMe = lazy(() => import('@/features/profile/components/home/HiremeSection'));
const TechArsenal = lazy(() => import('@/features/profile/components/home/TechArsenalSection'));
const ProjectSection = lazy(() => import('@/features/profile/components/home/ProjectSection'));
const Achievements = lazy(() => import('@/features/profile/components/home/Achievements'));
const BlogSection = lazy(() => import('@/features/profile/components/home/BlogSection'));
const QuantifiableImpact = lazy(
  () => import('@/features/profile/components/home/QuantifiableImpact'),
);
const MapSection = lazy(() => import('@/features/profile/components/home/MapSection'));
const TestimonialsSection = lazy(
  () => import('@/features/profile/components/home/TestimonialSection'),
);
const CTASection = lazy(() => import('@/features/profile/components/home/Ctasection'));

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

      <main className="relative overflow-x-clip bg-(--sys-bg-primary) text-(--sys-text-primary)">
        {/* Hero is above the fold, loads synchronously */}
        <HeroSection />

        {/* Deferred loading wrapper for all other sections to boost TTFI */}
        <Suspense fallback={<SectionLoader />}>
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
        </Suspense>
      </main>

      <Footer />
    </>
  );
};
