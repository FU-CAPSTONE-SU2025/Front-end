import { useMutation } from '@tanstack/react-query';
import {
  BulkRegisterStudent,
  BulkRegisterStaff,
  BulkRegisterAdvisor,
  BulkRegisterManager,
  BulkRegisterAdmin,
  DisableUser,
  ResetBanNumberForStudent,
  RegisterUser,
  GetCurrentStaffUser,
  GetCurrentStudentUser,
  UpdateCurrentStaffUser,
  UpdateCurrentStudentUser,
} from '../api/Account/UserAPI';
import { BulkAccountPropsCreate, AccountPropsCreate, UpdateAccountProps } from '../interfaces/IAccount';
import { useApiErrorHandler } from './useApiErrorHandler';

export const useAdminUsers = () => {
  const { handleError } = useApiErrorHandler();

  const bulkRegisterStudentMutation = useMutation<any | null, unknown, BulkAccountPropsCreate[]>({
    mutationFn: (payload) => BulkRegisterStudent(payload),
    onError: (e) => handleError(e, 'Failed to import students'),
  });

  const bulkRegisterStaffMutation = useMutation<any | null, unknown, BulkAccountPropsCreate[]>({
    mutationFn: (payload) => BulkRegisterStaff(payload),
    onError: (e) => handleError(e, 'Failed to import staff'),
  });

  const bulkRegisterAdvisorMutation = useMutation<any | null, unknown, BulkAccountPropsCreate[]>({
    mutationFn: (payload) => BulkRegisterAdvisor(payload),
    onError: (e) => handleError(e, 'Failed to import advisors'),
  });

  const bulkRegisterManagerMutation = useMutation<any | null, unknown, BulkAccountPropsCreate[]>({
    mutationFn: (payload) => BulkRegisterManager(payload),
    onError: (e) => handleError(e, 'Failed to import managers'),
  });

  const bulkRegisterAdminMutation = useMutation<any | null, unknown, BulkAccountPropsCreate[]>({
    mutationFn: (payload) => BulkRegisterAdmin(payload),
    onError: (e) => handleError(e, 'Failed to import admins'),
  });

  const disableUserMutation = useMutation<any | null, unknown, number>({
    mutationFn: (userId) => DisableUser(userId),
    onError: (e) => handleError(e, 'Failed to delete user'),
  });

  const resetBanMutation = useMutation<any | null, unknown, number>({
    mutationFn: (studentProfileId) => ResetBanNumberForStudent(studentProfileId),
    onError: (e) => handleError(e, 'Failed to reset ban number'),
  });

  const registerUserMutation = useMutation<any | null, unknown, AccountPropsCreate>({
    mutationFn: (payload) => RegisterUser(payload),
    onError: (e) => handleError(e, 'Failed to create user'),
  });

  const getCurrentStaffMutation = useMutation({
    mutationFn: (userId: number) => GetCurrentStaffUser(userId),
    onError: (e) => handleError(e, 'Failed to get staff'),
  });

  const getCurrentStudentMutation = useMutation({
    mutationFn: (userId: number) => GetCurrentStudentUser(userId),
    onError: (e) => handleError(e, 'Failed to get student'),
  });

  const updateCurrentStaffMutation = useMutation<any | null, unknown, { userId: number; data: UpdateAccountProps }>({
    mutationFn: ({ userId, data }) => UpdateCurrentStaffUser(userId, data),
    onError: (e) => handleError(e, 'Failed to update staff'),
  });

  const updateCurrentStudentMutation = useMutation<any | null, unknown, { userId: number; data: AccountPropsCreate }>({
    mutationFn: ({ userId, data }) => UpdateCurrentStudentUser(userId, data),
    onError: (e) => handleError(e, 'Failed to update student'),
  });

  return {
    // Async helpers
    bulkRegisterStudents: bulkRegisterStudentMutation.mutateAsync,
    bulkRegisterStaff: bulkRegisterStaffMutation.mutateAsync,
    bulkRegisterAdvisors: bulkRegisterAdvisorMutation.mutateAsync,
    bulkRegisterManagers: bulkRegisterManagerMutation.mutateAsync,
    bulkRegisterAdmins: bulkRegisterAdminMutation.mutateAsync,
    disableUser: disableUserMutation.mutateAsync,
    resetBanNumber: resetBanMutation.mutateAsync,
    registerUser: registerUserMutation.mutateAsync,
    getCurrentStaff: getCurrentStaffMutation.mutateAsync,
    getCurrentStudent: getCurrentStudentMutation.mutateAsync,
    updateCurrentStaff: updateCurrentStaffMutation.mutateAsync,
    updateCurrentStudent: updateCurrentStudentMutation.mutateAsync,

    // Expose mutations if caller needs loading/error state
    bulkRegisterStudentMutation,
    bulkRegisterStaffMutation,
    bulkRegisterAdvisorMutation,
    bulkRegisterManagerMutation,
    bulkRegisterAdminMutation,
    disableUserMutation,
    resetBanMutation,
    registerUserMutation,
    getCurrentStaffMutation,
    getCurrentStudentMutation,
    updateCurrentStaffMutation,
    updateCurrentStudentMutation,
  };
};


