import React, { useState, useEffect } from 'react';
import { Button, Drawer, Tabs } from 'antd';
import { MessageOutlined, SearchOutlined, UserOutlined, ExclamationCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import StudentChatTab from './studentChatTab';
import OpenChatTab from './openChatTab';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { SIGNALR_CONFIG, ConnectionState} from '../../config/signalRConfig';


const Messenger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('open-chat');
  const { 
    connectionState, 
    error: connectionError, 
    loading,
    dataFetched,
    refreshAllData
  } = useAdvisorChatWithStudent();

  // Facebook-like UX - load data once when drawer opens
  useEffect(() => {
    if (open && connectionState === ConnectionState.Connected) {
      refreshAllData();
    }
  }, [open, connectionState, refreshAllData]);

  // Handle tab change - Facebook style (no refetch)
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // No data fetching - data persists between tabs like Facebook
  };

  const items = [
    {
      key: 'open-chat',
      label: (
        <div className="flex items-center gap-2">
          <UserAddOutlined />
          <span>Open Chat</span>
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
          icon={<MessageOutlined className="text-lg" />}
          shape="circle"
          onClick={() => {
            setOpen(true);
          }}
          className="relative transition-all duration-200 hover:scale-105"
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
        

        
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={items}
          className="h-full"
          tabBarStyle={{ margin: 0, padding: '0 16px' }}
          destroyOnHidden={false}
        />
      </Drawer>
    </>
  );
};

export default Messenger; 