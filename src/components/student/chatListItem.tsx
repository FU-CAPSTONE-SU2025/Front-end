import React from 'react';
import { Avatar, Badge } from 'antd';
import { AdvisorSession } from '../../hooks/useAdvisorChat';
import StaffNameDisplay from './staffNameDisplay';
import LastMessageDisplay from './lastMessageDisplay';

interface ChatListItemProps {
  session: AdvisorSession;
  onClick: (session: AdvisorSession) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ 
  session, 
  onClick
}) => {
  // Determine if session is assigned or unassigned (staffId = 4 means unassigned)
  const isUnassigned = !session.staffId || session.staffId === 4;
  
  return (
    <div
      className="cursor-pointer transition-all duration-300 hover:bg-gray-50 border-b border-gray-100 hover:border-gray-200"
      onClick={() => onClick(session)}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="relative">
          <Avatar 
            src={isUnassigned ? 'https://i.pravatar.cc/150?img=2' : (session.staffAvatar || 'https://i.pravatar.cc/150?img=1')} 
            size={48} 
            className={`ring-3 shadow-md ${
              isUnassigned ? 'ring-orange-100' : 'ring-gray-100'
            }`}
          />
          {session.isOnline && !isUnassigned && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
          {isUnassigned && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="font-semibold text-gray-800 text-base">
              <StaffNameDisplay 
                staffId={session.staffId}
                fallbackName={isUnassigned ? 'Unassigned Advisor' : (session.staffName || session.title)}
              />
            </div>
            {session.unreadCount && session.unreadCount > 0 && (
              <Badge 
                count={session.unreadCount} 
                size="small"
                className={isUnassigned ? 'bg-orange-500' : 'bg-red-500'}
              />
            )}
          </div>
          <LastMessageDisplay 
            lastMessage={session.lastMessage}
            lastMessageTime={session.lastMessageTime}
            className="text-sm text-gray-500"
            senderId={session.lastMessageSenderId} // Add senderId prop
          />
          {isUnassigned && (
            <div className="text-xs text-orange-600 mt-1">
              Waiting for assignment
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem; 