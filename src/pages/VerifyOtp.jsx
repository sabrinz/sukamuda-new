import { useAuth } from '../context/AuthContext';
import React, { useState, useRef, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerifyOtp.css';
import logoSukaMuda from '../assets/logo.png';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // 'error' | 'info'
  const { login } = useAuth();
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const userData = location.state;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!userData) {
      navigate('/register', { replace: true });
      return;
    }
    if (timer > 0) {
      const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [userData, navigate, timer]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  /* UX: support paste kode OTP dari email */
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;

    const newOtp = new Array(6).fill("");
    pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setMessage({ type: '', text: '' });
    try {
      await axios.post('/api/resend-otp', { email: userData?.email });
      setMessage({ type: 'info', text: 'Kode baru terkirim! Cek email kamu.' });
      setTimer(60);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0].focus();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal kirim ulang kode.',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      /* SECURITY FIX: password tidak dikirim lagi —
         akun sudah dibuat saat /api/register, verifikasi cukup email + otp */
      const response = await axios.post('/api/verify-otp', {
        email: userData?.email,
        name: userData?.name,
        otp: otp.join(""),
      });

      // Langsung login pakai data & token dari response
      const token = response.data.access_token || response.data.token;
      login(response.data.user, token);

      navigate('/interests', { state: userData, replace: true });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'OTP Salah atau Expired!',
      });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className={`otp-page ${mounted ? 'is-mounted' : ''}`}>
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
      <button type="button" className="back-btn" onClick={() => navigate('/register')} aria-label="Kembali ke pendaftaran">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      {/* Card */}
      <div className="otp-card">
        {/* Header */}
        <div className="logo-wrap anim-item" style={{ '--i': 0 }}>
          <img src={logoSukaMuda} alt="Logo SUKAMUDA" className="logo-img" width="96" height="96" />
        </div>

        <h1 className="otp-heading anim-item" style={{ '--i': 1 }}>Verifikasi Akun</h1>
        <p className="otp-subtext anim-item" style={{ '--i': 2 }}>
          Masukkan 6 digit kode yang dikirim ke{' '}
          <span className="otp-email-highlight">{userData?.email}</span>
        </p>

        {/* Form */}
        <form className="otp-form" onSubmit={handleSubmit}>
          {/* Pesan feedback (pengganti alert) */}
          {message.text && (
            <div className={`otp-message ${message.type}`} role="alert">
              {message.text}
            </div>
          )}

          <div className="otp-input-group anim-item" style={{ '--i': 3 }}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                className="otp-individual-box"
                maxLength={1}
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={`Digit ${index + 1} dari 6`}
                disabled={loading}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn-otp anim-item"
            style={{ '--i': 4 }}
            disabled={loading || otp.join("").length < 6}
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : 'Verifikasi Sekarang'}
          </button>
        </form>

        {/* Timer / Resend */}
        <div className="otp-timer anim-item" style={{ '--i': 5 }}>
          {timer > 0 ? (
            <p>Kirim ulang dalam <b>{timer}</b> detik</p>
          ) : (
            <p>
              Tidak terima kode?{' '}
              <button type="button" className="resend-link" onClick={handleResend}>
                Kirim Ulang
              </button>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="otp-sep" aria-hidden="true" />
        <p className="otp-footer anim-item" style={{ '--i': 6 }}>
          Salah alamat email?{' '}
          <button type="button" className="link-dark" onClick={() => navigate('/register')}>
            Daftar Ulang
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;