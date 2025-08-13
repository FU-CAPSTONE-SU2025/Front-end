import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { Avatar, Button, Modal, Badge, Tooltip } from 'antd';
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
  const { notifications, loading, markAllAsRead, unreadCount, refreshNotifications } = useNotificationHub();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [localRead, setLocalRead] = useState<{ [id: number]: boolean }>({});
  const [markingAll, setMarkingAll] = useState(false);

  // Calculate actual unread count considering localRead state
  const actualUnreadCount = notifications.filter(n => !n.isRead && !localRead[n.id]).length;
  const badgeCount = actualUnreadCount > 10 ? '10+' : actualUnreadCount;

  // ALL FUNCTIONS DEFINED WITH useCallback TO AVOID HOISTING ISSUES
  const handleNotificationClick = useCallback((n: NotificationItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setSelectedNotification(n);
  }, []);

  const handleMarkAllAsRead = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (actualUnreadCount === 0) return;
    
    setMarkingAll(true);
    
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead && !localRead[n.id]);
      
      console.log(`🔄 Marking ${unreadNotifications.length} notifications as read...`);
      
      await markAllAsRead();
      
      // Clear localRead state after successful mark all as read
      setLocalRead({});
      
      console.log(`✅ Successfully marked all ${unreadNotifications.length} notifications as read`);
      
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAll(false);
    }
  }, [actualUnreadCount, localRead, notifications, markAllAsRead]);

  const handleModalClose = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  const handleBellClick = useCallback(async () => {
    const newOpen = !open;
    setOpen(newOpen);
    
    if (newOpen) {
      try {
        await refreshNotifications();
        console.log('🔄 Refreshed notifications on dropdown open');
      } catch (error) {
        console.error('❌ Failed to refresh notifications:', error);
      }
    }
  }, [open, refreshNotifications]);

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
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleMarkAllAsRead();
      }
    }
  }, [open, handleMarkAllAsRead]);

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
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {actualUnreadCount > 0 && (
                  <Tooltip title={`Mark all ${actualUnreadCount} notifications as read`}>
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={handleMarkAllAsRead}
                      loading={markingAll}
                      className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      disabled={markingAll}
                    >
                      {markingAll ? 'Marking...' : 'Mark all'}
                    </Button>
                  </Tooltip>
                )}
                {actualUnreadCount === 0 && (
                  <span className="text-xs text-gray-400">All caught up! 🎉</span>
                )}
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
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-200 group ${!isRead ? getUnreadStyle() : 'border-l-4 border-transparent'}`}
                      >
                        <Avatar src="/img/Logo.svg" size={40} className="mt-1" />
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleNotificationClick(n)}
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
                          {isRead && (
                            <Tooltip title="Read">
                              <CheckOutlined className="text-green-500 text-sm" />
                            </Tooltip>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>💡 Press Esc to close</span>
                  {actualUnreadCount > 0 && (
                    <span>Ctrl+Enter to mark all read</span>
                  )}
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