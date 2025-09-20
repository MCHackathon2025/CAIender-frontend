import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import '../../styles/App.css';

/**
 * ProtectedRoute component - Route protection with authentication checks
 * Provides loading states, error handling, and proper navigation flow
 */
const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  fallbackComponent: FallbackComponent = null
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Log authentication state changes for debugging
  useEffect(() => {
    console.log('ProtectedRoute: Auth state changed', {
      isAuthenticated,
      loading,
      requireAuth,
      user: user?.username || 'No user'
    });
  }, [isAuthenticated, loading, requireAuth, user]);

  // Enhanced loading state with better UX
  if (loading) {
    return (
      <div
        className="auth-loading-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--surface-color)',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)'
        }}
      >
        <div className="loading-spinner" />
        <div
          style={{
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}
        >
          <p style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
            Checking authentication...
          </p>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: 'var(--font-size-sm)',
            opacity: 0.7
          }}>
            Please wait while we verify your credentials
          </p>
        </div>
      </div>
    );
  }

  // Authentication required but user not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirecting after login
    const from = location.pathname + location.search;

    console.log('ProtectedRoute: Redirecting to login', { from, redirectTo });

    return (
      <Navigate
        to={redirectTo}
        state={{ from }}
        replace
      />
    );
  }

  // User is authenticated but trying to access auth-only pages (login/register)
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from || '/';

    console.log('ProtectedRoute: Authenticated user redirected', { from });

    return (
      <Navigate
        to={from}
        replace
      />
    );
  }

  // Custom fallback component for specific scenarios
  if (FallbackComponent) {
    return <FallbackComponent />;
  }

  // Render protected content
  console.log('ProtectedRoute: Rendering protected content', {
    isAuthenticated,
    requireAuth,
    user: user?.username || 'No user'
  });

  return (
    <div className="protected-content">
      {children}
    </div>
  );
};

/**
 * Higher-order component for creating protected routes
 * @param {React.Component} Component - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.Component} Protected component
 */
export const withProtection = (Component, options = {}) => {
  const ProtectedComponent = (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  ProtectedComponent.displayName = `withProtection(${Component.displayName || Component.name})`;

  return ProtectedComponent;
};

/**
 * Hook for checking authentication status in components
 * @returns {Object} Authentication state and helpers
 */
export const useAuthGuard = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  const requireAuth = () => {
    if (loading) return 'loading';
    if (!isAuthenticated) return 'unauthenticated';
    return 'authenticated';
  };

  const canAccess = (requireAuthFlag = true) => {
    if (loading) return false;
    return requireAuthFlag ? isAuthenticated : !isAuthenticated;
  };

  const redirectToLogin = () => {
    const from = location.pathname + location.search;
    return `/login?from=${encodeURIComponent(from)}`;
  };

  return {
    isAuthenticated,
    loading,
    user,
    requireAuth: requireAuth(),
    canAccess,
    redirectToLogin
  };
};

export default ProtectedRoute;