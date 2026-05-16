import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../apiCall/api';
import { signOut } from "firebase/auth";
import { auth } from "../components/Auth/firebaseConfig";
import { markUserAsNew } from '../hooks/useOnboarding';
import { getCurrentSeason } from '../utils/ayurvedic-logic';


interface User {
  userId: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  location?: string;
  region?: string;
  preference?: string;
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
  onboardingCompleted?: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  season?: string;
  seasonLastUpdated?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (userData: any) => Promise<{ error?: string }>;
  signIn:  (userData: any, token: string) => Promise<{ error?: string }>;
  sendSMS: (phone: string) => Promise<{ error?: string }>;
  signOutFirebase: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated?: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      // Nothing stored → user is logged out
      if (!token || !storedUser) {
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Rehydrate user from localStorage so refresh doesn't log them out
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse stored user, logging out.', e);
        apiClient.logout();
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      apiClient.logout();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    try {
      const response = await apiClient.register(userData);
      if (userData.emailVerified) {
        const user = response;
        apiClient.setTokens(localStorage.getItem('accessToken') || '');
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
      }
      if (response.error) {
        return { error: response.error };
      }

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Registration failed. Please try again.' };
    }
  };

  const sendSMS = async ( phone: string ) => {
    try {
      const response = await apiClient.sendSMS(phone);

      if (response.error) {
        return { error: response.error };
      }

      return response;
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Registration failed. Please try again.' };
    }
  };

  const signIn = async (userData: any, token: string) => {
    try {
      console.log('Sign in response:', userData);
      let loginData = {
        uId: userData.uid,
        season: getCurrentSeason(),
      }
      const response = await apiClient.login(loginData);
      if (response.error) {
        return { error: response.error };
      }

      if (response) {
        console.log(response.data)
        const user = response.data.user;
        apiClient.setTokens(token);
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Mark user as new for onboarding flow
        markUserAsNew(user.userId);
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const signOutFirebase = async () => {
    try {
      await signOut(auth);
      // await apiClient.logoutUser(refreshToken || undefined);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      apiClient.logout();
      setIsAuthenticated(false);
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
    signOutFirebase,
    sendSMS,
    updateUser,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };