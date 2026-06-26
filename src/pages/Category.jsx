import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
  
  // Tambahkan mapping untuk news dan subkategorinya di sini
  news: ['news', 'school', 'college', 'general'], 
  
  // Tambahkan mapping untuk lifestyle dan subkategorinya di sini
  // (Sesuaikan array-nya jika nama subkategorinya berbeda)
  lifestyle: ['lifestyle', 'style', 'health', 'food', 'travel'], 
};

const displayLabelMap = {
  sport: 'Sport & E-Sport',
  music: 'Music & Film',
  news: 'News',
  lifestyle: 'Lifestyle',
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

const Category = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/public-articles');

        const acceptedCategoryNormals = (slugCategoryMap[slug]
          ? slugCategoryMap[slug]
          : [slug]
        ).map(normalizeCategory);

        const filtered = response.data.filter((item) => {
          const catNorm = normalizeCategory(item.category);
          return acceptedCategoryNormals.includes(catNorm);
        });

        setArticles(filtered);
      } catch (error) {
        console.error("Gagal ambil berita:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [slug]);

  return (
    <div className="category-container">
      <header className="category-header">
        <h2 style={{ textTransform: 'capitalize', color: '#000', marginBottom: '30px' }}>
          Kategori: {displayLabelMap[slug] || slug}
        </h2>
      </header>

      {loading ? (
        <div className="category-empty">Memuat Berita {displayLabelMap[slug] || slug}...</div>
      ) : (
        <div className="article-grid">
          {articles.length > 0 ? (
            articles.map((article) => {
              const authorName = article.user?.name || 'Anonim';
              const authorPhoto = article.user?.avatar
                || article.user?.profile_photo_url
                || article.user?.photo
                || article.user?.image
                || article.user?.picture
                || null;
              const authorPhotoUrl = authorPhoto
                ? (authorPhoto.startsWith('http') ? authorPhoto : `${baseUrl}/storage/${authorPhoto}`)
                : null;

              return (
                <Link className="article-card" key={article.id} to={`/article/${article.slug}`}>
                  <div className="article-image-wrapper">
                    <img
                      src={article.image
                        ? (article.image.startsWith('http') ? article.image : `${baseUrl}/storage/${article.image}`)
                        : (normalizeCategory(article.category) === 'podcast'
                          ? getYoutubeThumbnailUrl(article.video_link) || "https://via.placeholder.com/400x250?text=SukaMuda"
                          : "https://via.placeholder.com/400x250?text=SukaMuda")}
                      alt={article.title}
                      onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x250?text=Image+Error"; }}
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
                                alt={authorName}
                                className="author-avatar-img"
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
            <div className="category-empty">
              <p>Belum ada artikel di kategori <strong>{displayLabelMap[slug] || slug}</strong>.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Category;