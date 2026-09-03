import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import axios, { baseURL } from "../utils/axiosConfig";
import { categoryGroups } from "../data/articles";

import VideoReels from "../components/VideoReels";
import AdSlot from "../components/AdSlot";

import "./Home.css";

/* =========================================================
   SITE CONFIGURATION
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";
const SITE_NAME = "SukaMuda";
const DEFAULT_TITLE = "SukaMuda - Portal Berita & Informasi Anak Muda Indonesia";
const DEFAULT_DESCRIPTION =
  "SukaMuda adalah portal berita dan informasi anak muda Indonesia yang menyajikan berita terkini, edukasi, teknologi, lifestyle, hiburan, olahraga, dan berbagai informasi inspiratif.";
const DEFAULT_SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;
const PLACEHOLDER_IMAGE = "/placeholder.svg";

/* =========================================================
   ADSENSE CONFIGURATION
   ========================================================= */

const ADSENSE_CLIENT = "ca-pub-7608424206122269";
const ADSENSE_VERTICAL_SLOT = "9190843316";
const ADSENSE_HORIZONTAL_SLOT = "9097520145";

const AD_CONFIG = {
  news: { right: true, bottom: true },
  lifestyle: { right: false, bottom: true },
  sport: { right: true, bottom: false },
  "sport-e-sport": { right: true, bottom: false },
  music: { right: true, bottom: false },
  "music-film": { right: true, bottom: false },
  otomotif: { right: true, bottom: true },
  science: { right: true, bottom: false },
  health: { right: true, bottom: true },
  tech: { right: true, bottom: false },
  technology: { right: true, bottom: false },
  podcast: { right: false, bottom: false },
};

/* =========================================================
   URL HELPERS
   ========================================================= */

const isAbsoluteHttpUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const resolveImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return PLACEHOLDER_IMAGE;
  const image = value.trim();

  if (isAbsoluteHttpUrl(image)) {
    return image
      .replace("http://127.0.0.1:8000", SITE_URL)
      .replace("http://localhost:8000", SITE_URL)
      .replace("https://api.sukamuda.co.id", SITE_URL);
  }

  if (image.startsWith("data:") || image.startsWith("blob:")) return image;
  if (image.startsWith("/storage/")) return `${baseURL}${image}`;
  if (image.startsWith("/")) return `${baseURL}${image}`;

  return `${baseURL}/storage/${image.replace(/^\/+/, "")}`;
};

/* =========================================================
   CATEGORY & ARTICLE HELPERS
   ========================================================= */

const normalizeCategory = (value) =>
  String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const normalizeCategorySlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const CATEGORY_LABELS = {
  news: "News", school: "School", college: "College", general: "General",
  lifestyle: "Lifestyle", style: "Style", culinary: "Culinary", traveling: "Traveling",
  sport: "Sport & E-Sport", "sport-e-sport": "Sport & E-Sport",
  music: "Music & Film", "music-film": "Music & Film",
  otomotif: "Otomotif", science: "Science", health: "Health",
  tech: "Tech", technology: "Tech", podcast: "Podcast",
};

const formatCategory = (category) => {
  const raw = String(category || "").trim();
  if (!raw) return "Umum";
  const normalized = normalizeCategorySlug(raw);
  if (CATEGORY_LABELS[normalized]) return CATEGORY_LABELS[normalized];
  return raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().split(" ")
    .filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
};

const getSafeArticleSlug = (article) => String(article?.slug || "").trim();

const getInitials = (name) => {
  const value = String(name || "").trim();
  if (!value) return "?";
  return value.split(/\s+/).filter(Boolean).map((part) => part.charAt(0)).join("").toUpperCase().slice(0, 2);
};

const handleImageError = (event) => {
  const image = event?.currentTarget;
  if (!image) return;
  image.onerror = null;
  const currentSrc = String(image.currentSrc || image.src || "");
  if (currentSrc.endsWith(PLACEHOLDER_IMAGE)) return;
  image.src = PLACEHOLDER_IMAGE;
};

/* =========================================================
   EMBED HELPERS
   ========================================================= */

