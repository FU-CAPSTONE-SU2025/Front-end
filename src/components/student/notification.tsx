import React, { useState, useRef } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const mockNotifications = [
  {
    id: 1,
    avatar: 'https://i.pravatar.cc/40?img=4',
    title: 'New Message',
    description: 'You have a new message from John.',
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    avatar: 'https://i.pravatar.cc/40?img=5',
    title: 'Assignment Due',
    description: 'Your assignment is due tomorrow.',
    time: '1h ago',
    unread: false,
  },
  {
    id: 3,
    avatar: 'https://i.pravatar.cc/40?img=6',
    title: 'System Update',
    description: 'System will be updated at 10PM.',
    time: '3h ago',
    unread: true,
  },
];

const Notification: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        icon={<BellOutlined className="text-lg" />}
        shape="circle"
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        {mockNotifications.some((n) => n.unread) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        )}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Notifications</div>
            <div className="max-h-80 overflow-y-auto">
              <AnimatePresence>
                {mockNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">No notifications</div>
                ) : (
                  mockNotifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ${n.unread ? 'bg-orange-50' : ''}`}
                    >
                      <Avatar src={n.avatar} size={40} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">{n.title}</span>
                          <span className="text-xs text-gray-400 ml-2">{n.time}</span>
                        </div>
                        <div className={`text-sm ${n.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{n.description}</div>
                      </div>
                      {n.unread && <span className="w-2 h-2 bg-red-500 rounded-full mt-2 ml-1" />}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
