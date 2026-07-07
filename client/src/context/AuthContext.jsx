import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axiosInstance';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (loginId, password) => {
    const { data } = await api.post('/auth/login', { loginId, password });
    setUser(data);
    return data;
  };

  const signup = async (userData) => {
    const { data } = await api.post('/auth/signup', userData);
    setUser(data);
    return data;
  };

  const firebaseLoginAction = async (idToken) => {
    // Note: This might return a 206 status if a mobile number is required
    const response = await api.post('/auth/firebase-login', { idToken });
    if (response.status === 206) {
      return response.data; // Return the { requireMobile: true } object without setting user
    }
    setUser(response.data);
    return response.data;
  };

  const completeGoogleSignupAction = async (idToken, mobile) => {
    const { data } = await api.post('/auth/complete-google-signup', { idToken, mobile });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, firebaseLoginAction, completeGoogleSignupAction, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
