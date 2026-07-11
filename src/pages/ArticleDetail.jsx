import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { categories } from "../data/articles";
import AdSlot from '../components/AdSlot';
import "./ArticleDetail.css";

const baseUrl = import.meta.env.VITE_API_URL || 'https://sukamuda.co.id';

const normalizeCategory = (value) => (value || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '');

const PARAGRAPHS_PER_LOAD = 20;

const cleanSlugFromTimestamp = (slug) => {
  if (!slug) return '';
  const match = slug.match(/^(.+)-\d{10}$/);
  if (match) {
    return match[1];
  }
  return slug;
};

const splitHtmlByParagraph = (html) => {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return Array.from(doc.body.children);
};

const getVisibleHtml = (html, count) => {
  const elements = splitHtmlByParagraph(html);
  return elements.slice(0, count).map((el) => el.outerHTML).join('');
};

const getTotalParagraphs = (html) => splitHtmlByParagraph(html).length;

const extractRelatedIdsFromContent = (html) => {
  const ids = [];
  const regex = /\[related:(\d+)\]/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)];
};

const getSpotifyEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const normalized = url.trim();
    if (normalized.startsWith('spotify:')) {
      const parts = normalized.split(':').filter(Boolean);
      if (parts.length >= 3) {
        return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
      }
      return '';
    }
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes('spotify.com')) return '';
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] === 'embed') {
      parts.shift();
    }
    if (parts.length >= 2) {
      return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}`;
    }
    return '';
  } catch {
    return '';
  }
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const normalized = url.trim();
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();
    let videoId = '';

    if (host.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      if (parsed.pathname.startsWith('/watch')) {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1];
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1];
      } else if (parsed.pathname.startsWith('/live')) {
        videoId = parsed.searchParams.get('v');
      } else {
        const parts = parsed.pathname.split('/').filter(Boolean);
        videoId = parts[parts.length - 1] || '';
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
};

const getYoutubeThumbnailUrl = (url) => {
  if (!url) return '';
  try {
    const normalized = url.trim();
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();
    let videoId = '';

    if (host.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      if (parsed.pathname.startsWith('/watch')) {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1];
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1];
      } else if (parsed.pathname.startsWith('/live')) {
        videoId = parsed.searchParams.get('v');
      } else {
        const parts = parsed.pathname.split('/').filter(Boolean);
        videoId = parts[parts.length - 1] || '';
      }
    }

    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  } catch {
    return '';
  }
};

const StableHtmlRenderer = React.memo(({ html, className }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  }, [html]);

  return <div className={className} ref={ref} />;
});

StableHtmlRenderer.displayName = "StableHtmlRenderer";

const ArticleDetail = () => {
  const { slug: rawSlug } = useParams();
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const slug = cleanSlugFromTimestamp(rawSlug);

  const [article, setArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copyText, setCopyText] = useState("Salin");
  const [showShareFloat, setShowShareFloat] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState(null);
  const [isReporting, setIsReporting] = useState(false);
  const [hasAwardedRead, setHasAwardedRead] = useState(false);
  const hasAwardedReadRef = useRef(false);

  const [visibleParagraphs, setVisibleParagraphs] = useState(PARAGRAPHS_PER_LOAD);

  const contentRef = useRef(null);

  const shareUrl = useMemo(() => {
    const articleSlug = article?.slug || slug;
    if (!articleSlug) {
      return typeof window !== "undefined" ? window.location.href : "";
    }
    try {
      const apiOrigin = new URL(baseUrl).origin;
      return `${apiOrigin}/article/${articleSlug}`;
    } catch {
      return typeof window !== "undefined" ? window.location.origin + `/article/${articleSlug}` : `/${articleSlug}`;
    }
  }, [article?.slug, slug]);

  const { data: allArticles = [], isLoading: articleLoading } = useQuery({
    queryKey: ['publicArticles'],
    queryFn: async () => {
      const res = await axios.get('/api/public-articles');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const articleFromList = useMemo(() => {
    if (!slug || !allArticles.length) return null;
    const safeSlug = String(slug).toLowerCase();
    return allArticles.find((item) => {
      if (!item || !item.slug) return false;
      const itemSlugClean = cleanSlugFromTimestamp(String(item.slug)).toLowerCase();
      return itemSlugClean === safeSlug || String(item.slug).toLowerCase() === safeSlug || String(item.id) === String(slug);
    }) || null;
  }, [slug, allArticles]);

  const { data: articleDetail } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const res = await axios.get(`/api/articles/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    const source = articleFromList || articleDetail;

    setArticle(source);

    if (source) {
      setLikeCount(source.likes_count || 0);
      setIsLiked(source.is_liked_by_user || false);
      setIsBookmarked(source.is_bookmarked_by_user || false);
      setViewCount(source.views_count || source.views || 0);
    }

    setVisibleParagraphs(PARAGRAPHS_PER_LOAD);
    setHasAwardedRead(false);
    hasAwardedReadRef.current = false;
    window.scrollTo(0, 0);

  }, [slug, articleFromList, articleDetail]);

  const awardReadPoint = async () => {
    if (hasAwardedReadRef.current || !article?.id) return;
    hasAwardedReadRef.current = true;
    try {
      const res = await axios.get(`/api/articles/${article.id}/view`);
      if (res?.data?.views !== undefined) {
        setViewCount(res.data.views);
      } else {
        setViewCount((prev) => prev + 1);
      }
      setHasAwardedRead(true);
    } catch (error) {
      console.error('Gagal meningkatkan mata/read count:', error);
      hasAwardedReadRef.current = false;
    }
  };

  const totalParagraphs = getTotalParagraphs(article?.content || "");
  const hasMore = visibleParagraphs < totalParagraphs;

  const visibleHtml = useMemo(
    () => getVisibleHtml(article?.content || "", visibleParagraphs),
    [article?.content, visibleParagraphs]
  );

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setReadProgress(Math.min(progress, 100));
    setShowBackTop(scrollTop > 600);
    setShowShareFloat(scrollTop > 400);

    if (!hasMore && !hasAwardedRead) {
      const scrollBottom = scrollTop + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= pageHeight - 24) {
        awardReadPoint();
      }
    }
  }, [hasMore, hasAwardedRead, article?.id]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const getReadingTime = (text) => {
    if (!text) return "< 1 menit baca";
    const wordCount = text.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return `${Math.ceil(wordCount / 200)} menit baca`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopyText("Tersalin!");
    setTimeout(() => setCopyText("Salin"), 2000);
  };

  const handleLike = async () => {
    if (!isLoggedIn) return alert("Kamu harus login dulu untuk menyukai artikel ini.");
    if (!article?.id) return;
    const prevLiked = isLiked;
    const prevCount = likeCount;
    try {
      setIsLiked(!prevLiked);
      setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
      const res = await axios.post(`/api/articles/${article.id}/like`);
      setLikeCount(res.data.likes_count);
      setIsLiked(res.data.status === 'liked');
      queryClient.invalidateQueries(['publicArticles']);
    } catch (error) {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) return alert("Kamu harus login dulu untuk menyimpan artikel ini.");
    if (!article?.id) return;
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      await axios.post(`/api/articles/${article.id}/bookmark`);
      queryClient.invalidateQueries(['publicArticles']);
    } catch (error) {
      setIsBookmarked(prev);
    }
  };

  const handleReportSubmit = async () => {
    if (!isLoggedIn) {
      return alert("Kamu harus login dulu untuk melaporkan artikel ini.");
    }
    if (!reportReason.trim()) {
      return alert("Silakan isi alasan laporan terlebih dahulu.");
    }
    setIsReporting(true);
    setReportStatus(null);
    try {
      await axios.post('/api/reports', {
        article_id: article?.id,
        reason: reportReason.trim(),
      });
      setReportStatus({ success: true, message: 'Laporan berhasil dikirim.' });
      setReportReason('');
      setShowReportForm(false);
    } catch (error) {
      setReportStatus({
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim laporan. Coba lagi nanti.',
      });
    } finally {
      setIsReporting(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const isPageLoading = articleLoading && !articleFromList;

  if (isPageLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Menyelami berita...</p>
      </div>
    );
  }

  if (!slug || slug.length < 2) {
    return (
      <div className="error-container">
        <h2>Waduh!</h2>
        <p>Link yang kamu buka tidak valid.</p>
        <Link to="/">Balik ke Home</Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="error-container">
        <h2>Waduh!</h2>
        <p>Artikelnya nggak ketemu.</p>
        <Link to="/">Balik ke Home</Link>
      </div>
    );
  }

  const isPodcast = normalizeCategory(article.category) === 'podcast';
  const categoryLabel = categories.find((item) => item.slug === normalizeCategory(article.category))?.label || article.category;

  const relatedShortcodeIds = extractRelatedIdsFromContent(article.content || "");
  const relatedShortcodeArticles = relatedShortcodeIds
    .map((articleId) => allArticles.find((item) => String(item.id) === String(articleId)))
    .filter(Boolean);

  const relatedArticles = allArticles
    .filter((item) => normalizeCategory(item.category) === normalizeCategory(article.category) && String(item.id) !== String(article.id))
    .slice(0, 3);

  const spotifyEmbedUrl = article.audio_link ? getSpotifyEmbedUrl(article.audio_link) : '';
  const youtubeEmbedUrl = article.video_link ? getYoutubeEmbedUrl(article.video_link) : '';
  const showPodcastEmbed = isPodcast && (spotifyEmbedUrl || youtubeEmbedUrl);

  const youtubeThumbnail = isPodcast && article.video_link ? getYoutubeThumbnailUrl(article.video_link) : '';

  const imageUrl = article.image
    ? (article.image.startsWith("http") ? article.image : `${baseUrl}/storage/${article.image}`)
    : (youtubeThumbnail || `https://placehold.co/1200x600/1a1a1a/ffffff?text=${encodeURIComponent(categoryLabel || 'Artikel')}`);

  const fallbackPlaceholder = `https://placehold.co/1200x600/1a1a1a/ffffff?text=${encodeURIComponent(categoryLabel || 'Artikel')}`;

  const tagsArray = article.tags
    ? typeof article.tags === "string"
      ? article.tags.split(/[ ,#]+/).filter((t) => t.trim() !== "").map((t) => t.trim())
      : article.tags
    : [];

  const authorProfileUrl = article.user?.id ? `/user/${article.user.id}` : '/';
  const isDraft = article.status === "draft";
  const encodedTitle = encodeURIComponent(article.title || '');
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleLoadMore = () => {
    setVisibleParagraphs((prev) => {
      const next = Math.min(prev + PARAGRAPHS_PER_LOAD, totalParagraphs);
      if (next >= totalParagraphs && !hasAwardedRead) {
        awardReadPoint();
      }
      return next;
    });
  };

  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": shareUrl
    },
    "headline": article.title,
    "image": [
      imageUrl
    ],
    "datePublished": article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "author": {
      "@type": "Person",
      "name": article.user?.name || "Anonim",
      "url": `${baseUrl}${authorProfileUrl}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sukamuda",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "description": article.summary || article.title
  };

  return (
    <>
      <Helmet>
        <title>{article.title}</title>
        <link rel="canonical" href={shareUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary || article.title} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }} />
      </Helmet>

      <div className="reading-progress-bar" style={{ width: `${readProgress}%` }} />
      <button
        className={`back-to-top ${showBackTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
      >
        <svg className="back-top-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <div className="article-layout-wrapper">

        <div className="ad-sidebar ad-sidebar-left">
          <div className="ad-sidebar-sticky">
            <AdSlot
              type="vertical"
              mode="adsense"
              adClient="ca-pub-7608424206122269"
              adSlot="9190843316"
            />
          </div>
        </div>

        <div className="article-main-content">

          <div className="ad-center">
            <AdSlot
              type="horizontal"
              mode="adsense"
              adClient="ca-pub-7608424206122269"
              adSlot="9097520145"
            />
          </div>

          <div className="article-container">
            <nav className="breadcrumb">
              <Link to="/">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
              </Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <Link to={`/category/${article.category}`}>{categoryLabel}</Link>
            </nav>

            <header className="article-header">
              <div className="header-top-row">
                <span className="badge-category">{categoryLabel}</span>
                {isDraft && (
                  <span className="badge-draft">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Draf
                  </span>
                )}
                <div className="view-count">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {viewCount.toLocaleString("id-ID")}
                </div>
              </div>

              <h1 className="article-title">{article.title}</h1>
              {article.summary && <p className="article-summary">"{article.summary}"</p>}

              <div className="author-meta">
                <Link to={authorProfileUrl} className="author-link">
                  <div className="author-avatar">
                    {article.user?.avatar ? (
                      <img
                        src={article.user.avatar.startsWith("http") ? article.user.avatar : `${baseUrl}/storage/${article.user.avatar}`}
                        alt={article.user?.name}
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100/1a1a1a/ffffff?text=U"; }}
                      />
                    ) : (
                      article.user?.name?.charAt(0) || "A"
                    )}
                  </div>
                </Link>
                <div className="author-info">
                  <Link to={authorProfileUrl} className="author-name-link">
                    <span className="author-name">{article.user?.name || "Anonim"}</span>
                  </Link>
                  {article.user?.profession && (
                    <span className="author-profession">
                      {article.user.profession}
                      {['Pelajar', 'Mahasiswa', 'Pelajar/Mahasiswa'].includes(article.user.profession) && (article.user?.schoolName || article.user?.school_name)
                        ? ` · ${article.user.schoolName || article.user.school_name}`
                        : ''}
                    </span>
                  )}
                  <div className="meta-bottom">
                    <span className="publish-date">
                      {new Date(article.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="meta-dot">·</span>
                    <span className="read-time">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {getReadingTime(article.content)}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <div className="hero-wrapper">
              {imageUrl && !isPodcast && (
                <>
                  <img
                    src={imageUrl}
                    alt={article.title}
                    className="hero-img"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = fallbackPlaceholder; }}
                  />
                  {article.image_caption && (
                    <p className="image-caption-text">{article.image_caption}</p>
                  )}
                </>
              )}

              {showPodcastEmbed && (
                <div className="podcast-embed-section" style={{ marginBottom: '24px' }}>
                  {spotifyEmbedUrl && (
                    <div className="podcast-embed podcast-audio" style={{ marginBottom: '24px' }}>
                      <iframe
                        key={spotifyEmbedUrl}
                        src={spotifyEmbedUrl}
                        width="100%"
                        height="232"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        title="Spotify podcast"
                      ></iframe>
                    </div>
                  )}
                  {youtubeEmbedUrl && (
                    <div className="podcast-embed podcast-video">
                      <iframe
                        key={youtubeEmbedUrl}
                        src={youtubeEmbedUrl}
                        width="100%"
                        height="360"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video"
                      ></iframe>
                    </div>
                  )}
                </div>
              )}

              <article className="content-body" ref={contentRef}>
                {isDraft && (
                  <div className="draft-banner">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                      <strong>Artikel ini masih berstatus draf</strong>
                      <p>Konten belum dipublikasikan secara resmi dan dapat berubah sewaktu-waktu.</p>
                    </div>
                  </div>
                )}

                <StableHtmlRenderer
                  className="text-render"
                  html={visibleHtml}
                />

                {hasMore && (
                  <div className="load-more-wrapper">
                    <button className="load-more-btn" onClick={handleLoadMore}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      Muat Lebih Banyak
                    </button>
                  </div>
                )}

                {relatedShortcodeArticles.length > 0 && (
                  <section className="related-section-new" style={{ marginTop: '32px' }}>
                    <div className="section-header">
                      <h2 className="section-title">Baca Juga</h2>
                    </div>
                    <div className="related-grid-new">
                      {relatedShortcodeArticles.map((item) => {
                        const shortcodeCategoryLabel = categories.find((c) => c.slug === normalizeCategory(item.category))?.label || item.category;
                        const itemImage = item.image
                          ? (item.image.startsWith('http') ? item.image : `${baseUrl}/storage/${item.image}`)
                          : `https://placehold.co/400x220/1a1a1a/ffffff?text=${encodeURIComponent(shortcodeCategoryLabel || 'Berita')}`;
                        return (
                          <Link className="related-card" key={item.id} to={`/article/${item.slug}`}>
                            <div className="related-img-wrap">
                              <img src={itemImage} alt={item.title} loading="lazy" onError={(e) => { e.currentTarget.src = `https://placehold.co/400x220/1a1a1a/ffffff?text=${encodeURIComponent(shortcodeCategoryLabel || 'Berita')}`; }} />
                              <span className="related-cat">{shortcodeCategoryLabel}</span>
                            </div>
                            <div className="related-text">
                              <h4>{item.title}</h4>
                              <span className="related-date">Baca Juga</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                )}

                {!hasMore && tagsArray.length > 0 && (
                  <div className="tags-container">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    {tagsArray.map((tag, i) => (
                      <span key={i} className="tag-chip">#{tag}</span>
                    ))}
                  </div>
                )}

                {!hasMore && (
                  <div className="interactions-section">
                    <div className="interactions-left">
                      <button className={`like-btn ${isLiked ? "active" : ""}`} onClick={handleLike}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "#d83a34" : "none"} stroke="#d83a34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span>{likeCount > 0 ? likeCount : "Suka"}</span>
                      </button>
                      <button className="report-btn" onClick={() => setShowReportForm((prev) => !prev)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                        </svg>
                        <span>{showReportForm ? 'Tutup Laporan' : 'Laporkan'}</span>
                      </button>
                    </div>
                    <div className="share-row">
                      <span className="share-label">Bagikan:</span>
                      <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, "_blank")} className="soc-btn wa" title="WhatsApp">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      </button>
                      <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")} className="soc-btn fb" title="Facebook">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      </button>
                      <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank")} className="soc-btn x" title="X (Twitter)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </button>
                      <button onClick={() => window.open(`https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`, "_blank")} className="soc-btn threads" title="Threads">
                        <svg width="16" height="16" viewBox="2 2 20 20" fill="#fff" stroke="none" fillRule="nonzero">
                          <path d="M14.017 12.392c.033-1.614-.85-2.888-2.28-2.888-1.39 0-2.26 1.24-2.26 2.888 0 1.637.86 2.87 2.26 2.87 1.44 0 2.247-1.233 2.28-2.87zm4.184-1.18c0 4.607-3.342 7.74-7.85 7.74-4.516 0-7.848-3.133-7.848-7.74 0-4.6 3.332-7.73 7.848-7.73 3.63 0 6.45 2.06 7.42 5.16h-2.14c-.81-1.9-2.86-3.15-5.28-3.15-3.23 0-5.63 2.14-5.63 5.72 0 3.57 2.4 5.73 5.63 5.73 3.24 0 5.64-2.16 5.64-5.73V11c0-1.85-1.28-3.25-3.1-3.25-1.23 0-2.29.62-2.81 1.66h-.06v-1.52h-2v5.71c0 2.2 1.48 3.82 3.56 3.82 1.68 0 2.92-.93 3.32-2.42h.06v1.17h2v-4.96z" />
                        </svg>
                      </button>
                      <button onClick={() => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, "_blank")} className="soc-btn tg" title="Telegram">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                      </button>
                      <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")} className="soc-btn li" title="LinkedIn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.003z" /></svg>
                      </button>
                      <button onClick={() => window.open(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`, "_blank")} className="soc-btn email" title="Email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </button>
                      <button onClick={handleCopyLink} className="soc-btn copy" title="Salin tautan">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>{copyText}</span>
                      </button>
                    </div>
                  </div>
                )}

                {showReportForm && !hasMore && (
                  <div className="report-form-card">
                    <label htmlFor="reportReason">Alasan laporan</label>
                    <textarea
                      id="reportReason"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Jelaskan alasan kamu melaporkan artikel ini..."
                      rows={4}
                    />
                    <div className="report-form-actions">
                      <button type="button" className="submit-report-btn" onClick={handleReportSubmit} disabled={isReporting}>
                        {isReporting ? 'Mengirim...' : 'Kirim Laporan'}
                      </button>
                      <button type="button" className="cancel-report-btn" onClick={() => setShowReportForm(false)}>
                        Batal
                      </button>
                    </div>
                    {reportStatus && (
                      <div className={`report-feedback ${reportStatus.success ? 'success' : 'error'}`}>
                        {reportStatus.message}
                      </div>
                    )}
                  </div>
                )}

                {!hasMore && article.user && (
                  <div className="author-bio-card">
                    <div className="author-bio-avatar">
                      {article.user.avatar ? (
                        <img
                          src={article.user.avatar.startsWith("http") ? article.user.avatar : `${baseUrl}/storage/${article.user.avatar}`}
                          alt={article.user.name}
                          onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100/1a1a1a/ffffff?text=U"; }}
                        />
                      ) : (
                        article.user.name?.charAt(0) || "A"
                      )}
                    </div>
                    <div className="author-bio-info">
                      <h4>
                        <Link to={authorProfileUrl} className="author-name-link">
                          {article.user.name}
                        </Link>
                      </h4>
                      {article.user.bio && <p>{article.user.bio}</p>}
                    </div>
                  </div>
                )}
              </article>
            </div>

            {!hasMore && (
              <div className="ad-center" style={{ margin: '32px 0' }}>
                <AdSlot
                  type="horizontal"
                  mode="adsense"
                  adClient="ca-pub-7608424206122269"
                  adSlot="9097520145"
                />
              </div>
            )}

            {!hasMore && relatedArticles.length > 0 && (
              <section className="related-section-new">
                <div className="section-header">
                  <h2 className="section-title">Baca Juga</h2>
                  <Link to={`/category/${article.category}`} className="see-all-link">
                    Lihat Semua
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </Link>
                </div>
                <div className="related-grid-new">
                  {relatedArticles.map((item) => {
                    const relatedCategoryLabel = categories.find((c) => c.slug === normalizeCategory(item.category))?.label || item.category;
                    return (
                      <Link className="related-card" key={item.id} to={`/article/${item.slug}`}>
                        <div className="related-img-wrap">
                          <img
                            src={item.image?.startsWith("http") ? item.image : `${baseUrl}/storage/${item.image}`}
                            alt={item.title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/400x220/1a1a1a/ffffff?text=${encodeURIComponent(relatedCategoryLabel || 'Berita')}`;
                            }}
                          />
                          <span className="related-cat">{relatedCategoryLabel}</span>
                        </div>
                        <div className="related-grid-text">
                          <h4>{item.title}</h4>
                          <span className="related-date">{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

        </div>

        <div className="ad-sidebar ad-sidebar-right">
          <div className="ad-sidebar-sticky">
            <AdSlot
              type="vertical"
              mode="adsense"
              adClient="ca-pub-7608424206122269"
              adSlot="9190843316"
            />
          </div>
        </div>

      </div>

      <div className="ad-before-footer">
        <AdSlot
          type="horizontal"
          mode="adsense"
          adClient="ca-pub-7608424206122269"
          adSlot="9097520145"
        />
      </div>
    </>
  );
};

export default ArticleDetail;