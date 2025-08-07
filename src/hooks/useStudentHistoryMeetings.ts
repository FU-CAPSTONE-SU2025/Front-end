import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllStudentSelfBookings, getStudentBookingsForCalendar, cancelPendingMeeting, cancelConfirmedMeeting, sendMeetingFeedback, markAdvisorMissed } from '../api/student/StudentAPI';
import { confirmMeeting, cancelPendingMeeting as cancelPendingMeetingAdvisor, completeMeeting, addReasonForOverdue } from '../api/advisor/AdvisorAPI';
import { IStudentBookingResponse, IStudentBookingCalendarResponse } from '../interfaces/IStudent';
import { message } from 'antd';
import { getUserFriendlyErrorMessage } from '../api/AxiosCRUD';

// Hook cho calendar data (API riêng với interface đơn giản)
export const useStudentHistoryMeetings = (pageNumber: number, pageSize: number) => {
  return useQuery<IStudentBookingCalendarResponse>({
    queryKey: ['studentHistoryMeetings', pageNumber, pageSize],
    queryFn: () => getStudentBookingsForCalendar(pageNumber, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Hook cho các chức năng khác (giữ nguyên API cũ với interface đầy đủ)
export const useStudentHistoryMeetingsOriginal = (pageNumber: number, pageSize: number) => {
  return useQuery<IStudentBookingResponse>({
    queryKey: ['studentHistoryMeetingsOriginal', pageNumber, pageSize],
    queryFn: () => getAllStudentSelfBookings(pageNumber, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Helper function to invalidate all history meeting queries
const invalidateHistoryQueries = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
  queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
  queryClient.invalidateQueries({ queryKey: ['advisorMeetings'] });
};

// Hook for canceling pending meeting with optimistic updates
export const useCancelPendingMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      cancelPendingMeeting(meetingId, note),
    onMutate: async ({ meetingId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
      
      // Snapshot the previous value
      const previousCalendarData = queryClient.getQueryData(['studentHistoryMeetings']);
      const previousListData = queryClient.getQueryData(['studentHistoryMeetingsOriginal']);
      
      // Optimistically update the UI
      queryClient.setQueryData(['studentHistoryMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 9 } : item
          )
        };
      });
      
      queryClient.setQueryData(['studentHistoryMeetingsOriginal'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 9 } : item
          )
        };
      });
      
      return { previousCalendarData, previousListData };
    },
    onError: (err, variables, context) => {
      if (context?.previousCalendarData) {
        queryClient.setQueryData(['studentHistoryMeetings'], context.previousCalendarData);
      }
      if (context?.previousListData) {
        queryClient.setQueryData(['studentHistoryMeetingsOriginal'], context.previousListData);
      }
      // Remove error message - let useMeetingActions handle it
    },
    onSuccess: () => {
      // Remove success message - let useMeetingActions handle it
      invalidateHistoryQueries(queryClient);
    },
    onSettled: () => {
      // Always refetch after error or success
      invalidateHistoryQueries(queryClient);
    },
  });
};

// Hook for canceling confirmed meeting with optimistic updates
export const useCancelConfirmedMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      cancelConfirmedMeeting(meetingId, note),
    onMutate: async ({ meetingId }) => {
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
      
      const previousCalendarData = queryClient.getQueryData(['studentHistoryMeetings']);
      const previousListData = queryClient.getQueryData(['studentHistoryMeetingsOriginal']);
      
      queryClient.setQueryData(['studentHistoryMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 9 } : item
          )
        };
      });
      
      queryClient.setQueryData(['studentHistoryMeetingsOriginal'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 9 } : item
          )
        };
      });
      
      return { previousCalendarData, previousListData };
    },
    onError: (err, variables, context) => {
      if (context?.previousCalendarData) {
        queryClient.setQueryData(['studentHistoryMeetings'], context.previousCalendarData);
      }
      if (context?.previousListData) {
        queryClient.setQueryData(['studentHistoryMeetingsOriginal'], context.previousListData);
      }
      // Remove error message - let useMeetingActions handle it
    },
    onSuccess: () => {
      // Remove success message - let useMeetingActions handle it
      invalidateHistoryQueries(queryClient);
    },
    onSettled: () => {
      invalidateHistoryQueries(queryClient);
    },
  });
};

