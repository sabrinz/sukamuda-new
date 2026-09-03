import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import "./Privacy.css";

/* =========================================================
   SITE CONSTANTS
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";
const PAGE_URL = `${SITE_URL}/privacy`;
const SITE_NAME = "SukaMuda";

const LOGO_URL = `${SITE_URL}/logo.png`;
const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const LOGO_ID = `${SITE_URL}/#logo`;

/* =========================================================
   PAGE SEO
   ========================================================= */

const PAGE_TITLE = "Kebijakan Privasi SukaMuda";

const PAGE_DESCRIPTION =
  "Kebijakan Privasi SukaMuda menjelaskan informasi yang dapat dikumpulkan, tujuan pemrosesan, penggunaan cookie dan teknologi serupa, Google Analytics, Google AdSense, layanan pihak ketiga, hak pengguna, keamanan, penyimpanan data, dan cara menghubungi SukaMuda.";

/* =========================================================
   LAST UPDATED
   ========================================================= */

const LAST_UPDATED = "Agustus 2026";

/* =========================================================
   STRUCTURED DATA
   ========================================================= */

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: PAGE_TITLE,
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      isPartOf: {
        "@id": WEBSITE_ID,
      },
      about: {
        "@id": ORGANIZATION_ID,
      },
      publisher: {
        "@id": ORGANIZATION_ID,
      },
      primaryImageOfPage: {
        "@id": LOGO_ID,
      },
      inLanguage: "id-ID",
    },

    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Beranda",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: PAGE_TITLE,
          item: PAGE_URL,
        },
      ],
    },
  ],
};

/* =========================================================
   PRIVACY
   ========================================================= */

