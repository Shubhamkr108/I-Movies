import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('imovies_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('imovies_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('imovies_token');
    if (!savedToken) return;
    try {
      const { data } = await authAPI.getMe();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('imovies_user', JSON.stringify(data.user));
      }
    } catch {
      localStorage.removeItem('imovies_token');
      localStorage.removeItem('imovies_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    if (data.success) {
      localStorage.setItem('imovies_token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(data.message || 'Login successful!');
      return data;
    }
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    if (data.success) {
      localStorage.setItem('imovies_token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(data.message || 'Account created!');
      return data;
    }
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout, updateUser,
      isAdmin: user?.role === 'admin',
      isAuthenticated: !!token && !!user,
      loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
