import React, { useState, useRef } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Avatar, Button, Modal, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationHub } from '../../hooks/useNotificationHub';
import { NotificationItem } from '../../interfaces/INotification';

function timeAgo(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

interface NotificationProps {
  variant?: 'admin' | 'staff' | 'advisor' | 'student';
}

const Notification: React.FC<NotificationProps> = ({ variant = 'student' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, loading, markAsRead, unreadCount } = useNotificationHub();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [localRead, setLocalRead] = useState<{ [id: number]: boolean }>({});

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

  const badgeCount = unreadCount > 10 ? '10+' : unreadCount;

  const handleNotificationClick = async (n: NotificationItem) => {
    setSelectedNotification(n);
    setLocalRead((prev) => ({ ...prev, [n.id]: true }));
    if (!n.isRead && !localRead[n.id]) {
      try {
        await markAsRead(n.id);
      } catch {}
    }
  };

  const handleModalClose = () => {
    setSelectedNotification(null);
  };

  const handleBellClick = () => {
    setOpen((prev) => !prev);
  };

  // Style variants based on role
  const getUnreadStyle = () => {
    switch (variant) {
      case 'admin':
        return 'bg-purple-50';
      case 'staff':
        return 'bg-green-50';
      case 'advisor':
        return 'bg-blue-50';
      case 'student':
      default:
        return 'bg-orange-50';
    }
  };

  const getUnreadDotColor = () => {
    switch (variant) {
      case 'admin':
        return 'bg-purple-500';
      case 'staff':
        return 'bg-green-500';
      case 'advisor':
        return 'bg-blue-500';
      case 'student':
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Badge count={badgeCount} overflowCount={10} offset={[-2, 2]} size="small" showZero={false}>
        <Button
          icon={<BellOutlined className="text-lg" />}
          shape="circle"
          onClick={handleBellClick}
          className="relative"
        />
      </Badge>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center justify-between">
              <span>Notifications</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <AnimatePresence>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    {loading ? 'Loading notifications...' : 'No notifications'}
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = n.isRead || localRead[n.id];
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ${!isRead ? getUnreadStyle() : ''}`}
                        onClick={() => handleNotificationClick(n)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Avatar src="/img/Logo.svg" size={40} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800">{n.title}</span>
                            <span className="text-xs text-gray-400 ml-2">{timeAgo(n.createdAt)}</span>
                          </div>
                          <div className={`text-sm ${!isRead ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{n.content}</div>
                          {n.link && (
                            <a href={n.link} className="text-xs text-blue-500 underline" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>View details</a>
                          )}
                        </div>
                        {!isRead && <span className={`w-2 h-2 ${getUnreadDotColor()} rounded-full mt-2 ml-1`} />}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        open={!!selectedNotification}
        onCancel={handleModalClose}
        footer={null}
        title={selectedNotification?.title || 'Notification Detail'}
      >
        {selectedNotification && (
          <div>
            <div className="mb-2 text-gray-500 text-xs">{timeAgo(selectedNotification.createdAt)}</div>
            <div className="mb-4 text-base text-gray-800">{selectedNotification.content}</div>
            {selectedNotification.link && (
              <a href={selectedNotification.link} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">View details</a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notification; 