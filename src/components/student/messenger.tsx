import React, { useState } from 'react';
import { Button, Drawer, Tabs } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import AiAssistance from './aiAssistance';
import AdvisorChatTab from './advisorChatTab';

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
      key: 'advisor',
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Advisor</span>
        </div>
      ),
      children: <AdvisorChatTab onChatBoxOpen={handleChatBoxOpen} drawerOpen={open} onCloseDrawer={() => setOpen(false)} />,
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
