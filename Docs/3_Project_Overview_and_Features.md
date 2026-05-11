# --- About.md ---

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


# --- TechStack.md ---

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


# --- ProjectStructure.md ---

# Project Structure & Architecture

## Root Directory Layout

The repository is structured to prioritize rapid onboarding, strict module isolation, and robust CI/CD integration.

```text
mekeshbuilds/
|- coverage/             # Test coverage reports (Vitest)
|- Docs/                 # Project documentation
|- firebase/             # Firebase security rules
|- public/               # Static public assets
|  |- robots.txt
|- scripts/              # Custom workspace scripts
|- src/
|  |- App.tsx
|  |- main.tsx           # Application entry point & provider composition
|  |- vite-env.d.ts      # Vite type declarations
|  |- assets/            # Static media, icons, and images
|  |- components/        # Granular UI modules (Builder, Canvas, Shared, etc.)
|  |- data/              # Static TypeScript data files (project-list, blog-posts)
|  |- features/          # Domain-driven feature modules
|  |  |- admin/          # Admin dashboard feature logic
|  |  |- auth/           # Auth hooks and services
|  |  |- public/         # Public portfolio feature logic
|  |- forms/             # Zod validation schemas
|  |- hooks/             # Stateful orchestration (UI, Data, Sync)
|  |- lib/               # 3rd-party client singletons (Firebase) & external utils
|  |- pages/             # Route-level view components
|  |  |- admin/          # Admin page components
|  |  |- auth/           # Auth page components
|  |  |- public/         # Public-facing page components
|  |  |- test/           # Local test pages / sandboxes
|  |- routes/            # Route topology (AppRouter)
|  |- services/          # Firebase API abstraction layer
|  |- store/             # Zustand global state slices
|  |- styles/            # Tailwind CSS v4 variables & custom tokens
|  |- test/              # Vitest global mocks & setup
|  |- types/             # TypeScript interfaces & Firestore converters
|  |- utils/             # Pure helper functions
|- firebase.json         # Firebase project configuration
|- index.html
|- package.json
|- tsconfig.json
|- tsconfig.node.json
|- vite.config.ts        # Vite + PWA + manual chunking config
|- vitest.config.ts      # Test environment config (jsdom)
```

````

## Directory Responsibilities

### `src/features`

Domain-driven feature modules — each subdirectory encapsulates the hooks, services, and logic for a specific product domain:

- `admin/`: Admin dashboard orchestration logic.
- `auth/`: Authentication hooks (`useAuth`) and auth-specific business logic.
- `public/`: Public portfolio feature logic and data access.

### `src/data`

Static TypeScript data files used as fallback or seed content:

- `project-list.ts`: Static list of portfolio projects for initial rendering.
- `blog-posts.ts`: Static blog post metadata.

### `src/components`

The visual building blocks of the application, strictly separated by domain:

- `auth/`: Authentication UI and elements.
- `Builder/`: Components orchestrating the live portfolio builder interface.
- `Canvas/`: High-level portfolio sections consumed by both the public profile and the live builder.
- `forms/`: Form UI components encapsulating logic and presentation.
- `guards/`: Route protection wrappers (`AuthGuard`, `AdminGuard`).
- `layout/`: Shared navigational shells (`AdminLayout`, `PublicLayout`).
- `Pages/`: Distinct section components specifically mapped to full pages.
- `Shared/`: Agnostic, highly reusable primitives (`Button`, `Card`, `Skeleton`, `Modal`).

### `src/hooks`

Stateful logic, side effects, and hardware/API abstractions:

- `usePortfolioData`: Fetches and syncs portfolio profile configurations.
- `useRealtimeSync`: Real-time data listener implementation.
- `useAutoSave`: Debounced persistence hook for dashboard form state.
- `useThemeEngine`: Mutates DOM CSS variables for real-time visual updates.
- `useMotionPreference`: Respects user's reduced-motion device settings via Framer Motion.

### `src/lib`

External client instantiations and heavy SDK setups:

