import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link, useParams } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import axios from "../utils/axiosConfig";

import { useAuth } from "../context/AuthContext";

import AdSlot from "../components/AdSlot";

import DOMPurify from "dompurify";

import "./ArticleDetail.css";

/* =========================================================
   SITE CONFIG
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";

const SITE_NAME = "SukaMuda";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const WEBSITE_ID = `${SITE_URL}/#website`;

const LOGO_ID = `${SITE_URL}/#logo`;

const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

/* =========================================================
   ROBOTS
   ========================================================= */

const ARTICLE_ROBOTS =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

const NOINDEX_ROBOTS = "noindex,follow";

/* =========================================================
   ADSENSE
   ========================================================= */

const ADSENSE_CLIENT = "ca-pub-7608424206122269";

const ADSENSE_VERTICAL_SLOT = "9190843316";

const ADSENSE_HORIZONTAL_SLOT = "9097520145";

/* =========================================================
   CATEGORY
   ========================================================= */

const CATEGORY_LABELS = {
  news: "News",
  school: "School",
  college: "College",
  general: "General",
  lifestyle: "Lifestyle",
  style: "Style",
  culinary: "Culinary",
  traveling: "Traveling",
  sport: "Sport & E-Sport",
  "sport-e-sport": "Sport & E-Sport",
  music: "Music & Film",
  "music-film": "Music & Film",
  otomotif: "Otomotif",
  science: "Science",
  health: "Health",
  tech: "Tech",
  technology: "Tech",
  podcast: "Podcast",
};

/* =========================================================
   HELPERS
   ========================================================= */

const normalizeCategory = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const normalizeCategorySlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCategoryLabel = (value) => {
  const raw = String(value || "").trim();

  if (!raw) {
    return "Artikel";
  }

  const normalized = normalizeCategorySlug(raw);

  if (CATEGORY_LABELS[normalized]) {
    return CATEGORY_LABELS[normalized];
  }

  const clean = raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  if (!clean) {
    return "Artikel";
  }

  return clean
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const cleanSlugFromTimestamp = (value) => {
  if (!value) {
    return "";
  }

  const slug = String(value).trim();

  const match = slug.match(/^(.+)-\d{9,13}$/);

  return match ? match[1] : slug;
};

const isAbsoluteHttpUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const parsed = new URL(value.trim());

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/* =========================================================
   PLACEHOLDER
   ========================================================= */

const escapeSvgText = (value) =>
  String(value || SITE_NAME)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const createPlaceholder = (text = SITE_NAME) => {
  const safeText = escapeSvgText(text);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#111111" />
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="#181818" stroke="#333333" stroke-width="2" />
      <text x="600" y="295" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700">
        ${safeText}
      </text>
      <text x="600" y="365" text-anchor="middle" dominant-baseline="middle" fill="#888888" font-family="Arial, Helvetica, sans-serif" font-size="24">
        ${SITE_NAME}
      </text>
    </svg>
  `;

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
};

/* =========================================================
   IMAGE
   ========================================================= */

const baseUrl = (import.meta.env.VITE_API_URL || SITE_URL).replace(/\/+$/, "");

const getStorageUrl = (value) => {
  if (!value) return "";
  const normalized = String(value).trim();
  if (!normalized) return "";

  if (
    isAbsoluteHttpUrl(normalized) ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  if (normalized.startsWith("/storage/")) return baseUrl + normalized;
  if (normalized.startsWith("/")) return baseUrl + normalized;

  return baseUrl + "/storage/" + normalized.replace(/^\/+/, "");
};

const getImageUrl = (image, fallbackText = "Artikel") =>
  getStorageUrl(image) || createPlaceholder(fallbackText);

/* =========================================================
   AUTHOR
   ========================================================= */

const getInstitutionName = (user) => {
  if (!user) return "";
  const value =
    user.schoolName || user.school_name || user.campusName || user.campus_name ||
    user.campus || user.asalKampus || user.asal_kampus || user.asalSekolah ||
    user.asal_sekolah || user.university || user.universitas || user.institution || user.instansi || "";
  return String(value).trim();
};

const getAuthorProfession = (user) =>
  String(user?.profession || user?.profesi || "").trim();

const getAuthorMeta = (user) => {
  const profession = getAuthorProfession(user);
  const institution = getInstitutionName(user);
  if (!profession && !institution) return "";
  if (!institution) return profession;
  if (!profession) return institution;
  return `${profession} · ${institution}`;
};

const getAuthorImage = (user) =>
  user?.avatar || user?.profile_photo_url || user?.photo || user?.image || user?.picture || "";

/* =========================================================
   HTML
   ========================================================= */

const stripRelatedShortcodes = (html) =>
  String(html || "").replace(/\[related:\d+\]/gi, "");

const extractRelatedIdsFromContent = (html) => {
  const ids = [];
  const regex = /\[related:(\d+)\]/gi;
  let match;
  while ((match = regex.exec(String(html || ""))) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)];
};

const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getReadingTime = (text) => {
  const plainText = stripHtml(text);
  if (!plainText) return "< 1 menit baca";
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${Math.max(minutes, 1)} menit baca`;
};

/* =========================================================
   YOUTUBE & SPOTIFY
   ========================================================= */

const extractYoutubeVideoId = (value) => {
  if (!value || typeof value !== "string") return "";
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLowerCase();
    let videoId = "";

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      videoId = parsed.pathname.replace(/^\/+/, "").split("/")[0];
    } else if (
      host === "youtube.com" || host === "www.youtube.com" ||
      host === "m.youtube.com" || host === "youtube-nocookie.com" ||
      host === "www.youtube-nocookie.com"
    ) {
      if (parsed.pathname === "/watch") videoId = parsed.searchParams.get("v") || "";
      else if (parsed.pathname.startsWith("/embed/")) videoId = parsed.pathname.slice("/embed/".length).split("/")[0];
      else if (parsed.pathname.startsWith("/shorts/")) videoId = parsed.pathname.slice("/shorts/".length).split("/")[0];
      else if (parsed.pathname.startsWith("/live/")) videoId = parsed.pathname.slice("/live/".length).split("/")[0];
    }
    return String(videoId || "").split("?")[0].split("&")[0].split("#")[0].trim();
  } catch {
    return "";
  }
};

