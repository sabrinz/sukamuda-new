import React, { useEffect, useRef, useState } from "react";

import { Helmet } from "react-helmet-async";

import "./Rules.css";

/* =========================================================
   SITE CONSTANTS
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";

const PAGE_URL = `${SITE_URL}/rules`;

const SITE_NAME = "SukaMuda";

/* =========================================================
   GLOBAL ENTITY IDS
   ---------------------------------------------------------
   Harus konsisten dengan index.html dan halaman publik lain.
   ========================================================= */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const WEBSITE_ID = `${SITE_URL}/#website`;

const LOGO_ID = `${SITE_URL}/#logo`;

/* =========================================================
   PAGE SEO
   ========================================================= */

const PAGE_TITLE = "Aturan Komunitas & Kebijakan Konten SukaMuda";

const PAGE_DESCRIPTION =
  "Aturan komunitas dan kebijakan konten SukaMuda yang mengatur publikasi artikel, verifikasi, hak cipta, interaksi pengguna, konten terlarang, dan sanksi pelanggaran.";

/* =========================================================
   CONSTANTS
   ========================================================= */

const CURRENT_YEAR = new Date().getFullYear();

const ROBOTS_CONTENT =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

/* =========================================================
   STRUCTURED DATA
   ---------------------------------------------------------
   Tidak membuat Organization / WebSite baru.
   Hanya mereferensikan entity global SukaMuda.
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

          name: "Aturan Komunitas",

          item: PAGE_URL,
        },
      ],
    },
  ],
};

/* =========================================================
   RULES PAGE
   ========================================================= */