- `firebaseClient.ts`: Entry point for initializing the Firebase App, Auth, and Firestore instances, ensuring singleton performance.
- `utils/`: Associated external library configurations or utilities.

### `src/services`

The data abstraction layer. UI components **never** interact with the database directly.

- `adminService.ts`: Admin operations (fetching configurations, user stats).
- `profileService.ts`: Reads/writes core user profile data.
- `ctaMailService.ts`: Handles automated contact form email dispatches.
- `serviceError.ts`: Universal API error wrapping and reporting.

### `src/types`

Strictly enforces end-to-end type safety:

- TypeScript interfaces defining the application's domain model.
- Firestore `withConverter` objects ensuring runtime schema validation when reading/writing NoSQL documents.

## Dependency Boundaries (The Architecture Rule)

The codebase strictly adheres to a unidirectional dependency flow, preventing circular dependencies and tightly coupled logic.

```text
Pages / Components (Presentation)
       ↓
Hooks / Store (State & Orchestration)
       ↓
Services (API / Database Abstraction)
       ↓
Lib / Types (External SDKs & Schemas)
```

**Architectural Invariants:**

1. **No Raw Queries in UI:** UI files must never execute Firebase SDK database calls directly.
2. **Framework Agnostic Services:** `src/services` functions return pure Promises and must _never_ import React hooks or UI components.
3. **Singleton Control:** External libraries (like Firebase) must be initialized exactly once in `src/lib`.

## Build and Tooling Configuration

- **`vite.config.ts`**: Configured with `@vitejs/plugin-react` and `@tailwindcss/vite`. Manual chunk splitting separates Three.js, Firebase, and React into distinct bundles for optimal caching. `vite-plugin-pwa` **[PLANNED — not yet installed]** will be added for full service-worker and offline capabilities.
- **`vitest.config.ts`**: Configures the `jsdom` testing environment, sets up the file bootstrap, and enforces high test coverage thresholds.
- **`package.json`**: Implements Git hooks (Husky/lint-staged) to prevent poorly formatted or failing code from being committed.

## Modular Strengths & Enterprise Alignment

1. **Frictionless Onboarding:** A highly predictable, domain-driven folder structure allowing new engineers to navigate the codebase instantly.
2. **Scalable Routing:** The separation of `pages` from `routes` makes it trivial to inject new complex sub-modules (like an interactive WebXR gallery) without refactoring the router tree.
3. **Robust Separation of Concerns:** Decoupling rendering (Components) from data access (Services) simplifies unit testing and future backend migrations.

## Future Structural Opportunities

1. Implement a `src/e2e/` directory using Playwright or Cypress for complete end-to-end user journey testing.
2. Migrate generic, non-domain-specific UI components into a localized Monorepo workspace or package for theoretical reusability across future SaaS tools.


````


# --- Features.md ---

# Features Architecture

## Feature Matrix

| Module                  | What it does                                                        | Core Tech / Files                                                                    |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Routing & Access**    | Defines public, callback, admin access, owner-protected route tree  | `src/routes/AppRouter.tsx`, `src/components/guards/*`                                |
| **Authentication**      | Firebase Auth (Email/OAuth) + strict owner-role validation          | `src/services/authService.ts`, `src/store/authStore.ts`                              |
| **Public Portfolio**    | Renders dynamic Bento Grid layouts, 3D elements, and AI context     | `src/pages/PublicProfilePage.tsx`, `src/components/Canvas/*`, `src/components/3D/*`  |
| **AI Personalization**  | Adapts bio and highlighted skills based on visitor/recruiter intent | `src/hooks/useAiContext.ts`, Firebase Cloud Functions, `aiService.ts` **[PLANNED]**     |
| **Interactive Builder** | Live WYSIWYG editor with real-time Firestore autosync               | `src/pages/BuilderPage.tsx`, `src/store/builderStore.ts`, `src/hooks/useAutoSave.ts` |
| **Theme & UX Studio**   | Manages vibrant gradients, glassmorphism, and organic SVGs          | `src/pages/ThemeStudioPage.tsx`, `src/hooks/useThemeEngine.ts`                       |
| **Dashboard**           | Analytics summary, PWA sync status, and quick asset management      | `src/pages/DashboardPage.tsx`                                                        |
| **Analytics Engine**    | Tracks date-ranged engagement metrics to feed AI recommendations    | `src/pages/AnalyticsPage.tsx`, `src/services/adminService.ts`                        |
| **Projects Manager**    | Tabular project listing with 3D asset link controls                 | `src/pages/ProjectsManagerPage.tsx`                                                  |
| **Resume Handling**     | PDF export engine and AI-summarized variation generation            | `src/pages/ResumeManagerPage.tsx`, `src/hooks/useExportPDF.ts`                       |

