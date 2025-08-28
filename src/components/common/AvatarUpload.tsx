import React, { useRef, useState, useEffect } from 'react';
import { Avatar, Progress } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useUserProfile from '../../hooks/useUserProfile';
import OptimizedImage from './OptimizedImage';

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

  const avatarSize = typeof size === 'number' ? size : 120;

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        transition={{ duration: 0.3 }}
        className="relative"
        style={{ padding: '1rem' }}
      >
        {localAvatarUrl ? (
          <OptimizedImage
            src={localAvatarUrl}
            alt={`${userRole} avatar`}
            width={avatarSize}
            height={avatarSize}
            className={`border-4 border-white/30 shadow-2xl rounded-full ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
            }}
            lazy={false}
            priority={true}
            onClick={handleEditAvatar}
          />
        ) : (
          <Avatar
            src={getPlaceholderAvatar()}
            size={size}
            icon={<UserOutlined />}
            className={`border-4 border-white/30 shadow-2xl ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
            onClick={handleEditAvatar}
          />
        )}
        
        {/* Upload Progress Overlay */}
        {isAvatarUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
            }}
          >
            <Progress 
              type="circle" 
              percent={100} 
              size={avatarSize * 0.4}
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
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
            }}
          >
            <LoadingOutlined style={{ fontSize: 24, color: '#10B981' }} spin />
          </motion.div>
        )}
        
        {/* Edit Button */}
        {!disabled && (
          <motion.button
            type="button"
            onClick={handleEditAvatar}
            className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isAvatarUploading}
          >
            <EditOutlined style={{ fontSize: 16 }} />
          </motion.button>
        )}
        
        {/* Delete Button */}
        {showDeleteButton && !disabled && localAvatarUrl && (
          <motion.button
            type="button"
            onClick={handleDeleteAvatar}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isAvatarUploading}
          >
            <DeleteOutlined style={{ fontSize: 12 }} />
          </motion.button>
        )}
      </motion.div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: 'none' }}
        disabled={disabled || isAvatarUploading}
      />
    </div>
  );
};

export default AvatarUpload; 