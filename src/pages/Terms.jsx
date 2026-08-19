import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './Terms.css';

const Terms = () => {
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
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    refs.current.forEach((r) => r && io.observe(r));

    return () => io.disconnect();
  }, []);

  const reg = (el, id) => {
    if (
      el &&
      !refs.current.find((r) => r?.id === id)
    ) {
      refs.current.push(el);
    }
  };

  const on = (id) => visible.has(id);

  return (
    <div className="tr-root">
      <Helmet>
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

        <meta
          name="robots"
          content="index, follow"
        />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Syarat & Ketentuan - Sukamuda',
            description:
              'Syarat dan Ketentuan Penggunaan platform media digital Sukamuda.',
            url: 'https://sukamuda.co.id/terms',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Sukamuda',
              url: 'https://sukamuda.co.id',
            },
            inLanguage: 'id-ID',
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: 'https://sukamuda.co.id',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Syarat & Ketentuan',
                item: 'https://sukamuda.co.id/terms',
              },
            ],
          })}
        </script>
      </Helmet>

      <div
        className="tr-grid-bg"
        aria-hidden="true"
      />

      <div className="tr-wrap">

        {/* NAV */}
        <nav
          className={`tr-nav ${
            on('nav') ? 'tr-on' : ''
          }`}
          id="nav"
          ref={(e) => reg(e, 'nav')}
          aria-label="Navigasi Halaman"
        >
          <span className="tr-logo">
            sukamuda
          </span>

          <div className="tr-nav-right">
            <span
              className="tr-nav-line"
              aria-hidden="true"
            />

            <span className="tr-nav-tag">
              Terms
            </span>
          </div>
        </nav>

        {/* MAIN */}
        <main
          className="tr-main"
          id="main-content"
        >

          {/* HERO */}
          <header
            className={`tr-hero ${
              on('hero') ? 'tr-on' : ''
            }`}
            id="hero"
            ref={(e) => reg(e, 'hero')}
          >
            <div className="tr-hero-top">
              <div className="tr-hero-badge">
                <span
                  className="tr-badge-dot"
                  aria-hidden="true"
                />

                <span>
                  Dokumen Hukum & Ketentuan
                </span>
              </div>
            </div>

            <div className="tr-hero-body">
              <h1 className="tr-hero-title">
                <span className="tr-h1-line">
                  Syarat & Ketentuan
                </span>

                <span className="tr-h1-line tr-h1-accent">
                  Penggunaan Sukamuda
                </span>
              </h1>

              <p className="tr-hero-desc">
                Aturan penggunaan yang membantu
                menjaga Sukamuda tetap aman,
                nyaman, dan bermanfaat bagi
                seluruh pengguna.
              </p>

              <div className="tr-hero-date">
                Update Terakhir: Juli 2026
              </div>
            </div>

            <div className="tr-hero-bottom">
              <div
                className="tr-hero-bar"
                aria-hidden="true"
              />
            </div>
          </header>

          {/* KETENTUAN UMUM */}
          <section
            className={`tr-sec ${
              on('general') ? 'tr-on' : ''
            }`}
            id="general"
            ref={(e) => reg(e, 'general')}
            aria-labelledby="label-general"
          >
            <div
              className="tr-label-row"
              id="label-general"
            >
              <span className="tr-label">
                01
              </span>

              <span className="tr-label-text">
                Ketentuan Umum
              </span>
            </div>

            <article className="tr-feature">
              <div className="tr-feature-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>

              <div className="tr-feature-body">
                <h2>
                  Ketentuan Umum Penggunaan
                </h2>

                <p>
                  Dengan mengakses dan menggunakan
                  website Sukamuda, Anda dianggap
                  telah membaca, memahami, dan
                  menyetujui seluruh Syarat dan
                  Ketentuan yang berlaku. Jika Anda
                  tidak setuju dengan ketentuan ini,
                  mohon untuk tidak menggunakan
                  layanan website.
                </p>
              </div>
            </article>
          </section>

          {/* DEFINISI + AKUN */}
          <section
            className={`tr-sec ${
              on('account') ? 'tr-on' : ''
            }`}
            id="account"
            ref={(e) => reg(e, 'account')}
            aria-labelledby="label-account"
          >
            <div
              className="tr-label-row"
              id="label-account"
            >
              <span className="tr-label">
                02
              </span>

              <span className="tr-label-text">
                Layanan & Akun
              </span>
            </div>

            <div className="tr-bento">

              <article
                className="tr-card tr-card-wide"
                style={{
                  transitionDelay: '0ms',
                }}
              >
                <div className="tr-card-icon">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                    <path d="M12 8v8" />
                    <path d="M9 12h6" />
                  </svg>
                </div>

                <h3>
                  Definisi Layanan
                </h3>

                <p>
                  Sukamuda merupakan platform
                  yang menyediakan konten, artikel,
                  dan informasi untuk pengguna.
                  Layanan dapat diperbarui, diubah,
                  atau dihentikan sewaktu-waktu
                  tanpa pemberitahuan sebelumnya.
                </p>
              </article>

              <article
                className="tr-card"
                style={{
                  transitionDelay: '70ms',
                }}
              >
                <div className="tr-card-icon">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                    />
                  </svg>
                </div>

                <h3>
                  Keamanan Akun
                </h3>

                <p>
                  Pengguna bertanggung jawab
                  atas keamanan akun masing-masing.
                </p>
              </article>

              <article
                className="tr-card"
                style={{
                  transitionDelay: '140ms',
                }}
              >
                <div className="tr-card-icon">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2v20" />
                    <path d="M17 5.5A5 5 0 0 0 12 3C9.2 3 7 4.7 7 7c0 3.5 10 2 10 7 0 2.7-2.2 5-5 5a5.6 5.6 0 0 1-5-3" />
                  </svg>
                </div>

                <h3>
                  Data Valid
                </h3>

                <p>
                  Dilarang menggunakan identitas
                  palsu atau data yang tidak valid.
                </p>
              </article>

              <article
                className="tr-card tr-card-wide"
                style={{
                  transitionDelay: '210ms',
                }}
              >
                <div className="tr-card-icon">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                    />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <h3>
                  Tanggung Jawab Pengguna
                </h3>

                <p>
                  Segala aktivitas yang terjadi
                  pada akun menjadi tanggung jawab
                  pengguna.
                </p>
              </article>

            </div>
          </section>

          {/* KONTEN */}
          <section
            className={`tr-sec ${
              on('content') ? 'tr-on' : ''
            }`}
            id="content"
            ref={(e) => reg(e, 'content')}
            aria-labelledby="label-content"
          >
            <div
              className="tr-label-row"
              id="label-content"
            >
              <span className="tr-label">
                03
              </span>

              <span className="tr-label-text">
                Konten Pengguna
              </span>
            </div>

            <div className="tr-content-card">

              <div className="tr-content-heading">
                <div className="tr-content-symbol">
                  03
                </div>

                <div>
                  <h2>
                    Konten yang Dipublikasikan
                  </h2>

                  <p>
                    Setiap konten harus mengikuti
                    standar komunitas Sukamuda.
                  </p>
                </div>
              </div>

              <div className="tr-list-grid">
                <div className="tr-list-item">
                  <span className="tr-list-number">
                    01
                  </span>

                  <p>
                    Pengguna diperbolehkan mengirim
                    artikel, komentar, atau konten
                    lainnya sesuai kategori yang
                    tersedia.
                  </p>
                </div>

                <div className="tr-list-item">
                  <span className="tr-list-number">
                    02
                  </span>

                  <p>
                    Konten yang dikirim tidak boleh
                    mengandung unsur SARA,
                    pornografi, kekerasan, hoaks,
                    atau melanggar hukum.
                  </p>
                </div>

                <div className="tr-list-item">
                  <span className="tr-list-number">
                    03
                  </span>

                  <p>
                    Setiap konten yang dikirim akan
                    melalui proses verifikasi sebelum
                    dipublikasikan.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* HAK & KEWAJIBAN */}
          <section
            className={`tr-sec ${
              on('rights') ? 'tr-on' : ''
            }`}
            id="rights"
            ref={(e) => reg(e, 'rights')}
            aria-labelledby="label-rights"
          >
            <div
              className="tr-label-row"
              id="label-rights"
            >
              <span className="tr-label">
                04
              </span>

              <span className="tr-label-text">
                Hak & Kewajiban
              </span>
            </div>

            <div className="tr-rights-grid">

              <article className="tr-right-card">
                <div className="tr-right-top">
                  <span className="tr-right-index">
                    01
                  </span>

                  <h3>
                    Hak Pengguna
                  </h3>
                </div>

                <ul>
                  <li>
                    Mengakses dan membaca
                    konten yang tersedia.
                  </li>

                  <li>
                    Mengirimkan artikel sesuai
                    ketentuan platform.
                  </li>
                </ul>
              </article>

              <article className="tr-right-card">
                <div className="tr-right-top">
                  <span className="tr-right-index">
                    02
                  </span>

                  <h3>
                    Kewajiban Pengguna
                  </h3>
                </div>

                <ul>
                  <li>
                    Menggunakan layanan secara
                    bijak dan tidak merugikan
                    pihak lain.
                  </li>

                  <li>
                    Menghormati hak cipta dan
                    kekayaan intelektual.
                  </li>
                </ul>
              </article>

            </div>
          </section>

          {/* HAK CIPTA */}
          <section
            className={`tr-sec ${
              on('copyright') ? 'tr-on' : ''
            }`}
            id="copyright"
            ref={(e) => reg(e, 'copyright')}
            aria-labelledby="label-copyright"
          >
            <div
              className="tr-label-row"
              id="label-copyright"
            >
              <span className="tr-label">
                05
              </span>

              <span className="tr-label-text">
                Hak Cipta
              </span>
            </div>

            <article className="tr-feature tr-feature-reverse">

              <div className="tr-feature-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                  <path d="M8 8h8" />
                  <path d="M8 12h8" />
                  <path d="M8 16h5" />
                </svg>
              </div>

              <div className="tr-feature-body">
                <h2>
                  Hak Cipta dan Kekayaan
                  Intelektual
                </h2>

                <p>
                  Hak cipta atas artikel atau konten
                  yang dikirim oleh pengguna tetap
                  menjadi milik penulisnya. Dengan
                  mengirimkan konten, pengguna
                  memberikan izin kepada Sukamuda
                  untuk menampilkan, menyimpan,
                  dan mempublikasikan konten tersebut
                  di platform.
                </p>

                <p className="tr-feature-extra">
                  Elemen milik Sukamuda, termasuk
                  desain, logo, identitas merek, dan
                  materi yang dibuat oleh pengelola,
                  tidak boleh disalin atau digunakan
                  tanpa izin.
                </p>
              </div>

            </article>
          </section>

          {/* LARANGAN */}
          <section
            className={`tr-sec ${
              on('restriction') ? 'tr-on' : ''
            }`}
            id="restriction"
            ref={(e) => reg(e, 'restriction')}
            aria-labelledby="label-restriction"
          >
            <div
              className="tr-label-row"
              id="label-restriction"
            >
              <span className="tr-label">
                06
              </span>

              <span className="tr-label-text">
                Larangan
              </span>
            </div>

            <div className="tr-ban-grid">

              <article
                className="tr-ban-card"
                style={{
                  '--ban-color': '#4f46e5',
                }}
              >
                <div className="tr-ban-number">
                  01
                </div>

                <h3>
                  Sistem & Keamanan
                </h3>

                <p>
                  Melakukan spam, hacking, atau
                  aktivitas yang merusak sistem.
                </p>
              </article>

              <article
                className="tr-ban-card"
                style={{
                  '--ban-color': '#db2777',
                }}
              >
                <div className="tr-ban-number">
                  02
                </div>

                <h3>
                  Informasi Menyesatkan
                </h3>

                <p>
                  Menyebarkan informasi palsu atau
                  menyesatkan.
                </p>
              </article>

              <article
                className="tr-ban-card tr-ban-wide"
                style={{
                  '--ban-color': '#7c3aed',
                }}
              >
                <div className="tr-ban-number">
                  03
                </div>

                <h3>
                  Aktivitas Ilegal
                </h3>

                <p>
                  Menggunakan platform untuk
                  kepentingan ilegal.
                </p>
              </article>

            </div>
          </section>

          {/* MODERASI + PERUBAHAN */}
          <section
            className={`tr-sec ${
              on('management') ? 'tr-on' : ''
            }`}
            id="management"
            ref={(e) => reg(e, 'management')}
            aria-labelledby="label-management"
          >
            <div
              className="tr-label-row"
              id="label-management"
            >
              <span className="tr-label">
                07
              </span>

              <span className="tr-label-text">
                Pengelolaan
              </span>
            </div>

            <div className="tr-bento">

              <article
                className="tr-card"
                style={{
                  transitionDelay: '0ms',
                }}
              >
                <div className="tr-card-icon">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7l-8-4Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                <h3>
                  Moderasi Konten
                </h3>

                <p>
                  Pengelola berhak menolak,
                  menunda, atau menghapus konten
                  yang tidak sesuai dengan kebijakan.
                </p>
              </article>

              <article
                className="tr-card"
                style={{
                  transitionDelay: '70ms',
                }}
              >
                <div className="tr-card-icon">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>

                <h3>
                  Penangguhan Akun
                </h3>

                <p>
                  Akun pengguna dapat ditangguhkan
                  apabila melanggar ketentuan.
                </p>
              </article>

              <article
                className="tr-card tr-card-wide"
                style={{
                  transitionDelay: '140ms',
                }}
              >
                <div className="tr-card-icon">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 12h18" />
                    <path d="M12 3v18" />
                  </svg>
                </div>

                <h3>
                  Perubahan Syarat
                </h3>

                <p>
                  Syarat dan Ketentuan dapat
                  diperbarui sewaktu-waktu.
                  Pengguna disarankan meninjau
                  halaman ini secara berkala.
                </p>
              </article>

            </div>
          </section>

          {/* PENUTUP */}
          <section
            className={`tr-sec ${
              on('closing') ? 'tr-on' : ''
            }`}
            id="closing"
            ref={(e) => reg(e, 'closing')}
            aria-labelledby="label-closing"
          >
            <div
              className="tr-label-row"
              id="label-closing"
            >
              <span className="tr-label">
                08
              </span>

              <span className="tr-label-text">
                Penutup
              </span>
            </div>

            <article className="tr-closing">
              <div className="tr-closing-accent" />

              <div className="tr-closing-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <div className="tr-closing-body">
                <h2>
                  Menjaga Sukamuda Bersama
                </h2>

                <p>
                  Dengan menggunakan website
                  Sukamuda, Anda menyetujui seluruh
                  kebijakan yang berlaku dan siap
                  mematuhi aturan demi menjaga
                  kenyamanan serta keamanan bersama
                  di platform.
                </p>
              </div>
            </article>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="tr-foot">
          <div
            className="tr-foot-line"
            aria-hidden="true"
          />

          <div className="tr-foot-in">
            <span className="tr-foot-logo">
              sukamuda
            </span>

            <span className="tr-foot-c">
              © {new Date().getFullYear()} —
              Dibuat untuk generasi muda Indonesia
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Terms;