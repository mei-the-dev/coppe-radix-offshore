import { useQuery } from '@tanstack/react-query';
import { prioAPI } from '../api/client';
import type { Trip } from '../types/trips';

export interface UseTripsParams {
  vessel_id?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}

export function useTrips(params?: UseTripsParams) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: async () => {
      const response = await prioAPI.trips.list(params);
      return (response.data || []) as Trip[];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for active trips
  });
}

export function useTrip(id: string | null) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      if (!id) return null;
      // For now, fetch all trips and filter by id
      // TODO: Add getTrip(id) endpoint to API
      const response = await prioAPI.trips.list();
      const trips = (response.data || []) as Trip[];
      return trips.find(t => t.id === id) || null;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}
