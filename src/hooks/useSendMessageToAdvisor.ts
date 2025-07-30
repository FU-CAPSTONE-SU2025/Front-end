import { useState, useCallback } from 'react';
import { sendMessageToAdvisor } from '../api/advisor/AdvisorAPI';
import { getUserFriendlyErrorMessage } from '../api/AxiosCRUD';
import { debugLog } from '../utils/performanceOptimization';

export function useSendMessageToAdvisor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async ({ message }: { message: string }) => {
    setLoading(true);
    setError(null);
    try {
      debugLog('[HOOK] useSendMessageToAdvisor - sendMessage called with:', { message });
      const result = await sendMessageToAdvisor({ message });
      return result;
    } catch (err: any) {
      debugLog('[HOOK] useSendMessageToAdvisor - error:', err);
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendMessage, loading, error };
} 