import React, { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import "./FAQ.css";

/* =========================================================
   SITE
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";

const PAGE_URL = `${SITE_URL}/faq`;

const SITE_NAME = "SukaMuda";

const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

/* =========================================================
   GLOBAL ENTITY IDS
   ========================================================= */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const WEBSITE_ID = `${SITE_URL}/#website`;

const LOGO_ID = `${SITE_URL}/#logo`;

/* =========================================================
   SEO
   ========================================================= */

const PAGE_TITLE = "FAQ SukaMuda - Pertanyaan yang Sering Ditanyakan";

const PAGE_DESCRIPTION =
  "Temukan jawaban atas pertanyaan yang sering ditanyakan tentang SukaMuda, akun pengguna, pengiriman artikel, kategori, publikasi, dan aturan penggunaan platform.";

const ROBOTS =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

/* =========================================================
   FAQ DATA
   =========================================================
   Pastikan jawaban di sini selalu sama dengan isi yang
   benar-benar tampil di halaman.
   ========================================================= */

const FAQ_DATA = [
  {
    q: "Apa itu SukaMuda?",
    a: "SukaMuda adalah portal media informasi dan ruang kreativitas digital yang menghadirkan berita, edukasi, teknologi, lifestyle, hiburan, olahraga, dan berbagai informasi relevan bagi pembaca Indonesia.",
  },

  {
    q: "Siapa saja yang boleh membaca dan menggunakan SukaMuda?",
    a: "SukaMuda terbuka untuk umum. Platform ini berfokus pada informasi dan konten yang relevan bagi generasi muda Indonesia, tetapi siapa saja dapat membaca konten yang tersedia.",
  },

  {
    q: "Bagaimana cara mengirim artikel di SukaMuda?",
    a: "Pengguna yang memiliki akun dapat masuk ke SukaMuda, membuka fitur Write, mengisi kategori, judul, dan isi artikel, kemudian mengirimkannya sesuai proses publikasi yang berlaku.",
  },

  {
    q: "Kategori apa saja yang tersedia di SukaMuda?",
    a: "Kategori SukaMuda mencakup School, College, General, Style, Culinary, Traveling, Sport & E-Sport, Music & Film, Otomotif, Science, Health, Tech, dan Podcast.",
  },

  {
    q: "Bolehkah saya menyertakan gambar dalam artikel?",
    a: "Ya. Artikel dapat menggunakan gambar yang memang dimiliki atau memiliki hak dan izin untuk digunakan. Pengguna bertanggung jawab atas materi yang dikirimkan.",
  },

  {
    q: "Apakah artikel yang dikirim langsung diterbitkan?",
    a: "Tidak selalu. Artikel yang dikirim dapat melalui proses pemeriksaan dan verifikasi sesuai dengan aturan komunitas serta kebijakan editorial SukaMuda sebelum dipublikasikan.",
  },

  {
    q: "Apakah mendaftar akun di SukaMuda gratis?",
    a: "Ya. Pendaftaran akun SukaMuda tidak dikenakan biaya.",
  },

  {
    q: "Bagaimana jika saya lupa kata sandi?",
    a: 'Gunakan fitur "Lupa Kata Sandi" pada halaman login dan ikuti proses pemulihan akun yang tersedia, termasuk verifikasi melalui email atau kode OTP apabila diminta.',
  },

  {
    q: "Bagaimana SukaMuda menangani data pribadi pengguna?",
    a: "SukaMuda berupaya melindungi informasi pengguna dan memproses data sesuai kebutuhan layanan. Penjelasan lebih lengkap tersedia pada halaman Kebijakan Privasi.",
  },

  {
    q: "Konten seperti apa yang tidak diperbolehkan?",
    a: "Konten yang melanggar hukum, mengandung ujaran kebencian, pornografi, penipuan, informasi menyesatkan, plagiarisme, spam, atau pelanggaran hak cipta dapat dibatasi atau dihapus sesuai kebijakan SukaMuda.",
  },

  {
    q: "Bagaimana cara melaporkan konten yang bermasalah?",
    a: "Pengguna dapat menggunakan fitur pelaporan yang tersedia atau menghubungi tim SukaMuda melalui halaman Bantuan untuk menyampaikan laporan beserta alasan yang jelas.",
  },
];

/* =========================================================
   STRUCTURED DATA
   =========================================================
   FAQPage tidak digunakan untuk mengejar FAQ rich result.
   Breadcrumb tetap digunakan.
   ========================================================= */

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",

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

      name: "FAQ",

      item: PAGE_URL,
    },
  ],
};

