import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser && savedUser !== "undefined" && token) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Gagal memuat sesi login:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // SYNC FIX: dengarkan event dari axios interceptor (token expired / 401).
  // Saat token dihapus oleh interceptor, state UI ikut logout otomatis.
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('user');
      setUser(null);
      setIsLoggedIn(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (userData, token) => {
    if (userData && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      console.error("Gagal Login: Data user atau token tidak valid dari server");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  // FIX: pakai functional setState agar tidak menimpa update sebelumnya (stale closure)
  const updateUser = (newUserData) => {
    if (newUserData) {
      setUser((prevUser) => {
        const updatedUser = { ...prevUser, ...newUserData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);