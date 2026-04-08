import React, { useState } from 'react';
import TiltHoverCard from '@/components/Shared/TiltHoverCard';
import { MdWorkspacePremium } from 'react-icons/md';

const Achievements: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Certificates', 'Awards', 'Experience', 'Training', 'Education'];

  return (
    <section
      id="achievements"
      aria-label="Achievements timeline section"
      className="relative overflow-hidden isolate bg-sys-bg-primary px-6 py-20 md:px-12 md:py-28 lg:px-16 lg:py-32"
    >
      {/* Background overlay */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
                            linear-gradient(var(--sys-accent) 1px, transparent 1px),
                            linear-gradient(90deg, var(--sys-accent) 1px, transparent 1px)
                        `,
            backgroundSize: '58px 58px'
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
          style={{
            width: 'min(42rem, 82vw)',
            height: 'min(42rem, 82vw)',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--sys-accent) 28%, transparent) 0%, transparent 70%)',
            opacity: 0.28
          }}
        />
      </div>

      {/* Inner container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Shell card */}
        <div className="relative rounded-3xl border border-sys-border/70 bg-sys-bg-secondary/90 shadow-[0_20px_60px_rgba(0,0,0,0.34)] 
                    dark:bg-gradient-to-br dark:from-[#171b26] dark:via-[#1b2130] dark:to-[#20273a]
                    [&_>_]:light:bg-gradient-to-br [&_>_]:light:from-[#f5f7fb] [&_>_]:light:via-[#eff2f8] [&_>_]:light:to-[#f2f4f9]">

          {/* Header Section */}
          <div className="flex flex-col gap-3.5 max-w-3xl mx-auto items-center text-center mb-16 px-8 pt-8 md:px-16 md:pt-16">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sys-accent">
              <span className="inline-block w-7 h-0.5 rounded-full bg-sys-accent" />
              Career timeline
            </span>

            {/* Title */}
            <h2 className="m-0 font-sans text-[clamp(2.15rem,5.6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-sys-text-primary">
              My <span className="text-sys-accent">Achievements</span> Timeline
            </h2>

            {/* Subtitle */}
            <p className="m-0 max-w-2xl text-[clamp(0.95rem,1.4vw,1.08rem)] leading-relaxed text-sys-text-secondary/84">
              A journey of certifications, experience, and milestones shaping my career.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-20 px-8 md:px-16" role="tablist" aria-label="Timeline filter options">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter}
                aria-pressed={activeFilter === filter}
                className={`px-6 py-2.5 min-h-[2.6rem] rounded-full font-semibold transition-all duration-200
                                    ${activeFilter === filter
                    ? 'text-white bg-sys-accent/68 border-sys-accent/58 shadow-[0_8px_22px_rgba(255,107,44,0.24)]'
                    : 'text-sys-text-secondary bg-sys-bg-secondary/88 border-sys-border/72 hover:-translate-y-0.5 hover:text-sys-text-primary hover:border-sys-accent/38'
                  } border`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Timeline Visual Area */}
          <div className="relative rounded-xl border border-sys-border/66 bg-sys-bg-secondary/92 shadow-[0_8px_26px_rgba(0,0,0,0.2)] p-4 md:p-12 mb-16 mx-8 md:mx-16 overflow-hidden">
            {/* Bezier Curved Path */}
            <div className="absolute inset-0 pointer-events-none opacity-20 md:opacity-100">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M-50 200C150 200 350 50 600 200C850 350 1050 200 1250 200"
                  stroke="#FF7A30"
                  strokeDasharray="12 12"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* Milestone Grid */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Milestone 1 */}
              <div className="relative z-10 md:mt-32">
                <TiltHoverCard className="bg-white/[0.03] border-l-4 border-sys-accent rounded-lg p-6 shadow-2xl backdrop-blur-md">
                  <span className="text-[10px] font-black tracking-widest text-sys-accent uppercase mb-2 block">Certificate</span>
                  <h3 className="font-bold text-lg mb-1 text-sys-text-primary">Google Cloud Architect</h3>
                  <p className="text-sm font-semibold text-sys-text-secondary mb-2">Google Cloud Training</p>
                  <p className="text-xs text-sys-text-secondary/80 leading-relaxed">Advanced cloud infrastructure optimization and architectural security implementation.</p>
                  <div className="mt-4 text-[11px] font-bold text-sys-text-secondary bg-white/[0.05] px-2 py-1 rounded w-fit">2023</div>
                </TiltHoverCard>
              </div>

              {/* Milestone 2 (Featured) */}
              <div className="relative z-10">
                <TiltHoverCard className="bg-white/[0.03] border-l-4 border-amber-500 rounded-lg p-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-t border-t-white/10 relative overflow-visible backdrop-blur-md">
                  <div className="absolute -top-4 -left-4 bg-amber-500 text-white p-2 rounded-lg shadow-lg">
                    <MdWorkspacePremium className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase mb-2 block">Award</span>
                  <h3 className="font-bold text-xl mb-1 text-sys-text-primary">Developer of the Year</h3>
                  <p className="text-base font-semibold text-sys-text-secondary mb-3">Global Tech Excellence</p>
                  <p className="text-sm text-sys-text-secondary/80 leading-relaxed">Recognized for outstanding contributions to open-source UI design systems and accessibility standards.</p>
                  <div className="mt-4 text-xs font-bold text-white bg-amber-500 px-3 py-1 rounded-full w-fit">2024 • Winner</div>
                </TiltHoverCard>
              </div>

              {/* Milestone 3 */}
              <div className="relative z-10 md:mt-40">
                <TiltHoverCard className="bg-white/[0.03] border-l-4 border-blue-500 rounded-lg p-6 shadow-2xl backdrop-blur-md">
                  <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-2 block">Experience</span>
                  <h3 className="font-bold text-lg mb-1 text-sys-text-primary">Senior UI Architect</h3>
                  <p className="text-sm font-semibold text-sys-text-secondary mb-2">Vibrant Digital Studio</p>
                  <p className="text-xs text-sys-text-secondary/80 leading-relaxed">Leading design operations and frontend strategy for Fortune 500 digital transformation projects.</p>
                  <div className="mt-4 text-[11px] font-bold text-sys-text-secondary bg-white/[0.05] px-2 py-1 rounded w-fit">2021 — 2023</div>
                </TiltHoverCard>
              </div>

              {/* Milestone 4 */}
              <div className="relative z-10 md:-mt-20 md:col-start-1">
                <TiltHoverCard className="bg-white/[0.03] border-l-4 border-violet-500 rounded-lg p-6 shadow-2xl backdrop-blur-md">
                  <span className="text-[10px] font-black tracking-widest text-violet-500 uppercase mb-2 block">Education</span>
                  <h3 className="font-bold text-lg mb-1 text-sys-text-primary">Masters in HCI</h3>
                  <p className="text-sm font-semibold text-sys-text-secondary mb-2">Institute of Design Tech</p>
                  <p className="text-xs text-sys-text-secondary/80 leading-relaxed">Deep specialization in neuropsychology applied to interface design and interactive systems.</p>
                  <div className="mt-4 text-[11px] font-bold text-sys-text-secondary bg-white/[0.05] px-2 py-1 rounded w-fit">2021</div>
                </TiltHoverCard>
              </div>

              {/* Milestone 5 */}
              <div className="relative z-10 md:mt-4 md:col-start-3">
                <TiltHoverCard className="bg-white/[0.03] border-l-4 border-emerald-500 rounded-lg p-6 shadow-2xl backdrop-blur-md">
                  <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-2 block">Training</span>
                  <h3 className="font-bold text-lg mb-1 text-sys-text-primary">Scrum Master Plus</h3>
                  <p className="text-sm font-semibold text-sys-text-secondary mb-2">Agile Alliance UK</p>
                  <p className="text-xs text-sys-text-secondary/80 leading-relaxed">Certified training in high-performance team orchestration and lean product development.</p>
                  <div className="mt-4 text-[11px] font-bold text-sys-text-secondary bg-white/[0.05] px-2 py-1 rounded w-fit">2022</div>
                </TiltHoverCard>
              </div>
            </div>
          </div>

          {/* CTA Area */}
          <div className="text-center pb-8 md:pb-16 px-8 md:px-16">
            <button className="min-w-[15rem] px-10 py-5 rounded-full font-bold text-lg text-white 
                            bg-gradient-to-br from-sys-accent to-sys-accent-dark 
                            border border-transparent shadow-[0_10px_24px_rgba(255,107,44,0.25)]
                            hover:bg-gradient-to-br hover:from-sys-accent-light hover:to-sys-accent
                            hover:scale-[1.02] active:scale-95 transition-all mb-4">
              Download Full Resume PDF
            </button>
            <p className="text-sys-text-secondary text-sm font-medium">Available for freelance and permanent opportunities.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements;