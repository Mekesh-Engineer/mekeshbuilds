# Deployment & DevOps

## Current Deployment Readiness

MekeshBuilds is engineered for zero-downtime deployments and edge-network delivery. Built as a Vite-powered Progressive Web App (PWA), the platform relies on static frontend hosting seamlessly integrated with a serverless Firebase backend.

The configuration ensures blistering performance through aggressive chunk splitting, service-worker caching, and global content delivery networks (CDNs).

**Configured NPM Scripts:**

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:ci": "vitest run",
  "lint": "eslint src --ext .ts,.tsx"
}
```

## Environments

### Local Development

- `npm install`
- Configure `.env.local` with Firebase credentials.
- `npm run dev`

### Production Build

- `npm run build`
- Generates the heavily optimized `dist/` directory, injecting the PWA `manifest.webmanifest` and generating the service worker.
- Requires standard production environment variables injected at the hosting level.

## Required Runtime Variables

To ensure secure and reliable connections to the serverless backend, the following variables must be configured in your hosting provider's dashboard:

```env
# Firebase Core Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Application Identity
VITE_APP_URL=[https://your-custom-domain.com](https://your-custom-domain.com)
VITE_OWNER_EMAIL=your-email@example.com
```

## Hosting & Delivery Platform

The architecture is explicitly designed for edge platforms. Recommended targets include:

- **Firebase Hosting** (Ideal for native integration with Cloud Functions and Firestore)
- **Vercel** or **Netlify** (Excellent for global edge caching and GitHub CI/CD integration)

**Crucial Routing Requirement:**
Because this is a Single Page Application (SPA) handling dynamic routes (e.g., `/:username`), the host must be configured to rewrite all unknown paths to `index.html`.

_Example for Firebase Hosting (`firebase.json`):_

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Build Output and Performance Optimization

To guarantee a near-instant First Contentful Paint (FCP) and smooth 3D/AR rendering, Vite is configured with advanced manual chunk splitting.

The build pipeline intelligently isolates:

- `vendor`: Core React ecosystem (React, Router, Zustand).
- `firebase`: Firebase Auth and Firestore SDKs.
- `webgl`: Three.js and React Three Fiber assets to prevent blocking the main thread.
- `motion`: Framer Motion libraries.

This modularity maximizes browser cache hit rates across iterative deployments.

## CI/CD Pipeline

The repository utilizes GitHub Actions to enforce code quality and automate production releases.

**Core Pipeline Objectives:**

1. Install dependencies via cached environments.
2. Enforce static analysis (`npm run lint`).
3. Execute unit and component test suites (`npm run test:ci`).
4. Validate the production build step.
5. Deploy directly to Firebase Hosting on pushes to `main` (implemented in `.github/workflows/ci.yml`).

**Implemented workflow (`.github/workflows/ci.yml`):**

```yaml
name: Production CI/CD
on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate-and-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install Dependencies
        run: npm ci

      - name: Lint Codebase
        run: npm run lint

      - name: Run Test Suite
        run: npm run test:ci
        # test:ci runs 'vitest run'. Use npm run test:coverage for v8 lcov reports.

      - name: Build PWA Artifacts
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # Include other required secrets here...
```

## Pre-Flight Deployment Checklist

1. Verify all `VITE_FIREBASE_*` variables are securely injected into the hosting provider.
2. Ensure the production domain is whitelisted in **Firebase Authentication > Settings > Authorized Domains**.
3. Confirm Google OAuth credentials in Google Cloud Console allow the new production callback URL.
4. Verify the SPA rewrite rule (`index.html` fallback) is actively intercepting traffic.
5. Run smoke tests on core routes:
   - `/` (Check 3D asset loading and Bento Grid responsiveness)
   - `/admin-access` (Check lockout mechanisms)
   - `/:username` (Check AI personalization context and PWA offline caching)
   - `/dashboard` (Verify protected owner-only access)

## Post-Deployment Observability

To maintain a recruiter-ready experience, the following monitoring practices are recommended:

- **Firebase Crashlytics / Performance Monitoring**: Track JavaScript exceptions and PWA load times in real-world scenarios.
- **Web Vitals Tracking**: Ensure LCP, CLS, and INP metrics remain in the "Good" threshold.
- **Database Telemetry**: Monitor Firestore read/write quotas in the Firebase Console to ensure AI caching strategies are effectively minimizing database loads.
