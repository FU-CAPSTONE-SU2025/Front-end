import { isErrorResponse } from '../api/AxiosCRUD';

export const handleApiError = (error: any): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, get the message
  if (error instanceof Error) {
    return error.message;
  }

  // Inline logic mirroring previous getUserFriendlyErrorMessage
  if (!error) return 'An unknown error occurred';
  if (isErrorResponse(error)) return error.message;
  if (typeof error === 'object' && error.errors) {
    const errs = error.errors;
    const msgs: string[] = [];
    for (const k in errs) {
      const v = errs[k];
      if (Array.isArray(v)) msgs.push(...v);
      else if (typeof v === 'string') msgs.push(v);
    }
    if (msgs.length > 0) return msgs.join('\n');
  }
  if (typeof error === 'object' && error.message) return error.message;
  return 'An unknown error occurred';
};

export const extractErrorTitle = (error: any): string => {
  // Default error titles based on error type
  if (error?.status === 401) {
    return 'Authentication Error';
  }
  if (error?.status === 403) {
    return 'Access Denied';
  }
  if (error?.status === 404) {
    return 'Not Found';
  }
  if (error?.status === 422) {
    return 'Validation Error';
  }
  if (error?.status >= 500) {
    return 'Server Error';
  }
  
  return 'Error';
}; 
export const extractNotificationErrorContent = (errorMessage: string): boolean => {
  if (!errorMessage) return false;
  const errorWords = [
    'error',
    'fail',
    'failed',
    'failure',
    'exception',
    'denied',
    'invalid',
    'unauthorized',
    'forbidden',
    'rejected',
    'not found',
    'unavailable',
    'timeout'
  ];
  const lowerMsg = errorMessage.toLowerCase();
  return errorWords.some(word => lowerMsg.includes(word));
}

export const extractNotificationSuccessContent = (successMessage: string): boolean => {
  if (!successMessage) return false;
  const successWords = [
    'success',
    'successful',
    'completed',
    'done',
    'created',
    'added',
    'saved',
    'updated',
    'submitted',
    'approved',
    'enabled',
    'activated',
    'joined',
    'registered'
  ];
  const lowerMsg = successMessage.toLowerCase();
  return successWords.some(word => lowerMsg.includes(word));
}
