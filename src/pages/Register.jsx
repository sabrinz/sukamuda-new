import React, { useState, useEffect } from 'react';
import './Register.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios, { ensureCsrfToken } from '../utils/axiosConfig';
import logoSukaMuda from '../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwConf, setShowPwConf] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modal, setModal] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    /* Sudah login? tidak perlu register lagi */
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

  const openModal = (type, message) => setModal({ show: true, type, message });
  const closeModal = () => setModal({ show: false, type: '', message: '' });

  const handleRegister = async (e) => {
    e.preventDefault();

    /* Validasi client-side: konfirmasi password harus sama */
    if (formData.password !== formData.password_confirmation) {
      openModal('error', 'Konfirmasi kata sandi tidak sama.');
      return;
    }

    setLoading(true);

    try {
      await ensureCsrfToken();

      const response = await axios.post('/api/register', formData);

      if (
        response.data.status === 'success' ||
        response.status === 200 ||
        response.status === 201
      ) {
        openModal('success', 'Kode OTP telah dikirim ke email kamu!');
      }
    } catch (error) {
      console.error('Detail Error:', error.response?.data);

      const serverMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;

      let finalMessage = 'Terjadi kesalahan saat mendaftar.';
      if (validationErrors) {
        finalMessage = Object.values(validationErrors)[0][0];
      } else if (serverMessage) {
        finalMessage = serverMessage;
      }

      openModal('error', finalMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- SVG ICONS (Extracted for readability) ---
  const IconUser = (
    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const IconMail = (
    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13L2 4" />
    </svg>
  );

  const IconLock = (
    <svg className="input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  const IconEyeOff = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const IconEyeOn = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  // --- RENDER ---
  return (
    <div className={`register-page ${mounted ? 'is-mounted' : ''}`}>
      {/* Background Decorations */}
      <div className="particles" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
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

      <div className="deco-line deco-line-1" aria-hidden="true" />
      <div className="deco-line deco-line-2" aria-hidden="true" />
      <div className="deco-line deco-line-3" aria-hidden="true" />
      <div className="deco-shape deco-shape-1" aria-hidden="true" />
      <div className="deco-shape deco-shape-2" aria-hidden="true" />

      {/* Back Button */}
      <button type="button" className="back-btn" onClick={() => navigate('/')} aria-label="Kembali ke beranda">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      {/* Card */}
      <div className="register-card">
        {/* Header */}
        <div className="logo-wrap anim-item" style={{ '--i': 0 }}>
          <img src={logoSukaMuda} alt="Logo SUKAMUDA" className="logo-img" width="96" height="96" />
        </div>

        <h1 className="register-heading anim-item" style={{ '--i': 1 }}>Daftar</h1>

        {/* Form */}
        <form className="register-form" onSubmit={handleRegister}>
          {/* Nama Lengkap */}
          <div className="input-group anim-item" style={{ '--i': 2 }}>
            <label htmlFor="name">Nama Lengkap</label>
            <div className="input-box">
              {IconUser}
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                required
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group anim-item" style={{ '--i': 3 }}>
            <label htmlFor="email">Email</label>
            <div className="input-box">
              {IconMail}
              <input
                id="email"
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

          {/* Kata Sandi */}
          <div className="input-group anim-item" style={{ '--i': 4 }}>
            <label htmlFor="password">Kata Sandi</label>
            <div className="input-box">
              {IconLock}
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPw ? IconEyeOff : IconEyeOn}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div className="input-group anim-item" style={{ '--i': 5 }}>
            <label htmlFor="password_confirmation">Konfirmasi Kata Sandi</label>
            <div className="input-box">
              {IconLock}
              <input
                id="password_confirmation"
                type={showPwConf ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Ulangi kata sandi"
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPwConf(!showPwConf)}
                aria-label={showPwConf ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPwConf ? IconEyeOff : IconEyeOn}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-register anim-item"
            style={{ '--i': 6 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : 'Daftar Sekarang'}
          </button>
        </form>

        {/* Footer */}
        <div className="register-sep" aria-hidden="true" />
        <p className="register-footer anim-item" style={{ '--i': 7 }}>
          Sudah punya akun? <Link to="/login" className="link-dark">Masuk</Link>
        </p>
      </div>

      {/* Modal Popup */}
      {modal.show && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-label={modal.type === 'success' ? 'Pendaftaran berhasil' : 'Pendaftaran gagal'}
          >
            <div className={`modal-icon ${modal.type}`} aria-hidden="true">
              {modal.type === 'success' ? (
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
            </div>

            <p className="modal-message" role="alert">{modal.message}</p>

            <button
              className="modal-btn"
              autoFocus
              onClick={() => {
                closeModal();
                if (modal.type === 'success') {
                  /* SECURITY FIX: jangan bawa password ke halaman OTP,
                     cukup data yang dibutuhkan verifikasi */
                  navigate('/verify-otp', {
                    state: { name: formData.name, email: formData.email },
                  });
                }
              }}
            >
              {modal.type === 'success' ? 'Lanjut Verifikasi' : 'Mengerti'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;