## Public Experience Features

- **Bento Grid Architecture:** Clean, minimalist, and highly responsive CSS Grid layouts for optimal content digestion.
- **Immersive 3D/AR Elements:** Subtle WebGL models (React Three Fiber) to represent tech stacks and interactive project storytelling.
- **AI-Driven Personalization:** Tailors the order of projects and highlights specific skills if a recruiter visits via a generated, intent-specific URL.
- **Offline Reliability (PWA):** Caches 3D assets, fonts, and Firestore data via service workers, ensuring instant load times and offline resume viewing.
- **Organic Aesthetics:** Hand-drawn SVG illustrations and glowing micro-interactions (Framer Motion) that add personality and warmth to the technical presentation.

Example conditional rendering pattern (Bento Block):

```tsx
{
  skills?.length > 0 && (
    <motion.div layoutId="skills-bento-block" className="col-span-1 md:col-span-2">
      <SkillsSection skills={skills} themeColor={themeColor} />
    </motion.div>
  );
}
```

## Admin Experience Features

- **Zero-Trust Access:** Strict owner-only route protection powered by Firebase Custom Claims and Firestore Rules.
- **Central Command Dashboard:** Real-time engagement statistics, active AI context logs, and one-click URL sharing.
- **Live Builder Workspace:** Accordion-based editing workflow with split-screen, real-time visual feedback on the Bento canvas.
- **Granular Theme Controls:** Immediate manipulation of CSS variables for system themes, custom gradients, and 3D lighting settings.

## Data and State Features

### Global State (Zustand)

- `authStore`: Manages Firebase session hydration, user object state, and strict owner gating.
- `builderStore`: Tracks local draft state, manages dirty flags, and orchestrates UI feedback for Firestore autosaves.
- `uiStore` **[PLANNED]**: Will control PWA install prompts, offline toast notifications, and 3D camera transitions.

### Async Orchestration (React Query)

- Seamless integration with Firestore's IndexedDB persistence layer.
- Mutation-backed autosaves with optimistic UI updates.

Example Firestore Autosave Mutation:

```ts
const mutation = useMutation({
  mutationFn: () => profileService.updateProfile(store.profile!.id, store.profile!),
  onMutate: () => store.setSaveStatus('saving'),
  onSuccess: () => {
    store.setSaveStatus('saved');
    store.setLastSavedAt(new Date());
  },
  onError: () => store.setSaveStatus('unsaved'),
});
```

## Security Features

- **Firestore Security Rules:** Enforces strict client-side validation, ensuring only the authenticated owner UID can perform write operations to protected collections.
- **Brute Force Mitigation:** Client-side local storage lockout on `AdminAccessPage` to deter credential stuffing.
- **Resilient Error Boundaries:** Catches missing data or failed WebGL contexts, rendering graceful fallbacks instead of crashing the PWA.

## Performance & UX Features

- **Aggressive Chunk Splitting:** Vite configuration isolates heavy 3D libraries (Three.js) from the main bundle, achieving near-instant First Contentful Paint.
- **Functional Motion Design:** Framer Motion handles route transitions, layout reshuffling, and interactive hover states to guide the recruiter's eye natively.
- **Lazy Loading with Suspense:** Admin modules and heavy Canvas components render with skeleton fallbacks.

## Operational Features

