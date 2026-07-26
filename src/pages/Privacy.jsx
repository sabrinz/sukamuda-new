import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Terms.css';

const Privacy = () => {
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
        <title>Kebijakan Privasi - Sukamuda</title>

        <link
          rel="canonical"
          href="https://sukamuda.co.id/privacy"
        />

        <meta
          name="description"
          content="Kebijakan Privasi Sukamuda: bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda, termasuk penggunaan cookies, Google Analytics, dan Google AdSense."
        />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Kebijakan Privasi",
            "description": "Kebijakan Privasi platform media digital Sukamuda.",
            "url": "https://sukamuda.co.id/privacy",
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
                "name": "Kebijakan Privasi"
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

          <span className="tr-nav-title">Kebijakan Privasi</span>

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
                Kebijakan Privasi
              </span>

              <span className="tr-h1-line tr-h1-accent">
                Sukamuda
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
          <div
            className="tr-item"
            style={{ transitionDelay: '0ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                01
              </span>

              <h2>Pendahuluan</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Sukamuda (sukamuda.co.id) menghormati dan melindungi privasi setiap pengunjung. Halaman ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan layanan kami. Dengan mengakses website ini, Anda menyetujui praktik yang dijelaskan dalam Kebijakan Privasi ini.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '40ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                02
              </span>

              <h2>Informasi yang Kami Kumpulkan</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Saat Anda mendaftar akun, kami mengumpulkan nama, alamat email, dan kata sandi (tersimpan terenkripsi). Saat Anda menggunakan website, kami juga menerima data teknis secara otomatis seperti alamat IP, jenis perangkat, jenis browser, dan halaman yang Anda kunjungi.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '80ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                03
              </span>

              <h2>Penggunaan Informasi</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Informasi digunakan untuk: mengelola akun dan login Anda, menampilkan konten yang relevan, mengirim email verifikasi (OTP) dan pemberitahuan, meningkatkan kualitas layanan, serta menjaga keamanan website dari penyalahgunaan.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '120ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                04
              </span>

              <h2>Cookies dan Teknologi Serupa</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Sukamuda menggunakan cookies dan penyimpanan lokal (local storage) untuk menjaga sesi login Anda dan mengingat preferensi Anda. Anda dapat menonaktifkan cookies melalui pengaturan browser, namun sebagian fitur website mungkin tidak berfungsi dengan baik.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '160ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                05
              </span>

              <h2>Google Analytics</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Kami menggunakan Google Analytics untuk memahami bagaimana pengunjung menggunakan website, seperti halaman yang paling banyak dibaca dan lama kunjungan. Data ini bersifat anonim dan tidak digunakan untuk mengidentifikasi Anda secara pribadi. Informasi lebih lanjut dapat dibaca di kebijakan privasi Google.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '200ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                06
              </span>

              <h2>Iklan dan Google AdSense</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Website ini menampilkan iklan yang disediakan oleh Google AdSense. Google sebagai vendor pihak ketiga menggunakan cookies (termasuk cookie DoubleClick) untuk menayangkan iklan berdasarkan kunjungan Anda ke website ini dan website lain di internet. Anda dapat menonaktifkan iklan yang dipersonalisasi melalui halaman Setelan Iklan Google di adssettings.google.com, atau mengunjungi www.aboutads.info untuk memilih keluar dari cookie iklan pihak ketiga.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '240ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                07
              </span>

              <h2>Berbagi Data dengan Pihak Ketiga</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak mana pun. Data hanya dibagikan kepada penyedia layanan yang membantu operasional website (seperti Google Analytics dan Google AdSense) atau apabila diwajibkan oleh hukum yang berlaku di Indonesia.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '280ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                08
              </span>

              <h2>Keamanan dan Penyimpanan Data</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data Anda, termasuk enkripsi kata sandi dan pembatasan akses. Namun perlu dipahami bahwa tidak ada transmisi data melalui internet yang sepenuhnya bebas risiko.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '320ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                09
              </span>

              <h2>Hak Anda</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Anda berhak mengakses dan memperbarui data profil Anda kapan saja melalui halaman profil, serta berhak menghapus akun Anda beserta data yang terkait. Untuk permintaan lain terkait data pribadi, silakan hubungi kami melalui kontak di bawah.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '360ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                10
              </span>

              <h2>Privasi Anak-Anak</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Layanan kami tidak ditujukan untuk anak di bawah usia 13 tahun. Kami tidak dengan sengaja mengumpulkan data pribadi dari anak-anak. Jika Anda meyakini seorang anak telah memberikan data pribadinya kepada kami, silakan hubungi kami agar data tersebut dapat dihapus.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '400ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                11
              </span>

              <h2>Perubahan Kebijakan</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Kebijakan Privasi ini dapat diperbarui sewaktu-waktu mengikuti perkembangan layanan dan peraturan. Perubahan akan dipublikasikan di halaman ini dengan tanggal pembaruan terbaru. Kami menyarankan Anda meninjau halaman ini secara berkala.
              </p>
            </div>
          </div>

          <div
            className="tr-item"
            style={{ transitionDelay: '440ms' }}
          >
            <div className="tr-item-head">
              <span className="tr-item-num" aria-hidden="true">
                12
              </span>

              <h2>Kontak</h2>
            </div>

            <div className="tr-item-body">
              <p>
                Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau penggunaan data Anda, silakan hubungi kami melalui email sukamuda50@gmail.com atau melalui halaman Bantuan.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Privacy;
