import React, { useRef, useState } from 'react';
import { Avatar, Button, Popconfirm, Tooltip, Dropdown, Menu, Spin, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined, MessageOutlined, MoreOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { IChatSession } from '../../interfaces/IChatAI';
import DeleteSessionModal from './deleteSessionModal';

interface SidebarChatProps {
  sessions: IChatSession[];
  selectedSessionId: number | null;
  onSelectSession: (id: number) => void;
  onNewChat: () => void;
  onShowHistoryModal: () => void;
  AI_BOT: { avatar: string };
  handleRenameSession: (id: number, newTitle: string) => void;
  handleDeleteSession: (id: number) => void;
  loading?: boolean;
}

const SidebarChat: React.FC<SidebarChatProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  onNewChat,
  onShowHistoryModal,
  AI_BOT,
  handleRenameSession,
  handleDeleteSession,
  loading = false
}) => {
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<IChatSession | null>(null);

  // Sort sessions by newest first
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const handleMenuClick = (key: string, session: IChatSession) => {
    if (key === 'rename') {
      setEditingSessionId(session.id);
      setEditValue(session.title);
    }
    if (key === 'delete') {
      setSessionToDelete(session);
      setDeleteModalOpen(true);
    }
  };

  const handleRenameConfirm = () => {
    if (editingSessionId && editValue.trim()) {
      handleRenameSession(editingSessionId, editValue.trim());
      setEditingSessionId(null);
      setEditValue('');
    } else if (editValue.trim() === '') {
      message.error('Session title cannot be empty');
    }
  };

  const handleRenameCancel = () => {
    setEditingSessionId(null);
    setEditValue('');
  };

  const handleDelete = () => {
    if (sessionToDelete) {
      handleDeleteSession(sessionToDelete.id);
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <>
      <aside className="w-80 min-w-[260px] max-w-[320px] h-[calc(100vh-6rem)] bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col mr-6 mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <MessageOutlined className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-wide">AISEA BOT</span>
          </div>
          <Tooltip title="New Chat">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onNewChat}
              size="large"
              className="shadow-md hover:shadow-lg transition-all duration-300"
              loading={loading}
            />
          </Tooltip>
        </div>
        <div className="flex-1 overflow-y-auto py-2 pr-1 bg-gradient-to-b from-white to-blue-50">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageOutlined className="text-4xl mb-3 text-gray-300" />
              <div className="text-sm">No chat sessions yet</div>
              <div className="text-xs mt-1">Create your first chat to get started</div>
            </div>
          ) : (
            sortedSessions.slice(0, 10).map((session) => {
              const isEditing = editingSessionId === session.id;
              const isSelected = selectedSessionId === session.id;
              
              const menu = (
                <Menu
                  onClick={({ key }) => handleMenuClick(key as string, session)}
                  items={[
                    {
                      key: 'rename',
                      icon: <EditOutlined className="text-blue-600" />,
                      label: 'Rename',
                    },
                    {
                      key: 'delete',
                      icon: <DeleteOutlined className="text-red-500" />,
                      label: 'Delete',
                    },
                  ]}
                />
              );

              return (
                <div
                  key={session.id}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 shadow-md' 
                      : 'hover:bg-blue-50 border border-transparent'
                  }`}
                  onClick={() => !isEditing && onSelectSession(session.id)}
                >
                  <Avatar 
                    src={AI_BOT.avatar} 
                    size={40}
                    style={{ objectFit: 'cover' }}
                    className="w-10 h-10 object-cover rounded-full border-2 border-blue-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onPressEnter={handleRenameConfirm}
                          onBlur={handleRenameCancel}
                          autoFocus
                          size="small"
                          className="text-sm"
                          maxLength={50}
                        />
                        <Button
                          type="text"
                          icon={<CheckOutlined />}
                          size="small"
                          onClick={handleRenameConfirm}
                          className="text-green-600 hover:text-green-700"
                        />
                        <Button
                          type="text"
                          icon={<CloseOutlined />}
                          size="small"
                          onClick={handleRenameCancel}
                          className="text-red-600 hover:text-red-700"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-900 font-semibold text-base truncate">
                        {session.title}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">{formatDate(session.updatedAt || session.createdAt)}</div>
                  </div>
                  {!isEditing && (
                    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                      <Button
                        type="text"
                        icon={<MoreOutlined className="text-lg text-gray-500 hover:text-blue-700" />}
                        onClick={e => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Dropdown>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-center">
          <Button
            type="default"
            className="w-full font-medium text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 transition-colors"
            onClick={onShowHistoryModal}
          >
            View all history ({sessions.length})
          </Button>
        </div>
      </aside>
      <DeleteSessionModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSessionToDelete(null); }}
        onDelete={handleDelete}
        sessionTitle={sessionToDelete?.title || ''}
      />
    </>
  );
};

export default SidebarChat; 