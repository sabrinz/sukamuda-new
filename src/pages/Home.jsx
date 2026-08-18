import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosConfig";
import { categoryGroups } from "../data/articles";
import VideoReels from "../components/VideoReels";
import AdSlot from "../components/AdSlot";
import "./Home.css";

const baseUrl = import.meta.env.VITE_API_URL || "https://sukamuda.co.id";

const resolveImageUrl = (value) => {
  if (!value) return null;
  return value.startsWith("http") ? value : baseUrl + "/storage/" + value;
};

const fetchArticles = async () => {
  const response = await axios.get("/api/public-articles");
  return Array.isArray(response.data) ? response.data : [];
};

const fetchTrending = async () => {
  const response = await axios.get("/api/trending");
  return Array.isArray(response.data) ? response.data : [];
};

const fetchVideoReels = async () => {
  const response = await axios.get("/api/video-reels/homepage");
  return Array.isArray(response.data) ? response.data : [];
};

const AD_CONFIG = {
  news: {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9097520145" },
  },
  lifestyle: {
    kanan: { tampil: false },
    bawah: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9097520145" },
  },
  sport: {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: false },
  },
  "sport-e-sport": {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: false },
  },
  "music-film": {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9097520145" },
  },
  otomotif: {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9097520145" },
  },
  science: {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9097520145" },
  },
  health: {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9097520145" },
  },
  tech: {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9097520145" },
  },
  technology: {
    kanan: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9190843316" },
    bawah: { tampil: true, adClient: "ca-pub-7608424206122269", adSlot: "9097520145" },
  },
};

