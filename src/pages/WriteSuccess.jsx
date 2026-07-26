import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './WriteSuccess.css';

const WriteSuccess = memo(function WriteSuccess() {
    const navigate = useNavigate();
    const [confetti, setConfetti] = useState([]);
    const [typingText, setTypingText] = useState('');
    const fullText = 'Artikel Terkirim';
    const confettiLaunched = useRef(false);

    useEffect(() => {
        let index = 0;
        let interval = null;
        const startTyping = setTimeout(() => {
            interval = setInterval(() => {
                if (index <= fullText.length) {
                    setTypingText(fullText.slice(0, index));
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 55);
        }, 1400);
        return () => {
            clearTimeout(startTyping);
            if (interval) clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (confettiLaunched.current) return;
        const launch = setTimeout(() => {
            confettiLaunched.current = true;
            const colors = ['#111111', '#4f46e5', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];
            setConfetti(
                Array.from({ length: 24 }, (_, i) => ({
                    id: i,
                    x: 50 + (Math.random() - 0.5) * 16,
                    color: colors[i % colors.length],
                    w: 4 + Math.random() * 4,
                    h: 2 + Math.random() * 3,
                    rot: Math.random() * 360,
                    vx: (Math.random() - 0.5) * 140,
                    vy: -(50 + Math.random() * 120),
                    spin: (Math.random() - 0.5) * 500,
                    delay: Math.random() * 0.2
                }))
            );
        }, 1000);
        return () => clearTimeout(launch);
    }, []);

    return (
        <div className="ws-container">

            <Helmet>
                <title>Artikel Terkirim - Sukamuda</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="ws-confetti" aria-hidden="true">
                {confetti.map(c => (
                    <span
                        key={c.id}
                        style={{
                            left: `${c.x}%`,
                            top: '32%',
                            width: `${c.w}px`,
                            height: `${c.h}px`,
                            background: c.color,
                            transform: `rotate(${c.rot}deg)`,
                            '--vx': `${c.vx}px`,
                            '--vy': `${c.vy}px`,
                            '--spin': `${c.spin}deg`,
                            animationDelay: `${c.delay}s`
                        }}
                    />
                ))}
            </div>

            <div className="ws-card">
                <div className="ws-shimmer" aria-hidden="true"></div>

                <div className="ws-check" aria-hidden="true">
                    <div className="ws-check-ring"></div>
                    <svg className="ws-check-svg" viewBox="0 0 52 52">
                        <circle className="ws-circle" cx="26" cy="26" r="24" fill="none" stroke="#111" strokeWidth="1.5" />
                        <path className="ws-tick" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 26.5l7.5 7.5L37 19" />
                    </svg>
                </div>

                <div className="ws-badge" role="status" aria-label="Artikel Terkirim">
                    <span className="ws-dot" aria-hidden="true"></span>
                    <span className="ws-badge-text" aria-hidden="true">{typingText}</span>
                    <span className="ws-cursor" aria-hidden="true">|</span>
                </div>

                <div className="ws-body">
                    <h1 className="ws-title">
                        <span className="ws-title-sub">Pengajuan</span>
                        <span className="ws-title-main">Berhasil Dikirim</span>
                    </h1>

                    <p className="ws-desc">
                        Terima kasih telah mengirimkan artikel Anda ke <strong>Sukamuda</strong>.
                        Artikel telah kami terima dan sedang dalam proses peninjauan
                        oleh tim editorial kami.
                    </p>

                    <div className="ws-stats">
                        <div className="ws-stat">
                            <div className="ws-stat-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="ws-stat-text">
                                <span className="ws-stat-label">Estimasi Review</span>
                                <span className="ws-stat-val">1–3 Hari Kerja</span>
                                <div className="ws-bar" aria-hidden="true"><div className="ws-bar-fill"></div></div>
                            </div>
                        </div>
                        <div className="ws-stat-line" aria-hidden="true"></div>
                        <div className="ws-stat">
                            <div className="ws-stat-icon ws-icon-green" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div className="ws-stat-text">
                                <span className="ws-stat-label">Status Saat Ini</span>
                                <span className="ws-stat-val ws-val-green">Dalam Review</span>
                                <div className="ws-dots" aria-hidden="true"><span></span><span></span><span></span></div>
                            </div>
                        </div>
                    </div>

                    <div className="ws-note">
                        <div className="ws-note-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </div>
                        <span>Notifikasi telah diaktifkan. Anda akan menerima pemberitahuan saat artikel lolos verifikasi dan siap dipublikasikan.</span>
                    </div>

                    <div className="ws-actions">
                        <button className="ws-btn ws-btn-primary" onClick={() => navigate('/profile')} type="button">
                            <span>Lanjutkan ke Profil</span>
                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                        <button className="ws-btn ws-btn-ghost" onClick={() => navigate('/write')} type="button">
                            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ws-plus">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Tulis Artikel Baru</span>
                        </button>
                    </div>
                </div>
            </div>

            <p className="ws-footer">© {new Date().getFullYear()} Sukamuda — Platform Artikel Terpercaya</p>
        </div>
    );
});

export default WriteSuccess;