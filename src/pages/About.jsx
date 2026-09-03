import React, { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import "./About.css";

/* =========================================================
   SITE CONSTANTS
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";

const PAGE_URL = `${SITE_URL}/about`;

const SITE_NAME = "SukaMuda";

const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

/* =========================================================
   GLOBAL ENTITY IDS
   ---------------------------------------------------------
   Gunakan entity yang sama dengan index.html / halaman lain.
   Jangan membuat Organization baru di halaman ini.
   ========================================================= */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const WEBSITE_ID = `${SITE_URL}/#website`;

const LOGO_ID = `${SITE_URL}/#logo`;

/* =========================================================
   PAGE SEO
   ========================================================= */

const PAGE_TITLE = "Tentang SukaMuda - Portal Berita & Informasi Anak Muda";

const PAGE_DESCRIPTION =
  "Mengenal SukaMuda, portal berita dan informasi anak muda Indonesia yang menyajikan berita, edukasi, teknologi, lifestyle, hiburan, olahraga, dan berbagai informasi inspiratif.";

/* =========================================================
   REDACTION ADDRESS
   ---------------------------------------------------------
   Pastikan informasi ini benar-benar merupakan informasi
   resmi yang memang boleh dipublikasikan.
   ========================================================= */

const REDACTION_ADDRESS = {
  streetAddress: "Jl. KH. Ahmad Sanusi No. 195",

  addressLocality: "Sukakarya",

  addressRegion: "Jawa Barat",

  postalCode: "43135",

  addressCountry: "ID",
};

const REDACTION_ADDRESS_TEXT = (
  <>
    {REDACTION_ADDRESS.streetAddress}
    <br />
    Sukakarya, Kec. Warudoyong
    <br />
    Kota Sukabumi, {REDACTION_ADDRESS.addressRegion}{" "}
    {REDACTION_ADDRESS.postalCode}
    <br />
    Indonesia
  </>
);

/* =========================================================
   CATEGORY LINKS
   ---------------------------------------------------------
   Diselaraskan dengan slug kategori yang digunakan portal.
   ========================================================= */

const ABOUT_CATEGORIES = [
  {
    name: "News",
    slug: "general",
    description: "Informasi dan kabar terkini.",
    color: "#4f46e5",
  },

  {
    name: "Tech",
    slug: "tech",
    description: "Teknologi, tren digital, dan inovasi.",
    color: "#7c3aed",
  },

  {
    name: "Sport & E-Sport",
    slug: "sport",
    description: "Berita dan informasi dunia olahraga serta e-sport.",
    color: "#059669",
  },

  {
    name: "Music & Film",
    slug: "music",
    description: "Musik, film, hiburan, dan budaya populer.",
    color: "#ca8a04",
  },

  {
    name: "Lifestyle",
    slug: "style",
    description: "Gaya hidup dan kehidupan sehari-hari.",
    color: "#db2777",
  },

  {
    name: "Health",
    slug: "health",
    description: "Informasi kesehatan dan kebiasaan hidup.",
    color: "#0891b2",
  },
];

/* =========================================================
   STRUCTURED DATA
   ========================================================= */

const STRUCTURED_DATA = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "AboutPage",

      "@id": `${PAGE_URL}#webpage`,

      url: PAGE_URL,

      name: PAGE_TITLE,

      headline: "Tentang SukaMuda",

      description: PAGE_DESCRIPTION,

      isPartOf: {
        "@id": WEBSITE_ID,
      },

      about: {
        "@id": ORGANIZATION_ID,
      },

      mainEntity: {
        "@id": ORGANIZATION_ID,
      },

      publisher: {
        "@id": ORGANIZATION_ID,
      },

      primaryImageOfPage: {
        "@id": LOGO_ID,
      },

      breadcrumb: {
        "@id": `${PAGE_URL}#breadcrumb`,
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

          name: "Tentang SukaMuda",

          item: PAGE_URL,
        },
      ],
    },
  ],
};

/* =========================================================
   ABOUT
   ========================================================= */

