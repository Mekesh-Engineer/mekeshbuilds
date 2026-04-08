// src/hooks/useAnalyticsData.ts
// Fetches and shapes analytics data for the dashboard charts.
import { useQuery } from '@tanstack/react-query';
import * as adminService from '@/services/adminService';

export const useAnalyticsData = (userId: string, startDate: string, endDate: string) => {
  const pageViewsQuery = useQuery({
    queryKey: ['analytics', userId, startDate, endDate],
    queryFn: () => adminService.fetchPageViews(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });

  const projectClicksQuery = useQuery({
    queryKey: ['analytics', userId, 'clicks'],
    queryFn: () => adminService.fetchProjectClicks(userId),
    enabled: !!userId,
  });

  const isLoading = pageViewsQuery.isLoading || projectClicksQuery.isLoading;

  return {
    pageViews: pageViewsQuery.data,
    projectClicks: projectClicksQuery.data,
    isLoading,
  };
};