const getYoutubeEmbedUrl = (value) => {
  const videoId = extractYoutubeVideoId(value);
  return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : "";
};

const getYoutubeThumbnailUrl = (value) => {
  const videoId = extractYoutubeVideoId(value);
  return videoId ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : "";
};

const getSpotifyEmbedUrl = (value) => {
  if (!value) return "";
  try {
    const normalized = String(value).trim();
    if (!normalized) return "";

    const allowedTypes = ["track", "episode", "album", "playlist", "show", "artist"];

    if (normalized.startsWith("spotify:")) {
      const parts = normalized.split(":").filter(Boolean);
      if (parts.length >= 3) {
        const type = parts[1];
        const id = parts[2];
        if (!allowedTypes.includes(type) || !id) return "";
        return `https://open.spotify.com/embed/${encodeURIComponent(type)}/${encodeURIComponent(id)}`;
      }
      return "";
    }

    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "open.spotify.com" && !hostname.endsWith(".spotify.com")) return "";

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed") parts.shift();

    if (parts.length >= 2 && allowedTypes.includes(parts[0])) {
      return `https://open.spotify.com/embed/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`;
    }
    return "";
  } catch {
    return "";
  }
};

/* =========================================================
   SANITIZER
   ========================================================= */

const StableHtmlRenderer = memo(function StableHtmlRenderer({ html, className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const clean = DOMPurify.sanitize(html || "", {
      ADD_ATTR: [
        "style",
        "target",
        "rel",
        "start",
        "data-list",
        "data-continuous-number",
      ],
      FORBID_TAGS: ["style", "script", "iframe", "object", "embed"],
    });

    if (ref.current.innerHTML !== clean) {
      ref.current.innerHTML = clean;
    }
  }, [html]);

  return <div ref={ref} className={className} />;
});

StableHtmlRenderer.displayName = "StableHtmlRenderer";

/* =========================================================
   FETCH ARTICLE
   ========================================================= */

const fetchArticleBySlug = async (slug, signal) => {
  if (!slug) throw new Error("Slug artikel tidak tersedia.");
  const response = await axios.get(`/api/articles/${encodeURIComponent(slug)}`, { signal });
  const payload = response?.data;
  if (payload && payload.data) return payload.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) return payload;
  return null;
};

/* =========================================================
   ARTICLE DETAIL
   ========================================================= */

