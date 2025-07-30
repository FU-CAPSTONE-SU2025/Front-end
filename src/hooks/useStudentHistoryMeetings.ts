import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentMeetings, cancelPendingMeeting, cancelConfirmedMeeting, sendMeetingFeedback, markAdvisorMissed } from '../api/student/StudentAPI';
import { confirmMeeting, cancelPendingMeeting as cancelPendingMeetingAdvisor, completeMeeting } from '../api/advisor/AdvisorAPI';

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

// Hook for canceling pending meeting
export const useCancelPendingMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      cancelPendingMeeting(meetingId, note),
    onSuccess: () => {
      // Invalidate all student history meetings queries
      queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
    },
  });
};

// Hook for canceling confirmed meeting
export const useCancelConfirmedMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      cancelConfirmedMeeting(meetingId, note),
    onSuccess: () => {
      // Invalidate all student history meetings queries
      queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
    },
  });
};

// Hook for sending meeting feedback
export const useSendMeetingFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, feedback, suggestionFromAdvisor }: { 
      meetingId: number; 
      feedback: string; 
      suggestionFromAdvisor: string; 
    }) => sendMeetingFeedback(meetingId, feedback, suggestionFromAdvisor),
    onSuccess: () => {
      // Invalidate all student history meetings queries
      queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
    },
  });
};

// Hook for marking advisor missed
export const useMarkAdvisorMissed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      markAdvisorMissed(meetingId, note),
    onSuccess: () => {
      // Invalidate all student history meetings queries
      queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
    },
  });
}; 

// Hook for advisor confirming meeting
export const useConfirmMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meetingId: number) => confirmMeeting(meetingId),
    onSuccess: () => {
      // Invalidate all advisor meetings queries
      queryClient.invalidateQueries({ queryKey: ['advisorMeetings'] });
      queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
    },
  });
};

// Hook for advisor canceling pending meeting
export const useCancelPendingMeetingAdvisor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      cancelPendingMeetingAdvisor(meetingId, note),
    onSuccess: () => {
      // Invalidate all advisor meetings queries
      queryClient.invalidateQueries({ queryKey: ['advisorMeetings'] });
      queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
    },
  });
};

// Hook for completing meeting
export const useCompleteMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, checkInCode }: { meetingId: number; checkInCode: string }) => 
      completeMeeting(meetingId, checkInCode),
    onSuccess: () => {
      // Invalidate all advisor meetings queries
      queryClient.invalidateQueries({ queryKey: ['advisorMeetings'] });
      queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
    },
  });
}; 