import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './About.css';

const About = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(new Set());
  const [canonicalUrl, setCanonicalUrl] = useState("https://sukamuda.co.id/about");
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((p) => new Set([...p, e.target.id]));
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // SEO: Set URL kanonikal dinamis agar sama persis dengan link halaman yang aktif
    if (typeof window !== 'undefined') {
      setCanonicalUrl(window.location.origin + window.location.pathname.toLowerCase());
    }
  }, []);

  const reg = (el, id) => {
    if (el && !refs.current.find((r) => r?.id === id)) refs.current.push(el);
  };
  const on = (id) => visible.has(id);

  return (
    <div className="x-root">
      <Helmet>
        {/* SEO: Link Kanonikal Dinamis & Meta Tags */}
        <title>Tentang Kami - Sukamuda</title>
        <link rel="canonical" href="https://sukamuda.co.id/about" />
        <meta name="description" content="Sukamuda adalah wadah bagi siapa saja yang ingin menulis, membaca, dan berdiskusi dalam suasana yang positif, inspiratif, dan membangun." />
        
        {/* Agentic Browsing: Schema.org Structured Data (AboutPage) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "Tentang Kami - Sukamuda",
            "description": "Sukamuda adalah wadah bagi siapa saja yang ingin menulis, membaca, dan berdiskusi dalam suasana yang positif, inspiratif, dan membangun.",
            "url": canonicalUrl,
            "isPartOf": {
              "@type": "WebSite",
              "name": "Sukamuda",
              "url": "https://sukamuda.co.id"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Sukamuda",
              "url": "https://sukamuda.co.id",
              "logo": {
                "@type": "ImageObject",
                "url": "https://sukamuda.co.id/logo.png"
              }
            },
            "inLanguage": "id-ID"
          })}
        </script>

        {/* Agentic Browsing: BreadcrumbList Schema */}
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
                "name": "Tentang Kami"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="x-grid-bg" aria-hidden="true" />

      <div className="x-wrap">

        {/* NAV LANDMARK */}
        <nav className={`x-nav ${on('nav') ? 'x-on' : ''}`} id="nav" ref={(e) => reg(e, 'nav')} aria-label="Navigasi Utama">
          <span className="x-logo">sukamuda</span>
          <div className="x-nav-right">
            <span className="x-nav-line" aria-hidden="true" />
            <span className="x-nav-tag">About</span>
          </div>
        </nav>

        {/* MAIN LANDMARK */}
        <main className="x-main" id="main-content">

          {/* HERO */}
          <header className={`x-hero ${on('hero') ? 'x-on' : ''}`} id="hero" ref={(e) => reg(e, 'hero')}>
            <div className="x-hero-top">
              <div className="x-hero-badge">
                <span className="x-badge-dot" aria-hidden="true" />
                <span>Platform Digital untuk Generasi Muda</span>
              </div>
            </div>
            <div className="x-hero-body">
              <h1>
                <span className="x-h1-line">Ruang Berbagi</span>
                <span className="x-h1-line x-h1-accent">Ide &amp; Kreativitas</span>
              </h1>
              <p className="x-hero-desc" style={{ textAlign: 'left' }}>
                Sukamuda adalah wadah bagi siapa saja yang ingin menulis, membaca,
                dan berdiskusi dalam suasana yang positif, inspiratif, dan membangun.
              </p>
            </div>
            <div className="x-hero-bottom">
              <div className="x-hero-bar" aria-hidden="true" />
            </div>
          </header>

          {/* VISI */}
          <section className={`x-sec ${on('visi') ? 'x-on' : ''}`} id="visi" ref={(e) => reg(e, 'visi')} aria-labelledby="label-visi">
            <div className="x-label-row" id="label-visi">
              <span className="x-label">01</span>
              <span className="x-label-text">Visi</span>
            </div>
            <article className="x-visi">
              <div className="x-visi-deco" aria-hidden="true">
                <div className="x-visi-ring" />
                <div className="x-visi-ring x-visi-ring2" />
                <div className="x-visi-dot" />
              </div>
              <div className="x-visi-body" style={{ textAlign: 'left' }}>
                <h2>Menjadi platform media digital yang mendorong kreativitas, literasi, dan kontribusi positif generasi muda di era digital.</h2>
                <p>Kami percaya setiap suara punya nilai — dan Sukamuda hadir supaya suara itu terdengar, dibaca, dan berdampak nyata.</p>
              </div>
            </article>
          </section>

          {/* MISI */}
          <section className={`x-sec ${on('misi') ? 'x-on' : ''}`} id="misi" ref={(e) => reg(e, 'misi')} aria-labelledby="label-misi">
            <div className="x-label-row" id="label-misi">
              <span className="x-label">02</span>
              <span className="x-label-text">Misi</span>
            </div>
            <div className="x-bento" style={{ textAlign: 'left' }}>
              <article className="x-ben x-ben-wide" style={{ transitionDelay: '0ms' }}>
                <div className="x-ben-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3>Ruang Publikasi Aman &amp; Terpercaya</h3>
                <p>Platform yang menjamin keamanan dan kredibilitas setiap konten yang dipublikasikan.</p>
              </article>
              <article className="x-ben" style={{ transitionDelay: '70ms' }}>
                <div className="x-ben-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  </svg>
                </div>
                <h3>Dorong Berkarya</h3>
                <p>Penulis muda berkembang lewat tulisan.</p>
              </article>
              <article className="x-ben" style={{ transitionDelay: '140ms' }}>
                <div className="x-ben-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <h3>Konten Berkualitas</h3>
                <p>Informatif, edukatif, inspiratif.</p>
              </article>
              <article className="x-ben x-ben-full" style={{ transitionDelay: '210ms' }}>
                <div className="x-ben-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3>Komunitas yang Saling Mendukung</h3>
                <p>Membangun ekosistem digital di mana setiap anggota saling menghargai, menginspirasi, dan bertumbuh bersama tanpa toxic culture.</p>
              </article>
            </div>
          </section>
                    {/* KATEGORI */}
          <section className={`x-sec ${on('kat') ? 'x-on' : ''}`} id="kat" ref={(e) => reg(e, 'kat')} aria-labelledby="label-kat">
            <div className="x-label-row" id="label-kat">
              <span className="x-label">03</span>
              <span className="x-label-text">Kategori</span>
            </div>
            <div className="x-kat-grid" style={{ textAlign: 'left' }}>
              {[
                { n: 'Edukasi', d: 'Pengetahuan yang bermanfaat', c: '#4f46e5' },
                { n: 'Teknologi', d: 'Tren & inovasi terkini', c: '#0891b2' },
                { n: 'Fashion & Kecantikan', d: 'Gaya hidup masa kini', c: '#db2777' },
                { n: 'Opini', d: 'Pemikiran kritis & sudut pandang', c: '#ca8a04' },
                { n: 'Inspirasi', d: 'Cerita yang memotivasi', c: '#059669' },
                { n: 'Gaya Hidup', d: 'Tips hidup lebih baik', c: '#7c3aed' },
              ].map((k, i) => (
                <article className="x-kat" key={i} style={{ '--kc': k.c, transitionDelay: `${i * 55}ms` }}>
                  <div className="x-kat-bar" style={{ background: k.c }} aria-hidden="true" />
                  <h3>{k.n}</h3>
                  <p>{k.d}</p>
                  <svg className="x-kat-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={k.c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="7" y1="17" x2="17" y2="7"/>
                    <polyline points="7 7 17 7 17 17"/>
                  </svg>
                </article>
              ))}
            </div>
            <div className="x-alert" style={{ textAlign: 'left' }} role="status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p>Semua artikel melewati proses kurasi editorial sebelum tayang — kami menjaga kualitas di atas segalanya.</p>
            </div>
          </section>

          {/* CARA KERJA */}
          <section className={`x-sec ${on('how') ? 'x-on' : ''}`} id="how" ref={(e) => reg(e, 'how')} aria-labelledby="label-how">
            <div className="x-label-row" id="label-how">
              <span className="x-label">04</span>
              <span className="x-label-text">Cara Kerja</span>
            </div>
            <div className="x-steps" style={{ textAlign: 'left' }}>
              {[
                { t: 'Daftar Akun', d: 'Buat akun gratis — cuma butuh email dan username.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                { t: 'Tulis Artikel', d: 'Tuangkan ide, opini, atau pengalamanmu dalam format artikel.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> },
                { t: 'Verifikasi', d: 'Tim editorial meninjau kontenmu dalam kurun waktu 1x24 jam.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
                { t: 'Tayang', d: 'Artikelmu live dan bisa dibaca oleh ribuan pembaca.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
              ].map((s, i) => (
                <div className="x-step" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                  <div className="x-step-track">
                    <div className="x-step-circle">{s.ic}</div>
                    {i < 3 && <div className="x-step-line" aria-hidden="true" />}
                  </div>
                  <div className="x-step-body">
                    <span className="x-step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* KOMITMEN */}
          <section className={`x-sec ${on('com') ? 'x-on' : ''}`} id="com" ref={(e) => reg(e, 'com')} aria-labelledby="label-com">
            <div className="x-label-row" id="label-com">
              <span className="x-label">05</span>
              <span className="x-label-text">Komitmen</span>
            </div>
            <div className="x-com-grid" style={{ textAlign: 'left' }}>
              {[
                { t: 'Kualitas Konten', d: 'Zero plagiarisme, 100% orisinal.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
                { t: 'Privasi Pengguna', d: 'Data kamu prioritas utama kami.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
                { t: 'Pengalaman Membaca', d: 'Interface bersih, loading cepat.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                { t: 'Berkelanjutan', d: 'Platform terus berkembang dan membaik.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
              ].map((c, i) => (
                <article className="x-com" key={i} style={{ transitionDelay: `${i * 70}ms` }}>
                  <div className="x-com-ic">{c.ic}</div>
                  <div>
                    <h4>{c.t}</h4>
                    <p>{c.d}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className={`x-sec ${on('cta') ? 'x-on' : ''}`} id="cta" ref={(e) => reg(e, 'cta')} aria-label="Call to Action">
            <div className="x-cta">
              <div className="x-cta-accent" aria-hidden="true" />
              <h2>Mulai Berkarya<br />Bersama Kami</h2>
              <p>Gabung bareng ribuan anak muda yang sudah mulai menulis di Sukamuda.</p>
              <div className="x-cta-btns">
                <button className="x-btn-p" type="button" onClick={() => navigate('/write')}>
                  Mulai Menulis
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
                <button className="x-btn-s" type="button" onClick={() => navigate('/faq')}>Pelajari Dulu</button>
              </div>
              <span className="x-cta-note">
                <span className="x-cta-dot" aria-hidden="true" />
                Gratis — Tanpa Komitmen
              </span>
            </div>
          </section>

        </main>

        {/* FOOTER LANDMARK */}
        <footer className="x-foot">
          <div className="x-foot-line" aria-hidden="true" />
          <div className="x-foot-in">
            <span className="x-foot-logo">sukamuda</span>
            
            {/* SOCIAL MEDIA ACCESSIBLE LINKS (Dengan <title> di dalam SVG) */}
            <div className="x-foot-socials">
              <a href="https://threads.net/@sukamuda" aria-label="Follow us on Threads" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img">
                  <title>Threads</title>
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.625 15.188c-1.56.09-3.21-.498-3.793-1.84-.253-.585-.3-1.25-.3-2.025v-.607c.074-1.61.85-2.828 2.22-3.136.634-.143 1.29-.074 1.884.2.535.247.935.688 1.157 1.25.176.446.223.948.223 1.492 0 1.572-.942 2.766-2.316 2.977-.527.08-1.047-.07-1.442-.423l-.155-.138c-.31.336-.723.51-1.164.51-.837 0-1.528-.65-1.528-1.527 0-.756.495-1.393 1.185-1.543.516-.11 1.053-.02 1.503.25l.135.08v-.15c0-.853-.47-1.383-1.267-1.383-.497 0-.964.21-1.26.58-.16.202-.455.234-.658.072-.202-.16-.233-.455-.072-.658.455-.572 1.196-.9 1.99-.9 1.47 0 2.457 1.01 2.457 2.29v3.083c0 .273.064.44.175.52.122.09.3.11.475.05.518-.173.837-.803.837-1.66 0-2.45-1.9-4.225-4.475-4.225-3.056 0-5.183 2.19-5.183 5.342v.425c0 3.197 2.203 5.4 5.353 5.4 1.05 0 2.053-.25 2.875-.71.218-.12.493-.046.615.17.12.217.047.493-.17.615-.96.536-2.122.825-3.32.825zm-2.418-5.323c-.35 0-.64.275-.64.62 0 .343.29.62.64.62s.642-.277.642-.62c0-.345-.29-.62-.642-.62z" />
                </svg>
              </a>
              <a href="https://instagram.com/sukamuda" aria-label="Follow us on Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img">
                  <title>Instagram</title>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://twitter.com/sukamuda" aria-label="Follow us on Twitter" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img">
                  <title>Twitter</title>
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
            </div>

            <span className="x-foot-c">© {new Date().getFullYear()} — Dibuat untuk generasi muda Indonesia</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default About;