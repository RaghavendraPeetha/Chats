// AuthProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (token) {
          const response = await axios.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        handleLogout(); // Handle token expiration or other errors
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      setToken(token);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error; // Rethrow the error to handle it in the component
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/auth/register', { username, email, password });
      const { token, user } = response.data;
      setToken(token);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Error registering:', error);
      throw error; // Rethrow the error to handle it in the component
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
