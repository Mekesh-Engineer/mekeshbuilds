import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import BlogCard, { type BlogCardItem } from '@/components/Shared/SkillCard';
import { BLOG_POSTS } from '@/data/blog-posts';
const blogSectionStyles = `
/* ============================================================
   blog-section.css  —  Editorial magazine aesthetic
   Namespace: .bs (BlogSection)
   ============================================================ */
/* ── Section shell ──────────────────────────────────────────── */
.bs {
  position: relative;
  overflow: hidden;
  padding: clamp(4rem, 8vw, 7rem) 0 clamp(4.5rem, 9vw, 8rem);
  background: var(--sys-bg-primary);
  isolation: isolate;
}

/* ── Ambient orbs ───────────────────────────────────────────── */
.bs__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  will-change: transform;
  z-index: 0;
}

.bs__orb--a {
  width: clamp(280px, 40vw, 560px);
  height: clamp(280px, 40vw, 560px);
  top: -10%;
  right: -8%;
  background: radial-gradient(
    circle,
    rgba(255, 107, 44, 0.18) 0%,
    rgba(230, 81, 0, 0.08) 60%,
    transparent 100%
  );
  animation: bs-drift-a 14s ease-in-out infinite alternate;
}

.bs__orb--b {
  width: clamp(200px, 28vw, 400px);
  height: clamp(200px, 28vw, 400px);
  bottom: 5%;
  left: -5%;
  background: radial-gradient(circle, rgba(255, 107, 44, 0.1) 0%, transparent 70%);
  animation: bs-drift-b 18s ease-in-out infinite alternate;
}

.bs__orb--c {
  width: clamp(120px, 16vw, 220px);
  height: clamp(120px, 16vw, 220px);
  top: 45%;
  left: 48%;
  background: radial-gradient(circle, rgba(255, 160, 100, 0.08) 0%, transparent 70%);
  animation: bs-drift-c 22s ease-in-out infinite alternate;
}

@keyframes bs-drift-a {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(-24px, 18px) scale(1.06);
  }
}
@keyframes bs-drift-b {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(18px, -22px) scale(1.04);
  }
}
@keyframes bs-drift-c {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(-12px, 14px);
  }
}

/* ── Noise overlay texture ──────────────────────────────────── */
.bs__noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

/* ── Inner container ────────────────────────────────────────── */
.bs__inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 5vw, 4rem);
}

/* ── Header row ─────────────────────────────────────────────── */
.bs__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 0;
}

/* ── Heading wrap ───────────────────────────────────────────── */
.bs__heading-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* ── Eyebrow label ──────────────────────────────────────────── */
.bs__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;

  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sys-accent, #ff6b2c);
  opacity: 0.9;
}

.bs__eyebrow-line {
  display: inline-block;
  width: 28px;
  height: 1.5px;
  background: var(--sys-accent, #ff6b2c);
  border-radius: 2px;
}

/* ── Main title ─────────────────────────────────────────────── */
.bs__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.bs__title-top {
  font-size: clamp(2rem, 4.5vw, 3.4rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  color: color-mix(in srgb, var(--sys-text-primary) 45%, transparent);
}

.bs__title-bottom {
  font-size: clamp(2.6rem, 6vw, 4.8rem);
  font-weight: 700;
  font-style: italic;
  letter-spacing: -0.03em;
  color: var(--sys-text-primary);
  /* Subtle gradient on the display word */
  background: linear-gradient(135deg, #fff 30%, rgba(255, 107, 44, 0.75) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Floating accent chip ───────────────────────────────────── */
.bs__accent-chip {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.75rem;
  border-radius: 100px;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--sys-accent, #ff6b2c);
  background: rgba(255, 107, 44, 0.1);
  border: 1px solid rgba(255, 107, 44, 0.2);
  backdrop-filter: blur(8px);
  /* Subtle float animation */
  animation: bs-float 5s ease-in-out infinite;
}

@keyframes bs-float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* ── Header right cluster ───────────────────────────────────── */
.bs__header-right {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex-shrink: 0;
  padding-bottom: 0.25rem;
}

/* ── Article count badge ────────────────────────────────────── */
.bs__count-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  gap: 0.2rem;
}

.bs__count-number {
  font-size: 2.4rem;
  font-weight: 400;
  color: color-mix(in srgb, var(--sys-text-primary) 14%, transparent);
  letter-spacing: -0.04em;
  line-height: 1;
}

.bs__count-label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: color-mix(in srgb, var(--sys-text-secondary) 50%, transparent);
}

/* ── CTA button ─────────────────────────────────────────────── */
.bs__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 1.4rem 0.65rem 1.6rem;
  border-radius: 100px;
  background: rgba(255, 107, 44, 0.1);
  border: 1px solid rgba(255, 107, 44, 0.3);
  color: var(--sys-accent, #ff6b2c);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.22s ease,
    box-shadow 0.25s ease;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}

.bs__cta:hover {
  background: rgba(255, 107, 44, 0.18);
  border-color: rgba(255, 107, 44, 0.55);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(255, 107, 44, 0.2);
}

.bs__cta:active {
  transform: translateY(0);
}

.bs__cta-arrow {
  display: flex;
  align-items: center;
  transition: transform 0.22s ease;
}

.bs__cta-arrow svg {
  width: 16px;
  height: 16px;
}

.bs__cta:hover .bs__cta-arrow {
  transform: translateX(3px);
}

/* ── Divider ────────────────────────────────────────────────── */
.bs__divider {
  height: 1.5px;
  margin: 3rem 0 3.5rem;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 107, 44, 0.3) 30%,
    rgba(255, 255, 255, 0.08) 70%,
    transparent 100%
  );
  transform-origin: left center;
}

/* ── Filter row ────────────────────────────────────────────── */
.bs__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
  margin: -0.8rem 0 2.2rem;
}

.bs__filter-chip,
.bs__featured-toggle {
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--sys-border) 78%, transparent);
  background: color-mix(in srgb, var(--sys-bg-secondary) 86%, transparent);
  color: var(--sys-text-secondary);
  padding: 0.5rem 0.95rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition:
    color 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease,
    transform 0.2s ease;
}

.bs__featured-toggle {
  margin-left: auto;
}

.bs__filter-chip:hover,
.bs__featured-toggle:hover {
  color: var(--sys-text-primary);
  border-color: color-mix(in srgb, var(--sys-accent) 35%, var(--sys-border));
  transform: translateY(-1px);
}

.bs__filter-chip.is-active,
.bs__featured-toggle.is-active {
  background: color-mix(in srgb, var(--sys-accent) 14%, transparent);
  color: var(--sys-accent);
  border-color: color-mix(in srgb, var(--sys-accent) 44%, transparent);
}

/* ── Card grid ──────────────────────────────────────────────── */
.bs__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(2rem, 3vw, 2.5rem);
  align-items: start;
}

/* ── Card wrapper — testimonial-inspired offset shadow ──────── */
.bs__card-wrap {
  position: relative;
  padding-top: 0.5rem;
  padding-left: 0.5rem;
}

/* Offset shadow backing — depth illusion from testimonial cards */
.bs__card-shadow {
  position: absolute;
  inset: 0;
  border-radius: 2rem;
  border: 1px solid color-mix(in srgb, var(--sys-border) 50%, transparent);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--sys-bg-secondary) 80%, transparent),
    color-mix(in srgb, var(--sys-bg-primary) 80%, transparent)
  );
  opacity: 0.5;
  pointer-events: none;
  transform: translate(0.5rem, 0.5rem);
  transition:
    transform 0.35s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.35s ease;
}

.bs__card-wrap:hover .bs__card-shadow {
  transform: translate(1rem, 1rem) rotate(1deg);
  opacity: 0.65;
}

.bs__card-index {
  position: absolute;
  top: -0.4rem;
  left: 1.25rem;
  z-index: 10;
  font-size: 4.5rem;
  font-weight: 400;
  line-height: 1;
  color: rgba(255, 107, 44, 0.07);
  pointer-events: none;
  user-select: none;
  letter-spacing: -0.06em;
  transition: color 0.35s ease;
}

.bs__card-wrap:hover .bs__card-index {
  color: rgba(255, 107, 44, 0.15);
}

/* ────────────────────────────────────────────────────────────
   BlogCard overrides — variant: blog-post
   Testimonial-inspired: offset shadow, accent bar, sys tokens
   ─────────────────────────────────────────────────────────── */

/* Card surface — rounded, bordered, elevated like testimonial */
.bs__card-wrap .blog-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border-radius: 2rem;
  border: 1px solid color-mix(in srgb, var(--sys-border) 70%, transparent);
  background: var(--sys-bg-secondary);
  padding: 1.5rem;
  cursor: pointer;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.2),
    0 0 0 0 transparent;
  transition:
    box-shadow 0.35s cubic-bezier(0.32, 0.72, 0, 1),
    border-color 0.35s ease,
    background 0.35s ease;
  will-change: transform;
}

/* Top accent gradient bar — testimonial signature */
.bs__card-wrap .blog-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--sys-accent, #ff6b2c),
    color-mix(in srgb, var(--sys-accent, #ff6b2c) 55%, white 45%),
    var(--sys-accent, #ff6b2c)
  );
  opacity: 0.8;
  z-index: 3;
  transition: opacity 0.3s ease;
}

/* Hover — shadow expansion + accent border glow */
.bs__card-wrap:hover .blog-card {
  border-color: color-mix(in srgb, var(--sys-accent) 40%, var(--sys-border));
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.25),
    0 0 0 1px color-mix(in srgb, var(--sys-accent) 15%, transparent);
}

.bs__card-wrap:hover .blog-card::before {
  opacity: 1;
}

/* Image container — inner rounded, bordered */
.bs__card-wrap .blog-card__media-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid color-mix(in srgb, var(--sys-border) 50%, transparent);
  margin-bottom: 0;
}

/* Smooth zoom on hover */
.bs__card-wrap .blog-card__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.32, 0.72, 0, 1);
}

.bs__card-wrap:hover .blog-card__media {
  transform: scale(1.08);
}

/* Gradient overlay for image balance */
.bs__card-wrap .blog-card__media-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.28) 100%);
}

/* Arrow — compact glass button, top-right inside image */
.bs__card-wrap .blog-card__arrow {
  position: absolute;
  right: 2.25rem;
  top: 2.25rem;
  z-index: 3;
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.3s cubic-bezier(0.32, 0.72, 0, 1),
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    color 0.25s ease;
}

.bs__card-wrap .blog-card__arrow svg {
  width: 14px;
  height: 14px;
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

/* Arrow hover — accent glow + micro-translation */
.bs__card-wrap:hover .blog-card__arrow {
  background: var(--sys-accent, #ff6b2c);
  border-color: transparent;
  color: #fff;
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(255, 107, 44, 0.35);
}

.bs__card-wrap:hover .blog-card__arrow svg {
  transform: translate(1px, -1px);
}

/* Content body — 8px spacing grid */
.bs__card-wrap .blog-card__body {
  display: flex;
  flex-direction: column;
  padding-top: 1.25rem;
}

/* Category chip — accent-tinted pill */
.bs__card-wrap .blog-card__chip {
  align-self: flex-start;
  margin-bottom: 0.75rem;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  background: rgba(255, 107, 44, 0.1);
  border: 1px solid rgba(255, 107, 44, 0.2);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--sys-accent, #ff6b2c);
  transition:
    background 0.25s ease,
    border-color 0.25s ease;
}

.bs__card-wrap:hover .blog-card__chip {
  background: rgba(255, 107, 44, 0.16);
  border-color: rgba(255, 107, 44, 0.32);
}

/* Metadata row — consistent spacing, 14px */
.bs__card-wrap .blog-card__meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-bottom: 0.75rem;
  padding: 0;
  border-top: none;
}

.bs__card-wrap .blog-card__meta-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.8rem;
}

.bs__card-wrap .blog-card__meta-pill {
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--sys-border) 78%, transparent);
  background: color-mix(in srgb, var(--sys-bg-primary) 70%, transparent);
  color: var(--sys-text-secondary);
  padding: 0.2rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.bs__card-wrap .blog-card__meta-pill--achievement {
  border-color: color-mix(in srgb, var(--sys-accent) 36%, transparent);
  color: var(--sys-accent);
}

.bs__card-wrap .blog-card__summary {
  margin-top: 0.7rem;
  font-size: 0.93rem;
  line-height: 1.7;
  color: var(--sys-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bs__card-wrap .blog-card__meta-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--sys-text-secondary);
  transition: color 0.25s ease;
}

.bs__card-wrap:hover .blog-card__meta-item {
  color: color-mix(in srgb, var(--sys-text-secondary) 85%, var(--sys-accent));
}

.bs__card-wrap .blog-card__meta-dot {
  width: 0.35rem;
  height: 0.35rem;
  background: var(--sys-accent, #ff6b2c);
  opacity: 0.6;
}

/* Blog title — semi-bold, clamped to 2 lines */
.bs__card-wrap .blog-card__title {
  font-size: clamp(1.15rem, 1.35vw, 1.3rem);
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.015em;
  color: var(--sys-text-primary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.25s ease;
}

.bs__card-wrap:hover .blog-card__title {
  color: var(--sys-accent, #ff6b2c);
}

/* Read-more hint — slides in on hover */
.bs__card-wrap .blog-card::after {
  content: 'Read article →';
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--sys-accent, #ff6b2c);
  opacity: 0;
  transform: translateX(-8px);
  transition:
    opacity 0.3s ease 0.08s,
    transform 0.3s cubic-bezier(0.32, 0.72, 0, 1) 0.08s;
  padding: 0.75rem 0 0;
}

.bs__card-wrap:hover .blog-card::after {
  opacity: 1;
  transform: translateX(0);
}

/* ── Responsive breakpoints ─────────────────────────────────── */

/* Tablet: 2 columns */
@media (max-width: 1024px) {
  .bs__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bs__title-top {
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  }

  .bs__title-bottom {
    font-size: clamp(2.2rem, 5vw, 3.6rem);
  }

  .bs__card-wrap .blog-card {
    padding: 1.25rem;
  }
}

/* Tablet portrait: still 2 col but tighter */
@media (max-width: 768px) {
  .bs__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .bs__header-right {
    width: 100%;
    justify-content: space-between;
  }

  .bs__count-badge {
    flex-direction: row;
    align-items: baseline;
    gap: 0.4rem;
  }

  .bs__count-number {
    font-size: 1.6rem;
  }

  .bs__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .bs__featured-toggle {
    margin-left: 0;
  }

  .bs__card-wrap .blog-card {
    padding: 1rem;
    border-radius: 1.5rem;
  }

  .bs__card-shadow {
    border-radius: 1.5rem;
  }

  .bs__card-wrap .blog-card__media-wrap {
    border-radius: 1rem;
  }
}

/* Mobile: single column */
@media (max-width: 540px) {
  .bs__grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .bs__filters {
    margin: -1rem 0 1.8rem;
  }

  .bs__card-index {
    font-size: 3.5rem;
    top: -0.5rem;
  }

  .bs__card-wrap {
    padding-top: 0.35rem;
    padding-left: 0.35rem;
  }

  .bs__card-shadow {
    transform: translate(0.35rem, 0.35rem);
  }

  .bs__card-wrap:hover .bs__card-shadow {
    transform: translate(0.65rem, 0.65rem) rotate(1deg);
  }

  .bs__orb--a {
    width: 220px;
    height: 220px;
  }

  .bs__orb--b {
    width: 160px;
    height: 160px;
  }
}

/* ── Reduced motion ─────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .bs__orb,
  .bs__accent-chip {
    animation: none;
  }

  .bs__card-wrap .blog-card,
  .bs__card-wrap .blog-card::before,
  .bs__card-wrap .blog-card::after,
  .bs__card-wrap .blog-card__media,
  .bs__card-wrap .blog-card__arrow,
  .bs__card-wrap .blog-card__arrow svg,
  .bs__card-wrap .blog-card__chip,
  .bs__card-wrap .blog-card__title,
  .bs__card-wrap .blog-card__meta-item,
  .bs__card-shadow,
  .bs__cta,
  .bs__cta-arrow {
    transition: none;
  }
}

/* ── Light mode ─────────────────────────────────────────────── */
[data-mode='light'] .bs__title-bottom {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--sys-text-primary) 95%, white 5%) 20%,
    color-mix(in srgb, var(--sys-accent) 65%, var(--sys-text-primary) 35%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-mode='light'] .bs__card-shadow {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--sys-bg-secondary) 90%, transparent),
    color-mix(in srgb, var(--sys-bg-primary) 90%, transparent)
  );
  border-color: color-mix(in srgb, var(--sys-border) 40%, transparent);
  opacity: 0.6;
}

[data-mode='light'] .bs__card-wrap .blog-card {
  background: color-mix(in srgb, white 95%, var(--sys-bg-secondary));
  border-color: color-mix(in srgb, var(--sys-border) 55%, transparent);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 10px 28px rgba(0, 0, 0, 0.06);
}

[data-mode='light'] .bs__card-wrap:hover .blog-card {
  border-color: color-mix(in srgb, var(--sys-accent) 35%, var(--sys-border));
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.08),
    0 0 0 1px color-mix(in srgb, var(--sys-accent) 15%, transparent);
}

[data-mode='light'] .bs__card-wrap .blog-card__media-wrap {
  border-color: color-mix(in srgb, var(--sys-border) 45%, transparent);
}

[data-mode='light'] .bs__card-wrap .blog-card__chip {
  background: color-mix(in srgb, var(--sys-accent) 10%, white);
  color: var(--sys-accent);
  border-color: color-mix(in srgb, var(--sys-accent) 25%, transparent);
}

[data-mode='light'] .bs__card-wrap .blog-card__meta-item {
  color: var(--sys-text-secondary);
}

[data-mode='light'] .bs__card-wrap .blog-card__title {
  color: var(--sys-text-primary);
}

[data-mode='light'] .bs__card-wrap .blog-card__arrow {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: var(--sys-text-primary);
}

[data-mode='light'] .bs__card-wrap:hover .blog-card__arrow {
  background: var(--sys-accent);
  border-color: var(--sys-accent);
  color: #fff;
}

[data-mode='light'] .bs__divider {
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--sys-accent) 35%, transparent) 30%,
    color-mix(in srgb, var(--sys-border) 40%, transparent) 70%,
    transparent 100%
  );
}

`;;

