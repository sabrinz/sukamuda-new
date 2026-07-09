import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios, { ensureCsrfToken } from '../utils/axiosConfig';
import logoSukaMuda from '../assets/logo.png';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* ── Sudah login? langsung lempar ke home ── */
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
      return;
    }
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* 1. Pastikan cookie CSRF sudah ada sebelum POST */
      await ensureCsrfToken();

      /* 2. Kirim request login */
      const response = await axios.post('/api/login', formData);

      /* 3. Parse response — handle kalau backend kirim string */
      const data =
        typeof response.data === 'string'
          ? JSON.parse(response.data)
          : response.data;

      const userData = data.user;
      const token = data.access_token || data.token;

      if (!userData || !token) {
        throw new Error('Respons server tidak valid.');
      }

      /* 4. Update AuthContext → navbar langsung berubah */
      login(userData, token);

      /* 5. Reset form & pindah halaman (replace = tidak bisa back ke login) */
      setFormData({ email: '', password: '' });
      navigate('/', { replace: true });
    } catch (error) {
      let message = 'Email atau kata sandi salah.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message && !error.message.includes('Respons')) {
        message = error.message;
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Fallback logo jika gambar gagal load ── */
  const handleLogoError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  return (
    <div className={`login-page${mounted ? ' is-mounted' : ''}`}>
      {/* Partikel dekorasi */}
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              '--delay': `${i * 0.8}s`,
              '--duration': `${14 + i * 2}s`,
              '--x': `${15 + i * 14}%`,
              '--size': `${4 + (i % 3) * 2}px`,
            }}
          />
        ))}
      </div>

      {/* Garis dekorasi */}
      <div className="deco-line deco-line-1" aria-hidden="true" />
      <div className="deco-line deco-line-2" aria-hidden="true" />
      <div className="deco-line deco-line-3" aria-hidden="true" />

      {/* Bentuk dekorasi */}
      <div className="deco-shape deco-shape-1" aria-hidden="true" />
      <div className="deco-shape deco-shape-2" aria-hidden="true" />

      {/* Tombol kembali */}
      <button
        type="button"
        className="back-btn"
        onClick={() => navigate('/', { replace: true })}
        aria-label="Kembali ke beranda"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      {/* ════════ KARTU LOGIN ════════ */}
      <div className="login-card">
        {/* Logo */}
        <div className="logo-wrap anim-item" style={{ '--i': 0 }}>
          <img
            src={logoSukaMuda}
            alt="Logo SUKAMUDA"
            className="logo-img"
            onError={handleLogoError}
          />
          <span className="logo-fallback" aria-hidden="true">S</span>
        </div>

        <h1 className="login-heading anim-item" style={{ '--i': 1 }}>
          Login
        </h1>

        <form className="login-form" onSubmit={handleLogin} noValidate>
          {/* ── Email ── */}
          <div className="input-group anim-item" style={{ '--i': 2 }}>
            <label htmlFor="login-email">Email</label>
            <div className="input-box">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contoh@email.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* ── Password ── */}
          <div className="input-group anim-item" style={{ '--i': 3 }}>
            <label htmlFor="login-password">Kata Sandi</label>
            <div className="input-box">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                tabIndex={-1}
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ── Lupa password ── */}
          <div className="anim-item" style={{ '--i': 4 }}>
            <Link to="/forgot-password" className="forgot-link">
              Lupa Kata Sandi?
            </Link>
          </div>

          {/* ── Tombol submit ── */}
          <button
            type="submit"
            className="btn-login anim-item"
            style={{ '--i': 5 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : 'Masuk'}
          </button>
        </form>

        <div className="login-sep" aria-hidden="true" />

        <p className="login-footer anim-item" style={{ '--i': 6 }}>
          Belum punya akun?{' '}
          <Link to="/register" className="link-dark">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;