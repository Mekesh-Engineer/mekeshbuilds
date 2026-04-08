import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
const inlineStyles = `
/* src/styles/components/blog-card.css */

.blog-card {
  position: relative;
  display: flex;
  min-height: 520px;
  flex-direction: column;
  border-radius: 2rem;
  border: 1px solid color-mix(in srgb, var(--sys-border) 65%, transparent);
  background: color-mix(in srgb, var(--sys-bg-secondary) 88%, black 12%);
  padding: 1.5rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.blog-card--active {
  border-color: color-mix(in srgb, var(--sys-accent) 45%, var(--sys-border));
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35);
}

.blog-card__media-wrap {
  position: relative;
  margin-bottom: 1.5rem;
  height: 290px;
  overflow: hidden;
  border-radius: 1.5rem;
}

.blog-card__media {
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.blog-card:hover .blog-card__media {
  transform: scale(1.05);
}

.blog-card__media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.48) 100%);
}

.blog-card__arrow {
  position: absolute;
  right: 0.75rem;
  top: 250px;
  z-index: 2;
  display: flex;
  height: 3.75rem;
  width: 3.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--sys-accent) 40%, transparent);
  background: color-mix(in srgb, var(--sys-bg-tertiary) 85%, black 15%);
  color: var(--sys-text-primary);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  transition:
    transform 0.25s ease,
    background-color 0.25s ease,
    color 0.25s ease;
}

.blog-card__arrow:hover {
  transform: scale(1.07);
  background: var(--sys-accent);
  color: #ffffff;
}

.blog-card__chip {
  align-self: flex-start;
  margin-bottom: 1rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: var(--sys-accent, #ff6b2c);
  padding: 0.42rem 0.95rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffffff;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 4px 14px rgba(255, 107, 44, 0.28);
}

.blog-card__chip:hover {
  background: #ffffff;
  color: var(--sys-accent, #ff6b2c);
  border-color: var(--sys-accent, #ff6b2c);
  box-shadow: 0 6px 18px rgba(255, 107, 44, 0.18);
}

.blog-card__meta-row {
  margin-bottom: 0.9rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.blog-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: var(--sys-text-secondary);
}

.blog-card__meta-dot {
  height: 0.45rem;
  width: 0.45rem;
  border-radius: 9999px;
  background: var(--sys-accent);
}

.blog-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-card__head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.blog-card__skill-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--sys-accent) 85%, #ff9f6d) 0%,
    var(--sys-accent, #ff6b2c) 100%
  );
  box-shadow:
    0 6px 16px rgba(255, 107, 44, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.blog-card__footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding-top: 1.1rem;
}

.blog-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: var(--sys-accent, #ff6b2c);
  color: #ffffff;
  box-shadow:
    0 8px 18px rgba(255, 107, 44, 0.38),
    0 2px 8px rgba(0, 0, 0, 0.28);
  cursor: pointer;
  transition:
    background-color 0.22s ease,
    color 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.blog-card__cta svg {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.blog-card__cta:hover {
  background: #ffffff;
  color: var(--sys-accent, #ff6b2c);
  border-color: var(--sys-accent, #ff6b2c);
  box-shadow:
    0 10px 24px rgba(255, 107, 44, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

.blog-card__cta:hover svg {
  transform: translate(1.5px, -1.5px);
}

.blog-card__cta:active {
  transform: scale(0.96);
}

.blog-card__title {
  margin: 0;
  font-size: clamp(1.3rem, 1.6vw, 1.9rem);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--sys-text-primary);
}

.blog-card__desc {
  margin: 0.75rem 0 0;
  color: var(--sys-text-secondary);
  font-size: 0.92rem;
  line-height: 1.7;
  max-width: 95%;
}

[data-mode='light'] .blog-card {
  background: color-mix(in srgb, white 95%, var(--sys-bg-secondary));
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.1);
}

[data-mode='light'] .blog-card__media-overlay {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.32) 100%);
}

@media (max-width: 1023px) {
  .blog-card {
    min-height: 490px;
    padding: 1.2rem;
  }

  .blog-card__media-wrap {
    height: 250px;
  }

  .blog-card__arrow {
    top: 214px;
    height: 3.2rem;
    width: 3.2rem;
  }
}

.blog-card--blog-post {
  min-height: auto;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.blog-card--blog-post.blog-card--active {
  border: 0;
  box-shadow: none;
}

.blog-card--blog-post .blog-card__media-wrap {
  margin-bottom: 0;
  height: auto;
  aspect-ratio: 16 / 10;
  border-radius: 1.25rem;
  box-shadow: none;
}

.blog-card--blog-post .blog-card__media-overlay {
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.15) 100%);
}

.blog-card--blog-post .blog-card__arrow {
  right: 0.75rem;
  top: 0.75rem;
  height: 2.5rem;
  width: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.blog-card--blog-post .blog-card__arrow svg {
  width: 14px;
  height: 14px;
}

.blog-card--blog-post .blog-card__arrow:hover {
  background: var(--sys-accent, #ff6b2c);
  border-color: var(--sys-accent, #ff6b2c);
  color: #fff;
}

.blog-card--blog-post .blog-card__body {
  padding-top: 1.25rem;
}

.blog-card--blog-post .blog-card__chip {
  margin-bottom: 0.75rem;
  border: 1px solid transparent;
  background: var(--sys-accent, #ff6b2c);
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
}

.blog-card--blog-post .blog-card__meta-row {
  margin-bottom: 0.75rem;
  gap: 0.85rem;
}

.blog-card--blog-post .blog-card__meta-item {
  gap: 0.45rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--sys-text-secondary);
}

.blog-card--blog-post .blog-card__meta-dot {
  width: 0.35rem;
  height: 0.35rem;
  background: var(--sys-accent, #ff6b2c);
  opacity: 0.6;
}

.blog-card--blog-post .blog-card__title {
  font-size: clamp(1.15rem, 1.35vw, 1.3rem);
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--sys-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

[data-mode='dark'] .blog-card--blog-post .blog-card__chip {
  background: var(--sys-accent, #ff6b2c);
  color: #ffffff;
  border-color: transparent;
}

[data-mode='dark'] .blog-card--blog-post .blog-card__title {
  color: var(--sys-text-primary);
}

[data-mode='dark'] .blog-card--blog-post .blog-card__meta-item {
  color: var(--sys-text-secondary);
}

@media (max-width: 1023px) {
  .blog-card--blog-post .blog-card__arrow {
    height: 2.25rem;
    width: 2.25rem;
  }

  .blog-card--blog-post .blog-card__title {
    font-size: clamp(1.05rem, 1.2vw, 1.15rem);
  }

  .blog-card--blog-post .blog-card__meta-item {
    font-size: 0.8125rem;
  }

  .blog-card--blog-post .blog-card__body {
    padding-top: 1rem;
  }
}

`;

