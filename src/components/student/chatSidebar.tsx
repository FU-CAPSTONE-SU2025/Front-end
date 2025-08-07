import React from 'react';
import { Button, Spin, Dropdown, Menu } from 'antd';
import { PlusOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import { IChatSession } from '../../interfaces/IChatAI';

interface ChatSidebarProps {
  sessions: IChatSession[];
  selectedSession: IChatSession | null;
  onSelectSession: (session: IChatSession) => void;
  onNewChat: (initMessage: string) => void;
  onShowHistoryModal: () => void;
  onDeleteSession: (session: IChatSession) => void;
  loading?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  selectedSession,
  onSelectSession,
  onNewChat,
  onShowHistoryModal,
  onDeleteSession,
  loading
}) => (
  <aside className="w-80 min-w-[260px] max-w-[320px] h-[calc(100vh-6rem)] bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col mr-6 mt-6 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
      <span className="text-xl font-bold text-gray-900 tracking-wide">AISEA BOT</span>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => onNewChat('Hi!')}
        size="large"
        className="shadow-md"
      />
    </div>
    <div className="flex-1 overflow-y-auto py-2 pr-1 bg-gradient-to-b from-white to-blue-50">
      {loading ? <Spin className="mt-8" /> : (
        sessions.slice(0, 10).map(session => {
          const menu = (
            <Menu
              items={[{
                key: 'delete',
                icon: <DeleteOutlined style={{ color: '#ef4444 !important' }} />,
                label: 'Delete',
                style: { color: '#ef4444 !important' },
                onClick: () => onDeleteSession(session)
              }]}
            />
          );
          return (
            <div
              key={session.id}
              className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-200 group ${selectedSession?.id === session.id ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 shadow-md' : 'hover:bg-blue-50 border border-transparent'}`}
              onClick={() => onSelectSession(session)}
            >
              <div className="flex-1 min-w-0">
                <span className="text-base font-semibold text-gray-900 truncate block">{session.title}</span>
                <span className="text-xs text-gray-400">{session.createdAt}</span>
              </div>
              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                <Button
                  type="text"
                  icon={<MoreOutlined style={{ color: '#6b7280 !important', fontSize: '18px' }} />}
                  onClick={e => e.stopPropagation()}
                  style={{ color: '#6b7280 !important' }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Dropdown>
            </div>
          );
        })
      )}
    </div>
    <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-center">
      <Button
        type="primary"
        className="w-full font-bold text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 transition-colors"
        onClick={onShowHistoryModal}
        style={{ 
          color: '#1d4ed8 !important',
          borderColor: '#bfdbfe !important',
          backgroundColor: '#eff6ff !important'
        }}
      >
        View all history
      </Button>
    </div>
  </aside>
);

export default ChatSidebar; 