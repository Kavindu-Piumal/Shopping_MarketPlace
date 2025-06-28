import { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';

/**
 * 🎯 ENTERPRISE: Lazy Authentication Hook
 * Only triggers auth check when user actually needs authentication
 */
export const useLazyAuth = () => {
  const { checkAuth, isAuthenticated, isLoading, error } = useAuthContext();

  // Check auth only when this hook is used (lazy loading)
  useEffect(() => {
    const hasTokens = localStorage.getItem('accesstoken') || localStorage.getItem('refreshtoken');
    
    // Only check if tokens exist and not already authenticated
    if (hasTokens && !isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    error,
    checkAuth
  };
};

/**
 * 🎯 PROFESSIONAL: Protected Component Hook
 * Use this in components that require authentication
 */
export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, isLoading, checkAuth } = useLazyAuth();

  useEffect(() => {
    const hasTokens = localStorage.getItem('accesstoken') || localStorage.getItem('refreshtoken');
    
    if (hasTokens && !isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    requiresLogin: !isAuthenticated && !isLoading,
    redirectTo
  };
};

export default useLazyAuth;
