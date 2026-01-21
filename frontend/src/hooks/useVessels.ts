import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useVesselStore } from '../stores/useVesselStore';
import type { Vessel } from '../types';

export function useVessels() {
  const setVessels = useVesselStore((state) => state.setVessels);

  return useQuery({
    queryKey: ['vessels'],
    queryFn: async () => {
      const vessels = await api.getVessels();
      setVessels(vessels);
      return vessels;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30s
  });
}

export function useVessel(id: string | null) {
  return useQuery({
    queryKey: ['vessels', id],
    queryFn: () => api.getVessel(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateVessel() {
  const queryClient = useQueryClient();
  const setVessels = useVesselStore((state) => state.setVessels);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vessel> }) =>
      api.updateVesselStatus(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vessels'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<Vessel[]>(['vessels']);

      // Optimistically update
      queryClient.setQueryData<Vessel[]>(['vessels'], (old = []) =>
        old.map((v) => (v.id === id ? { ...v, ...data } : v))
      );

      // Update Zustand store
      if (previous) {
        const updated = previous.map((v) => (v.id === id ? { ...v, ...data } : v));
        setVessels(updated);
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['vessels'], context.previous);
        setVessels(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
}
