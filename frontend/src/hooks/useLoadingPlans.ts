import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useLoadingPlanStore } from '../stores/useLoadingPlanStore';
import type { LoadingPlan } from '../types';

export function useLoadingPlans() {
  const setLoadingPlans = useLoadingPlanStore((state) => state.setLoadingPlans);

  return useQuery({
    queryKey: ['loadingPlans'],
    queryFn: async () => {
      const plans = await api.getLoadingPlans();
      setLoadingPlans(plans);
      return plans;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30s
  });
}

export function useLoadingPlan(id: string | null) {
  return useQuery({
    queryKey: ['loadingPlans', id],
    queryFn: () => api.getLoadingPlan(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateLoadingPlan() {
  const queryClient = useQueryClient();
  const addLoadingPlan = useLoadingPlanStore((state) => state.addLoadingPlan);

  return useMutation({
    mutationFn: (plan: Parameters<typeof api.createLoadingPlan>[0]) =>
      api.createLoadingPlan(plan),
    onMutate: async (newPlan) => {
      await queryClient.cancelQueries({ queryKey: ['loadingPlans'] });
      const previous = queryClient.getQueryData<LoadingPlan[]>(['loadingPlans']);

      // Optimistically add plan (with temporary ID)
      const optimisticPlan: LoadingPlan = {
        id: `temp-${Date.now()}`,
        vesselId: newPlan.vesselId,
        berthId: newPlan.berthId,
        scheduledStart: newPlan.scheduledStart,
        scheduledEnd: newPlan.scheduledEnd || '',
        status: 'planned',
        cargoItems: newPlan.cargoItems || [],
        estimatedDuration: newPlan.estimatedDuration || 8,
        loadingSequence: [],
        isValid: true,
      };

      queryClient.setQueryData<LoadingPlan[]>(['loadingPlans'], (old = []) => [
        ...old,
        optimisticPlan,
      ]);

      addLoadingPlan(optimisticPlan);

      return { previous };
    },
    onSuccess: (data) => {
      // Replace optimistic plan with real one
      queryClient.setQueryData<LoadingPlan[]>(['loadingPlans'], (old = []) => {
        const withoutTemp = old.filter((p) => !p.id.startsWith('temp-'));
        return [...withoutTemp, data];
      });
      addLoadingPlan(data);
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['loadingPlans'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loadingPlans'] });
    },
  });
}

export function useUpdateLoadingPlan() {
  const queryClient = useQueryClient();
  const updateLoadingPlan = useLoadingPlanStore((state) => state.updateLoadingPlan);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LoadingPlan> }) =>
      api.updateLoadingPlan(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['loadingPlans'] });
      const previous = queryClient.getQueryData<LoadingPlan[]>(['loadingPlans']);

      queryClient.setQueryData<LoadingPlan[]>(['loadingPlans'], (old = []) =>
        old.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );

      if (previous) {
        const updated = previous.map((p) => (p.id === id ? { ...p, ...updates } : p));
        updated.forEach((p) => updateLoadingPlan(p.id, updates));
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['loadingPlans'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loadingPlans'] });
    },
  });
}

export function useDeleteLoadingPlan() {
  const queryClient = useQueryClient();
  const removeLoadingPlan = useLoadingPlanStore((state) => state.removeLoadingPlan);

  return useMutation({
    mutationFn: (id: string) => api.deleteLoadingPlan(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['loadingPlans'] });
      const previous = queryClient.getQueryData<LoadingPlan[]>(['loadingPlans']);

      queryClient.setQueryData<LoadingPlan[]>(['loadingPlans'], (old = []) =>
        old.filter((p) => p.id !== id)
      );

      removeLoadingPlan(id);

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['loadingPlans'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loadingPlans'] });
    },
  });
}
