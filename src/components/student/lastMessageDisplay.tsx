import React from 'react';

interface LastMessageDisplayProps {
  lastMessage?: string;
  lastMessageTime?: string;
  className?: string;
  showPrefix?: boolean;
  prefix?: string;
  senderId?: number;
}

const LastMessageDisplay: React.FC<LastMessageDisplayProps> = ({ 
  lastMessage, 
  lastMessageTime,
  className = '',
  showPrefix = false,
  prefix = 'Latest:',
  senderId
}) => {
  // Format time to hh:mm
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (err) {
      return '';
    }
  };

  if (!lastMessage) {
    return null;
  }

  const time = lastMessageTime ? formatTime(lastMessageTime) : '';
  const isStudentMessage = senderId === 18;
  const displayMessage = isStudentMessage ? `You: ${lastMessage}` : lastMessage;

  // Facebook Messenger style: message below name, time on the right
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-500 truncate">
          {showPrefix && <span className="text-gray-400">{prefix} </span>}
          <span className="truncate">{displayMessage}</span>
        </div>
      </div>
      {time && (
        <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
          {time}
        </div>
      )}
    </div>
  );
};

export default LastMessageDisplay; 