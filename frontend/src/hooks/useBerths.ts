import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useBerthStore } from '../stores/useBerthStore';
import type { Berth } from '../types';

export function useBerths() {
  const setBerths = useBerthStore((state) => state.setBerths);

  return useQuery({
    queryKey: ['berths'],
    queryFn: async () => {
      const berths = await api.getBerths();
      setBerths(berths);
      return berths;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30s
  });
}

export function useBerth(id: string | null) {
  return useQuery({
    queryKey: ['berths', id],
    queryFn: () => api.getBerth(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateBerth() {
  const queryClient = useQueryClient();
  const setBerths = useBerthStore((state) => state.setBerths);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Berth['status'] }) =>
      api.updateBerthStatus(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['berths'] });
      const previous = queryClient.getQueryData<Berth[]>(['berths']);

      queryClient.setQueryData<Berth[]>(['berths'], (old = []) =>
        old.map((b) => (b.id === id ? { ...b, status } : b))
      );

      if (previous) {
        const updated = previous.map((b) => (b.id === id ? { ...b, status } : b));
        setBerths(updated);
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['berths'], context.previous);
        setBerths(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['berths'] });
    },
  });
}
