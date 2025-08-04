import React, { useState, useEffect } from 'react';
import { Avatar, Button, Drawer, Tabs, Input, Badge, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageOutlined, SearchOutlined, UserOutlined, ExclamationCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import ReactDOM from 'react-dom';
import AdvisorChatBox from './advisorChatBox';
import StudentChatTab from './studentChatTab';
import OpenChatTab from './openChatTab';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { SIGNALR_CONFIG, ConnectionState, getConnectionStatusColor } from '../../config/signalRConfig';
import { StudentSession, ChatMessage } from '../../interfaces/IChat';

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: string;
  unreadCount?: number;
}

const Messenger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [studentChatBoxOpen, setStudentChatBoxOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('open-chat');

  // Get connection state and sessions from the hook
  const { 
    connectionState, 
    error: connectionError, 
    sessions,
    unassignedSessions,
    allAssignedSessions,
    loading,
    dataFetched,
    refreshAllData
  } = useAdvisorChatWithStudent();

  // Pre-load data when component mounts
  useEffect(() => {
    // Load data immediately when component mounts
    refreshAllData();
  }, [refreshAllData]);

  // Re-fetch data when connection becomes available
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && !dataFetched) {
      // Only fetch if data hasn't been fetched yet
      refreshAllData();
    }
  }, [connectionState, refreshAllData, dataFetched]);





  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setStudentChatBoxOpen(true);
    setOpen(false);
  };

  // Filter sessions for different tabs
  const { advisorId } = useAdvisorChatWithStudent();
  
  // Open Chat: Show all sessions with staffId = 4 (unassigned)
  const openChatSessions = [...sessions, ...unassignedSessions].filter(session => 
    session.staffId === 4 // EmptyStaffProfileId from backend
  );
  
  // My Chat: Show all assigned sessions (including current advisor's sessions and all other assigned sessions)
  const myChatSessions = allAssignedSessions; // All assigned sessions from backend

  const items = [
    {
      key: 'open-chat',
      label: (
        <div className="flex items-center gap-2">
          <UserAddOutlined />
          <span>Open Chat</span>
          <Badge count={openChatSessions.length} size="small" />
        </div>
      ),
      children: (
        <OpenChatTab 
          drawerOpen={open}
          onCloseDrawer={() => setOpen(false)}
        />
      ),
    },
    {
      key: 'students',
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>My Chat</span>
          <Badge count={myChatSessions.length} size="small" />
        </div>
      ),
      children: (
        <StudentChatTab 
          drawerOpen={open}
          onCloseDrawer={() => setOpen(false)}
        />
      ),
    },
  ];

  return (
    <>
            <div className="relative">
        <Button
          icon={loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div> : <MessageOutlined className="text-lg" />}
          shape="circle"
          onClick={() => {
            setOpen(true);
          }}
          className="relative transition-all duration-200 hover:scale-105"
          loading={loading}
        />
      </div>
      
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <div className="font-bold text-gray-800">Messages</div>
            {connectionError && (
              <ExclamationCircleOutlined className="text-red-500" />
            )}
          </div>
        }
        placement="right"
        width={SIGNALR_CONFIG.UI.CHAT_BOX_WIDTH}
        onClose={() => setOpen(false)}
        open={open}
        styles={{ body: { padding: 0 }, header: { borderBottom: '1px solid #e5e7eb' } }}
      >
        {connectionError && (
          <div className="bg-red-50 border-b border-red-200 p-3">
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-red-500" />
              <span className="text-red-700 text-sm">{connectionError}</span>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-blue-700 text-sm">Loading sessions...</span>
            </div>
          </div>
        )}
        
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