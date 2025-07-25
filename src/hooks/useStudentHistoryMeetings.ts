import { useQuery } from '@tanstack/react-query';
import { getStudentMeetings } from '../api/student/StudentAPI';

export const useStudentHistoryMeetings = (pageNumber: number = 1, pageSize: number = 50) => {
  return useQuery({
    queryKey: ['studentHistoryMeetings', pageNumber, pageSize],
    queryFn: () => getStudentMeetings(pageNumber, pageSize),
    staleTime: 1000 * 60 * 10, // 10 phút
    gcTime: 1000 * 60 * 30, // 30 phút
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}; 