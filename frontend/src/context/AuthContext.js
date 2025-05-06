import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Ensure this instance includes `withCredentials: true`

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // `undefined` represents loading state

  useEffect(() => {
    const fetchUser = async () => {
      // Retrieve token from localStorage or cookies
      const token = localStorage.getItem('token'); // Or from cookies if you're using them

      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`, // Send token in the Authorization header
            },
          });
          setUser(res.data); // If the token is valid, set user data
        } catch (err) {
          setUser(null); // If there's an error (like token expired), log out
          localStorage.removeItem('token'); // Clear invalid token
        }
      } else {
        setUser(null); // No token, user is logged out
      }
    };

    fetchUser();
  }, []);

  const login = (user) => {
    setUser(user); // Set user when logged in
  };

  const logout = () => {
    localStorage.removeItem('token'); // Remove token on logout
    setUser(null); // Clear user state
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
