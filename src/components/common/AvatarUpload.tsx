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

  const getPlaceholderAvatar = () => {
    return `https://ui-avatars.com/api/?name=${userRole}&background=1E40AF&color=ffffff&size=${typeof size === 'number' ? size : 120}`;
  };

  const avatarSize = typeof size === 'number' ? size : 120;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'relative' }}
      >
        {localAvatarUrl ? (
          <OptimizedImage
            src={localAvatarUrl}
            alt={`${userRole} avatar`}
            width={avatarSize}
            height={avatarSize}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'default' : 'pointer',
              overflow: 'hidden',
            }}
            lazy={true}
            priority={true}
          />
        ) : (
          <Avatar
            src={getPlaceholderAvatar()}
            size={size}
            icon={<UserOutlined />}
            style={{
              border: '4px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'default' : 'pointer',
              borderRadius: '50%',
            }}
            onClick={handleEditAvatar}
          />
        )}
        
        {/* Upload Progress Overlay */}
        {isAvatarUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              width: avatarSize,
              height: avatarSize
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
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '50%',
              width: avatarSize,
              height: avatarSize
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
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '-8px',
              width: '32px',
              height: '32px',
              backgroundColor: '#EA580C',
              border: '2px solid white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'background-color 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C2410C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#EA580C';
            }}
            whileHover={{ scale: 1 }}
            whileTap={{ scale: 1 }}
            disabled={isAvatarUploading}
          >
            <EditOutlined style={{ fontSize: 16, color: 'white' }} />
          </motion.button>
        )}
        
        {/* Delete Button */}
        {showDeleteButton && !disabled && localAvatarUrl && (
          <motion.button
            type="button"
            onClick={handleAvatarDelete}
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              width: '32px',
              height: '32px',
              backgroundColor: '#ef4444',
              border: '2px solid white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'background-color 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
            whileHover={{ scale: 1 }}
            whileTap={{ scale: 1 }}
            disabled={isAvatarUploading}
          >
            <DeleteOutlined style={{ fontSize: 12, color: 'white' }} />
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