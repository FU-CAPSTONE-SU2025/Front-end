import React, { useState } from 'react';
import { Avatar, Button, Drawer, Tabs, Input, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import ReactDOM from 'react-dom';
import UserChatBox from './UserChatBox';
import { ChatUser } from '../../interfaces/IChat';

import { useNavigate } from 'react-router-dom';
import { mockChatUsers } from '../../data/mockChatUsers';

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
  const [userChatBoxOpen, setUserChatBoxOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ai');
  const navigate = useNavigate();

  // Filter users based on search term
  const filteredUsers = mockChatUsers.filter((user: ChatUser) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render UserChatBox ra ngoài root
  const userChatBoxPortal = userChatBoxOpen && selectedUser
    ? ReactDOM.createPortal(
        <UserChatBox 
          onClose={() => {
            setUserChatBoxOpen(false);
            setSelectedUser(null);
          }} 
          selectedUser={selectedUser} 
        />,
        document.body
      )
    : null;

  const handleUserClick = (user: ChatUser) => {
    setSelectedUser(user);
    setUserChatBoxOpen(true);
    setOpen(false);
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
      children: (
        <div className="flex flex-col h-full bg-gray-50">
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              <motion.div
                key={AI_BOT.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer`}
                onClick={handleAIClick}
              >
                <Avatar src={AI_BOT.avatar} size={40} />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{AI_BOT.name}</span>
                    <span className="text-xs text-green-500 ml-2">{AI_BOT.time}</span>
                  </div>
                  <div className="text-sm text-gray-600">{AI_BOT.lastMessage}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ),
    },
    {
      key: 'users',
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Supporters</span>
          <Badge count={mockChatUsers.filter((u: ChatUser) => u.isOnline).length} size="small" />
        </div>
      ),
      children: (
        <div className="flex flex-col h-full bg-gray-50">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="Search supporters..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-full"
            />
          </div>
          
          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredUsers.map((user: ChatUser) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer`}
                  onClick={() => handleUserClick(user)}
                >
                  <div className="relative">
                    <Avatar src={user.avatarUrl} size={40} />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">{user.name}</span>
                      <span className={`text-xs ml-2 ${
                        user.isOnline ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {user.isOnline ? 'Online' : user.lastSeen}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{user.role}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredUsers.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No supporters found
              </div>
            )}
          </div>
        </div>
      ),
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
      {userChatBoxPortal}
    </>
  );
};

export default Messenger;
