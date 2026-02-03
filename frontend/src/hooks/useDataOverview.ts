import { useQuery } from '@tanstack/react-query';
import { prioAPI } from '../api/client';
import type { DataOverviewResponse } from '../types';

export function useDataOverview() {
  return useQuery<DataOverviewResponse>({
    queryKey: ['data-overview'],
    queryFn: () => prioAPI.analytics.getDataOverview(),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
