import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Button, Input, Spin, Modal } from 'antd';
import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSendAiMessage } from '../../hooks/useSendAIMessenger';
import ExpandedChat from './modalChatAI';


interface Message {
  id: number;
  fromMe: boolean;
  text: string;
  time: string;
}

interface ChatBoxProps {
  onClose: () => void;
}

const AI_BOT = {
  name: 'AISEA BOT',
  avatar: '/img/Logo.svg',
};

const welcomeMessage: Message = {
  id: 0,
  fromMe: false,
  text: 'Hello! I am AISEA BOT, your virtual assistant. How can I assist you today?',
  time: 'Just now',
};

const ChatBox: React.FC<ChatBoxProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mutate: sendAi, isPending } = useSendAiMessage();
  const [history, setHistory] = useState([
    {
      id: 1,
      title: 'Current Chat',
      createdAt: 'Today',
      messages,
    },
  ]);
  const [selectedChatId, setSelectedChatId] = useState(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExpanded]);

  useEffect(() => {
    // Sync messages to history for the current chat
    setHistory((prev) => prev.map(chat => chat.id === 1 ? { ...chat, messages } : chat));
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const userMsg: Message = {
        id: Date.now(),
        fromMe: true,
        text: input,
        time: 'now',
      };
      setMessages((prev) => [...prev, userMsg]);
      const userInput = input;
      setInput('');
      sendAi(userInput, {
        onSuccess: (data: any) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              fromMe: false,
              text: data?.message || 'AI did not respond.',
              time: 'now',
            },
          ]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 2,
              fromMe: false,
              text: 'AI is currently unavailable. Please try again later.',
              time: 'now',
            },
          ]);
        },
      });
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
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Avatar src={AI_BOT.avatar} size={32} />
                <span className="font-semibold text-gray-800">{AI_BOT.name}</span>
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
            <div className="flex-1 overflow-y-auto px-3 py-2 bg-white">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex mb-2 ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm shadow-sm ${msg.fromMe ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                    {msg.text}
                    <div className="text-[10px] text-right mt-1 opacity-60">{msg.time}</div>
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex mb-2 justify-start">
                  <div className="px-3 py-2 rounded-2xl max-w-[70%] text-sm shadow-sm bg-gray-100 text-gray-800 rounded-bl-md flex items-center gap-2">
                    <Spin size="small" /> <span>AI is typing...</span>
                  </div>
                </div>
              )}
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
                disabled={isPending}
              />
              <Button type="primary" shape="circle" onClick={handleSend} disabled={!input.trim() || isPending}>
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 2.93a2.5 2.5 0 0 1 2.6-.6l11.25 4.5c2.02.81 2.02 3.62 0 4.43l-11.25 4.5a2.5 2.5 0 0 1-3.37-2.6l.5-3.75a.625.625 0 0 1 1.24.17l-.5 3.75a1.25 1.25 0 0 0 1.68 1.3l11.25-4.5a1.25 1.25 0 0 0 0-2.36l-11.25-4.5a1.25 1.25 0 0 0-1.68 1.3l.5 3.75a.625.625 0 0 1-1.24.17l-.5-3.75a2.5 2.5 0 0 1 .77-2.4Z"/></svg>
              </Button>
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
        bodyStyle={{ padding: 0, height: '100%', overflow: 'hidden', background: '#141414' }}
        wrapClassName="expanded-chat-modal-wrapper"
      >
        <ExpandedChat
          history={history}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          isPending={isPending}
          messagesEndRef={messagesEndRef}
          onClose={() => setIsExpanded(false)}
        />
      </Modal>
    </>
  );
};

export default ChatBox;
