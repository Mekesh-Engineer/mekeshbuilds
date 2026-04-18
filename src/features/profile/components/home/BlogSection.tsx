import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import BlogCard, { type BlogCardItem } from '@/components/common/SkillCard';
import { BLOG_POSTS } from '@/data/useBlogPosts';

const EASE = [0.32, 0.72, 0, 1] as const;

interface BlogSectionProps {
  posts?: BlogCardItem[];
  headingTop?: string;
  headingBottom?: string;
  ctaLabel?: string;
  onSeeAll?: () => void;
}

const ALL_CATEGORIES = 'All Topics';

function parseDate(date?: string) {
  if (!date) return 0;
  const ts = Date.parse(date);
  return Number.isNaN(ts) ? 0 : ts;
}

export default function BlogSection({
  posts = BLOG_POSTS,
  headingTop = 'Engineering',
  headingBottom = 'insights',
  ctaLabel = 'See All',
  onSeeAll,
}: BlogSectionProps) {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts],
  );

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const categoryPass = activeCategory === ALL_CATEGORIES || post.category === activeCategory;
      const featuredPass = !featuredOnly || !!post.featured;
      return categoryPass && featuredPass;
    });
    return filtered.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [activeCategory, featuredOnly, posts]);

  // Duplicate array to create a seamless infinite scroll loop
  const marqueePosts = [...visiblePosts, ...visiblePosts];

  return (
    <section
      id="blog"
      aria-label="Blog post section"
      className="relative isolate overflow-hidden bg-[var(--sys-bg-primary)] py-[clamp(4rem,8vw,7rem)] pb-[clamp(4.5rem,9vw,8rem)]"
    >
      {/* ── Ambient Orbs ── */}
      <motion.div
        animate={{ x: [-24, 24], y: [18, -18], scale: [1, 1.06] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-[8%] -top-[10%] z-0 h-[clamp(280px,40vw,560px)] w-[clamp(280px,40vw,560px)] rounded-full blur-[80px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 107, 44, 0.18) 0%, rgba(230, 81, 0, 0.08) 60%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      <motion.div
        animate={{ x: [0, 18], y: [0, -22], scale: [1, 1.04] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-[5%] bottom-[5%] z-0 h-[clamp(200px,28vw,400px)] w-[clamp(200px,28vw,400px)] rounded-full blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 107, 44, 0.1) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Noise overlay texture ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-8">
        {/* ── Header row ── */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-0 flex flex-wrap items-end justify-between gap-8 md:flex-row flex-col md:items-end items-start"
        >
          <div className="flex flex-col gap-3">
            {/* Decorative label */}
            <span
              className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--sys-accent)]"
              aria-hidden="true"
            >
              <span className="h-[2px] w-8 rounded-full bg-[var(--sys-accent)]" />
              Latest posts
              <span className="h-[2px] w-8 rounded-full bg-[var(--sys-accent)]" />
            </span>

            <h2 className="m-0 text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--sys-text-primary)]">
              {headingTop} <span className="text-[var(--sys-accent)]">{headingBottom}.</span>
            </h2>
          </div>

          <div className="flex flex-shrink-0 items-center justify-between w-full md:w-auto gap-7 pb-1">
            <div
              className="flex flex-row md:flex-col items-baseline md:items-center gap-2 md:gap-1 leading-none"
              aria-hidden="true"
            >
              <span className="text-3xl md:text-4xl text-[var(--sys-text-primary)]/15 tracking-[-0.04em]">
                {visiblePosts.length}
              </span>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--sys-text-secondary)]/50">
                articles
              </span>
            </div>

            <button
              type="button"
              onClick={onSeeAll}
              aria-label={`${ctaLabel} blog posts`}
              className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[var(--sys-accent)]/30 bg-[var(--sys-accent)]/10 px-6 py-2.5 text-[0.82rem] font-semibold tracking-wide text-[var(--sys-accent)] backdrop-blur-md transition-all duration-250 hover:-translate-y-0.5 hover:border-[var(--sys-accent)]/50 hover:bg-[var(--sys-accent)]/20 hover:shadow-[0_8px_28px_rgba(255,107,44,0.2)] active:translate-y-0"
            >
              <span>{ctaLabel}</span>
              <span
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10h12M11 5l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </motion.header>

        {/* ── Divider ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="my-12 h-[1.5px] origin-left bg-gradient-to-r from-transparent via-[var(--sys-accent)]/30 to-transparent"
          aria-hidden="true"
        />

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="-mt-3 mb-10 flex flex-wrap items-center gap-3"
          role="tablist"
          aria-label="Filter blog topics"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 hover:-translate-y-[1px]
                                ${
                                  isActive
                                    ? 'border-[var(--sys-accent)]/45 bg-[var(--sys-accent)]/15 text-[var(--sys-accent)]'
                                    : 'border-[var(--sys-border)]/80 bg-[var(--sys-bg-secondary)]/85 text-[var(--sys-text-secondary)] hover:border-[var(--sys-accent)]/35 hover:text-[var(--sys-text-primary)]'
                                }`}
              >
                {category}
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={featuredOnly}
            onClick={() => setFeaturedOnly((prev) => !prev)}
            className={`ml-0 md:ml-auto rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 hover:-translate-y-[1px]
                            ${
                              featuredOnly
                                ? 'border-[var(--sys-accent)]/45 bg-[var(--sys-accent)]/15 text-[var(--sys-accent)]'
                                : 'border-[var(--sys-border)]/80 bg-[var(--sys-bg-secondary)]/85 text-[var(--sys-text-secondary)] hover:border-[var(--sys-accent)]/35 hover:text-[var(--sys-text-primary)]'
                            }`}
          >
            Featured only
          </button>
        </motion.div>
      </div>

      {/* ── Infinite Marquee Grid ── */}
      {visiblePosts.length > 0 ? (
        <div className="relative w-full overflow-hidden py-4">
          <motion.div
            className="flex w-max gap-[clamp(1.5rem,3vw,2.5rem)] px-4 md:px-8"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: visiblePosts.length * 6, // Scales duration based on content length
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            {marqueePosts.map((post, idx) => (
              <div
                key={`${post.id}-${idx}`}
                className="group relative flex w-[85vw] min-w-[340px] max-w-[420px] shrink-0 flex-col pt-3 pl-3 sm:min-w-[400px]"
              >
                {/* Offset shadow backing — depth illusion */}
                <div
                  className="absolute inset-0 translate-x-2 translate-y-2 rounded-4xl border border-sys-border bg-linear-to-br from-sys-bg-secondary to-sys-bg-primary opacity-50 transition-transform duration-300 ease-out group-hover:translate-x-4 group-hover:translate-y-4 group-hover:rotate-1"
                  aria-hidden="true"
                />

                {/* Subtle Ordinal Background Number */}
                <span
                  className="pointer-events-none absolute -top-2 left-6 z-20 select-none text-6xl font-light text-sys-accent opacity-[0.07] transition-opacity duration-300 group-hover:opacity-15"
                  aria-hidden="true"
                >
                  {String((idx % visiblePosts.length) + 1).padStart(2, '0')}
                </span>

                {/* External BlogCard Wrapper matching Testimonial layout */}
                <div className="relative z-10 flex h-full w-full flex-col justify-between overflow-hidden rounded-4xl border border-sys-border bg-sys-bg-secondary p-6 shadow-xl shadow-black/20 transition-all duration-300">
                  <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-sys-accent via-sys-accent-light to-sys-accent opacity-80" />
                  <BlogCard item={post} variant="blog-post" />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center">
          <p className="text-sm font-semibold text-[var(--sys-text-secondary)]">
            No posts found for this filter.
          </p>
        </div>
      )}
    </section>
  );
}
