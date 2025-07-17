import React, { useEffect, useRef } from 'react';
import { Avatar, Badge, Button, Input, Spin, Empty, List } from 'antd';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import type { InputRef } from 'antd/es/input';

const { Text } = Typography;

const ChatBoxAdvisor = ({
  openChat,
  messages,
  loading,
  error,
  messageInput,
  setMessageInput,
  sendMessage,
  onClose,
  messagesEndRef,
  onRefresh,
  refreshing = false,
}: {
  openChat: {
    sessionId: number;
    staffName: string;
    avatar: string;
    isOnline: boolean;
  } | null;
  messages: any[];
  loading: boolean;
  error: string | null;
  messageInput: string;
  setMessageInput: (val: string) => void;
  sendMessage: (msg: string) => Promise<void>;
  onClose: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onRefresh?: () => void;
  refreshing?: boolean;
}) => {
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, openChat, messagesEndRef]);

  useEffect(() => {
    if (openChat) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [openChat]);

  if (!openChat) return null;

  // Gửi tin nhắn khi bấm Send hoặc nhấn Enter
  const handleSend = async () => {
    if (messageInput.trim() && !loading) {
      await sendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  return (
    <div className="fixed bottom-8 right-8 w-[400px] bg-white rounded-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] z-[9999] flex flex-col overflow-hidden min-h-[480px] max-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-[#eee] flex items-center gap-3 bg-[#f7f9fb]">
        <Avatar src={openChat.avatar} size={44} />
        <span className="font-bold text-[17px]">{openChat.staffName}</span>
        <Badge color={openChat.isOnline ? 'green' : 'gray'} dot />
        <div className="text-xs text-gray-500 ml-auto">Session: {openChat.sessionId}</div>
        {onRefresh && (
          <Button
            type="text"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={onRefresh}
            disabled={refreshing}
            className="text-[#888] hover:text-[#1890ff]"
            title="Refresh messages"
          />
        )}
        <Button
          type="text"
          icon={<CloseOutlined />}
          className="text-[#888]"
          onClick={onClose}
        />
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-3 bg-[#f7f9fb] flex flex-col justify-end">
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <Spin size="large" />
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
        )}
        {refreshing && messages.length > 0 && (
          <div className="flex items-center justify-center py-2 mb-2">
            <Spin size="small" />
            <span className="ml-2 text-xs text-gray-500">Refreshing messages...</span>
          </div>
        )}
        {error && (
          <div className="text-red-500 mb-3 p-2 bg-red-50 rounded-lg text-sm">{error}</div>
        )}
        {!loading && messages.length === 0 && (
          <Empty description="No messages yet" className="mt-10" />
        )}
        {messages.length > 0 && (
          <div className="text-xs text-gray-400 text-center mb-2">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </div>
        )}
        <List
          dataSource={messages}
          renderItem={msg => {
            const key = msg.id || `msg-${Math.random()}`;
            const content = msg.content || msg.message || 'No content';
            const senderId = msg.senderId || msg.sender_id || 1;
            const createdAt = msg.createdAt || msg.timestamp || msg.created_at || new Date().toISOString();
            return (
              <List.Item
                key={key}
                className={`border-none p-0 mb-2.5 flex ${senderId === 1 ? 'justify-end text-right' : 'justify-start text-left'}`}
              >
                <div className={`inline-block ${senderId === 1 ? 'bg-gradient-to-r from-[#1890ff] to-[#40a9ff] text-white' : 'bg-white text-[#333] border border-[#f0f0f0]'} rounded-[22px] px-[22px] py-3 m-1 max-w-[320px] text-[15px] shadow ${senderId === 1 ? 'shadow-[0_2px_8px_rgba(24,144,255,0.08)]' : 'shadow-[0_1px_4px_rgba(0,0,0,0.04)]'} break-words`}>
                  <div>{content}</div>
                  <div className="text-[10px] opacity-70 mt-1">
                    {createdAt ? new Date(createdAt).toLocaleTimeString() : ''}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-[18px] border-t border-[#f0f0f0] bg-white flex gap-2.5 items-center shadow-[0_-2px_8px_rgba(0,0,0,0.02)]">
        <Input
          ref={inputRef}
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Type a message..."
          disabled={!openChat?.sessionId || loading}
          className="rounded-[22px] text-[16px] px-[18px] py-[10px]"
        />
        <Button
          type="primary"
          onClick={handleSend}
          disabled={!messageInput.trim() || !openChat?.sessionId || loading}
          loading={loading}
          className="rounded-[22px] font-semibold text-[16px] min-w-[80px] h-[44px]"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatBoxAdvisor; 