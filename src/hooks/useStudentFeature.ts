import { useQuery, keepPreviousData, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchSyllabusPaged } from '../api/syllabus/syllabusAPI';
import { PagedData, Syllabus } from '../interfaces/ISchoolProgram';
import { 
    GetActiveAdvisors, 
    GetBookingAvailability,
   
    getAdvisorMeetings,
    GetPagedLeaveSchedulesOneStaff,
    getMaxNumberOfBan,
    getCurrentNumberOfBan,
    getJoinedSubjects,
    getJoinedSubjectById,
    getSubjectCheckpoints,
    getCheckpointDetail,
    updateCheckpoint,
    deleteCheckpoint,
    completeCheckpoint,
    generateCheckpoints,
    bulkSaveCheckpoints,
    createCheckpoint,
    getUpcomingCheckpoints
} from '../api/student/StudentAPI';
import { AdvisorMeetingPaged, BookingAvailabilityData, PagedAdvisorData, PagedLeaveScheduleData, MaxBanData, CurrentBanData, JoinedSubject, SubjectCheckpoint, SubjectCheckpointDetail } from '../interfaces/IStudent';

interface UseStudentFeatureParams {
  search: string;
  page: number;
  pageSize: number;
}

export const useStudentFeature = ({ search, page, pageSize }: UseStudentFeatureParams) => {
  return useQuery<PagedData<Syllabus> | null, Error>({
    queryKey: ['syllabus', search, page, pageSize],
    queryFn: () => {
      return fetchSyllabusPaged({ search, page, pageSize });
    },
    enabled: true, // Always enable to fetch data
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

// Hook for fetching max number of bans
export const useMaxNumberOfBan = () => {
  return useQuery<MaxBanData | null, Error>({
    queryKey: ['maxNumberOfBan'],
    queryFn: () => getMaxNumberOfBan(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook for fetching current number of bans
export const useCurrentNumberOfBan = () => {
  return useQuery<CurrentBanData | null, Error>({
    queryKey: ['currentNumberOfBan'],
    queryFn: () => getCurrentNumberOfBan(),
    staleTime: 1000 * 60 * 5, // 5 minutes (shorter for current data)
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook for fetching joined subjects
export const useJoinedSubjects = () => {
  return useQuery<JoinedSubject[], Error>({
    queryKey: ['joinedSubjects'],
    queryFn: async () => {
      const data = await getJoinedSubjects();
      // Ensure we always return an array, even if the API returns null
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook for fetching a single joined subject by ID
export const useJoinedSubjectById = (id: number | null) => {
  return useQuery<JoinedSubject | null, Error>({
    queryKey: ['joinedSubject', id],
    queryFn: () => id ? getJoinedSubjectById(id) : null,
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook for fetching subject checkpoints/todo list
export const useSubjectCheckpoints = (joinedSubjectId: number | null) => {
  return useQuery<SubjectCheckpoint[], Error>({
    queryKey: ['subjectCheckpoints', joinedSubjectId],
    queryFn: async () => {
      if (!joinedSubjectId) return [];
      const data = await getSubjectCheckpoints(joinedSubjectId);
      return data;
    },
    enabled: !!joinedSubjectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });
};

// Hook for fetching checkpoint details
export const useCheckpointDetail = (checkpointId: number | null) => {
  return useQuery<SubjectCheckpointDetail | null, Error>({
    queryKey: ['checkpointDetail', checkpointId],
    queryFn: async () => {
      if (!checkpointId) return null;
      const data = await getCheckpointDetail(checkpointId);
      return data;
    },
    enabled: !!checkpointId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook for updating checkpoint
export const useUpdateCheckpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SubjectCheckpointDetail, Error, { checkpointId: number; data: {
    title: string;
    content: string;
    note: string;
    link1: string;
    link2: string;
    link3: string;
    link4: string;
    link5: string;
    deadline: string;
  } }>({
    mutationFn: ({ checkpointId, data }) => updateCheckpoint(checkpointId, data),
    onSuccess: (updatedCheckpoint, variables) => {
      // Invalidate and refetch checkpoint detail
      queryClient.invalidateQueries({ queryKey: ['checkpointDetail', variables.checkpointId] });
      
      // Invalidate checkpoints list to refresh the main list
      queryClient.invalidateQueries({ queryKey: ['subjectCheckpoints'] });
      
      console.log('Checkpoint updated successfully:', updatedCheckpoint);
    },
    onError: (error) => {
      console.error('Failed to update checkpoint:', error);
    },
  });
};

// Hook for deleting checkpoint
export const useDeleteCheckpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, number>({
    mutationFn: (checkpointId: number) => deleteCheckpoint(checkpointId),
    onSuccess: (success, checkpointId) => {
      if (success) {
        // Invalidate checkpoints list to refresh the main list
        queryClient.invalidateQueries({ queryKey: ['subjectCheckpoints'] });
        
        // Remove checkpoint detail from cache if it exists
        queryClient.removeQueries({ queryKey: ['checkpointDetail', checkpointId] });
        
        console.log('Checkpoint deleted successfully');
      }
    },
    onError: (error) => {
      console.error('Failed to delete checkpoint:', error);
    },
  });
};

// Hook for completing checkpoint
export const useCompleteCheckpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, number>({
    mutationFn: (checkpointId: number) => completeCheckpoint(checkpointId),
    onSuccess: (success, checkpointId) => {
      if (success) {
        // Invalidate checkpoints list to refresh the main list
        queryClient.invalidateQueries({ queryKey: ['subjectCheckpoints'] });
        
        // Invalidate checkpoint detail if it exists
        queryClient.invalidateQueries({ queryKey: ['checkpointDetail', checkpointId] });
        
        console.log('Checkpoint completed successfully');
      }
    },
    onError: (error) => {
      console.error('Failed to complete checkpoint:', error);
    },
  });
};

// Hook for AI generating checkpoints
export const useGenerateCheckpoints = () => {
  return useMutation<any[], Error, { joinedSubjectId: number; studentMessage: string }>({
    mutationFn: ({ joinedSubjectId, studentMessage }) => generateCheckpoints(joinedSubjectId, studentMessage),
    onSuccess: (data) => {
      console.log('Checkpoints generated successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to generate checkpoints:', error);
    },
  });
};

// Hook for bulk saving checkpoints
export const useBulkSaveCheckpoints = () => {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, { joinedSubjectId: number; checkpoints: any[]; doReplaceAll: boolean }>({
    mutationFn: ({ joinedSubjectId, checkpoints, doReplaceAll }) => bulkSaveCheckpoints(joinedSubjectId, checkpoints, doReplaceAll),
    onSuccess: (success, variables) => {
      if (success) {
        // Invalidate checkpoints list to refresh the main list
        queryClient.invalidateQueries({ queryKey: ['subjectCheckpoints'] });
        
        console.log('Checkpoints saved successfully');
      }
    },
    onError: (error) => {
      console.error('Failed to save checkpoints:', error);
    },
  });
};

// Hook for creating single checkpoint
export const useCreateCheckpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SubjectCheckpointDetail, Error, { joinedSubjectId: number; data: {
    title: string;
    content: string;
    note: string;
    link1: string;
    link2: string;
    link3: string;
    link4: string;
    link5: string;
    deadline: string;
  } }>({
    mutationFn: ({ joinedSubjectId, data }) => createCheckpoint(joinedSubjectId, data),
    onSuccess: (newCheckpoint, variables) => {
      // Invalidate checkpoints list to refresh the main list
      queryClient.invalidateQueries({ queryKey: ['subjectCheckpoints'] });
      
      console.log('Checkpoint created successfully:', newCheckpoint);
    },
    onError: (error) => {
      console.error('Failed to create checkpoint:', error);
    },
  });
};

// Hook for fetching upcoming checkpoints/todos
export const useUpcomingCheckpoints = () => {
  return useQuery<SubjectCheckpoint[], Error>({
    queryKey: ['upcomingCheckpoints'],
    queryFn: async () => {
      const data = await getUpcomingCheckpoints();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });
};
