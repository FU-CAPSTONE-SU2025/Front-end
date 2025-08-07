import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Button, Input, Modal } from 'antd';
import { CloseOutlined, ExpandOutlined, SendOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: string;
  senderName?: string; // Added for new logic
}

interface AdvisorChatBoxProps {
  onClose: () => void;
  selectedStudent: Student;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSendMessage: (msg: string) => Promise<void>;
}

const AdvisorChatBox: React.FC<AdvisorChatBoxProps> = ({ onClose, selectedStudent, messages, loading, error, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // Mock current advisor (in real app, this would come from auth context)
  const currentAdvisor = {
    id: "current_advisor",
    name: "Dr. Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "Academic Advisor"
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExpanded]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    
    setIsSending(true);
    const currentInput = input;
    setInput(''); // Clear input immediately
    
    try {
      await onSendMessage(currentInput);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore input if sending failed
      setInput(currentInput);
    } finally {
      setIsSending(false);
    }
  };



  const handleSendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSending && input.trim()) {
      handleSend();
    }
  };

  // Mock current advisor (in real app, this would come from auth context)
  const currentUserId = currentAdvisor.id; // id của người dùng hiện tại

  // Helper: xác định có phải là tin nhắn đầu cụm không
  const isFirstOfGroup = (idx: number) => {
    if (idx === 0) return true;
    return messages[idx].senderId !== messages[idx - 1].senderId;
  };

  // Helper: xác định có phải là tin nhắn cuối cụm không
  const isLastOfGroup = (idx: number) => {
    if (idx === messages.length - 1) return true;
    return messages[idx].senderId !== messages[idx + 1].senderId;
  };

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 right-4 w-80 max-w-[95vw] bg-white rounded-xl shadow-2xl flex flex-col z-[1000] border border-gray-200"
            style={{ minHeight: 380, maxHeight: 500 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar src={selectedStudent.avatar} size={32} />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    selectedStudent.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{selectedStudent.name}</div>

                </div>
              </div>
              <div className="flex items-center">
                <Button
                  type="text"
                  icon={<ExpandOutlined />}
                  onClick={() => setIsExpanded(true)}
                  className="hover:bg-gray-200 rounded-full"
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={onClose}
                  className="hover:bg-gray-200 rounded-full"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.length === 0 && (
                                  <div className="text-center text-gray-500 text-sm py-8">
                    Start a conversation
                  </div>
              )}
              {messages.map((msg, idx) => {
                const isStudentMessage = String(msg.senderId) === "13"; // Student message (senderId = 13)
                return (
                  <div key={msg.id} className={`flex ${isStudentMessage ? 'justify-start' : 'justify-end'} mb-1`}>
                    {/* Avatar và tên người gửi */}
                    {isStudentMessage && isFirstOfGroup(idx) && (
                      <div className="flex flex-col items-center mr-2">
                        <Avatar src={selectedStudent.avatar} size={28} />
                        <span className="text-xs text-gray-400 mt-1">{msg.senderName || selectedStudent.name}</span>
                      </div>
                    )}
                    <div className="flex flex-col items-end max-w-[75%]">
                      {/* Bong bóng chat */}
                      <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                        isStudentMessage
                          ? 'bg-gray-100 text-gray-800 rounded-bl-md'
                          : 'bg-blue-500 text-white rounded-br-md'
                      }`}>
                        {msg.content}
                      </div>
                      {/* Thời gian gửi */}
                      {isLastOfGroup(idx) && (
                        <div className={`text-[10px] mt-1 opacity-60 ${isStudentMessage ? 'text-left text-gray-500' : 'text-right text-blue-400'}`}>{msg.timestamp}</div>
                      )}
                    </div>
                    {/* Avatar advisor bên phải nếu muốn */}
                    {!isStudentMessage && isFirstOfGroup(idx) && (
                      <div className="flex flex-col items-center ml-2">
                        <Avatar src={currentAdvisor.avatar} size={28} />
                        <span className="text-xs text-gray-400 mt-1">You</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!isSending && input.trim()) {
                    handleSend();
                  }
                }}
                placeholder="Message..."
                className="rounded-full bg-white"
                maxLength={1000}
                disabled={loading || isSending}
              />
              <Button 
                type="primary" 
                shape="circle" 
                onClick={handleSendClick} 
                disabled={!input.trim() || loading || isSending}
                icon={<SendOutlined />}
              />
            </div>
            {error && (
              <div className="text-red-500 text-xs mt-2 text-center">{error}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={isExpanded}
        onCancel={() => setIsExpanded(false)}
        footer={null}
        destroyOnHidden
        width="90vw"
        style={{ top: 20, maxWidth: '1200px', height: '90vh' }}
        styles={{ body: { padding: 0, height: '100%', overflow: 'hidden' } }}
      >
        <div className="flex h-full">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar src={selectedStudent.avatar} size={40} />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    selectedStudent.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="font-semibold text-lg">{selectedStudent.name}</div>
                  <div className="text-sm text-gray-500">{selectedStudent.isOnline ? 'Online' : 'Offline'}</div>
                </div>
              </div>
              <Button type="text" onClick={() => setIsExpanded(false)}>Close</Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Avatar src={selectedStudent.avatar} size={64} />
                  <h2 className="text-xl font-semibold mt-4">{selectedStudent.name}</h2>

                </div>
              )}
              {messages.map((msg, idx) => {
                const isStudentMessage = String(msg.senderId) === "13"; // Student message
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isStudentMessage ? '' : 'justify-end'} mb-1`}>
                    {/* Avatar và tên người gửi */}
                    {isStudentMessage && isFirstOfGroup(idx) && (
                      <div className="flex flex-col items-center mr-2">
                        <Avatar src={selectedStudent.avatar} size={32} />
                        <span className="text-xs text-gray-400 mt-1">{msg.senderName || selectedStudent.name}</span>
                      </div>
                    )}
                    <div className="flex flex-col items-end max-w-[75%]">
                      <div className={`px-4 py-2 rounded-xl text-sm ${
                        isStudentMessage
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {msg.content}
                      </div>
                      {isLastOfGroup(idx) && (
                        <div className={`text-xs mt-1 opacity-60 ${isStudentMessage ? 'text-left text-gray-500' : 'text-right text-blue-400'}`}>{msg.timestamp}</div>
                      )}
                    </div>
                    {!isStudentMessage && isFirstOfGroup(idx) && (
                      <div className="flex flex-col items-center ml-2">
                        <Avatar src={currentAdvisor.avatar} size={32} />
                        <span className="text-xs text-gray-400 mt-1">You</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <Input.TextArea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      if (!isSending && input.trim()) {
                        handleSend();
                      }
                    }
                  }}
                  placeholder="Message..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="flex-1"
                  disabled={loading || isSending}
                />
                <Button 
                  type="primary" 
                  onClick={handleSend} 
                  disabled={!input.trim() || loading}
                  icon={<SendOutlined />}
                >
                  Send
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-xs mt-2 text-center">{error}</div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdvisorChatBox; 