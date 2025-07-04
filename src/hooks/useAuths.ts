import {create} from 'zustand';
import { AuthState } from '../interfaces/IAuthen';
import { createJSONStorage, persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';
import { Logout } from '../api/Account/AuthAPI';

const ENCRYPTION_KEY = import.meta.env.VITE_THERE_IS_AN_EGG || 'tralala';
// Custom storage with encryption
const encryptedStorage = {
  getItem: (name:string) => {
    const encryptedData = sessionStorage.getItem(name);
    if (!encryptedData) return null;
    try {
      // Decrypt the stored data
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  },
  setItem:  (name: string, value: any) => {
    // Encrypt the data before storing
    const stringifiedData = JSON.stringify(value);
    const encryptedData = CryptoJS.AES.encrypt(stringifiedData, ENCRYPTION_KEY).toString();
    sessionStorage.setItem(name, encryptedData);
  },
  removeItem:  (name: string) => {
    sessionStorage.removeItem(name);
  },
};

// Using Zustand for state management, this is for storing a presisting Login state for role routing
export const useAuths = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userRole: null,
      accessToken: null,
      refreshToken: null,
      setAccessToken: (token: string) => set({ accessToken: token }),
      setRefreshToken: (token: string) => set({ refreshToken: token }),
      login: (roleId:number) => set({ userRole:roleId,isAuthenticated: true }),
      logout: async() => {
      await Logout(); //calling backend to blacklist the current token defore delete it from FE
        set({ 
          isAuthenticated: false, 
          userRole: null,
          accessToken: null,
          refreshToken: null 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => encryptedStorage),
    }
  )
);

  // Utility to access store state outside of React components
export const getAuthState = () => useAuths.getState();
