# Student Chat Components

## Overview
Student chat system với SignalR real-time communication, hỗ trợ chat với advisors.

## Core Components

### 1. **Messenger** (`messenger.tsx`)
- Main entry point cho chat system
- Drawer với 2 tabs: AI Assistant và Advisor Chat
- Quản lý global state cho chat

### 2. **AdvisorChatTab** (`advisorChatTab.tsx`)
- Hiển thị danh sách chat sessions với advisors
- Hỗ trợ infinite scroll cho sessions
- "New Chat" functionality
- Real-time session updates

### 3. **GlobalChatBox** (`globalChatBox.tsx`)
- Floating chat box cho active conversations
- Real-time message sending/receiving
- Infinite scroll cho messages
- Auto-scroll to bottom

### 4. **ChatListItem** (`chatListItem.tsx`)
- Individual session item display
- Staff name display
- Last message preview
- Unread count badge

### 5. **Supporting Components**
- `StaffNameDisplay.tsx` - Hiển thị tên advisor
- `LastMessageDisplay.tsx` - Hiển thị tin nhắn cuối
- `AiAssistance.tsx` - AI Assistant tab

## API Integration

### Backend Methods:
- `ListAllSessionByStudent(PaginationRequest)` - Lấy sessions
- `JoinSession(long sessionId)` - Join vào session
- `SendMessage(long sessionId, string content)` - Gửi tin nhắn
- `LoadMoreMessages(long sessionId, PaginationRequest)` - Load more messages
- `LoadMoreSessions(PaginationRequest)` - Load more sessions

### SignalR Events:
- `GetSessionsHUBMethod` - Session list updates
- `JoinSSMethod` - Session messages (lịch sử tin nhắn)
- `SendADVSSMethod` - New message received
- `LoadMoreMessagesMethod` - Load more messages
- `AddSessionAsAssigned` - Session assigned
- `RemoveSessionFromUnassigned` - Session unassigned

## Features

### ✅ Implemented:
- Real-time chat với SignalR
- Infinite scroll cho messages và sessions
- Auto-scroll to bottom
- Session assignment/unassignment
- Error handling
- Loading states
- Debug logging

### 🎯 Key Features:
1. **Real-time Communication**: SignalR WebSocket connection
2. **Infinite Scroll**: Load more messages/sessions
3. **Session Management**: Join, send messages, track status
4. **UI/UX**: Modern, responsive design với animations
5. **Error Handling**: Comprehensive error handling và retry logic

## Usage

```tsx
// Basic usage
<Messenger />

// With custom handlers
<AdvisorChatTab 
  onChatBoxOpen={handleChatOpen}
  drawerOpen={isOpen}
  onCloseDrawer={handleClose}
/>
```

## Dependencies
- SignalR (@microsoft/signalr)
- Ant Design (UI components)
- Framer Motion (animations)
- React Router (navigation) 