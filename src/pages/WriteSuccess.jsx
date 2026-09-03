import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./WriteSuccess.css";

/* =========================================================
   SITE
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";
const SITE_NAME = "SukaMuda";
const PAGE_URL = `${SITE_URL}/write-success`;

const PAGE_TITLE = "Artikel Terkirim - SukaMuda";

const PAGE_DESCRIPTION =
  "Pengajuan artikel berhasil dikirim dan sedang dalam proses peninjauan oleh tim editorial SukaMuda.";

/* =========================================================
   CONFETTI CONFIG
   ========================================================= */

const CONFETTI_COUNT = 24;

const CONFETTI_COLORS = [
  "#111111",
  "#4f46e5",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

/* =========================================================
   COMPONENT
   ========================================================= */

const WriteSuccess = () => {
  const navigate = useNavigate();

  const [confetti, setConfetti] = useState([]);

  const [typingText, setTypingText] = useState("");

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const confettiLaunched = useRef(false);

  /* =======================================================
     STATIC TEXT
     ======================================================= */

  const fullText = "Artikel Terkirim";

  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);

      return () => {
        mediaQuery.removeEventListener("change", updatePreference);
      };
    }

    mediaQuery.addListener(updatePreference);

    return () => {
      mediaQuery.removeListener(updatePreference);
    };
  }, []);

  /* =======================================================
     TYPING EFFECT
     ======================================================= */

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypingText(fullText);
      return undefined;
    }

    let index = 0;
    let intervalId = null;

    const startTimeout = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;

        setTypingText(fullText.slice(0, index));

        if (index >= fullText.length) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
        }
      }, 55);
    }, 500);

    return () => {
      window.clearTimeout(startTimeout);

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [prefersReducedMotion]);

  /* =======================================================
     CONFETTI
     ======================================================= */

  useEffect(() => {
    if (prefersReducedMotion || confettiLaunched.current) {
      if (prefersReducedMotion) {
        setConfetti([]);
      }

      return undefined;
    }

    const launchTimeout = window.setTimeout(() => {
      if (confettiLaunched.current) {
        return;
      }

      confettiLaunched.current = true;

      const generated = Array.from(
        {
          length: CONFETTI_COUNT,
        },
        (_, index) => ({
          id: index,
          x: 50 + (Math.random() - 0.5) * 16,

          color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],

          w: 4 + Math.random() * 4,

          h: 2 + Math.random() * 3,

          rot: Math.random() * 360,

          vx: (Math.random() - 0.5) * 140,

          vy: -(50 + Math.random() * 120),

          spin: (Math.random() - 0.5) * 500,

          delay: Math.random() * 0.2,
        }),
      );

      setConfetti(generated);
    }, 700);

    return () => {
      window.clearTimeout(launchTimeout);
    };
  }, [prefersReducedMotion]);

  /* =======================================================
     SCHEMA
     ======================================================= */

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",

      "@type": "WebPage",

      "@id": `${PAGE_URL}#webpage`,

      url: PAGE_URL,

      name: PAGE_TITLE,

      description: PAGE_DESCRIPTION,

      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },

      about: {
        "@id": `${SITE_URL}/#organization`,
      },

      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },

      inLanguage: "id-ID",
    }),
    [],
  );

  /* =======================================================
     SAFE NAVIGATION
     ======================================================= */

  const goToProfile = () => {
    navigate("/profile");
  };

  const goToWrite = () => {
    navigate("/write");
  };

  return (
    <div className="ws-container">
      {/* ===================================================
          SEO
          =================================================== */}

      <Helmet>
        <html lang="id-ID" />

        <title>{PAGE_TITLE}</title>

        <meta name="description" content={PAGE_DESCRIPTION} />

        <meta name="robots" content="noindex,follow" />
        <meta name="googlebot" content="noindex,follow" />

        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:site_name" content={SITE_NAME} />

        <meta property="og:type" content="website" />

        <meta property="og:locale" content="id_ID" />

        <meta property="og:title" content={PAGE_TITLE} />

        <meta property="og:description" content={PAGE_DESCRIPTION} />

        <meta property="og:url" content={PAGE_URL} />

        <meta property="og:image" content={`${SITE_URL}/sukamuda-share.jpg`} />

        <meta property="og:image:width" content="1200" />

        <meta property="og:image:height" content="630" />

        <meta property="og:image:alt" content={PAGE_TITLE} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={PAGE_TITLE} />

        <meta name="twitter:description" content={PAGE_DESCRIPTION} />

        <meta name="twitter:image" content={`${SITE_URL}/sukamuda-share.jpg`} />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* ===================================================
          CONFETTI
          =================================================== */}

      {!prefersReducedMotion && (
        <div className="ws-confetti" aria-hidden="true">
          {confetti.map((item) => (
            <span
              key={item.id}
              style={{
                left: `${item.x}%`,
                top: "32%",
                width: `${item.w}px`,
                height: `${item.h}px`,
                background: item.color,
                transform: `rotate(${item.rot}deg)`,
                "--vx": `${item.vx}px`,
                "--vy": `${item.vy}px`,
                "--spin": `${item.spin}deg`,
                animationDelay: `${item.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ===================================================
          SUCCESS CARD
          =================================================== */}

      <section className="ws-card" aria-labelledby="ws-title">
        <div className="ws-shimmer" aria-hidden="true" />

        {/* =================================================
            CHECK ICON
            ================================================= */}

        <div className="ws-check" aria-hidden="true">
          <div className="ws-check-ring" />

          <svg className="ws-check-svg" viewBox="0 0 52 52" focusable="false">
            <circle
              className="ws-circle"
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="#111"
              strokeWidth="1.5"
            />

            <path
              className="ws-tick"
              fill="none"
              stroke="#111"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 26.5l7.5 7.5L37 19"
            />
          </svg>
        </div>

        {/* =================================================
            STATUS
            ================================================= */}

        <div
          className="ws-badge"
          role="status"
          aria-live="polite"
          aria-label={fullText}
        >
          <span className="ws-dot" aria-hidden="true" />

          <span className="ws-badge-text">{typingText || fullText}</span>

          {!prefersReducedMotion && typingText.length < fullText.length && (
            <span className="ws-cursor" aria-hidden="true">
              |
            </span>
          )}
        </div>

        {/* =================================================
            BODY
            ================================================= */}

        <div className="ws-body">
          <h1 className="ws-title" id="ws-title">
            <span className="ws-title-sub">Pengajuan</span>

            <span className="ws-title-main">Berhasil Dikirim</span>
          </h1>

          <p className="ws-desc">
            Terima kasih telah mengirimkan artikel Anda ke{" "}
            <strong>SukaMuda</strong>. Artikel telah kami terima dan sedang
            dalam proses peninjauan oleh tim editorial kami.
          </p>

          {/* ===============================================
              STATUS SUMMARY
              =============================================== */}

          <div className="ws-stats">
            <div className="ws-stat">
              <div className="ws-stat-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  focusable="false"
                >
                  <circle cx="12" cy="12" r="10" />

                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>

              <div className="ws-stat-text">
                <span className="ws-stat-label">Status Pengajuan</span>

                <span className="ws-stat-val">Menunggu Review</span>

                <div className="ws-bar" aria-hidden="true">
                  <div className="ws-bar-fill" />
                </div>
              </div>
            </div>

            <div className="ws-stat-line" aria-hidden="true" />

            <div className="ws-stat">
              <div className="ws-stat-icon ws-icon-green" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  focusable="false"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />

                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <div className="ws-stat-text">
                <span className="ws-stat-label">Langkah Berikutnya</span>

                <span className="ws-stat-val ws-val-green">
                  Menunggu Peninjauan
                </span>

                <div className="ws-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================
              NOTE
              =============================================== */}

          <div className="ws-note">
            <div className="ws-note-icon" aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />

                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>

            <span>
              Kamu dapat memantau status artikel melalui profil. Jika ada
              pembaruan dari tim SukaMuda, informasi tersebut akan ditampilkan
              melalui sistem notifikasi yang tersedia.
            </span>
          </div>

          {/* ===============================================
              ACTIONS
              =============================================== */}

          <div className="ws-actions">
            <button
              className="ws-btn ws-btn-primary"
              onClick={goToProfile}
              type="button"
            >
              <span>Lanjutkan ke Profil</span>

              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <line x1="5" y1="12" x2="19" y2="12" />

                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button
              className="ws-btn ws-btn-ghost"
              onClick={goToWrite}
              type="button"
            >
              <svg
                aria-hidden="true"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ws-plus"
                focusable="false"
              >
                <line x1="12" y1="5" x2="12" y2="19" />

                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>

              <span>Tulis Artikel Baru</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================
          FOOTER
          =================================================== */}

      <p className="ws-footer">
        © {new Date().getFullYear()} {SITE_NAME} — Platform Artikel Terpercaya
      </p>
    </div>
  );
};

export default WriteSuccess;
  