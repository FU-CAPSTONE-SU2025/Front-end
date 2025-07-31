import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdvisorSelfMeetings, getAdvisorActiveMeetings, confirmMeeting, cancelPendingMeeting, completeMeeting } from '../api/advisor/AdvisorAPI';
import { message } from 'antd';

// Hook cho calendar data (API riêng với interface đơn giản)
export const useAdvisorActiveMeetings = (pageNumber: number, pageSize: number) => {
  return useQuery({
    queryKey: ['advisorActiveMeetings', pageNumber, pageSize],
    queryFn: () => getAdvisorActiveMeetings(pageNumber, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Hook cho các chức năng khác (giữ nguyên API cũ với interface đầy đủ)
export const useAdvisorSelfMeetings = (pageNumber: number = 1, pageSize: number = 50) => {
  return useQuery({
    queryKey: ['advisorSelfMeetings', pageNumber, pageSize],
    queryFn: () => getAdvisorSelfMeetings(pageNumber, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Helper function to invalidate all advisor meeting queries
const invalidateAdvisorQueries = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ['advisorActiveMeetings'] });
  queryClient.invalidateQueries({ queryKey: ['advisorSelfMeetings'] });
  queryClient.invalidateQueries({ queryKey: ['studentHistoryMeetings'] });
};

// Hook for advisor confirming meeting with optimistic updates
export const useConfirmMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meetingId: number) => confirmMeeting(meetingId),
    onMutate: async (meetingId) => {
      await queryClient.cancelQueries({ queryKey: ['advisorActiveMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['advisorSelfMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      
      const previousActiveData = queryClient.getQueryData(['advisorActiveMeetings']);
      const previousSelfData = queryClient.getQueryData(['advisorSelfMeetings']);
      
      queryClient.setQueryData(['advisorActiveMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 2 } : item
          )
        };
      });
      
      queryClient.setQueryData(['advisorSelfMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 2 } : item
          )
        };
      });
      
      return { previousActiveData, previousSelfData };
    },
    onError: (err, variables, context) => {
      if (context?.previousActiveData) {
        queryClient.setQueryData(['advisorActiveMeetings'], context.previousActiveData);
      }
      if (context?.previousSelfData) {
        queryClient.setQueryData(['advisorSelfMeetings'], context.previousSelfData);
      }
      message.error('Failed to confirm meeting. Please try again.');
    },
    onSuccess: () => {
      message.success('Meeting confirmed successfully!');
      invalidateAdvisorQueries(queryClient);
    },
    onSettled: () => {
      invalidateAdvisorQueries(queryClient);
    },
  });
};

// Hook for advisor canceling pending meeting with optimistic updates
export const useCancelPendingMeetingAdvisor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ meetingId, note }: { meetingId: number; note: string }) => 
      cancelPendingMeeting(meetingId, note),
    onMutate: async ({ meetingId }) => {
      await queryClient.cancelQueries({ queryKey: ['advisorActiveMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['advisorSelfMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      
      const previousActiveData = queryClient.getQueryData(['advisorActiveMeetings']);
      const previousSelfData = queryClient.getQueryData(['advisorSelfMeetings']);
      
      queryClient.setQueryData(['advisorActiveMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 3 } : item
          )
        };
      });
      
      queryClient.setQueryData(['advisorSelfMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 3 } : item
          )
        };
      });
      
      return { previousActiveData, previousSelfData };
    },
    onError: (err, variables, context) => {
      if (context?.previousActiveData) {
        queryClient.setQueryData(['advisorActiveMeetings'], context.previousActiveData);
      }
      if (context?.previousSelfData) {
        queryClient.setQueryData(['advisorSelfMeetings'], context.previousSelfData);
      }
      message.error('Failed to cancel meeting. Please try again.');
    },
    onSuccess: () => {
      message.success('Meeting cancelled successfully!');
      invalidateAdvisorQueries(queryClient);
    },
    onSettled: () => {
      invalidateAdvisorQueries(queryClient);
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
      await queryClient.cancelQueries({ queryKey: ['advisorActiveMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['advisorSelfMeetings'] });
      await queryClient.cancelQueries({ queryKey: ['studentHistoryMeetings'] });
      
      const previousActiveData = queryClient.getQueryData(['advisorActiveMeetings']);
      const previousSelfData = queryClient.getQueryData(['advisorSelfMeetings']);
      
      queryClient.setQueryData(['advisorActiveMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 4 } : item
          )
        };
      });
      
      queryClient.setQueryData(['advisorSelfMeetings'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.id === meetingId ? { ...item, status: 4 } : item
          )
        };
      });
      
      return { previousActiveData, previousSelfData };
    },
    onError: (err, variables, context) => {
      if (context?.previousActiveData) {
        queryClient.setQueryData(['advisorActiveMeetings'], context.previousActiveData);
      }
      if (context?.previousSelfData) {
        queryClient.setQueryData(['advisorSelfMeetings'], context.previousSelfData);
      }
      message.error('Failed to complete meeting. Please try again.');
    },
    onSuccess: () => {
      message.success('Meeting completed successfully!');
      invalidateAdvisorQueries(queryClient);
    },
    onSettled: () => {
      invalidateAdvisorQueries(queryClient);
    },
  });
}; 