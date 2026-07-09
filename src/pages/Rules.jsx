import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rules.css';

const Rules = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(new Set());
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((p) => new Set([...p, e.target.id]));
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  const reg = (el, id) => {
    if (el && !refs.current.find((r) => r?.id === id)) refs.current.push(el);
  };
  const on = (id) => visible.has(id);

  return (
    <div className="ru-root">
      <div className="ru-grid-bg" />

      <div className="ru-wrap">

        {/* NAV */}
        <nav className={`ru-nav ${on('nav') ? 'ru-on' : ''}`} id="nav" ref={(e) => reg(e, 'nav')}>
          <button className="ru-back" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span className="ru-nav-title">Kebijakan & Privasi</span>
          <div className="ru-nav-right">
            <span className="ru-nav-line" />
            <span className="ru-nav-tag">Legal</span>
          </div>
        </nav>

        {/* HERO */}
        <header className={`ru-hero ${on('hero') ? 'ru-on' : ''}`} id="hero" ref={(e) => reg(e, 'hero')}>
          <div className="ru-hero-top">
            <div className="ru-hero-badge">
              <span className="ru-badge-dot" />
              <span>Dokumen Hukum</span>
            </div>
          </div>
          <div className="ru-hero-body">
            <h1>
              <span className="ru-h1-line">Kebijakan Privasi &</span>
              <span className="ru-h1-line ru-h1-accent">Kebijakan Penggunaan</span>
            </h1>
            <p className="ru-hero-date">Update Terakhir: April 2026</p>
          </div>
          <div className="ru-hero-bottom">
            <div className="ru-hero-bar" />
          </div>
        </header>

        {/* ═══ SECTION 1: KEBIJAKAN PRIVASI ═══ */}
        <section className={`ru-section ${on('sec1') ? 'ru-on' : ''}`} id="sec1" ref={(e) => reg(e, 'sec1')}>
          <div className="ru-sec-head">
            <div className="ru-sec-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2>Kebijakan Privasi</h2>
          </div>

          <div className="ru-items">
            <div className="ru-item" style={{ transitionDelay: '0ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">01</span>
                <h3>Informasi Umum</h3>
              </div>
              <div className="ru-item-body">
                <p>Sukamuda berkomitmen untuk melindungi privasi dan keamanan data setiap pengguna yang mengakses dan menggunakan layanan di website ini.</p>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '40ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">02</span>
                <h3>Informasi yang Kami Kumpulkan</h3>
              </div>
              <div className="ru-item-body">
                <p className="ru-intro">Kami dapat mengumpulkan beberapa jenis informasi, antara lain:</p>
                <ul>
                  <li>Nama dan alamat email saat pendaftaran atau pengiriman artikel</li>
                  <li>Data aktivitas pengguna di website</li>
                  <li>Informasi perangkat, browser, dan alamat IP</li>
                  <li>Konten yang dikirim seperti artikel, komentar, atau media lainnya</li>
                </ul>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '80ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">03</span>
                <h3>Penggunaan Informasi</h3>
              </div>
              <div className="ru-item-body">
                <p className="ru-intro">Informasi yang dikumpulkan digunakan untuk:</p>
                <ul>
                  <li>Mengelola akun pengguna</li>
                  <li>Proses verifikasi dan publikasi konten</li>
                  <li>Meningkatkan kualitas layanan dan fitur website</li>
                  <li>Menjaga keamanan sistem dan mencegah penyalahgunaan</li>
                </ul>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '120ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">04</span>
                <h3>Perlindungan Data Pengguna</h3>
              </div>
              <div className="ru-item-body">
                <p>Kami menjaga keamanan data pengguna dengan sistem perlindungan yang wajar dan sesuai standar untuk mencegah akses, penggunaan, atau perubahan data tanpa izin.</p>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '160ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">05</span>
                <h3>Cookie</h3>
              </div>
              <div className="ru-item-body">
                <p>Website Sukamuda menggunakan cookie untuk meningkatkan pengalaman pengguna, seperti menyimpan preferensi, data login, dan analisis penggunaan website.</p>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '200ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">06</span>
                <h3>Pembagian Data kepada Pihak Ketiga</h3>
              </div>
              <div className="ru-item-body">
                <p>Kami tidak menjual, menukar, atau menyewakan data pribadi pengguna kepada pihak ketiga. Data hanya dapat dibagikan apabila diperlukan oleh hukum atau kepentingan keamanan operasional.</p>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '240ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">07</span>
                <h3>Hak Pengguna</h3>
              </div>
              <div className="ru-item-body">
                <ul>
                  <li>Mengakses, memperbarui, atau memperbaiki data pribadi</li>
                  <li>Menghapus akun dan data terkait</li>
                  <li>Menarik persetujuan penggunaan data</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div className={`ru-divider ${on('div') ? 'ru-on' : ''}`} id="div" ref={(e) => reg(e, 'div')}>
          <div className="ru-divider-line" />
          <span className="ru-divider-dot" />
          <div className="ru-divider-line" />
        </div>

        {/* ═══ SECTION 2: KEBIJAKAN PENGGUNAAN ═══ */}
        <section className={`ru-section ${on('sec2') ? 'ru-on' : ''}`} id="sec2" ref={(e) => reg(e, 'sec2')}>
          <div className="ru-sec-head">
            <div className="ru-sec-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h2>Kebijakan Penggunaan</h2>
          </div>

          <div className="ru-items">
            <div className="ru-item" style={{ transitionDelay: '0ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">01</span>
                <h3>Kebijakan Konten</h3>
              </div>
              <div className="ru-item-body">
                <ul>
                  <li>Pengguna dapat mengirim artikel sesuai kategori yang tersedia.</li>
                  <li>Konten harus orisinal, informatif, dan tidak melanggar hukum.</li>
                  <li>Konten akan melalui proses verifikasi sebelum dipublikasikan.</li>
                </ul>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '40ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">02</span>
                <h3>Larangan Konten</h3>
              </div>
              <div className="ru-item-body">
                <p className="ru-intro">Dilarang mengunggah konten yang mengandung:</p>
                <ul>
                  <li>Ujaran kebencian (SARA), Pornografi, atau Kekerasan</li>
                  <li>Hoaks atau informasi menyesatkan</li>
                  <li>Plagiarisme atau pelanggaran hak cipta</li>
                  <li>Spam dan promosi berlebihan tanpa izin</li>
                </ul>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '80ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">03</span>
                <h3>Kebijakan Komentar dan Interaksi</h3>
              </div>
              <div className="ru-item-body">
                <p>Pengguna wajib menjaga kesopanan, komentar harus relevan, dan yang melanggar akan dihapus tanpa pemberitahuan.</p>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '120ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">04</span>
                <h3>Hak Cipta</h3>
              </div>
              <div className="ru-item-body">
                <p>Konten tetap milik penulis, namun pengguna memberikan izin kepada Sukamuda untuk menampilkan dan mempublikasikan konten di platform.</p>
              </div>
            </div>

            <div className="ru-item" style={{ transitionDelay: '160ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">05</span>
                <h3>Sanksi Pelanggaran</h3>
              </div>
              <div className="ru-item-body">
                <p>Pelanggaran dapat mengakibatkan peringatan, penghapusan konten, hingga pemblokiran permanen akun.</p>
              </div>
            </div>

            <div className="ru-item ru-item-closing" style={{ transitionDelay: '200ms' }}>
              <div className="ru-item-head">
                <span className="ru-item-num">06</span>
                <h3>Penutup</h3>
              </div>
              <div className="ru-item-body">
                <p>Dengan menggunakan Sukamuda, pengguna dianggap menyetujui seluruh Kebijakan Privasi dan Penggunaan yang berlaku.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ru-foot">
          <div className="ru-foot-line" />
          <div className="ru-foot-in">
            <span className="ru-foot-logo">sukamuda</span>
            <span className="ru-foot-c">© {new Date().getFullYear()} — Dibuat untuk generasi muda Indonesia</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Rules;