- **End-to-End Type Safety:** Strict TypeScript interfaces mapped directly to Firestore Data Converters.
- **CI/CD Integration:** Automated linting, Vitest execution, and zero-downtime deployment pipelines via GitHub Actions.
- **PWA Manifest Generation:** Fully configured `vite-plugin-pwa` for seamless installation on desktop and mobile devices.




# --- mekesh_resume.md ---

# MEKESH KUMAR

**Final Year Undergraduate — Electrical & Electronics Engineering (Kongu Engineering College)**

📞 +91 8220810170 | 📧 mekesh.engineer@gmail.com | 🔗 linkedin.com/in/mekeshkumar | 💻 github.com/Mekesh-Engineer | 🌐 freelancer.in/u/mekesh12

## CAREER OBJECTIVE

Final-year Electrical and Electronics Engineering undergraduate seeking a **Graduate Engineering Trainee (GET)** position to apply strong fundamentals in embedded systems, industrial automation, and IoT-integrated hardware-software development. Equipped with hands-on project experience across real-time control systems, sensor interfacing, and intelligent monitoring platforms — backed by in-plant training in manufacturing environments. Eager to contribute to engineering excellence, learn from industry-led mentorship, and grow into a core technical role within a dynamic organisation.

---

## EDUCATION

| Qualification                               | Institution                                              | Year                          | Result                           |
| ------------------------------------------- | -------------------------------------------------------- | ----------------------------- | -------------------------------- |
| B.E. – Electrical & Electronics Engineering | Kongu Engineering College, Perundurai, Tamil Nadu        | 2023 – Present _(Final Year)_ | **CGPA: 7.71** _(up to 5th Sem)_ |
| Higher Secondary Education (HSE)            | Govt. Boys Higher Secondary School, Palacode, Tamil Nadu | 2021 – 2023                   | **84%**                          |
| SSLC                                        | DDCSM Matriculation School, Palacode, Tamil Nadu         | 2020 – 2021                   | **84%**                          |

---

## CORE ENGINEERING COMPETENCIES

### Electrical & Electronics Fundamentals

- Circuit Design & Analysis, Electrical Machines, Power Systems, Power Electronics, EV & Motor Drivers, Analog Electronics, Digital Electronics, Signals & Systems, FPGA Design & Simulation, Microprocessors & Microcontrollers, Engineering Drawing, Control Systems, Power System Protection & Switchgear
- PCB Design Fundamentals, Schematic Capture, Electrical Wiring Diagrams
- Sensor Interfacing & Transducer Calibration, Closed-Loop Control System Design

### Engineering Design & Simulation Tools

- **Simulation:** MATLAB, Simulink, Proteus, OrCAD PSpice, Mi Power
- **FPGA & Digital Design:** Xilinx Vivado, Intel Quartus Prime
- **CAD:** AutoCAD Electrical, Autodesk Fusion 360

### Embedded Systems & Industrial Automation

- Microcontroller Firmware: ESP32, Arduino Uno, ARM-based Processors
- Embedded C/C++ Programming, Real-Time Control Logic, Peripheral Interfacing (I2C, SPI, UART, ADC)
- Servo Actuation, Multi-Sensor Fusion, FreeRTOS Concepts _(fundamentals)_
- IoT Platform Integration: Blynk IoT, Wi-Fi-based Edge Systems, OTA Updates

### Programming & Software Skills

- **Languages:** Python, C, Embedded C, C++, Java, JavaScript
- **Frontend:** React 19, TypeScript, Next.js, React Native, HTML5, CSS3, Tailwind CSS, Bootstrap
- **Build Tools:** Vite
- **Backend:** Express.js , Flask, WebSockets, REST APIs
- **Databases & Cloud:** Firebase (NoSQL), Supabase (PostgreSQL), MongoDB
- **Version Control:** Git, GitHub

### AI & Machine Learning Skills

#### Core Technical Skills

- **Programming:** Python
- **Frameworks & Libraries:** TensorFlow, PyTorch, Keras, Scikit-learn
- **Mathematics:** Linear Algebra, Calculus, Probability & Statistics _(for model optimisation)_
- **Data Science:** Pandas, NumPy, Matplotlib, Seaborn _(data manipulation, EDA, visualisation)_

