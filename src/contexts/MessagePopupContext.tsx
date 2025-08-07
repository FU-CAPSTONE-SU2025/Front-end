import React, { createContext, useContext, ReactNode } from 'react';
import { useMessagePopup } from '../hooks/useMessagePopup';

interface MessagePopupContextType {
  showSuccess: (description: string, message?: string) => void;
  showError: (description: string, message?: string) => void;
  showInfo: (description: string, message?: string) => void;
  showWarning: (description: string, message?: string) => void;
  hidePopup: () => void;
}

const MessagePopupContext = createContext<MessagePopupContextType | undefined>(undefined);

export const useMessagePopupContext = () => {
  const context = useContext(MessagePopupContext);
  if (!context) {
    throw new Error('useMessagePopupContext must be used within a MessagePopupProvider');
  }
  return context;
};

interface MessagePopupProviderProps {
  children: ReactNode;
}

export const MessagePopupProvider: React.FC<MessagePopupProviderProps> = ({ children }) => {
  const {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hidePopup
  } = useMessagePopup();

  const contextValue: MessagePopupContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hidePopup
  };

  return (
    <MessagePopupContext.Provider value={contextValue}>
      {children}
    </MessagePopupContext.Provider>
  );
}; 