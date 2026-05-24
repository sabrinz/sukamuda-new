import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosConfig";
import { categoryGroups } from "../data/articles";
import AdSlot from '../components/AdSlot';
import "./home.css";

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const resolveImageUrl = (value) => {
  if (!value) return null;
  return value.startsWith('http') ? value : `${baseUrl}/storage/${value}`;
};

const fetchArticles = async () => {
  const response = await axios.get('/api/public-articles');
  return Array.isArray(response.data) ? response.data : [];
};

const fetchTrending = async () => {
  const response = await axios.get('/api/trending-articles');
  return Array.isArray(response.data) ? response.data : [];
};

function Home() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ['publicArticles'], queryFn: fetchArticles });
    queryClient.prefetchQuery({ queryKey: ['trendingArticles'], queryFn: fetchTrending });
  }, [queryClient]);

  const { data: allArticles = [], isLoading: articleLoading } = useQuery({
    queryKey: ['publicArticles'],
    queryFn: fetchArticles,
    staleTime: 1000 * 60 * 5,
  });

  const { data: trendingArticles = [], isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingArticles'],
    queryFn: fetchTrending,
    staleTime: 1000 * 60 * 5,
  });

  const formatCategory = (cat) =>
    cat ? cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase() : "Umum";

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const normalizeCategory = (value) => (value || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '');

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

  const [activePodcastId, setActivePodcastId] = React.useState(null);

  const togglePodcastPlayer = (articleId) => {
    setActivePodcastId((prev) => (prev === articleId ? null : articleId));
  };

  const renderTrendingItem = (article, index) => {
    if (!article) return null;

    const imageUrl = article.image
      ? (article.image.startsWith('http') ? article.image : `${baseUrl}/storage/${article.image}`)
      : "https://via.placeholder.com/150x100?text=SukaMuda";

    const authorPhoto = resolveImageUrl(article.user?.avatar || article.user?.profile_photo_url);
    const authorName = article.user?.name || 'Anonim';

    return (
      <Link className="trending-item" key={article.id || index} to={`/article/${article.id}`}>
        <div className="trending-rank">
          <span>{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="trending-thumb">
          <img
            src={imageUrl}
            alt={article.title}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150x100?text=Image"; }}
          />
        </div>
        <div className="trending-details">
          <span className="tag-category">{formatCategory(article.category)}</span>
          <h4>{article.title || "Judul tidak tersedia"}</h4>
          <div className="meta-info">
            <div className="author-avatar-xs">
              {authorPhoto ? (
                <img src={authorPhoto} alt={authorName} />
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

  const renderCard = (article, index) => {
    if (!article) return null;

    const isPodcast = normalizeCategory(article.category) === 'podcast';
    const videoThumbnail = !article.image && isPodcast
      ? getYoutubeThumbnailUrl(article.video_link)
      : '';

    const imageUrl = article.image
      ? (article.image.startsWith('http') ? article.image : `${baseUrl}/storage/${article.image}`)
      : (videoThumbnail || "https://via.placeholder.com/600x400?text=SukaMuda");

    const authorPhoto = isPodcast ? null : resolveImageUrl(article.user?.avatar || article.user?.profile_photo_url);
    const authorName = article.user?.name || 'Anonim';
    const spotifyEmbedUrl = article.audio_link ? getSpotifyEmbedUrl(article.audio_link) : '';
    const youtubeEmbedUrl = article.video_link ? getYoutubeEmbedUrl(article.video_link) : '';
    const showPodcastPlayer = isPodcast && activePodcastId === article.id;

    const cardInner = (
      <>
        <div className="article-image-wrapper">
          <img
            src={imageUrl}
            alt={article.title}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x400?text=Image"; }}
          />
        </div>
        <div className="card-content">
          <h3>{article.title || "Judul tidak tersedia"}</h3>
          <div className="card-meta">
            <div className="card-author">
              {authorPhoto ? (
                <div className="card-author-avatar-wrap">
                  <img src={authorPhoto} alt={authorName} className="card-author-avatar" />
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
            >
              {showPodcastPlayer ? 'Tutup Podcast' : 'Putar Podcast'}
            </button>
          )}
          {showPodcastPlayer && (
            <div className="podcast-player-panel">
              {spotifyEmbedUrl && (
                <div className="podcast-embed podcast-audio">
                  <iframe
                    src={spotifyEmbedUrl}
                    width="100%"
                    height="232"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
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

    if (isPodcast) {
      return (
        <div
          className={`article-card article-card--podcast ${index === 0 ? 'article-card--hero' : ''}`}
          key={article.id || index}
        >
          {cardInner}
        </div>
      );
    }

    return (
      <Link 
        className={`article-card ${index === 0 ? 'article-card--hero' : ''}`}
        key={article.id || index} 
        to={`/article/${article.id}`}>
        {cardInner}
      </Link>
    );
  };

  const SkeletonCard = () => (
    <div className="article-card skeleton">
      <div className="article-image-wrapper skeleton-img"></div>
      <div className="card-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>
      </div>
    </div>
  );

  const SkeletonTrending = () => (
    <div className="trending-item skeleton">
      <div className="trending-rank"><div className="skeleton-box"></div></div>
      <div className="trending-thumb"><div className="skeleton-img"></div></div>
      <div className="trending-details">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
      </div>
    </div>
  );

  const top5Trending = trendingLoading
    ? []
    : (Array.isArray(trendingArticles) ? trendingArticles.slice(0, 5) : []);

  return (
    <div className="home-container">

      {/* ===== LAYOUT: Iklan Kiri | Konten | Iklan Kanan ===== */}
      <div className="home-layout-wrapper">

        {/* Iklan Vertikal Kiri */}
        <div className="ad-sidebar ad-sidebar-left">
          <div className="ad-sidebar-sticky">
            <AdSlot type="vertical" label="Iklan" />
          </div>
        </div>

        {/* ===== KONTEN UTAMA ===== */}
        <div className="home-main-content">

          {/* Section Trending */}
          <section className="section-trending">
            <div className="section-header">
              <h2>Trending Hari Ini</h2>
              <div className="trending-count">
                <span>Top {trendingLoading ? '...' : top5Trending.length} Berita</span>
              </div>
            </div>
            <div className="trending-grid">
              {trendingLoading
                ? Array(5).fill(0).map((_, i) => <SkeletonTrending key={i} />)
                : top5Trending?.map((article, index) => renderTrendingItem(article, index))
              }
            </div>
          </section>

          {/* Iklan Horizontal Tengah */}
          <div className="ad-center">
            <AdSlot type="horizontal" label="Iklan" />
          </div>

          {/* Section Categories */}
          {categoryGroups?.map((group) => {
            const groupArticles = (Array.isArray(allArticles) ? allArticles : [])
              .filter((item) =>
                item?.category && group.categorySlugs?.some(
                  (slug) => slug.toLowerCase() === item.category.toLowerCase()
                ) && normalizeCategory(item.category) !== 'podcast'
              )
              .slice(0, 5);

            if (groupArticles.length === 0 && !articleLoading) return null;

            return (
              <section key={group.slug} className="home-section">
                <div className="section-header">
                  <h2>{group.label}</h2>
                  <Link to={`/category/${group.slug}`} className="section-link">
                    Lihat semua <span className="arrow-right">→</span>
                  </Link>
                </div>
                <div className="article-grid">
                  {articleLoading
                    ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    : groupArticles.map((article, index) => renderCard(article, index))
                  }
                </div>
              </section>
            );
          })}

          {/* Empty State */}
          {(Array.isArray(allArticles) ? allArticles.length === 0 : true) && !articleLoading && (
            <div className="empty-state">
              <p>Belum ada artikel yang diterbitkan saat ini.</p>
            </div>
          )}

        </div>
        {/* ===== END KONTEN UTAMA ===== */}

        {/* Iklan Vertikal Kanan */}
        <div className="ad-sidebar ad-sidebar-right">
          <div className="ad-sidebar-sticky">
            <AdSlot type="vertical" label="Iklan" />
          </div>
        </div>

      </div>
      {/* ===== END LAYOUT WRAPPER ===== */}

      {/* Iklan Horizontal sebelum Footer */}
      <div className="ad-before-footer">
        <AdSlot type="horizontal" label="Iklan" />
      </div>

    </div>
  );
}

export default Home;