/* =========================================================
   PAGE SCHEMA
   ========================================================= */

const PAGE_SCHEMA = {
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

      breadcrumb: {
        "@id": `${PAGE_URL}#breadcrumb`,
      },
    },

    {
      "@type": "ItemList",

      "@id": `${PAGE_URL}#faq-list`,

      name: "Pertanyaan Umum SukaMuda",

      numberOfItems: FAQ_DATA.length,

      itemListElement: FAQ_DATA.map((item, index) => ({
        "@type": "ListItem",

        position: index + 1,

        name: item.q,

        url: `${PAGE_URL}#faq-${index}`,
      })),
    },
  ],
};

/* =========================================================
   FAQ
   ========================================================= */

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const [visible, setVisible] = useState(() => new Set());

  const refs = useRef([]);

  /* =======================================================
     INTERSECTION OBSERVER
     ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const elements = refs.current.filter(Boolean);

    if (typeof window.IntersectionObserver !== "function") {
      setVisible(
        new Set(elements.map((element) => element.id).filter(Boolean)),
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

    elements.forEach((element) => {
      observer.observe(element);
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

    if (element.id !== id) {
      element.id = id;
    }

    const exists = refs.current.some((item) => item === element);

    if (!exists) {
      refs.current.push(element);
    }
  };

  const isVisible = (id) => visible.has(id);

  /* =======================================================
     TOGGLE
     ======================================================= */

  const toggleFAQ = (index) => {
    setOpenIndex((previous) => (previous === index ? null : index));
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="fq-root">
      <Helmet>
        {/* ===============================================
            DOCUMENT
            =============================================== */}

        <html lang="id-ID" />

        <title>{PAGE_TITLE}</title>

        <link rel="canonical" href={PAGE_URL} />

        {/* ===============================================
            DESCRIPTION
            =============================================== */}

        <meta name="description" content={PAGE_DESCRIPTION} />

        {/* ===============================================
            ROBOTS
            =============================================== */}

        <meta name="robots" content={ROBOTS} />

        <meta name="googlebot" content={ROBOTS} />

        {/* ===============================================
            BRAND
            =============================================== */}

        <meta name="author" content={SITE_NAME} />

        <meta name="publisher" content={SITE_NAME} />

        <meta name="application-name" content={SITE_NAME} />

        {/* ===============================================
            OPEN GRAPH
            =============================================== */}

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

        {/* ===============================================
            X / TWITTER
            =============================================== */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={PAGE_TITLE} />

        <meta name="twitter:description" content={PAGE_DESCRIPTION} />

        <meta name="twitter:image" content={SHARE_IMAGE} />

        <meta name="twitter:image:alt" content={PAGE_TITLE} />

        {/* ===============================================
            HREFLANG
            =============================================== */}

        <link rel="alternate" href={PAGE_URL} hrefLang="id-ID" />

        <link rel="alternate" href={PAGE_URL} hrefLang="x-default" />

        {/* ===============================================
            STRUCTURED DATA
            =============================================== */}

        <script type="application/ld+json">
          {JSON.stringify(PAGE_SCHEMA)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(BREADCRUMB_SCHEMA)}
        </script>
      </Helmet>

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="fq-grid-bg" aria-hidden="true" />

      <div className="fq-wrap">
        {/* =================================================
            NAV
            ================================================= */}

        <nav
          className={`fq-nav ${isVisible("nav") ? "fq-on" : ""}`}
          ref={(element) => registerRef(element, "nav")}
          aria-label="Navigasi utama"
        >
          <Link to="/" className="fq-logo" aria-label="SukaMuda - Beranda">
            sukamuda
          </Link>

          <div className="fq-nav-right">
            <span className="fq-nav-line" aria-hidden="true" />

            <span className="fq-nav-tag">FAQ</span>
          </div>
        </nav>

        {/* =================================================
            MAIN
            ================================================= */}

        <main className="fq-main" id="main-content">
          {/* =================================================
              HERO
              ================================================= */}

          <header
            className={`fq-hero ${isVisible("hero") ? "fq-on" : ""}`}
            ref={(element) => registerRef(element, "hero")}
          >
            <div className="fq-hero-top">
              <div className="fq-hero-badge">
                <span className="fq-badge-dot" aria-hidden="true" />

                <span>Pertanyaan Umum</span>
              </div>
            </div>

            <div className="fq-hero-body">
              <h1 className="fq-hero-title">
                <span className="fq-h1-line">Frequently Asked</span>

                <span className="fq-h1-line fq-h1-accent">Questions</span>
              </h1>

              <p className="fq-hero-desc">
                Temukan jawaban atas pertanyaan yang sering ditanyakan seputar
                SukaMuda, akun, artikel, publikasi, dan penggunaan platform.
              </p>
            </div>

            <div className="fq-hero-bottom">
              <div className="fq-hero-bar" aria-hidden="true" />
            </div>
          </header>

          {/* =================================================
              FAQ SECTION
              ================================================= */}

          <section
            className={`fq-sec ${isVisible("faq-section") ? "fq-on" : ""}`}
            ref={(element) => registerRef(element, "faq-section")}
            aria-labelledby="faq-section-title"
          >
            <div className="fq-label-row" id="faq-section-title">
              <span className="fq-label">01</span>

              <h2 className="fq-label-text">Pertanyaan &amp; Jawaban</h2>
            </div>

            <div className="fq-list">
              {FAQ_DATA.map((item, index) => {
                const isOpen = openIndex === index;

                const questionId = `faq-question-${index}`;

                const answerId = `faq-answer-${index}`;

                return (
                  <article
                    key={item.q}
                    id={`faq-${index}`}
                    ref={(element) => registerRef(element, `faq-${index}`)}
                    className={`fq-item ${isOpen ? "fq-item-open" : ""} ${
                      isVisible(`faq-${index}`) ? "fq-item-vis" : ""
                    }`}
                    style={{
                      transitionDelay: `${Math.min(index * 45, 300)}ms`,
                    }}
                  >
                    <h3 className="fq-question-heading" id={questionId}>
                      <button
                        type="button"
                        className="fq-q"
                        onClick={() => toggleFAQ(index)}
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                      >
                        <span className="fq-q-left">
                          <span className="fq-q-num" aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="fq-q-text">{item.q}</span>
                        </span>

                        <span className="fq-q-toggle" aria-hidden="true">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />

                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </span>
                      </button>
                    </h3>

                    <div
                      className={`fq-answer ${isOpen ? "fq-answer-open" : ""}`}
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                      hidden={!isOpen}
                    >
                      <div className="fq-answer-inner">
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* =================================================
              HELP CTA
              ================================================= */}

          <section
            className={`fq-sec ${isVisible("tease") ? "fq-on" : ""}`}
            ref={(element) => registerRef(element, "tease")}
            aria-labelledby="faq-help-title"
          >
            <div className="fq-tease-card">
              <div className="fq-tease-icon" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />

                  <path d="M22 7l-10 7L2 7" />
                </svg>
              </div>

              <div className="fq-tease-body">
                <h2 id="faq-help-title">Tidak menemukan jawaban?</h2>

                <p>
                  Hubungi tim SukaMuda melalui pusat bantuan untuk pertanyaan
                  atau kendala yang belum terjawab.
                </p>
              </div>

              <Link to="/help" className="fq-tease-btn">
                Hubungi Kami
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />

                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </section>
        </main>

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="fq-foot">
          <div className="fq-foot-line" aria-hidden="true" />

          <div className="fq-foot-in">
            <Link
              to="/"
              className="fq-foot-logo"
              aria-label="SukaMuda - Beranda"
            >
              sukamuda
            </Link>

            <span className="fq-foot-c">
              © {new Date().getFullYear()} — Dibuat untuk generasi muda
              Indonesia
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FAQ;
