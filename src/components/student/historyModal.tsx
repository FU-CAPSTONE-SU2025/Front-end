import React from 'react';
import { Modal, Avatar, Button, Popconfirm, Empty } from 'antd';
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons';
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
          <MessageOutlined className="text-blue-600 text-xl" />
          <span className="text-xl font-bold text-gray-800">All Chat History</span>
          <span className="text-sm text-gray-500 font-normal">({sessions.length} sessions)</span>
        </div>
      }
      width={500}
      className="history-modal"
    >
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {sortedSessions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-gray-500">
                <div className="text-base font-medium mb-1">No chat history yet</div>
                <div className="text-sm">Start your first conversation with AISEA BOT!</div>
              </div>
            }
            className="py-8"
          />
        ) : (
          sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSessionId === session.id 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md' 
                  : 'bg-gray-50 hover:bg-blue-50 border-2 border-transparent'
              }`}
              onClick={() => { onSelectSession(session.id); onClose(); }}
            >
              <Avatar 
                src={AI_BOT.avatar} 
                size={40}
                style={{ objectFit: 'cover' }}
                className="w-10 h-10 object-cover rounded-full border-2 border-blue-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate mb-1">
                  {session.title}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(session.updatedAt || session.createdAt)}
                </div>
              </div>
              <Popconfirm
                title="Delete this session?"
                description="This action cannot be undone. All messages in this session will be permanently deleted."
                onConfirm={e => { e?.stopPropagation(); handleDeleteSession(session.id); }}
                onCancel={e => e?.stopPropagation()}
                okText="Delete"
                cancelText="Cancel"
                okType="danger"
                placement="left"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined style={{ color: '#dc2626' }} />}
                  size="small"
                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={e => e.stopPropagation()}
                />
              </Popconfirm>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default HistoryModal; 