const EASE = [0.32, 0.72, 0, 1] as const;

export interface SkillCardItem {
  id: string | number;
  title: string;
  category: string;
  description?: string;
  summary?: string;
  readTime?: string;
  tags?: string[];
  featured?: boolean;
  achievementBadge?: string;
  icon?: ReactNode;
  author?: string;
  date?: string;
  image?: string;
}

export type BlogCardItem = SkillCardItem;

interface SkillCardProps {
  item: SkillCardItem;
  isActive?: boolean;
  variant?: 'default' | 'blog-post';
}

function MetaItem({ text }: { text: string }) {
  return (
    <div className="blog-card__meta-item">
      <span className="blog-card__meta-dot" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

export default function SkillCard({ item, isActive = false, variant = 'default' }: SkillCardProps) {
  const isBlogPost = variant === 'blog-post';
  const ctaLabel = `Open ${item.title}`;

  return (
    <>
      <style>{inlineStyles}</style>
      <motion.article
        {...(!isBlogPost && { whileHover: { y: -6 } })}
        transition={{ duration: 0.3, ease: EASE }}
        className={`blog-card ${isActive ? 'blog-card--active' : ''} ${
          isBlogPost ? 'blog-card--blog-post' : ''
        }`}
      >
        {item.image && (
          <div className="blog-card__media-wrap">
            <img src={item.image} alt={item.title} className="blog-card__media" loading="lazy" />
            <div className="blog-card__media-overlay" aria-hidden="true" />
          </div>
        )}

        {isBlogPost && (
          <button
            className="blog-card__arrow"
            aria-label={ctaLabel}
            title="Open project / article"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className="blog-card__body">
          <div className="blog-card__head-row">
            {item.icon && (
              <span className="blog-card__skill-icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="blog-card__chip">{item.category}</span>
          </div>

          {(item.author || item.date) && (
            <div className="blog-card__meta-row">
              {item.author && <MetaItem text={item.author} />}
              {item.date && <MetaItem text={item.date} />}
            </div>
          )}

          {isBlogPost && (item.readTime || item.achievementBadge || item.tags?.[0]) && (
            <div className="blog-card__meta-pill-row">
              {item.readTime && <span className="blog-card__meta-pill">{item.readTime}</span>}
              {item.tags?.[0] && <span className="blog-card__meta-pill">{item.tags[0]}</span>}
              {item.achievementBadge && (
                <span className="blog-card__meta-pill blog-card__meta-pill--achievement">
                  {item.achievementBadge}
                </span>
              )}
            </div>
          )}

          <h3 className="blog-card__title">{item.title}</h3>

          {(item.summary || item.description) && (
            <p className={`blog-card__desc ${isBlogPost ? 'blog-card__summary' : ''}`}>
              {item.summary ?? item.description}
            </p>
          )}

          {!isBlogPost && (
            <div className="blog-card__footer">
              <button
                className="blog-card__cta"
                aria-label={ctaLabel}
                title="Open project / article"
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </motion.article>
    </>
  );
}
