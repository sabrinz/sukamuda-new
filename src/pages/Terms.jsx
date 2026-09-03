import React, { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import "./Terms.css";

/* =========================================================
   SITE CONSTANTS
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";

const PAGE_URL = `${SITE_URL}/terms`;

const SITE_NAME = "SukaMuda";

const LOGO_URL = `${SITE_URL}/logo.png`;

const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

/* =========================================================
   GLOBAL ENTITY IDS
   ========================================================= */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const WEBSITE_ID = `${SITE_URL}/#website`;

const LOGO_ID = `${SITE_URL}/#logo`;

/* =========================================================
   PAGE SEO
   ========================================================= */

const PAGE_TITLE = "Syarat & Ketentuan SukaMuda";

const PAGE_DESCRIPTION =
  "Syarat dan Ketentuan SukaMuda mengatur penggunaan website, akun pengguna, konten, hak cipta, larangan, moderasi, pengelolaan akun, serta ketentuan penggunaan platform SukaMuda.";

/* =========================================================
   LAST UPDATED
   ========================================================= */

const LAST_UPDATED = "Agustus 2026";

/* =========================================================
   ROBOTS
   ========================================================= */

const PAGE_ROBOTS =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

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
   TERMS PAGE
   ========================================================= */

const Terms = () => {
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
      /*
       * Fallback:
       * Semua section dianggap visible.
       * Konten tetap tampil walaupun browser
       * tidak mendukung IntersectionObserver.
       */
      setVisible(
        new Set([
          "nav",
          "hero",
          "general",
          "account",
          "content",
          "rights",
          "copyright",
          "restriction",
          "management",
          "closing",
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

        rootMargin: "0px 0px -30px 0px",
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

    const alreadyRegistered = refs.current.some((item) => item?.id === id);

    if (!alreadyRegistered) {
      refs.current.push(element);
    }
  };

  /* =======================================================
     VISIBILITY
     ======================================================= */

  const isVisible = (id) => visible.has(id);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="tr-root">
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

        <meta name="robots" content={PAGE_ROBOTS} />

        <meta name="googlebot" content={PAGE_ROBOTS} />

        {/* =================================================
            BRAND
            ================================================= */}

        <meta name="author" content={SITE_NAME} />

        <meta name="publisher" content={SITE_NAME} />

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

        <meta property="og:image:alt" content={PAGE_TITLE} />

        {/* =================================================
            TWITTER / X
            ================================================= */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={PAGE_TITLE} />

        <meta name="twitter:description" content={PAGE_DESCRIPTION} />

        <meta name="twitter:image" content={SHARE_IMAGE} />

        <meta name="twitter:image:alt" content={PAGE_TITLE} />

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

      <div className="tr-grid-bg" aria-hidden="true" />

      <div className="tr-wrap">
        {/* ===================================================
            NAV
            =================================================== */}

        <nav
          className={`tr-nav ${isVisible("nav") ? "tr-on" : ""}`}
          id="nav"
          ref={(element) => registerRef(element, "nav")}
          aria-label="Navigasi halaman"
        >
          <Link className="tr-logo" to="/" aria-label="SukaMuda - Beranda">
            sukamuda
          </Link>

          <div className="tr-nav-right">
            <span className="tr-nav-line" aria-hidden="true" />

            <span className="tr-nav-tag">Terms</span>
          </div>
        </nav>

        {/* ===================================================
            MAIN
            =================================================== */}

        <main className="tr-main" id="main-content">
          {/* =================================================
              HERO
              ================================================= */}

          <header
            className={`tr-hero ${isVisible("hero") ? "tr-on" : ""}`}
            id="hero"
            ref={(element) => registerRef(element, "hero")}
          >
            <div className="tr-hero-top">
              <div className="tr-hero-badge">
                <span className="tr-badge-dot" aria-hidden="true" />

                <span>Dokumen Ketentuan SukaMuda</span>
              </div>
            </div>

            <div className="tr-hero-body">
              <h1 className="tr-hero-title">
                <span className="tr-h1-line">Syarat &amp; Ketentuan</span>

                <span className="tr-h1-line tr-h1-accent">
                  Penggunaan SukaMuda
                </span>
              </h1>

              <p className="tr-hero-desc">
                Ketentuan penggunaan yang membantu menjaga SukaMuda sebagai
                platform yang aman, nyaman, bertanggung jawab, dan bermanfaat
                bagi pengguna serta pembaca.
              </p>

              <div className="tr-hero-date">
                Update Terakhir: {LAST_UPDATED}
              </div>
            </div>

            <div className="tr-hero-bottom">
              <div className="tr-hero-bar" aria-hidden="true" />
            </div>
          </header>

          {/* =================================================
              01 — KETENTUAN UMUM
              ================================================= */}

          <section
            className={`tr-sec ${isVisible("general") ? "tr-on" : ""}`}
            id="general"
            ref={(element) => registerRef(element, "general")}
            aria-labelledby="label-general"
          >
            <div className="tr-label-row" id="label-general">
              <span className="tr-label">01</span>

              <span className="tr-label-text">Ketentuan Umum</span>
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

                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>

              <div className="tr-feature-body">
                <h2>Ketentuan Umum Penggunaan</h2>

                <p>
                  Dengan mengakses atau menggunakan website SukaMuda, pengguna
                  dianggap telah membaca dan memahami Syarat &amp; Ketentuan
                  ini. Penggunaan layanan berarti pengguna setuju untuk mematuhi
                  ketentuan yang berlaku.
                </p>

                <p className="tr-feature-extra">
                  Apabila pengguna tidak menyetujui bagian tertentu dari
                  ketentuan ini, pengguna dapat menghentikan penggunaan layanan
                  SukaMuda.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              02 — LAYANAN & AKUN
              ================================================= */}

          <section
            className={`tr-sec ${isVisible("account") ? "tr-on" : ""}`}
            id="account"
            ref={(element) => registerRef(element, "account")}
            aria-labelledby="label-account"
          >
            <div className="tr-label-row" id="label-account">
              <span className="tr-label">02</span>

              <span className="tr-label-text">Layanan &amp; Akun</span>
            </div>

            <div className="tr-bento">
              <article
                className="tr-card tr-card-wide"
                style={{
                  transitionDelay: "0ms",
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
                    <circle cx="12" cy="12" r="9" />

                    <path d="M12 8v8" />

                    <path d="M9 12h6" />
                  </svg>
                </div>

                <h3>Layanan SukaMuda</h3>

                <p>
                  SukaMuda menyediakan artikel, informasi, fitur komunitas, dan
                  layanan digital lain sesuai fitur yang tersedia. Layanan dapat
                  dikembangkan, diperbarui, dibatasi, atau dihentikan sesuai
                  kebutuhan operasional.
                </p>
              </article>

              <article
                className="tr-card"
                style={{
                  transitionDelay: "70ms",
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

                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                <h3>Keamanan Akun</h3>

                <p>
                  Pengguna bertanggung jawab menjaga keamanan akun, kredensial,
                  dan aktivitas yang dilakukan melalui akun tersebut.
                </p>
              </article>

              <article
                className="tr-card"
                style={{
                  transitionDelay: "140ms",
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

                <h3>Informasi yang Benar</h3>

                <p>
                  Pengguna diharapkan memberikan informasi yang benar, tidak
                  menyesatkan, dan tidak menggunakan identitas pihak lain.
                </p>
              </article>

              <article
                className="tr-card tr-card-wide"
                style={{
                  transitionDelay: "210ms",
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

                    <circle cx="9" cy="7" r="4" />

                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <h3>Tanggung Jawab Pengguna</h3>

                <p>
                  Pengguna wajib menggunakan SukaMuda secara wajar, mematuhi
                  hukum yang berlaku, menghormati hak pengguna lain, dan tidak
                  mengganggu keamanan maupun operasional platform.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              03 — KONTEN PENGGUNA
              ================================================= */}

          <section
            className={`tr-sec ${isVisible("content") ? "tr-on" : ""}`}
            id="content"
            ref={(element) => registerRef(element, "content")}
            aria-labelledby="label-content"
          >
            <div className="tr-label-row" id="label-content">
              <span className="tr-label">03</span>

              <span className="tr-label-text">Konten Pengguna</span>
            </div>

            <div className="tr-content-card">
              <div className="tr-content-heading">
                <div className="tr-content-symbol">03</div>

                <div>
                  <h2>Konten yang Dipublikasikan</h2>

                  <p>
                    Konten pengguna harus memenuhi ketentuan platform dan tidak
                    melanggar hak pihak lain.
                  </p>
                </div>
              </div>

              <div className="tr-list-grid">
                <div className="tr-list-item">
                  <span className="tr-list-number">01</span>

                  <p>
                    Pengguna dapat mengirim artikel atau konten sesuai kategori
                    dan fitur yang tersedia.
                  </p>
                </div>

                <div className="tr-list-item">
                  <span className="tr-list-number">02</span>

                  <p>
                    Konten tidak boleh mengandung materi ilegal, menyesatkan,
                    melanggar hukum, atau melanggar hak orang lain.
                  </p>
                </div>

                <div className="tr-list-item">
                  <span className="tr-list-number">03</span>

                  <p>
                    Pengguna bertanggung jawab atas konten yang dikirimkan dan
                    memastikan memiliki hak atau izin untuk menggunakannya.
                  </p>
                </div>

                <div className="tr-list-item">
                  <span className="tr-list-number">04</span>

                  <p>
                    Konten dapat melalui proses pemeriksaan dan moderasi sebelum
                    atau setelah dipublikasikan.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              04 — HAK & KEWAJIBAN
              ================================================= */}

          <section
            className={`tr-sec ${isVisible("rights") ? "tr-on" : ""}`}
            id="rights"
            ref={(element) => registerRef(element, "rights")}
            aria-labelledby="label-rights"
          >
            <div className="tr-label-row" id="label-rights">
              <span className="tr-label">04</span>

              <span className="tr-label-text">Hak &amp; Kewajiban</span>
            </div>

            <div className="tr-rights-grid">
              <article className="tr-right-card">
                <div className="tr-right-top">
                  <span className="tr-right-index">01</span>

                  <h3>Hak Pengguna</h3>
                </div>

                <ul>
                  <li>Mengakses dan membaca konten yang tersedia.</li>

                  <li>Menggunakan fitur yang tersedia sesuai ketentuan.</li>

                  <li>
                    Mengajukan laporan atau permintaan melalui saluran yang
                    tersedia.
                  </li>
                </ul>
              </article>

              <article className="tr-right-card">
                <div className="tr-right-top">
                  <span className="tr-right-index">02</span>

                  <h3>Kewajiban Pengguna</h3>
                </div>

                <ul>
                  <li>Menggunakan layanan dengan itikad baik.</li>

                  <li>Menghormati hak cipta dan hak pihak lain.</li>

                  <li>
                    Tidak melakukan tindakan yang dapat mengganggu keamanan atau
                    layanan.
                  </li>
                </ul>
              </article>
            </div>
          </section>

          {/* =================================================
              05 — HAK CIPTA
              ================================================= */}

          <section
            className={`tr-sec ${isVisible("copyright") ? "tr-on" : ""}`}
            id="copyright"
            ref={(element) => registerRef(element, "copyright")}
            aria-labelledby="label-copyright"
          >
            <div className="tr-label-row" id="label-copyright">
              <span className="tr-label">05</span>

              <span className="tr-label-text">Hak Cipta</span>
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
                <h2>Hak Cipta dan Kekayaan Intelektual</h2>

                <p>
                  Hak atas karya yang dibuat pengguna pada prinsipnya tetap
                  berada pada pemilik haknya. Dengan mengirimkan konten,
                  pengguna memberikan izin kepada SukaMuda untuk menyimpan,
                  menampilkan, memproses, dan mempublikasikan konten tersebut
                  sepanjang diperlukan untuk penyelenggaraan layanan.
                </p>

                <p className="tr-feature-extra">
                  Pengguna tidak boleh mengirimkan karya pihak lain tanpa hak
                  atau izin yang diperlukan. Elemen milik SukaMuda, termasuk
                  logo, identitas merek, desain, dan materi yang dibuat
                  pengelola, tidak boleh digunakan tanpa izin yang sesuai.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              06 — LARANGAN
              ================================================= */}

          <section
            className={`tr-sec ${isVisible("restriction") ? "tr-on" : ""}`}
            id="restriction"
            ref={(element) => registerRef(element, "restriction")}
            aria-labelledby="label-restriction"
          >
            <div className="tr-label-row" id="label-restriction">
              <span className="tr-label">06</span>

              <span className="tr-label-text">Larangan</span>
            </div>

            <div className="tr-ban-grid">
              <article
                className="tr-ban-card"
                style={{
                  "--ban-color": "#4f46e5",
                }}
              >
                <div className="tr-ban-number">01</div>

                <h3>Keamanan Sistem</h3>

                <p>
                  Dilarang melakukan hacking, eksploitasi, spam, penyalahgunaan
                  sistem, atau aktivitas yang dapat mengganggu keamanan
                  platform.
                </p>
              </article>

              <article
                className="tr-ban-card"
                style={{
                  "--ban-color": "#db2777",
                }}
              >
                <div className="tr-ban-number">02</div>

                <h3>Informasi Menyesatkan</h3>

                <p>
                  Dilarang menyebarkan informasi palsu atau menyesatkan secara
                  sengaja dengan tujuan merugikan atau memperdaya pihak lain.
                </p>
              </article>

              <article
                className="tr-ban-card"
                style={{
                  "--ban-color": "#7c3aed",
                }}
              >
                <div className="tr-ban-number">03</div>

                <h3>Aktivitas Ilegal</h3>

                <p>
                  Dilarang menggunakan SukaMuda untuk kegiatan yang melanggar
                  hukum atau memfasilitasi pelanggaran terhadap pihak lain.
                </p>
              </article>

              <article
                className="tr-ban-card tr-ban-wide"
                style={{
                  "--ban-color": "#0891b2",
                }}
              >
                <div className="tr-ban-number">04</div>

                <h3>Penyalahgunaan Konten</h3>

                <p>
                  Dilarang melakukan plagiarisme, pelanggaran hak cipta,
                  penipuan, penghinaan, pelanggaran privasi, atau penyalahgunaan
                  layanan.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              07 — PENGELOLAAN
              ================================================= */}

          <section
            className={`tr-sec ${isVisible("management") ? "tr-on" : ""}`}
            id="management"
            ref={(element) => registerRef(element, "management")}
            aria-labelledby="label-management"
          >
            <div className="tr-label-row" id="label-management">
              <span className="tr-label">07</span>

              <span className="tr-label-text">Pengelolaan Platform</span>
            </div>

            <div className="tr-bento">
              <article
                className="tr-card"
                style={{
                  transitionDelay: "0ms",
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

                <h3>Moderasi Konten</h3>

                <p>
                  SukaMuda dapat meninjau, membatasi, menunda, mengubah, atau
                  menghapus konten yang melanggar ketentuan atau berpotensi
                  merugikan pengguna maupun platform.
                </p>
              </article>

              <article
                className="tr-card"
                style={{
                  transitionDelay: "70ms",
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
                    <circle cx="12" cy="12" r="9" />

                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>

                <h3>Penangguhan Akun</h3>

                <p>
                  Akun dapat dibatasi, ditangguhkan, atau dinonaktifkan apabila
                  terdapat pelanggaran terhadap ketentuan atau risiko keamanan.
                </p>
              </article>

              <article
                className="tr-card tr-card-wide"
                style={{
                  transitionDelay: "140ms",
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

                <h3>Perubahan Ketentuan</h3>

                <p>
                  Syarat &amp; Ketentuan dapat diperbarui dari waktu ke waktu
                  untuk mencerminkan perubahan layanan, teknologi, keamanan,
                  maupun kebutuhan operasional. Versi terbaru akan
                  dipublikasikan pada halaman ini.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              08 — PENUTUP
              ================================================= */}

          <section
            className={`tr-sec ${isVisible("closing") ? "tr-on" : ""}`}
            id="closing"
            ref={(element) => registerRef(element, "closing")}
            aria-labelledby="label-closing"
          >
            <div className="tr-label-row" id="label-closing">
              <span className="tr-label">08</span>

              <span className="tr-label-text">Penutup</span>
            </div>

            <article className="tr-closing">
              <div className="tr-closing-accent" aria-hidden="true" />

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
                <h2>Menggunakan SukaMuda dengan Bijak</h2>

                <p>
                  Dengan menggunakan SukaMuda, pengguna diharapkan memahami dan
                  mematuhi Syarat &amp; Ketentuan, Kebijakan Privasi, Aturan
                  Komunitas, serta ketentuan lain yang berlaku pada platform.
                </p>

                <p>
                  Ketentuan ini merupakan bagian dari kerangka penggunaan
                  SukaMuda dan dapat dibaca bersama dengan kebijakan lain yang
                  tersedia pada website.
                </p>
              </div>
            </article>
          </section>
        </main>

        {/* ===================================================
            FOOTER
            =================================================== */}

        <footer className="tr-foot">
          <div className="tr-foot-line" aria-hidden="true" />

          <div className="tr-foot-in">
            <Link
              to="/"
              className="tr-foot-logo"
              aria-label="SukaMuda - Beranda"
            >
              sukamuda
            </Link>

            <span className="tr-foot-c">
              © {new Date().getFullYear()} — SukaMuda
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Terms;
