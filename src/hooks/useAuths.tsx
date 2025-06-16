import {create} from 'zustand';
import { AuthState, TokenState } from '../interfaces/IAuthen';

// Using Zustand for state management, this is for storing a presisting Login state for role routing
export const useAuths = create<AuthState>((set) => ({
    isAuthenticated: false,
    userRole: null,
    login: () => set({ isAuthenticated: true }),
    logout: () => set({ isAuthenticated: false, userRole: null }),
    setUserRole: (role) => set({ userRole: role }),
  }));
 export const useToken = create<TokenState>((set) => ({
    accessToken: null,
    refreshToken: null,
    setAccessToken: (token:string) => set({accessToken : token}),
    removeAccessToken: () => set({accessToken: null}),
    setRefreshToken: (token:string) => set({refreshToken : token}),
    removeRefreshToken: () => set({refreshToken: null}),
 }))

  // Utility to access store state outside of React components
export const getAuthState = () => useAuths.getState();
export const getTokenState = ()=> useToken.getState();