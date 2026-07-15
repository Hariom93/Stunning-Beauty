import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

// Convenience hook
export const useAuth = () => useContext(AuthContext);

// Restore persisted user from localStorage to avoid flash of "logged out" state
const restoreUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => restoreUser());
  // loading = true while we verify the stored token with the server on first mount
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const fetchUser = async () => {
    try {
      // Real server exposes GET /api/v1/auth/profile (protected)
      const { data } = await api.get('/auth/profile');
      const userData = data.user || data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      // Token invalid or expired — clear everything
      logout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Called after a successful login.
   * Server returns: { success, accessToken, user: { id, name, email, role, avatar, isVerified } }
   */
  const login = (accessToken, userData) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
