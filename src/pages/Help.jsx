import React, { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import "./Help.css";

/* =========================================================
   SITE
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";

const PAGE_URL = `${SITE_URL}/help`;

const SITE_NAME = "SukaMuda";

const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

/* =========================================================
   GLOBAL ENTITY IDS
   ========================================================= */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const WEBSITE_ID = `${SITE_URL}/#website`;

const LOGO_ID = `${SITE_URL}/#logo`;

/* =========================================================
   COMPANY INFORMATION
   =========================================================
   Pastikan data berikut benar-benar merupakan
   informasi resmi yang boleh dipublikasikan.
   ========================================================= */

const COMPANY = {
  name: "SukaMuda",

  email: "sukamuda50@gmail.com",

  phone: "+62 852-8731-1158",

  phoneDisplay: "0852-8731-1158",

  address:
    "Jl. KH. Ahmad Sanusi No. 195, Sukakarya, Kec. Warudoyong, Kota Sukabumi, Jawa Barat 43135",

  streetAddress: "Jl. KH. Ahmad Sanusi No. 195",

  addressLocality: "Kota Sukabumi",

  addressRegion: "Jawa Barat",

  postalCode: "43135",

  addressCountry: "ID",

  country: "Indonesia",

  instagram: "https://www.instagram.com/sukamudacoid/",

  tiktok: "https://www.tiktok.com/@suka.muda",

  threads: "https://www.threads.com/@sukamudacoid",
};

/* =========================================================
   PAGE SEO
   ========================================================= */

const PAGE_TITLE = "Pusat Bantuan & Kontak SukaMuda";

const PAGE_DESCRIPTION =
  "Pusat bantuan dan kontak resmi SukaMuda. Hubungi tim SukaMuda untuk pertanyaan layanan, kerja sama, koreksi pemberitaan, laporan konten, dan kebutuhan lainnya.";

const PAGE_ROBOTS =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

/* =========================================================
   CONTACT MESSAGE
   ========================================================= */

const EMAIL_SUBJECT = "Bantuan Layanan SukaMuda";

const EMAIL_MESSAGE = `Halo Tim SukaMuda,

Saya ingin bertanya mengenai:

[Tulis pertanyaan atau kendala di sini]

Terima kasih.`;

const GMAIL_LINK =
  "https://mail.google.com/mail/?view=cm&fs=1" +
  `&to=${encodeURIComponent(COMPANY.email)}` +
  `&su=${encodeURIComponent(EMAIL_SUBJECT)}` +
  `&body=${encodeURIComponent(EMAIL_MESSAGE)}`;

/* =========================================================
   STRUCTURED DATA
   ========================================================= */

const STRUCTURED_DATA = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "ContactPage",

      "@id": `${PAGE_URL}#contactpage`,

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

      mainEntity: {
        "@id": `${PAGE_URL}#contact`,
      },

      inLanguage: "id-ID",

      breadcrumb: {
        "@id": `${PAGE_URL}#breadcrumb`,
      },
    },

    {
      "@type": "ContactPoint",

      "@id": `${PAGE_URL}#contact`,

      contactType: "customer support",

      telephone: COMPANY.phone,

      email: COMPANY.email,

      url: PAGE_URL,

      areaServed: {
        "@type": "Country",

        name: COMPANY.country,
      },

      availableLanguage: ["id-ID"],
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

          name: "Pusat Bantuan",

          item: PAGE_URL,
        },
      ],
    },
  ],
};

/* =========================================================
   HELP
   ========================================================= */

