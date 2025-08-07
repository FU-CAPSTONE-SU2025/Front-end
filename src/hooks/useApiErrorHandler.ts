import { useCallback } from 'react';
import { useMessagePopupContext } from '../contexts/MessagePopupContext';
import { handleApiError, extractErrorTitle } from '../utils/errorHandler';

export const useApiErrorHandler = () => {
  const { showError, showSuccess } = useMessagePopupContext();

  const handleError = useCallback((error: any, customTitle?: string) => {
    const errorMessage = handleApiError(error);
    const errorTitle = customTitle || extractErrorTitle(error);
    showError(errorMessage, errorTitle);
  }, [showError]);

  const handleSuccess = useCallback((message: string, title?: string) => {
    showSuccess(message, title || 'Success');
  }, [showSuccess]);

  return {
    handleError,
    handleSuccess
  };
}; 