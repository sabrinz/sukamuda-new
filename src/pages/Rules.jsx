import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './Rules.css';

const Rules = () => {
  const [visible, setVisible] = useState(new Set());
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => {
              const next = new Set(prev);
              next.add(entry.target.id);
              return next;
            });
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -25px 0px',
      }
    );

    refs.current.forEach((element) => {
      if (element) io.observe(element);
    });

    return () => io.disconnect();
  }, []);

  const registerRef = (element, id) => {
    if (
      element &&
      !refs.current.some((item) => item?.id === id)
    ) {
      refs.current.push(element);
    }
  };

  const isVisible = (id) => visible.has(id);

  return (
    <div className="rules-root">
      <Helmet>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7608424206122269"
          crossOrigin="anonymous"
        ></script>

        <title>Kebijakan & Privasi - Sukamuda</title>

        <link
          rel="canonical"
          href="https://sukamuda.co.id/rules"
        />

        <meta
          name="description"
          content="Kebijakan Privasi dan Ketentuan Penggunaan platform Sukamuda."
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Kebijakan dan Privasi - Sukamuda',
            description:
              'Kebijakan Privasi dan Ketentuan Penggunaan platform Sukamuda.',
            url: 'https://sukamuda.co.id/rules',
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
                name: 'Kebijakan & Privasi',
                item: 'https://sukamuda.co.id/rules',
              },
            ],
          })}
        </script>
      </Helmet>

      <div
        className="rules-grid-bg"
        aria-hidden="true"
      />

      <div className="rules-wrap">
        {/* NAV */}
        <nav
          className={`rules-nav ${
            isVisible('nav') ? 'rules-on' : ''
          }`}
          id="nav"
          ref={(element) =>
            registerRef(element, 'nav')
          }
          aria-label="Navigasi halaman"
        >
          <span className="rules-logo">
            sukamuda
          </span>

          <div className="rules-nav-right">
            <span
              className="rules-nav-line"
              aria-hidden="true"
            />

            <span className="rules-nav-tag">
              Legal
            </span>
          </div>
        </nav>

        <main
          className="rules-main"
          id="main-content"
        >
          {/* HERO */}
          <header
            className={`rules-hero ${
              isVisible('hero')
                ? 'rules-on'
                : ''
            }`}
            id="hero"
            ref={(element) =>
              registerRef(element, 'hero')
            }
          >
            <div className="rules-hero-top">
              <div className="rules-hero-badge">
                <span
                  className="rules-badge-dot"
                  aria-hidden="true"
                />

                <span>
                  Dokumen Hukum & Privasi
                </span>
              </div>
            </div>

            <div className="rules-hero-body">
              <h1 className="rules-hero-title">
                <span className="rules-h1-line">
                  Kebijakan Privasi
                </span>

                <span className="rules-h1-line rules-h1-accent">
                  & Penggunaan
                </span>
              </h1>

              <p className="rules-hero-desc">
                Panduan yang membantu menjaga
                Sukamuda tetap aman, nyaman, dan
                bertanggung jawab bagi seluruh
                pengguna.
              </p>

              <div className="rules-hero-date">
                Update Terakhir: April 2026
              </div>
            </div>

            <div className="rules-hero-bottom">
              <div
                className="rules-hero-bar"
                aria-hidden="true"
              />
            </div>
          </header>

          {/* PRIVACY */}
          <section
            className={`rules-section ${
              isVisible('privacy')
                ? 'rules-on'
                : ''
            }`}
            id="privacy"
            ref={(element) =>
              registerRef(element, 'privacy')
            }
            aria-labelledby="rules-label-privacy"
          >
            <div
              className="rules-label-row"
              id="rules-label-privacy"
            >
              <span className="rules-label">
                01
              </span>

              <span className="rules-label-text">
                Kebijakan Privasi
              </span>
            </div>

            <article className="rules-feature">
              <div className="rules-feature-icon">
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
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                  />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <div className="rules-feature-body">
                <h2>
                  Perlindungan Privasi Pengguna
                </h2>

                <p>
                  Sukamuda berkomitmen untuk
                  melindungi privasi dan keamanan
                  data setiap pengguna yang
                  mengakses dan menggunakan layanan
                  di website ini.
                </p>

                <p className="rules-feature-extra">
                  Informasi yang dikumpulkan diproses
                  secara wajar untuk menjalankan
                  layanan, meningkatkan pengalaman,
                  dan menjaga keamanan platform.
                </p>
              </div>
            </article>
          </section>

          {/* PRIVACY DATA */}
          <section
            className={`rules-section ${
              isVisible('privacy-data')
                ? 'rules-on'
                : ''
            }`}
            id="privacy-data"
            ref={(element) =>
              registerRef(element, 'privacy-data')
            }
            aria-labelledby="rules-label-privacy-data"
          >
            <div
              className="rules-label-row"
              id="rules-label-privacy-data"
            >
              <span className="rules-label">
                02
              </span>

              <span className="rules-label-text">
                Data & Informasi
              </span>
            </div>

            <div className="rules-bento">
              <article
                className="rules-card rules-card-wide"
                style={{
                  transitionDelay: '0ms',
                }}
              >
                <div className="rules-card-icon">
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
                      cy="7"
                      r="4"
                    />
                    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                  </svg>
                </div>

                <h3>
                  Informasi yang Kami Kumpulkan
                </h3>

                <p>
                  Kami dapat mengumpulkan nama,
                  alamat email, data aktivitas,
                  informasi perangkat, browser,
                  alamat IP, serta konten yang
                  dikirim pengguna sesuai kebutuhan
                  layanan.
                </p>
              </article>

              <article
                className="rules-card"
                style={{
                  transitionDelay: '70ms',
                }}
              >
                <div className="rules-card-icon">
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
                    <path d="M12 3v18" />
                    <path d="M6 7h12" />
                    <path d="M6 17h12" />
                  </svg>
                </div>

                <h3>
                  Penggunaan Informasi
                </h3>

                <p>
                  Data digunakan untuk mengelola
                  akun, verifikasi konten,
                  meningkatkan layanan, dan
                  menjaga keamanan sistem.
                </p>
              </article>

              <article
                className="rules-card"
                style={{
                  transitionDelay: '140ms',
                }}
              >
                <div className="rules-card-icon">
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
                    <path d="M4 4h16v16H4z" />
                    <path d="M8 8h8" />
                    <path d="M8 12h8" />
                    <path d="M8 16h5" />
                  </svg>
                </div>

                <h3>
                  Perlindungan Data
                </h3>

                <p>
                  Kami menerapkan langkah
                  perlindungan yang wajar untuk
                  mencegah akses atau perubahan
                  data tanpa izin.
                </p>
              </article>

              <article
                className="rules-card rules-card-wide"
                style={{
                  transitionDelay: '210ms',
                }}
              >
                <div className="rules-card-icon">
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
                    <path d="M12 3a9 9 0 1 0 9 9" />
                    <path d="M12 3v6h6" />
                  </svg>
                </div>

                <h3>
                  Cookie & Teknologi Serupa
                </h3>

                <p>
                  Sukamuda menggunakan cookie
                  untuk meningkatkan pengalaman,
                  menyimpan preferensi, menjaga
                  sesi login, dan membantu analisis
                  penggunaan website.
                </p>
              </article>
            </div>
          </section>

          {/* THIRD PARTY */}
          <section
            className={`rules-section ${
              isVisible('third-party')
                ? 'rules-on'
                : ''
            }`}
            id="third-party"
            ref={(element) =>
              registerRef(element, 'third-party')
            }
            aria-labelledby="rules-label-third-party"
          >
            <div
              className="rules-label-row"
              id="rules-label-third-party"
            >
              <span className="rules-label">
                03
              </span>

              <span className="rules-label-text">
                Layanan Pihak Ketiga
              </span>
            </div>

            <div className="rules-rights-grid">
              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">
                    01
                  </span>

                  <h3>
                    Google Analytics
                  </h3>
                </div>

                <p>
                  Digunakan untuk memahami
                  bagaimana pengunjung menggunakan
                  website dan membantu meningkatkan
                  layanan.
                </p>
              </article>

              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">
                    02
                  </span>

                  <h3>
                    Google AdSense
                  </h3>
                </div>

                <p>
                  Layanan iklan pihak ketiga dapat
                  menggunakan cookie untuk membantu
                  menayangkan iklan yang relevan.
                </p>
              </article>
            </div>

            <div className="rules-note">
              <svg
                width="17"
                height="17"
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
                  r="10"
                />
                <line
                  x1="12"
                  y1="16"
                  x2="12"
                  y2="12"
                />
                <line
                  x1="12"
                  y1="8"
                  x2="12.01"
                  y2="8"
                />
              </svg>

              <p>
                Pengguna dapat mengatur preferensi
                cookie melalui pengaturan browser
                dan pengaturan layanan pihak ketiga
                yang relevan.
              </p>
            </div>
          </section>

          {/* RIGHTS */}
          <section
            className={`rules-section ${
              isVisible('rights')
                ? 'rules-on'
                : ''
            }`}
            id="rights"
            ref={(element) =>
              registerRef(element, 'rights')
            }
            aria-labelledby="rules-label-rights"
          >
            <div
              className="rules-label-row"
              id="rules-label-rights"
            >
              <span className="rules-label">
                04
              </span>

              <span className="rules-label-text">
                Hak Pengguna
              </span>
            </div>

            <div className="rules-rights-grid">
              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">
                    01
                  </span>

                  <h3>
                    Akses & Perbaikan
                  </h3>
                </div>

                <ul>
                  <li>
                    Mengakses data pribadi
                  </li>

                  <li>
                    Memperbarui atau memperbaiki
                    data
                  </li>
                </ul>
              </article>

              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">
                    02
                  </span>

                  <h3>
                    Penghapusan
                  </h3>
                </div>

                <ul>
                  <li>
                    Menghapus akun dan data terkait
                  </li>

                  <li>
                    Menarik persetujuan penggunaan
                    data
                  </li>
                </ul>
              </article>
            </div>
          </section>

          {/* DIVIDER */}
          <div
            className={`rules-divider ${
              isVisible('divider')
                ? 'rules-on'
                : ''
            }`}
            id="divider"
            ref={(element) =>
              registerRef(element, 'divider')
            }
            aria-hidden="true"
          >
            <div className="rules-divider-line" />
            <span className="rules-divider-dot" />
            <div className="rules-divider-line" />
          </div>

          {/* USAGE */}
          <section
            className={`rules-section ${
              isVisible('usage')
                ? 'rules-on'
                : ''
            }`}
            id="usage"
            ref={(element) =>
              registerRef(element, 'usage')
            }
            aria-labelledby="rules-label-usage"
          >
            <div
              className="rules-label-row"
              id="rules-label-usage"
            >
              <span className="rules-label">
                05
              </span>

              <span className="rules-label-text">
                Kebijakan Penggunaan
              </span>
            </div>

            <div className="rules-bento">
              <article
                className="rules-card rules-card-wide"
                style={{
                  transitionDelay: '0ms',
                }}
              >
                <div className="rules-card-icon">
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line
                      x1="16"
                      y1="13"
                      x2="8"
                      y2="13"
                    />
                    <line
                      x1="16"
                      y1="17"
                      x2="8"
                      y2="17"
                    />
                  </svg>
                </div>

                <h3>
                  Kebijakan Konten
                </h3>

                <p>
                  Pengguna dapat mengirim artikel
                  sesuai kategori yang tersedia.
                  Konten harus orisinal, informatif,
                  dan tidak melanggar hukum.
                </p>
              </article>

              <article
                className="rules-card"
                style={{
                  transitionDelay: '70ms',
                }}
              >
                <div className="rules-card-icon">
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>

                <h3>
                  Verifikasi
                </h3>

                <p>
                  Konten akan melalui proses
                  verifikasi sebelum dipublikasikan.
                </p>
              </article>

              <article
                className="rules-card"
                style={{
                  transitionDelay: '140ms',
                }}
              >
                <div className="rules-card-icon">
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
                    <line
                      x1="8"
                      y1="8"
                      x2="16"
                      y2="16"
                    />
                    <line
                      x1="16"
                      y1="8"
                      x2="8"
                      y2="16"
                    />
                  </svg>
                </div>

                <h3>
                  Tanggung Jawab
                </h3>

                <p>
                  Pengguna bertanggung jawab atas
                  konten yang dikirimkan.
                </p>
              </article>
            </div>
          </section>

          {/* CONTENT RESTRICTIONS */}
          <section
            className={`rules-section ${
              isVisible('content-rules')
                ? 'rules-on'
                : ''
            }`}
            id="content-rules"
            ref={(element) =>
              registerRef(element, 'content-rules')
            }
            aria-labelledby="rules-label-content-rules"
          >
            <div
              className="rules-label-row"
              id="rules-label-content-rules"
            >
              <span className="rules-label">
                06
              </span>

              <span className="rules-label-text">
                Batasan Konten
              </span>
            </div>

            <div className="rules-ban-grid">
              <article
                className="rules-ban-card"
                style={{
                  '--rules-color': '#4f46e5',
                }}
              >
                <div className="rules-ban-number">
                  01
                </div>

                <h3>
                  Kebencian & Kekerasan
                </h3>

                <p>
                  Dilarang mengunggah konten yang
                  mengandung ujaran kebencian,
                  pornografi, atau kekerasan.
                </p>
              </article>

              <article
                className="rules-ban-card"
                style={{
                  '--rules-color': '#db2777',
                }}
              >
                <div className="rules-ban-number">
                  02
                </div>

                <h3>
                  Hoaks & Menyesatkan
                </h3>

                <p>
                  Dilarang menyebarkan informasi
                  palsu atau menyesatkan.
                </p>
              </article>

              <article
                className="rules-ban-card"
                style={{
                  '--rules-color': '#7c3aed',
                }}
              >
                <div className="rules-ban-number">
                  03
                </div>

                <h3>
                  Plagiarisme
                </h3>

                <p>
                  Dilarang mengambil atau
                  menggunakan karya pihak lain
                  tanpa hak atau izin.
                </p>
              </article>

              <article
                className="rules-ban-card"
                style={{
                  '--rules-color': '#0891b2',
                }}
              >
                <div className="rules-ban-number">
                  04
                </div>

                <h3>
                  Spam
                </h3>

                <p>
                  Spam, promosi berlebihan, dan
                  aktivitas yang mengganggu dapat
                  dihapus.
                </p>
              </article>
            </div>
          </section>

          {/* INTERACTION */}
          <section
            className={`rules-section ${
              isVisible('interaction')
                ? 'rules-on'
                : ''
            }`}
            id="interaction"
            ref={(element) =>
              registerRef(element, 'interaction')
            }
            aria-labelledby="rules-label-interaction"
          >
            <div
              className="rules-label-row"
              id="rules-label-interaction"
            >
              <span className="rules-label">
                07
              </span>

              <span className="rules-label-text">
                Interaksi & Hak Cipta
              </span>
            </div>

            <div className="rules-rights-grid">
              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">
                    01
                  </span>

                  <h3>
                    Komentar & Interaksi
                  </h3>
                </div>

                <ul>
                  <li>
                    Menjaga kesopanan
                  </li>

                  <li>
                    Komentar harus relevan
                  </li>

                  <li>
                    Konten yang melanggar dapat
                    dihapus
                  </li>
                </ul>
              </article>

              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">
                    02
                  </span>

                  <h3>
                    Hak Cipta
                  </h3>
                </div>

                <ul>
                  <li>
                    Konten tetap milik penulis
                  </li>

                  <li>
                    Sukamuda memperoleh izin untuk
                    menampilkan konten
                  </li>

                  <li>
                    Pelanggaran hak cipta tidak
                    diperbolehkan
                  </li>
                </ul>
              </article>
            </div>
          </section>

          {/* SANCTIONS */}
          <section
            className={`rules-section ${
              isVisible('sanctions')
                ? 'rules-on'
                : ''
            }`}
            id="sanctions"
            ref={(element) =>
              registerRef(element, 'sanctions')
            }
            aria-labelledby="rules-label-sanctions"
          >
            <div
              className="rules-label-row"
              id="rules-label-sanctions"
            >
              <span className="rules-label">
                08
              </span>

              <span className="rules-label-text">
                Sanksi Pelanggaran
              </span>
            </div>

            <article className="rules-closing rules-sanction-card">
              <div
                className="rules-closing-accent"
                aria-hidden="true"
              />

              <div className="rules-closing-icon">
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
                  <path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7l-8-4Z" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <div className="rules-closing-body">
                <h2>
                  Tetap Gunakan Platform dengan
                  Bijak
                </h2>

                <p>
                  Pelanggaran terhadap kebijakan
                  dapat mengakibatkan peringatan,
                  penghapusan konten, pembatasan
                  fitur, hingga pemblokiran akun
                  sesuai tingkat pelanggaran.
                </p>
              </div>
            </article>
          </section>

          {/* CLOSING */}
          <section
            className={`rules-section ${
              isVisible('closing')
                ? 'rules-on'
                : ''
            }`}
            id="closing"
            ref={(element) =>
              registerRef(element, 'closing')
            }
            aria-labelledby="rules-label-closing"
          >
            <div
              className="rules-label-row"
              id="rules-label-closing"
            >
              <span className="rules-label">
                09
              </span>

              <span className="rules-label-text">
                Penutup
              </span>
            </div>

            <article className="rules-closing">
              <div
                className="rules-closing-accent"
                aria-hidden="true"
              />

              <div className="rules-closing-icon">
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

              <div className="rules-closing-body">
                <h2>
                  Gunakan Sukamuda dengan Bijak
                </h2>

                <p>
                  Dengan menggunakan Sukamuda,
                  pengguna dianggap menyetujui
                  seluruh Kebijakan Privasi dan
                  Kebijakan Penggunaan yang berlaku
                  demi menjaga keamanan, kenyamanan,
                  dan kualitas komunitas bersama.
                </p>
              </div>
            </article>
          </section>
        </main>

        <footer className="rules-foot">
          <div
            className="rules-foot-line"
            aria-hidden="true"
          />

          <div className="rules-foot-in">
            <span className="rules-foot-logo">
              sukamuda
            </span>

            <span className="rules-foot-c">
              © {new Date().getFullYear()} —
              Dibuat untuk generasi muda Indonesia
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Rules;