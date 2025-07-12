import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Button, Input, Spin, Modal, message, Badge } from 'antd';
import { CloseOutlined, ExpandOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvisorChatHub, ChatMessage, ChatSession } from '../../hooks/useAdvisorChatHub';

interface AdvisorChatBoxProps {
  onClose: () => void;
  selectedUser?: any; // ChatUser from messenger
}

const AdvisorChatBox: React.FC<AdvisorChatBoxProps> = ({ onClose, selectedUser }) => {
  const [messageInput, setMessageInput] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    connectionState,
    error,
    currentSessionId,
    messages,
    sessions,
    loading,
    isConnected,
    joinSession,
    sendMessage,
    listSessions,
    leaveSession,
    createHumanSession,
  } = useAdvisorChatHub();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load sessions when component mounts
  useEffect(() => {
    if (isConnected) {
      listSessions();
    }
  }, [isConnected, listSessions]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const success = await sendMessage(messageInput.trim());
    if (success) {
      setMessageInput('');
    } else {
      message.error('Failed to send message');
    }
  };

  // Handle join session
  const handleJoinSession = async (sessionId: number) => {
    const success = await joinSession(sessionId);
    if (success) {
      setShowSessions(false);
      message.success('Joined session successfully');
    } else {
      message.error('Failed to join session');
    }
  };

  // Handle create new session
  const handleCreateSession = async () => {
    if (!messageInput.trim()) {
      message.error('Please enter a message to start the conversation');
      return;
    }

    const success = await createHumanSession(messageInput.trim());
    if (success) {
      setMessageInput('');
      message.success('Session created successfully');
      setShowSessions(false);
    } else {
      message.error('Failed to create session');
    }
  };

  // Handle create session with specific advisor
  const handleCreateSessionWithAdvisor = async (advisorId: number) => {
    if (!messageInput.trim()) {
      message.error('Please enter a message to start the conversation');
      return;
    }

    const success = await createHumanSession(messageInput.trim());
    if (success) {
      setMessageInput('');
      message.success('Session created successfully');
      setShowSessions(false);
    } else {
      message.error('Failed to create session');
    }
  };

  // Handle start new chat with selected advisor
  const handleStartNewChat = async () => {
    if (!messageInput.trim()) {
      message.error('Please enter a message to start the conversation');
      return;
    }

    const success = await createHumanSession(messageInput.trim());
    if (success) {
      setMessageInput('');
      message.success('Chat started successfully');
    } else {
      message.error('Failed to start chat');
    }
  };

  // Check if current user is the sender
  const isCurrentUser = (message: ChatMessage) => {
    // TODO: Replace with actual user ID from auth context
    return message.senderId === 1; // Assuming user ID is 1 for now
  };

  // Get current session info
  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar 
              src={selectedUser?.avatarUrl} 
              icon={<UserOutlined />}
              size={32}
              className="border-2 border-white"
            />
            <div>
              <h3 className="font-semibold text-white text-sm">
                {currentSession ? currentSession.staffName : selectedUser?.name || 'Advisor Chat'}
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-blue-100">
                  {isConnected ? 'Connected' : connectionState}
                </span>
                {currentSession && (
                  <span className="text-xs text-blue-100">
                    • Session #{currentSession.id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={<UserOutlined />}
              size="small"
              onClick={() => setShowSessions(!showSessions)}
              className="text-white hover:bg-blue-600"
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              size="small"
              onClick={onClose}
              className="text-white hover:bg-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Sessions Modal */}
      <Modal
        title="Chat Sessions"
        open={showSessions}
        onCancel={() => setShowSessions(false)}
        footer={null}
        width={400}
      >
        <div className="space-y-4">
          {/* New Session Input */}
          <div className="border-b border-gray-200 pb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Start New Conversation</div>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPressEnter={handleCreateSession}
              />
              <Button 
                type="primary" 
                onClick={handleCreateSession}
                disabled={!messageInput.trim() || loading}
                loading={loading}
              >
                Start
              </Button>
            </div>
          </div>

          {/* Existing Sessions */}
          <div className="max-h-60 overflow-y-auto">
            <div className="text-sm font-medium text-gray-700 mb-2">Existing Sessions</div>
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No chat sessions found
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    currentSessionId === session.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleJoinSession(session.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800">{session.staffName}</div>
                      <div className="text-sm text-gray-500">{session.title}</div>
                      {session.lastMessage && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {session.lastMessage}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {session.isActive && (
                        <Badge status="processing" />
                      )}
                      {session.type && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          session.type === 'HUMAN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {session.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="large" />
          </div>
        ) : !currentSessionId ? (
          <div className="text-center text-gray-400 py-8">
            <Avatar 
              src={selectedUser?.avatarUrl}
              icon={<UserOutlined />} 
              size={48} 
              className="mb-4 bg-blue-100 text-blue-600"
            />
            <div className="text-lg font-medium mb-2">
              {selectedUser?.name ? `Chat with ${selectedUser.name}` : 'No active session'}
            </div>
            <div className="text-sm mb-4">
              {selectedUser?.name 
                ? 'Start a new conversation with this advisor' 
                : 'Select a session or start a new conversation'
              }
            </div>
            <div className="space-y-2">
              {selectedUser?.name ? (
                <div className="space-y-3">
                              <div className="text-sm text-gray-600">
              <div className="font-medium">{selectedUser.name}</div>
              <div>{selectedUser.role}</div>
              {selectedUser.email && <div className="text-xs">{selectedUser.email}</div>}
              {selectedUser.specialization && (
                <div className="text-xs text-blue-500 mt-1">
                  {selectedUser.specialization}
                  {selectedUser.yearsOfExperience && ` • ${selectedUser.yearsOfExperience} years exp.`}
                </div>
              )}
              {selectedUser.department && (
                <div className="text-xs text-gray-500">{selectedUser.department}</div>
              )}
            </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onPressEnter={handleStartNewChat}
                      className="flex-1"
                    />
                    <Button 
                      type="primary" 
                      onClick={handleStartNewChat}
                      disabled={!messageInput.trim() || !isConnected || loading}
                      loading={loading}
                    >
                      Start Chat
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button 
                    type="primary" 
                    onClick={() => setShowSessions(true)}
                    disabled={!isConnected}
                    block
                  >
                    View Sessions
                  </Button>
                  <Button 
                    onClick={() => setShowSessions(true)}
                    disabled={!isConnected}
                    block
                  >
                    Start New Chat
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Avatar 
              icon={<UserOutlined />} 
              size={48} 
              className="mb-4 bg-blue-100 text-blue-600"
            />
            <div className="text-lg font-medium mb-2">No messages yet</div>
            <div className="text-sm">Start the conversation!</div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${isCurrentUser(msg) ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  isCurrentUser(msg) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="text-sm">{msg.content}</div>
                  <div className={`text-xs mt-1 ${
                    isCurrentUser(msg) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onPressEnter={currentSessionId ? handleSendMessage : handleStartNewChat}
            placeholder={currentSessionId ? "Type a message..." : "Type a message to start chat..."}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={currentSessionId ? handleSendMessage : handleStartNewChat}
            disabled={!messageInput.trim() || !isConnected || loading}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvisorChatBox; 