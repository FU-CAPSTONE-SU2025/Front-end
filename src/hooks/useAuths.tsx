import {create} from 'zustand';
import { AuthState } from '../interface/IAuthen';

// Using Zustand for state management, this is for storing a presisting Login state for role routing
export const useAuths = create<AuthState>((set) => ({
    isAuthenticated: false,
    userRole: null,
    login: () => set({ isAuthenticated: true }),
    logout: () => set({ isAuthenticated: false, userRole: null }),
    setUserRole: (role) => set({ userRole: role }),
  }));