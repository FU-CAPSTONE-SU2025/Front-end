# Chat Session API Documentation

## Overview
This module contains API functions for managing chat sessions between students and AI advisors.

## Base URLs
- **AI Chat**: `${baseUrl}/ChatBot`
- **Sessions**: `${baseUrl}/AdvisorySession1to1`
- **Messages**: `${baseUrl}/Message`

## API Endpoints

### 1. DELETE /api/AdvisorySession1to1/{id}
**Purpose**: Delete a specific chat session by its ID

**Parameters**:
- `id` (path parameter): The unique identifier of the chat session to delete

**Headers**:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {accessToken}
RefreshToken: {refreshToken}
```

**Response**:
```typescript
{
  success: boolean;
  message?: string;
}
```

**Example Usage**:
```typescript
import { deleteChatSession } from './AiChatBox';

try {
  const result = await deleteChatSession(123);
  console.log('Session deleted:', result.message);
} catch (error) {
  console.error('Delete failed:', error.message);
}
```

**Error Handling**:
- Returns detailed error messages for debugging
- Handles network errors and API errors
- Logs all operations for monitoring

### 2. GET /api/AdvisorySession1to1
**Purpose**: Get all chat sessions for the current user

### 3. POST /api/ChatBot/init
**Purpose**: Initialize a new chat session

### 4. POST /api/ChatBot/send
**Purpose**: Send a message to the AI and get response

### 5. GET /api/Message/{sessionId}
**Purpose**: Get messages for a specific chat session

### 6. PATCH /api/AdvisorySession1to1/{id}
**Purpose**: Rename a chat session

## React Hooks

### useDeleteChatSession()
Custom hook for deleting chat sessions with optimistic updates and cache management.

**Features**:
- Optimistic UI updates
- Automatic cache invalidation
- Error handling with user feedback
- Loading states

**Usage**:
```typescript
import { useDeleteChatSession } from '../hooks/useChatApi';

const deleteSessionMutation = useDeleteChatSession();

const handleDelete = (sessionId: number) => {
  deleteSessionMutation.mutate(
    { chatSessionId: sessionId },
    {
      onSuccess: (data) => {
        message.success(data.message || 'Session deleted successfully');
      },
      onError: (error) => {
        message.error(error.message);
      }
    }
  );
};
```

## Error Codes
- `401`: Unauthorized - Token expired or invalid
- `404`: Session not found
- `403`: Forbidden - User doesn't have permission to delete this session
- `500`: Internal server error

## Best Practices
1. Always handle errors gracefully
2. Use optimistic updates for better UX
3. Provide clear feedback to users
4. Log operations for debugging
5. Validate session ownership before deletion 