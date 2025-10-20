import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../types';
import usersData from '../data/users.json';

interface UserContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: number) => void;
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
  const users: User[] = usersData;
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  const switchUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const value: UserContextType = {
    currentUser,
    users,
    switchUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};