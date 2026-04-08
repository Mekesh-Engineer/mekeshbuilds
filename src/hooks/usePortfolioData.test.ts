// src/hooks/usePortfolioData.test.ts
// Tests the portfolio data fetching hook — covers username resolution,
// direct userId fetching, loading/error states, and disabled query behavior.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import type { Profile, PortfolioData } from '@/types/profile.types';

// ─── Mock profileService ──────────────────────────────────────────────────────
vi.mock('@/services/profileService', () => ({
  fetchProfileByUsername: vi.fn(),
  fetchFullPortfolio: vi.fn(),
}));

import * as profileService from '@/services/profileService';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockProfile: Profile = {
  id: 'user-1',
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
};

const mockPortfolioData: PortfolioData = {
  profile: mockProfile,
  experiences: [],
  skills: [],
  projects: [],
  certificates: [],
};

// ─── Wrapper factory ──────────────────────────────────────────────────────────
function makeWrapper(staleTime = 0) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('usePortfolioData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoading=false and no data when both userId and username are undefined', () => {
    const { result } = renderHook(() => usePortfolioData(undefined, undefined), {
      wrapper: makeWrapper(),
    });

    // Both queries disabled — should be in idle/loading=false state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.portfolio).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it('fetches portfolio directly when userId is provided', async () => {
    vi.mocked(profileService.fetchFullPortfolio).mockResolvedValueOnce(mockPortfolioData);

    const { result } = renderHook(() => usePortfolioData('user-1'), { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(profileService.fetchFullPortfolio).toHaveBeenCalledWith('user-1');
    expect(profileService.fetchProfileByUsername).not.toHaveBeenCalled();
    expect(result.current.portfolio).toEqual(mockPortfolioData);
  });

  it('resolves profile by username then fetches full portfolio', async () => {
    vi.mocked(profileService.fetchProfileByUsername).mockResolvedValueOnce(mockProfile);
    vi.mocked(profileService.fetchFullPortfolio).mockResolvedValueOnce(mockPortfolioData);

    const { result } = renderHook(() => usePortfolioData(undefined, 'mekesh'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(profileService.fetchProfileByUsername).toHaveBeenCalledWith('mekesh');
    expect(profileService.fetchFullPortfolio).toHaveBeenCalledWith('user-1');
    expect(result.current.portfolio).toEqual(mockPortfolioData);
  });

  it('sets isError=true when portfolio fetch fails', async () => {
    vi.mocked(profileService.fetchFullPortfolio).mockRejectedValueOnce(
      new Error('Firestore read failed'),
    );

    const { result } = renderHook(() => usePortfolioData('user-1'), { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.portfolio).toBeUndefined();
  });

  it('sets isError=true when username resolution fails', async () => {
    vi.mocked(profileService.fetchProfileByUsername).mockRejectedValueOnce(
      new Error('Username not found'),
    );

    const { result } = renderHook(() => usePortfolioData(undefined, 'unknown-user'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('userId takes priority over username — skips username lookup', async () => {
    vi.mocked(profileService.fetchFullPortfolio).mockResolvedValueOnce(mockPortfolioData);

    const { result } = renderHook(() => usePortfolioData('user-1', 'mekesh'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // fetchProfileByUsername should NOT have been called
    expect(profileService.fetchProfileByUsername).not.toHaveBeenCalled();
    expect(profileService.fetchFullPortfolio).toHaveBeenCalledWith('user-1');
  });
});
