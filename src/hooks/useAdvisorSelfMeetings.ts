import { useQuery } from '@tanstack/react-query';
import { getAdvisorSelfMeetings } from '../api/advisor/AdvisorAPI';

export const useAdvisorSelfMeetings = (pageNumber: number = 1, pageSize: number = 50) => {
  return useQuery({
    queryKey: ['advisorSelfMeetings', pageNumber, pageSize],
    queryFn: () => getAdvisorSelfMeetings(pageNumber, pageSize),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}; 