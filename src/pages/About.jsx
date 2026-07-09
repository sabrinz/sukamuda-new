import React, { useEffect, useRef, useState } from 'react';
import './About.css';

const About = () => {
  const [visible, setVisible] = useState(new Set());
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

  const reg = (el, id) => {
    if (el && !refs.current.find((r) => r?.id === id)) refs.current.push(el);
  };
  const on = (id) => visible.has(id);

  return (
    <div className="x-root">
      <div className="x-grid-bg" />

      <div className="x-wrap">

        {/* NAV */}
        <nav className={`x-nav ${on('nav') ? 'x-on' : ''}`} id="nav" ref={(e) => reg(e, 'nav')}>
          <span className="x-logo">sukamuda</span>
          <div className="x-nav-right">
            <span className="x-nav-line" />
            <span className="x-nav-tag">About</span>
          </div>
        </nav>

        {/* HERO */}
        <header className={`x-hero ${on('hero') ? 'x-on' : ''}`} id="hero" ref={(e) => reg(e, 'hero')}>
          <div className="x-hero-top">
            <div className="x-hero-badge">
              <span className="x-badge-dot" />
              <span>Platform Digital untuk Generasi Muda</span>
            </div>
          </div>
          <div className="x-hero-body">
            <h1>
              <span className="x-h1-line">Ruang Berbagi</span>
              <span className="x-h1-line x-h1-accent">Ide &amp; Kreativitas</span>
            </h1>
            <p className="x-hero-desc">
              Sukamuda adalah wadah bagi siapa saja yang ingin menulis, membaca,
              dan berdiskusi dalam suasana yang positif, inspiratif, dan membangun.
            </p>
          </div>
          <div className="x-hero-bottom">
            <div className="x-hero-bar" />
          </div>
        </header>

        {/* VISI */}
        <section className={`x-sec ${on('visi') ? 'x-on' : ''}`} id="visi" ref={(e) => reg(e, 'visi')}>
          <div className="x-label-row">
            <span className="x-label">01</span>
            <span className="x-label-text">Visi</span>
          </div>
          <div className="x-visi">
            <div className="x-visi-deco">
              <div className="x-visi-ring" />
              <div className="x-visi-ring x-visi-ring2" />
              <div className="x-visi-dot" />
            </div>
            <div className="x-visi-body">
              <h2>Menjadi platform media digital yang mendorong kreativitas, literasi, dan kontribusi positif generasi muda di era digital.</h2>
              <p>Kami percaya setiap suara punya nilai — dan Sukamuda hadir supaya suara itu terdengar, dibaca, dan berdampak nyata.</p>
            </div>
          </div>
        </section>

        {/* MISI */}
        <section className={`x-sec ${on('misi') ? 'x-on' : ''}`} id="misi" ref={(e) => reg(e, 'misi')}>
          <div className="x-label-row">
            <span className="x-label">02</span>
            <span className="x-label-text">Misi</span>
          </div>
          <div className="x-bento">
            <div className="x-ben x-ben-wide" style={{ transitionDelay: '0ms' }}>
              <div className="x-ben-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Ruang Publikasi Aman &amp; Terpercaya</h3>
              <p>Platform yang menjamin keamanan dan kredibilitas setiap konten yang dipublikasikan.</p>
            </div>
            <div className="x-ben" style={{ transitionDelay: '70ms' }}>
              <div className="x-ben-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </div>
              <h3>Dorong Berkarya</h3>
              <p>Penulis muda berkembang lewat tulisan.</p>
            </div>
            <div className="x-ben" style={{ transitionDelay: '140ms' }}>
              <div className="x-ben-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <h3>Konten Berkualitas</h3>
              <p>Informatif, edukatif, inspiratif.</p>
            </div>
            <div className="x-ben x-ben-full" style={{ transitionDelay: '210ms' }}>
              <div className="x-ben-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Komunitas yang Saling Mendukung</h3>
              <p>Membangun ekosistem digital di mana setiap anggota saling menghargai, menginspirasi, dan bertumbuh bersama tanpa toxic culture.</p>
            </div>
          </div>
        </section>

        {/* KATEGORI */}
        <section className={`x-sec ${on('kat') ? 'x-on' : ''}`} id="kat" ref={(e) => reg(e, 'kat')}>
          <div className="x-label-row">
            <span className="x-label">03</span>
            <span className="x-label-text">Kategori</span>
          </div>
          <div className="x-kat-grid">
            {[
              { n: 'Edukasi', d: 'Pengetahuan yang bermanfaat', c: '#4f46e5' },
              { n: 'Teknologi', d: 'Tren & inovasi terkini', c: '#0891b2' },
              { n: 'Fashion & Kecantikan', d: 'Gaya hidup masa kini', c: '#db2777' },
              { n: 'Opini', d: 'Pemikiran kritis & sudut pandang', c: '#ca8a04' },
              { n: 'Inspirasi', d: 'Cerita yang memotivasi', c: '#059669' },
              { n: 'Gaya Hidup', d: 'Tips hidup lebih baik', c: '#7c3aed' },
            ].map((k, i) => (
              <div className="x-kat" key={i} style={{ '--kc': k.c, transitionDelay: `${i * 55}ms` }}>
                <div className="x-kat-bar" style={{ background: k.c }} />
                <h3>{k.n}</h3>
                <p>{k.d}</p>
                <svg className="x-kat-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={k.c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </div>
            ))}
          </div>
          <div className="x-alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <p>Semua artikel melewati proses kurasi editorial sebelum tayang — kami menjaga kualitas di atas segalanya.</p>
          </div>
        </section>

        {/* CARA KERJA */}
        <section className={`x-sec ${on('how') ? 'x-on' : ''}`} id="how" ref={(e) => reg(e, 'how')}>
          <div className="x-label-row">
            <span className="x-label">04</span>
            <span className="x-label-text">Cara Kerja</span>
          </div>
          <div className="x-steps">
            {[
              { t: 'Daftar Akun', d: 'Buat akun gratis — cuma butuh email dan username.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { t: 'Tulis Artikel', d: 'Tuangkan ide, opini, atau pengalamanmu dalam format artikel.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> },
              { t: 'Verifikasi', d: 'Tim editorial meninjau kontenmu dalam kurun waktu 1x24 jam.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { t: 'Tayang', d: 'Artikelmu live dan bisa dibaca oleh ribuan pembaca.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
            ].map((s, i) => (
              <div className="x-step" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="x-step-track">
                  <div className="x-step-circle">{s.ic}</div>
                  {i < 3 && <div className="x-step-line" />}
                </div>
                <div className="x-step-body">
                  <span className="x-step-n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KOMITMEN */}
        <section className={`x-sec ${on('com') ? 'x-on' : ''}`} id="com" ref={(e) => reg(e, 'com')}>
          <div className="x-label-row">
            <span className="x-label">05</span>
            <span className="x-label-text">Komitmen</span>
          </div>
          <div className="x-com-grid">
            {[
              { t: 'Kualitas Konten', d: 'Zero plagiarisme, 100% orisinal.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
              { t: 'Privasi Pengguna', d: 'Data kamu prioritas utama kami.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
              { t: 'Pengalaman Membaca', d: 'Interface bersih, loading cepat.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
              { t: 'Berkelanjutan', d: 'Platform terus berkembang dan membaik.', ic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
            ].map((c, i) => (
              <div className="x-com" key={i} style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="x-com-ic">{c.ic}</div>
                <div>
                  <h4>{c.t}</h4>
                  <p>{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={`x-sec ${on('cta') ? 'x-on' : ''}`} id="cta" ref={(e) => reg(e, 'cta')}>
          <div className="x-cta">
            <div className="x-cta-accent" />
            <h2>Mulai Berkarya<br />Bersama Kami</h2>
            <p>Gabung bareng ribuan anak muda yang sudah mulai menulis di Sukamuda.</p>
            <div className="x-cta-btns">
              <button className="x-btn-p">
                Mulai Menulis
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button className="x-btn-s">Pelajari Dulu</button>
            </div>
            <span className="x-cta-note">
              <span className="x-cta-dot" />
              Gratis — Tanpa Komitmen
            </span>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="x-foot">
          <div className="x-foot-line" />
          <div className="x-foot-in">
            <span className="x-foot-logo">sukamuda</span>
            <span className="x-foot-c">© {new Date().getFullYear()} — Dibuat untuk generasi muda Indonesia</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default About;