const getYoutubeVideoId = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLowerCase();
    if (host === "youtu.be" || host.endsWith(".youtu.be")) return parsed.pathname.replace(/^\/+/, "").split("/")[0].trim();
    const isYoutubeHost = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host);
    if (!isYoutubeHost) return "";
    if (parsed.pathname === "/watch") return (parsed.searchParams.get("v") || "").trim();
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (["embed", "shorts", "live"].includes(parts[0])) return String(parts[1] || "").split("?")[0].split("&")[0].split("#")[0].trim();
    return "";
  } catch { return ""; }
};

const getYoutubeThumbnailUrl = (value) => {
  const videoId = getYoutubeVideoId(value);
  return videoId ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : "";
};

const getYoutubeEmbedUrl = (value) => {
  const videoId = getYoutubeVideoId(value);
  return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : "";
};

const getSpotifyEmbedUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  const allowedTypes = ["track", "episode", "album", "playlist", "show", "artist"];
  try {
    const normalized = value.trim();
    if (normalized.startsWith("spotify:")) {
      const parts = normalized.split(":").filter(Boolean);
      if (parts.length >= 3 && allowedTypes.includes(parts[1]) && parts[2]) return `https://open.spotify.com/embed/${encodeURIComponent(parts[1])}/${encodeURIComponent(parts[2])}`;
      return "";
    }
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "open.spotify.com" && !hostname.endsWith(".spotify.com")) return "";
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed") parts.shift();
    if (parts.length < 2 || !allowedTypes.includes(parts[0])) return "";
    return `https://open.spotify.com/embed/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`;
  } catch { return ""; }
};

/* =========================================================
   API & DATA FETCHING
   ========================================================= */

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.articles)) return payload.articles;
    if (Array.isArray(payload.results)) return payload.results;
  }
  return [];
};

const PUBLIC_ARTICLE_PAGE_SIZE = 18;
const HOMEPAGE_CATEGORY_LIMIT = 12;

const fetchArticles = async ({ signal, page = 1, perPage = PUBLIC_ARTICLE_PAGE_SIZE, categories = [] } = {}) => {
  const normalizedCategories = Array.from(new Set((Array.isArray(categories) ? categories : [categories]).map(normalizeCategorySlug).filter(Boolean)));
  const response = await axios.get("/api/public-articles", {
    signal,
    params: { page, per_page: perPage, ...(normalizedCategories.length > 0 ? { categories: normalizedCategories.join(",") } : {}) },
  });
  return extractArrayPayload(response?.data);
};

const fetchVideoReels = async ({ signal } = {}) => {
  const response = await axios.get("/api/video-reels/homepage", { signal });
  return extractArrayPayload(response?.data);
};

