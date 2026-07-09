import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Inisialisasi auth saat web pertama kali dibuka
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        // Pengecekan ketat: data harus ada, bukan string "undefined", dan ada token
        if (savedUser && savedUser !== "undefined" && token) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      } catch (error) {
        // Jika JSON rusak, bersihkan storage agar tidak whitescreen terus-menerus
        console.error("Gagal memuat sesi login:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        // Apapun hasilnya, loading selesai agar halaman bisa muncul
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Fungsi Login (Dipanggil dari halaman Login)
  const login = (userData, token) => {
    // Pastikan data tidak kosong sebelum disimpan
    if (userData && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      console.error("Gagal Login: Data user atau token tidak valid dari server");
    }
  };

  // 3. Fungsi Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  // 4. Fungsi Update User (TANPA MENGUBAH LOGIC LOGIN)
  // Digunakan jika user update profil (nama/foto) agar sidebar/navbar langsung berubah tanpa logout
  const updateUser = (newUserData) => {
    if (newUserData) {
      const updatedUser = { ...user, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUser, loading }}>
      {/* Jika masih loading, jangan tampilkan apa-apa dulu untuk mencegah error variabel kosong */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);