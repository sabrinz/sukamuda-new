import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Faq.css';

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [visible, setVisible] = useState(new Set());
  const refs = useRef([]);

  const faqData = [
    { q: "Apa itu SukaMuda?", a: "SukaMuda adalah platform media informasi dan wadah kreativitas bagi anak muda untuk berbagi berita, gaya hidup, hingga hobi." },
    { q: "Siapa saja yang boleh membaca/menggunakan web ini?", a: "Siapa saja! Walaupun fokusnya untuk anak muda (pelajar/mahasiswa), konten kami terbuka untuk umum." },
    { q: "Bagaimana cara saya mengirim artikel?", a: "Kamu harus masuk (Login) terlebih dahulu, klik menu Write, isi kategori, judul, dan konten tulisanmu, lalu tekan kirim." },
    { q: "Kategori apa saja yang tersedia?", a: "Kami memiliki beragam rubrik mulai dari News, Lifestyle, Sport, Music & Film, Otomotif, Science, hingga Health." },
    { q: "Bolehkah saya menyertakan gambar di artikel?", a: "Tentu! Kamu wajib mengunggah thumbnail dan bisa menambahkan gambar di dalam isi artikel melalui editor yang tersedia." },
    { q: "Apakah tulisan saya langsung terbit?", a: "Setiap tulisan akan masuk ke sistem kami terlebih dahulu untuk dipastikan tidak melanggar aturan komunitas." },
    { q: "Apakah mendaftar di SukaMuda gratis?", a: "Ya, pendaftaran akun di SukaMuda 100% gratis." },
    { q: "Bagaimana jika saya lupa kata sandi?", a: "Kamu bisa menghubungi tim bantuan kami melalui halaman kontak atau menggunakan fitur reset password (jika sudah tersedia)." },
    { q: "Apakah data pribadi saya aman?", a: "Kami menjaga privasi pengguna dengan ketat sesuai dengan kebijakan Privacy Policy kami." },
    { q: "Hal apa saja yang dilarang dalam penulisan artikel?", a: "Dilarang keras memposting konten yang mengandung SARA, ujaran kebencian, pornografi, atau berita bohong (hoax)." },
    { q: "Bagaimana jika saya melihat konten yang tidak pantas?", a: "Kamu bisa melaporkannya kepada admin melalui menu Bantuan agar segera kami tindak lanjuti." },
  ];

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((p) => new Set([...p, e.target.id]));
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -10px 0px' }
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  const reg = (el, id) => {
    if (el && !refs.current.find((r) => r?.id === id)) refs.current.push(el);
  };
  const on = (id) => visible.has(id);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="fq-root">
      <div className="fq-grid-bg" />

      <div className="fq-wrap">

        {/* NAV */}
        <nav className={`fq-nav ${on('nav') ? 'fq-on' : ''}`} id="nav" ref={(e) => reg(e, 'nav')}>
          <button className="fq-back" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span className="fq-nav-title">FAQ</span>
          <div className="fq-nav-right">
            <span className="fq-nav-line" />
            <span className="fq-nav-tag">Help</span>
          </div>
        </nav>

        {/* HERO */}
        <header className={`fq-hero ${on('hero') ? 'fq-on' : ''}`} id="hero" ref={(e) => reg(e, 'hero')}>
          <div className="fq-hero-top">
            <div className="fq-hero-badge">
              <span className="fq-badge-dot" />
              <span>Pertanyaan Umum</span>
            </div>
          </div>
          <div className="fq-hero-body">
            <h1>
              <span className="fq-h1-line">Frequently Asked</span>
              <span className="fq-h1-line fq-h1-accent">Questions</span>
            </h1>
            <p className="fq-hero-desc">
              Temukan jawaban untuk pertanyaan yang paling sering ditanyakan seputar Sukamuda.
            </p>
          </div>
          <div className="fq-hero-bottom">
            <div className="fq-hero-bar" />
          </div>
        </header>

        {/* FAQ LIST */}
        <section className={`fq-list ${on('list') ? 'fq-on' : ''}`} id="list" ref={(e) => reg(e, 'list')}>
          {faqData.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                id={`faq-${i}`}
                ref={(e) => reg(e, `faq-${i}`)}
                className={`fq-item ${isOpen ? 'fq-item-open' : ''} ${on(`faq-${i}`) ? 'fq-item-vis' : ''}`}
                style={{ transitionDelay: `${i * 35}ms` }}
              >
                <button className="fq-q" onClick={() => toggle(i)}>
                  <div className="fq-q-left">
                    <span className="fq-q-num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{item.q}</span>
                  </div>
                  <span className="fq-q-toggle">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                </button>
                <div className="fq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* HELP TEASER */}
        <section className={`fq-sec ${on('tease') ? 'fq-on' : ''}`} id="tease" ref={(e) => reg(e, 'tease')}>
          <div className="fq-tease-card">
            <div className="fq-tease-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            </div>
            <div className="fq-tease-body">
              <h4>Tidak menemukan jawaban?</h4>
              <p>Hubungi tim kami langsung via email.</p>
            </div>
            <button className="fq-tease-btn" onClick={() => navigate('/help')}>
              Hubungi Kami
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="fq-foot">
          <div className="fq-foot-line" />
          <div className="fq-foot-in">
            <span className="fq-foot-logo">sukamuda</span>
            <span className="fq-foot-c">© {new Date().getFullYear()} — Dibuat untuk generasi muda Indonesia</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default FAQ;