const normalizeArticleList = (articles) => {
  if (!Array.isArray(articles)) return [];
  const seen = new Set();
  return articles.filter((article) => {
    if (!article || typeof article !== "object") return false;
    const identity = article.id ?? article.slug ?? article.title;
    if (identity === undefined || identity === null || String(identity).trim() === "") return false;
    const key = String(identity).trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/* =========================================================
   SKELETON LOADERS
   ========================================================= */

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="article-card skeleton" aria-hidden="true">
      <div className="article-image-wrapper skeleton-img" />
      <div className="card-content">
        <div className="skeleton-line short" />
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
});

const SkeletonTrending = memo(function SkeletonTrending() {
  return (
    <div className="trending-item skeleton" aria-hidden="true">
      <div className="trending-rank"><div className="skeleton-box" /></div>
      <div className="trending-thumb"><div className="skeleton-img" /></div>
      <div className="trending-details">
        <div className="skeleton-line short" />
        <div className="skeleton-line long" />
      </div>
    </div>
  );
});

const SkeletonReels = memo(function SkeletonReels() {
  return (
    <div className="vr-skeleton-scroll" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div className="vr-skeleton-card" key={index}>
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
});

/* =========================================================
   HOME COMPONENT
   ========================================================= */

function Home() {
  const [isCompactLayout, setIsCompactLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 1100;
  });

  const [activePodcastId, setActivePodcastId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mediaQuery = window.matchMedia("(max-width: 1100px)");
    const updateLayout = (event) => setIsCompactLayout(Boolean(event?.matches ?? mediaQuery.matches));
    updateLayout(mediaQuery);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateLayout);
      return () => mediaQuery.removeEventListener("change", updateLayout);
    }
    mediaQuery.addListener(updateLayout);
    return () => mediaQuery.removeListener(updateLayout);
  }, []);

  const homepageCategoryRequests = useMemo(() => {
    if (!Array.isArray(categoryGroups)) return [];
    return categoryGroups.map((group, index) => {
      const fallbackSlug = normalizeCategorySlug(group?.slug);
      const categories = Array.from(new Set((Array.isArray(group?.categorySlugs) ? group.categorySlugs : [fallbackSlug]).map(normalizeCategorySlug).filter(Boolean)));
      return { key: String(group?.slug || `category-${index}`), categories };
    }).filter((request) => request.categories.length > 0);
  }, []);

  const { data: latestRawArticles = [], isLoading: latestArticlesLoading, isError: latestArticlesError, refetch: refetchLatestArticles } = useQuery({
    queryKey: ["publicArticles", "homepage", "latest"],
    queryFn: ({ signal }) => fetchArticles({ signal, page: 1, perPage: PUBLIC_ARTICLE_PAGE_SIZE }),
    staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30, retry: 1, refetchOnWindowFocus: false, refetchOnReconnect: true,
  });

  const categoryArticleQueries = useQueries({
    queries: homepageCategoryRequests.map((request) => ({
      queryKey: ["publicArticles", "homepage", "category", request.key, request.categories.join(",")],
      queryFn: ({ signal }) => fetchArticles({ signal, page: 1, perPage: HOMEPAGE_CATEGORY_LIMIT, categories: request.categories }),
      staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30, retry: 1, refetchOnWindowFocus: false, refetchOnReconnect: true,
    })),
  });

  const rawArticles = useMemo(
    () => [
      ...extractArrayPayload(latestRawArticles),
      ...categoryArticleQueries.flatMap((query) => extractArrayPayload(query.data)),
    ],
    [latestRawArticles, categoryArticleQueries]
  );

  const refetchArticles = useCallback(() => {
    return Promise.allSettled([refetchLatestArticles(), ...categoryArticleQueries.map((query) => query.refetch())]);
  }, [refetchLatestArticles, categoryArticleQueries]);

  const { data: videoReels = [], isLoading: videoReelsLoading, isError: videoReelsError, refetch: refetchVideoReels } = useQuery({
    queryKey: ["videoReels"],
    queryFn: ({ signal }) => fetchVideoReels({ signal }),
    staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30, retry: 1, refetchOnWindowFocus: false, refetchOnReconnect: true,
  });

  const allArticles = useMemo(() => normalizeArticleList(rawArticles), [rawArticles]);
  
  // PERBAIKAN PENTING: latestArticles sekarang hanya bergantung pada latestRawArticles
  const latestArticles = useMemo(() => {
    return normalizeArticleList(extractArrayPayload(latestRawArticles)).filter(Boolean).slice(0, 5);
  }, [latestRawArticles]);

  const recommendedArticles = useMemo(() => {
    const seen = new Set();
    return allArticles.filter((article) => {
      if (!article || normalizeCategory(article.category) === "podcast") return false;
      const identity = article.id ?? article.slug ?? article.title;
      if (identity === undefined || identity === null) return false;
      const key = String(identity).trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
  }, [allArticles]);

  const togglePodcastPlayer = useCallback((articleId) => {
    if (articleId === undefined || articleId === null) return;
    setActivePodcastId((previousId) => (String(previousId) === String(articleId) ? null : articleId));
  }, []);

  const handleRetryAll = useCallback(() => {
    refetchArticles();
    refetchVideoReels();
  }, [refetchArticles, refetchVideoReels]);

  const renderLatestItem = useCallback((article, index) => {
    if (!article) return null;
    const articleSlug = getSafeArticleSlug(article);
    const imageUrl = article.image ? resolveImageUrl(article.image) : getYoutubeThumbnailUrl(article.video_link) || PLACEHOLDER_IMAGE;
    const rawAuthorImage = article.user?.avatar || article.user?.profile_photo_url || article.author_avatar || "";
    const authorPhoto = rawAuthorImage ? resolveImageUrl(rawAuthorImage) : "";
    const authorName = article.user?.name || article.author_name || "Anonim";
    const title = article.title || "Judul tidak tersedia";
    const categoryLabel = formatCategory(article.category);

    const content = (
      <>
        <div className="trending-rank"><span>{String(index + 1).padStart(2, "0")}</span></div>
        <div className="trending-thumb">
          <img src={imageUrl} alt={title} loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} decoding="async" width="126" height="88" sizes="126px" onError={handleImageError} />
        </div>
        <div className="trending-details">
          <span className="tag-category">{categoryLabel}</span>
          <h3 className="trending-title">{title}</h3>
          <div className="meta-info">
            <div className="author-avatar-xs">
              {authorPhoto ? <img src={authorPhoto} alt="" loading="lazy" decoding="async" width="20" height="20" sizes="20px" onError={handleImageError} /> : <span aria-hidden="true">{getInitials(authorName)}</span>}
            </div>
            <span>{authorName}</span>
          </div>
        </div>
      </>
    );

    if (!articleSlug) return <article className="trending-item" key={article.id ?? `latest-${index}`}>{content}</article>;
    return <Link className="trending-item" key={article.id ?? articleSlug} to={`/article/${encodeURIComponent(articleSlug)}`} aria-label={`Baca artikel: ${title}`}>{content}</Link>;
  }, []);

  const renderCard = useCallback((article, index, isNewsStyle = false, isLifestyleStyle = false, isPriority = false) => {
    if (!article) return null;
    const isPodcast = normalizeCategory(article.category) === "podcast";
    const articleSlug = getSafeArticleSlug(article);
    const youtubeThumbnail = !article.image && isPodcast ? getYoutubeThumbnailUrl(article.video_link) : "";
    const imageUrl = article.image ? resolveImageUrl(article.image) : youtubeThumbnail || PLACEHOLDER_IMAGE;
    const rawAuthorImage = article.user?.avatar || article.user?.profile_photo_url || article.author_avatar || "";
    const authorPhoto = rawAuthorImage ? resolveImageUrl(rawAuthorImage) : "";
    const authorName = article.user?.name || article.author_name || "Anonim";
    const title = article.title || "Judul tidak tersedia";
    const spotifyEmbedUrl = article.audio_link ? getSpotifyEmbedUrl(article.audio_link) : "";
    const youtubeEmbedUrl = article.video_link ? getYoutubeEmbedUrl(article.video_link) : "";
    const showPodcastPlayer = isPodcast && String(activePodcastId) === String(article.id);

    const isHero = isLifestyleStyle ? index === 6 : index === 0;
    const isSmallHorizontal = !isHero && (isNewsStyle || isLifestyleStyle);
    const imageLoading = isPriority ? "eager" : "lazy";
    const imageFetchPriority = isPriority ? "high" : "auto";
    const imageWidth = isSmallHorizontal ? 110 : 600;
    const imageHeight = isSmallHorizontal ? 80 : 400;
    const imageSizes = isSmallHorizontal ? "(max-width: 768px) 130px, 110px" : "(max-width: 768px) 50vw, 600px";

    const commonImage = (
      <div className="article-image-wrapper">
        <img src={imageUrl} alt={title} loading={imageLoading} fetchPriority={imageFetchPriority} decoding="async" width={imageWidth} height={imageHeight} sizes={imageSizes} onError={handleImageError} />
      </div>
    );

    if (isSmallHorizontal) {
      const content = (
        <>
          {commonImage}
          <div className="card-content">
            <h3 className="news-small-title">{title}</h3>
            <div className="card-meta" style={{ marginTop: "auto" }}>
              <div className="card-author">
                {authorPhoto ? (
                  <div className="card-author-avatar-wrap" style={{ width: "18px", height: "18px" }}>
                    <img src={authorPhoto} alt="" className="card-author-avatar" loading="lazy" decoding="async" width="18" height="18" sizes="18px" onError={handleImageError} />
                  </div>
                ) : (
                  <div className="card-author-avatar-wrap" style={{ width: "18px", height: "18px" }} aria-hidden="true">
                    <span className="card-author-initials">{getInitials(authorName)}</span>
                  </div>
                )}
                <span className="card-author-name" style={{ fontSize: "11px" }}>{authorName}</span>
              </div>
            </div>
          </div>
        </>
      );
      const className = ["article-card", isHero ? "article-card--hero" : "", "article-card--news-small"].filter(Boolean).join(" ");
      if (!articleSlug) return <article key={article.id ?? `card-${index}`} className={className}>{content}</article>;
      return <Link key={article.id ?? articleSlug} className={className} to={`/article/${encodeURIComponent(articleSlug)}`} aria-label={`Baca artikel: ${title}`}>{content}</Link>;
    }

    const content = (
      <>
        {commonImage}
        <div className="card-content">
          <h3>{title}</h3>
          <div className="card-meta">
            <div className="card-author">
              {authorPhoto ? (
                <div className="card-author-avatar-wrap">
                  <img src={authorPhoto} alt="" className="card-author-avatar" loading="lazy" decoding="async" width="24" height="24" sizes="24px" onError={handleImageError} />
                </div>
              ) : !isPodcast ? (
                <div className="card-author-avatar-wrap" aria-hidden="true">
                  <span className="card-author-initials">{getInitials(authorName)}</span>
                </div>
              ) : null}
              <span className="card-author-name">{authorName}</span>
            </div>
          </div>
          {isPodcast && <span className="podcast-badge">Podcast</span>}
          {isPodcast && (
            <button type="button" className="podcast-toggle-btn" onClick={(event) => { event.preventDefault(); event.stopPropagation(); togglePodcastPlayer(article.id); }} aria-expanded={showPodcastPlayer} aria-controls={article.id ? `podcast-player-${article.id}` : undefined}>
              {showPodcastPlayer ? "Tutup Podcast" : "Putar Podcast"}
            </button>
          )}
          {showPodcastPlayer && (
            <div className="podcast-player-panel" id={article.id ? `podcast-player-${article.id}` : undefined}>
              {spotifyEmbedUrl && <div className="podcast-embed podcast-audio"><iframe src={spotifyEmbedUrl} width="100%" height="232" frameBorder="0" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title={`Pemutar Spotify untuk ${title}`} /></div>}
              {youtubeEmbedUrl && <div className="podcast-embed podcast-video"><iframe src={youtubeEmbedUrl} width="100%" height="240" frameBorder="0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={`Pemutar YouTube untuk ${title}`} /></div>}
              {!spotifyEmbedUrl && !youtubeEmbedUrl && <p className="podcast-player-placeholder">Tidak ada embed podcast tersedia untuk artikel ini.</p>}
            </div>
          )}
        </div>
      </>
    );

    const className = ["article-card", isHero ? "article-card--hero" : "", isPodcast ? "article-card--podcast" : ""].filter(Boolean).join(" ");

    if (isPodcast) return <div key={article.id ?? `podcast-${index}`} className={className}>{content}</div>;
    if (!articleSlug) return <article key={article.id ?? `card-${index}`} className={className}>{content}</article>;
    return <Link key={article.id ?? articleSlug} className={className} to={`/article/${encodeURIComponent(articleSlug)}`} aria-label={`Baca artikel: ${title}`}>{content}</Link>;
  }, [activePodcastId, togglePodcastPlayer]);

  // PERBAIKAN: Fungsi direstrukturisasi untuk menerima status loading khusus per kategori
  const renderCategoryGroup = useCallback((group, groupIndex, isGroupLoading, isGroupError) => {
    if (!group?.slug) return null;
    const groupSlug = normalizeCategorySlug(group.slug);
    const groupLabel = String(group.label || group.slug).trim();
    let isNewsStyle = groupIndex % 2 === 0;
    let isLifestyleStyle = groupIndex % 2 !== 0;

    if (!isCompactLayout && ["news", "otomotif", "sport", "sport-e-sport"].includes(groupSlug)) {
      isNewsStyle = true; isLifestyleStyle = false;
    }

    let maxArticles = isLifestyleStyle ? 10 : 5;
    if (isCompactLayout && ["lifestyle", "science", "music-film"].includes(groupSlug)) maxArticles += 1;

    const allowedSlugs = Array.isArray(group.categorySlugs) ? group.categorySlugs.map(normalizeCategorySlug).filter(Boolean) : [groupSlug];
    const groupArticles = allArticles.filter((article) => {
      if (!article?.category) return false;
      const articleCategory = normalizeCategorySlug(article.category);
      if (normalizeCategory(article.category) === "podcast") return false;
      return allowedSlugs.includes(articleCategory);
    }).slice(0, maxArticles);

    if (groupArticles.length === 0 && !isGroupLoading) return null;

    const adSetting = AD_CONFIG[groupSlug] || { right: false, bottom: false };
    const showRightAd = Boolean(adSetting.right);
    const showBottomAd = Boolean(adSetting.bottom);

    const sectionClassName = ["home-section", isNewsStyle ? "news-section-special" : "", isLifestyleStyle ? "lifestyle-section-special" : ""].filter(Boolean).join(" ");
    const articleGridClassName = ["article-grid", isNewsStyle ? "news-article-grid" : "", isLifestyleStyle ? "lifestyle-article-grid" : ""].filter(Boolean).join(" ");

    return (
      <section key={group.slug} className={sectionClassName} aria-labelledby={`section-${groupSlug}`}>
        <div className="section-header">
          <h2 id={`section-${groupSlug}`}>{groupLabel}</h2>
          <Link to={`/category/${encodeURIComponent(groupSlug)}`} className="section-link" aria-label={`Lihat semua artikel kategori ${groupLabel}`}>
            Lihat semua <span className="arrow-right" aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={isNewsStyle ? "news-with-sidebar-wrapper" : ""}>
          <div className={isNewsStyle ? "news-frame" : ""}>
            <div className={articleGridClassName}>
              {isGroupLoading ? (
                Array.from({ length: isLifestyleStyle ? 6 : 3 }).map((_, skeletonIndex) => <SkeletonCard key={skeletonIndex} />)
              ) : isGroupError ? (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }} role="alert">
                  <p>Gagal memuat artikel kategori ini.</p>
                </div>
              ) : (
                groupArticles.map((article, articleIndex) => renderCard(article, articleIndex, isNewsStyle, isLifestyleStyle, groupIndex === 0 && articleIndex === 0))
              )}
            </div>
          </div>
          {isNewsStyle && showRightAd && !isCompactLayout && (
            <aside className="news-sidebar-right" aria-label="Iklan">
              <div className="news-sidebar-static">
                <AdSlot type="vertical" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_VERTICAL_SLOT} />
              </div>
            </aside>
          )}
        </div>
        {showBottomAd && (
          <div className="ad-news-horizontal">
            <AdSlot type="horizontal" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_HORIZONTAL_SLOT} />
          </div>
        )}
      </section>
    );
  }, [allArticles, isCompactLayout, renderCard]);

  const homeWebPageSchema = useMemo(() => ({
    "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE_URL}/#webpage`, url: `${SITE_URL}/`,
    name: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` },
    primaryImageOfPage: { "@id": `${SITE_URL}/#logo` }, inLanguage: "id-ID",
  }), []);

  return (
    <div className="home-container">
      <Helmet>
        <html lang="id-ID" />
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content={DEFAULT_SHARE_IMAGE} />
        <meta property="og:image:secure_url" content={DEFAULT_SHARE_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={DEFAULT_TITLE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_SHARE_IMAGE} />
        <meta name="twitter:image:alt" content={DEFAULT_TITLE} />
        <script type="application/ld+json">{JSON.stringify(homeWebPageSchema)}</script>
      </Helmet>

      <h1 className="home-sr-only">SukaMuda - Portal Berita &amp; Informasi Anak Muda Indonesia</h1>

      <div className="home-layout-wrapper">
        {!isCompactLayout && (
          <aside className="ad-sidebar ad-sidebar-left" aria-label="Iklan">
            <div className="ad-sidebar-sticky">
              <AdSlot type="vertical" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_VERTICAL_SLOT} />
            </div>
          </aside>
        )}

        <div className="home-main-content">
          <section className="section-trending" aria-labelledby="trending-heading">
            <div className="section-header">
              <h2 id="trending-heading">Artikel Terbaru</h2>
              <div className="trending-count" aria-live="polite">
                <span>{latestArticlesLoading ? "Memuat..." : `${latestArticles.length} artikel terbaru`}</span>
              </div>
            </div>
            <div className="trending-grid">
              {latestArticlesError ? (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }} role="alert">
                  <p>Gagal memuat artikel terbaru.</p>
                  <button type="button" onClick={handleRetryAll}>Coba lagi</button>
                </div>
              ) : latestArticlesLoading ? (
                Array.from({ length: 5 }).map((_, index) => <SkeletonTrending key={index} />)
              ) : latestArticles.length > 0 ? (
                latestArticles.map((article, index) => renderLatestItem(article, index))
              ) : (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }} role="status">
                  <p>Belum ada artikel terbaru saat ini.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {!isCompactLayout && (
          <aside className="ad-sidebar ad-sidebar-right" aria-label="Iklan">
            <div className="ad-sidebar-sticky">
              <AdSlot type="vertical" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_VERTICAL_SLOT} />
            </div>
          </aside>
        )}
      </div>

      <div className="home-layout-wrapper home-layout-wrapper--bottom">
        <div className="home-main-content">
          <section className="home-section section-video-reels" aria-labelledby="video-reels-heading">
            <div className="section-header">
              <h2 id="video-reels-heading">Video Reels</h2>
              <Link to="/video-reels" className="section-link" aria-label="Lihat semua video reels">
                Lihat semua <span className="arrow-right" aria-hidden="true">→</span>
              </Link>
            </div>
            {videoReelsError ? (
              <div className="vr-empty" role="alert">
                <p>Gagal memuat video reels.</p>
                <button type="button" onClick={refetchVideoReels}>Coba lagi</button>
              </div>
            ) : videoReelsLoading ? (
              <SkeletonReels />
            ) : Array.isArray(videoReels) && videoReels.length > 0 ? (
              <VideoReels reels={videoReels} />
            ) : (
              <div className="vr-empty" role="status"><p>Belum ada video reels yang aktif.</p></div>
            )}
          </section>

          {Array.isArray(categoryGroups) && categoryGroups.map((group, index) => {
            const groupSlug = normalizeCategorySlug(group?.slug);
            const groupLabel = normalizeCategorySlug(group?.label);
            const isActualLifestyle = groupSlug === "lifestyle" || groupLabel === "lifestyle";
            
            // PERBAIKAN: Setiap kategori menunggu loading-nya masing-masing
            const requestIndex = homepageCategoryRequests.findIndex(req => String(req.key) === String(group.slug));
            const isGroupLoading = requestIndex >= 0 ? categoryArticleQueries[requestIndex]?.isLoading : false;
            const isGroupError = requestIndex >= 0 ? categoryArticleQueries[requestIndex]?.isError : false;

            return (
              <React.Fragment key={group?.slug || `category-${index}`}>
                {renderCategoryGroup(group, index, isGroupLoading, isGroupError)}
                {isActualLifestyle && recommendedArticles.length > 0 && !latestArticlesLoading && (
                  <section className="home-section random-section" aria-labelledby="recommendation-heading">
                    <div className="section-header">
                      <h2 id="recommendation-heading">Rekomendasi Pilihan</h2>
                    </div>
                    <div className="random-article-grid">
                      {recommendedArticles.slice(0, isCompactLayout ? 4 : 3).map((article, articleIndex) => renderCard(article, articleIndex + 10, false, false, false))}
                    </div>
                  </section>
                )}
              </React.Fragment>
            );
          })}

          {allArticles.length === 0 && !latestArticlesLoading && !latestArticlesError && (
            <div className="empty-state" role="status"><p>Belum ada artikel yang diterbitkan saat ini.</p></div>
          )}

          {latestArticlesError && (
            <div className="empty-state" role="alert">
              <p>Gagal memuat artikel utama. Silakan refresh halaman atau coba lagi.</p>
              <button type="button" onClick={handleRetryAll}>Coba lagi</button>
            </div>
          )}
        </div>
      </div>

      <div className="ad-before-footer">
        <AdSlot type="horizontal" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_HORIZONTAL_SLOT} />
      </div>
    </div>
  );
}

export default Home;