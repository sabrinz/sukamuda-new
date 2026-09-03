import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Routes,
  Route,
  useLocation,
  useNavigationType,
  matchRoutes,
  Link,
} from "react-router-dom";

import { Helmet } from "react-helmet-async";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import CookieConsent, {
  getCookieConsentValue,
} from "react-cookie-consent";

import Home from "./pages/Home";
import ArticleDetail from "./pages/ArticleDetail";

/* =========================================================
   LAZY ROUTES
   ========================================================= */

const Category = lazy(
  () => import("./pages/Category")
);

const VideoReelsPage = lazy(
  () => import("./pages/VideoReelsPage")
);

const Search = lazy(
  () => import("./pages/Search")
);

const About = lazy(
  () => import("./pages/About")
);

const Login = lazy(
  () => import("./pages/Login")
);

const ForgotPassword = lazy(
  () => import("./pages/ForgotPassword")
);

const Register = lazy(
  () => import("./pages/Register")
);

const VerifyOtp = lazy(
  () => import("./pages/VerifyOtp")
);

const Interests = lazy(
  () => import("./pages/Interests")
);

const Success = lazy(
  () => import("./pages/Success")
);

const Profile = lazy(
  () => import("./pages/Profile")
);

const AdminDashboard = lazy(
  () => import("./pages/AdminDashboard")
);

const Notifications = lazy(
  () => import("./pages/Notifications")
);

const Write = lazy(
  () => import("./pages/Write")
);

const WriteSuccess = lazy(
  () => import("./pages/WriteSuccess")
);

const Rules = lazy(
  () => import("./pages/Rules")
);

const Terms = lazy(
  () => import("./pages/Terms")
);

const Privacy = lazy(
  () => import("./pages/Privacy")
);

const Help = lazy(
  () => import("./pages/Help")
);

const FAQ = lazy(
  () => import("./pages/FAQ")
);

const PublicProfile = lazy(
  () => import("./pages/PublicProfile")
);

const NotFound = lazy(
  () => import("./pages/NotFound")
);

/* =========================================================
   SITE CONSTANTS
   ========================================================= */

const SITE_URL =
  "https://sukamuda.co.id";

const SITE_NAME =
  "SukaMuda";

const DEFAULT_TITLE =
  "SukaMuda - Portal Berita & Informasi Anak Muda Indonesia";

const DEFAULT_DESCRIPTION =
  "SukaMuda adalah portal berita dan informasi anak muda Indonesia yang menyajikan berita terkini, edukasi, teknologi, lifestyle, hiburan, olahraga, dan berbagai informasi inspiratif.";

const DEFAULT_OG_IMAGE =
  `${SITE_URL}/sukamuda-share.jpg`;

const ROBOTS_INDEX =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

const ROBOTS_NOINDEX_FOLLOW =
  "noindex,follow";

const ROBOTS_NOINDEX_NOFOLLOW =
  "noindex,nofollow";

/* =========================================================
   CONSENT CONSTANTS
   ========================================================= */

const CONSENT_STORAGE_KEY =
  "sukamuda_consent";

const CONSENT_EVENT =
  "sukamuda:consent";

const CONSENT_COOKIE_NAME =
  "sukamudaCookieConsent";

/* =========================================================
   ROUTE CONFIGURATION
   ========================================================= */

const ROUTE_CONFIG = [
  {
    path: "/",
    Component: Home,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/category/:slug",
    Component: Category,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/article/:slug",
    Component: ArticleDetail,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/about",
    Component: About,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/rules",
    Component: Rules,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/terms",
    Component: Terms,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/privacy",
    Component: Privacy,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/help",
    Component: Help,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/faq",
    Component: FAQ,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/user/:userId",
    Component: PublicProfile,
    robots: ROBOTS_INDEX,
  },

  {
    path: "/search",
    Component: Search,
    robots: ROBOTS_NOINDEX_FOLLOW,
  },

  {
    path: "/video-reels",
    Component: VideoReelsPage,
    robots: ROBOTS_NOINDEX_FOLLOW,
  },

  {
    path: "/login",
    Component: Login,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
  },

  {
    path: "/forgot-password",
    Component: ForgotPassword,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
  },

  {
    path: "/register",
    Component: Register,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
  },

  {
    path: "/verify-otp",
    Component: VerifyOtp,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
  },

  {
    path: "/interests",
    Component: Interests,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
  },

  {
    path: "/success",
    Component: Success,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
  },

  {
    path: "/admin",
    Component: AdminDashboard,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
    protected: true,
  },

  {
    path: "/profile",
    Component: Profile,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
    protected: true,
  },

  {
    path: "/notifications",
    Component: Notifications,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
    protected: true,
  },

  {
    path: "/write",
    Component: Write,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
    protected: true,
  },

  {
    path: "/write-success",
    Component: WriteSuccess,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
    protected: true,
  },

  {
    path: "*",
    Component: NotFound,
    robots: ROBOTS_NOINDEX_NOFOLLOW,
    notFound: true,
  },
];

