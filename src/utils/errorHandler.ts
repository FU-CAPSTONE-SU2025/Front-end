import { getUserFriendlyErrorMessage } from '../api/AxiosCRUD';

export const handleApiError = (error: any): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, get the message
  if (error instanceof Error) {
    return error.message;
  }

  // Use the existing utility function from AxiosCRUD
  return getUserFriendlyErrorMessage(error);
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