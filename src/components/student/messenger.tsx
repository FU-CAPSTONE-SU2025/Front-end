import React, { useState } from 'react';
import { Button, Drawer, Tabs } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import AiAssistance from './aiAssistance';
import AdvisorChatTab from './advisorChatTab';
import { motion, AnimatePresence } from 'framer-motion';

const Messenger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const navigate = useNavigate();

  const handleAIClick = () => {
    setOpen(false);
    navigate('/student/chat-ai');
  };

  const handleChatBoxOpen = (advisor: any) => {
    // Close drawer and trigger main chat box
    setOpen(false);
    // Emit custom event to open main chat box
    window.dispatchEvent(new CustomEvent('openMainChatBox', { detail: advisor }));
  };

  const TabLabel: React.FC<{ icon: React.ReactNode; text: string; tabKey: string }>=({ icon, text, tabKey }) => (
    <div
      className={`relative flex items-center gap-2 px-2 py-1 select-none cursor-pointer transition-colors duration-200 ${
        activeTab === tabKey ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      <span className="transition-transform duration-200 group-hover:-translate-y-0.5">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
      {activeTab === tabKey && (
        <motion.div
          layoutId="tabs-underline"
          className="absolute -bottom-[6px] left-0 right-0 h-[2px] bg-blue-600 rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </div>
  );

  const items = [
    {
      key: 'ai',
      label: (
        <TabLabel icon={<MessageOutlined />} text="AI Assistant" tabKey="ai" />
      ),
      children: <AiAssistance handleAIClick={handleAIClick} />,
    },
    {
      key: 'advisor',
      label: (
        <TabLabel icon={<UserOutlined />} text="Advisor Chat" tabKey="advisor" />
      ),
      children: <AdvisorChatTab key="advisor-chat-tab" onChatBoxOpen={handleChatBoxOpen} drawerOpen={open} onCloseDrawer={() => setOpen(false)} />,
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
          tabBarStyle={{ margin: 0, padding: '0 16px 6px 16px' }}
          rootClassName="student-messenger-tabs"
        />
      </Drawer>
    </>
  );
};

export default Messenger;
