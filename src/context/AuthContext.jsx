import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('meetmind_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('meetmind_token');
      if (token) {
        try {
          const res = await api.auth.me();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            // Invalid user data
            handleLogout();
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          // Only log out if it is an auth error (401), not a network failure
          if (err.status === 401) {
            handleLogout();
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for session expiry from API interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setError('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  const handleLogin = async (email, password) => {
    setError(null);
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const handleRegister = async (fullName, email, password, confirmPassword) => {
    setError(null);
    try {
      const res = await api.auth.register(fullName, email, password, confirmPassword);
      return res;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setError(null);
  };

  const handleUpdateProfile = async (fullName) => {
    setError(null);
    try {
      const res = await api.auth.updateProfile(fullName);
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
      throw new Error(res.message || 'Profile update failed');
    } catch (err) {
      setError(err.message || 'Profile update failed');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
