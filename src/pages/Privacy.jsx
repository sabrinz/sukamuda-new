import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './Privacy.css';

const Privacy = () => {
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
        rootMargin: '0px 0px -20px 0px',
      }
    );

    refs.current.forEach((element) => {
      if (element) {
        io.observe(element);
      }
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
    <div className="pv-root">
      <Helmet>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7608424206122269"
          crossOrigin="anonymous"
        ></script>

        <title>Kebijakan Privasi - Sukamuda</title>

        <link
          rel="canonical"
          href="https://sukamuda.co.id/privacy"
        />

        <meta
          name="description"
          content="Kebijakan Privasi Sukamuda: bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda, termasuk penggunaan cookies, Google Analytics, dan Google AdSense."
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Kebijakan Privasi - Sukamuda',
            description:
              'Kebijakan Privasi platform media digital Sukamuda.',
            url: 'https://sukamuda.co.id/privacy',
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
                name: 'Kebijakan Privasi',
                item: 'https://sukamuda.co.id/privacy',
              },
            ],
          })}
        </script>
      </Helmet>

      <div
        className="pv-grid-bg"
        aria-hidden="true"
      />

      <div className="pv-wrap">
        {/* NAV */}
        <nav
          className={`pv-nav ${
            isVisible('nav') ? 'pv-on' : ''
          }`}
          id="nav"
          ref={(element) =>
            registerRef(element, 'nav')
          }
          aria-label="Navigasi Halaman"
        >
          <span className="pv-logo">
            sukamuda
          </span>

          <div className="pv-nav-right">
            <span
              className="pv-nav-line"
              aria-hidden="true"
            />

            <span className="pv-nav-tag">
              Privacy
            </span>
          </div>
        </nav>

        {/* MAIN */}
        <main
          className="pv-main"
          id="main-content"
        >
          {/* HERO */}
          <header
            className={`pv-hero ${
              isVisible('hero')
                ? 'pv-on'
                : ''
            }`}
            id="hero"
            ref={(element) =>
              registerRef(element, 'hero')
            }
          >
            <div className="pv-hero-top">
              <div className="pv-hero-badge">
                <span
                  className="pv-badge-dot"
                  aria-hidden="true"
                />

                <span>
                  Dokumen Hukum & Privasi
                </span>
              </div>
            </div>

            <div className="pv-hero-body">
              <h1 className="pv-hero-title">
                <span className="pv-h1-line">
                  Kebijakan Privasi
                </span>

                <span className="pv-h1-line pv-h1-accent">
                  Sukamuda
                </span>
              </h1>

              <p className="pv-hero-desc">
                Penjelasan mengenai cara Sukamuda
                mengumpulkan, menggunakan,
                menyimpan, dan melindungi informasi
                pengguna saat menggunakan layanan kami.
              </p>

              <div className="pv-hero-date">
                Update Terakhir: Juli 2026
              </div>
            </div>

            <div className="pv-hero-bottom">
              <div
                className="pv-hero-bar"
                aria-hidden="true"
              />
            </div>
          </header>

          {/* 01 */}
          <section
            className={`pv-sec ${
              isVisible('intro')
                ? 'pv-on'
                : ''
            }`}
            id="intro"
            ref={(element) =>
              registerRef(element, 'intro')
            }
            aria-labelledby="pv-label-intro"
          >
            <div
              className="pv-label-row"
              id="pv-label-intro"
            >
              <span className="pv-label">
                01
              </span>

              <span className="pv-label-text">
                Pendahuluan
              </span>
            </div>

            <article className="pv-feature">
              <div className="pv-feature-icon">
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
                  <path d="M12 8v8" />
                  <path d="M9 11h6" />
                </svg>
              </div>

              <div className="pv-feature-body">
                <h2>
                  Privasi Pengguna adalah Prioritas
                </h2>

                <p>
                  Sukamuda (sukamuda.co.id)
                  menghormati dan melindungi
                  privasi setiap pengunjung.
                  Halaman ini menjelaskan bagaimana
                  kami mengumpulkan, menggunakan,
                  dan melindungi informasi Anda saat
                  menggunakan layanan kami.
                </p>

                <p className="pv-feature-extra">
                  Dengan mengakses website ini,
                  Anda menyetujui praktik yang
                  dijelaskan dalam Kebijakan Privasi
                  ini.
                </p>
              </div>
            </article>
          </section>

          {/* 02 */}
          <section
            className={`pv-sec ${
              isVisible('collect')
                ? 'pv-on'
                : ''
            }`}
            id="collect"
            ref={(element) =>
              registerRef(element, 'collect')
            }
            aria-labelledby="pv-label-collect"
          >
            <div
              className="pv-label-row"
              id="pv-label-collect"
            >
              <span className="pv-label">
                02
              </span>

              <span className="pv-label-text">
                Data yang Dikumpulkan
              </span>
            </div>

            <div className="pv-bento">
              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: '0ms',
                }}
              >
                <div className="pv-card-icon">
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
                  Data Akun
                </h3>

                <p>
                  Saat mendaftar akun, kami dapat
                  mengumpulkan nama, alamat email,
                  dan kata sandi yang disimpan
                  menggunakan mekanisme keamanan
                  yang sesuai.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: '70ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="2"
                    />
                    <path d="M8 8h8" />
                    <path d="M8 12h5" />
                  </svg>
                </div>

                <h3>
                  Data Teknis
                </h3>

                <p>
                  Informasi seperti alamat IP,
                  jenis perangkat, browser, dan
                  halaman yang dikunjungi dapat
                  diterima secara otomatis.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: '140ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <path d="M7 7h10" />
                    <path d="M7 17h10" />
                  </svg>
                </div>

                <h3>
                  Aktivitas Penggunaan
                </h3>

                <p>
                  Kami dapat menerima informasi
                  mengenai interaksi Anda dengan
                  website untuk meningkatkan
                  pengalaman penggunaan.
                </p>
              </article>

              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: '210ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <path d="M8 9h8" />
                    <path d="M8 13h8" />
                    <path d="M8 17h5" />
                  </svg>
                </div>

                <h3>
                  Informasi Tambahan
                </h3>

                <p>
                  Informasi lain dapat diproses
                  sepanjang diperlukan untuk
                  menjalankan fitur, menjaga
                  keamanan, atau memenuhi kewajiban
                  hukum yang berlaku.
                </p>
              </article>
            </div>
          </section>

          {/* 03 */}
          <section
            className={`pv-sec ${
              isVisible('usage')
                ? 'pv-on'
                : ''
            }`}
            id="usage"
            ref={(element) =>
              registerRef(element, 'usage')
            }
            aria-labelledby="pv-label-usage"
          >
            <div
              className="pv-label-row"
              id="pv-label-usage"
            >
              <span className="pv-label">
                03
              </span>

              <span className="pv-label-text">
                Penggunaan Informasi
              </span>
            </div>

            <div className="pv-content-card">
              <div className="pv-content-heading">
                <div className="pv-content-symbol">
                  03
                </div>

                <div>
                  <h2>
                    Untuk Apa Informasi Digunakan?
                  </h2>

                  <p>
                    Informasi dipakai untuk
                    menjalankan layanan secara aman
                    dan relevan.
                  </p>
                </div>
              </div>

              <div className="pv-list-grid">
                <div className="pv-list-item">
                  <span className="pv-list-number">
                    01
                  </span>

                  <p>
                    Mengelola akun dan proses
                    login pengguna.
                  </p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">
                    02
                  </span>

                  <p>
                    Menampilkan konten dan fitur
                    yang relevan.
                  </p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">
                    03
                  </span>

                  <p>
                    Mengirim email verifikasi,
                    OTP, atau pemberitahuan.
                  </p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">
                    04
                  </span>

                  <p>
                    Meningkatkan kualitas dan
                    performa layanan.
                  </p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">
                    05
                  </span>

                  <p>
                    Menjaga keamanan website dan
                    mencegah penyalahgunaan.
                  </p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">
                    06
                  </span>

                  <p>
                    Memenuhi kewajiban yang
                    diwajibkan oleh hukum.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 04 */}
          <section
            className={`pv-sec ${
              isVisible('tracking')
                ? 'pv-on'
                : ''
            }`}
            id="tracking"
            ref={(element) =>
              registerRef(element, 'tracking')
            }
            aria-labelledby="pv-label-tracking"
          >
            <div
              className="pv-label-row"
              id="pv-label-tracking"
            >
              <span className="pv-label">
                04
              </span>

              <span className="pv-label-text">
                Cookies & Analitik
              </span>
            </div>

            <div className="pv-rights-grid">
              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">
                    01
                  </span>

                  <h3>
                    Cookies
                  </h3>
                </div>

                <p className="pv-right-description">
                  Sukamuda menggunakan cookies dan
                  local storage untuk menjaga sesi
                  login serta mengingat preferensi
                  pengguna.
                </p>
              </article>

              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">
                    02
                  </span>

                  <h3>
                    Google Analytics
                  </h3>
                </div>

                <p className="pv-right-description">
                  Google Analytics digunakan untuk
                  membantu memahami bagaimana
                  pengunjung menggunakan website.
                </p>
              </article>
            </div>

            <div className="pv-note">
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
                Anda dapat menonaktifkan cookies
                melalui pengaturan browser, namun
                sebagian fitur website mungkin tidak
                berfungsi dengan baik.
              </p>
            </div>
          </section>

          {/* 05 */}
          <section
            className={`pv-sec ${
              isVisible('ads')
                ? 'pv-on'
                : ''
            }`}
            id="ads"
            ref={(element) =>
              registerRef(element, 'ads')
            }
            aria-labelledby="pv-label-ads"
          >
            <div
              className="pv-label-row"
              id="pv-label-ads"
            >
              <span className="pv-label">
                05
              </span>

              <span className="pv-label-text">
                Iklan & AdSense
              </span>
            </div>

            <article className="pv-feature">
              <div className="pv-feature-icon">
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
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                  />
                  <path d="M7 8h10" />
                  <path d="M7 12h7" />
                  <path d="M7 16h4" />
                </svg>
              </div>

              <div className="pv-feature-body">
                <h2>
                  Google AdSense
                </h2>

                <p>
                  Website ini dapat menampilkan
                  iklan yang disediakan oleh Google
                  AdSense. Google sebagai vendor
                  pihak ketiga dapat menggunakan
                  cookies untuk membantu menayangkan
                  iklan yang relevan.
                </p>

                <p className="pv-feature-extra">
                  Pengaturan iklan yang dipersonalisasi
                  dapat dikelola melalui pengaturan
                  iklan pada akun Google atau layanan
                  terkait yang disediakan Google.
                </p>
              </div>
            </article>
          </section>

          {/* 06 */}
          <section
            className={`pv-sec ${
              isVisible('sharing')
                ? 'pv-on'
                : ''
            }`}
            id="sharing"
            ref={(element) =>
              registerRef(element, 'sharing')
            }
            aria-labelledby="pv-label-sharing"
          >
            <div
              className="pv-label-row"
              id="pv-label-sharing"
            >
              <span className="pv-label">
                06
              </span>

              <span className="pv-label-text">
                Berbagi Data
              </span>
            </div>

            <div className="pv-bento">
              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: '0ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <path d="M5 12h14" />
                  </svg>
                </div>

                <h3>
                  Tidak Menjual Data Pribadi
                </h3>

                <p>
                  Kami tidak menjual, menyewakan,
                  atau memperdagangkan data pribadi
                  Anda kepada pihak mana pun.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: '70ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <path d="M6 6h12" />
                    <path d="M6 18h12" />
                  </svg>
                </div>

                <h3>
                  Penyedia Layanan
                </h3>

                <p>
                  Data dapat diproses oleh penyedia
                  layanan yang membantu operasional
                  website.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: '140ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <path d="M5 3h14v18H5z" />
                    <path d="M9 8h6" />
                    <path d="M9 12h6" />
                  </svg>
                </div>

                <h3>
                  Kewajiban Hukum
                </h3>

                <p>
                  Informasi dapat diberikan apabila
                  diwajibkan oleh hukum yang berlaku.
                </p>
              </article>

              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: '210ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <path d="M4 12h16" />
                    <path d="M12 4v16" />
                  </svg>
                </div>

                <h3>
                  Prinsip Pemrosesan
                </h3>

                <p>
                  Pemrosesan informasi dilakukan
                  seperlunya untuk tujuan yang
                  relevan dengan layanan.
                </p>
              </article>
            </div>
          </section>

          {/* 07 */}
          <section
            className={`pv-sec ${
              isVisible('security')
                ? 'pv-on'
                : ''
            }`}
            id="security"
            ref={(element) =>
              registerRef(element, 'security')
            }
            aria-labelledby="pv-label-security"
          >
            <div
              className="pv-label-row"
              id="pv-label-security"
            >
              <span className="pv-label">
                07
              </span>

              <span className="pv-label-text">
                Keamanan Data
              </span>
            </div>

            <article className="pv-feature pv-feature-security">
              <div className="pv-feature-icon">
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
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <div className="pv-feature-body">
                <h2>
                  Perlindungan dan Penyimpanan
                </h2>

                <p>
                  Kami menerapkan langkah-langkah
                  keamanan yang wajar untuk melindungi
                  data Anda, termasuk perlindungan
                  terhadap akses yang tidak sah.
                </p>

                <p className="pv-feature-extra">
                  Namun perlu dipahami bahwa tidak
                  ada transmisi data melalui internet
                  yang sepenuhnya bebas risiko.
                </p>
              </div>
            </article>
          </section>

          {/* 08 */}
          <section
            className={`pv-sec ${
              isVisible('rights')
                ? 'pv-on'
                : ''
            }`}
            id="rights"
            ref={(element) =>
              registerRef(element, 'rights')
            }
            aria-labelledby="pv-label-rights"
          >
            <div
              className="pv-label-row"
              id="pv-label-rights"
            >
              <span className="pv-label">
                08
              </span>

              <span className="pv-label-text">
                Hak Pengguna
              </span>
            </div>

            <div className="pv-rights-grid">
              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">
                    01
                  </span>

                  <h3>
                    Akses Data
                  </h3>
                </div>

                <p className="pv-right-description">
                  Anda dapat mengakses dan memperbarui
                  data profil yang tersedia melalui
                  akun Anda.
                </p>
              </article>

              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">
                    02
                  </span>

                  <h3>
                    Penghapusan
                  </h3>
                </div>

                <p className="pv-right-description">
                  Anda dapat meminta penghapusan akun
                  beserta data yang terkait sesuai
                  mekanisme yang tersedia.
                </p>
              </article>
            </div>

            <div className="pv-note">
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
                Untuk permintaan lain terkait data
                pribadi, silakan hubungi kami melalui
                kontak yang tersedia di halaman bantuan.
              </p>
            </div>
          </section>

          {/* 09 */}
          <section
            className={`pv-sec ${
              isVisible('children')
                ? 'pv-on'
                : ''
            }`}
            id="children"
            ref={(element) =>
              registerRef(element, 'children')
            }
            aria-labelledby="pv-label-children"
          >
            <div
              className="pv-label-row"
              id="pv-label-children"
            >
              <span className="pv-label">
                09
              </span>

              <span className="pv-label-text">
                Privasi Anak
              </span>
            </div>

            <article className="pv-feature">
              <div className="pv-feature-icon">
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
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <circle
                    cx="9"
                    cy="10"
                    r="1"
                  />
                  <circle
                    cx="15"
                    cy="10"
                    r="1"
                  />
                  <path d="M8 15c1.2 1.2 2.6 1.8 4 1.8s2.8-.6 4-1.8" />
                </svg>
              </div>

              <div className="pv-feature-body">
                <h2>
                  Perlindungan Pengguna Anak
                </h2>

                <p>
                  Layanan ini tidak ditujukan untuk
                  anak di bawah usia 13 tahun.
                  Kami tidak dengan sengaja
                  mengumpulkan data pribadi dari
                  anak-anak.
                </p>

                <p className="pv-feature-extra">
                  Jika Anda meyakini seorang anak
                  telah memberikan data pribadinya,
                  silakan hubungi kami agar informasi
                  tersebut dapat ditinjau.
                </p>
              </div>
            </article>
          </section>

          {/* 10 */}
          <section
            className={`pv-sec ${
              isVisible('changes')
                ? 'pv-on'
                : ''
            }`}
            id="changes"
            ref={(element) =>
              registerRef(element, 'changes')
            }
            aria-labelledby="pv-label-changes"
          >
            <div
              className="pv-label-row"
              id="pv-label-changes"
            >
              <span className="pv-label">
                10
              </span>

              <span className="pv-label-text">
                Perubahan Kebijakan
              </span>
            </div>

            <div className="pv-bento">
              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: '0ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <path d="M3 12a9 9 0 0 1 15.6-6.1L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-15.6 6.1L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                </div>

                <h3>
                  Pembaruan Kebijakan
                </h3>

                <p>
                  Kebijakan Privasi ini dapat
                  diperbarui sewaktu-waktu mengikuti
                  perkembangan layanan dan peraturan
                  yang berlaku.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: '70ms',
                }}
              >
                <div className="pv-card-icon">
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
                  Tanggal Pembaruan
                </h3>

                <p>
                  Perubahan akan dipublikasikan pada
                  halaman ini dengan tanggal terbaru.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: '140ms',
                }}
              >
                <div className="pv-card-icon">
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
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h10" />
                  </svg>
                </div>

                <h3>
                  Tinjau Berkala
                </h3>

                <p>
                  Pengguna disarankan meninjau halaman
                  ini secara berkala.
                </p>
              </article>
            </div>
          </section>

          {/* 11 */}
          <section
            className={`pv-sec ${
              isVisible('contact')
                ? 'pv-on'
                : ''
            }`}
            id="contact"
            ref={(element) =>
              registerRef(element, 'contact')
            }
            aria-labelledby="pv-label-contact"
          >
            <div
              className="pv-label-row"
              id="pv-label-contact"
            >
              <span className="pv-label">
                11
              </span>

              <span className="pv-label-text">
                Kontak
              </span>
            </div>

            <article className="pv-closing">
              <div
                className="pv-closing-accent"
                aria-hidden="true"
              />

              <div className="pv-closing-icon">
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
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <div className="pv-closing-body">
                <h2>
                  Punya Pertanyaan?
                </h2>

                <p>
                  Untuk pertanyaan mengenai Kebijakan
                  Privasi atau penggunaan data Anda,
                  hubungi kami melalui email
                  <strong>
                    {' '}sukamuda50@gmail.com
                  </strong>{' '}
                  atau melalui halaman Bantuan.
                </p>
              </div>
            </article>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="pv-foot">
          <div
            className="pv-foot-line"
            aria-hidden="true"
          />

          <div className="pv-foot-in">
            <span className="pv-foot-logo">
              sukamuda
            </span>

            <span className="pv-foot-c">
              © {new Date().getFullYear()} —
              Dibuat untuk generasi muda Indonesia
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Privacy;