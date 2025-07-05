import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  IChatSession,
  IChatMessage,
  IChatSessionListResponse,
  IChatMessageListResponse,
  IInitChatSessionRequest,
  IInitChatSessionResponse,
  ISendChatMessageRequest,
  ISendChatMessageResponse
} from '../interfaces/IChatAI';
import {
  initChatSession,
  sendChatMessage,
  getChatSessions,
  getChatMessages,
  deleteChatSession,
  renameChatSession
} from '../api/student/AiChatBox';

// Lấy danh sách các chat session với caching tối ưu
export function useChatSessions() {
  return useQuery<IChatSession[], Error>({
    queryKey: ['chatSessions'],
    queryFn: async () => {
      console.log('Fetching chat sessions...');
      const response: IChatSessionListResponse = await getChatSessions();
      console.log('Chat sessions response:', response);
      return response.items || [];
    },
    // Tối ưu caching: cache trong 5 phút, stale time 2 phút
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: 1000,
    // Chỉ refetch khi window focus nếu data đã stale
    refetchOnWindowFocus: false,
    // Không refetch khi reconnect nếu data vẫn fresh
    refetchOnReconnect: false,
  });
}

// Lấy danh sách message của 1 session với infinite scroll tối ưu
export function useChatSessionMessages(chatSessionId?: number, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['chatMessages', chatSessionId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!chatSessionId) {
        console.log('No chat session ID provided, returning empty data');
        return { items: [], nextPage: null, hasMore: false };
      }
      
      console.log(`Fetching messages for session ${chatSessionId}, page ${pageParam}`);
      const response: IChatMessageListResponse = await getChatMessages(chatSessionId, pageParam, pageSize);
      console.log(`Messages response for session ${chatSessionId}:`, response);
      
      const totalPages = Math.ceil(response.totalCount / response.pageSize);
      const hasMore = response.pageNumber < totalPages;
      const nextPage = hasMore ? response.pageNumber + 1 : null;
      
      return {
        items: response.items || [],
        nextPage,
        hasMore,
        totalCount: response.totalCount,
        currentPage: response.pageNumber,
        pageSize: response.pageSize
      };
    },
    enabled: !!chatSessionId,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    // Tối ưu caching cho messages: cache lâu hơn vì messages ít thay đổi
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
    // Không refetch khi window focus
    refetchOnWindowFocus: false,
    // Không refetch khi reconnect
    refetchOnReconnect: false,
  });
}

// Lấy danh sách message của 1 session (legacy - không infinite scroll)
export function useChatSessionMessagesSimple(chatSessionId?: number) {
  return useQuery({
    queryKey: ['chatMessagesSimple', chatSessionId],
    queryFn: async () => {
      if (!chatSessionId) {
        console.log('No chat session ID provided for simple query');
        return [];
      }
      
      console.log(`Fetching messages (simple) for session ${chatSessionId}`);
      const response: IChatMessageListResponse = await getChatMessages(chatSessionId);
      console.log(`Simple messages response for session ${chatSessionId}:`, response);
      return response.items || [];
    },
    enabled: !!chatSessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Tạo session mới với optimistic updates
export function useInitChatSession() {
  const queryClient = useQueryClient();
  return useMutation<IInitChatSessionResponse, Error, IInitChatSessionRequest>({
    mutationFn: async (request) => {
      console.log('Initializing new chat session with message:', request.message);
      const response = await initChatSession(request);
      console.log('Init session response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Chat session initialized successfully:', data);
      // Chỉ invalidate sessions, không invalidate messages vì session mới chưa có messages
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      
      // Prefetch messages cho session mới để UX tốt hơn
      queryClient.prefetchInfiniteQuery({
        queryKey: ['chatMessages', data.chatSessionId],
        queryFn: async ({ pageParam = 1 }) => {
          const response = await getChatMessages(data.chatSessionId, pageParam, 20);
          const totalPages = Math.ceil(response.totalCount / response.pageSize);
          const hasMore = response.pageNumber < totalPages;
          const nextPage = hasMore ? response.pageNumber + 1 : null;
          
          return {
            items: response.items || [],
            nextPage,
            hasMore,
            totalCount: response.totalCount,
            currentPage: response.pageNumber,
            pageSize: response.pageSize
          };
        },
        initialPageParam: 1,
      });
    },
    onError: (error) => {
      console.error('Failed to initialize chat session:', error);
    }
  });
}

// Gửi message mới với optimistic updates tối ưu
export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation<ISendChatMessageResponse, Error, ISendChatMessageRequest>({
    mutationFn: async (request) => {
      console.log('Sending message to session', request.chatSessionId, ':', request.message);
      const response = await sendChatMessage(request);
      console.log('Send message response:', response);
      return response;
    },
    onSuccess: (_data, variables) => {
      console.log('Message sent successfully to session', variables.chatSessionId);
      // Chỉ invalidate messages của session hiện tại, không invalidate sessions
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.chatSessionId] });
      queryClient.invalidateQueries({ queryKey: ['chatMessagesSimple', variables.chatSessionId] });
      
      // Cập nhật session list để cập nhật thời gian last message
      queryClient.setQueryData(['chatSessions'], (oldData: IChatSession[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(session => 
          session.id === variables.chatSessionId 
            ? { ...session, updatedAt: new Date().toISOString() }
            : session
        );
      });
    },
    onError: (error, variables) => {
      console.error('Failed to send message to session', variables.chatSessionId, ':', error);
    }
  });
}

