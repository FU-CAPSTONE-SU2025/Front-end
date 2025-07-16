import React, { useState } from 'react';
import { Avatar, Button, Drawer, Tabs, Input, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import ReactDOM from 'react-dom';
import { ChatUser } from '../../interfaces/IChat';

import { useNavigate } from 'react-router';
import { mockChatUsers } from '../../data/mockChatUsers';
import AiAssistance from './aiAssistance';
import AdvisorChatTab from './advisorChatTab';
import { useAdvisorChatHub } from '../../hooks/useAdvisorChatHub';


const AI_BOT = {
  id: 1,
  name: 'AISEA BOT',
  avatar: '/img/Logo.svg',
  lastMessage: 'Hello! How can I help you today?',
  time: 'Online',
  unread: false,
};

const Messenger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ai');
  const navigate = useNavigate();

  // Get advisor chat data from hook
  const {
    sessions,
    loading: advisorLoading,
    isConnected: advisorConnected,
    listSessions,
  } = useAdvisorChatHub();

  const handleUserClick = (user: ChatUser) => {
    // This will be handled by AdvisorChatTab component
    console.log('User clicked:', user);
  };

  const handleAIClick = () => {
    setOpen(false);
    navigate('/student/chat-ai');
  };

  const items = [
    {
      key: 'ai',
      label: (
        <div className="flex items-center gap-2">
          <MessageOutlined />
          <span>AI Assistant</span>
        </div>
      ),
      children: <AiAssistance handleAIClick={handleAIClick} />,
    },
    {
      key: 'users',
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Advisor</span>
          <Badge count={sessions?.length || 0} size="small" />
        </div>
      ),
      children: <AdvisorChatTab />,
    },
  ];

  return (
    <>
      <Button
        icon={<MessageOutlined className="text-lg" />}
        shape="circle"
        onClick={() => setOpen(true)}
        className="relative"
      />
      <Drawer
        title={<div className="font-bold text-gray-800">Messages</div>}
        placement="right"
        width={400}
        onClose={() => setOpen(false)}
        open={open}
        styles={{ body: { padding: 0 }, header: { borderBottom: '1px solid #e5e7eb' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          className="h-full"
          tabBarStyle={{ margin: 0, padding: '0 16px' }}
        />
      </Drawer>
    </>
  );
};

export default Messenger;
