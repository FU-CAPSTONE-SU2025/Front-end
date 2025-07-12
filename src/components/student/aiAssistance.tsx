import React from 'react';
import { Avatar } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const AI_BOT = {
  id: 1,
  name: 'AISEA BOT',
  avatar: '/img/Logo.svg',
  lastMessage: 'Hello! How can I help you today?',
  time: 'Online',
  unread: false,
};

interface AiAssistanceProps {
  handleAIClick: () => void;
}

const AiAssistance: React.FC<AiAssistanceProps> = ({ handleAIClick }) => (
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
);

export default AiAssistance; 