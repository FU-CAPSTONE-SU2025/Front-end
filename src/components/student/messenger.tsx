import React, { useState } from 'react';
import { Avatar, Button, Drawer, Input } from 'antd';
import { MessageCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const filteredChats = mockChats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <Button icon={<MessageCircle />} shape="circle"  onClick={showDrawer}/>
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <Search className="w-5 h-5 text-gray-500" />
          </div>
        }
        placement="right"
        width={400}
        onClose={onClose}
        open={open}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="flex flex-col h-full bg-gray-50">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="Search messages..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full bg-white border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center p-4 border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                    chat.unread ? 'bg-blue-50' : ''
                  }`}
                >
                  <Avatar src={chat.avatar} size={48} className="mr-4" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">{chat.name}</h3>
                      <span className="text-xs text-gray-500">{chat.time}</span>
                    </div>
                    <p
                      className={`text-sm ${
                        chat.unread ? 'text-gray-800 font-medium' : 'text-gray-600'
                      } truncate`}
                    >
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-2" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Messenger;