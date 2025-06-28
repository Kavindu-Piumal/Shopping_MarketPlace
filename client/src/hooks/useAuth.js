import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../Store/UserSlice';
import fetchUserDetails from '../utils/fetchUserDetails';

/**
 * 🎯 PROFESSIONAL: Custom authentication hook
 * Provides clean authentication state management
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const dispatch = useDispatch();

  // Check if user has valid tokens
  const hasValidTokens = useCallback(() => {
    const accessToken = localStorage.getItem('accesstoken');
    const refreshToken = localStorage.getItem('refreshtoken');
    return !!(accessToken || refreshToken);
  }, []);

  // Authenticate user
  const authenticate = useCallback(async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Skip API call if no tokens exist
      if (!hasValidTokens()) {
        dispatch(setUserDetails(null));
        setIsAuthenticated(false);
        return;
      }

      const userData = await fetchUserDetails();
      
      if (userData?.success && userData?.isAuthenticated) {
        dispatch(setUserDetails(userData.data));
        setIsAuthenticated(true);
      } else {
        dispatch(setUserDetails(null));
        setIsAuthenticated(false);
        
        if (userData?.message && process.env.NODE_ENV === 'development') {
          console.info('Auth check:', userData.message);
        }
      }
    } catch (error) {
      setAuthError(error.message);
      dispatch(setUserDetails(null));
      setIsAuthenticated(false);
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('Authentication error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, hasValidTokens]);

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('refreshtoken');
    dispatch(setUserDetails(null));
    setIsAuthenticated(false);
    setAuthError(null);
  }, [dispatch]);

  // Listen for storage changes (multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accesstoken' || e.key === 'refreshtoken') {
        if (!hasValidTokens()) {
          logout();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [hasValidTokens, logout]);

  return {
    isLoading,
    isAuthenticated,
    authError,
    authenticate,
    logout,
    hasValidTokens: hasValidTokens()
  };
};

export default useAuth;
