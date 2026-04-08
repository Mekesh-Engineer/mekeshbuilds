// src/hooks/usePortfolioData.ts
// React Query hooks for fetching and mutating portfolio data.
import { useQuery } from '@tanstack/react-query';
import * as profileService from '@/services/profileService';
import type { PortfolioData } from '@/types/profile.types';

/**
 * Fetch full portfolio data by userId or by public username.
 * When `username` is provided, the profile is resolved first,
 * then the remaining data is fetched by the resolved user ID.
 */
export const usePortfolioData = (userId: string | undefined, username?: string) => {
  // Resolve profile from username when no userId is given
  const profileByUsername = useQuery({
    queryKey: ['profile', 'username', username],
    queryFn: () => profileService.fetchProfileByUsername(username!),
    enabled: !userId && !!username,
  });

  const resolvedId = userId ?? profileByUsername.data?.id;

  const portfolioQuery = useQuery<PortfolioData>({
    queryKey: ['portfolio', resolvedId],
    queryFn: () => profileService.fetchFullPortfolio(resolvedId!),
    enabled: !!resolvedId,
  });

  const isLoading = profileByUsername.isLoading || portfolioQuery.isLoading;

  return {
    portfolio: portfolioQuery.data,
    isLoading,
    isError: portfolioQuery.isError || profileByUsername.isError,
  };
};