const Privacy = () => {
  const [visible, setVisible] = useState(() => new Set());

  const refs = useRef([]);

  /* =======================================================
     INTERSECTION OBSERVER
     ======================================================= */

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.IntersectionObserver !== "function"
    ) {
      setVisible(
        new Set([
          "nav",
          "hero",
          "intro",
          "collect",
          "usage",
          "tracking",
          "analytics",
          "ads",
          "sharing",
          "retention",
          "security",
          "rights",
          "children",
          "changes",
          "contact",
        ]),
      );

      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        setVisible((previous) => {
          const next = new Set(previous);
          let changed = false;

          entries.forEach((entry) => {
            const id = entry.target?.id;

            if (entry.isIntersecting && id && !next.has(id)) {
              next.add(id);
              changed = true;
              observer.unobserve(entry.target);
            }
          });

          return changed ? next : previous;
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -20px 0px",
      },
    );

    refs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =======================================================
     REGISTER REF
     ======================================================= */

  const registerRef = (element, id) => {
    if (!element || !id) {
      return;
    }

    const exists = refs.current.some((item) => item?.id === id);

    if (!exists) {
      refs.current.push(element);
    }
  };

  const isVisible = (id) => visible.has(id);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="pv-root">
      <Helmet>
        {/* =================================================
            DOCUMENT
            ================================================= */}

        <html lang="id-ID" />

        <title>{PAGE_TITLE}</title>

        <link rel="canonical" href={PAGE_URL} />

        {/* =================================================
            DESCRIPTION
            ================================================= */}

        <meta name="description" content={PAGE_DESCRIPTION} />

        {/* =================================================
            ROBOTS
            ================================================= */}

        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        {/* =================================================
            BRAND
            ================================================= */}

        <meta name="author" content="SukaMuda" />

        <meta name="publisher" content="SukaMuda" />

        <meta name="application-name" content={SITE_NAME} />

        {/* =================================================
            OPEN GRAPH
            ================================================= */}

        <meta property="og:site_name" content={SITE_NAME} />

        <meta property="og:type" content="website" />

        <meta property="og:locale" content="id_ID" />

        <meta property="og:title" content={PAGE_TITLE} />

        <meta property="og:description" content={PAGE_DESCRIPTION} />

        <meta property="og:url" content={PAGE_URL} />

        <meta property="og:image" content={SHARE_IMAGE} />

        <meta property="og:image:secure_url" content={SHARE_IMAGE} />

        <meta property="og:image:type" content="image/jpeg" />

        <meta property="og:image:width" content="1200" />

        <meta property="og:image:height" content="630" />

        <meta property="og:image:alt" content="Kebijakan Privasi SukaMuda" />

        {/* =================================================
            X / TWITTER
            ================================================= */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={PAGE_TITLE} />

        <meta name="twitter:description" content={PAGE_DESCRIPTION} />

        <meta name="twitter:image" content={SHARE_IMAGE} />

        <meta name="twitter:image:alt" content="Kebijakan Privasi SukaMuda" />

        {/* =================================================
            STRUCTURED DATA
            ================================================= */}

        <script type="application/ld+json">
          {JSON.stringify(STRUCTURED_DATA)}
        </script>
      </Helmet>

      {/* =======================================================
          BACKGROUND
          ======================================================= */}

      <div className="pv-grid-bg" aria-hidden="true" />

      <div className="pv-wrap">
        {/* ===================================================
            NAV
            =================================================== */}

        <nav
          className={`pv-nav ${isVisible("nav") ? "pv-on" : ""}`}
          id="nav"
          ref={(element) => registerRef(element, "nav")}
          aria-label="Navigasi halaman"
        >
          <a className="pv-logo" href="/" aria-label="SukaMuda - Beranda">
            sukamuda
          </a>

          <div className="pv-nav-right">
            <span className="pv-nav-line" aria-hidden="true" />

            <span className="pv-nav-tag">Privacy</span>
          </div>
        </nav>

        {/* ===================================================
            MAIN
            =================================================== */}

        <main className="pv-main" id="main-content">
          {/* =================================================
              HERO
              ================================================= */}

          <header
            className={`pv-hero ${isVisible("hero") ? "pv-on" : ""}`}
            id="hero"
            ref={(element) => registerRef(element, "hero")}
          >
            <div className="pv-hero-top">
              <div className="pv-hero-badge">
                <span className="pv-badge-dot" aria-hidden="true" />

                <span>Dokumen Privasi SukaMuda</span>
              </div>
            </div>

            <div className="pv-hero-body">
              <h1 className="pv-hero-title">
                <span className="pv-h1-line">Kebijakan Privasi</span>

                <span className="pv-h1-line pv-h1-accent">SukaMuda</span>
              </h1>

              <p className="pv-hero-desc">
                Penjelasan mengenai informasi yang diproses saat menggunakan
                website SukaMuda, termasuk penggunaan cookie, analitik, iklan,
                layanan pihak ketiga, keamanan, dan hak pengguna.
              </p>

              <div className="pv-hero-date">
                Update Terakhir: {LAST_UPDATED}
              </div>
            </div>

            <div className="pv-hero-bottom">
              <div className="pv-hero-bar" aria-hidden="true" />
            </div>
          </header>

          {/* =================================================
              01 — PENDAHULUAN
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("intro") ? "pv-on" : ""}`}
            id="intro"
            ref={(element) => registerRef(element, "intro")}
            aria-labelledby="pv-label-intro"
          >
            <div className="pv-label-row" id="pv-label-intro">
              <span className="pv-label">01</span>

              <span className="pv-label-text">Pendahuluan</span>
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
                <h2>Privasi Pengguna adalah Prioritas</h2>

                <p>
                  SukaMuda (sukamuda.co.id) menghormati privasi pengguna dan
                  berupaya memproses informasi secara wajar, relevan, dan sesuai
                  kebutuhan layanan.
                </p>

                <p className="pv-feature-extra">
                  Kebijakan ini menjelaskan jenis informasi yang dapat diproses,
                  tujuan penggunaannya, teknologi yang digunakan, pihak yang
                  dapat membantu operasional layanan, serta pilihan yang
                  tersedia bagi pengguna.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              02 — DATA YANG DIKUMPULKAN
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("collect") ? "pv-on" : ""}`}
            id="collect"
            ref={(element) => registerRef(element, "collect")}
            aria-labelledby="pv-label-collect"
          >
            <div className="pv-label-row" id="pv-label-collect">
              <span className="pv-label">02</span>

              <span className="pv-label-text">Data yang Dikumpulkan</span>
            </div>

            <div className="pv-bento">
              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: "0ms",
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
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                  </svg>
                </div>

                <h3>Data Akun</h3>

                <p>
                  Saat membuat akun, SukaMuda dapat memproses informasi seperti
                  nama, alamat email, kata sandi, foto profil, dan informasi
                  profil lain yang diberikan pengguna melalui fitur yang
                  tersedia.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: "70ms",
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
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M8 8h8" />
                    <path d="M8 12h5" />
                  </svg>
                </div>

                <h3>Data Teknis</h3>

                <p>
                  Informasi teknis seperti alamat IP, jenis perangkat, sistem
                  operasi, browser, waktu akses, dan halaman yang dikunjungi
                  dapat diproses secara otomatis.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: "140ms",
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

                <h3>Aktivitas Penggunaan</h3>

                <p>
                  Informasi mengenai interaksi dengan fitur website dapat
                  diproses untuk memahami penggunaan layanan serta membantu
                  peningkatan kualitas dan performa.
                </p>
              </article>

              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: "210ms",
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

                <h3>Informasi yang Anda Kirim</h3>

                <p>
                  Informasi yang diberikan secara sukarela, seperti artikel,
                  formulir laporan, pesan bantuan, komentar, atau data lain yang
                  dikirim melalui fitur website, dapat diproses untuk
                  menjalankan fitur tersebut.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              03 — TUJUAN PEMROSESAN
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("usage") ? "pv-on" : ""}`}
            id="usage"
            ref={(element) => registerRef(element, "usage")}
            aria-labelledby="pv-label-usage"
          >
            <div className="pv-label-row" id="pv-label-usage">
              <span className="pv-label">03</span>

              <span className="pv-label-text">Tujuan Pemrosesan</span>
            </div>

            <div className="pv-content-card">
              <div className="pv-content-heading">
                <div className="pv-content-symbol">03</div>

                <div>
                  <h2>Untuk Apa Informasi Digunakan?</h2>

                  <p>
                    Informasi dapat digunakan untuk menjalankan, mengamankan,
                    dan meningkatkan layanan SukaMuda.
                  </p>
                </div>
              </div>

              <div className="pv-list-grid">
                <div className="pv-list-item">
                  <span className="pv-list-number">01</span>
                  <p>Membuat, mengelola, dan mengamankan akun pengguna.</p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">02</span>
                  <p>Menyediakan artikel, fitur, dan layanan yang diminta.</p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">03</span>
                  <p>
                    Mengirim verifikasi akun, OTP, notifikasi, atau komunikasi
                    layanan.
                  </p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">04</span>
                  <p>
                    Menjaga keamanan, mendeteksi penyalahgunaan, dan mencegah
                    aktivitas yang tidak sah.
                  </p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">05</span>
                  <p>
                    Menganalisis penggunaan untuk meningkatkan kualitas,
                    performa, dan pengalaman pengguna.
                  </p>
                </div>

                <div className="pv-list-item">
                  <span className="pv-list-number">06</span>
                  <p>
                    Memenuhi kewajiban hukum dan menanggapi permintaan resmi
                    yang sah.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              04 — COOKIES & STORAGE
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("tracking") ? "pv-on" : ""}`}
            id="tracking"
            ref={(element) => registerRef(element, "tracking")}
            aria-labelledby="pv-label-tracking"
          >
            <div className="pv-label-row" id="pv-label-tracking">
              <span className="pv-label">04</span>

              <span className="pv-label-text">Cookies &amp; Penyimpanan</span>
            </div>

            <div className="pv-rights-grid">
              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">01</span>

                  <h3>Cookies</h3>
                </div>

                <p className="pv-right-description">
                  Cookies dapat digunakan untuk membantu fungsi website,
                  keamanan, preferensi pengguna, pengukuran penggunaan, dan
                  layanan pihak ketiga tertentu.
                </p>
              </article>

              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">02</span>

                  <h3>Local Storage</h3>
                </div>

                <p className="pv-right-description">
                  Browser dapat menggunakan local storage untuk menyimpan
                  informasi yang diperlukan aplikasi, seperti preferensi
                  tertentu, status lokal, atau data sesi yang digunakan oleh
                  frontend.
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
                <circle cx="12" cy="12" r="10" />

                <line x1="12" y1="16" x2="12" y2="12" />

                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>

              <p>
                Pengaturan browser dapat digunakan untuk membatasi atau
                menghapus cookies. Beberapa fitur website dapat tidak berfungsi
                sebagaimana mestinya apabila teknologi penyimpanan tertentu
                dinonaktifkan.
              </p>
            </div>
          </section>

          {/* =================================================
              05 — GOOGLE ANALYTICS
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("analytics") ? "pv-on" : ""}`}
            id="analytics"
            ref={(element) => registerRef(element, "analytics")}
            aria-labelledby="pv-label-analytics"
          >
            <div className="pv-label-row" id="pv-label-analytics">
              <span className="pv-label">05</span>

              <span className="pv-label-text">Google Analytics</span>
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
                  <path d="M4 19V5" />
                  <path d="M4 19h16" />
                  <path d="m7 15 4-4 3 2 5-6" />
                </svg>
              </div>

              <div className="pv-feature-body">
                <h2>Pengukuran Penggunaan Website</h2>

                <p>
                  SukaMuda dapat menggunakan Google Analytics untuk memahami
                  bagaimana pengunjung menggunakan website, misalnya halaman
                  yang dikunjungi, perangkat, sumber kunjungan, serta interaksi
                  tertentu.
                </p>

                <p className="pv-feature-extra">
                  Informasi analitik digunakan terutama untuk evaluasi,
                  pengukuran, keamanan, dan peningkatan layanan. Konfigurasi
                  Google Analytics pada SukaMuda dapat mengikuti pengaturan
                  persetujuan dan privasi yang diterapkan pada website.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              06 — ADSENSE
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("ads") ? "pv-on" : ""}`}
            id="ads"
            ref={(element) => registerRef(element, "ads")}
            aria-labelledby="pv-label-ads"
          >
            <div className="pv-label-row" id="pv-label-ads">
              <span className="pv-label">06</span>

              <span className="pv-label-text">Iklan &amp; Google AdSense</span>
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
                  <rect x="3" y="3" width="18" height="18" rx="2" />

                  <path d="M7 8h10" />
                  <path d="M7 12h7" />
                  <path d="M7 16h4" />
                </svg>
              </div>

              <div className="pv-feature-body">
                <h2>Penggunaan Google AdSense</h2>

                <p>
                  SukaMuda dapat menampilkan iklan yang disediakan melalui
                  Google AdSense. Google dan vendor pihak ketiga yang digunakan
                  dalam penyediaan iklan dapat menggunakan cookies, identifier,
                  atau teknologi serupa untuk membantu menayangkan, mengukur,
                  dan meningkatkan layanan iklan.
                </p>

                <p className="pv-feature-extra">
                  Jenis iklan yang ditampilkan dapat dipengaruhi oleh konteks
                  halaman, pengaturan pengguna, dan mekanisme iklan yang
                  digunakan oleh Google serta mitra terkait.
                </p>

                <p className="pv-feature-extra">
                  Pengguna dapat mengelola pilihan iklan yang dipersonalisasi
                  melalui pengaturan iklan Google dan pengaturan browser atau
                  perangkat yang tersedia.
                </p>

                <p className="pv-feature-extra">
                  Penggunaan teknologi iklan pihak ketiga dapat tunduk pada
                  kebijakan privasi pihak ketiga masing-masing.
                </p>

                <p className="pv-feature-extra">
                  Informasi lebih lanjut mengenai kebijakan dan penggunaan data
                  oleh Google dapat dilihat pada kebijakan privasi Google yang
                  berlaku.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              07 — BERBAGI DATA & PIHAK KETIGA
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("sharing") ? "pv-on" : ""}`}
            id="sharing"
            ref={(element) => registerRef(element, "sharing")}
            aria-labelledby="pv-label-sharing"
          >
            <div className="pv-label-row" id="pv-label-sharing">
              <span className="pv-label">07</span>

              <span className="pv-label-text">
                Berbagi Data &amp; Pihak Ketiga
              </span>
            </div>

            <div className="pv-bento">
              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: "0ms",
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

                <h3>Penyedia Layanan</h3>

                <p>
                  Data dapat diproses oleh penyedia layanan yang membantu
                  hosting, infrastruktur, keamanan, pengiriman email, analitik,
                  pembayaran, atau operasional lain yang memang diperlukan.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: "70ms",
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
                    <path d="M8 17l4 4 4-4" />
                    <path d="M12 3v18" />
                    <path d="M16 7l-4-4-4 4" />
                  </svg>
                </div>

                <h3>Layanan Eksternal</h3>

                <p>
                  Beberapa halaman dapat memuat layanan seperti YouTube,
                  Spotify, Google Analytics, atau layanan pihak ketiga lain
                  sesuai fitur yang digunakan.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: "140ms",
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
                    <path d="M8 8h8" />
                    <path d="M8 12h6" />
                    <path d="M8 16h4" />
                  </svg>
                </div>

                <h3>Kewajiban Hukum</h3>

                <p>
                  Informasi dapat diproses atau diungkapkan apabila diperlukan
                  untuk memenuhi kewajiban hukum atau permintaan resmi yang sah.
                </p>
              </article>

              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: "210ms",
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
                    <circle cx="12" cy="12" r="9" />

                    <path d="M8 12h8" />
                  </svg>
                </div>

                <h3>Tidak Dijual</h3>

                <p>
                  SukaMuda tidak bermaksud menjual atau menyewakan data pribadi
                  pengguna kepada pihak lain untuk tujuan komersial yang tidak
                  berkaitan dengan layanan.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              08 — RETENSI DATA
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("retention") ? "pv-on" : ""}`}
            id="retention"
            ref={(element) => registerRef(element, "retention")}
            aria-labelledby="pv-label-retention"
          >
            <div className="pv-label-row" id="pv-label-retention">
              <span className="pv-label">08</span>

              <span className="pv-label-text">Penyimpanan &amp; Retensi</span>
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
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <div className="pv-feature-body">
                <h2>Berapa Lama Data Disimpan?</h2>

                <p>
                  SukaMuda berupaya menyimpan informasi selama diperlukan untuk
                  menjalankan layanan, menjaga keamanan, memenuhi tujuan
                  pemrosesan yang relevan, menyelesaikan sengketa, atau memenuhi
                  kewajiban hukum.
                </p>

                <p className="pv-feature-extra">
                  Ketika informasi tidak lagi diperlukan untuk tujuan tersebut,
                  data dapat dihapus, dianonimkan, atau diproses lebih lanjut
                  sesuai kebutuhan hukum dan operasional yang sah.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              09 — KEAMANAN
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("security") ? "pv-on" : ""}`}
            id="security"
            ref={(element) => registerRef(element, "security")}
            aria-labelledby="pv-label-security"
          >
            <div className="pv-label-row" id="pv-label-security">
              <span className="pv-label">09</span>

              <span className="pv-label-text">Keamanan Data</span>
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
                <h2>Perlindungan dan Keamanan</h2>

                <p>
                  SukaMuda menerapkan langkah keamanan yang wajar sesuai
                  kebutuhan layanan untuk membantu melindungi informasi dari
                  akses, perubahan, penggunaan, atau pengungkapan yang tidak
                  sah.
                </p>

                <p className="pv-feature-extra">
                  Meskipun demikian, tidak ada sistem transmisi atau penyimpanan
                  data melalui internet yang dapat dijamin sepenuhnya bebas
                  risiko.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              10 — HAK PENGGUNA
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("rights") ? "pv-on" : ""}`}
            id="rights"
            ref={(element) => registerRef(element, "rights")}
            aria-labelledby="pv-label-rights"
          >
            <div className="pv-label-row" id="pv-label-rights">
              <span className="pv-label">10</span>

              <span className="pv-label-text">Hak Pengguna</span>
            </div>

            <div className="pv-rights-grid">
              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">01</span>

                  <h3>Akses</h3>
                </div>

                <p className="pv-right-description">
                  Pengguna dapat meminta informasi mengenai data pribadi yang
                  diproses sesuai mekanisme dan ketentuan yang berlaku.
                </p>
              </article>

              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">02</span>

                  <h3>Perbaikan</h3>
                </div>

                <p className="pv-right-description">
                  Pengguna dapat meminta koreksi atau pembaruan terhadap data
                  pribadi yang tidak akurat atau tidak lengkap.
                </p>
              </article>

              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">03</span>

                  <h3>Penghapusan</h3>
                </div>

                <p className="pv-right-description">
                  Pengguna dapat meminta penghapusan akun atau data tertentu
                  sesuai mekanisme, kewajiban hukum, dan ketentuan yang berlaku.
                </p>
              </article>

              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">04</span>

                  <h3>Penarikan Persetujuan</h3>
                </div>

                <p className="pv-right-description">
                  Apabila pemrosesan didasarkan pada persetujuan, pengguna dapat
                  menarik persetujuan sesuai mekanisme yang tersedia.
                </p>
              </article>

              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">05</span>

                  <h3>Pembatasan</h3>
                </div>

                <p className="pv-right-description">
                  Dalam keadaan tertentu, pengguna dapat mengajukan permintaan
                  terkait pembatasan pemrosesan sesuai ketentuan yang berlaku.
                </p>
              </article>

              <article className="pv-right-card">
                <div className="pv-right-top">
                  <span className="pv-right-index">06</span>

                  <h3>Keluhan</h3>
                </div>

                <p className="pv-right-description">
                  Pengguna dapat menghubungi SukaMuda untuk menyampaikan
                  pertanyaan, permintaan, atau keluhan terkait privasi dan data.
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
                <circle cx="12" cy="12" r="10" />

                <line x1="12" y1="16" x2="12" y2="12" />

                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>

              <p>
                Pelaksanaan hak dapat bergantung pada verifikasi identitas,
                keamanan akun, kewajiban hukum, kebutuhan operasional yang sah,
                dan ketentuan yang berlaku.
              </p>
            </div>
          </section>

          {/* =================================================
              11 — PRIVASI ANAK
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("children") ? "pv-on" : ""}`}
            id="children"
            ref={(element) => registerRef(element, "children")}
            aria-labelledby="pv-label-children"
          >
            <div className="pv-label-row" id="pv-label-children">
              <span className="pv-label">11</span>

              <span className="pv-label-text">Privasi Anak</span>
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
                  <circle cx="12" cy="12" r="9" />

                  <circle cx="9" cy="10" r="1" />

                  <circle cx="15" cy="10" r="1" />

                  <path d="M8 15c1.2 1.2 2.6 1.8 4 1.8s2.8-.6 4-1.8" />
                </svg>
              </div>

              <div className="pv-feature-body">
                <h2>Perlindungan Pengguna Anak</h2>

                <p>
                  SukaMuda tidak secara sengaja meminta informasi pribadi dari
                  anak yang belum memenuhi batas usia yang ditetapkan oleh hukum
                  dan layanan yang berlaku.
                </p>

                <p className="pv-feature-extra">
                  Apabila Anda meyakini bahwa seorang anak telah memberikan data
                  pribadi kepada SukaMuda secara tidak semestinya, silakan
                  menghubungi kami agar permintaan tersebut dapat ditinjau.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              12 — PERUBAHAN
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("changes") ? "pv-on" : ""}`}
            id="changes"
            ref={(element) => registerRef(element, "changes")}
            aria-labelledby="pv-label-changes"
          >
            <div className="pv-label-row" id="pv-label-changes">
              <span className="pv-label">12</span>

              <span className="pv-label-text">Perubahan Kebijakan</span>
            </div>

            <div className="pv-bento">
              <article
                className="pv-card pv-card-wide"
                style={{
                  transitionDelay: "0ms",
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

                <h3>Pembaruan Kebijakan</h3>

                <p>
                  Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu
                  untuk mencerminkan perubahan pada layanan, teknologi, praktik
                  pemrosesan, atau ketentuan yang berlaku.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: "70ms",
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
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>

                <h3>Tanggal Pembaruan</h3>

                <p>
                  Tanggal pembaruan akan dicantumkan pada bagian atas halaman
                  ini.
                </p>
              </article>

              <article
                className="pv-card"
                style={{
                  transitionDelay: "140ms",
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

                <h3>Tinjau Berkala</h3>

                <p>
                  Pengguna disarankan meninjau Kebijakan Privasi ini secara
                  berkala agar mengetahui perubahan terbaru.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              13 — KONTAK
              ================================================= */}

          <section
            className={`pv-sec ${isVisible("contact") ? "pv-on" : ""}`}
            id="contact"
            ref={(element) => registerRef(element, "contact")}
            aria-labelledby="pv-label-contact"
          >
            <div className="pv-label-row" id="pv-label-contact">
              <span className="pv-label">13</span>

              <span className="pv-label-text">Kontak Privasi</span>
            </div>

            <article className="pv-closing">
              <div className="pv-closing-accent" aria-hidden="true" />

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
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <div className="pv-closing-body">
                <h2>Pertanyaan atau Permintaan Data?</h2>

                <p>
                  Untuk pertanyaan mengenai Kebijakan Privasi, akses, koreksi,
                  penghapusan, permintaan terkait data, atau masalah privasi
                  lainnya, hubungi kami melalui:
                </p>

                <p>
                  <strong>Email Privasi:</strong>{" "}
                  <a
                    href="mailto:sukamuda50@gmail.com"
                    className="pv-privacy-email"
                  >
                    sukamuda50@gmail.com
                  </a>
                </p>

                <p>
                  Permintaan dapat memerlukan verifikasi untuk membantu
                  melindungi keamanan akun dan informasi pribadi pengguna.
                </p>
              </div>
            </article>
          </section>
        </main>

        {/* ===================================================
            FOOTER
            =================================================== */}

        <footer className="pv-foot">
          <div className="pv-foot-line" aria-hidden="true" />

          <div className="pv-foot-in">
            <a
              href="/"
              className="pv-foot-logo"
              aria-label="SukaMuda - Beranda"
            >
              sukamuda
            </a>

            <span className="pv-foot-c">
              © {new Date().getFullYear()} — SukaMuda
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Privacy;
