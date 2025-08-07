import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { fetchSyllabusPaged } from '../api/syllabus/syllabusAPI';
import { PagedData, Syllabus } from '../interfaces/ISchoolProgram';
import { 
    GetActiveAdvisors, 
    PagedAdvisorData, 
    PagedLeaveScheduleData,
    GetBookingAvailability,
    BookingAvailabilityData,
    getAdvisorMeetings,
    GetPagedLeaveSchedulesOneStaff
} from '../api/student/StudentAPI';
import { AdvisorMeetingPaged } from '../interfaces/IStudent';

interface UseStudentFeatureParams {
  search: string;
  page: number;
  pageSize: number;
  searchType?: 'code' | 'name' | 'all';
}

export const useStudentFeature = ({ search, page, pageSize, searchType = 'code' }: UseStudentFeatureParams) => {
  console.log('useStudentFeature called with:', { search, page, pageSize, searchType });
  return useQuery<PagedData<Syllabus> | null, Error>({
    queryKey: ['syllabus', search, searchType, page, pageSize],
    queryFn: () => {
      console.log('Calling API with search:', search);
      return fetchSyllabusPaged({ search, page, pageSize, searchType });
    },
    enabled: search !== undefined && search !== null, // Chỉ gọi API khi search được định nghĩa và không null
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

interface UseAdvisorsParams {
  page?: number;
  pageSize?: number;
}

export const useAdvisors = ({ page = 1, pageSize = 10 }: UseAdvisorsParams = {}) => {
  return useQuery<PagedAdvisorData | null, Error>({
    queryKey: ['advisors', page, pageSize],
    queryFn: () => GetActiveAdvisors(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook for fetching leave schedules
export const useLeaveSchedules = (staffProfileId: number | null) => {
  return useQuery<PagedLeaveScheduleData | null, Error>({
    queryKey: ['leaveSchedules', staffProfileId],
    queryFn: () => staffProfileId ? GetPagedLeaveSchedulesOneStaff(staffProfileId) : null,
    enabled: !!staffProfileId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook for fetching booking availability
export const useBookingAvailability = (staffProfileId: number | null) => {
  return useQuery<BookingAvailabilityData[] | null, Error>({
    queryKey: ['bookingAvailability', staffProfileId],
    queryFn: () => staffProfileId ? GetBookingAvailability(staffProfileId) : null,
    enabled: !!staffProfileId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook for fetching advisor meetings
export const useAdvisorMeetings = (staffProfileId: number | null) => {
  return useQuery<AdvisorMeetingPaged | null, Error>({
    queryKey: ['advisorMeetings', staffProfileId],
    queryFn: () => staffProfileId ? getAdvisorMeetings(staffProfileId) : null,
    enabled: !!staffProfileId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes (shorter for meetings)
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook for prefetching advisor data
export const usePrefetchAdvisorData = () => {
  const queryClient = useQueryClient();

  const prefetchAdvisorData = async (staffProfileId: number) => {
    // Prefetch leave schedules
    await queryClient.prefetchQuery({
      queryKey: ['leaveSchedules', staffProfileId],
      queryFn: () => GetPagedLeaveSchedulesOneStaff(staffProfileId),
      staleTime: 1000 * 60 * 15,
    });

    // Prefetch booking availability
    await queryClient.prefetchQuery({
      queryKey: ['bookingAvailability', staffProfileId],
      queryFn: () => GetBookingAvailability(staffProfileId),
      staleTime: 1000 * 60 * 15,
    });
  };

  return { prefetchAdvisorData };
};

// Hook for managing advisor data cache
export const useAdvisorDataManager = () => {
  const queryClient = useQueryClient();

  const invalidateAdvisorData = (staffProfileId: number) => {
    // Invalidate leave schedules
    queryClient.invalidateQueries({ queryKey: ['leaveSchedules', staffProfileId] });
    
    // Invalidate booking availability
    queryClient.invalidateQueries({ queryKey: ['bookingAvailability', staffProfileId] });
    
    // Invalidate advisor meetings
    queryClient.invalidateQueries({ queryKey: ['advisorMeetings', staffProfileId] });
  };

  const removeAdvisorData = (staffProfileId: number) => {
    queryClient.removeQueries({ queryKey: ['leaveSchedules', staffProfileId] });
    queryClient.removeQueries({ queryKey: ['bookingAvailability', staffProfileId] });
    queryClient.removeQueries({ queryKey: ['advisorMeetings', staffProfileId] });
  };

  const setAdvisorData = (staffProfileId: number, data: any) => {
    queryClient.setQueryData(['leaveSchedules', staffProfileId], data.leaveSchedules);
    queryClient.setQueryData(['bookingAvailability', staffProfileId], data.bookingAvailability);
    queryClient.setQueryData(['advisorMeetings', staffProfileId], data.meetings);
  };

  return { invalidateAdvisorData, removeAdvisorData, setAdvisorData };
};
