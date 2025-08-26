import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Avatar, Button, Modal, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationHub } from '../../hooks/useNotificationHub';
import { NotificationItem } from '../../interfaces/INotification';

function timeAgo(dateString?: string) {
  if (!dateString) return '';

  // Normalize: if no timezone info, assume UTC
  const hasZone = /[zZ]|[+-]\d{2}:\d{2}$/.test(dateString);
  const normalized = hasZone ? dateString : (dateString.replace(' ', 'T') + 'Z');

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 5) return 'just now';
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
  const { notifications, loading, markAsRead, refreshNotifications } = useNotificationHub();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [localRead, setLocalRead] = useState<{ [id: number]: boolean }>({});

  // Calculate actual unread count considering localRead state
  const actualUnreadCount = notifications.filter(n => !n.isRead && !localRead[n.id]).length;
  const badgeCount = actualUnreadCount > 10 ? '10+' : actualUnreadCount;

  // Helper to optimistically mark all as read locally
  const optimisticallyMarkAllLocal = useCallback(() => {
    const mapping: { [id: number]: boolean } = {};
    for (const n of notifications) {
      if (!n.isRead) mapping[n.id] = true;
    }
    setLocalRead(mapping);
  }, [notifications]);

  // Helper to mark all unread on server using per-item MarkAsRead in small batches
  const backgroundMarkAllPerItem = useCallback(async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    const batchSize = 5;
    for (let i = 0; i < unread.length; i += batchSize) {
      const batch = unread.slice(i, i + batchSize);
      await Promise.all(batch.map(n => markAsRead(n.id).catch(() => {})));
      if (i + batchSize < unread.length) {
        await new Promise(res => setTimeout(res, 100));
      }
    }
  }, [notifications, markAsRead]);

  // ALL FUNCTIONS DEFINED WITH useCallback TO AVOID HOISTING ISSUES
  const handleNotificationClick = useCallback(async (n: NotificationItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    // Optimistically mark all as read locally for immediate UI change
    optimisticallyMarkAllLocal();
    // Background per-item mark-as-read calls then refresh from server
    void (async () => {
      await backgroundMarkAllPerItem();
      await refreshNotifications();
    })();
    setSelectedNotification(n);
  }, [optimisticallyMarkAllLocal, backgroundMarkAllPerItem, refreshNotifications]);

  const handleModalClose = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  const handleBellClick = useCallback(async () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen) {
      try {
        await refreshNotifications();
        // Optimistically mark UI as read immediately
        optimisticallyMarkAllLocal();
        // Background mark-as-read per item after ensuring latest list, then refresh again
        void (async () => {
          await backgroundMarkAllPerItem();
          await refreshNotifications();
        })();
      } catch {
        // silent
      }
    }
  }, [open, refreshNotifications, optimisticallyMarkAllLocal, backgroundMarkAllPerItem]);

  const getUnreadStyle = useCallback(() => {
    switch (variant) {
      case 'admin':
        return 'bg-purple-50 border-l-4 border-purple-500';
      case 'staff':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'advisor':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'student':
      default:
        return 'bg-orange-50 border-l-4 border-orange-500';
    }
  }, [variant]);

  const getUnreadDotColor = useCallback(() => {
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
  }, [variant]);

  // KEYBOARD SHORTCUTS HANDLER
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (open) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
  }, [open]);

  // CLICK OUTSIDE HANDLER  
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }, []);

  // EFFECT FOR EVENT LISTENERS - PLACED AFTER ALL FUNCTION DEFINITIONS
  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleClickOutside, handleKeyDown]);

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
            className="absolute right-0 mt-2 w-96 rounded-xl shadow-xl border z-50 overflow-hidden bg-white/90 border-white backdrop-blur-md"
            style={{ WebkitBackdropFilter: 'blur(12px) saturate(180%)', backdropFilter: 'blur(12px) saturate(180%)' }}
          >
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                
              </div>
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
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-white/90 transition-all duration-200 group ${!isRead ? getUnreadStyle() : 'border-l-4 border-transparent'}`}
                      >
                        <Avatar  src="/Logo.svg" size={40} className="mt-1" />
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={(e) => handleNotificationClick(n, e)}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`font-semibold ${!isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                              {n.title}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">{timeAgo(n.createdAt)}</span>
                          </div>
                          <div className={`text-sm ${!isRead ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                            {n.content}
                          </div>
                          {n.link && (
                            <a 
                              href={n.link} 
                              className="text-xs text-blue-500 underline hover:text-blue-700" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                            >
                              View details
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-2 mt-1">
                          {!isRead && (
                            <span className={`w-3 h-3 ${getUnreadDotColor()} rounded-full animate-pulse`} />
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/70">
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>💡 Press Esc to close</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        open={!!selectedNotification}
        onCancel={handleModalClose}
        footer={null}
        title={selectedNotification?.title || 'Notification Detail'}
        width={500}
      >
        {selectedNotification && (
          <div>
            <div className="mb-2 text-gray-500 text-xs">{timeAgo(selectedNotification.createdAt)}</div>
            <div className="mb-4 text-base text-gray-800 leading-relaxed">{selectedNotification.content}</div>
            {selectedNotification.link && (
              <a 
                href={selectedNotification.link} 
                className="text-blue-500 underline hover:text-blue-700" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View details
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notification; 