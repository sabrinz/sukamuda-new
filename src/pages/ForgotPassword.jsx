import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios, { ensureCsrfToken } from '../utils/axiosConfig';
import logoSukaMuda from '../assets/logo.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const otpRefs = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    clearMessages();
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(v => !v);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    clearMessages();
  };

  const otpValue = otp.join('');

  // ===== API HANDLERS =====
  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await ensureCsrfToken();
      await axios.post('/api/forgot-password/send-otp', { email });
      setSuccess('Kode OTP berhasil dikirim ke email kamu.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Email tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (otpValue.length !== 6) {
      setError('Kode OTP harus 6 digit.');
      return;
    }
    if (password.length < 8) {
      setError('Sandi minimal 8 karakter.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Konfirmasi sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/forgot-password/reset', {
        email,
        otp: otpValue,
        password: password,
        password_confirmation: passwordConfirmation
      });
      setSuccess('Sandi berhasil diubah!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP salah atau sudah kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  // DIPERBAIKI: Ditambahkan ensureCsrfToken() agar tidak error 419 saat kirim ulang
  const handleResendOtp = async () => {
    clearMessages();
    setLoading(true);
    try {
      await ensureCsrfToken();
      await axios.post('/api/forgot-password/send-otp', { email });
      setSuccess('Kode OTP baru sudah dikirim ulang.');
    } catch (err) {
      setError('Gagal mengirim ulang kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fp-page ${mounted ? 'fp-mounted' : ''}`}>
      <div className="particles" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="particle" style={{
            '--delay': `${i * 0.8}s`,
            '--duration': `${14 + i * 2}s`,
            '--x': `${15 + i * 14}%`,
            '--size': `${4 + (i % 3) * 2}px`,
          }} />
        ))}
      </div>

      <div className="deco-line deco-line-1" aria-hidden="true" />
      <div className="deco-line deco-line-2" aria-hidden="true" />
      <div className="deco-line deco-line-3" aria-hidden="true" />
      <div className="deco-shape deco-shape-1" aria-hidden="true" />
      <div className="deco-shape deco-shape-2" aria-hidden="true" />

      <button type="button" className="back-btn" onClick={() => navigate('/login')} aria-label="Kembali ke Login">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <div className="fp-card">
        <div className="fp-logo anim-item" style={{ '--i': 0 }}>
          <img src={logoSukaMuda} alt="Logo SukaMuda" width="96" height="96" />
        </div>

        <div className="fp-head anim-item" style={{ '--i': 1 }}>
          {step === 1 ? (
            <>
              <h1>Lupa Sandi?</h1>
              <p>Masukkan email terdaftar untuk menerima kode verifikasi.</p>
            </>
          ) : (
            <>
              <h1>Verifikasi & Atur Ulang</h1>
              <p>Kode sudah dikirim ke <strong className="fp-email-highlight">{email}</strong></p>
            </>
          )}
        </div>

        <div className="fp-steps anim-item" style={{ '--i': 1 }}>
          <div className={`fp-step-dot ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <small>Email</small>
          </div>
          <div className={`fp-step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`fp-step-dot ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <small>Verifikasi</small>
          </div>
        </div>

        {error && (
          <div className="fp-msg fp-msg-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="fp-msg-close" aria-label="Tutup pesan error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="fp-msg fp-msg-success" role="status">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* ===== STEP 1 ===== */}
        {step === 1 && (
          <form className="fp-form" onSubmit={handleSendOtp}>
            <div className="fp-field anim-item" style={{ '--i': 3 }}>
              <label htmlFor="fp-email">Email Terdaftar</label>
              <div className="fp-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="fp-btn anim-item" style={{ '--i': 4 }} disabled={loading}>
              {loading ? (
                <span className="fp-btn-loading">
                  <span className="fp-spinner" aria-hidden="true" /> Mengirim OTP...
                </span>
              ) : (
                <span className="fp-btn-text">
                  Kirim Kode OTP
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        )}

        {/* ===== STEP 2 ===== */}
        {step === 2 && (
          <form className="fp-form" onSubmit={handleResetPassword}>
            {/* OTP Boxes */}
            <div className="fp-field anim-item" style={{ '--i': 3 }}>
              <label id="fp-otp-label">Kode OTP</label>
              <div className="fp-otp-boxes" onPaste={handleOtpPaste} role="group" aria-labelledby="fp-otp-label">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className={`fp-otp-box ${digit ? 'filled' : ''}`}
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${i + 1} dari 6`}
                    disabled={loading}
                  />
                ))}
              </div>
              <button type="button" className="fp-resend" onClick={handleResendOtp} disabled={loading}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Kirim ulang kode
              </button>
            </div>

            {/* Sandi Baru */}
            <div className="fp-field anim-item" style={{ '--i': 4 }}>
              <label htmlFor="fp-password">Sandi Baru</label>
              <div className="fp-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                <input
                  id="fp-password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
              {password && (
                <div className="fp-pw-strength">
                  <div className="fp-pw-bars">
                    <span className={`fp-pw-bar ${password.length >= 4 ? 'filled' : ''}`} />
                    <span className={`fp-pw-bar ${password.length >= 6 ? 'filled' : ''}`} />
                    <span className={`fp-pw-bar ${password.length >= 8 ? 'filled' : ''}`} />
                    <span className={`fp-pw-bar ${password.length >= 10 && /[A-Z]/.test(password) && /\d/.test(password) ? 'filled strong' : ''}`} />
                  </div>
                  <small>
                    {password.length < 8 ? 'Terlalu pendek' :
                      password.length < 10 ? 'Cukup' :
                        /[A-Z]/.test(password) && /\d/.test(password) ? 'Kuat' : 'Bagus'}
                  </small>
                </div>
              )}
            </div>

            {/* Konfirmasi Sandi */}
            <div className="fp-field anim-item" style={{ '--i': 5 }}>
              <label htmlFor="fp-password-confirmation">Konfirmasi Sandi</label>
              <div className="fp-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  id="fp-password-confirmation"
                  type="password"
                  placeholder="Ulangi sandi baru"
                  value={passwordConfirmation}
                  onChange={(e) => { setPasswordConfirmation(e.target.value); clearMessages(); }}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="fp-btn anim-item" style={{ '--i': 6 }} disabled={loading}>
              {loading ? (
                <span className="fp-btn-loading">
                  <span className="fp-spinner" aria-hidden="true" /> Memproses...
                </span>
              ) : (
                <span className="fp-btn-text">
                  Ubah Kata Sandi
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        )}

        <div className="fp-sep anim-item" style={{ '--i': 7 }} />
        <p className="fp-footer anim-item" style={{ '--i': 7 }}>
          Ingat sandinya?{' '}
          <Link to="/login" className="fp-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Login lagi
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;