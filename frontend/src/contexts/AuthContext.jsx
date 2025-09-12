import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try multiple API URLs as fallback
      let apiUrls = [];
      
      // FORCE PRODUCTION URL FIRST if on Netlify/Vercel
      if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app')) {
        apiUrls = [
          'https://sihkochimetro.vercel.app', // Force production first
          config.API_URL,
          'http://localhost:5000',
          `http://${window.location.hostname}:5000`
        ];
        console.log('🚀 FORCING PRODUCTION URL FIRST for Netlify/Vercel');
      } else {
        apiUrls = [
          config.API_URL,
          'https://sihkochimetro.vercel.app', // Direct backend URL
          'http://localhost:5000',
          `http://${window.location.hostname}:5000`
        ];
      }
      
      let response;
      let lastError;
      
      for (const apiUrl of apiUrls) {
        try {
          console.log('Trying API URL:', apiUrl);
          console.log('Full URL:', `${apiUrl}/api/auth/login`);
          response = await axios.post(`${apiUrl}/api/auth/login`, credentials);
          console.log('✅ Successfully connected to:', apiUrl);
          break; // Success, exit the loop
        } catch (error) {
          console.log('❌ Failed to connect to:', apiUrl, error.message);
          if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
          }
          lastError = error;
        }
      }
      
      if (!response) {
        throw lastError || new Error('Could not connect to any API endpoint');
      }
      
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Try multiple API URLs as fallback
      const apiUrls = [
        config.API_URL,
        'https://sihkochimetro.vercel.app', // Direct backend URL
        'http://localhost:5000',
        `http://${window.location.hostname}:5000`
      ];
      
      for (const apiUrl of apiUrls) {
        try {
          await axios.post(`${apiUrl}/api/auth/logout`);
          break; // Success, exit the loop
        } catch (error) {
          console.log('Logout failed for:', apiUrl, error.message);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const testApiConnection = async () => {
    let apiUrls = [];
    
    // FORCE PRODUCTION URL FIRST if on Netlify/Vercel
    if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app')) {
      apiUrls = [
        'https://sihkochimetro.vercel.app', // Force production first
        config.API_URL,
        'http://localhost:5000',
        `http://${window.location.hostname}:5000`
      ];
      console.log('🚀 FORCING PRODUCTION URL FIRST for Netlify/Vercel');
    } else {
      apiUrls = [
        config.API_URL,
        'https://sihkochimetro.vercel.app',
        'http://localhost:5000',
        `http://${window.location.hostname}:5000`
      ];
    }
    
    for (const apiUrl of apiUrls) {
      try {
        console.log('Testing API connection to:', apiUrl);
        const response = await axios.get(`${apiUrl}/api/health`);
        console.log('✅ API connection successful:', apiUrl, response.data);
        return { success: true, url: apiUrl, data: response.data };
      } catch (error) {
        console.log('❌ API connection failed:', apiUrl, error.message);
      }
    }
    return { success: false, message: 'No API endpoints available' };
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    testApiConnection,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
