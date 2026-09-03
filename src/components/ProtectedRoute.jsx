import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles = null }) {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main
        id="main-content"
        className="protected-route-loading"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Memuat halaman"
      >
        <div className="protected-route-spinner" aria-hidden="true" />
        <span className="sr-only">Memverifikasi sesi pengguna...</span>
      </main>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  const roles = Array.isArray(allowedRoles)
    ? allowedRoles.filter(Boolean)
    : allowedRoles
      ? [allowedRoles]
      : [];

  // /admin selalu memerlukan role admin, meskipun allowedRoles terlupa
  // diberikan dari App.jsx. API backend tetap wajib melakukan otorisasi.
  const requiredRoles = location.pathname.startsWith("/admin")
    ? ["admin"]
    : roles;

  if (
    requiredRoles.length > 0 &&
    !requiredRoles.includes(String(user.role || "").toLowerCase())
  ) {
    return <Navigate to="/" replace state={{ accessDenied: true }} />;
  }

  return children;
}

export default ProtectedRoute;
