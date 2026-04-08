# About

## Project Overview

MekeshBuilds is a next-generation, performance-driven personal portfolio platform built as a Progressive Web App (PWA). Utilizing a React + TypeScript frontend and a serverless Firebase backend, it represents the bleeding edge of 2025–2026 web design trends.

The platform merges interactive storytelling with deep technical precision, featuring:

- A dynamic, AI-personalized public portfolio experience (`/:username`).
- Immersive 3D/AR elements and organic, hand-drawn UI aesthetics.
- A minimalist, highly responsive Bento Grid architecture.
- An exclusive, authenticated admin workspace (`/dashboard`, `/builder`, `/analytics`) with real-time editing and autosave.

This application is designed not just to display a resume, but to demonstrate architectural mastery, exceptional UX design, and forward-thinking engineering to recruiters and engineering managers.

## Purpose

MekeshBuilds solves the practical challenge of fragmented professional identities by providing a single, intelligent source of truth for portfolio content, technical showcases, and resume generation.

Core outcomes:

- **Edit Once, Reflect Everywhere**: Seamlessly sync data across the public profile, PDF resume exports, and admin modules.
- **Recruiter-First Experience**: Deliver blazing-fast load times (PWA offline caching) and AI-curated content highlighting relevant skills based on visitor intent.
- **Serverless Scale**: Maintain robust, strictly typed data in Firebase Firestore, queried effortlessly via modern frontend hooks.
- **Secure Control**: Ensure strict owner-only access for content management while keeping the public face highly discoverable and SEO-optimized.

## Primary Goals

1. **Maximized Engagement**: Capture recruiter attention through functional motion design, micro-interactions, and 3D data visualization.
2. **Blistering Performance**: Achieve near-instant First Contentful Paint (FCP) and reliable offline access via service workers.
3. **Type-Safe Architecture**: Enforce strict end-to-end type safety from UI components to Firestore database converters.
4. **Intelligent Adaptability**: Leverage AI (via Firebase Cloud Functions) to dynamically tailor layouts and summaries.
5. **Modular Separation of Concerns**: Maintain a clean, scalable codebase (pages, hooks, services, global stores, and types).

## High-Level Architecture

```text
React Pages/Components (Bento Grid UI, 3D Canvas)
  -> Hooks (Stateful orchestration & AI context)
  -> Services (Firebase queries/mutations via Data Converters)
  -> Firebase App Client (Singleton instance)
  -> Cloud Firestore (NoSQL Document Database)
```

## Runtime Stack

- **Frontend**: React 19, TypeScript 5, Vite 6 + Vite PWA Plugin
- **Routing**: React Router 7
- **State Management**: Zustand (+ devtools, immer)
- **Data Fetching/Cache**: TanStack React Query (with offline persistence)
- **Forms & Validation**: React Hook Form + Zod
- **Backend & AI**: Firebase (Authentication, Firestore, Cloud Functions)
- **Styling**: Tailwind CSS v4 (Grid-optimized) + CSS custom properties
- **Motion & 3D**: Framer Motion (Transitions), React Three Fiber / Three.js (WebGL)
- **Organic Aesthetics**: Rough.js (Doodle illustrations & SVGs)
- **PDF Export**: html2canvas + jsPDF
- **Testing**: Vitest + Testing Library + jsdom

## Provider Composition (App Entry)

```tsx
<HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <ThemeInitializer>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </ThemeInitializer>
  </QueryClientProvider>
</HelmetProvider>
```

This composition ensures SEO metadata support, robust query caching, persisted theme preferences, and secure auth session hydration are fully initialized before any route renders.

> **Note:** `PwaSyncProvider` is planned for a future iteration when full PWA + service worker sync management is implemented.

## Product Modes

### Public Mode

- Landing route (`/`) and dynamic profile route (`/:username`).
- Visitors experience a highly polished, interactive Bento Grid layout.
- AI-driven context adjustments and 3D models engage visitors dynamically.

### Admin Mode

- Owner-only routes strictly protected by Firebase Auth and `AdminGuard` logic.
- Intuitive CRUD workflows, real-time analytics dashboards, and theme configuration tools for all portfolio assets.

## Current Scope

Implemented and active core features:

- Secure authentication with strict owner gating.
- Portfolio data fetch/update services leveraging Firestore.
- Live builder workspace with autosave status and real-time previews.
- Dynamic theme engine (colors, fonts, light/dark mode, and creative modes).
- Initial Bento Grid layout structure for About, Skills, and Projects sections.
- Resume export engine and manager page shell.

Planned expansions, including deep AI integrations and IoT/Hardware bridges, are tracked in the project roadmap (`FutureScope.md`).
