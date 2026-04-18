// src/hooks/useAutoSave.test.ts
// Tests the debounce-driven autosave hook's state machine:
// idle -> saving -> saved/unsaved transitions.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useBuilderStore } from '@/stores/builderStore';
import type { Profile } from '@/types/profile.types';

// ─── Mock profileService ──────────────────────────────────────────────────────
vi.mock('@/services/profileService', () => ({
  updateProfile: vi.fn(),
}));

import * as profileService from '@/services/profileService';

// ─── Minimal Profile fixture ──────────────────────────────────────────────────
const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'profile-1',
  username: 'mekesh',
  full_name: 'Mekesh Kumar',
  email: 'mekesh@example.com',
  avatar_url: null,
  headline: null,
  bio: 'Test bio',
  bio_extended: null,
  location_context: null,
  phone: null,
  city: null,
  website_url: null,
  github_url: null,
  linkedin_url: null,
  twitter_url: null,
  resume_url: null,
  resume_download_enabled: true,
  theme_color: '#ff6b2c',
  secondary_color: '#ff8a57',
  font_pairing: 'Inter-Outfit',
  theme_mode: 'dark',
  meta_title: null,
  meta_description: null,
  og_image_url: null,
  noindex: false,
  is_published: true,
  availability_status: 'available',
  location_lat: null,
  location_lng: null,
  about_photo_url: null,
  role: 'owner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  hero_image_url: null,
  hero_badges: null,
  ...overrides,
});

// ─── React Query wrapper ───────────────────────────────────────────────────────
function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAutoSave', () => {
  beforeEach(() => {
    useBuilderStore.setState({
      profile: null,
      isDirty: false,
      saveStatus: 'saved',
      lastSavedAt: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    useBuilderStore.getState().resetStore();
  });

  it('returns saveStatus "saved" when store is clean', () => {
    const { result } = renderHook(() => useAutoSave(), { wrapper: makeWrapper() });

    expect(result.current.saveStatus).toBe('saved');
  });

  it('does not trigger a mutation when isDirty is false', async () => {
    renderHook(() => useAutoSave(), { wrapper: makeWrapper() });

    await new Promise((resolve) => setTimeout(resolve, 850));

    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it('does not trigger mutation when profile has no id', async () => {
    useBuilderStore.setState({ profile: makeProfile({ id: '' }), isDirty: true });

    renderHook(() => useAutoSave(), { wrapper: makeWrapper() });

    await new Promise((resolve) => setTimeout(resolve, 850));

    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it('triggers mutation after 800ms debounce when isDirty is true', async () => {
    const mockUpdateProfile = vi.mocked(profileService.updateProfile);
    mockUpdateProfile.mockResolvedValueOnce(makeProfile());

    useBuilderStore.setState({
      profile: makeProfile(),
      isDirty: true,
      saveStatus: 'unsaved',
    });

    renderHook(() => useAutoSave(), { wrapper: makeWrapper() });

    // Ensure it's not called immediately
    expect(mockUpdateProfile).not.toHaveBeenCalled();

    // Wait for the native debounce
    await waitFor(
      () => {
        expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
      },
      { timeout: 1500 },
    );
  });

  it('transitions to "saved" status on successful mutation', async () => {
    const mockUpdateProfile = vi.mocked(profileService.updateProfile);
    mockUpdateProfile.mockResolvedValueOnce(makeProfile());

    useBuilderStore.setState({
      profile: makeProfile(),
      isDirty: true,
      saveStatus: 'unsaved',
    });

    const { result } = renderHook(() => useAutoSave(), { wrapper: makeWrapper() });

    await waitFor(
      () => {
        expect(result.current.saveStatus).toBe('saved');
      },
      { timeout: 1500 },
    );
  });

  it('transitions to "unsaved" status on failed mutation', async () => {
    const mockUpdateProfile = vi.mocked(profileService.updateProfile);
    mockUpdateProfile.mockRejectedValueOnce(new Error('Firestore write failed'));

    useBuilderStore.setState({
      profile: makeProfile(),
      isDirty: true,
      saveStatus: 'saved', // start from saved so we can see transition to unsaved via onError
    });

    const { result } = renderHook(() => useAutoSave(), { wrapper: makeWrapper() });

    await waitFor(
      () => {
        expect(result.current.saveStatus).toBe('unsaved');
      },
      { timeout: 1500 },
    );
  });
});
