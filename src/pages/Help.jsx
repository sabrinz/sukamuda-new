import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Help.css';

const Help = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(new Set());
  const refs = useRef([]);

  const emailTujuan = "bantuan@sukamuda50.com";
  const subjek = "Bantuan Layanan SukaMuda";
  const isiPesan = "Halo Tim SukaMuda,\n\nSaya butuh bantuan/ingin bertanya mengenai:\n\n[Tulis pesanmu di sini...]";
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailTujuan}&su=${encodeURIComponent(subjek)}&body=${encodeURIComponent(isiPesan)}`;

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((p) => new Set([...p, e.target.id]));
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  const reg = (el, id) => {
    if (el && !refs.current.find((r) => r?.id === id)) refs.current.push(el);
  };
  const on = (id) => visible.has(id);

  return (
    <div className="hl-root">
      <Helmet>
        <title>Pusat Bantuan - Sukamuda</title>
        <link rel="canonical" href="https://sukamuda.co.id/help" />
        <meta name="description" content="Punya pertanyaan atau kendala seputar layanan Sukamuda? Hubungi pusat bantuan tim support kami di sini." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Pusat Bantuan dan Kontak - Sukamuda",
            "description": "Punya pertanyaan atau kendala seputar layanan Sukamuda? Hubungi pusat bantuan tim support kami di sini.",
            "url": "https://sukamuda.co.id/help",
            "mainEntity": {
              "@type": "Organization",
              "name": "Sukamuda",
              "url": "https://sukamuda.co.id",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "bantuan@sukamuda50.com",
                "contactType": "customer support"
              }
            },
            "isPartOf": {
              "@type": "WebSite",
              "name": "Sukamuda",
              "url": "https://sukamuda.co.id"
            },
            "inLanguage": "id-ID"
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Beranda",
                "item": "https://sukamuda.co.id"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Bantuan"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="hl-grid-bg" />

      <div className="hl-wrap">

        {/* NAV */}
        <nav className={`hl-nav ${on('nav') ? 'hl-on' : ''}`} id="nav" ref={(e) => reg(e, 'nav')}>
          <button className="hl-back" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span className="hl-nav-title">Bantuan</span>
          <div className="hl-nav-right">
            <span className="hl-nav-line" />
            <span className="hl-nav-tag">Support</span>
          </div>
        </nav>

        {/* HERO */}
        <header className={`hl-hero ${on('hero') ? 'hl-on' : ''}`} id="hero" ref={(e) => reg(e, 'hero')}>
          <div className="hl-hero-top">
            <div className="hl-hero-badge">
              <span className="hl-badge-dot" />
              <span>Pusat Bantuan</span>
            </div>
          </div>
          <div className="hl-hero-body">
            <h1>
              <span className="hl-h1-line">Butuh</span>
              <span className="hl-h1-line hl-h1-accent">Bantuan?</span>
            </h1>
            <p className="hl-hero-desc" style={{ textAlign: 'left' }}>
              Punya pertanyaan atau kendala seputar layanan Sukamuda? Tim kami siap membantu.
            </p>
          </div>
          <div className="hl-hero-bottom">
            <div className="hl-hero-bar" />
          </div>
        </header>

        {/* EMAIL CARD */}
        <section className={`hl-sec ${on('card') ? 'hl-on' : ''}`} id="card" ref={(e) => reg(e, 'card')} style={{ textAlign: 'left' }}>
          <a
            href={gmailLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hl-email-card"
          >
            <div className="hl-email-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            </div>
            <div className="hl-email-body">
              <h3>Hubungi via Email</h3>
              <p>bantuan@sukamuda50.com</p>
            </div>
            <div className="hl-email-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </div>
          </a>
        </section>

        {/* INFO CARDS */}
        <section className={`hl-sec ${on('info') ? 'hl-on' : ''}`} id="info" ref={(e) => reg(e, 'info')} style={{ textAlign: 'left' }}>
          <div className="hl-info-grid">
            <div className="hl-info-card" style={{ transitionDelay: '0ms' }}>
              <div className="hl-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h4>Waktu Respons</h4>
              <p>Kami akan merespons dalam 1×24 jam kerja.</p>
            </div>
            <div className="hl-info-card" style={{ transitionDelay: '60ms' }}>
              <div className="hl-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h4>Sampaikan Detail</h4>
              <p>Sertakan informasi sebanyak mungkin agar kami bisa membantu lebih cepat.</p>
            </div>
          </div>
        </section>

        {/* FAQ TEASER */}
        <section className={`hl-sec ${on('tease') ? 'hl-on' : ''}`} id="tease" ref={(e) => reg(e, 'tease')} style={{ textAlign: 'left' }}>
          <div className="hl-tease-card">
            <div className="hl-tease-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="hl-tease-body">
              <h4>Pertanyaan yang Sering Ditanyakan</h4>
              <p>Mungkin jawaban yang kamu cari sudah ada di halaman FAQ.</p>
            </div>
            <button className="hl-tease-btn" onClick={() => navigate('/faq')}>
              Lihat FAQ
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="hl-foot">
          <div className="hl-foot-line" />
          <div className="hl-foot-in">
            <span className="hl-foot-logo">sukamuda</span>
            <span className="hl-foot-c">© {new Date().getFullYear()} — Dibuat untuk generasi muda Indonesia</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Help;