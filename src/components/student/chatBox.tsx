import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Button, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Chat {
  id: number;
  name: string;
  avatar: string;
}

interface Message {
  id: number;
  fromMe: boolean;
  text: string;
  time: string;
}

interface ChatBoxProps {
  chat: Chat;
  onClose: () => void;
}

const mockMessages: Message[] = [
  { id: 1, fromMe: false, text: 'Hi there!', time: '2m ago' },
  { id: 2, fromMe: true, text: 'Hello! How are you?', time: '2m ago' },
  { id: 3, fromMe: false, text: 'I am good, thanks!', time: '1m ago' },
];

const ChatBox: React.FC<ChatBoxProps> = ({ chat, onClose }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, fromMe: true, text: input, time: 'now' },
      ]);
      setInput('');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-4 right-4 w-80 max-w-[95vw] bg-white rounded-xl shadow-2xl flex flex-col z-[1000] border border-gray-200"
        style={{ minHeight: 380, maxHeight: 500 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Avatar src={chat.avatar} size={32} />
            <span className="font-semibold text-gray-800">{chat.name}</span>
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="hover:bg-gray-200 rounded-full"
          />
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-2 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-2 ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm shadow-sm ${
                  msg.fromMe
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.text}
                <div className="text-[10px] text-right mt-1 opacity-60">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="p-2 border-t border-gray-200 bg-gray-50 rounded-b-xl flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder="Type a message..."
            className="rounded-full bg-white"
          />
          <Button type="primary" shape="circle" onClick={handleSend} disabled={!input.trim()}>
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 2.93a2.5 2.5 0 0 1 2.6-.6l11.25 4.5c2.02.81 2.02 3.62 0 4.43l-11.25 4.5a2.5 2.5 0 0 1-3.37-2.6l.5-3.75a.625.625 0 0 1 1.24.17l-.5 3.75a1.25 1.25 0 0 0 1.68 1.3l11.25-4.5a1.25 1.25 0 0 0 0-2.36l-11.25-4.5a1.25 1.25 0 0 0-1.68 1.3l.5 3.75a.625.625 0 0 1-1.24.17l-.5-3.75a2.5 2.5 0 0 1 .77-2.4Z"/></svg>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatBox;
