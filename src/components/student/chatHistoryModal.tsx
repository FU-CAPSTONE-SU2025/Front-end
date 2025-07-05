import React from 'react';
import { Modal, Button } from 'antd';
import { IChatSession } from '../../interfaces/IChatAI';

interface ChatHistoryModalProps {
  open: boolean;
  onClose: () => void;
  sessions: IChatSession[];
  onSelectSession: (session: IChatSession) => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ open, onClose, sessions, onSelectSession }) => (
  <Modal
    open={open}
    onCancel={onClose}
    footer={null}
    title={<span className="text-xl font-bold text-blue-800">All chat history</span>}
    width={400}
  >
    <div className="max-h-[60vh] overflow-y-auto">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2 cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all duration-200"
          onClick={() => { onSelectSession(session); onClose(); }}
        >
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-blue-900 truncate block">{session.title}</span>
            <span className="text-xs text-gray-500">{session.createdAt}</span>
          </div>
        </div>
      ))}
      {sessions.length === 0 && <div className="text-center text-gray-400 py-8">No chat history.</div>}
    </div>
  </Modal>
);

export default ChatHistoryModal; 