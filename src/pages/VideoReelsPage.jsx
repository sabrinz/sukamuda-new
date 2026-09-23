import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaYoutube,
  FaSyncAlt,
  FaArrowRight,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import axios from "../utils/axiosConfig";
import VideoReels from "../components/VideoReels";

import "./VideoReelsPage.css";

/* =========================================================
   CONFIG
   ========================================================= */

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://sukamuda.co.id"
).replace(/\/+$/, "");

const PAGE_URL = `${SITE_URL}/video-reels`;

const PAGE_TITLE = "Video Reels - SukaMuda";

const PAGE_DESCRIPTION =
  "Temukan video reels terbaru dan menarik dari berbagai platform di SukaMuda.";

const OG_IMAGE =
  import.meta.env.VITE_DEFAULT_OG_IMAGE || `${SITE_URL}/sukamuda-share.jpg`;

/* Jumlah kartu skeleton saat loading.
   Kartu aslinya TIDAK dibatasi — semua video tampil & bisa digeser. */

const SKELETON_COUNT_DESKTOP = 6;
const SKELETON_COUNT_MOBILE = 4;
const MOBILE_BREAKPOINT = "(max-width: 768px)";

/* =========================================================
   API
   ========================================================= */

const fetchAllReels = async (platform = "all", signal) => {
  const endpoint =
    platform === "all"
      ? "/api/video-reels"
      : `/api/video-reels/platform/${encodeURIComponent(platform)}`;

  const response = await axios.get(endpoint, { signal });

  return response?.data;
};

/* =========================================================
   PLATFORM CONFIG
   ========================================================= */

const PLATFORMS = [
  {
    id: "all",
    label: "Semua Platform",
    icon: null,
    className: "platform-all",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    className: "platform-instagram",
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: FaTiktok,
    className: "platform-tiktok",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: FaFacebook,
    className: "platform-facebook",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: FaYoutube,
    className: "platform-youtube",
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const normalizeReelsResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.reels)) {
    return response.reels;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   HOOKS
   ========================================================= */

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mq = window.matchMedia(query);

    const handler = (event) => setMatches(event.matches);

    setMatches(mq.matches);

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }

    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [query]);

  return matches;
};

/* =========================================================
   COMPONENT
   ========================================================= */

function VideoReelsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [showTop, setShowTop] = useState(false);

  /* State carousel (buat panah) */
  const [carouselOverflow, setCarouselOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);
  const reelsScrollRef = useRef(null);
  const suppressClickRef = useRef(false);

  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  const {
    data: reelsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["videoReels", selectedPlatform],
    queryFn: ({ signal }) => fetchAllReels(selectedPlatform, signal),

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* =======================================================
     NORMALIZE DATA — SEMUA video dipakai, tanpa dibatasi
     ======================================================= */

  const currentData = useMemo(
    () => normalizeReelsResponse(reelsResponse),
    [reelsResponse],
  );

  const skeletonCount = isMobile
    ? SKELETON_COUNT_MOBILE
    : SKELETON_COUNT_DESKTOP;

  /* =======================================================
     CAROUSEL — panah, drag, snap
     ======================================================= */

  const syncCarousel = useCallback(() => {
    const el = reelsScrollRef.current;

    if (!el) {
      return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    const overflow = maxScroll > 4;

    el.classList.toggle("has-overflow", overflow);

    setCarouselOverflow(overflow);
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(overflow && el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = reelsScrollRef.current;

    if (!el) {
      return undefined;
    }

    let observer;

    el.addEventListener("scroll", syncCarousel, { passive: true });

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(syncCarousel);
      observer.observe(el);
    } else {
      window.addEventListener("resize", syncCarousel);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(syncCarousel).catch(() => {});
    }

    const raf = requestAnimationFrame(syncCarousel);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", syncCarousel);
      observer?.disconnect?.();
      window.removeEventListener("resize", syncCarousel);
    };
  }, [syncCarousel, selectedPlatform, currentData]);

  /* Geser 1 kartu per klik, mendarat rapi di posisi kartu */

  const scrollCarousel = useCallback((direction) => {
    const el = reelsScrollRef.current;

    if (!el) {
      return;
    }

    const card = el.firstElementChild?.firstElementChild?.firstElementChild;

    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card
      ? card.getBoundingClientRect().width + gap
      : el.clientWidth * 0.8;

    const maxScroll = el.scrollWidth - el.clientWidth;

    const target = Math.min(
      Math.max(Math.round((el.scrollLeft + direction * step) / step) * step, 0),
      maxScroll,
    );

    el.scrollTo({
      left: target,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  /* Drag pakai mouse — seperti swipe di HP */

  const handleCarouselPointerDown = useCallback((event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    const el = reelsScrollRef.current;

    if (!el) {
      return;
    }

    if (event.target.closest?.("iframe, video, embed, object")) {
      return;
    }

    suppressClickRef.current = false;

    const startX = event.clientX;
    const startScroll = el.scrollLeft;
    let moved = false;

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;

      if (!moved && Math.abs(dx) < 5) {
        return;
      }

      if (!moved) {
        moved = true;
        el.classList.add("is-dragging");
      }

      el.scrollLeft = startScroll - dx;
    };

    const cleanUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", cleanUp);
      window.removeEventListener("pointercancel", cleanUp);

      if (moved) {
        el.classList.remove("is-dragging");
        /* Cegah klik "nyasar" tepat setelah drag */
        suppressClickRef.current = true;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", cleanUp);
    window.addEventListener("pointercancel", cleanUp);
  }, []);

  const handleCarouselClickCapture = useCallback((event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    }
  }, []);

  /* =======================================================
     TAB INDICATOR — meluncur mengikuti tab aktif
     ======================================================= */

  const syncIndicator = useCallback(() => {
    const container = tabsRef.current;
    const indicator = indicatorRef.current;

    if (!container || !indicator) {
      return;
    }

    const active = container.querySelector(".platform-filter-btn.active");

    container.classList.toggle(
      "has-overflow",
      container.scrollWidth - container.clientWidth > 2,
    );

    if (!active) {
      indicator.style.opacity = "0";
      return;
    }

    indicator.style.opacity = "1";
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  }, []);

  useLayoutEffect(() => {
    const container = tabsRef.current;

    syncIndicator();

    const active = container?.querySelector(".platform-filter-btn.active");

    active?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedPlatform, syncIndicator]);

  useEffect(() => {
    const container = tabsRef.current;

    if (!container) {
      return;
    }

    let observer;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(syncIndicator);
      observer.observe(container);
    } else {
      window.addEventListener("resize", syncIndicator);
    }

    container.addEventListener("scroll", syncIndicator, { passive: true });

    if (document.fonts?.ready) {
      document.fonts.ready.then(syncIndicator).catch(() => {});
    }

    return () => {
      observer?.disconnect?.();
      window.removeEventListener("resize", syncIndicator);
      container.removeEventListener("scroll", syncIndicator);
    };
  }, [syncIndicator]);

  /* =======================================================
     BACK TO TOP
     ======================================================= */

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  /* =======================================================
     SCHEMA
     ======================================================= */

  const schemaWebPage = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${PAGE_URL}#webpage`,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      inLanguage: "id-ID",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "SukaMuda",
        url: SITE_URL,
      },
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    }),
    [],
  );

  const schemaBreadcrumb = useMemo(
    () => ({
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
          name: "Video Reels",
          item: PAGE_URL,
        },
      ],
    }),
    [],
  );

  /* =======================================================
     CURRENT PLATFORM LABEL
     ======================================================= */

  const currentPlatform = useMemo(
    () => PLATFORMS.find((platform) => platform.id === selectedPlatform),
    [selectedPlatform],
  );

  /* =======================================================
     ERROR MESSAGE
     ======================================================= */

  const errorMessage = useMemo(() => {
    if (!error) {
      return "Terjadi kesalahan saat memuat video reels.";
    }

    if (error?.response?.status === 404) {
      return "Data video reels tidak ditemukan.";
    }

    if (error?.response?.status >= 500) {
      return "Server sedang mengalami masalah. Silakan coba lagi.";
    }

    return "Video reels gagal dimuat. Silakan coba lagi.";
  }, [error]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="video-reels-page">
      <Helmet>
        <html lang="id-ID" />

        {/* Basic SEO */}
        <title>{PAGE_TITLE}</title>

        <meta name="description" content={PAGE_DESCRIPTION} />

        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <link rel="canonical" href={PAGE_URL} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SukaMuda" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:image" content={OG_IMAGE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(schemaWebPage)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(schemaBreadcrumb)}
        </script>
      </Helmet>

      {/* ===================================================
          BREADCRUMB
          =================================================== */}

      <nav className="vr-breadcrumb" aria-label="Breadcrumb">
        <ol className="vr-breadcrumb-list">
          <li className="vr-breadcrumb-item">
            <a href="/">Beranda</a>
          </li>

          <li className="vr-breadcrumb-item" aria-current="page">
            <span>Video Reels</span>
          </li>
        </ol>
      </nav>

      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="video-reels-header">
        <div className="vr-kicker-row">
          <span className="vr-kicker-line" aria-hidden="true" />

          <span className="vr-kicker">Video</span>

          <span className="vr-kicker-line" aria-hidden="true" />
        </div>

        <h1 className="video-reels-title">Video Reels</h1>
      </header>

      {/* ===================================================
          PLATFORM FILTER
          =================================================== */}

      <nav className="platform-filters" aria-label="Filter platform video">
        <div
          className="platform-filters-inner"
          ref={tabsRef}
          role="group"
          aria-label="Pilih platform video"
        >
          {PLATFORMS.map((platform) => {
            const IconComponent = platform.icon;

            const isActive = selectedPlatform === platform.id;

            return (
              <button
                key={platform.id}
                type="button"
                className={[
                  "platform-filter-btn",
                  platform.className,
                  isActive ? "active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedPlatform(platform.id)}
                aria-pressed={isActive}
                aria-label={`Tampilkan video ${platform.label}`}
              >
                {IconComponent && (
                  <IconComponent
                    className="platform-icon-filter"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}

                <span>{platform.label}</span>
              </button>
            );
          })}

          <span
            className="vr-tab-indicator"
            ref={indicatorRef}
            aria-hidden="true"
          />
        </div>
      </nav>

      {/* ===================================================
          FETCH PROGRESS BAR
          =================================================== */}

      <div
        className={`vr-fetch-bar ${isFetching && !isLoading ? "is-active" : ""}`}
        aria-hidden="true"
      >
        <span className="vr-fetch-bar-fill" />
      </div>

      {/* ===================================================
          CONTENT
          =================================================== */}

      <section
        className="video-reels-content"
        aria-labelledby="video-reels-content-title"
      >
        <h2 id="video-reels-content-title" className="sr-only">
          Daftar Video Reels
        </h2>

        {/* ================================================
            INITIAL LOADING — skeleton
            ================================================ */}

        {isLoading && (
          <div
            className="loading-state"
            role="status"
            aria-live="polite"
            aria-label="Memuat video reels"
          >
            <p className="sr-only">Memuat video reels...</p>

            <div className="vr-skeleton" aria-hidden="true">
              {Array.from({ length: skeletonCount }, (_, item) => (
                <div className="vr-skel-card" key={item}>
                  <div className="vr-skel-thumb" />

                  <div className="vr-skel-line vr-skel-line--lg" />

                  <div className="vr-skel-line vr-skel-line--sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================
            ERROR
            ================================================ */}

        {isError && !isLoading && (
          <div className="error-state" role="alert">
            <div className="error-state-icon" aria-hidden="true">
              !
            </div>

            <h2>Video gagal dimuat</h2>

            <p>{errorMessage}</p>

            <button
              type="button"
              className="retry-button"
              onClick={() => refetch()}
            >
              <FaSyncAlt aria-hidden="true" focusable="false" />

              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* ================================================
            SUCCESS
            ================================================ */}

        {!isLoading && !isError && (
          <div className="reels-section">
            {/* ==========================================
                EMPTY
                ========================================== */}

            {currentData.length === 0 ? (
              <div className="empty-reels" key={selectedPlatform}>
                <div className="empty-reels-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    focusable="false"
                  >
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </div>

                <h2>Belum ada video reels</h2>

                <p>
                  Belum tersedia video untuk{" "}
                  {currentPlatform?.label?.toLowerCase() || "platform ini"}.
                </p>

                {selectedPlatform !== "all" && (
                  <button
                    type="button"
                    className="empty-reels-button"
                    onClick={() => setSelectedPlatform("all")}
                  >
                    <span>Lihat Semua Video</span>

                    <FaArrowRight aria-hidden="true" focusable="false" />
                  </button>
                )}
              </div>
            ) : (
              /* ==========================================
                 CAROUSEL — semua video, bisa digeser.
                 Desktop: 5 kartu terlihat + intipan kartu
                 berikutnya. HP: 3 kartu, tinggal swipe.
                 ========================================== */

              <div className="reels-carousel" key={selectedPlatform}>
                <div
                  className="reels-display"
                  ref={reelsScrollRef}
                  role="region"
                  aria-label="Daftar video reels, dapat digeser ke kiri dan ke kanan"
                  tabIndex={carouselOverflow ? 0 : -1}
                  onPointerDown={handleCarouselPointerDown}
                  onClickCapture={handleCarouselClickCapture}
                >
                  <VideoReels reels={currentData} />
                </div>

                <button
                  type="button"
                  className="vr-carousel-nav vr-carousel-nav--prev"
                  onClick={() => scrollCarousel(-1)}
                  disabled={!canScrollLeft}
                  aria-label="Geser video ke kiri"
                >
                  <FaChevronLeft aria-hidden="true" focusable="false" />
                </button>

                <button
                  type="button"
                  className="vr-carousel-nav vr-carousel-nav--next"
                  onClick={() => scrollCarousel(1)}
                  disabled={!canScrollRight}
                  aria-label="Geser video ke kanan"
                >
                  <FaChevronRight aria-hidden="true" focusable="false" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===================================================
          BACK TO TOP
          =================================================== */}

      <button
        type="button"
        className={`vr-to-top ${showTop ? "is-visible" : ""}`}
        onClick={handleScrollTop}
        tabIndex={showTop ? 0 : -1}
        aria-label="Kembali ke atas"
      >
        <FaChevronUp aria-hidden="true" focusable="false" />
      </button>
    </main>
  );
}

export default React.memo(VideoReelsPage);