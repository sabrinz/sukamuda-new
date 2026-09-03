import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube } from "react-icons/fa";

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

/* =========================================================
   COMPONENT
   ========================================================= */

function VideoReelsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("all");

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

    /*
     * Data reels tidak perlu di-request ulang
     * terlalu sering.
     */
    staleTime: 1000 * 60 * 5,

    /*
     * Simpan cache lebih lama daripada staleTime.
     */
    gcTime: 1000 * 60 * 30,

    /*
     * Jangan request ulang hanya karena user
     * pindah tab/window.
     */
    refetchOnWindowFocus: false,

    /*
     * Tidak melakukan retry berkali-kali
     * jika API sedang bermasalah.
     */
    retry: 1,
  });

  /* =======================================================
     NORMALIZE DATA
     ======================================================= */

  const currentData = useMemo(
    () => normalizeReelsResponse(reelsResponse),
    [reelsResponse],
  );

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
          HEADER
          =================================================== */}

      <header className="video-reels-header">
        <div className="video-reels-header-content">
          <p className="video-reels-eyebrow">VIDEO</p>

          <h1 className="video-reels-title">Video Reels</h1>

          <p className="video-reels-description">
            Temukan video terbaru dan menarik dari berbagai platform.
          </p>
        </div>
      </header>

      {/* ===================================================
          PLATFORM FILTER
          =================================================== */}

      <nav className="platform-filters" aria-label="Filter platform video">
        <div
          className="platform-filters-inner"
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
        </div>
      </nav>

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
            INITIAL LOADING
            ================================================ */}

        {isLoading && (
          <div
            className="loading-state"
            role="status"
            aria-live="polite"
            aria-label="Memuat video reels"
          >
            <div className="spinner" aria-hidden="true" />

            <p>Memuat video reels...</p>
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
              Coba Lagi
            </button>
          </div>
        )}

        {/* ================================================
            SUCCESS
            ================================================ */}

        {!isLoading && !isError && (
          <div className="reels-section">
            {/* Data information */}

            <div className="reels-toolbar" aria-live="polite">
              <p className="reels-count">
                {currentData.length > 0 ? (
                  <>
                    Menampilkan <strong>{currentData.length}</strong> video
                  </>
                ) : (
                  <>Belum ada video</>
                )}
              </p>

              {isFetching && (
                <span className="reels-refreshing" role="status">
                  Memperbarui...
                </span>
              )}

              <span className="reels-platform-label">
                {currentPlatform?.label || "Semua Platform"}
              </span>
            </div>

            {/* ==========================================
                EMPTY
                ========================================== */}

            {currentData.length === 0 ? (
              <div className="empty-reels">
                <div className="empty-reels-icon" aria-hidden="true">
                  ▶
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
                    Lihat Semua Video
                  </button>
                )}
              </div>
            ) : (
              /* ==========================================
                 REELS
                 ========================================== */

              <div className="reels-display">
                <VideoReels reels={currentData} />
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default React.memo(VideoReelsPage);
