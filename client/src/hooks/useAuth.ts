import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
   
    return { user: null, loading: true, isAuthenticated: false };
  }
  
  return { 
    user, 
    loading: false, 
    isAuthenticated: !!user 
  };
};