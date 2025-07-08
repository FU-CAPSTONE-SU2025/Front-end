import { deleteChatSession } from '../AiChatBox';

/**
 * Example: How to delete a chat session
 * 
 * This example demonstrates the proper way to use the deleteChatSession API
 * with error handling and user feedback.
 */

// Example 1: Basic usage
export const basicDeleteExample = async (sessionId: number) => {
  try {
    const result = await deleteChatSession(sessionId);
    console.log('Success:', result.message);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Example 2: With user feedback (for React components)
export const deleteWithUserFeedback = async (
  sessionId: number,
  onSuccess: (message: string) => void,
  onError: (message: string) => void
) => {
  try {
    const result = await deleteChatSession(sessionId);
    onSuccess(result.message || 'Session deleted successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    onError(errorMessage);
    throw error;
  }
};

// Example 3: Batch delete multiple sessions
export const batchDeleteSessions = async (sessionIds: number[]) => {
  const results = [];
  const errors = [];

  for (const sessionId of sessionIds) {
    try {
      const result = await deleteChatSession(sessionId);
      results.push({ sessionId, success: true, message: result.message });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ sessionId, success: false, error: errorMessage });
    }
  }

  return { results, errors };
};

// Example 4: Delete with confirmation
export const deleteWithConfirmation = async (
  sessionId: number,
  sessionTitle: string,
  confirmDelete: (title: string) => Promise<boolean>
) => {
  const confirmed = await confirmDelete(sessionTitle);
  
  if (!confirmed) {
    console.log('Delete cancelled by user');
    return null;
  }

  try {
    const result = await deleteChatSession(sessionId);
    console.log(`Session "${sessionTitle}" deleted successfully`);
    return result;
  } catch (error) {
    console.error(`Failed to delete session "${sessionTitle}":`, error);
    throw error;
  }
};

// Example 5: Delete with retry logic
export const deleteWithRetry = async (
  sessionId: number,
  maxRetries: number = 3,
  delayMs: number = 1000
) => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await deleteChatSession(sessionId);
      console.log(`Session deleted successfully on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Delete attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
};

// Example 6: React Hook usage example
export const reactHookExample = `
import { useDeleteChatSession } from '../../hooks/useChatApi';
import { message } from 'antd';

const MyComponent = () => {
  const deleteSessionMutation = useDeleteChatSession();

  const handleDeleteSession = (sessionId: number) => {
    deleteSessionMutation.mutate(
      { chatSessionId: sessionId },
      {
        onSuccess: (data) => {
          message.success(data.message || 'Session deleted successfully');
        },
        onError: (error) => {
          message.error(error.message || 'Failed to delete session');
        },
      }
    );
  };

  return (
    <button 
      onClick={() => handleDeleteSession(123)}
      disabled={deleteSessionMutation.isPending}
    >
      {deleteSessionMutation.isPending ? 'Deleting...' : 'Delete Session'}
    </button>
  );
};
`;

// Example 7: API endpoint details
export const apiEndpointInfo = {
  method: 'DELETE',
  url: '/api/AdvisorySession1to1/{id}',
  description: 'Delete a chat session by its ID',
  parameters: {
    id: {
      type: 'number',
      required: true,
      description: 'The unique identifier of the chat session to delete'
    }
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer {accessToken}',
    'RefreshToken': '{refreshToken}'
  },
  response: {
    success: {
      type: 'boolean',
      description: 'Whether the operation was successful'
    },
    message: {
      type: 'string',
      optional: true,
      description: 'Success message from the server'
    }
  },
  errorCodes: {
    401: 'Unauthorized - Token expired or invalid',
    404: 'Session not found',
    403: 'Forbidden - User does not have permission to delete this session',
    500: 'Internal server error'
  }
}; 