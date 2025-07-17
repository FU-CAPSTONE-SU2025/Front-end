import { useMutation, useQuery } from '@tanstack/react-query';
import { AccountProps, UpdateAccountProps } from '../interfaces/IAccount';
import { GetCurrentStaffUser, UpdateCurrentStaffUser } from '../api/Account/UserAPI';
import { StaffDataUpdateRequest } from '../interfaces/IStaff';
import { StudentDataUpdateRequest } from '../interfaces/IStudent';


export default function useUserProfile() {
  // Query for fetching current user profile - this will auto-fetch when userId changes
  const getCurrentUserQuery = (userId: number | null) => useQuery<AccountProps | null>({
    queryKey: ['currentUser', userId],
    queryFn: async () => {
      if (!userId || userId === 0) {
        console.log('No valid user ID provided');
        return null;
      }
      console.log('Fetching user profile for ID:', userId);
      const data = await GetCurrentStaffUser(userId);
      console.log('Fetched user data:', data);
      return data;
    },
    enabled: !!userId && userId !== 0, // Only run if we have a valid userId
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });

  // Mutation for updating user profile
  const updateUserMutation = useMutation<AccountProps | true | null, unknown, { userId: number; data: UpdateAccountProps }>({
    mutationFn: async ({ userId, data }) => {
      console.log('Updating user profile:', { userId, data });
      
      // Convert UpdateProfileData to UpdateAccountProps
      const updateData: UpdateAccountProps = {
        username: data.username || '',
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
        avatarUrl: data.avatarUrl || '',
        roleId: 0,
        status: 0,
        staffDataUpdateRequest: {} as StaffDataUpdateRequest, // Empty object for now
        studentDataUpdateRequest: {} as StudentDataUpdateRequest // Empty object for now
      };
      
      const result = await UpdateCurrentStaffUser(userId, updateData);
      console.log('Update result:', result);
      return result;
    },
    onError: (error) => {
      console.error('Failed to update user profile:', error);
    },
    onSuccess: (data) => {
      console.log('Profile updated successfully:', data);
    },
  });

  return {
    // Current user fetching - now returns the query hook function
    getCurrentUserQuery,

    // Profile updating
    updateProfileAsync: updateUserMutation.mutateAsync,
    updatedProfileData: updateUserMutation.data,
    isUpdatingProfile: updateUserMutation.isPending,
    isUpdateSuccess: updateUserMutation.isSuccess,
    updateError: updateUserMutation.error,

    // Reset functions
    resetUpdateProfile: updateUserMutation.reset,
  };
} 