#### Data & Annotation

- **Dataset Platforms:** Roboflow, CVAT.ai, Label Studio, LabelMe, Doccano
- **Data Skills:** Dataset curation, preprocessing, augmentation, SQL-based data management

#### Machine Learning

- Supervised & Unsupervised Learning, Neural Networks, Decision Trees, Ensemble Methods
- Computer Vision: Object Detection (YOLOv8), Image Segmentation, OpenCV-based inspection pipelines
- Natural Language Processing (NLP) _(fundamentals)_
- Generative AI & Large Language Models (LLMs) _(applied, via Firebase Genkit & Google AI APIs)_

#### Deployment & MLOps

- Model export: ONNX _(edge deployment on embedded hardware)_
- Cloud Platforms: Google Cloud (GCP), Firebase Cloud Functions _(AI inference pipelines)_
- MLOps concepts: Experiment tracking, model versioning, CI-integrated evaluation

---

## TECHNICAL PROJECTS

### ⚙️ Automated Rod and Pipe Inspection System

**Tech Stack:** Python · OpenCV · YOLOv8 · Flask · ESP32-CAM · C++
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Industrial Automation | Machine Vision)_

An end-to-end automated quality inspection system replacing manual measurement with machine vision for manufacturing-line use.

- Programmed **ESP32-CAM firmware** in C++ to stream real-time JPEG frames over Wi-Fi via HTTP endpoints for low-latency video ingestion.
- Integrated **computer vision algorithms** (YOLOv8 + OpenCV) to detect surface defects and compute dimensional measurements with high accuracy.
- Built a **multi-threaded Flask backend** to handle concurrent video streams and serve inference results efficiently.
- Designed a **live operator dashboard** displaying FPS, inference latency, detection logs, and real-time video — replicating SCADA-like monitoring interfaces.
- Demonstrates direct applicability to **industrial quality control** and automated inspection workflows in manufacturing environments.

---

### 🚗 V2X Communication and Fleet Monitoring System

**Tech Stack:** Python · Flask · WebSockets · SSE · UDP · ESP32 · C++
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Fleet Automation | Real-Time Telemetry)_

A real-time vehicle-to-everything (V2X) telemetry and control platform for multi-device fleet coordination — analogous to industrial SCADA and remote monitoring systems.

- Architected a **full-stack telemetry API** ingesting high-frequency sensor data (distance, temperature, humidity, battery, IR obstacles) from distributed ESP32 edge nodes.
- Engineered a **UDP auto-discovery service** for zero-configuration dynamic IP resolution across local networks — applicable to industrial plant-floor device management.
- Built a **thread-safe global state manager** with mutex-protected command queuing to ensure reliable, non-blocking control instruction delivery.
- Implemented a **low-latency MJPEG video proxy server** to relay live ESP32-CAM feeds to a central dashboard, eliminating cross-origin network restrictions.
- Presented at **5 inter-collegiate technical events** including Robofiesta 2K25 (SREC) and Ideathon 2K24 (KEC).

---

### 🏟️ Smart IoT-Based Event and Venue Management Platform

**Tech Stack:** React 19 · TypeScript · Firebase · YOLOv8 · ESP32-CAM · Python
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(IoT Systems | Full-Stack Engineering)_

> 🏆 **1st Prize – Tamizhanskills Ideathon 2026**, New Prince Shri Bhavani College of Engineering, Chennai

A full-stack IoT platform integrating hardware, cloud, and AI for real-time venue monitoring, automated access control, and crowd management.

- Deployed **edge-based crowd density analysis** (YOLOv8) to trigger autonomous safety alerts and gimbal control when occupancy thresholds were exceeded.
- Engineered a **high-speed QR ticket validation system** using ESP32-CAM with cryptographic security and automated gate actuation.
- Built a **scalable serverless Firebase backend** (Firestore + Cloud Functions) with multi-tier Role-Based Access Control (RBAC) and atomic ticket inventory synchronisation.
- Developed a **real-time React 19 monitoring dashboard** for live crowd flow, hardware health, and ticket sales using Zustand and React Query.