// Hook for sending meeting feedback with optimistic updates
export const useSendMeetingFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, feedback, suggestionFromAdvisor }: { 
      meetingId: number; 
      feedback: string; 
      suggestionFromAdvisor: string; 
    }) => sendMeetingFeedback(meetingId, feedback, suggestionFromAdvisor),
    onMutate: async ({ meetingId, feedback, suggestionFromAdvisor }) => {
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
      
      const previousCalendarData = queryClient.getQueryData(['studentHistoryMeetings']);
      const previousListData = queryClient.getQueryData(['studentHistoryMeetingsOriginal']);
      
      // Optimistically update with feedback
      queryClient.setQueryData(['studentHistoryMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { 
              ...item, 
              feedback, 
              suggestionFromAdvisor 
            } : item
          )
        };
      });
      
      queryClient.setQueryData(['studentHistoryMeetingsOriginal'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { 
              ...item, 
              feedback, 
              suggestionFromAdvisor 
            } : item
          )
        };
      });
      
      return { previousCalendarData, previousListData };
    },
    onError: (err, variables, context) => {
      if (context?.previousCalendarData) {
        queryClient.setQueryData(['studentHistoryMeetings'], context.previousCalendarData);
      }
      if (context?.previousListData) {
        queryClient.setQueryData(['studentHistoryMeetingsOriginal'], context.previousListData);
      }
      // Remove error message - let useMeetingActions handle it
    },
    onSuccess: () => {
      // Remove success message - let useMeetingActions handle it
      invalidateHistoryQueries(queryClient);
    },
    onSettled: () => {
      invalidateHistoryQueries(queryClient);
    },
  });
};

// Hook for marking advisor missed with optimistic updates
export const useMarkAdvisorMissed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      markAdvisorMissed(meetingId, note),
    onMutate: async ({ meetingId }) => {
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
      
      const previousCalendarData = queryClient.getQueryData(['studentHistoryMeetings']);
      const previousListData = queryClient.getQueryData(['studentHistoryMeetingsOriginal']);
      
      queryClient.setQueryData(['studentHistoryMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 6 } : item
          )
        };
      });
      
      queryClient.setQueryData(['studentHistoryMeetingsOriginal'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 6 } : item
          )
        };
      });
      
      return { previousCalendarData, previousListData };
    },
    onError: (err, variables, context) => {
      if (context?.previousCalendarData) {
        queryClient.setQueryData(['studentHistoryMeetings'], context.previousCalendarData);
      }
      if (context?.previousListData) {
        queryClient.setQueryData(['studentHistoryMeetingsOriginal'], context.previousListData);
      }
      // Remove error message - let useMeetingActions handle it
    },
    onSuccess: () => {
      // Remove success message - let useMeetingActions handle it
      invalidateHistoryQueries(queryClient);
    },
    onSettled: () => {
      invalidateHistoryQueries(queryClient);
    },
  });
};

