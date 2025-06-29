import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  location?: string;
  dietType: 'vegetarian' | 'non-vegetarian' | 'vegan';
  allergies: string[];
  healthConditions: string[];
  prakriti?: string;
  currentDosha?: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  assessmentCompleted: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (userData: { name: string; email: string; password: string }) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await apiClient.getCurrentUser();
        if (response.data) {
          setUser(response.data.user);
        } else {
          // Token is invalid, clear it
          apiClient.logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      apiClient.logout();
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await apiClient.register(userData);
      
      if (response.error) {
        return { error: response.error };
      }

      if (response.data) {
        const { user: newUser, tokens } = response.data;
        apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Registration failed. Please try again.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.error) {
        return { error: response.error };
      }

      if (response.data) {
        const { user: loggedInUser, tokens } = response.data;
        apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await apiClient.logoutUser(refreshToken || undefined);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      apiClient.logout();
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };