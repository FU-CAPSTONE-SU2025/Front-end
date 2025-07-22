import React, { useRef, useState, useEffect } from 'react';
import { Avatar, Progress } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useUserProfile from '../../hooks/useUserProfile';

interface AvatarUploadProps {
  userId: number;
  currentAvatarUrl?: string;
  userRole: 'student' | 'staff' | 'manager' | 'advisor' | 'admin';
  size?: number | { [key: string]: number };
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  showDeleteButton?: boolean;
  className?: string;
  disabled?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatarUrl,
  userRole,
  size = 100,
  onAvatarUpdate,
  showDeleteButton = true,
  className = '',
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localAvatarUrl, setLocalAvatarUrl] = useState(currentAvatarUrl);
  
  // Update localAvatarUrl when currentAvatarUrl prop changes
  useEffect(() => {
    setLocalAvatarUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  
  const { handleAvatarUpload, handleAvatarDelete, isAvatarUploading } = useUserProfile({
    userId,
    currentAvatarUrl: localAvatarUrl,
    userRole,
    onAvatarUpdate: (newAvatarUrl) => {
      setLocalAvatarUrl(newAvatarUrl);
      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }
    }
  });

  const handleEditAvatar = () => {
    if (!disabled && !isAvatarUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleAvatarUpload(file);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!disabled && !isAvatarUploading) {
      await handleAvatarDelete();
    }
  };

  const getPlaceholderAvatar = () => {
    return `https://ui-avatars.com/api/?name=${userRole}&background=1E40AF&color=ffffff&size=${typeof size === 'number' ? size : 120}`;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        transition={{ duration: 0.3 }}
        className="relative"
        style={{ padding: '1rem' }}
      >
        <Avatar
          src={localAvatarUrl || getPlaceholderAvatar()}
          size={size}
          icon={<UserOutlined />}
          className={`border-4 border-white/30 shadow-2xl ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
          onClick={handleEditAvatar}
        />
        
        {/* Upload Progress Overlay */}
        {isAvatarUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
          >
            <Progress 
              type="circle" 
              percent={100} 
              size={typeof size === 'number' ? size * 0.4 : 60}
              strokeColor="#10B981"
              format={() => 'Uploading...'}
            />
          </motion.div>
        )}
        
        {/* Loading Overlay */}
        {isAvatarUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full"
          >
            <LoadingOutlined style={{ fontSize: 24, color: '#10B981' }} spin />
          </motion.div>
        )}
        
        {/* Edit Button */}
        {!disabled && (
          <motion.button
            type="button"
            className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white border-2 border-white rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            style={{ zIndex: 2 }}
            onClick={handleEditAvatar}
            disabled={isAvatarUploading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Edit avatar"
          >
            <EditOutlined style={{ fontSize: 14, margin: 0, padding: 0, color: '#fff' }} />
          </motion.button>
        )}
        
        {/* Delete Button */}
        {showDeleteButton && localAvatarUrl && !disabled && (
          <motion.button
            type="button"
            className="absolute bottom-2 left-2 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white border-2 border-white rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
            style={{ zIndex: 2 }}
            onClick={handleDeleteAvatar}
            disabled={isAvatarUploading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Delete avatar"
          >
            <DeleteOutlined style={{ fontSize: 14, margin: 0, padding: 0, color: '#fff' }} />
          </motion.button>
        )}
      </motion.div>
      
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleAvatarChange}
        disabled={isAvatarUploading || disabled}
      />
      
      {/* Upload Status Message */}
      {isAvatarUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow"
        >
          Uploading...
        </motion.div>
      )}
    </div>
  );
};

export default AvatarUpload; 