// Hook for advisor confirming meeting with optimistic updates
export const useConfirmMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meetingId: number) => confirmMeeting(meetingId),
    onMutate: async (meetingId) => {
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
      await queryClient.cancelQueries({ queryKey: ['advisorMeetings'] });
      
      const previousCalendarData = queryClient.getQueryData(['studentHistoryMeetings']);
      const previousListData = queryClient.getQueryData(['studentHistoryMeetingsOriginal']);
      
      queryClient.setQueryData(['studentHistoryMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 2 } : item
          )
        };
      });
      
      queryClient.setQueryData(['studentHistoryMeetingsOriginal'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 2 } : item
          )
        };
      });
      
      return { previousCalendarData, previousListData };
    },
    onError: (err, variables, context) => {
      if (context?.previousCalendarData) {
        queryClient.setQueryData(['studentHistoryMeetings'], context.previousCalendarData);
      }
      if (context?.previousListData) {
        queryClient.setQueryData(['studentHistoryMeetingsOriginal'], context.previousListData);
      }
      // Remove error message - let useMeetingActions handle it
    },
    onSuccess: () => {
      // Remove success message - let useMeetingActions handle it
      invalidateHistoryQueries(queryClient);
    },
    onSettled: () => {
      invalidateHistoryQueries(queryClient);
    },
  });
};

// Hook for advisor canceling pending meeting with optimistic updates
export const useCancelPendingMeetingAdvisor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      cancelPendingMeetingAdvisor(meetingId, note),
    onMutate: async ({ meetingId }) => {
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
      await queryClient.cancelQueries({ queryKey: ['advisorMeetings'] });
      
      const previousCalendarData = queryClient.getQueryData(['studentHistoryMeetings']);
      const previousListData = queryClient.getQueryData(['studentHistoryMeetingsOriginal']);
      
      queryClient.setQueryData(['studentHistoryMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 3 } : item
          )
        };
      });
      
      queryClient.setQueryData(['studentHistoryMeetingsOriginal'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 3 } : item
          )
        };
      });
      
      return { previousCalendarData, previousListData };
    },
    onError: (err, variables, context) => {
      if (context?.previousCalendarData) {
        queryClient.setQueryData(['studentHistoryMeetings'], context.previousCalendarData);
      }
      if (context?.previousListData) {
        queryClient.setQueryData(['studentHistoryMeetingsOriginal'], context.previousListData);
      }
      // Remove error message - let useMeetingActions handle it
    },
    onSuccess: () => {
      // Remove success message - let useMeetingActions handle it
      invalidateHistoryQueries(queryClient);
    },
    onSettled: () => {
      invalidateHistoryQueries(queryClient);
    },
  });
};

// Hook for completing meeting with optimistic updates
export const useCompleteMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, checkInCode }: { meetingId: number; checkInCode: string }) => 
      completeMeeting(meetingId, checkInCode),
    onMutate: async ({ meetingId }) => {
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetingsOriginal'] });
      await queryClient.cancelQueries({ queryKey: ['advisorMeetings'] });
      
      const previousCalendarData = queryClient.getQueryData(['studentHistoryMeetings']);
      const previousListData = queryClient.getQueryData(['studentHistoryMeetingsOriginal']);
      
      queryClient.setQueryData(['studentHistoryMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 4 } : item
          )
        };
      });
      
      queryClient.setQueryData(['studentHistoryMeetingsOriginal'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 4 } : item
          )
        };
      });
      
      return { previousCalendarData, previousListData };
    },
    onError: (err, variables, context) => {
      if (context?.previousCalendarData) {
        queryClient.setQueryData(['studentHistoryMeetings'], context.previousCalendarData);
      }
      if (context?.previousListData) {
        queryClient.setQueryData(['studentHistoryMeetingsOriginal'], context.previousListData);
      }
      // Remove error message - let useMeetingActions handle it
    },
    onSuccess: () => {
      // Remove success message - let useMeetingActions handle it
      invalidateHistoryQueries(queryClient);
    },
    onSettled: () => {
      invalidateHistoryQueries(queryClient);
    },
  });
};

// Hook for adding reason for overdue meeting
export const useAddReasonForOverdue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      addReasonForOverdue(meetingId, note),
    onSuccess: () => {
      invalidateHistoryQueries(queryClient);
    },
    onError: (err) => {
      // Remove error message - let useMeetingActions handle it
    },
    onSettled: () => {
      invalidateHistoryQueries(queryClient);
    },
  });
};