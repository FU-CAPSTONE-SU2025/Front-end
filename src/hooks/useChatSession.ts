import { useState, useCallback } from 'react';
import { useAuths } from './useAuths';
import { initChatSession } from '../api/student/StudentAPI';
import { ChatSessionResponse } from '../interfaces/IChat';

interface ChatSessionState {
  isLoading: boolean;
  error: string | null;
  sessionData: ChatSessionResponse | null;
}

export const useChatSession = () => {
  const accessToken = useAuths((state) => state.accessToken);
  const [state, setState] = useState<ChatSessionState>({
    isLoading: false,
    error: null,
    sessionData: null,
  });

  const initializeSession = useCallback(async (message: string) => {
    if (!accessToken) {
      setState(prev => ({
        ...prev,
        error: 'No access token available',
        isLoading: false,
      }));
      throw new Error('No access token available');
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const result = await initChatSession(message);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        sessionData: result,
        error: null,
      }));

      console.log('✅ Chat session initialized successfully:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat session';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      console.error('❌ Failed to initialize chat session:', err);
      throw new Error(errorMessage);
    }
  }, [accessToken]);

  const resetSession = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      sessionData: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    initializeSession,
    resetSession,
    clearError,
  };
};
