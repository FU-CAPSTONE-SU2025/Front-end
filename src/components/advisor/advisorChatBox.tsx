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
}

interface AdvisorChatBoxProps {
  onClose: () => void;
  selectedStudent: Student;
}

const AdvisorChatBox: React.FC<AdvisorChatBoxProps> = ({ onClose, selectedStudent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: currentAdvisor.id,
        receiverId: selectedStudent.id,
        content: input,
        timestamp: formatTime(),
        isRead: false,
        messageType: "text"
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      
      // Simulate student reply after 1-3 seconds
      setTimeout(() => {
        const replyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: selectedStudent.id,
          receiverId: currentAdvisor.id,
          content: `Thank you for your response! I understand now.`,
          timestamp: formatTime(),
          isRead: true,
          messageType: "text"
        };
        setMessages(prev => [...prev, replyMessage]);
      }, Math.random() * 2000 + 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
                  <div className="text-xs text-gray-500">Student</div>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  Start a conversation with {selectedStudent.name}
                </div>
              )}
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === currentAdvisor.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm shadow-sm ${
                    msg.senderId === currentAdvisor.id 
                      ? 'bg-blue-500 text-white rounded-br-md' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    {msg.content}
                    <div className={`text-[10px] mt-1 opacity-60 ${
                      msg.senderId === currentAdvisor.id ? 'text-right' : 'text-left'
                    }`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="rounded-full bg-white"
                maxLength={1000}
              />
              <Button 
                type="primary" 
                shape="circle" 
                onClick={handleSend} 
                disabled={!input.trim()}
                icon={<SendOutlined />}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={isExpanded}
        onCancel={() => setIsExpanded(false)}
        footer={null}
        destroyOnClose
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
                  <div className="text-sm text-gray-500">Student • {selectedStudent.isOnline ? 'Online' : selectedStudent.lastSeen}</div>
                </div>
              </div>
              <Button type="text" onClick={() => setIsExpanded(false)}>Close</Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Avatar src={selectedStudent.avatar} size={64} />
                  <h2 className="text-xl font-semibold mt-4">{selectedStudent.name}</h2>
                  <p className="text-sm mt-2">Start a conversation</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === currentAdvisor.id ? 'justify-end' : ''}`}>
                  {msg.senderId !== currentAdvisor.id && (
                    <Avatar src={selectedStudent.avatar} size={32} />
                  )}
                  <div className={`px-4 py-2 rounded-xl max-w-[70%] ${
                    msg.senderId === currentAdvisor.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.content}
                    <div className={`text-xs mt-2 opacity-60 ${
                      msg.senderId === currentAdvisor.id ? 'text-right' : 'text-left'
                    }`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
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
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="flex-1"
                />
                <Button 
                  type="primary" 
                  onClick={handleSend} 
                  disabled={!input.trim()}
                  icon={<SendOutlined />}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdvisorChatBox; 