---

### 🗑️ IoT Automated Waste Segregation System

**Tech Stack:** C++ · ESP32 · Blynk IoT · Inductive / Capacitive / IR Sensors · Servo Motors
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Embedded Systems | Smart Automation)_

An autonomous smart waste classification system demonstrating applied embedded control logic, multi-sensor fusion, and cloud-connected monitoring.

- Implemented **multi-sensor fusion** (inductive, capacitive, IR) for autonomous classification of metal, plastic, and organic waste.
- Programmed **real-time embedded control logic** to translate sensor readings into servo-driven sorting actuation — a direct analogy to PLC-controlled industrial sorting systems.
- Integrated **Blynk IoT dashboard** for remote monitoring of bin capacity, waste distribution, and system health via Wi-Fi.

---

### 🌐 Full-Stack Portfolio and Resume Builder Web App

**Tech Stack:** React 19 · TypeScript · Vite · Firebase (Auth + Firestore) · Framer Motion · Zod · Zustand · Vitest
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Full-Stack Web Engineering | Product Systems)_

A production-style full-stack web application for building, managing, and publishing technical portfolio and resume content with secure authentication, real-time data workflows, and modular UI architecture.

- Engineered a **role-aware dashboard platform** with protected routing, authentication callbacks, and centralised state management for profile, projects, resume, and settings modules.
- Built **schema-validated content pipelines** (Zod-based) for personal info, projects, experience, skills, themes, and contact forms to improve data integrity and reduce invalid submissions.
- Implemented **real-time and productivity features** including autosave hooks, clipboard/export utilities, analytics views, search/filter tooling, and responsive UI sections optimised for desktop and mobile.
- Structured the app into reusable component layers and feature modules, with **test coverage using Vitest** to support maintainability and iterative deployment.

---

### ⚡ Smart Hybrid Energy Management System using Fuzzy Logic

**Tech Stack:** Arduino Mega · Fuzzy Logic (eFLL) · Proteus · Embedded C · ACS712 Current Sensors · Power Electronics
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Energy Systems | Smart Grid Automation)_

An intelligent energy optimisation system that dynamically manages load distribution between grid and renewable sources using fuzzy logic-based decision making.

- Designed a **Fuzzy Logic Controller (FLC)** using multi-parameter inputs (time, load, grid availability, battery status) to optimise energy usage decisions.
- Implemented **real-time load monitoring** using ACS712 current sensors and voltage divider circuits for battery state estimation.
- Built a **relay-based switching architecture** to dynamically route power between grid and battery for efficient energy utilisation.
- Simulated the complete system in **Proteus Design Suite**, including inverter, solar input, and load switching mechanisms.
- Demonstrates strong application in smart homes, energy optimisation, and demand-side management systems.

---

### 🚓 GPS-Based Smart Vehicle Horn & Speed Regulation System

**Tech Stack:** ESP32 · GPS (NEO-6M) · L298N Motor Driver · Embedded C++ · Wi-Fi · Web Server
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Embedded Systems | Intelligent Transportation)_

A geofence-aware smart vehicle system that automatically regulates speed and restricts horn usage in sensitive zones such as hospitals and campuses.

- Implemented **GPS-based geofencing logic** using the Haversine distance formula to detect zone entry in real time.
- Designed an **adaptive motor control system** using PWM to dynamically reduce vehicle speed inside restricted zones.
- Built a **real-time web dashboard and control interface** for telemetry monitoring and manual control (mobile and desktop).
- Integrated **state-driven buzzer control logic** to disable horn functionality and trigger alert feedback in restricted zones.

---

### 🎮 Cosmic Strikes — 3D Arcade Space Shooter

**Tech Stack:** React · TypeScript · Three.js · React Three Fiber · Node.js · Express · MongoDB / SQLite
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Full-Stack Systems | Interactive 3D Applications)_

A high-performance full-stack 3D arcade shooter combining real-time rendering, game logic, and backend-driven leaderboards.

