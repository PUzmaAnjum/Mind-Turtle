import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, pass: string, role: UserRole) => Promise<User | null>;
}

// FIX: Export AuthContext to fix import errors in hooks/useAuth.ts and resolve cascading type errors.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in localStorage to persist session
    const storedUser = localStorage.getItem('mindturtle-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const loggedInUser = await api.login(email, pass);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('mindturtle-user', JSON.stringify(loggedInUser));
    }
    setLoading(false);
    return loggedInUser;
  };

  const register = async (name: string, email: string, pass: string, role: UserRole) => {
    setLoading(true);
    const newUser = await api.register(name, email, pass, role);
    if(newUser) {
        setUser(newUser);
        localStorage.setItem('mindturtle-user', JSON.stringify(newUser));
    }
    setLoading(false);
    return newUser;
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindturtle-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
