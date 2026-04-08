# TechStack

## Overview

MekeshBuilds is a cutting-edge, TypeScript-first web application built as a modern Progressive Web App (PWA) with a serverless Backend-as-a-Service model. It is designed to reflect 2025–2026 web design trends, prioritizing recruiter engagement through interactive storytelling, blistering performance, and intelligent personalization.

Core architecture:

- **Frontend**: React + Vite + Tailwind CSS (Bento Grid Architecture)
- **Backend & AI**: Firebase services (Authentication, Firestore NoSQL, Cloud Functions for AI)
- **Interactive Layers**: Framer Motion (Micro-interactions) + React Three Fiber (3D/AR)
- **State & Data orchestration**: Zustand + React Query + Offline Service Workers

## Frontend

### Framework and Runtime

- React 19 (`react`, `react-dom`)
- TypeScript 5 (`typescript`)
- React Router 7 (`react-router-dom`)
- Vite 6 build/dev server (`vite`, `@vitejs/plugin-react`)
- Vite PWA Plugin (`vite-plugin-pwa`) for offline access and service worker management.

### UI, 3D, and Interaction Libraries

- **Styling**: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`) optimized for complex CSS Grid "Bento Box" layouts.
- **Motion Design**: Framer Motion (`framer-motion`) for hover animations, layout transitions, and scroll-driven storytelling.
- **Immersive 3D/AR**: Three.js (`three`) and React Three Fiber (`@react-three/fiber`, `@react-three/drei`) for subtle 3D visuals, floating tech-stack models, and interactive project showcases.
- **Organic Aesthetics**: Rough.js (`roughjs`) for generating hand-drawn doodle illustrations and organic SVG borders. **[PLANNED — not yet in package.json; `npm install roughjs`]**
- **Drag & Drop**: `@dnd-kit/core` + `@dnd-kit/sortable` for sortable builder panels.
- **Alert / Modal UI**: `sweetalert2` for rich confirmation dialogs and toast prompts.
- **Icons**: `react-icons` providing comprehensive icon sets (Simple Icons, Font Awesome, etc.).
- **Charts**: `chart.js` + `react-chartjs-2` for the Analytics dashboard visualizations.
- **Forms & Validation**: React Hook Form (`react-hook-form`) + Zod (`zod`).

### AI and Personalization Integrations

- **Cloud AI SDKs**: Integration with AI APIs (e.g., OpenAI or Google Gemini via Firebase Cloud Functions or Firebase Genkit) to adapt layouts and summarize resume content in real-time based on the visitor's context (e.g., highlighting specific skills if a recruiter searches for "Frontend").
- **Fuzzy Search**: Fuse.js (`fuse.js`) for rapid, typo-tolerant project and skill filtering.

### State and Data Layer

- Zustand (`zustand`) for app/global state (e.g., managing 3D camera angles or AI-driven theme toggles).
- Immer (`immer`) used as a Zustand middleware (`zustand/middleware/immer`) for ergonomic immutable state updates — **not** used as a standalone library.
- TanStack Query (`@tanstack/react-query`) for async cache/mutation workflows, seamlessly integrating with Firestore's offline persistence for cached portfolio data.
- Fuse.js (`fuse.js`) for rapid, typo-tolerant project and skill filtering.

### Styling Approach

- **Bento Grid Architecture**: Heavy utilization of CSS Grid via Tailwind utilities to create modular, responsive, and minimalist content blocks.
- **Vibrant & Glowing Aesthetics**: Custom CSS tokens in `src/styles/base/variables.css` defining vibrant gradients, glassmorphism overlays, and glowing border effects.
- **Runtime Theming**: Dynamic theme mutation using `useThemeEngine`, capable of switching between professional, creative, and AI-recommended color palettes.

## Backend

### Server Framework and API Model

- Serverless architecture leveraging Firebase platform services.
- **AI Compute Layer**: Firebase Cloud Functions utilized as a secure bridge to execute AI prompts (content recommendation, real-time bio adjustments) without exposing private API keys to the client.

### Authentication Methods

- **Firebase Authentication**:
  - Email + password sign-in
  - Google OAuth sign-in
- **Owner-only Access**: Route guards (`AuthGuard`, `AdminGuard`) and Firestore Security Rules strictly protect the admin dashboard, builder, and analytics workspaces.

### Database

- **Database Type**: NoSQL Document Database via Firebase Cloud Firestore.
- **Typed Access**: Strictly typed data access using TypeScript interfaces and Firestore Data Converters (`withConverter`) defined in `src/types/database.types.ts` to ensure frontend type safety.
- **Core Collections**:
  - `profiles`, `experience`, `skills`, `projects`
  - `analytics` (tracking user engagement metrics to feed the AI personalization engine)
  - `ai_preferences` (storing personalized views or customized pitches generated for specific recruiter links).

## Hosting and Deployment

### Performance-Driven PWA Build

- **Dev**: `npm run dev`
- **Production Build**: `npm run build` (Includes PWA manifest and service worker injection for offline caching of fonts, 3D models, and JSON data).
- **Optimization**: Aggressive manual chunk splitting for vendor libraries, WebGL context, and React Query modules to ensure near-instant First Contentful Paint (FCP).

### Hosting Platforms

- Deployed on **Firebase Hosting** (or **Vercel** / **Netlify**) to utilize edge caching and optimized global asset delivery.
- SPA rewrite rules configured to support dynamic routing (`/:username`) and fallback offline pages.
- **`vite-plugin-pwa`** for service worker and offline caching **[PLANNED — not yet installed; `npm install -D vite-plugin-pwa`]**.

### CI/CD Integration

- GitHub Actions (`.github/workflows/ci.yml`) implemented for automated linting, Vitest execution, and zero-downtime production deployments upon merging to the `main` branch.

## Future-Ready Scalability

The architecture is explicitly designed for modularity.

### Short-Term (Next Iteration)

1. Expand the Bento UI to support dynamically injected AI content blocks.
2. Optimize 3D asset loading using Draco compression for faster mobile experiences.

### Mid-Term

1. Integrate a Headless CMS approach for publishing deep-dive technical blog posts.
2. Expand WebXR features to allow recruiters to view 3D project architecture diagrams in Augmented Reality.

## Summary Table

| Layer       | Technology Chosen                              | Purpose & Trend Alignment                                          |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| Frontend    | React 19, Vite, Tailwind v4                    | Bento-grid UI, blistering performance, modular components.         |
| Interactive | Framer Motion, React Three Fiber, Rough.js [P] | 3D/AR storytelling, functional motion, hand-drawn aesthetics.      |
| UI Extras   | @dnd-kit, sweetalert2, react-icons, chart.js   | Drag-drop builder, alerts, icon sets, analytics charts.            |
| PWA & State | vite-plugin-pwa [P], Zustand, TanStack Query   | Offline reliability, smooth state management, edge-caching.        |
| Backend/AI  | Firebase (Auth, Firestore, Cloud Functions)    | Serverless scaling, real-time NoSQL data, secure AI API execution. |
| Deployment  | Firebase Hosting / Vercel + CI/CD              | Automated testing, global edge delivery, modern DevOps practices.  |

_[P] = Planned — not yet implemented/installed_