- Engineered a **WebGL-based 3D rendering pipeline** using React Three Fiber for smooth 60 FPS gameplay.
- Designed a **scalable game architecture** with Redux state management and modular component structure.
- Built a **Node.js backend API** with JWT authentication and leaderboard system supporting MongoDB and SQLite.
- Implemented **dynamic gameplay systems** including wave progression, difficulty scaling, and combo-based scoring logic.

---

## ACHIEVEMENTS

| Year | Award                | Project / Activity                          | Event & Institution                                                                    |
| ---- | -------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| 2026 | 🥇 1st Prize         | Smart IoT Event & Venue Management Platform | Tamizhanskills Ideathon 2026 — New Prince Shri Bhavani College of Engineering, Chennai |
| 2025 | 🥉 3rd Prize         | ROV-Based Underwater Crack Detection System | Project Prism – Oracle 2025 — Government College of Technology, Coimbatore             |
| 2026 | 🥉 3rd Prize         | Smart IoT Event & Venue Management Platform | Elixir 2026 Technical Event — Government College of Engineering, Erode                 |
| 2023 | 🏅 School First Rank | Higher Secondary Examination                | Govt. Boys Higher Secondary School, Palacode                                           |

---

## INDUSTRIAL TRAINING & EXPOSURE

### In-Plant Training

**Hatsun Agro Products Ltd., Vellichandai** | 15–19 July 2024
Gained hands-on exposure to industrial manufacturing operations, production line workflows, equipment maintenance practices, and plant automation systems.

**Pavithran Aseptic Fruit Products** | 1–5 January 2025
Studied aseptic processing techniques, quality control protocols, instrumentation used in food-grade production, and compliance with industrial standards.

### Industrial Visits

- **Radio Astronomy Centre (RAC), Ooty** – November 2024 _(large-scale signal processing and RF systems)_
- **Kodaikanal Solar Observatory (KoSO)** – March 2025 _(precision instrumentation and data acquisition systems)_

---

## CERTIFICATIONS

**Professional & Technical**

- Embedded Application Development using ARM Processors — Maven Silicon (2025)
- AutoCAD Electrical Design — Cadcentre Cochin (2023)

**Additional**

- Introduction to Generative AI — Google Cloud (2024)
- Java for Beginners — Infosys Springboard (2024)
- Energy Literacy Training — Energy Swaraj Foundation (2023)

---

## TECHNICAL PRESENTATIONS & COMPETITIONS

**V2X Communication and Fleet Monitoring System** — Presented at 5 events:
Ideathon 2K24 (KEC) · Robofiesta 2K25 (SREC) · Autonix 2024 (KEC) · Project Expo 2K25 (KEC) · Proof of Concept 2K25 (KEC)

**Smart IoT Event & Venue Management Platform** — Presented at 5 events:
Tech Aura 2026 – IEEE (KPR Institute) · Elixir 2026 (GCE Erode) · Exodia 2026 – ISTE Hackathon (KEC) · Tech Fest 2K25 (KEC) · Proof of Concept 2K25 (KEC)

**ROV-Based Underwater Crack Detection System:**
Oracle 2K25 — Government College of Technology, Coimbatore

---

## MEMBERSHIPS & LEADERSHIP

**ISTE – Indian Society for Technical Education** | Executive Member (2024 – Present)
Actively contributed to organising technical events, workshops, and inter-departmental competitions at Kongu Engineering College.

**NSS – National Service Scheme** | Executive Member (2024 – Present)
Led and participated in community outreach, rural development, and social responsibility programmes.

---

## LANGUAGES

Tamil: Native | English: Professional | Hindi: Working

---

## AREAS OF INTEREST

Embedded Systems & Firmware Development | Industrial Automation & Control | IoT & Smart Systems | Power Electronics | Computer Vision & AI-Integrated Engineering | Full-Stack Industrial Software

---

_I hereby declare that all information provided in this résumé is true and accurate to the best of my knowledge._

**Mekesh Kumar**
Place: Perundurai | Date: **\*\***\_\_\_\_**\*\***