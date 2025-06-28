import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';

/**
 * 🎯 PROFESSIONAL: Route protection component
 * Handles authentication redirects cleanly
 */
const AuthGuard = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const location = useLocation();
  const user = useSelector(state => state.user);
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Require authentication but user is not authenticated
  if (requireAuth && !isAuthenticated && !user?._id) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Please login to access this page' 
        }} 
        replace 
      />
    );
  }

  // Don't require authentication but user is authenticated (redirect from login/register)
  if (!requireAuth && isAuthenticated && user?._id) {
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Specific guards for common use cases
export const ProtectedRoute = ({ children }) => (
  <AuthGuard requireAuth={true}>
    {children}
  </AuthGuard>
);

export const PublicRoute = ({ children }) => (
  <AuthGuard requireAuth={false}>
    {children}
  </AuthGuard>
);

export const AdminRoute = ({ children }) => {
  const user = useSelector(state => state.user);
  
  return (
    <AuthGuard requireAuth={true}>
      {user?.role === 'admin' ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )}
    </AuthGuard>
  );
};

export const SellerRoute = ({ children }) => {
  const user = useSelector(state => state.user);
  
  return (
    <AuthGuard requireAuth={true}>
      {['seller', 'admin'].includes(user?.role) ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-600 mb-4">Seller Access Required</h1>
            <p className="text-gray-600">You need to be a seller to access this page.</p>
          </div>
        </div>
      )}
    </AuthGuard>
  );
};

export default AuthGuard;
