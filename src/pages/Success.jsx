import React from 'react';
import './Success.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn } = useAuth();

  // Ambil data asli dari halaman Register (nama, email)
  const registerData = location.state || {};

  const handleExplore = () => {
    // Kalau sudah login beneran (dari VerifyOtp, lengkap dengan token),
    // JANGAN timpa dengan data placeholder — langsung jelajahi saja.
    if (!isLoggedIn) {
      login({
        name: registerData.name || 'Pengguna Sukamuda',
        email: registerData.email || 'user@sukamuda.com',
        role: 'user',
        joinedAt: new Date().toISOString(),
      });
    }
    navigate('/');
  };

  return (
    <div className="welcome-page">

      <Helmet>
        <title>Selamat Bergabung - Sukamuda</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Confetti particles */}
      <div className="confetti-container" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={`confetti-piece confetti-${i % 6}`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2.5 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative */}
      <div className="welcome-deco welcome-deco-1" aria-hidden="true"></div>
      <div className="welcome-deco welcome-deco-2" aria-hidden="true"></div>
      <div className="welcome-deco welcome-deco-3" aria-hidden="true"></div>

      <div className="welcome-card">
        {/* Animated Checkmark */}
        <div className="check-wrapper" aria-hidden="true">
          <div className="check-ring">
            <svg className="check-svg" viewBox="0 0 52 52">
              <circle className="check-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <circle className="check-circle-stroke" cx="26" cy="26" r="25" fill="none"/>
              <path className="check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <div className="check-glow"></div>
        </div>

        {/* Badge */}
        <div className="welcome-badge">
          <span>Selamat Bergabung</span>
        </div>

        {/* Title */}
        <h1 className="welcome-title">
          Welcome to{' '}
          <span className="brand-name">SUKAMUDA</span>
        </h1>

        {/* Description */}
        <p className="welcome-desc">
          Selamat datang di Sukamuda! Ruang berbagi cerita, inspirasi, dan informasi 
          yang menghadirkan berbagai kisah menarik, wawasan, serta semangat kebersamaan 
          untuk semua pembaca.
        </p>

        {/* Feature Pills */}
        <div className="feature-pills">
          <div className="feature-pill">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>Tulis Artikel</span>
          </div>
          <div className="feature-pill">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Baca Konten</span>
          </div>
          <div className="feature-pill">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Komunitas</span>
          </div>
        </div>

        {/* CTA Button */}
        <button className="btn-explore" onClick={handleExplore} type="button">
          <span>Mulai Jelajahi</span>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

        {/* Subtle footer */}
        <p className="welcome-footer">
          Nikmati pengalaman berbagi terbaik bersama kami.
        </p>
      </div>
    </div>
  );
};

export default Success;