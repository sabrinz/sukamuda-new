import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Terms.css';

const Terms = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(new Set());
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible((p) => new Set([...p, e.target.id]));
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    refs.current.forEach((r) => r && io.observe(r));

    return () => io.disconnect();
  }, []);

  const reg = (el, id) => {
    if (el && !refs.current.find((r) => r?.id === id)) {
      refs.current.push(el);
    }
  };

  const on = (id) => visible.has(id);

  return (
    <div className="tr-root">
      <Helmet>
        {/* Script Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7608424206122269"
          crossOrigin="anonymous"
        ></script>

        <title>Syarat & Ketentuan - Sukamuda</title>

        <link
          rel="canonical"
          href="https://sukamuda.co.id/terms"
        />

        <meta
          name="description"
          content="Syarat dan Ketentuan Penggunaan platform media digital Sukamuda."
        />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Syarat dan Ketentuan Penggunaan",
            "description": "Syarat dan Ketentuan Penggunaan platform media digital Sukamuda.",
            "url": "https://sukamuda.co.id/terms",
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
                "name": "Syarat & Ketentuan"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="tr-grid-bg" aria-hidden="true" />

      <div className="tr-wrap">
        {/* NAV */}
        <nav
          className={`tr-nav ${on('nav') ? 'tr-on' : ''}`}
          id="nav"
          ref={(e) => reg(e, 'nav')}
        >
          <button
            type="button"
            className="tr-back"
            onClick={() => navigate(-1)}
            aria-label="Kembali ke halaman sebelumnya"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <span className="tr-nav-title">Syarat & Ketentuan</span>

          <div className="tr-nav-right">
            <span className="tr-nav-line" aria-hidden="true" />
            <span className="tr-nav-tag">Legal</span>
          </div>
        </nav>

        {/* HERO */}
        <header
          className={`tr-hero ${on('hero') ? 'tr-on' : ''}`}
          id="hero"
          ref={(e) => reg(e, 'hero')}
        >
          <div className="tr-hero-top">
            <div className="tr-hero-badge">
              <span className="tr-badge-dot" aria-hidden="true" />
              <span>Dokumen Hukum</span>
            </div>
          </div>

          <div className="tr-hero-body">
            <h1>
              <span className="tr-h1-line">
                Syarat & Ketentuan
              </span>

              <span className="tr-h1-line tr-h1-accent">
                Penggunaan Sukamuda
              </span>
            </h1>

            <p className="tr-hero-date">
              Update Terakhir: Juli 2026
            </p>
          </div>

          <div className="tr-hero-bottom">
            <div className="tr-hero-bar" aria-hidden="true" />
          </div>
        </header>

        {/* CONTENT */}
        <main
          className={`tr-content ${on('content') ? 'tr-on' : ''}`}
          id="content"
          ref={(e) => reg(e, 'content')}
          style={{ textAlign: 'left' }}
        >
          {/* 1 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '0ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                01
              </span>

              <h2>Ketentuan Umum</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Dengan mengakses dan menggunakan website Sukamuda,
                Anda dianggap telah membaca, memahami, dan menyetujui
                seluruh Syarat dan Ketentuan yang berlaku. Jika Anda
                tidak setuju dengan ketentuan ini, mohon untuk tidak
                menggunakan layanan website.
              </p>
            </div>
          </div>

          {/* 2 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '40ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                02
              </span>

              <h2>Definisi Layanan</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Sukamuda merupakan platform yang menyediakan konten,
                artikel, dan informasi untuk pengguna. Layanan dapat
                diperbarui, diubah, atau dihentikan sewaktu-waktu
                tanpa pemberitahuan sebelumnya.
              </p>
            </div>
          </div>

          {/* 3 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '80ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                03
              </span>

              <h2>Akun Pengguna</h2>
            </div>

            <div className="tr-item-body">
              <ul>
                <li>
                  Pengguna bertanggung jawab atas keamanan akun
                  masing-masing.
                </li>

                <li>
                  Dilarang menggunakan identitas palsu atau data
                  yang tidak valid.
                </li>

                <li>
                  Segala aktivitas yang terjadi pada akun menjadi
                  tanggung jawab pengguna.
                </li>
              </ul>
            </div>
          </div>

          {/* 4 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '120ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                04
              </span>

              <h2>Konten Pengguna</h2>
            </div>

            <div className="tr-item-body">
              <ul>
                <li>
                  Pengguna diperbolehkan mengirim artikel, komentar,
                  atau konten lainnya sesuai kategori yang tersedia.
                </li>

                <li>
                  Konten yang dikirim tidak boleh mengandung unsur
                  SARA, pornografi, kekerasan, hoaks, atau melanggar
                  hukum.
                </li>

                <li>
                  Setiap konten yang dikirim akan melalui proses
                  verifikasi sebelum dipublikasikan.
                </li>
              </ul>
            </div>
          </div>

          {/* 5 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '160ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                05
              </span>

              <h2>Hak dan Kewajiban</h2>
            </div>

            <div className="tr-item-body">
              <div className="tr-sub">
                <h3>Hak Pengguna</h3>

                <ul>
                  <li>
                    Mengakses dan membaca konten yang tersedia.
                  </li>

                  <li>
                    Mengirimkan artikel sesuai ketentuan platform.
                  </li>
                </ul>
              </div>

              <div className="tr-sub">
                <h3>Kewajiban Pengguna</h3>

                <ul>
                  <li>
                    Menggunakan layanan secara bijak dan tidak
                    merugikan pihak lain.
                  </li>

                  <li>
                    Menghormati hak cipta dan kekayaan intelektual.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 6 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '200ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                06
              </span>

              <h2>Hak Cipta dan Kekayaan Intelektual</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Hak cipta atas artikel atau konten yang dikirim oleh
                pengguna tetap menjadi milik penulisnya. Dengan
                mengirimkan konten, pengguna memberikan izin kepada
                Sukamuda untuk menampilkan, menyimpan, dan
                mempublikasikan konten tersebut di platform. Elemen
                milik Sukamuda, termasuk desain, logo, identitas
                merek, dan materi yang dibuat oleh pengelola, tidak
                boleh disalin atau digunakan tanpa izin.
              </p>
            </div>
          </div>

          {/* 7 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '240ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                07
              </span>

              <h2>Larangan Penggunaan</h2>
            </div>

            <div className="tr-item-body">
              <p className="tr-intro">Pengguna dilarang:</p>

              <ul>
                <li>
                  Melakukan spam, hacking, atau aktivitas yang
                  merusak sistem.
                </li>

                <li>
                  Menyebarkan informasi palsu atau menyesatkan.
                </li>

                <li>
                  Menggunakan platform untuk kepentingan ilegal.
                </li>
              </ul>
            </div>
          </div>

          {/* 8 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '280ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                08
              </span>

              <h2>Penangguhan dan Penghapusan Konten</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Pengelola berhak menolak, menunda, atau menghapus
                konten yang tidak sesuai dengan kebijakan, serta
                menangguhkan akun pengguna yang melanggar ketentuan.
              </p>
            </div>
          </div>

          {/* 9 */}
          <div
            className="tr-item"
            style={{ transitionDelay: '320ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                09
              </span>

              <h2>Perubahan Syarat dan Ketentuan</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Syarat dan Ketentuan dapat diperbarui sewaktu-waktu.
                Pengguna disarankan untuk meninjau halaman ini secara
                berkala.
              </p>
            </div>
          </div>

          {/* 10 — PENUTUP */}
          <div
            className="tr-item tr-item-closing"
            style={{ transitionDelay: '360ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                10
              </span>

              <h2>Penutup</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Dengan menggunakan website Sukamuda, Anda menyetujui
                seluruh kebijakan yang berlaku dan siap mematuhi
                aturan demi menjaga kenyamanan serta keamanan bersama
                di platform.
              </p>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="tr-foot">
          <div className="tr-foot-line" aria-hidden="true" />

          <div className="tr-foot-in">
            <span className="tr-foot-logo">sukamuda</span>

            <span className="tr-foot-c">
              © {new Date().getFullYear()} — Dibuat untuk generasi
              muda Indonesia
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Terms;