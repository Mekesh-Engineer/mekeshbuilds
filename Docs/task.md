# Dual System Architecture Implementation Task List

- [ ] Inspect existing project setup (check dependencies like React Query, Firebase).
- [ ] Create `src/data/fallbacks.ts` containing the static fallback data for the home page sections (Hero, Skills, Projects, Blog, Testimonials, etc.).
- [ ] Implement robust specific React hooks using Firebase `onSnapshot` / React Query (e.g., `useProfileData`, `useProjectsData`, etc.) with offline support.
- [ ] Refactor `src/components/Pages/Home/HeroSection.tsx` to handle dynamic data or fallback.
- [ ] Refactor `src/components/Pages/Home/MySkillSection.tsx` to handle dynamic data or fallback.
- [ ] Refactor `src/components/Pages/Home/ProjectSection.tsx` to handle dynamic data or fallback.
- [ ] Refactor `src/components/Pages/Home/BlogSection.tsx` to handle dynamic data or fallback.
- [ ] Refactor `src/components/Pages/Home/TestimonialSection.tsx` to handle dynamic data or fallback.
- [ ] Ensure any remaining Home page sections (e.g. `Achievements.tsx`, `MapSection.tsx`, `Ctasection.tsx`) are also using the updated architecture if applicable.
- [ ] Verify debounced autosave functionality in the Builder Page (`src/store/builderStore.ts` & `src/pages/admin/BuilderPage.tsx`).
- [ ] Perform a system-wide check to verify behavior in typical and fallback scenarios.
