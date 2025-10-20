import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userLogin: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedLogin = localStorage.getItem('currentUserLogin');
    if (storedLogin) {
      fetchUserData(storedLogin).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (userLogin: string) => {
    try {
      // First try to get user from our database by login
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const user = usersData.data?.find((u: any) => u.login === userLogin);
        if (user) {
          setCurrentUser(user);
          return;
        }
      }

      // If user not found locally, try to sync from 42 API
      const syncResponse = await fetch(`/api/sync/user/${userLogin}/complete`, {
        method: 'POST',
      });
      
      if (!syncResponse.ok) {
        if (syncResponse.status === 404) {
          throw new Error('User not found in 42 intranet');
        } else if (syncResponse.status === 503) {
          throw new Error('42 API service unavailable');
        }
        throw new Error('Failed to sync user data');
      }
      
      const syncData = await syncResponse.json();
      setCurrentUser(syncData.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const login = async (userLogin: string) => {
    setIsLoading(true);
    try {
      await fetchUserData(userLogin);
      localStorage.setItem('currentUserLogin', userLogin);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserLogin');
  };

  const refreshUserData = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/sync/user/${currentUser.login}/complete`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value: UserContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    logout,
    refreshUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
