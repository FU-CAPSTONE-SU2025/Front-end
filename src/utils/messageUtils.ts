import { ChatMessage } from '../interfaces/IChat';

/**
 * Enhanced message deduplication utility
 * Checks for duplicates based on multiple criteria to prevent UI duplicates
 */
export const isDuplicateMessage = (
  newMessage: ChatMessage, 
  existingMessages: ChatMessage[]
): boolean => {
  return existingMessages.some(existing => {
    // Check by message ID first (most reliable)
    if (existing.id === newMessage.id) {
      return true;
    }
    
    // Check by content, sender, and timestamp (fallback)
    if (existing.content === newMessage.content && 
        existing.senderId === newMessage.senderId) {
      
      const existingTime = new Date(existing.createdAt).getTime();
      const newTime = new Date(newMessage.createdAt).getTime();
      const timeDiff = Math.abs(existingTime - newTime);
      
      // If messages are within 5 seconds of each other, consider them duplicates
      if (timeDiff < 5000) {
        return true;
      }
    }
    
    return false;
  });
};

/**
 * Add message to array with deduplication
 */
export const addMessageWithDeduplication = (
  newMessage: ChatMessage,
  existingMessages: ChatMessage[]
): ChatMessage[] => {
  if (isDuplicateMessage(newMessage, existingMessages)) {
    console.log('🔄 Duplicate message detected, skipping:', newMessage.content);
    return existingMessages;
  }
  
  console.log('✅ New message added:', newMessage.content);
  return [...existingMessages, newMessage];
};

/**
 * Map backend message to ChatMessage interface
 */
export const mapBackendMessage = (message: any): ChatMessage => {
  return {
    id: message.messageId || message.id || Date.now(),
    content: message.content,
    senderId: message.senderId,
    advisorySession1to1Id: message.advisorySession1to1Id,
    createdAt: message.createdAt || new Date().toISOString(),
    senderName: message.senderName || 'Unknown'
  };
};