const ArticleDetail = () => {
  const { slug: rawSlug } = useParams();
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const slug = cleanSlugFromTimestamp(rawSlug);

  /* =======================================================
     STATE
     ======================================================= */

  const [isCompactLayout, setIsCompactLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 1100;
  });

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copyText, setCopyText] = useState("Salin");
  const [showBackTop, setShowBackTop] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState(null);
  const [isReporting, setIsReporting] = useState(false);
  const [hasAwardedRead, setHasAwardedRead] = useState(false);
  const hasAwardedReadRef = useRef(false);

  /* =======================================================
     RESPONSIVE OBSERVER (ADSENSE SAFETY)
     ======================================================= */

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

  /* =======================================================
     ARTICLE QUERY
     ======================================================= */

  const {
    data: article = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["article", slug],
    queryFn: ({ signal }) => fetchArticleBySlug(slug, signal),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  /* =======================================================
     RESET
     ======================================================= */

  useEffect(() => {
    setLikeCount(Number(article?.likes_count ?? article?.like_count ?? article?.likes ?? 0));
    setIsLiked(Boolean(article?.is_liked_by_user ?? article?.is_liked ?? false));
    setViewCount(Number(article?.views_count ?? article?.views ?? article?.view_count ?? 0));
    setHasAwardedRead(false);
    hasAwardedReadRef.current = false;
    setReadProgress(0);
    setShowBackTop(false);
    setShowReportForm(false);
    setReportReason("");
    setReportStatus(null);
    setIsReporting(false);
  }, [article, slug]);

  /* =======================================================
     SCROLL TOP
     ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [slug]);

  /* =======================================================
     AUTHOR & CONTENT
     ======================================================= */

  const authorId = article?.user?.id;
  const authorUser = useMemo(() => ({ ...(article?.user || {}) }), [article?.user]);
  const authorName = article?.user?.name || article?.author_name || "Redaksi SukaMuda";
  const authorMetaText = getAuthorMeta(authorUser);
  const authorImage = getStorageUrl(getAuthorImage(authorUser));
  const authorProfileUrl = authorId ? `/user/${encodeURIComponent(String(authorId))}` : "/";

  const cleanContent = useMemo(() => stripRelatedShortcodes(article?.content || ""), [article?.content]);
  const plainArticleText = useMemo(() => stripHtml(article?.content || ""), [article?.content]);

  const actualArticleSlug = article?.slug || rawSlug || slug;
  const shareUrl = actualArticleSlug ? `${SITE_URL}/article/${encodeURIComponent(String(actualArticleSlug))}` : `${SITE_URL}/`;

  /* =======================================================
     VIEW
     ======================================================= */

  const awardReadPoint = useCallback(async () => {
    if (hasAwardedReadRef.current || !article?.id) return;
    hasAwardedReadRef.current = true;
    try {
      const response = await axios.get(`/api/articles/${encodeURIComponent(String(article.id))}/view`);
      const serverViews = response?.data?.views ?? response?.data?.views_count ?? response?.data?.data?.views ?? response?.data?.data?.views_count;
      if (serverViews !== undefined) {
        setViewCount(Number(serverViews));
      } else {
        setViewCount((previous) => previous + 1);
      }
      setHasAwardedRead(true);
    } catch {
      hasAwardedReadRef.current = false;
    }
  }, [article?.id]);

  /* =======================================================
     SCROLL
     ======================================================= */

  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    const scrollTop = window.scrollY || 0;
    const viewportHeight = window.innerHeight || 0;
    const pageHeight = document.documentElement.scrollHeight || 0;
    const maxScroll = Math.max(pageHeight - viewportHeight, 0);
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    setReadProgress(Math.min(Math.max(progress, 0), 100));
    setShowBackTop(scrollTop > 600);

    if (!hasAwardedRead && article?.id) {
      const atBottom = scrollTop + viewportHeight >= pageHeight - 24;
      if (atBottom) {
        awardReadPoint();
      }
    }
  }, [hasAwardedRead, article?.id, awardReadPoint]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* =======================================================
     ACTIONS
     ======================================================= */

  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopyText("Tersalin!");
      window.setTimeout(() => setCopyText("Salin"), 2000);
    } catch {
      setCopyText("Gagal");
      window.setTimeout(() => setCopyText("Salin"), 2000);
    }
  }, [shareUrl]);

  const handleLike = useCallback(async () => {
    if (!isLoggedIn) {
      window.alert("Kamu harus login dulu untuk menyukai artikel ini.");
      return;
    }
    if (!article?.id) return;
    const previousLiked = isLiked;
    const previousCount = likeCount;
    const nextLiked = !previousLiked;
    const nextCount = nextLiked ? previousCount + 1 : Math.max(previousCount - 1, 0);
    setIsLiked(nextLiked);
    setLikeCount(nextCount);
    try {
      const response = await axios.post(`/api/articles/${encodeURIComponent(String(article.id))}/like`);
      const serverCount = response?.data?.likes_count ?? response?.data?.like_count ?? response?.data?.data?.likes_count;
      const serverStatus = response?.data?.status ?? response?.data?.liked ?? response?.data?.data?.status ?? response?.data?.data?.liked;
      if (serverCount !== undefined) setLikeCount(Number(serverCount));
      if (typeof serverStatus === "boolean") setIsLiked(serverStatus);
      else if (serverStatus === "liked" || serverStatus === "unliked") setIsLiked(serverStatus === "liked");
      queryClient.invalidateQueries({ queryKey: ["article", slug] });
    } catch {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  }, [isLoggedIn, article?.id, isLiked, likeCount, queryClient, slug]);

  const handleReportSubmit = useCallback(async () => {
    if (!isLoggedIn) {
      window.alert("Kamu harus login dulu untuk melaporkan artikel ini.");
      return;
    }
    if (!article?.id) return;
    const cleanReason = reportReason.trim();
    if (!cleanReason) {
      window.alert("Silakan isi alasan laporan terlebih dahulu.");
      return;
    }
    setIsReporting(true);
    setReportStatus(null);
    try {
      await axios.post("/api/reports", { article_id: article.id, reason: cleanReason });
      setReportStatus({ success: true, message: "Laporan berhasil dikirim." });
      setReportReason("");
      setShowReportForm(false);
    } catch (error) {
      setReportStatus({
        success: false,
        message: error?.response?.data?.message || "Gagal mengirim laporan. Coba lagi nanti.",
      });
    } finally {
      setIsReporting(false);
    }
  }, [isLoggedIn, article?.id, reportReason]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* =======================================================
     INVALID
     ======================================================= */

  if (!slug || slug.length < 2) {
    return (
      <>
        <Helmet>
          <html lang="id-ID" />
          <title>Tautan Tidak Valid | {SITE_NAME}</title>
          <meta name="robots" content={NOINDEX_ROBOTS} />
          <link rel="canonical" href={`${SITE_URL}/`} />
        </Helmet>
        <div className="error-container" role="alert">
          <h1>Tautan Tidak Valid</h1>
          <p>Link artikel yang kamu buka tidak valid.</p>
          <Link to="/">Balik ke Home</Link>
        </div>
      </>
    );
  }

  /* =======================================================
     LOADING
     ======================================================= */

  if (isLoading) {
    return (
      <div className="loading-container" role="status" aria-live="polite" aria-busy="true">
        <div className="spinner" />
        <p>Menyelami berita...</p>
      </div>
    );
  }

  /* =======================================================
     NOT FOUND
     ======================================================= */

  if (!article) {
    return (
      <>
        <Helmet>
          <html lang="id-ID" />
          <title>Artikel Tidak Ditemukan | {SITE_NAME}</title>
          <meta name="robots" content={NOINDEX_ROBOTS} />
          <meta name="googlebot" content={NOINDEX_ROBOTS} />
          <link rel="canonical" href={`${SITE_URL}/article/${encodeURIComponent(slug)}`} />
        </Helmet>
        <div className="error-container" role="alert">
          <h1>Artikel Tidak Ditemukan</h1>
          <p>Artikel yang kamu cari belum tersedia atau sudah tidak dapat diakses.</p>
          {isError && <p>Terjadi masalah saat mengambil data artikel.</p>}
          <div className="error-actions">
            <button type="button" onClick={() => refetch()}>Coba Lagi</button>
            <Link to="/">Balik ke Home</Link>
          </div>
        </div>
      </>
    );
  }

  /* =======================================================
     ARTICLE DATA
     ======================================================= */

  const articleCategoryRaw = article.category || article.category_slug || "general";
  const categorySlug = normalizeCategorySlug(articleCategoryRaw) || "general";
  const categoryLabel = getCategoryLabel(articleCategoryRaw);
  const isPodcast = normalizeCategory(articleCategoryRaw) === "podcast";
  const articleStatus = String(article.status || "").toLowerCase();
  const isDraft = articleStatus === "draft";
  const shouldNoIndex = Boolean(articleStatus) && articleStatus !== "approved";

  /* =======================================================
     RELATED
     ======================================================= */

  const relatedShortcodeIds = extractRelatedIdsFromContent(article.content || "");
  const relatedShortcodeArticles = Array.isArray(article.related_articles)
    ? article.related_articles.filter((item) => item && String(item.id) !== String(article.id)).filter((item) => relatedShortcodeIds.includes(String(item.id)))
    : [];

  const relatedArticles = Array.isArray(article.related_articles)
    ? article.related_articles.filter((item) => {
      if (!item || String(item.id) === String(article.id)) return false;
      return Boolean(item.slug);
    }).slice(0, 3)
    : [];

  /* =======================================================
     MEDIA
     ======================================================= */

  const spotifyEmbedUrl = getSpotifyEmbedUrl(article.audio_link);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(article.video_link);
  const youtubeThumbnail = isPodcast ? getYoutubeThumbnailUrl(article.video_link) : "";
  const showPodcastEmbed = isPodcast && Boolean(spotifyEmbedUrl || youtubeEmbedUrl);

  /* =======================================================
     HERO
     ======================================================= */

  const rawArticleImage = article.image || article.featured_image || article.thumbnail || "";
  const safeImageUrl = rawArticleImage ? getStorageUrl(rawArticleImage) : youtubeThumbnail || createPlaceholder(article.title || categoryLabel);
  const fallbackPlaceholder = createPlaceholder(article.title || categoryLabel);
  const schemaImage = isAbsoluteHttpUrl(safeImageUrl) ? safeImageUrl : SHARE_IMAGE;

  /* =======================================================
     TAGS
     ======================================================= */

  const tagsArray = Array.isArray(article.tags)
    ? article.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
    : article.tags
      ? String(article.tags).split(/[,\s#]+/).map((tag) => tag.trim()).filter(Boolean)
      : [];

  /* =======================================================
     DATES
     ======================================================= */

  const datePublished = article.published_at || article.created_at || null;
  const dateModified = article.updated_at || datePublished || null;
  const parsedPublishedDate = datePublished ? new Date(datePublished) : null;
  const formattedDate = parsedPublishedDate && !Number.isNaN(parsedPublishedDate.getTime())
    ? parsedPublishedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-";

  /* =======================================================
     DESCRIPTION & WORD COUNT
     ======================================================= */

  const metaDescription = String(article.summary || article.excerpt || plainArticleText.slice(0, 160) || article.title || "").trim().slice(0, 300);
  const wordCount = plainArticleText ? plainArticleText.split(/\s+/).filter(Boolean).length : undefined;

  /* =======================================================
     SOCIAL
     ======================================================= */

  const encodedTitle = encodeURIComponent(article.title || "");
  const encodedUrl = encodeURIComponent(shareUrl);

  /* =======================================================
     SCHEMA
     ======================================================= */

  const newsArticleSchema = {
    "@type": "NewsArticle",
    "@id": `${shareUrl}#article`,
    url: shareUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${shareUrl}#webpage` },
    headline: String(article.title || "").trim().slice(0, 110),
    description: metaDescription,
    image: [schemaImage],
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    articleSection: categoryLabel,
    ...(tagsArray.length ? { keywords: tagsArray.join(", ") } : {}),
    inLanguage: "id-ID",
    isAccessibleForFree: true,
    ...(wordCount ? { wordCount } : {}),
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorId ? { url: `${SITE_URL}${authorProfileUrl}` } : {}),
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        "@id": LOGO_ID,
        url: `${SITE_URL}/logo.png`,
        contentUrl: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    ...(isPodcast && youtubeEmbedUrl ? {
      video: {
        "@type": "VideoObject",
        "@id": `${shareUrl}#video`,
        name: article.title || "Video SukaMuda",
        description: metaDescription,
        thumbnailUrl: [youtubeThumbnail || schemaImage],
        ...(datePublished ? { uploadDate: datePublished } : {}),
        embedUrl: youtubeEmbedUrl,
        ...(article.video_link ? { contentUrl: article.video_link } : {}),
      },
    } : {}),
  };

  const webPageSchema = {
    "@type": "WebPage",
    "@id": `${shareUrl}#webpage`,
    url: shareUrl,
    name: article.title || SITE_NAME,
    description: metaDescription,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntity: { "@id": `${shareUrl}#article` },
    primaryImageOfPage: { "@type": "ImageObject", url: schemaImage },
    inLanguage: "id-ID",
  };

  const breadcrumbCategoryUrl = `${SITE_URL}/category/${encodeURIComponent(categorySlug)}`;
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${shareUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: categoryLabel, item: breadcrumbCategoryUrl },
      { "@type": "ListItem", position: 3, name: article.title || "Artikel", item: shareUrl },
    ],
  };

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": ["Organization", "NewsMediaOrganization"], "@id": ORGANIZATION_ID, name: SITE_NAME, url: `${SITE_URL}/` },
      { "@type": "WebSite", "@id": WEBSITE_ID, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: "id-ID", publisher: { "@id": ORGANIZATION_ID } },
      newsArticleSchema,
      webPageSchema,
      breadcrumbSchema,
    ],
  });

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <Helmet>
        <html lang="id-ID" />
        <title>{article.title ? `${article.title} | ${SITE_NAME}` : SITE_NAME}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content={shouldNoIndex ? NOINDEX_ROBOTS : ARTICLE_ROBOTS} />
        <meta name="googlebot" content={shouldNoIndex ? NOINDEX_ROBOTS : ARTICLE_ROBOTS} />
        <link rel="canonical" href={shareUrl} />
        <link rel="alternate" hrefLang="id-ID" href={shareUrl} />
        <link rel="alternate" hrefLang="x-default" href={shareUrl} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:title" content={article.title || SITE_NAME} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:image" content={schemaImage} />
        <meta property="og:image:secure_url" content={schemaImage} />
        <meta property="og:image:alt" content={article.title || SITE_NAME} />
        {datePublished && <meta property="article:published_time" content={datePublished} />}
        {dateModified && <meta property="article:modified_time" content={dateModified} />}
        <meta property="article:section" content={categoryLabel} />
        {tagsArray.map((tag, index) => (
          <meta key={`${tag}-${index}`} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title || SITE_NAME} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={schemaImage} />
        <meta name="twitter:image:alt" content={article.title || SITE_NAME} />
        <script type="application/ld+json">{structuredData}</script>
      </Helmet>

      <div className="reading-progress-bar" style={{ width: `${readProgress}%` }} aria-hidden="true" />

      <button type="button" className={`back-to-top ${showBackTop ? "visible" : ""}`} onClick={scrollToTop} aria-label="Kembali ke atas">
        <svg className="back-top-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <div className="article-layout-wrapper article-detail-page">
        {/* LEFT AD - HIDDEN ON MOBILE */}
        {!isCompactLayout && (
          <aside className="ad-sidebar ad-sidebar-left" aria-label="Iklan">
            <div className="ad-sidebar-sticky">
              <AdSlot type="vertical" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_VERTICAL_SLOT} />
            </div>
          </aside>
        )}

        {/* MAIN */}
        <div className="article-main-content">
          {/* TOP AD */}
          <div className="ad-center" aria-label="Iklan">
            <AdSlot type="horizontal" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_HORIZONTAL_SLOT} />
          </div>

          <div className="article-container">
            {/* BREADCRUMB */}
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
              </Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <Link to={`/category/${encodeURIComponent(categorySlug)}`}>{categoryLabel}</Link>
            </nav>

            {/* ARTICLE HEADER */}
            <header className="article-header">
              <div className="header-top-row">
                <span className="badge-category">{categoryLabel}</span>
                {isDraft && <span className="badge-draft">Draf</span>}
                <div className="view-count">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {viewCount.toLocaleString("id-ID")}
                </div>
              </div>
              <h1 className="article-title">{article.title}</h1>
              {article.summary && <p className="article-summary">{article.summary}</p>}
              <div className="author-meta">
                <Link to={authorProfileUrl} className="author-link" aria-label={`Lihat profil ${authorName}`}>
                  <div className="author-avatar">
                    {authorImage ? (
                      <img src={authorImage} alt={`Foto profil ${authorName}`} loading="lazy" decoding="async" width="64" height="64" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createPlaceholder("U"); }} />
                    ) : (
                      <span aria-hidden="true">{authorName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </Link>
                <div className="author-info">
                  <Link to={authorProfileUrl} className="author-name-link">
                    <span className="author-name">{authorName}</span>
                  </Link>
                  {authorMetaText && <span className="author-profession">{authorMetaText}</span>}
                  <div className="meta-bottom">
                    <span className="publish-date">{formattedDate}</span>
                    <span className="meta-dot" aria-hidden="true">·</span>
                    <span className="read-time">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {getReadingTime(article.content)}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* HERO */}
            <div className="hero-wrapper">
              {!isPodcast && (
                <>
                  <img src={safeImageUrl} alt={article.title || "Artikel SukaMuda"} className="hero-img" width="1200" height="630" fetchPriority="high" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackPlaceholder; }} />
                  {article.image_caption && <p className="image-caption-text">{article.image_caption}</p>}
                </>
              )}

              {showPodcastEmbed && (
                <div className="podcast-embed-section">
                  {spotifyEmbedUrl && (
                    <div className="podcast-embed podcast-audio">
                      <iframe src={spotifyEmbedUrl} width="100%" height="232" loading="lazy" title={`Spotify podcast ${article.title || ""}`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
                    </div>
                  )}
                  {youtubeEmbedUrl && (
                    <div className="podcast-embed podcast-video">
                      <iframe src={youtubeEmbedUrl} width="100%" height="360" loading="lazy" title={`YouTube podcast ${article.title || ""}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  )}
                </div>
              )}

              {/* BODY */}
              <article className="content-body">
                {isDraft && (
                  <div className="draft-banner">
                    <strong>Artikel ini masih berstatus draf</strong>
                    <p>Konten belum dipublikasikan secara resmi dan dapat berubah sewaktu-waktu.</p>
                  </div>
                )}

                <div className="text-render-full">
                  <StableHtmlRenderer className="text-render" html={cleanContent} />
                </div>

                {/* RELATED SHORTCODE */}
                {relatedShortcodeArticles.length > 0 && (
                  <section className="related-section-new" aria-labelledby="baca-juga-shortcode">
                    <div className="section-header">
                      <h2 className="section-title" id="baca-juga-shortcode">Baca Juga</h2>
                    </div>
                    <div className="related-grid-new">
                      {relatedShortcodeArticles.map((item) => {
                        const label = getCategoryLabel(item.category);
                        const itemSlug = String(item.slug || "").trim();
                        if (!itemSlug) return null;
                        return (
                          <Link className="related-card" key={item.id} to={`/article/${encodeURIComponent(itemSlug)}`}>
                            <div className="related-img-wrap">
                              <img src={getImageUrl(item.image, label)} alt={item.title || "Artikel"} loading="lazy" decoding="async" width="600" height="400" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createPlaceholder(label); }} />
                              <span className="related-cat">{label}</span>
                            </div>
                            <div className="related-text">
                              <h3>{item.title}</h3>
                              <span className="related-date">Baca Juga</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* TAGS */}
                {tagsArray.length > 0 && (
                  <div className="tags-container">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    {tagsArray.map((tag, index) => (
                      <span key={`${tag}-${index}`} className="tag-chip">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* INTERACTIONS */}
                <div className="interactions-section">
                  <div className="interactions-left">
                    <button type="button" className={`like-btn ${isLiked ? "active" : ""}`} onClick={handleLike} aria-pressed={isLiked} aria-label={isLiked ? "Batalkan suka" : "Sukai artikel"}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "#d83a34" : "none"} stroke="#d83a34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span>{likeCount > 0 ? likeCount : "Suka"}</span>
                    </button>
                    <button type="button" className="report-btn" onClick={() => setShowReportForm((previous) => !previous)} aria-expanded={showReportForm}>
                      Laporkan
                    </button>
                  </div>

                  <div className="share-row">
                    <span className="share-label">Bagikan:</span>
                    <button type="button" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title || ""} ${shareUrl}`)}`, "_blank", "noopener,noreferrer")} className="soc-btn wa" title="Bagikan ke WhatsApp" aria-label="Bagikan ke WhatsApp">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.075-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.412.248-.694.248-1.289.173-1.412-.074-.124-.272-.198-.57-.347z" /><path d="M20.52 3.449A11.816 11.816 0 0012.05 0C5.495 0 .16 5.333.157 11.89c0 2.096.547 4.142 1.588 5.946L.057 24l6.348-1.664a11.933 11.933 0 005.64 1.43h.005c6.557 0 11.894-5.333 11.897-11.89a11.8 11.8 0 00-3.427-8.427zm-8.47 18.317h-.004a9.91 9.91 0 01-5.054-1.384l-.363-.215-3.766.987 1.005-3.67-.236-.376a9.885 9.885 0 01-1.514-5.218c.003-5.42 4.416-9.83 9.84-9.83a9.77 9.77 0 016.956 2.884 9.783 9.783 0 012.879 6.963c-.003 5.422-4.417 9.829-9.743 9.859z" /></svg>
                    </button>
                    <button type="button" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer")} className="soc-btn fb" title="Bagikan ke Facebook" aria-label="Bagikan ke Facebook">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.09 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.79-4.7 4.533-4.7 1.313 0 2.686.236 2.686.236v2.973h-1.514c-1.491 0-1.956.931-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.09 24 18.1 24 12.073z" /></svg>
                    </button>
                    <button type="button" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank", "noopener,noreferrer")} className="soc-btn x" title="Bagikan ke X" aria-label="Bagikan ke X">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21.5l-7.11 8.126L22.75 22h-6.57l-5.147-6.73L5.14 22H1.88l7.604-8.683L1.5 2h6.737l4.652 6.14L18.244 2zm-1.146 17.57h1.805L7.27 4.34H5.333L17.098 19.57z" /></svg>
                    </button>
                    <button type="button" onClick={() => window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(`${article.title || ""} ${shareUrl}`)}`, "_blank", "noopener,noreferrer")} className="soc-btn threads" title="Bagikan ke Threads" aria-label="Bagikan ke Threads">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.1 2.5c5.6 0 9.4 3.7 9.4 9.4 0 6.1-3.7 9.6-9.5 9.6-5.7 0-9.5-3.3-9.5-9.1 0-5.9 3.7-9.3 9.1-9.3 4.5 0 7.7 2.2 8.7 5.9" /><path d="M13.3 8.1c1.9.2 3.5 1.4 3.5 3.7 0 2.7-1.8 4.3-4.4 4.3-2.2 0-3.8-1.3-3.8-3.2 0-1.7 1.2-2.9 3-2.9 2.2 0 4.2 1.3 5.6 3.8" /></svg>
                    </button>
                    <button type="button" onClick={() => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, "_blank", "noopener,noreferrer")} className="soc-btn tg" title="Bagikan ke Telegram" aria-label="Bagikan ke Telegram">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21.5 3.5L2.9 10.68c-1.27.5-1.26 1.2-.23 1.51l4.78 1.49 1.83 5.58c.22.63.11.88.76.88.5 0 .72-.23.99-.5l2.33-2.27 4.84 3.57c.89.49 1.53.24 1.76-.82l3.14-14.8c.35-1.31-.5-1.9-1.61-1.42zM8.18 13.32l9.35-5.9c.47-.28.9-.13.55.18l-7.56 6.83-.29 3.11-2.05-4.22z" /></svg>
                    </button>
                    <button type="button" onClick={() => { const subject = encodeURIComponent(article.title || "Artikel SukaMuda"); const body = encodeURIComponent(shareUrl); window.location.href = `mailto:?subject=${subject}&body=${body}`; }} className="soc-btn email" title="Kirim lewat Email" aria-label="Kirim artikel lewat Email">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3,7 12,13 21,7" /></svg>
                    </button>
                    <button type="button" onClick={handleCopyLink} className="soc-btn copy" title="Salin tautan" aria-label="Salin tautan artikel">
                      {copyText === "Tersalin!" ? (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* REPORT FORM */}
                {showReportForm && (
                  <div className="report-form-card">
                    <label htmlFor="reportReason">Alasan laporan</label>
                    <textarea id="reportReason" value={reportReason} onChange={(event) => setReportReason(event.target.value)} placeholder="Jelaskan alasan kamu melaporkan artikel ini..." rows={4} maxLength={1000} />
                    <div className="report-form-actions">
                      <button type="button" className="submit-report-btn" onClick={handleReportSubmit} disabled={isReporting}>{isReporting ? "Mengirim..." : "Kirim Laporan"}</button>
                      <button type="button" className="cancel-report-btn" onClick={() => { setShowReportForm(false); setReportStatus(null); }}>Batal</button>
                    </div>
                    {reportStatus && (
                      <div className={`report-feedback ${reportStatus.success ? "success" : "error"}`} role={reportStatus.success ? "status" : "alert"}>
                        {reportStatus.message}
                      </div>
                    )}
                  </div>
                )}

                {/* AUTHOR BOTTOM */}
                {article.user && (
                  <div className="author-bio-card">
                    <div className="author-bio-avatar">
                      {authorImage ? (
                        <img src={authorImage} alt={`Foto profil ${authorName}`} loading="lazy" decoding="async" width="72" height="72" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createPlaceholder("U"); }} />
                      ) : (
                        <span aria-hidden="true">{authorName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="author-bio-info">
                      <h2><Link to={authorProfileUrl} className="author-name-link">{authorName}</Link></h2>
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* AFTER ARTICLE AD */}
            <div className="ad-center ad-after-article" aria-label="Iklan">
              <AdSlot type="horizontal" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_HORIZONTAL_SLOT} />
            </div>

            {/* RELATED */}
            {relatedArticles.length > 0 && (
              <section className="related-section-new" aria-labelledby="related-heading">
                <div className="section-header">
                  <h2 className="section-title" id="related-heading">Baca Juga</h2>
                  <Link to={`/category/${encodeURIComponent(categorySlug)}`} className="see-all-link">Lihat Semua</Link>
                </div>
                <div className="related-grid-new">
                  {relatedArticles.map((item) => {
                    const itemSlug = String(item?.slug || "").trim();
                    if (!itemSlug) return null;
                    const label = getCategoryLabel(item.category);
                    const itemDate = item.published_at || item.created_at;
                    let formattedRelatedDate = "Baca Juga";
                    if (itemDate) {
                      const relatedDate = new Date(itemDate);
                      if (!Number.isNaN(relatedDate.getTime())) {
                        formattedRelatedDate = relatedDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                      }
                    }
                    return (
                      <Link className="related-card" key={item.id ?? itemSlug} to={`/article/${encodeURIComponent(itemSlug)}`}>
                        <div className="related-img-wrap">
                          <img src={getImageUrl(item.image || item.featured_image || item.thumbnail, label)} alt={item.title || "Artikel"} loading="lazy" decoding="async" width="600" height="400" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = createPlaceholder(label); }} />
                          <span className="related-cat">{label}</span>
                        </div>
                        <div className="related-grid-text">
                          <h3>{item.title}</h3>
                          <span className="related-date">{formattedRelatedDate}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* RIGHT AD - HIDDEN ON MOBILE */}
        {!isCompactLayout && (
          <aside className="ad-sidebar ad-sidebar-right" aria-label="Iklan">
            <div className="ad-sidebar-sticky">
              <AdSlot type="vertical" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_VERTICAL_SLOT} />
            </div>
          </aside>
        )}
      </div>

      {/* FOOTER AD */}
      <div className="ad-before-footer" aria-label="Iklan">
        <AdSlot type="horizontal" mode="adsense" adClient={ADSENSE_CLIENT} adSlot={ADSENSE_HORIZONTAL_SLOT} />
      </div>
    </>
  );
};

export default ArticleDetail;