import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user profile from API if token exists; fallback to localStorage
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('access_token');
      const localUser = localStorage.getItem('user_data');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/user/profile');
        if (res && res.data) {
          setUser(res.data);
          localStorage.setItem('user_data', JSON.stringify(res.data));
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Fallback to local storage if available
        if (localUser) {
          try {
            setUser(JSON.parse(localUser));
            setIsAuthenticated(true);
          } catch {
            // ignore
          }
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  const login = async (token, fallbackUserData = null) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
    try {
      const res = await api.get('/user/profile');
      if (res && res.data) {
        localStorage.setItem('user_data', JSON.stringify(res.data));
        setUser(res.data);
      } else if (fallbackUserData) {
        localStorage.setItem('user_data', JSON.stringify(fallbackUserData));
        setUser(fallbackUserData);
      }
    } catch {
      if (fallbackUserData) {
        localStorage.setItem('user_data', JSON.stringify(fallbackUserData));
        setUser(fallbackUserData);
      }
    }
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const updateUserProfile = async (updatedData) => {
    // Persist to backend and update local state
    try {
      const res = await api.put('/user/profile', updatedData);
      const updatedUser = res?.data?.user ? res.data.user : { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return { success: true };
    } catch (e) {
      // Still update local to keep UI responsive
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      localStorage.setItem('user_data', JSON.stringify(newUserData));
      return { success: false, error: e };
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};