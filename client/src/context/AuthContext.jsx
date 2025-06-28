import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../Store/UserSlice';
import fetchUserDetails from '../utils/fetchUserDetails';

/**
 * 🎯 ENTERPRISE-GRADE: Authentication Context
 * Centralized auth state management with zero unnecessary API calls
 */

// Auth states
const AUTH_STATES = {
  IDLE: 'idle',
  CHECKING: 'checking',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
};

// Auth actions
const AUTH_ACTIONS = {
  SET_CHECKING: 'SET_CHECKING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  status: AUTH_STATES.IDLE,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastCheck: null
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_CHECKING:
      return {
        ...state,
        status: AUTH_STATES.CHECKING,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        status: AUTH_STATES.AUTHENTICATED,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastCheck: Date.now()
      };

    case AUTH_ACTIONS.SET_UNAUTHENTICATED:
      return {
        ...state,
        status: AUTH_STATES.UNAUTHENTICATED,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastCheck: Date.now()
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        status: AUTH_STATES.ERROR,
        isLoading: false,
        error: action.payload,
        lastCheck: Date.now()
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [state, authDispatch] = useReducer(authReducer, initialState);
  const reduxDispatch = useDispatch();

  // 🎯 SMART AUTHENTICATION CHECK
  const checkAuth = async (force = false) => {
    try {
      // Check if tokens exist BEFORE making API call
      const hasTokens = localStorage.getItem('accesstoken') || localStorage.getItem('refreshtoken');
      
      if (!hasTokens) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('🚫 checkAuth: NO TOKENS FOUND - Setting unauthenticated state');
        }
        authDispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        reduxDispatch(setUserDetails(null));
        return false;
      }

      // Prevent unnecessary checks
      const timeSinceLastCheck = Date.now() - (state.lastCheck || 0);
      const recentlyChecked = timeSinceLastCheck < 30000; // 30 seconds

      if (!force && recentlyChecked && state.status !== AUTH_STATES.IDLE) {
        if (process.env.NODE_ENV === 'development') {
          console.info('⏭️ checkAuth: Skipping - recently checked');
        }
        return state.isAuthenticated;
      }

      if (process.env.NODE_ENV === 'development') {
        console.info('🔍 checkAuth: Making API call to verify authentication');
      }

      authDispatch({ type: AUTH_ACTIONS.SET_CHECKING });

      // Make API call only when tokens exist
      const result = await fetchUserDetails();

      if (result.success && result.isAuthenticated) {
        authDispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED });
        reduxDispatch(setUserDetails(result.data));
        // Save user data to localStorage for persistence
        localStorage.setItem('user', JSON.stringify(result.data));
        return true;
      } else {
        authDispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        reduxDispatch(setUserDetails(null));
        localStorage.removeItem('user');
        return false;
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('🔥 checkAuth: Error during authentication check:', error);
      }
      authDispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      reduxDispatch(setUserDetails(null));
      return false;
    }
  };

  // 🔐 LOGIN HANDLER
  const login = async (userData) => {
    try {
      authDispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED });
      reduxDispatch(setUserDetails(userData));
      // Save user data to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      authDispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: 'Login failed' 
      });
      return false;
    }
  };

  // 🚪 LOGOUT HANDLER
  const logout = () => {
    try {
      localStorage.removeItem('accesstoken');
      localStorage.removeItem('refreshtoken');
      localStorage.removeItem('user'); // Remove persisted user data
      authDispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
      reduxDispatch(setUserDetails(null));
      
      // Clear other user-related data
      localStorage.removeItem('cartItems');
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  // 🔄 REFRESH TOKEN HANDLER
  const refreshAuth = () => checkAuth(true);

  // 🚀 ZERO-CALL INITIALIZATION: Only set state based on token presence
  useEffect(() => {
    const hasTokens = localStorage.getItem('accesstoken') || localStorage.getItem('refreshtoken');
    const savedUser = localStorage.getItem('user');
    
    if (hasTokens && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Restore user state from localStorage
        reduxDispatch(setUserDetails(userData));
        authDispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED });
        
        if (process.env.NODE_ENV === 'development') {
          console.info('🔐 User state restored from localStorage');
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        authDispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
        reduxDispatch(setUserDetails(null));
      }
    } else if (!hasTokens) {
      // No tokens - clear any stale user data
      localStorage.removeItem('user');
      reduxDispatch(setUserDetails(null));
      authDispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
    }
  }, []); // Run only once on mount

  // 📱 LISTEN FOR STORAGE CHANGES (multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accesstoken' || e.key === 'refreshtoken') {
        const hasTokens = localStorage.getItem('accesstoken') || localStorage.getItem('refreshtoken');
        if (!hasTokens && state.isAuthenticated) {
          logout();
        }
      }
      // Also listen for user data changes
      if (e.key === 'user' && !e.newValue && state.isAuthenticated) {
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.isAuthenticated]);

  // Context value
  const value = {
    ...state,
    checkAuth,
    login,
    logout,
    refreshAuth,
    clearError: () => authDispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
