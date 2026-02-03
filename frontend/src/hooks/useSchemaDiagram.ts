import { useQuery } from '@tanstack/react-query';
import { prioAPI } from '../api/client';
import { mockSchemaDiagram } from '../mocks/schemaDiagram';

const ENABLE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false';

export function useSchemaDiagram() {
  return useQuery({
    queryKey: ['schema', 'diagram'],
    queryFn: async () => {
      try {
        const dot = await prioAPI.schema.getDiagram();
        if (!dot && ENABLE_MOCKS) return mockSchemaDiagram;
        return dot;
      } catch (error) {
        if (ENABLE_MOCKS) {
          console.warn('Falling back to mock schema diagram due to error', error);
          return mockSchemaDiagram;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}
