import React, { useState, useRef, useEffect } from 'react';
import { Collapse, List, Avatar, Badge, Input, Button, Spin, Empty, Typography } from 'antd';
import { UserOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { ChatSession, useAdvisorChatHub } from '../../hooks/useAdvisorChatHub';
import ChatBoxAdvisor from './chatBoxAdvisor';
import { sendMessageToAdvisor, sendMessageToSession } from '../../api/advisor/AdvisorAPI';

const { Panel } = Collapse;
const { Text } = Typography;

const AdvisorChatTab = () => {
  const {
    sessions, messages, currentSessionId, loading, error, isConnected,
    listSessions, joinSession, sendMessage, availableAdvisors = [], createHumanSession,
    setMessages, refreshMessages
  } = useAdvisorChatHub();

  // Chatbox state
  const [openChat, setOpenChat] = useState<{
    sessionId: number;
    staffName: string;
    avatar: string;
    isOnline: boolean;
  } | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get online advisors (assume availableAdvisors is an array of online advisors)
  const onlineAdvisors = (availableAdvisors || []).filter(a => a.isOnline);

  // Recent session list
  const sessionList = sessions.map(session => ({
    ...session,
    staffName: session.staffName || 'Advisor',
    avatar: '/img/Logo.svg',
    isOnline: session.isActive
  }));

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, openChat]);

  // Load sessions on mount
  useEffect(() => {
    if (isConnected) {
      listSessions();
    }
  }, [isConnected, listSessions]);

  // When selecting a new session
  useEffect(() => {
    if (openChat?.sessionId) {
      joinSession(openChat.sessionId);
    }
  }, [openChat, joinSession]);

  // Start chat with online advisor (create new session if not exists)
  const handleStartChatWithAdvisor = async (advisor: any) => {
    // Find existing session with this advisor
    const existingSession = sessions.find(s => s.staffId === advisor.id);
    if (existingSession) {
      setOpenChat({
        sessionId: existingSession.id,
        staffName: existingSession.staffName || 'Advisor',
        avatar: '/img/Logo.svg',
        isOnline: existingSession.isActive
      });
    } else {
      await createHumanSession(`Hello ${advisor.firstName || advisor.name || ''}`);
      setTimeout(() => listSessions(), 500);
    }
  };

  // When clicking a session, open chatbox
  const handleOpenSession = (session: any) => {
    console.log('[DEBUG] Clicked session:', session);
    setOpenChat({
      sessionId: session.id,
      staffName: session.staffName || 'Advisor',
      avatar: '/img/Logo.svg',
      isOnline: session.isOnline
    });
  };

  // Send message handler for chatBox (use API for sending, SignalR for receiving)
  const handleSendMessage = async (msg: string) => {
    if (!openChat?.sessionId || sendingMessage) return;
    
    setSendingMessage(true);
    try {
      // Use API to send message to existing session
      await sendMessageToSession(openChat.sessionId, msg);
      
      // Don't update messages here - let SignalR handle the broadcast
      // The message will appear when SignalR broadcasts it back
    } catch (err) {
      console.error('Failed to send message:', err);
      // Optionally show error to user
    } finally {
      setSendingMessage(false);
    }
  };

  // Refresh messages manually
  const handleRefreshMessages = async () => {
    if (!openChat?.sessionId || refreshingMessages) return;
    
    setRefreshingMessages(true);
    try {
      await refreshMessages();
    } catch (err) {
      console.error('Failed to refresh messages:', err);
    } finally {
      setRefreshingMessages(false);
    }
  };

  return (
    <div className="flex h-[600px] rounded-[18px] bg-[#f4f6fb] shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden border-none relative">
  
      <div className="w-full bg-white flex flex-col border-r border-[#f0f0f0] shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
        <div className="w-full min-w-0 bg-white px-5 pt-6 pb-3 font-bold text-[20px] border-b border-[#f0f0f0] text-[#222] box-border">
          Chat Sessions
        </div>
        
        {/* Connection Status */}
        <div className="px-5 py-2 bg-gray-50 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {error && (
              <span className="text-sm text-red-500 ml-2">{error}</span>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-white p-0">
          {loading && sessions.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Spin size="large" />
            </div>
          ) : sessionList.length === 0 ? (
            <div className="text-[#bbb] p-8 text-center text-[16px]">No chat sessions yet</div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={sessionList}
              renderItem={item => (
                <List.Item
                  className={`cursor-pointer mb-1 rounded-lg px-3 py-2 flex items-center gap-3 transition-colors
                    ${openChat?.sessionId === item.id ? 'bg-blue-50 border border-blue-400' : 'hover:bg-gray-100 border border-transparent'}
                  `}
                  style={{ minHeight: 64, boxShadow: 'none' }}
                  onClick={() => handleOpenSession(item)}
                >
                  <Badge
                    color={item.isOnline ? 'green' : 'gray'}
                    offset={[-2, 2]}
                    dot
                  >
                    <Avatar src={item.avatar} icon={<UserOutlined />} size={44} />
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[16px] text-ellipsis overflow-hidden whitespace-nowrap">{item.staffName}</div>
                    <div className="text-[13px] text-[#888] mt-[2px] text-ellipsis overflow-hidden whitespace-nowrap">
                      {item.lastMessage ? item.lastMessage.slice(0, 40) : <span className="text-[#bbb]">No messages yet</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end min-w-[70px]">
                    <span className="text-[11px] text-[#bbb]">
                      {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString() : ''}
                    </span>
                    <span className={`text-[10px] mt-1 ${item.isOnline ? 'text-green-500' : 'text-gray-400'}`}>{item.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>

      {/* Floating chatbox */}
      {openChat && (
        <ChatBoxAdvisor
          openChat={openChat}
          messages={messages}
          loading={loading || sendingMessage}
          error={error}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          sendMessage={handleSendMessage}
          onClose={() => setOpenChat(null)}
          messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
          onRefresh={handleRefreshMessages}
          refreshing={refreshingMessages}
        />
      )}
    </div>
  );
};

export default AdvisorChatTab; 