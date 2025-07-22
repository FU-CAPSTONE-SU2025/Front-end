import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { AccountProps, UpdateAccountProps, UpdateAvatarProps } from '../interfaces/IAccount';
import { GetCurrentStaffUser, UpdateCurrentStaffUser, UpdateUserAvatar } from '../api/Account/UserAPI';
import { StaffDataUpdateRequest } from '../interfaces/IStaff';
import { StudentDataUpdateRequest } from '../interfaces/IStudent';
import { uploadAvatar, deleteAvatar, validateImageFile } from '../api/firebaseConfig';


interface UseUserProfileProps {
  userId: number;
  currentAvatarUrl?: string;
  userRole: 'student' | 'staff' | 'manager' | 'advisor' | 'admin';
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export default function useUserProfile(props?: UseUserProfileProps) {
  const queryClient = useQueryClient();
  const { userId, currentAvatarUrl, userRole, onAvatarUpdate } = props || {};

  // Query for fetching current user profile - this will auto-fetch when userId changes
  const getCurrentUserQuery = (userId: number | null) => useQuery<AccountProps | null>({
    queryKey: ['currentUser', userId],
    queryFn: async () => {
      if (!userId || userId === 0) {
        console.log('No valid user ID provided');
        return null;
      }
      const data = await GetCurrentStaffUser(userId);
      //console.log('current user data: ',data)
      return data;
    },
    enabled: !!userId && userId !== 0, // Only run if we have a valid userId
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });

  // Mutation for updating user profile
  const updateUserMutation = useMutation<AccountProps | true | null, unknown, { userId: number; data: UpdateAccountProps }>({
    mutationFn: async ({ userId, data }) => {
      // Convert UpdateProfileData to UpdateAccountProps
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
      console.log('updateData: ',updateData)
      const result = await UpdateCurrentStaffUser(userId, updateData);
      return result;
    },
    onError: (error) => {
      console.error('Failed to update user profile:', error);
    },
    onSuccess: (data) => {
      console.log('Profile updated successfully:', data);
    },
  });

  // Mutation for avatar updates (works for all roles)
  const avatarUpdateMutation = useMutation({
    mutationFn: async ({ userId, avatarData }: { userId: number; avatarData: UpdateAvatarProps }) => {
      const result = await UpdateUserAvatar(userId, avatarData);
      return result;
    },
    onSuccess: (data, variables) => {
      if (data === true || data) {
        message.success('Avatar updated successfully!');
        
        // Invalidate and refetch user data to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['currentUser', variables.userId] });
        queryClient.invalidateQueries({ queryKey: ['activeUsers'] });
        queryClient.invalidateQueries({ queryKey: ['staffList'] });
        queryClient.invalidateQueries({ queryKey: ['studentList'] });
        queryClient.invalidateQueries({ queryKey: ['managerList'] });
        queryClient.invalidateQueries({ queryKey: ['advisorList'] });
      }
    },
    onError: (error) => {
      console.error('Error updating avatar:', error);
      message.error('Failed to update avatar. Please try again.');
    },
  });

  // Avatar upload handler
  const handleAvatarUpload = async (file: File) => {
    if (!userId || !userRole) {
      message.error('User information not available');
      return;
    }

    try {
      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        message.error(validation.error);
        return;
      }

      message.loading('Uploading avatar...', 0);

      // Upload to Firebase Storage with role-based path
      const newAvatarUrl = await uploadAvatar(file, userId, userRole);

      // Use the avatar update API for all roles
      await avatarUpdateMutation.mutateAsync({
        userId,
        avatarData: { url: newAvatarUrl }
      });

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
    // Current user fetching - now returns the query hook function
    getCurrentUserQuery,

    // Profile updating
    updateProfileAsync: updateUserMutation.mutateAsync,
    updatedProfileData: updateUserMutation.data,
    isUpdatingProfile: updateUserMutation.isPending,
    isUpdateSuccess: updateUserMutation.isSuccess,
    updateError: updateUserMutation.error,

    // Avatar operations
    handleAvatarUpload,
    handleAvatarDelete,
    isAvatarUploading: avatarUpdateMutation.isPending,

    // Reset functions
    resetUpdateProfile: updateUserMutation.reset,
  };
} 