/* =========================================================
   ROUTE MATCHERS
   ========================================================= */

const ROUTE_MATCHERS =
  ROUTE_CONFIG.map(
    ({ path }) => ({
      path,
    })
  );

/* =========================================================
   FIND CURRENT ROUTE
   ========================================================= */

function findCurrentRoute(
  pathname
) {
  const matches =
    matchRoutes(
      ROUTE_MATCHERS,
      pathname || "/"
    );

  if (
    !matches ||
    matches.length === 0
  ) {
    return (
      ROUTE_CONFIG[
        ROUTE_CONFIG.length - 1
      ]
    );
  }

  const matchedPath =
    matches[
      matches.length - 1
    ]?.route?.path;

  return (
    ROUTE_CONFIG.find(
      (route) =>
        route.path ===
        matchedPath
    ) ||
    ROUTE_CONFIG[
      ROUTE_CONFIG.length - 1
    ]
  );
}

/* =========================================================
   CANONICAL URL
   ========================================================= */

function buildCanonicalUrl(
  pathname,
  search
) {
  const rawPath =
    String(
      pathname || "/"
    ).trim();

  if (
    !rawPath ||
    rawPath === "/"
  ) {
    return `${SITE_URL}/`;
  }

  let normalizedPath =
    rawPath
      .replace(
        /\/{2,}/g,
        "/"
      )
      .toLowerCase();

  if (
    normalizedPath.length > 1 &&
    normalizedPath.endsWith("/")
  ) {
    normalizedPath =
      normalizedPath.slice(
        0,
        -1
      );
  }

  const params =
    new URLSearchParams(
      search || ""
    );

  const rawPage =
    params.get("page");

  const page =
    Number(rawPage);

  const canonicalPage =
    Number.isInteger(page) &&
    page > 1
      ? page
      : null;

  const query =
    canonicalPage
      ? `?page=${canonicalPage}`
      : "";

  return `${SITE_URL}${
    normalizedPath || "/"
  }${query}`;
}

/* =========================================================
   GA4 PAGE VIEW
   ========================================================= */