const About = () => {
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
       * Jika IntersectionObserver tidak tersedia,
       * tampilkan semua section agar konten tetap terlihat.
       */
      setVisible(
        new Set([
          "nav",
          "hero",
          "visi",
          "misi",
          "kat",
          "how",
          "com",
          "alamat",
          "cta",
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
        threshold: 0.1,

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

    refs.current.set(id, element);
  };

  const isVisible = (id) => visible.has(id);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="x-root">
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

        <meta property="og:image:alt" content={"SukaMuda - Tentang Kami"} />

        {/* =================================================
            TWITTER / X
            ================================================= */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={PAGE_TITLE} />

        <meta name="twitter:description" content={PAGE_DESCRIPTION} />

        <meta name="twitter:image" content={SHARE_IMAGE} />

        <meta name="twitter:image:alt" content={"SukaMuda - Tentang Kami"} />

        {/* =================================================
            STRUCTURED DATA
            ================================================= */}

        <script type="application/ld+json">
          {JSON.stringify(STRUCTURED_DATA)}
        </script>
      </Helmet>

      {/* =======================================================
          BACKGROUND DECORATION
          ======================================================= */}

      <div className="x-grid-bg" aria-hidden="true" />

      <div className="x-wrap">
        {/* =====================================================
            NAVIGATION
            ===================================================== */}

        <nav
          className={`x-nav ${isVisible("nav") ? "x-on" : ""}`}
          id="nav"
          ref={(element) => registerRef(element, "nav")}
          aria-label="Navigasi utama"
        >
          <Link to="/" className="x-logo" aria-label="SukaMuda - Beranda">
            SukaMuda
          </Link>

          <div className="x-nav-right">
            <span className="x-nav-line" aria-hidden="true" />

            <span className="x-nav-tag">Tentang Kami</span>
          </div>
        </nav>

        {/* =====================================================
            MAIN
            ===================================================== */}

        <main className="x-main" id="main-content">
          {/* ===================================================
              HERO
              =================================================== */}

          <header
            className={`x-hero ${isVisible("hero") ? "x-on" : ""}`}
            id="hero"
            ref={(element) => registerRef(element, "hero")}
          >
            <div className="x-hero-top">
              <div className="x-hero-badge">
                <span className="x-badge-dot" aria-hidden="true" />

                <span>Portal Digital untuk Generasi Muda Indonesia</span>
              </div>
            </div>

            <div className="x-hero-body">
              <h1 className="x-hero-title">
                <span className="x-h1-line">Ruang Berita,</span>

                <span className="x-h1-line x-h1-accent">
                  Ide &amp; Kreativitas
                </span>
              </h1>

              <p className="x-hero-desc">
                SukaMuda adalah portal berita dan informasi untuk anak muda
                Indonesia. Kami menghadirkan informasi, wawasan, edukasi, dan
                berbagai cerita yang relevan dengan kehidupan generasi muda di
                era digital.
              </p>
            </div>

            <div className="x-hero-bottom">
              <div className="x-hero-bar" aria-hidden="true" />
            </div>
          </header>

          {/* ===================================================
              VISI
              =================================================== */}

          <section
            className={`x-sec ${isVisible("visi") ? "x-on" : ""}`}
            id="visi"
            ref={(element) => registerRef(element, "visi")}
            aria-labelledby="label-visi"
          >
            <div className="x-label-row" id="label-visi">
              <span className="x-label">01</span>

              <span className="x-label-text">Visi</span>
            </div>

            <article className="x-visi">
              <div className="x-visi-deco" aria-hidden="true">
                <div className="x-visi-ring" />
                <div className="x-visi-ring x-visi-ring2" />
                <div className="x-visi-dot" />
              </div>

              <div className="x-visi-body">
                <h2>
                  Menjadi platform media digital yang mendorong kreativitas,
                  literasi, dan kontribusi positif generasi muda di era digital.
                </h2>

                <p>
                  SukaMuda hadir sebagai ruang untuk menemukan informasi,
                  berbagi gagasan, memperluas wawasan, dan mendorong karya yang
                  memberikan nilai positif bagi masyarakat.
                </p>
              </div>
            </article>
          </section>

          {/* ===================================================
              MISI
              =================================================== */}

          <section
            className={`x-sec ${isVisible("misi") ? "x-on" : ""}`}
            id="misi"
            ref={(element) => registerRef(element, "misi")}
            aria-labelledby="label-misi"
          >
            <div className="x-label-row" id="label-misi">
              <span className="x-label">02</span>

              <span className="x-label-text">Misi</span>
            </div>

            <div className="x-bento">
              <article
                className="x-ben x-ben-wide"
                style={{
                  transitionDelay: "0ms",
                }}
              >
                <div className="x-ben-icon">
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

                <h3>Ruang Informasi yang Aman &amp; Terpercaya</h3>

                <p>
                  Menyediakan informasi yang relevan, bertanggung jawab, dan
                  disajikan dengan memperhatikan kualitas serta kredibilitas
                  konten.
                </p>
              </article>

              <article
                className="x-ben"
                style={{
                  transitionDelay: "70ms",
                }}
              >
                <div className="x-ben-icon">
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
                    <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </div>

                <h3>Mendorong Berkarya</h3>

                <p>
                  Memberikan ruang bagi ide, tulisan, dan kreativitas yang dapat
                  memberikan manfaat bagi pembaca.
                </p>
              </article>

              <article
                className="x-ben"
                style={{
                  transitionDelay: "140ms",
                }}
              >
                <div className="x-ben-icon">
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
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>

                <h3>Konten Berkualitas</h3>

                <p>
                  Mengutamakan konten yang informatif, edukatif, relevan, dan
                  memberikan nilai bagi pembaca.
                </p>
              </article>

              <article
                className="x-ben x-ben-full"
                style={{
                  transitionDelay: "210ms",
                }}
              >
                <div className="x-ben-icon">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <h3>Komunitas yang Saling Mendukung</h3>

                <p>
                  Membangun ruang digital yang mendorong interaksi positif,
                  saling menghargai, berbagi wawasan, dan berkembang bersama.
                </p>
              </article>
            </div>
          </section>

          {/* ===================================================
              KATEGORI
              =================================================== */}

          <section
            className={`x-sec ${isVisible("kat") ? "x-on" : ""}`}
            id="kat"
            ref={(element) => registerRef(element, "kat")}
            aria-labelledby="label-kat"
          >
            <div className="x-label-row" id="label-kat">
              <span className="x-label">03</span>

              <span className="x-label-text">Kategori</span>
            </div>

            <div className="x-kat-grid">
              {ABOUT_CATEGORIES.map((category, index) => (
                <Link
                  className="x-kat"
                  key={category.slug}
                  to={`/category/${encodeURIComponent(category.slug)}`}
                  style={{
                    "--kc": category.color,
                    transitionDelay: `${index * 55}ms`,
                  }}
                  aria-label={`Lihat kategori ${category.name}`}
                >
                  <div
                    className="x-kat-bar"
                    style={{
                      background: category.color,
                    }}
                    aria-hidden="true"
                  />

                  <h3>{category.name}</h3>

                  <p>{category.description}</p>

                  <svg
                    className="x-kat-arr"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={category.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />

                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              ))}
            </div>

            <div className="x-alert" role="note">
              <svg
                width="16"
                height="16"
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
                SukaMuda mengutamakan kualitas, relevansi, dan tanggung jawab
                dalam penyajian informasi.
              </p>
            </div>
          </section>

          {/* ===================================================
              CARA KERJA
              =================================================== */}

          <section
            className={`x-sec ${isVisible("how") ? "x-on" : ""}`}
            id="how"
            ref={(element) => registerRef(element, "how")}
            aria-labelledby="label-how"
          >
            <div className="x-label-row" id="label-how">
              <span className="x-label">04</span>

              <span className="x-label-text">Cara Kerja</span>
            </div>

            <div className="x-steps">
              {[
                {
                  t: "Daftar Akun",
                  d: "Buat akun untuk menggunakan fitur yang tersedia di SukaMuda.",
                  ic: (
                    <svg
                      width="20"
                      height="20"
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
                  ),
                },

                {
                  t: "Tulis Artikel",
                  d: "Tuangkan ide, opini, pengalaman, atau pengetahuan dalam bentuk artikel.",
                  ic: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  ),
                },

                {
                  t: "Verifikasi",
                  d: "Konten diperiksa sesuai proses dan kebijakan editorial yang berlaku.",
                  ic: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />

                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  ),
                },

                {
                  t: "Tayang",
                  d: "Artikel yang memenuhi ketentuan dapat diterbitkan dan dibaca oleh pengunjung.",
                  ic: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  ),
                },
              ].map((step, index) => (
                <div
                  className="x-step"
                  key={step.t}
                  style={{
                    transitionDelay: `${index * 90}ms`,
                  }}
                >
                  <div className="x-step-track">
                    <div className="x-step-circle">{step.ic}</div>

                    {index < 3 && (
                      <div className="x-step-line" aria-hidden="true" />
                    )}
                  </div>

                  <div className="x-step-body">
                    <span className="x-step-n" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3>{step.t}</h3>

                    <p>{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===================================================
              KOMITMEN
              =================================================== */}

          <section
            className={`x-sec ${isVisible("com") ? "x-on" : ""}`}
            id="com"
            ref={(element) => registerRef(element, "com")}
            aria-labelledby="label-com"
          >
            <div className="x-label-row" id="label-com">
              <span className="x-label">05</span>

              <span className="x-label-text">Komitmen</span>
            </div>

            <div className="x-com-grid">
              {[
                {
                  t: "Kualitas Konten",
                  d: "Mengutamakan konten yang orisinal, relevan, informatif, dan bertanggung jawab.",
                  ic: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ),
                },

                {
                  t: "Privasi Pengguna",
                  d: "Menghargai privasi dan keamanan data pengguna sesuai kebijakan yang berlaku.",
                  ic: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />

                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ),
                },

                {
                  t: "Pengalaman Membaca",
                  d: "Mengembangkan pengalaman membaca yang bersih, mudah digunakan, dan nyaman.",
                  ic: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  ),
                },

                {
                  t: "Berkelanjutan",
                  d: "Terus mengembangkan platform, kualitas informasi, dan layanan untuk pembaca.",
                  ic: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  ),
                },
              ].map((commitment, index) => (
                <article
                  className="x-com"
                  key={commitment.t}
                  style={{
                    transitionDelay: `${index * 70}ms`,
                  }}
                >
                  <div className="x-com-ic">{commitment.ic}</div>

                  <div>
                    <h3>{commitment.t}</h3>

                    <p>{commitment.d}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ===================================================
              REDAKSI
              =================================================== */}

          <section
            className={`x-sec ${isVisible("alamat") ? "x-on" : ""}`}
            id="alamat"
            ref={(element) => registerRef(element, "alamat")}
            aria-labelledby="label-alamat"
          >
            <div className="x-label-row" id="label-alamat">
              <span className="x-label">06</span>

              <span className="x-label-text">Redaksi</span>
            </div>

            <div className="x-adr">
              <div className="x-adr-head">
                <span className="x-adr-label">SukaMuda</span>

                <span className="x-adr-line" aria-hidden="true" />
              </div>

              <div className="x-adr-body">
                <h2 className="x-adr-title">Alamat &amp; Kontak Redaksi</h2>

                <p className="x-adr-desc">
                  SukaMuda adalah portal berita dan informasi anak muda
                  Indonesia. Untuk pertanyaan, koreksi informasi, kerja sama,
                  maupun keperluan editorial, silakan menghubungi kontak resmi
                  SukaMuda.
                </p>

                <div className="x-adr-grid">
                  <div className="x-adr-card">
                    <span className="x-adr-key">Alamat Redaksi</span>

                    <address className="x-adr-val">
                      {REDACTION_ADDRESS_TEXT}
                    </address>
                  </div>

                  <div className="x-adr-card">
                    <span className="x-adr-key">Email Redaksi</span>

                    <span className="x-adr-val">
                      <a
                        className="x-adr-link"
                        href="mailto:sukamuda50@gmail.com"
                      >
                        sukamuda50@gmail.com
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
              CTA
              =================================================== */}

          <section
            className={`x-sec ${isVisible("cta") ? "x-on" : ""}`}
            id="cta"
            ref={(element) => registerRef(element, "cta")}
            aria-labelledby="cta-title"
          >
            <div className="x-cta">
              <div className="x-cta-accent" aria-hidden="true" />

              <h2 id="cta-title">
                Temukan
                <br />
                SukaMuda
              </h2>

              <p>
                Jelajahi berita, informasi, edukasi, teknologi, lifestyle,
                hiburan, olahraga, dan berbagai konten lainnya di SukaMuda.
              </p>

              <div className="x-cta-btns">
                <Link className="x-btn-p" to="/">
                  Jelajahi SukaMuda
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />

                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>

                <Link className="x-btn-s" to="/faq">
                  FAQ
                </Link>
              </div>

              <span className="x-cta-note">
                <span className="x-cta-dot" aria-hidden="true" />
                Portal berita &amp; informasi anak muda Indonesia
              </span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default About;
