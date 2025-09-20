import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.js';
import authServiceFallback from '../services/authFallback.js';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.user);
        } else {
          // Token is invalid, clear it
          authService.logout();
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Failed to initialize authentication');
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Starting login...');
      setLoading(true);
      setError(null);

      console.log('AuthContext: Calling authService.login...');
      // Try fallback service if main service fails
      let result = await authService.login(credentials);

      if (!result.success && result.error?.includes('Network error')) {
        console.log('Trying fallback auth service...');
        result = await authServiceFallback.login(credentials);
      }
      console.log('AuthContext: Login result received:', { success: result.success, hasError: !!result.error });

      if (result.success) {
        console.log('AuthContext: Login successful, getting user data...');
        // Get user data after successful login
        const userResult = await authService.getCurrentUser();
        if (userResult.success) {
          console.log('AuthContext: User data retrieved successfully');
          setUser(userResult.user);
          return { success: true };
        } else {
          console.error('AuthContext: Failed to get user data after login');
          setError('Failed to get user data after login');
          return { success: false, error: 'Failed to get user data' };
        }
      } else {
        console.error('AuthContext: Login failed:', result.error);
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userInfo) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.register(userInfo);

      if (result.success) {
        // Auto-login after successful registration
        const loginResult = await login({
          username: userInfo.username,
          password: userInfo.password
        });
        return loginResult;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
    // Navigate to login page after logout
    window.location.href = '/login';
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
    refreshUser: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
