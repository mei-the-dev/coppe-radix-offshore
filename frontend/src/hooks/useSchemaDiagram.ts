import { useQuery } from '@tanstack/react-query';
import { prioAPI } from '../api/client';

export function useSchemaDiagram() {
  return useQuery({
    queryKey: ['schema', 'diagram'],
    queryFn: () => prioAPI.schema.getDiagram(),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}
