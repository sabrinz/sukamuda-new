import React, { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import {
  IoDocumentTextOutline,
  IoSparkles,
  IoArrowForward,
  IoArrowBack,
  IoNewspaperOutline,
  IoGridOutline,
} from "react-icons/io5";

import axios from "../utils/axiosConfig";

import "./PublicProfile.css";

/* =========================================================
   SITE CONFIG
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";
const SITE_NAME = "SukaMuda";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const WEBSITE_ID = `${SITE_URL}/#website`;

const LOGO_ID = `${SITE_URL}/#logo`;

const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

const PLACEHOLDER_IMAGE = "/placeholder.svg";

/* =========================================================
   HELPERS
   ========================================================= */

const isAbsoluteHttpUrl = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  try {
    const parsed = new URL(value.trim());

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const resolveAssetUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const normalized = value.trim();

  if (!normalized) {
    return "";
  }

  if (isAbsoluteHttpUrl(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/storage/")) {
    return `${SITE_URL}${normalized}`;
  }

  if (normalized.startsWith("/")) {
    return `${SITE_URL}${normalized}`;
  }

  return `${SITE_URL}/storage/${normalized.replace(/^\/+/, "")}`;
};

const getInitials = (name) => {
  if (!name || typeof name !== "string") {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getSafeSlug = (value) => {
  if (!value) {
    return "";
  }

  return String(value).trim();
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   PUBLIC PROFILE
   ========================================================= */

function PublicProfile() {
  const { userId } = useParams();

  const [author, setAuthor] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /* =======================================================
     FETCH AUTHOR
     ======================================================= */

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchAuthor = async () => {
      if (!userId) {
        if (active) {
          setAuthor(null);
          setError("Profil tidak ditemukan.");
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `/api/users/${encodeURIComponent(userId)}`,
          { signal: controller.signal },
        );

        const data =
          response?.data?.data ||
          response?.data?.user ||
          response?.data ||
          null;

        if (!active) {
          return;
        }

        if (!data) {
          setAuthor(null);
          setError("Profil tidak ditemukan.");
          return;
        }

        setAuthor(data);
      } catch (requestError) {
        if (
          requestError?.code === "ERR_CANCELED" ||
          requestError?.name === "CanceledError"
        ) {
          return;
        }

        if (!active) {
          return;
        }

        setAuthor(null);

        setError(
          requestError?.response?.data?.message ||
            "Gagal memuat profil penulis.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAuthor();

    return () => {
      active = false;
      controller.abort();
    };
  }, [userId]);

  /* =======================================================
     NORMALIZED DATA
     ======================================================= */

  const authorName = String(author?.name || "Profil SukaMuda").trim();

  const canonicalUrl = useMemo(
    () =>
      userId
        ? `${SITE_URL}/user/${encodeURIComponent(String(userId))}`
        : `${SITE_URL}/user`,
    [userId],
  );

  const authorAvatar = useMemo(
    () =>
      resolveAssetUrl(
        author?.avatar ||
          author?.profile_photo_url ||
          author?.photo ||
          author?.image ||
          author?.picture,
      ),
    [author],
  );

  const authorCover = useMemo(
    () =>
      resolveAssetUrl(
        author?.coverPhoto ||
          author?.cover_photo ||
          author?.cover_photo_url ||
          author?.cover,
      ),
    [author],
  );

  const authorArticles = useMemo(
    () =>
      Array.isArray(author?.articles) ? author.articles.filter(Boolean) : [],
    [author],
  );

  const articleCount = authorArticles.length;

  const pageTitle = loading
    ? "Memuat Profil - SukaMuda"
    : error
      ? "Profil Tidak Ditemukan - SukaMuda"
      : `${authorName} - SukaMuda`;

  const pageDescription = error
    ? "Profil penulis SukaMuda tidak ditemukan."
    : author?.bio
      ? String(author.bio).trim()
      : `${authorName} adalah penulis di SukaMuda dengan ${articleCount} artikel yang dipublikasikan.`;

  const profession = String(author?.profession || author?.profesi || "").trim();

  const institution = String(
    author?.schoolName ||
      author?.school_name ||
      author?.campusName ||
      author?.campus_name ||
      author?.campus ||
      author?.university ||
      author?.universitas ||
      author?.institution ||
      "",
  ).trim();

  /* =======================================================
     STRUCTURED DATA
     ======================================================= */

  const structuredData = useMemo(() => {
    if (loading || error || !author) {
      return null;
    }

    const person = {
      "@type": "Person",
      "@id": `${canonicalUrl}#person`,
      name: authorName,
      url: canonicalUrl,
      worksFor: {
        "@id": ORGANIZATION_ID,
      },
    };

    if (profession) {
      person.jobTitle = profession;
    }

    if (institution) {
      person.affiliation = {
        "@type": "EducationalOrganization",
        name: institution,
      };
    }

    if (author?.bio) {
      person.description = String(author.bio).trim();
    }

    if (authorAvatar) {
      person.image = authorAvatar;
    }

    return {
      "@context": "https://schema.org",

      "@graph": [
        {
          "@type": "ProfilePage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: `Profil ${authorName} - SukaMuda`,
          description: pageDescription,

          isPartOf: {
            "@id": WEBSITE_ID,
          },

          about: {
            "@id": `${canonicalUrl}#person`,
          },

          mainEntity: {
            "@id": `${canonicalUrl}#person`,
          },

          publisher: {
            "@id": ORGANIZATION_ID,
          },

          primaryImageOfPage: authorAvatar
            ? {
                "@type": "ImageObject",
                url: authorAvatar,
              }
            : {
                "@id": LOGO_ID,
              },

          inLanguage: "id-ID",
        },

        person,

        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
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
              name: authorName,
              item: canonicalUrl,
            },
          ],
        },
      ],
    };
  }, [
    author,
    authorName,
    authorAvatar,
    canonicalUrl,
    error,
    institution,
    loading,
    pageDescription,
    profession,
  ]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="pub-page" aria-busy={loading ? "true" : undefined}>
      {/* =====================================================
          SEO
          ===================================================== */}

      <Helmet>
        <html lang="id-ID" />

        <title>{pageTitle}</title>

        <meta name="description" content={pageDescription} />

        <meta
          name="robots"
          content={
            loading || error
              ? "noindex,follow"
              : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
          }
        />

        <meta
          name="googlebot"
          content={
            loading || error
              ? "noindex,follow"
              : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
          }
        />

        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}

        <meta property="og:site_name" content={SITE_NAME} />

        <meta property="og:type" content="profile" />

        <meta property="og:locale" content="id_ID" />

        <meta property="og:title" content={pageTitle} />

        <meta property="og:description" content={pageDescription} />

        <meta property="og:url" content={canonicalUrl} />

        <meta property="og:image" content={authorAvatar || SHARE_IMAGE} />

        <meta
          property="og:image:secure_url"
          content={authorAvatar || SHARE_IMAGE}
        />

        <meta property="og:image:alt" content={`Profil ${authorName}`} />

        {/* Twitter / X */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={pageTitle} />

        <meta name="twitter:description" content={pageDescription} />

        <meta name="twitter:image" content={authorAvatar || SHARE_IMAGE} />

        <meta name="twitter:image:alt" content={`Profil ${authorName}`} />

        {/* Hreflang */}

        <link rel="alternate" href={canonicalUrl} hrefLang="id-ID" />

        <link rel="alternate" href={canonicalUrl} hrefLang="x-default" />

        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>

      {/* =====================================================
          TOPBAR
          ===================================================== */}

      <div className="pub-topbar">
        <div className="pub-topbar-inner">
          <Link
            to="/"
            className="pub-back"
            aria-label="Kembali ke beranda SukaMuda"
          >
            <IoArrowBack size={15} aria-hidden="true" />

            <span>Beranda</span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error ? (
        <main className="pub-error-wrap" id="main-content">
          <div className="pub-error">
            <div className="pub-error-ring" aria-hidden="true">
              <span>!</span>
            </div>

            <h1>Profil Tidak Ditemukan</h1>

            <p role="alert">{error}</p>

            <Link to="/" className="pub-error-btn">
              <IoArrowBack size={13} aria-hidden="true" />
              Kembali ke Beranda
            </Link>
          </div>
        </main>
      ) : loading ? (
        /* ===================================================
           LOADING
           =================================================== */

        <>
          <header className="pub-hero" aria-hidden="true">
            <div className="pub-cover-wrap">
              <div className="pub-cover pub-skel-bg">
                <div className="pub-cover-grad" />
                <div className="pub-cover-noise" />
              </div>
            </div>
          </header>

          <section className="pub-info" aria-hidden="true">
            <div className="pub-info-inner">
              <div className="pub-avatar-area">
                <div className="pub-skel-circle-wrap">
                  <div className="pub-avatar pub-skel-circle" />
                </div>
              </div>

              <div className="pub-text-area">
                <div className="pub-skel w45 h9 mb10" />
                <div className="pub-skel w30 h6 mb10" />
                <div className="pub-skel w65 h5 mb6" />
                <div className="pub-skel w55 h5" />
              </div>
            </div>
          </section>

          <main className="pub-main" id="main-content" aria-hidden="true">
            <div className="pub-skel w25 h6 mb16" />

            <div className="pub-grid">
              {[1, 2].map((item) => (
                <div key={item} className="pub-card pub-skel-card">
                  <div className="pub-skel-img" />

                  <div
                    style={{
                      padding: "16px 18px 18px",
                    }}
                  >
                    <div className="pub-skel w30 h5 mb8" />
                    <div className="pub-skel w90 h7 mb8" />
                    <div className="pub-skel w70 h5 mb10" />
                    <div className="pub-skel w40 h5" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      ) : (
        /* ===================================================
           REAL PROFILE
           =================================================== */

        <>
          <header className="pub-hero">
            <div className="pub-cover-wrap">
              <div
                className="pub-cover"
                style={
                  authorCover
                    ? {
                        backgroundImage: `url("${authorCover.replace(
                          /"/g,
                          '\\"',
                        )}")`,
                      }
                    : undefined
                }
                role={authorCover ? "img" : undefined}
                aria-label={authorCover ? "Foto sampul profil" : undefined}
              >
                <div className="pub-cover-grad" aria-hidden="true" />

                <div className="pub-cover-noise" aria-hidden="true" />
              </div>
            </div>
          </header>

          <section className="pub-info" aria-labelledby="profile-name">
            <div className="pub-info-inner">
              <div className="pub-avatar-area">
                <div className="pub-avatar-ring">
                  <div
                    className="pub-avatar"
                    style={
                      authorAvatar
                        ? {
                            backgroundImage: `url("${authorAvatar.replace(
                              /"/g,
                              '\\"',
                            )}")`,
                          }
                        : undefined
                    }
                    role={authorAvatar ? "img" : undefined}
                    aria-label={
                      authorAvatar ? `Foto profil ${authorName}` : undefined
                    }
                  >
                    {!authorAvatar && (
                      <span className="pub-avatar-letter" aria-hidden="true">
                        {getInitials(authorName)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pub-text-area">
                <h1 id="profile-name" className="pub-name">
                  {authorName}
                </h1>

                <div className="pub-meta-line">
                  {profession && (
                    <span className="pub-role-chip">
                      <IoSparkles size={11} aria-hidden="true" />

                      {profession}
                    </span>
                  )}

                  {institution && (
                    <span className="pub-school-chip">{institution}</span>
                  )}
                </div>

                {author?.bio && (
                  <p className="pub-bio">{String(author.bio).trim()}</p>
                )}

                <div className="pub-bottom-row">
                  {Array.isArray(author?.interests) &&
                    author.interests.filter(Boolean).length > 0 && (
                      <div className="pub-pills">
                        {author.interests.filter(Boolean).map((interest) => (
                          <span key={String(interest)} className="pub-pill">
                            {String(interest)}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="pub-count-badge">
                    <IoNewspaperOutline size={14} aria-hidden="true" />

                    <strong>{articleCount}</strong>

                    <span>Artikel</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main className="pub-main" id="main-content">
            <div className="pub-section-head">
              <div className="pub-section-title">
                <IoGridOutline size={16} aria-hidden="true" />

                <h2>Semua Artikel</h2>
              </div>

              <span className="pub-section-count">
                {articleCount} dipublikasikan
              </span>
            </div>

            {articleCount > 0 ? (
              <div className="pub-grid">
                {authorArticles.map((article, index) => {
                  const articleSlug = getSafeSlug(article?.slug);

                  const articleUrl = articleSlug
                    ? `/article/${encodeURIComponent(articleSlug)}`
                    : "#";

                  const articleImage = resolveAssetUrl(article?.image);

                  const articleDate = formatDate(
                    article?.createdAt ||
                      article?.created_at ||
                      article?.published_at,
                  );

                  const title = String(article?.title || "Tanpa Judul").trim();

                  const cardContent = (
                    <>
                      <div className="pub-card-visual">
                        {articleImage ? (
                          <img
                            src={articleImage}
                            alt={title}
                            loading="lazy"
                            decoding="async"
                            width="400"
                            height="225"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        ) : (
                          <div
                            className="pub-card-visual-ph"
                            aria-hidden="true"
                          >
                            <IoDocumentTextOutline size={24} />
                          </div>
                        )}

                        {article?.category && (
                          <span className="pub-card-tag">
                            {article.category}
                          </span>
                        )}

                        <div
                          className="pub-card-visual-shade"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="pub-card-body">
                        {articleDate && (
                          <p className="pub-card-date">{articleDate}</p>
                        )}

                        <h3 className="pub-card-title">{title}</h3>

                        {article?.summary && (
                          <p className="pub-card-excerpt">
                            {String(article.summary).trim()}
                          </p>
                        )}

                        <div className="pub-card-read">
                          Baca Selengkapnya
                          <IoArrowForward size={12} aria-hidden="true" />
                        </div>
                      </div>
                    </>
                  );

                  return articleSlug ? (
                    <Link
                      key={article?.id || articleSlug || index}
                      to={articleUrl}
                      className="pub-card"
                      style={{
                        animationDelay: `${Math.min(index * 0.05, 0.6)}s`,
                      }}
                      aria-label={`Baca artikel: ${title}`}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <article
                      key={article?.id || `article-${index}`}
                      className="pub-card"
                      style={{
                        animationDelay: `${Math.min(index * 0.05, 0.6)}s`,
                      }}
                    >
                      {cardContent}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="pub-empty">
                <div className="pub-empty-visual" aria-hidden="true">
                  <IoDocumentTextOutline size={28} />
                </div>

                <p className="pub-empty-title">Belum Ada Artikel</p>

                <p className="pub-empty-desc">
                  Penulis ini belum mempublikasikan artikel apa pun. Cek kembali
                  nanti.
                </p>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default PublicProfile;
