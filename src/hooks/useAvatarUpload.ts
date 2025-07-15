import { useState } from 'react';
import { message } from 'antd';
import { uploadAvatar, deleteAvatar, validateImageFile } from '../api/firebaseConfig';
import { UpdateCurrentStaffUser, UpdateCurrentStudentUser } from '../api/Account/UserAPI';
import { UpdateAccountProps } from '../interfaces/IAccount';

interface UseAvatarUploadProps {
  userId: number;
  currentAvatarUrl?: string;
  userRole: 'student' | 'staff' | 'manager' | 'advisor' | 'admin';
  currentUserData?: any; // Current user data to preserve during updates
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export const useAvatarUpload = ({ 
  userId, 
  currentAvatarUrl, 
  userRole, 
  currentUserData,
  onAvatarUpdate 
}: UseAvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        message.error(validation.error);
        return;
      }

      // Show upload progress
      setUploadProgress(25);
      message.loading('Uploading avatar...', 0);

      // Upload to Firebase Storage with role-based path
      const newAvatarUrl = await uploadAvatar(file, userId, userRole);
      setUploadProgress(75);

      // Create update data preserving all existing user data
      const updateData: UpdateAccountProps = {
        username: currentUserData?.username || '',
        email: currentUserData?.email || '',
        firstName: currentUserData?.firstName || '',
        lastName: currentUserData?.lastName || '',
        dateOfBirth: currentUserData?.dateOfBirth ? new Date(currentUserData.dateOfBirth) : new Date(),
        avatarUrl: newAvatarUrl, // Only change the avatar URL
        roleId: currentUserData?.roleId || 0,
        status: currentUserData?.status || 1,
        staffDataUpdateRequest: currentUserData?.staffDataUpdateRequest || null,
        studentDataUpdateRequest: currentUserData?.studentDataUpdateRequest || null,
      };

      // Call appropriate update API based on user role
      if (userRole === 'student') {
        await UpdateCurrentStudentUser(userId, updateData as any);
      } else {
        await UpdateCurrentStaffUser(userId, updateData);
      }

      setUploadProgress(100);

      // Delete old avatar if it exists and is from Firebase
      if (currentAvatarUrl && currentAvatarUrl.includes('firebase')) {
        try {
          await deleteAvatar(currentAvatarUrl, userRole);
        } catch (error) {
          console.warn('Failed to delete old avatar:', error);
        }
      }

      // Call the callback function
      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }

      message.destroy();
      message.success('Avatar updated successfully!');
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.destroy();
      message.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      if (!currentAvatarUrl || !currentAvatarUrl.includes('firebase')) {
        message.warning('No avatar to delete');
        return;
      }

      message.loading('Deleting avatar...', 0);

      // Delete from Firebase Storage with role-based path
      await deleteAvatar(currentAvatarUrl, userRole);

      // Create update data preserving all existing user data
      const updateData: UpdateAccountProps = {
        username: currentUserData?.username || '',
        email: currentUserData?.email || '',
        firstName: currentUserData?.firstName || '',
        lastName: currentUserData?.lastName || '',
        dateOfBirth: currentUserData?.dateOfBirth ? new Date(currentUserData.dateOfBirth) : new Date(),
        avatarUrl: '', // Remove avatar URL
        roleId: currentUserData?.roleId || 0,
        status: currentUserData?.status || 1,
        staffDataUpdateRequest: currentUserData?.staffDataUpdateRequest || null,
        studentDataUpdateRequest: currentUserData?.studentDataUpdateRequest || null,
      };

      // Call appropriate update API based on user role
      if (userRole === 'student') {
        await UpdateCurrentStudentUser(userId, updateData as any);
      } else {
        await UpdateCurrentStaffUser(userId, updateData);
      }

      // Call the callback function
      if (onAvatarUpdate) {
        onAvatarUpdate('');
      }

      message.destroy();
      message.success('Avatar deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting avatar:', error);
      message.destroy();
      message.error('Failed to delete avatar. Please try again.');
    }
  };

  return {
    handleAvatarUpload,
    handleAvatarDelete,
    isUploading,
    uploadProgress,
  };
}; 