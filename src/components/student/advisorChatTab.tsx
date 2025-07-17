import React, { useState, useRef, RefObject } from 'react';
import ChatBoxAdvisor from './chatBoxAdvisor';
import { Avatar, Badge, Spin } from 'antd';
import { ChatSession } from '../../hooks/useAdvisorChatSignalR';

interface AdvisorChatTabProps {
  chat: {
    sessions: ChatSession[];
    messages: any[];
    currentSessionId: number | null;
    loading: boolean;
    error: string | null;
    listSessions: () => Promise<void>;
    joinSession: (sessionId: number) => Promise<void>;
    sendMessage: (sessionId: number, message: string) => Promise<void>;
    loadMoreMessages: (sessionId: number, pageNumber?: number, pageSize?: number) => Promise<void>;
    setMessages: (msgs: any[]) => void;
  };
}

const AdvisorChatTab: React.FC<AdvisorChatTabProps> = ({ chat }) => {
  const [openChat, setOpenChat] = useState<{
    sessionId: number;
    staffName: string;
    avatar: string;
    isOnline: boolean;
  } | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chat.listSessions();
    // eslint-disable-next-line
  }, []);

  const handleOpenSession = (session: ChatSession) => {
    setOpenChat({
      sessionId: session.id,
      staffName: session.staffName || 'Advisor',
      avatar: '/img/Logo.svg',
      isOnline: session.isActive,
    });
    chat.joinSession(session.id);
  };

  const handleSendMessage = async (msg: string) => {
    if (!openChat?.sessionId || !msg.trim()) return;
    try {
      await chat.sendMessage(openChat.sessionId, msg);
      setMessageInput('');
      // Không fetch lại lịch sử, SignalR sẽ tự broadcast về
    } catch (err) {
      // error đã có trong chat.error
    }
  };

  return (
    <div className="flex h-[600px] rounded-[18px] bg-[#f4f6fb] shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden border-none relative">
      <div className="w-full bg-white flex flex-col border-r border-[#f0f0f0] shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
        <div className="w-full min-w-0 bg-white px-5 pt-6 pb-3 font-bold text-[20px] border-b border-[#f0f0f0] text-[#222] box-border">
          Chat Sessions
        </div>
        <div className="px-5 py-2 bg-gray-50 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${chat.loading ? 'bg-yellow-400' : 'bg-green-500'}`} />
            <span className="text-sm text-gray-600">
              {chat.loading ? 'Loading...' : 'Connected'}
            </span>
            {chat.error && (
              <span className="text-sm text-red-500 ml-2">{chat.error}</span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-white p-0">
          {chat.loading && chat.sessions.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Spin size="large" />
            </div>
          ) : chat.sessions.length === 0 ? (
            <div className="text-[#bbb] p-8 text-center text-[16px]">No chat sessions yet</div>
          ) : (
            chat.sessions.map((session: ChatSession) => (
              <div
                key={session.id}
                className={`cursor-pointer mb-1 rounded-lg px-3 py-2 flex items-center gap-3 transition-colors ${openChat?.sessionId === session.id ? 'bg-blue-50 border border-blue-400' : 'hover:bg-gray-100 border border-transparent'}`}
                style={{ minHeight: 64, boxShadow: 'none' }}
                onClick={() => handleOpenSession(session)}
              >
                <Badge color={session.isActive ? 'green' : 'gray'} offset={[-2, 2]} dot>
                  <Avatar src={'/img/Logo.svg'} size={44} />
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[16px] text-ellipsis overflow-hidden whitespace-nowrap">{session.staffName}</div>
                  <div className="text-[13px] text-[#888] mt-[2px] text-ellipsis overflow-hidden whitespace-nowrap">
                    {session.lastMessage ? session.lastMessage.slice(0, 40) : <span className="text-[#bbb]">No messages yet</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-[70px]">
                  <span className="text-[11px] text-[#bbb]">
                    {session.lastMessageTime ? new Date(session.lastMessageTime).toLocaleTimeString() : ''}
                  </span>
                  <span className={`text-[10px] mt-1 ${session.isActive ? 'text-green-500' : 'text-gray-400'}`}>{session.isActive ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {openChat && (
        <ChatBoxAdvisor
          openChat={openChat}
          messages={chat.messages.filter(m => m.sessionId === openChat.sessionId)}
          loading={chat.loading}
          error={chat.error}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          sendMessage={handleSendMessage}
          onClose={() => setOpenChat(null)}
          messagesEndRef={messagesEndRef as RefObject<HTMLDivElement>}
        />
      )}
    </div>
  );
};

export default AdvisorChatTab; 