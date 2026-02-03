import { useQuery } from '@tanstack/react-query';
import { prioAPI } from '../api/client';
import type { DataOverviewResponse } from '../types';
import { mockDataOverview } from '../mocks/dataOverview';

const ENABLE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false';

export function useDataOverview() {
  return useQuery<DataOverviewResponse>({
    queryKey: ['data-overview'],
    queryFn: async () => {
      try {
        const response = await prioAPI.analytics.getDataOverview();
        if (!response && ENABLE_MOCKS) return mockDataOverview;
        return response;
      } catch (error) {
        if (ENABLE_MOCKS) {
          console.warn('Falling back to mock data overview due to error', error);
          return mockDataOverview;
        }
        throw error;
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
