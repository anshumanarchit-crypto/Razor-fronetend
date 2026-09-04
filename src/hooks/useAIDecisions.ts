import { useQuery } from '@tanstack/react-query';
import { decisionsService } from '../services/decisionsService';
import { useDemoStore } from '../store/demoStore';

export function useDecisionsOverview() {
  const overviewMetrics = useDemoStore((state) => state.overviewMetrics);
  
  return useQuery({
    queryKey: ['decisionsOverview', overviewMetrics],
    queryFn: () => decisionsService.getOverview(),
  });
}

export function useModelHealth() {
  return useQuery({
    queryKey: ['modelHealth'],
    queryFn: () => decisionsService.getModelHealth(),
  });
}