function trackPageView(
  location
) {
  if (
    typeof window ===
      "undefined" ||
    typeof window.gtag !==
      "function"
  ) {
    return;
  }

  const pagePath =
    `${location.pathname}${location.search}`;

  try {
    window.gtag(
      "event",
      "page_view",
      {
        page_path:
          pagePath,

        page_location:
          window.location.href,

        page_title:
          document.title ||
          DEFAULT_TITLE,
      }
    );
  } catch {
    /* analytics tidak boleh merusak aplikasi */
  }
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const location =
    useLocation();

  const navigationType =
    useNavigationType();

  /* =======================================================
     CURRENT ROUTE
     ======================================================= */

  const currentRoute =
    useMemo(
      () =>
        findCurrentRoute(
          location.pathname
        ),
      [location.pathname]
    );

  /* =======================================================
     CANONICAL
     ======================================================= */

  const canonicalUrl =
    useMemo(
      () =>
        buildCanonicalUrl(
          location.pathname,
          location.search
        ),
      [
        location.pathname,
        location.search,
      ]
    );

  /* =======================================================
     ACCESSIBILITY ANNOUNCEMENT
     ======================================================= */

  const [
    routeAnnouncement,
    setRouteAnnouncement,
  ] = useState("");

  /* =======================================================
     PAGE VIEW DEDUPLICATION
     ======================================================= */

  const lastTrackedPathRef =
    useRef(null);

  /* =======================================================
     ROUTE NAVIGATION / GA4
     ======================================================= */

  useEffect(() => {
    const pagePath =
      `${location.pathname}${location.search}`;

    if (
      lastTrackedPathRef.current ===
      pagePath
    ) {
      return undefined;
    }

    lastTrackedPathRef.current =
      pagePath;

    if (
      navigationType !==
      "POP"
    ) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }

    let cancelled = false;
    let frame1 = null;
    let frame2 = null;

    frame1 =
      window.requestAnimationFrame(
        () => {
          frame2 =
            window.requestAnimationFrame(
              () => {
                if (cancelled) {
                  return;
                }

                const title =
                  document.title ||
                  DEFAULT_TITLE;

                setRouteAnnouncement(
                  title
                );

                trackPageView(
                  location
                );
              }
            );
        }
      );

    return () => {
      cancelled = true;

      if (
        frame1 !== null
      ) {
        window.cancelAnimationFrame(
          frame1
        );
      }

      if (
        frame2 !== null
      ) {
        window.cancelAnimationFrame(
          frame2
        );
      }
    };
  }, [
    location.pathname,
    location.search,
    navigationType,
  ]);

  /* =======================================================
     CONSENT
     ======================================================= */

  const applyConsent =
    useCallback(
      (granted) => {
        const value =
          granted
            ? "granted"
            : "denied";

        /* -----------------------------------------------
           LOCAL STORAGE
           ----------------------------------------------- */

        try {
          localStorage.setItem(
            CONSENT_STORAGE_KEY,
            value
          );
        } catch {
          /* no-op */
        }

        /* -----------------------------------------------
           GOOGLE CONSENT MODE
           ----------------------------------------------- */

        if (
          typeof window !==
            "undefined" &&
          typeof window.gtag ===
            "function"
        ) {
          try {
            window.gtag(
              "consent",
              "update",
              {
                ad_storage:
                  value,

                ad_user_data:
                  value,

                ad_personalization:
                  value,

                analytics_storage:
                  value,

                personalization_storage:
                  value,

                functionality_storage:
                  "granted",

                security_storage:
                  "granted",
              }
            );

            window.gtag(
              "set",
              "ads_data_redaction",
              !granted
            );

            window.gtag(
              "set",
              "url_passthrough",
              true
            );
          } catch {
            /* Google tidak boleh merusak UI */
          }
        }

        /* -----------------------------------------------
           INTERNAL AD EVENT
           ----------------------------------------------- */

        try {
          window.dispatchEvent(
            new CustomEvent(
              CONSENT_EVENT,
              {
                detail: {
                  granted,
                },
              }
            )
          );
        } catch {
          /* no-op */
        }
      },
      []
    );

  /* =======================================================
     RESTORE EXISTING CONSENT
     ======================================================= */

  useEffect(() => {
    let cookieConsent =
      null;

    let localConsent =
      null;

    try {
      cookieConsent =
        getCookieConsentValue(
          CONSENT_COOKIE_NAME
        );
    } catch {
      cookieConsent =
        null;
    }

    try {
      localConsent =
        localStorage.getItem(
          CONSENT_STORAGE_KEY
        );
    } catch {
      localConsent =
        null;
    }

    /* Cookie menjadi sumber utama */

    if (
      cookieConsent ===
      "true"
    ) {
      applyConsent(true);
      return;
    }

    if (
      cookieConsent ===
      "false"
    ) {
      applyConsent(false);
      return;
    }

    /* LocalStorage fallback */

    if (
      localConsent ===
      "granted"
    ) {
      applyConsent(true);
      return;
    }

    if (
      localConsent ===
      "denied"
    ) {
      applyConsent(false);
      return;
    }

    /*
     * Belum ada keputusan.
     * Jangan mengaktifkan consent secara otomatis.
     */
  }, [applyConsent]);

  /* =======================================================
     COOKIE ACCEPT
     ======================================================= */

  const handleAcceptCookie =
    useCallback(() => {
      applyConsent(true);
    }, [applyConsent]);

  /* =======================================================
     COOKIE DECLINE
     ======================================================= */

  const handleDeclineCookie =
    useCallback(() => {
      applyConsent(false);
    }, [applyConsent]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      {/* =================================================
          GLOBAL ROUTE SEO
          ================================================= */}

      <Helmet>
        <html lang="id-ID" />

        <title>
          {DEFAULT_TITLE}
        </title>

        <meta
          name="description"
          content={
            DEFAULT_DESCRIPTION
          }
        />

        <link
          rel="canonical"
          href={canonicalUrl}
        />

        <meta
          name="robots"
          content={
            currentRoute.robots
          }
        />

        <meta
          name="googlebot"
          content={
            currentRoute.robots
          }
        />

        <meta
          property="og:site_name"
          content={SITE_NAME}
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:locale"
          content="id_ID"
        />

        <meta
          property="og:title"
          content={
            DEFAULT_TITLE
          }
        />

        <meta
          property="og:description"
          content={
            DEFAULT_DESCRIPTION
          }
        />

        <meta
          property="og:url"
          content={canonicalUrl}
        />

        <meta
          property="og:image"
          content={
            DEFAULT_OG_IMAGE
          }
        />

        <meta
          property="og:image:secure_url"
          content={
            DEFAULT_OG_IMAGE
          }
        />

        <meta
          property="og:image:type"
          content="image/jpeg"
        />

        <meta
          property="og:image:width"
          content="1200"
        />

        <meta
          property="og:image:height"
          content="630"
        />

        <meta
          property="og:image:alt"
          content={
            DEFAULT_TITLE
          }
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={
            DEFAULT_TITLE
          }
        />

        <meta
          name="twitter:description"
          content={
            DEFAULT_DESCRIPTION
          }
        />

        <meta
          name="twitter:image"
          content={
            DEFAULT_OG_IMAGE
          }
        />

        <meta
          name="twitter:image:alt"
          content={
            DEFAULT_TITLE
          }
        />
      </Helmet>

      {/* =================================================
          APPLICATION
          ================================================= */}

      <div className="app-container">

        {/* =================================================
            SKIP LINK
            ================================================= */}

        <a
          className="skip-link"
          href="#main-content"
        >
          Lompat ke konten utama
        </a>

        {/* =================================================
            NAVBAR
            ================================================= */}

        <Navbar />

        {/* =================================================
            MAIN CONTENT
            ================================================= */}

        <main
          id="main-content"
          className="app-main"
          tabIndex={-1}
        >
          <Suspense
            fallback={
              <div
                className="loading-screen"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <span
                  className="loading-screen__spinner"
                  aria-hidden="true"
                />

                <span>
                  Memuat halaman...
                </span>
              </div>
            }
          >
            <Routes>
              {ROUTE_CONFIG.map(
                ({
                  path,
                  Component,
                  protected:
                    isProtected,
                }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      isProtected ? (
                        <ProtectedRoute>
                          <Component />
                        </ProtectedRoute>
                      ) : (
                        <Component />
                      )
                    }
                  />
                )
              )}
            </Routes>
          </Suspense>
        </main>

        {/* =================================================
            FOOTER
            ================================================= */}

        <Footer />

        {/* =================================================
            SCREEN READER ANNOUNCER
            ================================================= */}

        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {routeAnnouncement}
        </div>

        {/* =================================================
            COOKIE CONSENT
            ================================================= */}

        <CookieConsent
          location="bottom"
          buttonText="Saya Setuju"
          declineButtonText="Tolak"
          enableDeclineButton
          flipButtons
          cookieName={
            CONSENT_COOKIE_NAME
          }
          expires={180}
          onAccept={
            handleAcceptCookie
          }
          onDecline={
            handleDeclineCookie
          }
          ariaAcceptLabel="Setujui penggunaan cookie"
          ariaDeclineLabel="Tolak penggunaan cookie"
          containerClasses="consent-bar"
          contentClasses="consent-bar__text"
          buttonClasses="consent-bar__btn consent-bar__btn--terima"
          declineButtonClasses="consent-bar__btn consent-bar__btn--tolak"
          disableStyles
        >
          <span>
            SukaMuda menggunakan
            analitik dan teknologi
            iklan sesuai dengan
            pilihan privasi Anda.
            Anda dapat membaca{" "}
            <Link to="/privacy">
              Kebijakan Privasi
            </Link>{" "}
            untuk mengetahui lebih
            lanjut.
          </span>
        </CookieConsent>
      </div>
    </>
  );
}

export default App;