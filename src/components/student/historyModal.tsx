import React from 'react';
import { Modal, Avatar, Button, Popconfirm, Empty } from 'antd';
import { DeleteOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { IChatSession } from '../../interfaces/IChatAI';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  sessions: IChatSession[];
  selectedSessionId: number | null;
  onSelectSession: (id: number) => void;
  AI_BOT: { avatar: string };
  handleDeleteSession: (id: number) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ 
  open, 
  onClose, 
  sessions, 
  selectedSessionId, 
  onSelectSession, 
  AI_BOT, 
  handleDeleteSession 
}) => {
  // Sort sessions by newest first
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

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
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <MessageOutlined className="text-gray-600 text-lg" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">Chat History</div>
            <div className="text-sm text-gray-500 font-normal">{sessions.length} conversations</div>
          </div>
        </div>
      }
      width={480}
      className="history-modal"
      styles={{
        header: {
          borderBottom: '1px solid #f3f4f6',
          paddingBottom: '16px',
          marginBottom: '0'
        },
        body: {
          padding: '20px 0'
        }
      }}
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {sortedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageOutlined className="text-gray-400 text-2xl" />
            </div>
            <div className="text-center">
              <div className="text-gray-900 font-medium text-base mb-1">No conversations yet</div>
              <div className="text-gray-500 text-sm">Start your first chat with AISEA BOT</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedSessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedSessionId === session.id 
                    ? 'bg-gray-100 border border-gray-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => { onSelectSession(session.id); onClose(); }}
              >
                <Avatar 
                  src={AI_BOT.avatar} 
                  size={36}
                  style={{ objectFit: 'cover' }}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate mb-1">
                    {session.title}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ClockCircleOutlined className="text-xs" />
                    {formatDate(session.updatedAt || session.createdAt)}
                  </div>
                </div>
                                 <Button
                   type="primary"
                   icon={<DeleteOutlined />}
                   size="small"
                   className=" duration-200 hover:text-red-500"
                   onClick={e => {
                     e.stopPropagation();
                     handleDeleteSession(session.id);
                   }}
                 />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default HistoryModal; 