// Xóa session với optimistic updates
export function useDeleteChatSession() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, { chatSessionId: number }>({
    mutationFn: async ({ chatSessionId }) => {
      console.log('Deleting chat session:', chatSessionId);
      const response = await deleteChatSession(chatSessionId);
      console.log('Delete session response:', response);
      return response;
    },
    onSuccess: (_data, variables) => {
      console.log('Chat session deleted successfully:', variables.chatSessionId);
      // Invalidate sessions và xóa cache messages của session đã xóa
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      queryClient.removeQueries({ queryKey: ['chatMessages', variables.chatSessionId] });
      queryClient.removeQueries({ queryKey: ['chatMessagesSimple', variables.chatSessionId] });
    },
    onError: (error, variables) => {
      console.error('Failed to delete chat session', variables.chatSessionId, ':', error);
    }
  });
}

// Đổi tên session với optimistic updates
export function useRenameChatSession() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, { chatSessionId: number, title: string }>({
    mutationFn: async ({ chatSessionId, title }) => {
      console.log('Renaming chat session', chatSessionId, 'to:', title);
      const response = await renameChatSession(chatSessionId, title);
      console.log('Rename session response:', response);
      return response;
    },
    onSuccess: (_data, variables) => {
      console.log('Chat session renamed successfully:', variables.chatSessionId, 'to', variables.title);
      // Optimistic update cho sessions
      queryClient.setQueryData(['chatSessions'], (oldData: IChatSession[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(session => 
          session.id === variables.chatSessionId 
            ? { ...session, title: variables.title, updatedAt: new Date().toISOString() }
            : session
        );
      });
    },
    onError: (error, variables) => {
      console.error('Failed to rename chat session', variables.chatSessionId, ':', error);
    }
  });
}

// Prefetch sessions cho user khi component mount
export function usePrefetchChatSessions() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: ['chatSessions'],
      queryFn: async () => {
        const response: IChatSessionListResponse = await getChatSessions();
        return response.items || [];
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    });
  };
}

// Prefetch messages cho session cụ thể
export function usePrefetchChatMessages() {
  const queryClient = useQueryClient();
  
  return (chatSessionId: number, pageSize: number = 20) => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ['chatMessages', chatSessionId],
      queryFn: async ({ pageParam = 1 }) => {
        const response: IChatMessageListResponse = await getChatMessages(chatSessionId, pageParam, pageSize);
        const totalPages = Math.ceil(response.totalCount / response.pageSize);
        const hasMore = response.pageNumber < totalPages;
        const nextPage = hasMore ? response.pageNumber + 1 : null;
        
        return {
          items: response.items || [],
          nextPage,
          hasMore,
          totalCount: response.totalCount,
          currentPage: response.pageNumber,
          pageSize: response.pageSize
        };
      },
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });
  };
} 