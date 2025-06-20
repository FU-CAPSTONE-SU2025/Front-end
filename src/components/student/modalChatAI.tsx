import React from 'react';
import { Avatar, Button, Input, Spin } from 'antd';
import { motion } from 'framer-motion';
import { PlusOutlined } from '@ant-design/icons';

interface Message {
  id: number;
  fromMe: boolean;
  text: string;
}

interface ChatHistoryItem {
  id: number;
  title: string;
  createdAt: string;
  messages: Message[];
}

interface ModalChatAIProps {
  history: ChatHistoryItem[];
  selectedChatId: number;
  setSelectedChatId: (id: number) => void;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isPending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  backgroundStyle?: React.CSSProperties;
}

const AI_BOT = {
  name: 'AISEA BOT',
  avatar: '/img/Logo.svg',
};

const ModalChatAI: React.FC<ModalChatAIProps> = ({
  history,
  selectedChatId,
  setSelectedChatId,
  input,
  setInput,
  handleSend,
  isPending,
  messagesEndRef,
  onClose,
  backgroundStyle,
}) => {
  const selectedChat = history.find((c) => c.id === selectedChatId) || history[0];
  const isConversationStarted = selectedChat.messages.length > 0;

  return (
    <div className="flex h-full" style={backgroundStyle}>
      {/* Sidebar */}
      <div className="w-72 min-w-[220px] max-w-[320px] h-full bg-[#18181b] border-r border-[#232323] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#232323]">
          <span className="text-lg font-bold text-white">History</span>
          <Button type="text" icon={<PlusOutlined />} className="text-white hover:bg-[#232323]" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {history.map((chat) => (
            <div
              key={chat.id}
              className={`px-4 py-3 cursor-pointer border-b border-[#232323] transition-colors duration-150 ${selectedChatId === chat.id ? 'bg-[#232323] text-white' : 'hover:bg-[#232323] text-gray-300'}`}
              onClick={() => setSelectedChatId(chat.id)}
            >
              <div className="font-semibold truncate">{chat.title}</div>
              <div className="text-xs text-gray-400">{chat.createdAt}</div>
              <div className="text-xs truncate mt-1 text-gray-400">{chat.messages[0]?.text}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[rgba(20,20,20,0.7)] backdrop-blur-xl text-gray-300">
        <div className="flex items-center justify-end p-4 border-b border-[#232323]">
          <Button type="text" onClick={onClose} className="text-white hover:bg-[#232323]">Close</Button>
        </div>
        {isConversationStarted ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {selectedChat.messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-4 ${msg.fromMe ? 'justify-end' : ''}`}>
                {!msg.fromMe && <Avatar src={AI_BOT.avatar} size={32} className="mt-1" />}
                <div className={`px-4 py-2.5 rounded-xl max-w-[70%] leading-relaxed ${msg.fromMe ? 'bg-blue-600 text-white' : 'bg-[#222222]'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex items-start gap-4">
                <Avatar src={AI_BOT.avatar} size={32} className="mt-1" />
                <div className="px-4 py-2.5 rounded-xl bg-[#222222] flex items-center gap-3">
                  <Spin /> <span>AI is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center gap-6"
            >
              <Avatar src={AI_BOT.avatar} size={64} />
              <h1 className="text-4xl font-bold text-white">{AI_BOT.name}</h1>
            </motion.div>
          </div>
        )}
        {/* Input Area */}
        <div className={`p-4 md:p-6 flex-shrink-0 ${!isConversationStarted && 'max-w-3xl w-full mx-auto'}`}>
          <div className="relative">
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="What do you want to know?"
              disabled={isPending}
              autoSize={{ minRows: 1, maxRows: 5 }}
              className="w-full bg-[#222222] border-[#333] text-white rounded-lg p-4 pl-5 pr-14 text-base focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
            <Button
              type="primary"
              shape="circle"
              onClick={handleSend}
              disabled={!input.trim() || isPending}
              className="absolute right-4 bottom-4 flex items-center justify-center w-9 h-9"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 2.93a2.5 2.5 0 0 1 2.6-.6l11.25 4.5c2.02.81 2.02 3.62 0 4.43l-11.25 4.5a2.5 2.5 0 0 1-3.37-2.6l.5-3.75a.625.625 0 0 1 1.24.17l-.5 3.75a1.25 1.25 0 0 0 1.68 1.3l11.25-4.5a1.25 1.25 0 0 0 0-2.36l-11.25-4.5a1.25 1.25 0 0 0-1.68 1.3l.5 3.75a.625.625 0 0 1-1.24.17l-.5-3.75a2.5 2.5 0 0 1 .77-2.4Z"/></svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalChatAI; 