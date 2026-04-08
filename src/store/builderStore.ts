// src/store/builderStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import type {
  Profile,
  Experience,
  Skill,
  Project,
  Certificate,
  PortfolioData,
} from '@/types/profile.types';

interface BuilderStore {
  // ── Draft data ──────────────────────────────────────────────────
  profile: Profile | null;
  experiences: Experience[];
  education: Experience[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];

  // ── UI state ────────────────────────────────────────────────────
  openSections: string[];
  activeViewport: 'desktop' | 'mobile';
  isDirty: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  lastSavedAt: Date | null;

  // ── Draft actions ───────────────────────────────────────────────
  updateProfile: (updates: Partial<Profile>) => void;
  addExperience: (entry: Omit<Experience, 'id' | 'created_at'>) => void;
  updateExperience: (index: number, updates: Partial<Experience>) => void;
  removeExperience: (index: number) => void;
  reorderExperiences: (newOrder: Experience[]) => void;
  addSkill: (skill: Omit<Skill, 'id' | 'created_at'>) => void;
  updateSkill: (index: number, updates: Partial<Skill>) => void;
  removeSkill: (index: number) => void;
  reorderSkills: (newOrder: Skill[]) => void;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProject: (index: number, updates: Partial<Project>) => void;
  removeProject: (index: number) => void;
  reorderProjects: (newOrder: Project[]) => void;

  // ── UI actions ──────────────────────────────────────────────────
  toggleSection: (section: string) => void;
  setViewport: (viewport: 'desktop' | 'mobile') => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
  setLastSavedAt: (date: Date) => void;

  // ── Lifecycle ───────────────────────────────────────────────────
  hydrateFromServer: (data: PortfolioData) => void;
  syncFromServer: (profile: Profile) => void;
  resetStore: () => void;
}

const initialState = {
  profile: null,
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certificates: [],
  openSections: [],
  activeViewport: 'desktop' as const,
  isDirty: false,
  saveStatus: 'saved' as const,
  lastSavedAt: null,
};

export const useBuilderStore = create<BuilderStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      // ── Draft actions ───────────────────────────────────────────
      updateProfile: (updates) =>
        set(
          (state) => {
            if (state.profile) {
              Object.assign(state.profile, updates);
              state.isDirty = true;
              state.saveStatus = 'unsaved';
            }
          },
          false,
          'updateProfile',
        ),

      addExperience: (entry) =>
        set(
          (state) => {
            state.experiences.push(entry as Experience);
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'addExperience',
        ),

      updateExperience: (index, updates) =>
        set(
          (state) => {
            const exp = state.experiences[index];
            if (exp) {
              Object.assign(exp, updates);
              state.isDirty = true;
              state.saveStatus = 'unsaved';
            }
          },
          false,
          'updateExperience',
        ),

      removeExperience: (index) =>
        set(
          (state) => {
            state.experiences.splice(index, 1);
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'removeExperience',
        ),

      reorderExperiences: (newOrder) =>
        set(
          (state) => {
            state.experiences = newOrder;
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'reorderExperiences',
        ),

      addSkill: (skill) =>
        set(
          (state) => {
            state.skills.push(skill as Skill);
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'addSkill',
        ),

      updateSkill: (index, updates) =>
        set(
          (state) => {
            const skill = state.skills[index];
            if (skill) {
              Object.assign(skill, updates);
              state.isDirty = true;
              state.saveStatus = 'unsaved';
            }
          },
          false,
          'updateSkill',
        ),

      removeSkill: (index) =>
        set(
          (state) => {
            state.skills.splice(index, 1);
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'removeSkill',
        ),

      reorderSkills: (newOrder) =>
        set(
          (state) => {
            state.skills = newOrder;
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'reorderSkills',
        ),

      addProject: (project) =>
        set(
          (state) => {
            state.projects.push(project as Project);
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'addProject',
        ),

      updateProject: (index, updates) =>
        set(
          (state) => {
            const proj = state.projects[index];
            if (proj) {
              Object.assign(proj, updates);
              state.isDirty = true;
              state.saveStatus = 'unsaved';
            }
          },
          false,
          'updateProject',
        ),

      removeProject: (index) =>
        set(
          (state) => {
            state.projects.splice(index, 1);
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'removeProject',
        ),

      reorderProjects: (newOrder) =>
        set(
          (state) => {
            state.projects = newOrder;
            state.isDirty = true;
            state.saveStatus = 'unsaved';
          },
          false,
          'reorderProjects',
        ),

      // ── UI actions ──────────────────────────────────────────────
      toggleSection: (section) =>
        set(
          (state) => {
            const idx = state.openSections.indexOf(section);
            if (idx >= 0) {
              state.openSections.splice(idx, 1);
            } else {
              state.openSections.push(section);
            }
          },
          false,
          'toggleSection',
        ),

      setViewport: (viewport) =>
        set({ activeViewport: viewport }, false, 'setViewport'),

      setSaveStatus: (status) =>
        set({ saveStatus: status }, false, 'setSaveStatus'),

      setLastSavedAt: (date) =>
        set({ lastSavedAt: date }, false, 'setLastSavedAt'),

      // ── Lifecycle ───────────────────────────────────────────────
      hydrateFromServer: (data) =>
        set(
          (state) => {
            state.profile = data.profile;
            state.experiences = data.experiences.filter((e) => e.type === 'work');
            state.education = data.experiences.filter((e) => e.type === 'education');
            state.skills = data.skills;
            state.projects = data.projects;
            state.certificates = data.certificates;
            state.isDirty = false;
            state.saveStatus = 'saved';
          },
          false,
          'hydrateFromServer',
        ),

      syncFromServer: (profile) =>
        set(
          (state) => {
            state.profile = profile;
          },
          false,
          'syncFromServer',
        ),

      resetStore: () => set(initialState, false, 'resetStore'),
    })),
    { name: 'BuilderStore' },
  ),
);
