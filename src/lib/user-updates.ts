// User updates event system
interface UserUpdateData {
  name?: string;
  isActive?: boolean;
  role?: string;
  email?: string;
  bio?: string;
  image?: string;
  linkedinUrl?: string;
  personalEmail?: string;
}

class UserUpdateEvents {
  private listeners: { [key: string]: Array<(userId: string, userData: UserUpdateData) => void> } = {};

  // Subscribe to user updates
  subscribe(event: 'userUpdated', callback: (userId: string, userData: UserUpdateData) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  // Emit user update event
  emit(event: 'userUpdated', userId: string, userData: UserUpdateData) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(userId, userData));
    }
  }
}

export const userUpdateEvents = new UserUpdateEvents();

// React hook for listening to user updates
import { useEffect } from 'react';

export function useUserUpdates(callback: (userId: string, userData: UserUpdateData) => void) {
  useEffect(() => {
    const unsubscribe = userUpdateEvents.subscribe('userUpdated', callback);
    return unsubscribe;
  }, [callback]);
}
