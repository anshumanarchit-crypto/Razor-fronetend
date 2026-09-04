import { useQuery } from '@tanstack/react-query';
import { recoveryService } from '../services/recoveryService';
import { useDemoStore } from '../store/demoStore';

export function useRecoveryCases(domain?: string, status?: string, search?: string) {
  const cases = useDemoStore((state) => state.cases);
  
  return useQuery({
    queryKey: ['recoveryCases', domain, status, search, cases],
    queryFn: () => recoveryService.getCases(domain, status, search),
  });
}

export function useCaseDetail(caseId: string | null) {
  const caseDetails = useDemoStore((state) => state.caseDetails);
  
  return useQuery({
    queryKey: ['caseDetail', caseId, caseDetails],
    queryFn: () => (caseId ? recoveryService.getCaseDetail(caseId) : null),
    enabled: !!caseId,
  });
}