const Help = () => {
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
        threshold: 0.1,

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

    /*
     * ID ditetapkan langsung agar
     * observer dapat menggunakan identifier
     * yang stabil.
     */
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
     RENDER
     ======================================================= */

  return (
    <div className="hl-root">
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
            X / TWITTER
            ================================================= */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={PAGE_TITLE} />

        <meta name="twitter:description" content={PAGE_DESCRIPTION} />

        <meta name="twitter:image" content={SHARE_IMAGE} />

        <meta name="twitter:image:alt" content={PAGE_TITLE} />

        {/* =================================================
            HREFLANG
            ================================================= */}

        <link rel="alternate" href={PAGE_URL} hrefLang="id-ID" />

        <link rel="alternate" href={PAGE_URL} hrefLang="x-default" />

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

      <div className="hl-grid-bg" aria-hidden="true" />

      <div className="hl-wrap">
        {/* ===================================================
            NAV
            =================================================== */}

        <nav
          className={`hl-nav ${isVisible("nav") ? "hl-on" : ""}`}
          ref={(element) => registerRef(element, "nav")}
          aria-label="Navigasi utama"
        >
          <Link to="/" className="hl-logo" aria-label="SukaMuda - Beranda">
            sukamuda
          </Link>

          <div className="hl-nav-right">
            <span className="hl-nav-line" aria-hidden="true" />

            <span className="hl-nav-tag">Support</span>
          </div>
        </nav>

        {/* ===================================================
            MAIN
            =================================================== */}

        <main className="hl-main" id="main-content">
          {/* =================================================
              HERO
              ================================================= */}

          <header
            className={`hl-hero ${isVisible("hero") ? "hl-on" : ""}`}
            ref={(element) => registerRef(element, "hero")}
          >
            <div className="hl-hero-top">
              <div className="hl-hero-badge">
                <span className="hl-badge-dot" aria-hidden="true" />

                <span>Pusat Bantuan &amp; Kontak Resmi</span>
              </div>
            </div>

            <div className="hl-hero-body">
              <h1 className="hl-hero-title">
                <span className="hl-h1-line">Butuh</span>

                <span className="hl-h1-line hl-h1-accent">Bantuan?</span>
              </h1>

              <p className="hl-hero-desc">
                Punya pertanyaan, menemukan kendala, ingin bekerja sama, atau
                ingin menyampaikan koreksi pemberitaan? Hubungi tim SukaMuda
                melalui kanal resmi kami.
              </p>
            </div>

            <div className="hl-hero-bottom">
              <div className="hl-hero-bar" aria-hidden="true" />
            </div>
          </header>

          {/* =================================================
              01 — KONTAK
              ================================================= */}

          <section
            className={`hl-sec ${isVisible("contact") ? "hl-on" : ""}`}
            ref={(element) => registerRef(element, "contact")}
            aria-labelledby="label-contact"
          >
            <div className="hl-label-row" id="label-contact">
              <span className="hl-label">01</span>

              <span className="hl-label-text">Hubungi Kami</span>
            </div>

            <a
              href={GMAIL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hl-email-card"
              aria-label={`Kirim email ke ${COMPANY.email}`}
            >
              <div className="hl-email-icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
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

              <div className="hl-email-body">
                <h2>Hubungi via Email</h2>

                <p>{COMPANY.email}</p>
              </div>

              <div className="hl-email-arrow" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />

                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </a>
          </section>

          {/* =================================================
              02 — INFORMASI KONTAK
              ================================================= */}

          <section
            className={`hl-sec ${isVisible("info") ? "hl-on" : ""}`}
            ref={(element) => registerRef(element, "info")}
            aria-labelledby="label-info"
          >
            <div className="hl-label-row" id="label-info">
              <span className="hl-label">02</span>

              <span className="hl-label-text">Informasi Kontak</span>
            </div>

            <div className="hl-info-grid">
              {/* EMAIL */}

              <article className="hl-info-card">
                <div className="hl-info-icon" aria-hidden="true">
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

                <h3>Email Resmi</h3>

                <p>
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </p>
              </article>

              {/* TELEPON */}

              <article className="hl-info-card">
                <div className="hl-info-icon" aria-hidden="true">
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
                  </svg>
                </div>

                <h3>Telepon</h3>

                <p>
                  <a href={`tel:${COMPANY.phone.replace(/[\s-]/g, "")}`}>
                    {COMPANY.phoneDisplay}
                  </a>
                </p>
              </article>

              {/* ALAMAT */}

              <article className="hl-info-card hl-info-wide">
                <div className="hl-info-icon" aria-hidden="true">
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
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />

                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div>

                <h3>Alamat Redaksi</h3>

                <address>{COMPANY.address}</address>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    COMPANY.address,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lihat lokasi di Google Maps
                </a>
              </article>
            </div>
          </section>

          {/* =================================================
              03 — KEPERLUAN KONTAK
              ================================================= */}

          <section
            className={`hl-sec ${isVisible("services") ? "hl-on" : ""}`}
            ref={(element) => registerRef(element, "services")}
            aria-labelledby="label-services"
          >
            <div className="hl-label-row" id="label-services">
              <span className="hl-label">03</span>

              <span className="hl-label-text">Keperluan Kontak</span>
            </div>

            <div className="hl-info-grid">
              <article className="hl-info-card">
                <div className="hl-info-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 4h16v16H4z" />

                    <path d="M8 8h8M8 12h8M8 16h5" />
                  </svg>
                </div>

                <h3>Koreksi Pemberitaan</h3>

                <p>
                  Sampaikan koreksi atau informasi tambahan terkait artikel yang
                  diterbitkan SukaMuda.
                </p>
              </article>

              <article className="hl-info-card">
                <div className="hl-info-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2v20M2 12h20" />

                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>

                <h3>Kerja Sama</h3>

                <p>
                  Hubungi tim kami untuk kebutuhan kerja sama yang relevan
                  dengan SukaMuda.
                </p>
              </article>

              <article className="hl-info-card">
                <div className="hl-info-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />

                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>

                <h3>Laporan Konten</h3>

                <p>
                  Laporkan konten yang dianggap melanggar pedoman atau kebijakan
                  SukaMuda.
                </p>
              </article>

              <article className="hl-info-card hl-info-wide">
                <div className="hl-info-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="9" />

                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>

                <h3>Pertanyaan Umum</h3>

                <p>
                  Untuk pertanyaan umum mengenai SukaMuda, layanan, akun,
                  publikasi, atau penggunaan situs, silakan hubungi tim melalui
                  email resmi.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              04 — CARA MENGHUBUNGI
              ================================================= */}

          <section
            className={`hl-sec ${isVisible("steps") ? "hl-on" : ""}`}
            ref={(element) => registerRef(element, "steps")}
            aria-labelledby="label-steps"
          >
            <div className="hl-label-row" id="label-steps">
              <span className="hl-label">04</span>

              <span className="hl-label-text">Cara Menghubungi</span>
            </div>

            <div className="hl-info-grid">
              <article className="hl-info-card">
                <span className="hl-step-number">01</span>

                <h3>Siapkan Detail</h3>

                <p>
                  Jelaskan pertanyaan, kendala, atau kebutuhan kamu secara
                  jelas.
                </p>
              </article>

              <article className="hl-info-card">
                <span className="hl-step-number">02</span>

                <h3>Kirim Email</h3>

                <p>Kirim pesan ke alamat email resmi SukaMuda.</p>
              </article>

              <article className="hl-info-card">
                <span className="hl-step-number">03</span>

                <h3>Tunggu Respons</h3>

                <p>
                  Tim SukaMuda akan membaca dan menindaklanjuti pesan yang
                  masuk.
                </p>
              </article>
            </div>
          </section>

          {/* =================================================
              05 — FAQ
              ================================================= */}

          <section
            className={`hl-sec ${isVisible("faq") ? "hl-on" : ""}`}
            ref={(element) => registerRef(element, "faq")}
            aria-labelledby="label-faq"
          >
            <div className="hl-label-row" id="label-faq">
              <span className="hl-label">05</span>

              <span className="hl-label-text">Pertanyaan Umum</span>
            </div>

            <div className="hl-faq-list">
              <details>
                <summary>Bagaimana cara menghubungi SukaMuda?</summary>

                <p>
                  Kamu dapat menghubungi tim SukaMuda melalui email resmi{" "}
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
                </p>
              </details>

              <details>
                <summary>Di mana alamat redaksi SukaMuda?</summary>

                <p>Alamat redaksi SukaMuda adalah {COMPANY.address}.</p>
              </details>

              <details>
                <summary>Untuk apa saya dapat menghubungi SukaMuda?</summary>

                <p>
                  Kamu dapat menghubungi kami untuk pertanyaan layanan, kerja
                  sama, koreksi pemberitaan, laporan konten, maupun pertanyaan
                  umum lainnya.
                </p>
              </details>

              <details>
                <summary>
                  Apakah SukaMuda melayani pembaca dari seluruh Indonesia?
                </summary>

                <p>
                  Ya. SukaMuda merupakan platform digital yang ditujukan untuk
                  pembaca dan generasi muda di seluruh Indonesia.
                </p>
              </details>
            </div>
          </section>

          {/* =================================================
              06 — CTA
              ================================================= */}

          <section
            className={`hl-sec ${isVisible("cta") ? "hl-on" : ""}`}
            ref={(element) => registerRef(element, "cta")}
            aria-labelledby="hl-cta-title"
          >
            <div className="hl-cta">
              <div className="hl-cta-accent" aria-hidden="true" />

              <h2 id="hl-cta-title">
                Masih Butuh
                <br />
                Bantuan?
              </h2>

              <p>
                Hubungi tim SukaMuda melalui email resmi. Jelaskan kebutuhan
                kamu dengan lengkap agar kami dapat membantu dengan tepat.
              </p>

              <div className="hl-cta-btns">
                <a
                  href={GMAIL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hl-btn-primary"
                >
                  Kirim Email
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
                </a>

                <Link to="/faq" className="hl-btn-secondary">
                  Lihat FAQ
                </Link>
              </div>

              <span className="hl-cta-note">
                <span className="hl-cta-dot" aria-hidden="true" />
                Tim SukaMuda siap membantu
              </span>
            </div>
          </section>
        </main>

        {/* ===================================================
            FOOTER
            =================================================== */}

        <footer className="hl-foot">
          <div className="hl-foot-line" aria-hidden="true" />

          <div className="hl-foot-in">
            <Link
              to="/"
              className="hl-foot-logo"
              aria-label="SukaMuda - Beranda"
            >
              sukamuda
            </Link>

            <div className="hl-foot-c">
              <span>© {new Date().getFullYear()} SukaMuda</span>

              <span>Portal berita &amp; informasi anak muda Indonesia</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Help;
