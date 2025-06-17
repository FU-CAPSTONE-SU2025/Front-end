import React, { useState } from 'react';
import { Avatar, Button, Drawer } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageOutlined } from '@ant-design/icons';
import ChatBox from './chatbox';
import ReactDOM from 'react-dom';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

const mockChats: Chat[] = [
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/40?img=1',
    lastMessage: 'Hey, how are you?',
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/40?img=2',
    lastMessage: 'See you tomorrow!',
    time: '1h ago',
    unread: false,
  },
  {
    id: 3,
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/40?img=3',
    lastMessage: 'Can we meet at 5?',
    time: '3h ago',
    unread: true,
  },
];

const Messenger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [chatBoxChat, setChatBoxChat] = useState<Chat | null>(null);
  const unreadCount = mockChats.filter((c) => c.unread).length;
  const filteredChats = mockChats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Render ChatBox ra ngoài root để không bị ảnh hưởng bởi header/layout
  const chatBoxPortal = chatBoxChat
    ? ReactDOM.createPortal(
        <ChatBox
          chat={chatBoxChat}
          onClose={() => setChatBoxChat(null)}
        />,
        document.body
      )
    : null;

  return (
    <>
      <Button
        icon={<MessageOutlined className="text-lg" />}
        shape="circle"
        onClick={() => setOpen(true)}
        className="relative"
      >
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        )}
      </Button>
      <Drawer
        title={<div className="font-bold text-gray-800">Messages</div>}
        placement="right"
        width={400}
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="flex flex-col h-full bg-gray-50">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-full border border-gray-300 focus:border-blue-500 outline-none text-sm bg-white"
            />
          </div>
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No messages</div>
              ) : (
                filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ${chat.unread ? 'bg-blue-50' : ''} cursor-pointer`}
                    onClick={() => {
                      setOpen(false);
                      setChatBoxChat(chat);
                    }}
                  >
                    <Avatar src={chat.avatar} size={40} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{chat.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{chat.time}</span>
                      </div>
                      <div className={`text-sm ${chat.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{chat.lastMessage}</div>
                    </div>
                    {chat.unread && <span className="w-2 h-2 bg-blue-500 rounded-full ml-1" />}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </Drawer>
      {chatBoxPortal}
    </>
  );
};

export default Messenger;
