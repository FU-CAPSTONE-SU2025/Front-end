import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { AccountProps, UpdateAccountProps, UpdateAvatarProps } from '../interfaces/IAccount';
import { GetCurrentStaffUser, UpdateCurrentStaffUser, UpdateUserAvatar } from '../api/Account/UserAPI';
import { StaffDataUpdateRequest } from '../interfaces/IStaff';
import { StudentDataUpdateRequest } from '../interfaces/IStudent';
import { uploadAvatar, deleteAvatar, validateImageFile } from '../api/firebaseConfig';
import { debugLog } from '../utils/performanceOptimization';


interface UseUserProfileProps {
  userId: number;
  currentAvatarUrl?: string;
  userRole: 'student' | 'staff' | 'manager' | 'advisor' | 'admin';
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export default function useUserProfile(props?: UseUserProfileProps) {
  const queryClient = useQueryClient();
  const { userId, currentAvatarUrl, userRole, onAvatarUpdate } = props || {};
  const getCurrentUserQuery = (userId: number | null) => useQuery<AccountProps | null>({
    queryKey: ['currentUser', userId],
    queryFn: async () => {
      if (!userId || userId === 0) {
        debugLog('No valid user ID provided');
        return null;
      }
      const data = await GetCurrentStaffUser(userId);
      return data;
    },
    enabled: !!userId && userId !== 0, 
    staleTime: 5 * 60 * 1000, 
    retry: 2,
  });


  const updateUserMutation = useMutation<AccountProps | true | null, unknown, { userId: number; data: UpdateAccountProps }>({
    mutationFn: async ({ userId, data }) => {
      const updateData: UpdateAccountProps = {
        username: data.username || '',
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth || new Date().toISOString().split('T')[0],
        avatarUrl: data.avatarUrl || '',
        roleId: data.roleId,
        status: data.status,
        staffDataUpdateRequest: data.staffDataUpdateRequest as StaffDataUpdateRequest, 
        studentDataUpdateRequest: data.studentDataUpdateRequest as StudentDataUpdateRequest,
      };
      debugLog('updateData: ',updateData)
      const result = await UpdateCurrentStaffUser(userId, updateData);
      return result;
    },
    onError: (error) => {
      debugLog('Failed to update user profile:', error);
    },
    onSuccess: (data) => {
      debugLog('Profile updated successfully:', data);
    },
  });

  const avatarUpdateMutation = useMutation({
    mutationFn: async ({ userId, avatarData }: { userId: number; avatarData: UpdateAvatarProps }) => {
      const result = await UpdateUserAvatar(userId, avatarData);
      return result;
    },
    onSuccess: (data, variables) => {
      if (data === true || data) {
        message.success('Avatar updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['currentUser', variables.userId] });
        queryClient.invalidateQueries({ queryKey: ['activeUsers'] });
        queryClient.invalidateQueries({ queryKey: ['staffList'] });
        queryClient.invalidateQueries({ queryKey: ['studentList'] });
        queryClient.invalidateQueries({ queryKey: ['managerList'] });
        queryClient.invalidateQueries({ queryKey: ['advisorList'] });
      }
    },
    onError: (error) => {
      debugLog('Error updating avatar:', error);
      message.error('Failed to update avatar. Please try again.');
    },
  });
  const handleAvatarUpload = async (file: File) => {
    if (!userId || !userRole) {
      message.error('User information not available');
      return;
    }

    try {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        message.error(validation.error);
        return;
      }

      message.loading('Uploading avatar...', 0);
      const newAvatarUrl = await uploadAvatar(file, userId, userRole);
      await avatarUpdateMutation.mutateAsync({
        userId,
        avatarData: { url: newAvatarUrl }
      });
      if (currentAvatarUrl && currentAvatarUrl.includes('firebase')) {
        try {
          await deleteAvatar(currentAvatarUrl, userRole);
        } catch (error) {
          console.warn('Failed to delete old avatar:', error);
        }
      }

      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }

      message.destroy();
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.destroy();
      message.error('Failed to upload avatar. Please try again.');
    }
  };

  // Avatar delete handler
  const handleAvatarDelete = async () => {
    if (!userId || !userRole) {
      message.error('User information not available');
      return;
    }

    if (!currentAvatarUrl || !currentAvatarUrl.includes('firebase')) {
      message.warning('No avatar to delete');
      return;
    }

    try {
      message.loading('Deleting avatar...', 0);

      // Delete from Firebase Storage with role-based path
      await deleteAvatar(currentAvatarUrl, userRole);

      // Use the avatar update API for all roles to remove avatar
      await avatarUpdateMutation.mutateAsync({
        userId,
        avatarData: { url: '' }
      });

      // Call the callback function
      if (onAvatarUpdate) {
        onAvatarUpdate('');
      }

      message.destroy();
      
    } catch (error) {
      console.error('Error deleting avatar:', error);
      message.destroy();
      message.error('Failed to delete avatar. Please try again.');
    }
  };

  return {
    getCurrentUserQuery,
    updateProfileAsync: updateUserMutation.mutateAsync,
    updatedProfileData: updateUserMutation.data,
    isUpdatingProfile: updateUserMutation.isPending,
    isUpdateSuccess: updateUserMutation.isSuccess,
    updateError: updateUserMutation.error,
    handleAvatarUpload,
    handleAvatarDelete,
    isAvatarUploading: avatarUpdateMutation.isPending,
    resetUpdateProfile: updateUserMutation.reset,
  };
} 