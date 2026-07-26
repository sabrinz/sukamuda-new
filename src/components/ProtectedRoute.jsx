import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Memuat halaman"
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 0,
          padding: 0
        }}
      >
        <div style={{
          width: '30px',
          height: '30px',
          border: '2.5px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#f97316',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
            @media (prefers-reduced-motion: reduce) {
            [role="status"] > div { animation: none !important; }
            }
        `}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Simpan halaman asal supaya setelah login bisa balik ke sini
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;