function Home() {
  const queryClient = useQueryClient();

  // FIX CLS: nilai awal langsung dibaca dari lebar layar, supaya di HP
  // sidebar iklan tidak sempat dirender lalu hilang (bikin layout "loncat").
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 1100;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;

    // matchMedia lebih hemat daripada event resize (tidak memicu re-render
    // setiap piksel saat jendela diubah ukurannya).
    const mediaQuery = window.matchMedia("(max-width: 1100px)");
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    // Fallback untuk Safari lama
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  React.useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ["publicArticles"], queryFn: fetchArticles });
    queryClient.prefetchQuery({ queryKey: ["trendingArticles"], queryFn: fetchTrending });
    queryClient.prefetchQuery({ queryKey: ["videoReels"], queryFn: fetchVideoReels });
  }, [queryClient]);

  const { data: allArticles = [], isLoading: articleLoading } = useQuery({
    queryKey: ["publicArticles"],
    queryFn: fetchArticles,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: trendingArticles = [],
    isLoading: trendingLoading,
    isError: trendingError,
  } = useQuery({
    queryKey: ["trendingArticles"],
    queryFn: fetchTrending,
    gcTime: 0,
    staleTime: 0,
    retry: 1,
  });

  const { data: videoReels = [], isLoading: videoReelsLoading } = useQuery({
    queryKey: ["videoReels"],
    queryFn: fetchVideoReels,
    staleTime: 1000 * 60 * 5,
  });

  const articlesImageMap = React.useMemo(() => {
    const map = new Map();
    if (Array.isArray(allArticles)) {
      allArticles.forEach((article) => {
        if (article) {
          if (article.id) map.set(String(article.id), article);
          if (article.slug) map.set(article.slug, article);
        }
      });
    }
    return map;
  }, [allArticles]);

  const getYoutubeThumbnailUrl = (url) => {
    if (!url) return "";
    try {
      const normalized = url.trim();
      const parsed = new URL(normalized);
      const host = parsed.hostname.toLowerCase();
      let videoId = "";

      if (host.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      } else if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
        if (parsed.pathname.startsWith("/watch")) videoId = parsed.searchParams.get("v");
        else if (parsed.pathname.startsWith("/embed/")) videoId = parsed.pathname.split("/embed/")[1];
        else if (parsed.pathname.startsWith("/shorts/")) videoId = parsed.pathname.split("/shorts/")[1];
        else if (parsed.pathname.startsWith("/live")) videoId = parsed.searchParams.get("v");
        else {
          const parts = parsed.pathname.split("/").filter(Boolean);
          videoId = parts[parts.length - 1] || "";
        }
      }

      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
    } catch {
      return "";
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const normalized = url.trim();
      const parsed = new URL(normalized);
      const host = parsed.hostname.toLowerCase();
      let videoId = "";

      if (host.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      } else if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
        if (parsed.pathname.startsWith("/watch")) videoId = parsed.searchParams.get("v");
        else if (parsed.pathname.startsWith("/embed/")) videoId = parsed.pathname.split("/embed/")[1];
        else if (parsed.pathname.startsWith("/shorts/")) videoId = parsed.pathname.split("/shorts/")[1];
        else if (parsed.pathname.startsWith("/live")) videoId = parsed.searchParams.get("v");
        else {
          const parts = parsed.pathname.split("/").filter(Boolean);
          videoId = parts[parts.length - 1] || "";
        }
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    } catch {
      return "";
    }
  };

  const getTrendingImage = (trendingArticle) => {
    if (!trendingArticle) return "";

    if (trendingArticle.image) {
      if (trendingArticle.image.startsWith("http://") || trendingArticle.image.startsWith("https://")) {
        return trendingArticle.image;
      }
      return baseUrl + "/storage/" + trendingArticle.image;
    }

    if (trendingArticle.video_link) {
      const ytThumb = getYoutubeThumbnailUrl(trendingArticle.video_link);
      if (ytThumb) return ytThumb;
    }

    return `https://placehold.co/150x100/f5f5f5/999?text=${encodeURIComponent(
      trendingArticle.category || "Berita"
    )}`;
  };

  const formatCategory = (cat) =>
    cat ? cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase() : "Umum";

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const normalizeCategory = (value) =>
    (value || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "");

  const getSpotifyEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const normalized = url.trim();

      if (normalized.startsWith("spotify:")) {
        const parts = normalized.split(":").filter(Boolean);
        if (parts.length >= 3) return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
        return "";
      }

      const parsed = new URL(normalized);
      if (!parsed.hostname.includes("spotify.com")) return "";

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed") parts.shift();
      if (parts.length >= 2) return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}`;

      return "";
    } catch {
      return "";
    }
  };

  const [activePodcastId, setActivePodcastId] = React.useState(null);

  const togglePodcastPlayer = (articleId) => {
    setActivePodcastId((prev) => (prev === articleId ? null : articleId));
  };

  const renderTrendingItem = (article, index) => {
    if (!article) return null;

    const imageUrl = getTrendingImage(article);
    const authorPhoto = resolveImageUrl(article.user?.avatar || article.user?.profile_photo_url);
    const authorName = article.user?.name || "Anonim";

    return (
      <Link className="trending-item" key={article.id || index} to={`/article/${article.slug}`}>
        <div className="trending-rank">
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>

        <div className="trending-thumb">
          <img
            src={imageUrl}
            alt={article.title || "Thumbnail artikel"}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            width="150"
            height="100"
            style={{ aspectRatio: "3 / 2" }}
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/150x100/f5f5f5/999?text=${encodeURIComponent(
                article.category || "Berita"
              )}`;
            }}
          />
        </div>

        <div className="trending-details">
          <span className="tag-category">{formatCategory(article.category)}</span>
          {/* FIX: jangan loncat heading level (dari h2 langsung ke h4) */}
          <h3 className="trending-title">{article.title || "Judul tidak tersedia"}</h3>

          <div className="meta-info">
            <div className="author-avatar-xs">
              {authorPhoto ? (
                <img
                  src={authorPhoto}
                  alt={authorName}
                  loading="lazy"
                  decoding="async"
                  width="24"
                  height="24"
                  style={{ aspectRatio: "1 / 1" }}
                />
              ) : (
                <span>{getInitials(authorName)}</span>
              )}
            </div>
            <span>{authorName}</span>
          </div>
        </div>
      </Link>
    );
  };

  const renderCard = (article, index, isNewsStyle = false, isLifestyleStyle = false) => {
    if (!article) return null;

    const isPodcast = normalizeCategory(article.category) === "podcast";
    const videoThumbnail = !article.image && isPodcast ? getYoutubeThumbnailUrl(article.video_link) : "";

    const imageUrl = article.image
      ? article.image.startsWith("http")
        ? article.image
        : baseUrl + "/storage/" + article.image
      : videoThumbnail ||
        `https://placehold.co/600x400/f5f5f5/999?text=${encodeURIComponent(article.category || "SukaMuda")}`;

    const authorPhoto = isPodcast ? null : resolveImageUrl(article.user?.avatar || article.user?.profile_photo_url);
    const authorName = article.user?.name || "Anonim";

    const spotifyEmbedUrl = article.audio_link ? getSpotifyEmbedUrl(article.audio_link) : "";
    const youtubeEmbedUrl = article.video_link ? getYoutubeEmbedUrl(article.video_link) : "";
    const showPodcastPlayer = isPodcast && activePodcastId === article.id;

    const isHero = isLifestyleStyle ? index === 6 : index === 0;
    const isSmallHorizontal = (isNewsStyle && !isHero) || (isLifestyleStyle && !isHero);

    let cardInner;

    if (isSmallHorizontal) {
      cardInner = (
        <>
          <div className="article-image-wrapper">
            <img
              src={imageUrl}
              alt={article.title || "Gambar artikel"}
              loading="lazy"
              decoding="async"
              width="600"
              height="400"
              style={{ aspectRatio: "3 / 2" }}
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/600x400/f5f5f5/999?text=${encodeURIComponent(
                  article.category || "SukaMuda"
                )}`;
              }}
            />
          </div>

          <div className="card-content">
            <h3 className="news-small-title">{article.title || "Judul tidak tersedia"}</h3>

            <div className="card-meta" style={{ marginTop: "auto" }}>
              <div className="card-author">
                {authorPhoto ? (
                  <div className="card-author-avatar-wrap" style={{ width: "18px", height: "18px" }}>
                    <img
                      src={authorPhoto}
                      alt={authorName}
                      className="card-author-avatar"
                      loading="lazy"
                      decoding="async"
                      width="18"
                      height="18"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                  </div>
                ) : (
                  <div className="card-author-avatar-wrap" style={{ width: "18px", height: "18px" }}>
                    <span className="card-author-initials">{getInitials(authorName)}</span>
                  </div>
                )}

                <span className="card-author-name" style={{ fontSize: "11px" }}>
                  {authorName}
                </span>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      cardInner = (
        <>
          <div className="article-image-wrapper">
            <img
              src={imageUrl}
              alt={article.title || "Gambar artikel"}
              loading="lazy"
              decoding="async"
              width="600"
              height="400"
              style={{ aspectRatio: "3 / 2" }}
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/600x400/f5f5f5/999?text=${encodeURIComponent(
                  article.category || "SukaMuda"
                )}`;
              }}
            />
          </div>

          <div className="card-content">
            <h3>{article.title || "Judul tidak tersedia"}</h3>

            <div className="card-meta">
              <div className="card-author">
                {authorPhoto ? (
                  <div className="card-author-avatar-wrap">
                    <img
                      src={authorPhoto}
                      alt={authorName}
                      className="card-author-avatar"
                      loading="lazy"
                      decoding="async"
                      width="24"
                      height="24"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                  </div>
                ) : !isPodcast ? (
                  <div className="card-author-avatar-wrap">
                    <span className="card-author-initials">{getInitials(authorName)}</span>
                  </div>
                ) : null}

                <span className="card-author-name">{authorName}</span>
              </div>
            </div>

            {isPodcast && <span className="podcast-badge">Podcast</span>}

            {isPodcast && (
              <button
                type="button"
                className="podcast-toggle-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePodcastPlayer(article.id);
                }}
                aria-expanded={showPodcastPlayer}
                aria-controls={"podcast-player-" + article.id}
              >
                {showPodcastPlayer ? "Tutup Podcast" : "Putar Podcast"}
              </button>
            )}

            {showPodcastPlayer && (
              <div className="podcast-player-panel" id={"podcast-player-" + article.id}>
                {spotifyEmbedUrl && (
                  <div className="podcast-embed podcast-audio">
                    <iframe
                      src={spotifyEmbedUrl}
                      width="100%"
                      height="232"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      title={"Pemutar Spotify untuk " + (article.title || "podcast")}
                    ></iframe>
                  </div>
                )}

                {youtubeEmbedUrl && (
                  <div className="podcast-embed podcast-video">
                    <iframe
                      src={youtubeEmbedUrl}
                      width="100%"
                      height="240"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={"Pemutar YouTube untuk " + (article.title || "podcast")}
                    ></iframe>
                  </div>
                )}

                {!spotifyEmbedUrl && !youtubeEmbedUrl && (
                  <p className="podcast-player-placeholder">Tidak ada embed podcast tersedia untuk artikel ini.</p>
                )}
              </div>
            )}
          </div>
        </>
      );
    }

    if (isPodcast) {
      return (
        <div
          className={`article-card article-card--podcast ${isHero ? "article-card--hero" : ""} ${
            isSmallHorizontal ? "article-card--news-small" : ""
          }`}
          key={article.id || index}
        >
          {cardInner}
        </div>
      );
    }

    return (
      <Link
        className={`article-card ${isHero ? "article-card--hero" : ""} ${
          isSmallHorizontal ? "article-card--news-small" : ""
        }`}
        key={article.id || index}
        to={`/article/${article.slug}`}
      >
        {cardInner}
      </Link>
    );
  };

  const SkeletonCard = () => (
    <div className="article-card skeleton" aria-hidden="true">
      <div className="article-image-wrapper skeleton-img"></div>
      <div className="card-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>
      </div>
    </div>
  );

  const SkeletonTrending = () => (
    <div className="trending-item skeleton" aria-hidden="true">
      <div className="trending-rank">
        <div className="skeleton-box"></div>
      </div>
      <div className="trending-thumb">
        <div className="skeleton-img" style={{ width: "100%", height: "100%" }}></div>
      </div>
      <div className="trending-details">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
      </div>
    </div>
  );

  const SkeletonReels = () => (
    <div className="vr-skeleton-scroll" aria-hidden="true">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div className="vr-skeleton-card" key={i}>
            <div className="vr-skeleton-thumb" />
            <div className="vr-skeleton-info">
              <div className="vr-skeleton-line vr-skeleton-line--title" />
              <div className="vr-skeleton-line vr-skeleton-line--desc" />
              <div className="vr-skeleton-line vr-skeleton-line--author" />
            </div>
          </div>
        ))}
    </div>
  );

  const top5Trending = trendingLoading ? [] : Array.isArray(trendingArticles) ? trendingArticles.slice(0, 5) : [];

  const randomArticles = React.useMemo(() => {
    if (!allArticles || !Array.isArray(allArticles)) return [];
    const normalArticles = allArticles.filter((a) => normalizeCategory(a?.category) !== "podcast");
    const shuffled = [...normalArticles].sort(() => 0.5 - Math.random());
    // FIX MOBILE: Siapkan 4 artikel agar di HP bisa tampil 4 (desktop tetap 3)
    return shuffled.slice(0, 4);
  }, [allArticles]);

  const renderCategoryGroup = (group, index) => {
    const isActualLifestyle = group.slug.toLowerCase() === "lifestyle" || group.label.toLowerCase() === "lifestyle";
    const kategori = group.slug.toLowerCase();

    // Logika selang-seling default
    let isNewsStyle = index % 2 === 0;
    let isLifestyleStyle = index % 2 !== 0;

    // OVERRIDE: Paksa kategori tertentu jadi 2 kolom (News Style) khusus di Desktop
    if (!isMobile && (kategori === "news" || kategori === "otomotif" || kategori === "sport" || kategori === "sport-e-sport")) {
      isNewsStyle = true;
      isLifestyleStyle = false;
    }

    let maxArticles = isLifestyleStyle ? 10 : 5;

    // FIX MOBILE: Tambah 1 artikel khusus di HP untuk kategori Lifestyle, Science, dan Music-Film
    if (isMobile && (kategori === "lifestyle" || kategori === "science" || kategori === "music-film")) {
      maxArticles += 1;
    }

    const groupArticles = (Array.isArray(allArticles) ? allArticles : [])
      .filter(
        (item) =>
          item?.category &&
          group.categorySlugs?.some((slug) => slug.toLowerCase() === item.category.toLowerCase()) &&
          normalizeCategory(item.category) !== "podcast"
      )
      .slice(0, maxArticles);

    if (groupArticles.length === 0 && !articleLoading) return null;

    const adSetting = AD_CONFIG[kategori] || {
      kanan: { tampil: false },
      bawah: { tampil: false },
    };

    const tampilIklanKanan = adSetting.kanan?.tampil;
    const tampilIklanBawah = adSetting.bawah?.tampil;

    return (
      <section
        key={group.slug}
        className={`home-section ${isNewsStyle ? "news-section-special" : ""} ${isLifestyleStyle ? "lifestyle-section-special" : ""}`}
      >
        <div className="section-header">
          <h2>{group.label}</h2>
          <Link to={`/category/${group.slug}`} className="section-link" aria-label={`Lihat semua artikel kategori ${group.label}`}>
            Lihat semua <span className="arrow-right" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className={isNewsStyle ? "news-with-sidebar-wrapper" : ""}>
          <div className={isNewsStyle ? "news-frame" : ""}>
            <div className={`article-grid ${isNewsStyle ? "news-article-grid" : ""} ${isLifestyleStyle ? "lifestyle-article-grid" : ""}`}>
              {articleLoading
                ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : groupArticles.map((article, i) => renderCard(article, i, isNewsStyle, isLifestyleStyle))}
            </div>
          </div>

          {isNewsStyle && tampilIklanKanan && !isMobile && (
            <div className="news-sidebar-right">
              <div className="news-sidebar-static">
                <AdSlot type="vertical" mode="adsense" adClient={adSetting.kanan.adClient} adSlot={adSetting.kanan.adSlot} />
              </div>
            </div>
          )}
        </div>

        {tampilIklanBawah && (
          <div className="ad-news-horizontal">
            <AdSlot type="horizontal" mode="adsense" adClient={adSetting.bawah.adClient} adSlot={adSetting.bawah.adSlot} />
          </div>
        )}
      </section>
    );
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sukamuda",
    url: "https://sukamuda.co.id/",
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://sukamuda.co.id/search?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "Sukamuda",
    url: "https://sukamuda.co.id/",
    logo: { "@type": "ImageObject", url: "https://sukamuda.co.id/logo.png" },
  };

  return (
    <div className="home-container">
      <Helmet>
        {/* Script Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7608424206122269"
          crossOrigin="anonymous"
        ></script>

        <title>Sukamuda - Media Informasi dan Kreativitas Anak Muda</title>
        <link rel="canonical" href="https://sukamuda.co.id/" />
        <meta name="description" content="Sukamuda adalah media informasi dan ruang kreativitas anak muda untuk membaca, menulis, dan berbagi artikel inspiratif." />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="theme-color" content="#d32f2f" />
        <html lang="id" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Sukamuda" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:url" content="https://sukamuda.co.id/" />
        <meta property="og:title" content="Sukamuda - Media Informasi dan Kreativitas Anak Muda" />
        <meta property="og:description" content="Sukamuda adalah media informasi dan ruang kreativitas anak muda untuk membaca, menulis, dan berbagi artikel inspiratif." />
        <meta property="og:image" content="https://sukamuda.co.id/logo.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sukamuda - Media Informasi dan Kreativitas Anak Muda" />
        <meta name="twitter:description" content="Sukamuda adalah media informasi dan ruang kreativitas anak muda untuk membaca, menulis, dan berbagi artikel inspiratif." />
        <meta name="twitter:image" content="https://sukamuda.co.id/logo.png" />

        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      </Helmet>

      <h1 className="home-sr-only">Sukamuda - Media Informasi dan Kreativitas Anak Muda</h1>

      {/* WADAH 1: TRENDING & IKLAN STICKY */}
      <div className="home-layout-wrapper">
        {!isMobile && (
          <div className="ad-sidebar ad-sidebar-left">
            <div className="ad-sidebar-sticky">
              <AdSlot type="vertical" mode="adsense" adClient="ca-pub-7608424206122269" adSlot="9190843316" />
            </div>
          </div>
        )}

        <div className="home-main-content">
          <section className="section-trending">
            <div className="section-header">
              <h2>Artikel Terbaru</h2>
              <div className="trending-count">
                <span>Top {trendingLoading ? "..." : top5Trending.length} Artikel</span>
              </div>
            </div>

            <div className="trending-grid">
              {trendingError ? (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }} role="alert">
                  <p>Gagal memuat berita terbaru. Coba refresh halaman nanti.</p>
                </div>
              ) : trendingLoading ? (
                Array(5).fill(0).map((_, i) => <SkeletonTrending key={i} />)
              ) : top5Trending.length > 0 ? (
                top5Trending.map((article, index) => renderTrendingItem(article, index))
              ) : (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }} role="status">
                  <p>Belum ada berita terbaru saat ini.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {!isMobile && (
          <div className="ad-sidebar ad-sidebar-right">
            <div className="ad-sidebar-sticky">
              <AdSlot type="vertical" mode="adsense" adClient="ca-pub-7608424206122269" adSlot="9190843316" />
            </div>
          </div>
        )}
      </div>

      {/* WADAH 2: KONTEN BAWAH (REELS, KATEGORI, DLL) */}
      <div className="home-layout-wrapper home-layout-wrapper--bottom">
        <div className="home-main-content">
          {/* ── VIDEO REELS ── */}
          <section className="home-section section-video-reels">
            <div className="section-header">
              <h2>Video Reels</h2>
              <Link to="/video-reels" className="section-link" aria-label="Lihat semua video reels">
                Lihat semua <span className="arrow-right" aria-hidden="true">→</span>
              </Link>
            </div>

            {videoReelsLoading ? (
              <SkeletonReels />
            ) : videoReels && videoReels.length > 0 ? (
              <VideoReels reels={videoReels} />
            ) : (
              <div className="vr-empty" role="status">
                <p>Belum ada video reels yang aktif.</p>
              </div>
            )}
          </section>

          {categoryGroups?.map((group, index) => {
            const isActualLifestyle =
              group.slug.toLowerCase() === "lifestyle" ||
              group.label.toLowerCase() === "lifestyle";

            return (
              <React.Fragment key={group.slug}>
                {renderCategoryGroup(group, index)}

                {isActualLifestyle && randomArticles.length > 0 && !articleLoading && (
                  <section className="home-section random-section">
                    <div className="section-header">
                      <h2>Rekomendasi Pilihan</h2>
                    </div>
                    <div className="random-article-grid">
                      {/* FIX MOBILE: Tampilkan 4 artikel di HP, dan 3 artikel di Desktop */}
                      {randomArticles.slice(0, isMobile ? 4 : 3).map((article, i) => renderCard(article, i + 10))}
                    </div>
                  </section>
                )}
              </React.Fragment>
            );
          })}

          {(Array.isArray(allArticles) ? allArticles.length === 0 : true) && !articleLoading && (
            <div className="empty-state" role="status">
              <p>Belum ada artikel yang diterbitkan saat ini.</p>
            </div>
          )}
        </div>
      </div>

      <div className="ad-before-footer">
        <AdSlot type="horizontal" mode="adsense" adClient="ca-pub-7608424206122269" adSlot="9097520145" />
      </div>
    </div>
  );
}

export default Home;