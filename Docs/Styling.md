# Styling & UI Architecture

## Overview

The visual architecture of MekeshBuilds is designed to deliver a striking, recruiter-optimized experience that embodies 2025–2026 web design trends. It balances clinical engineering precision with organic, creative flair, utilizing Bento Grid layouts, immersive 3D elements, and functional motion design.

## The Visual Tech Stack

- **Utility Framework**: Tailwind CSS v4 via `@tailwindcss/vite` (Optimized for complex CSS Grid architectures).
- **Global Token System**: CSS custom properties managed in `src/styles/base/*` for dynamic theming.
- **Functional Motion**: Framer Motion for layout transitions, micro-interactions, and scroll-driven storytelling.
- **Organic Aesthetics**: Rough.js for generating dynamic, hand-drawn SVG borders and doodle illustrations. **[PLANNED — not yet in package.json; run `npm install roughjs` to enable]**
- **Immersive 3D/WebGL**: React Three Fiber / Drei for rendering tech-stack models and interactive canvases.

## Token Architecture & Theming

The project implements a dual-token design system, cleanly separating the secure administrative shell from the highly customizable public portfolio canvas.

1. **System Tokens (`--sys-*`)**: Strictly controls the `/dashboard` and `/builder` workspaces (dark-first, high-contrast, professional).
2. **Canvas Tokens (`--color-*`)**: Drives the public `/:username` portfolio, supporting vibrant gradients, glassmorphism, and AI-recommended palettes.

Example variables in `variables.css`:

```css
:root {
  /* System Shell */
  --sys-bg-primary: #0f0f14;
  --sys-text-primary: #f3f4f6;
  --sys-border: rgba(255, 255, 255, 0.1);

  /* Public Canvas (AI/User Mutable) */
  --color-primary: #ff6b2c;
  --color-secondary: #ff8a57;
  --color-glow: rgba(255, 107, 44, 0.4);
  --color-glass: rgba(15, 15, 20, 0.6);
}
```

## Dynamic Theme Engine Mechanics

To ensure maximum performance and zero-latency visual feedback in the Live Builder, the `useThemeEngine` hook bypasses React's render cycle for color updates. Instead, it mutates CSS variables directly on the `#live-canvas` DOM node.

```ts
// src/hooks/useThemeEngine.ts
canvas.style.setProperty('--color-primary', primary);
canvas.style.setProperty('--color-secondary', secondary);
canvas.style.setProperty('--color-glow', generateGlow(primary));
```

**Benefits:**

- Sub-millisecond visual updates during WYSIWYG editing.
- Complete isolation between the administrative UI and the rendered portfolio skin.
- Enables the AI to instantly inject recruiter-specific color psychology without triggering expensive DOM repaints.

## Bento Grid Layouts

The core of the public portfolio relies on a "Bento Box" architecture. This approach reduces cognitive load for recruiters by compartmentalizing information into clean, digestible visual hierarchy.

**Tailwind Usage Pattern:**
We leverage CSS Grid heavily via Tailwind utilities (`grid`, `col-span-x`, `row-span-x`) alongside responsive modifiers (`md:`, `lg:`) to ensure the Bento Grid gracefully degrades into a linear feed on mobile PWAs.

## Functional Motion Design

Animation is never purely decorative; it is utilized strictly as _Functional Motion Design_ to guide the recruiter's eye and provide spatial awareness.

- **Framer Motion (`<motion.div>`)**: Used for fluid layout shifts when filtering projects, exit/enter animations for Bento blocks, and satisfying hover states (e.g., scale and elevation shifts).
- **CSS Keyframes**: Reserved for infinitely looping, low-overhead utility animations (e.g., `marquee` for skill tickers, `pulse-glow` for call-to-action buttons) stored in `animations.css`.

## Organic & 3D Integration

- **Glassmorphism & Glows**: Bento blocks utilize `backdrop-blur-md` and custom drop-shadow tokens (`shadow-[var(--color-glow)]`) to create depth.
- **Hand-Drawn Accents**: Rough.js overlays are applied dynamically to specific Bento boxes to inject "warmth" and break up the rigid grid lines, creating a memorable, human-centric aesthetic.
- **WebGL Overlays**: `z-index` stacking contexts are carefully managed so 3D canvases seamlessly float behind or interleave with the CSS Grid content.

## Styling Best Practices for this Codebase

1. **Tokenize Everything**: Never use raw hex codes in JSX; always map to `--sys-*` or `--color-*` variables to ensure theme portability.
2. **Component-Level Utility**: Keep layout and spacing utilities inside the component markup, but extract complex animations to reusable Framer variants.
3. **Isolate Canvas Logic**: Theme mutations must remain strictly within `useThemeEngine`.
4. **Contrast & Accessibility**: Ensure glassmorphic overlays maintain a minimum 4.5:1 contrast ratio for text readability.

## Example Component: Bento Block with Glow & Glassmorphism

```tsx
import { motion } from 'framer-motion';

export const BentoBlock = ({ title, children }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl border border-sys-border bg-[var(--color-glass)] backdrop-blur-xl p-6 shadow-lg transition-shadow hover:shadow-[0_0_20px_var(--color-glow)]"
    >
      <h3 className="text-xl font-bold text-sys-text-primary mb-2">{title}</h3>
      <div className="text-sys-text-secondary">{children}</div>
      {/* Optional Rough.js decorative SVG border injected here */}
    </motion.div>
  );
};
```