const EASE = [0.32, 0.72, 0, 1] as const;

const STAGGER_CHILDREN = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.25,
        },
    },
};

const CARD_VARIANT = {
    hidden: { opacity: 0, y: 36, scale: 0.96 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.7, ease: EASE },
    },
};

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

    const renderedPosts = visiblePosts.slice(0, 3);

    return (
        <>
            <style>{blogSectionStyles}</style>
            <section className="bs" id="blog" aria-label="Blog post section">
                {/* ── Ambient floating decoration ── */}
                <div className="bs__orb bs__orb--a" aria-hidden="true" />
                <div className="bs__orb bs__orb--b" aria-hidden="true" />
                <div className="bs__orb bs__orb--c" aria-hidden="true" />
                <div className="bs__noise" aria-hidden="true" />

            <div className="bs__inner">
                {/* ── Header row ── */}
                <motion.header
                    className="bs__header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, ease: EASE }}
                >
                    <div className="bs__heading-wrap">
                        {/* Decorative index label */}
                        <span className="bs__eyebrow" aria-hidden="true">
                            <span className="bs__eyebrow-line" />
                            Latest posts
                        </span>

                        <h2 className="bs__title">
                            <span className="bs__title-top">{headingTop}</span>
                            <span className="bs__title-bottom">{headingBottom}</span>
                        </h2>

                        {/* Floating accent chip */}
                        <div className="bs__accent-chip" aria-hidden="true">
                            ✦ recruiter-ready reads
                        </div>
                    </div>

                    <div className="bs__header-right">
                        {/* Post count badge */}
                        <div className="bs__count-badge" aria-hidden="true">
                            <span className="bs__count-number">{visiblePosts.length}</span>
                            <span className="bs__count-label">articles</span>
                        </div>

                        <button
                            className="bs__cta"
                            type="button"
                            onClick={onSeeAll}
                            aria-label={`${ctaLabel} blog posts`}
                        >
                            <span className="bs__cta-label">{ctaLabel}</span>
                            <span className="bs__cta-arrow" aria-hidden="true">
                                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
                    className="bs__divider"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                    aria-hidden="true"
                />

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="bs__filters"
                    role="tablist"
                    aria-label="Filter blog topics"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            role="tab"
                            aria-selected={activeCategory === category}
                            className={`bs__filter-chip ${activeCategory === category ? 'is-active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}

                    <button
                        type="button"
                        aria-pressed={featuredOnly}
                        className={`bs__featured-toggle ${featuredOnly ? 'is-active' : ''}`}
                        onClick={() => setFeaturedOnly((prev) => !prev)}
                    >
                        Featured only
                    </button>
                </motion.div>

                {/* ── Card grid ── */}
                <motion.div
                    className="bs__grid"
                    variants={STAGGER_CHILDREN}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                >
                    {renderedPosts.map((post, idx) => (
                        <motion.div
                            key={post.id}
                            className="bs__card-wrap"
                            variants={CARD_VARIANT}
                            whileHover={{ y: -5 }}
                        >
                            {/* Per-card ordinal number */}
                            <span className="bs__card-index" aria-hidden="true">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            {/* Offset shadow backing — testimonial pattern */}
                            <div className="bs__card-shadow" aria-hidden="true" />
                            <BlogCard item={post} variant="blog-post" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
            </section>
        </>
    );
}