const Rules = () => {
  const [visible, setVisible] = useState(() => new Set());

  const refs = useRef(new Map());

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
       * semua section dianggap visible agar konten tetap
       * tampil meskipun browser tidak mendukung observer.
       */

      setVisible(
        new Set([
          "nav",
          "hero",
          "privacy",
          "privacy-data",
          "third-party",
          "rights",
          "divider",
          "usage",
          "content-rules",
          "interaction",
          "sanctions",
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

            if (!id || !entry.isIntersecting) {
              return;
            }

            if (!next.has(id)) {
              next.add(id);
              changed = true;
            }

            observer.unobserve(entry.target);
          });

          return changed ? next : previous;
        });
      },
      {
        threshold: 0.08,

        rootMargin: "0px 0px -25px 0px",
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
     REGISTER REFS
     ======================================================= */

  const registerRef = (element, id) => {
    if (!element || !id) {
      return;
    }

    refs.current.set(id, element);
  };

  const isVisible = (id) => visible.has(id);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="rules-root">
      <Helmet>
        {/* =================================================
            LANGUAGE
            ================================================= */}

        <html lang="id-ID" />

        {/* =================================================
            TITLE
            ================================================= */}

        <title>{PAGE_TITLE}</title>

        {/* =================================================
            CANONICAL
            ================================================= */}

        <link rel="canonical" href={PAGE_URL} />

        {/* =================================================
            DESCRIPTION
            ================================================= */}

        <meta name="description" content={PAGE_DESCRIPTION} />

        {/* =================================================
            ROBOTS
            ================================================= */}

        <meta name="robots" content={ROBOTS_CONTENT} />

        <meta name="googlebot" content={ROBOTS_CONTENT} />

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
            X / TWITTER
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

      <div className="rules-grid-bg" aria-hidden="true" />

      <div className="rules-wrap">
        {/* ===================================================
            NAV
            =================================================== */}

        <nav
          className={`rules-nav ${isVisible("nav") ? "rules-on" : ""}`}
          id="nav"
          ref={(element) => registerRef(element, "nav")}
          aria-label="Navigasi halaman"
        >
          <span className="rules-logo">sukamuda</span>

          <div className="rules-nav-right">
            <span className="rules-nav-line" aria-hidden="true" />

            <span className="rules-nav-tag">Rules</span>
          </div>
        </nav>

        {/* ===================================================
            MAIN
            =================================================== */}

        <main className="rules-main" id="main-content">
          {/* =================================================
              HERO
              ================================================= */}

          <header
            className={`rules-hero ${isVisible("hero") ? "rules-on" : ""}`}
            id="hero"
            ref={(element) => registerRef(element, "hero")}
          >
            <div className="rules-hero-top">
              <div className="rules-hero-badge">
                <span className="rules-badge-dot" aria-hidden="true" />

                <span>Aturan Komunitas &amp; Kebijakan Konten</span>
              </div>
            </div>

            <div className="rules-hero-body">
              <h1 className="rules-hero-title">
                <span className="rules-h1-line">Aturan Komunitas</span>

                <span className="rules-h1-line rules-h1-accent">
                  &amp; Kebijakan Konten
                </span>
              </h1>

              <p className="rules-hero-desc">
                Panduan untuk menjaga SukaMuda tetap aman, informatif, nyaman,
                dan bertanggung jawab bagi seluruh pengguna serta pembaca.
              </p>

              <div className="rules-hero-date">Update Terakhir: April 2026</div>
            </div>

            <div className="rules-hero-bottom">
              <div className="rules-hero-bar" aria-hidden="true" />
            </div>
          </header>

          {/* =================================================
              01 — STANDAR KOMUNITAS
              ================================================= */}

          <section
            className={`rules-section ${
              isVisible("privacy") ? "rules-on" : ""
            }`}
            id="privacy"
            ref={(element) => registerRef(element, "privacy")}
            aria-labelledby="rules-label-privacy"
          >
            <div className="rules-label-row" id="rules-label-privacy">
              <span className="rules-label">01</span>

              <span className="rules-label-text">Standar Komunitas</span>
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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <div className="rules-feature-body">
                <h2>Ruang Digital yang Aman &amp; Bertanggung Jawab</h2>

                <p>
                  SukaMuda berkomitmen menyediakan ruang digital yang mendorong
                  interaksi positif, informasi yang bertanggung jawab, dan
                  kontribusi yang bermanfaat bagi pembaca.
                </p>

                <p className="rules-feature-extra">
                  Setiap pengguna diharapkan menghormati orang lain, menjaga
                  kualitas kontribusi, dan mematuhi aturan yang berlaku di
                  platform SukaMuda.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              02 — STANDAR KONTEN
              ================================================= */}

          <section
            className={`rules-section ${
              isVisible("privacy-data") ? "rules-on" : ""
            }`}
            id="privacy-data"
            ref={(element) => registerRef(element, "privacy-data")}
            aria-labelledby="rules-label-privacy-data"
          >
            <div className="rules-label-row" id="rules-label-privacy-data">
              <span className="rules-label">02</span>

              <span className="rules-label-text">Standar Konten</span>
            </div>

            <div className="rules-bento">
              <article
                className="rules-card rules-card-wide"
                style={{
                  transitionDelay: "0ms",
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
                  </svg>
                </div>

                <h3>Orisinal &amp; Relevan</h3>

                <p>
                  Artikel yang dikirim harus memiliki nilai informasi, edukasi,
                  pengalaman, atau gagasan yang relevan bagi pembaca.
                </p>
              </article>

              <article
                className="rules-card"
                style={{
                  transitionDelay: "70ms",
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

                <h3>Informatif</h3>

                <p>
                  Konten harus disajikan secara jelas dan tidak sengaja dibuat
                  untuk menyesatkan pembaca.
                </p>
              </article>

              <article
                className="rules-card"
                style={{
                  transitionDelay: "140ms",
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

                <h3>Bertanggung Jawab</h3>

                <p>
                  Penulis bertanggung jawab terhadap keakuratan dan kepatutan
                  konten yang dikirimkan.
                </p>
              </article>

              <article
                className="rules-card rules-card-wide"
                style={{
                  transitionDelay: "210ms",
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

                <h3>Kepatuhan</h3>

                <p>
                  Konten tidak boleh melanggar hukum, hak orang lain, maupun
                  ketentuan platform yang berlaku.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              03 — VERIFIKASI & MODERASI
              ================================================= */}

          <section
            className={`rules-section ${
              isVisible("third-party") ? "rules-on" : ""
            }`}
            id="third-party"
            ref={(element) => registerRef(element, "third-party")}
            aria-labelledby="rules-label-third-party"
          >
            <div className="rules-label-row" id="rules-label-third-party">
              <span className="rules-label">03</span>

              <span className="rules-label-text">
                Verifikasi &amp; Moderasi
              </span>
            </div>

            <div className="rules-rights-grid">
              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">01</span>

                  <h3>Pemeriksaan Konten</h3>
                </div>

                <p>
                  Konten dapat diperiksa sebelum atau setelah dipublikasikan
                  berdasarkan proses dan kebijakan editorial SukaMuda.
                </p>
              </article>

              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">02</span>

                  <h3>Tindakan Moderasi</h3>
                </div>

                <p>
                  Konten yang melanggar aturan dapat ditinjau, dibatasi, diubah,
                  atau dihapus sesuai tingkat pelanggaran.
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
                <circle cx="12" cy="12" r="10" />

                <line x1="12" y1="16" x2="12" y2="12" />

                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>

              <p>
                Proses moderasi dilakukan berdasarkan informasi yang tersedia
                dan aturan yang berlaku pada platform.
              </p>
            </div>
          </section>

          {/* =================================================
              04 — HAK PENGGUNA & PENULIS
              ================================================= */}

          <section
            className={`rules-section ${isVisible("rights") ? "rules-on" : ""}`}
            id="rights"
            ref={(element) => registerRef(element, "rights")}
            aria-labelledby="rules-label-rights"
          >
            <div className="rules-label-row" id="rules-label-rights">
              <span className="rules-label">04</span>

              <span className="rules-label-text">
                Hak Pengguna &amp; Penulis
              </span>
            </div>

            <div className="rules-rights-grid">
              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">01</span>

                  <h3>Hak Penulis</h3>
                </div>

                <ul>
                  <li>
                    Konten tetap menjadi karya penulis sesuai ketentuan yang
                    berlaku.
                  </li>

                  <li>
                    Penulis bertanggung jawab terhadap materi yang dikirim.
                  </li>
                </ul>
              </article>

              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">02</span>

                  <h3>Hak Platform</h3>
                </div>

                <ul>
                  <li>
                    SukaMuda dapat menampilkan konten sesuai izin dan ketentuan
                    penggunaan.
                  </li>

                  <li>Konten bermasalah dapat dibatasi atau dihapus.</li>
                </ul>
              </article>
            </div>
          </section>

          {/* =================================================
              DIVIDER
              ================================================= */}

          <div
            className={`rules-divider ${
              isVisible("divider") ? "rules-on" : ""
            }`}
            id="divider"
            ref={(element) => registerRef(element, "divider")}
            aria-hidden="true"
          >
            <div className="rules-divider-line" />
            <span className="rules-divider-dot" />
            <div className="rules-divider-line" />
          </div>

          {/* =================================================
              05 — PUBLIKASI & PENGGUNAAN
              ================================================= */}

          <section
            className={`rules-section ${isVisible("usage") ? "rules-on" : ""}`}
            id="usage"
            ref={(element) => registerRef(element, "usage")}
            aria-labelledby="rules-label-usage"
          >
            <div className="rules-label-row" id="rules-label-usage">
              <span className="rules-label">05</span>

              <span className="rules-label-text">
                Publikasi &amp; Penggunaan
              </span>
            </div>

            <div className="rules-bento">
              <article
                className="rules-card rules-card-wide"
                style={{
                  transitionDelay: "0ms",
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
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>

                <h3>Pengiriman Artikel</h3>

                <p>
                  Pengguna dapat mengirim artikel sesuai kategori dan fitur yang
                  tersedia di SukaMuda.
                </p>
              </article>

              <article
                className="rules-card"
                style={{
                  transitionDelay: "70ms",
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

                <h3>Verifikasi</h3>

                <p>
                  Konten dapat melalui proses pemeriksaan sebelum diterbitkan.
                </p>
              </article>

              <article
                className="rules-card"
                style={{
                  transitionDelay: "140ms",
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
                    <circle cx="12" cy="12" r="9" />

                    <line x1="8" y1="8" x2="16" y2="16" />

                    <line x1="16" y1="8" x2="8" y2="16" />
                  </svg>
                </div>

                <h3>Tanggung Jawab</h3>

                <p>
                  Pengguna bertanggung jawab atas materi yang dikirimkan dan
                  aktivitas yang dilakukan.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              06 — BATASAN KONTEN
              ================================================= */}

          <section
            className={`rules-section ${
              isVisible("content-rules") ? "rules-on" : ""
            }`}
            id="content-rules"
            ref={(element) => registerRef(element, "content-rules")}
            aria-labelledby="rules-label-content-rules"
          >
            <div className="rules-label-row" id="rules-label-content-rules">
              <span className="rules-label">06</span>

              <span className="rules-label-text">Batasan Konten</span>
            </div>

            <div className="rules-ban-grid">
              <article
                className="rules-ban-card"
                style={{
                  "--rules-color": "#4f46e5",
                }}
              >
                <div className="rules-ban-number">01</div>

                <h3>Kebencian &amp; Kekerasan</h3>

                <p>
                  Dilarang mengunggah konten yang mengandung ujaran kebencian,
                  pornografi, atau kekerasan.
                </p>
              </article>

              <article
                className="rules-ban-card"
                style={{
                  "--rules-color": "#db2777",
                }}
              >
                <div className="rules-ban-number">02</div>

                <h3>Hoaks &amp; Menyesatkan</h3>

                <p>
                  Dilarang menyebarkan informasi palsu atau menyesatkan secara
                  sengaja.
                </p>
              </article>

              <article
                className="rules-ban-card"
                style={{
                  "--rules-color": "#7c3aed",
                }}
              >
                <div className="rules-ban-number">03</div>

                <h3>Plagiarisme</h3>

                <p>
                  Dilarang mengambil atau menggunakan karya pihak lain tanpa hak
                  atau izin.
                </p>
              </article>

              <article
                className="rules-ban-card"
                style={{
                  "--rules-color": "#0891b2",
                }}
              >
                <div className="rules-ban-number">04</div>

                <h3>Spam</h3>

                <p>
                  Spam, promosi berlebihan, dan aktivitas yang mengganggu dapat
                  dihapus atau dibatasi.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              07 — INTERAKSI & HAK CIPTA
              ================================================= */}

          <section
            className={`rules-section ${
              isVisible("interaction") ? "rules-on" : ""
            }`}
            id="interaction"
            ref={(element) => registerRef(element, "interaction")}
            aria-labelledby="rules-label-interaction"
          >
            <div className="rules-label-row" id="rules-label-interaction">
              <span className="rules-label">07</span>

              <span className="rules-label-text">
                Interaksi &amp; Hak Cipta
              </span>
            </div>

            <div className="rules-rights-grid">
              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">01</span>

                  <h3>Komentar &amp; Interaksi</h3>
                </div>

                <ul>
                  <li>Menjaga kesopanan.</li>

                  <li>Komentar harus relevan.</li>

                  <li>Konten yang melanggar dapat dihapus.</li>
                </ul>
              </article>

              <article className="rules-right-card">
                <div className="rules-right-top">
                  <span className="rules-right-index">02</span>

                  <h3>Hak Cipta</h3>
                </div>

                <ul>
                  <li>
                    Gunakan karya sendiri atau materi yang memang memiliki hak
                    atau izin penggunaan.
                  </li>

                  <li>
                    Jangan mengklaim karya orang lain sebagai karya sendiri.
                  </li>

                  <li>Pelanggaran hak cipta tidak diperbolehkan.</li>
                </ul>
              </article>
            </div>
          </section>

          {/* =================================================
              08 — LAPORAN & SANKSI
              ================================================= */}

          <section
            className={`rules-section ${
              isVisible("sanctions") ? "rules-on" : ""
            }`}
            id="sanctions"
            ref={(element) => registerRef(element, "sanctions")}
            aria-labelledby="rules-label-sanctions"
          >
            <div className="rules-label-row" id="rules-label-sanctions">
              <span className="rules-label">08</span>

              <span className="rules-label-text">Laporan &amp; Sanksi</span>
            </div>

            <article className="rules-closing rules-sanction-card">
              <div className="rules-closing-accent" aria-hidden="true" />

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
                <h2>Gunakan Platform dengan Bijak</h2>

                <p>
                  Pelanggaran terhadap aturan dapat mengakibatkan peringatan,
                  penghapusan konten, pembatasan fitur, hingga pembatasan atau
                  pemblokiran akun sesuai tingkat pelanggaran dan kebijakan yang
                  berlaku.
                </p>
              </div>
            </article>
          </section>

          {/* =================================================
              09 — PENUTUP
              ================================================= */}

          <section
            className={`rules-section ${
              isVisible("closing") ? "rules-on" : ""
            }`}
            id="closing"
            ref={(element) => registerRef(element, "closing")}
            aria-labelledby="rules-label-closing"
          >
            <div className="rules-label-row" id="rules-label-closing">
              <span className="rules-label">09</span>

              <span className="rules-label-text">Penutup</span>
            </div>

            <article className="rules-closing">
              <div className="rules-closing-accent" aria-hidden="true" />

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
                <h2>Bersama Menjaga SukaMuda</h2>

                <p>
                  Dengan menggunakan SukaMuda, pengguna diharapkan memahami dan
                  mematuhi aturan komunitas serta kebijakan konten yang berlaku
                  demi menjaga kualitas, keamanan, dan kenyamanan bersama.
                </p>
              </div>
            </article>
          </section>
        </main>

        {/* ===================================================
            FOOTER
            =================================================== */}

        <footer className="rules-foot">
          <div className="rules-foot-line" aria-hidden="true" />

          <div className="rules-foot-in">
            <span className="rules-foot-logo">sukamuda</span>

            <span className="rules-foot-c">
              © {CURRENT_YEAR} — Dibuat untuk generasi muda Indonesia
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Rules;
