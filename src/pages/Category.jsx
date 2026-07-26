import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axiosConfig";
import "./Category.css";

const baseUrl = import.meta.env.VITE_API_URL || 'https://sukamuda.co.id';

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

const normalizeCategory = (value) => (value || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '');

const slugCategoryMap = {
  sport: ['sport', 'sport & e-sport', 'sport-esport', 'sport e-sport'],
  music: ['music', 'music & film', 'music&film', 'music and film'],
  news: ['news', 'school', 'college', 'general'], 
  lifestyle: ['lifestyle', 'style', 'health', 'food', 'travel'], 
};

const displayLabelMap = {
  sport: 'Sport & E-Sport',
  music: 'Music & Film',
  news: 'News',
  lifestyle: 'Lifestyle',
};

const formatCategoryLabel = (slug = '') => {
  if (displayLabelMap[slug]) return displayLabelMap[slug];

  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const fetchPublicArticles = async () => {
  const response = await axios.get('/api/public-articles');
  return Array.isArray(response.data) ? response.data : [];
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

    return videoId ? ("https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg") : '';
  } catch {
    return '';
  }
};

const Category = () => {
  const { slug } = useParams();
  const categoryLabel = formatCategoryLabel(slug);
  const canonicalUrl = "https://sukamuda.co.id/category/" + slug;

  const {
    data: allArticles = [],
    isLoading: loading,
    isError
  } = useQuery({
    queryKey: ["publicArticles"],
    queryFn: fetchPublicArticles,
    staleTime: 1000 * 60 * 5
  });

  const articles = useMemo(() => {
    const acceptedCategoryNormals = (slugCategoryMap[slug]
      ? slugCategoryMap[slug]
      : [slug]
    ).map(normalizeCategory);

    return allArticles.filter((item) => {
      const categoryNormal = normalizeCategory(item?.category);
      return acceptedCategoryNormals.includes(categoryNormal);
    });
  }, [allArticles, slug]);

  /* PERBAIKAN SEO: Standar CollectionPage Schema dipisah rapi dengan Breadcrumb & ItemList */
  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Beranda",
        "item": "https://sukamuda.co.id"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryLabel,
        "item": canonicalUrl
      }
    ]
  };

  const schemaCollectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "headline": `Berita ${categoryLabel} Terbaru`,
    "url": canonicalUrl,
    "name": `Kategori ${categoryLabel} - SukaMuda`,
    "description": `Kumpulan berita dan artikel terbaru seputar ${categoryLabel} di SukaMuda.`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `Artikel ${categoryLabel}`,
      "numberOfItems": articles.length,
      "itemListElement": articles.slice(0, 20).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": "https://sukamuda.co.id/article/" + article.slug
      }))
    }
  };

  return (
    <section className="category-container" aria-labelledby="category-page-title">
      <Helmet>
        <title>Kategori {categoryLabel} - SukaMuda</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={`Baca artikel terbaru di kategori ${categoryLabel} di SukaMuda.`} />
        <meta property="og:title" content={`${categoryLabel} - SukaMuda`} />
        <meta property="og:description" content={`Baca artikel terbaru di kategori ${categoryLabel} di SukaMuda.`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(schemaBreadcrumb)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(schemaCollectionPage)}
        </script>
      </Helmet>

      <header className="category-header">
        <h1 id="category-page-title" style={{ textTransform: 'capitalize', color: '#000', marginBottom: '30px', fontSize: '1.5em' }}>
          Kategori: {categoryLabel}
        </h1>
      </header>

      <h2 id="category-articles-heading" className="category-sr-only">
        Daftar artikel kategori {categoryLabel}
      </h2>

      {loading ? (
        <div className="category-empty" role="status">Memuat Berita {categoryLabel}...</div>
      ) : isError ? (
        <div className="category-empty" role="alert">
          Gagal memuat artikel kategori {categoryLabel}.
        </div>
      ) : (
        <section className="article-grid" aria-labelledby="category-articles-heading">
          {articles.length > 0 ? (
            articles.map((article, index) => {
              const authorName = article.user?.name || 'Anonim';
              const authorPhoto = article.user?.avatar
                || article.user?.profile_photo_url
                || article.user?.photo
                || article.user?.image
                || article.user?.picture
                || null;
              const authorPhotoUrl = authorPhoto
                ? (authorPhoto.startsWith('http') ? authorPhoto : baseUrl + '/storage/' + authorPhoto)
                : null;

              return (
                <Link className="article-card" key={article.id || article.slug} to={`/article/${article.slug}`}>
                  <div className="article-image-wrapper">
                    <img
                      src={article.image
                        ? (article.image.startsWith('http') ? article.image : baseUrl + '/storage/' + article.image)
                        : (normalizeCategory(article.category) === 'podcast'
                          ? getYoutubeThumbnailUrl(article.video_link) || "https://placehold.co/400x225/f5f5f5/999?text=SukaMuda"
                          : "https://placehold.co/400x225/f5f5f5/999?text=SukaMuda")}
                      alt={article.title}
                      width="400"
                      height="225"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/400x225/f5f5f5/999?text=Image+Error";
                      }}
                    />
                  </div>

                  <div className="article-content-preview">
                    <span className="badge-category">{article.category}</span>
                    <h3>{article.title}</h3>

                    <p className="article-excerpt">
                      {(article.content || '')
                        .replace(/<[^>]*>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .substring(0, 100) + '...'}
                    </p>

                    <div className="article-author">
                      {normalizeCategory(article.category) !== 'podcast' ? (
                        <>
                          <div className="author-avatar-wrap">
                            {authorPhotoUrl ? (
                              <img
                                src={authorPhotoUrl}
                                alt=""
                                className="author-avatar-img"
                                width="24"
                                height="24"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span
                              className="author-avatar-initials"
                              style={{ display: authorPhotoUrl ? 'none' : 'flex' }}
                            >
                              {getInitials(authorName)}
                            </span>
                          </div>
                          <span className="author-name">{authorName}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="category-empty" role="status">
              <p>Belum ada artikel di kategori <strong>{categoryLabel}</strong>.</p>
            </div>
          )}
        </section>
      )}
    </section>
  );
};

export default Category;