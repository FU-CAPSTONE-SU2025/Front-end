import { useMutation } from '@tanstack/react-query';
import { 
  LoginAccount, 
  LoginGoogleAccount, 
  SendEmail, 
  ResetPassword,
} from '../api/Account/AuthAPI';
import { LoginProps, GoogleAccountRequestProps } from '../interfaces/IAccount';
import { useApiErrorHandler } from './useApiErrorHandler';

export const useAuthApi = () => {
  const { handleError } = useApiErrorHandler();

  // Username/password login
  const loginMutation = useMutation<GoogleAccountRequestProps | null, unknown, LoginProps>({
    mutationFn: async (payload: LoginProps) => {
      return await LoginAccount(payload);
    },
    onError: (err) => handleError(err, 'Login failed'),
  });

  // Google OAuth login (expects Google access token)
  const googleLoginMutation = useMutation<GoogleAccountRequestProps | null, unknown, string>({
    mutationFn: async (googleAccessToken: string) => {
      return await LoginGoogleAccount(googleAccessToken);
    },
    onError: (err) => handleError(err, 'Login failed'),
  });

  // Send reset email/code
  const sendResetEmailMutation = useMutation<any | null, unknown, any>({
    mutationFn: async (payload: any) => {
      return await SendEmail(payload);
    },
    onError: (err) => handleError(err, 'Failed to send password reset email'),
  });

  // Reset password
  const resetPasswordMutation = useMutation<any | null, unknown, any>({
    mutationFn: async (payload: any) => {
      return await ResetPassword(payload);
    },
    onError: (err) => handleError(err, 'Failed to reset password'),
  });

  return {
    // Async call helpers (preferred for pages/components)
    login: loginMutation.mutateAsync,
    loginWithGoogle: googleLoginMutation.mutateAsync,
    sendResetEmail: sendResetEmailMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,

    // Expose full mutation objects when callers need loading/error states
    loginMutation,
    googleLoginMutation,
    sendResetEmailMutation,
    resetPasswordMutation,
  };
};


