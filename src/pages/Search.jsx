import React, { useEffect, useMemo, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import axios from "../utils/axiosConfig";

import "./Category.css";

/* =========================================================
   SITE
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";

const PLACEHOLDER_IMAGE = "/placeholder.svg";

const MAX_RESULTS = 50;

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

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return PLACEHOLDER_IMAGE;
  }

  const image = value.trim();

  if (!image) {
    return PLACEHOLDER_IMAGE;
  }

  if (isAbsoluteHttpUrl(image)) {
    return image;
  }

  const apiBaseUrl = (import.meta.env.VITE_API_URL || SITE_URL).replace(
    /\/+$/,
    "",
  );

  if (image.startsWith("/storage/")) {
    return `${apiBaseUrl}${image}`;
  }

  if (image.startsWith("/")) {
    return `${apiBaseUrl}${image}`;
  }

  return `${apiBaseUrl}/storage/${image.replace(/^\/+/, "")}`;
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getInitials = (name) => {
  const value = String(name || "").trim();

  if (!value) {
    return "?";
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getSafeSlug = (article) =>
  article?.slug ? String(article.slug).trim() : "";

const getExcerpt = (content, maxLength = 140) => {
  const text = stripHtml(content);

  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trimEnd() + "...";
};

/* =========================================================
   API
   ========================================================= */

const fetchPublicArticles = async (signal) => {
  const response = await axios.get("/api/public-articles", { signal });

  return Array.isArray(response?.data) ? response.data : [];
};

/* =========================================================
   SEARCH
   ========================================================= */

const Search = () => {
  const location = useLocation();

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return params.get("q")?.trim() || "";
  }, [location.search]);

  const normalizedQuery = useMemo(() => normalizeText(query), [query]);

  const [articles, setArticles] = useState([]);

  const [loading, setLoading] = useState(Boolean(query));

  const [error, setError] = useState(false);

  /* =======================================================
     FETCH
     ======================================================= */

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const searchArticles = async () => {
      if (!normalizedQuery) {
        if (active) {
          setArticles([]);
          setLoading(false);
          setError(false);
        }

        return;
      }

      try {
        if (active) {
          setLoading(true);
          setError(false);
        }

        const data = await fetchPublicArticles(controller.signal);

        if (!active) {
          return;
        }

        const filtered = data
          .filter((article) => article && getSafeSlug(article))
          .filter((article) => {
            const title = normalizeText(article.title);

            const content = normalizeText(stripHtml(article.content));

            const category = normalizeText(article.category);

            const author = normalizeText(article.user?.name);

            return (
              title.includes(normalizedQuery) ||
              content.includes(normalizedQuery) ||
              category.includes(normalizedQuery) ||
              author.includes(normalizedQuery)
            );
          })
          .slice(0, MAX_RESULTS);

        setArticles(filtered);
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

        setArticles([]);
        setError(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    searchArticles();

    return () => {
      active = false;
      controller.abort();
    };
  }, [normalizedQuery]);

  /* =======================================================
     SEO
     ======================================================= */

  const canonicalUrl = useMemo(() => {
    if (!query) {
      return `${SITE_URL}/search`;
    }

    return `${SITE_URL}/search?q=${encodeURIComponent(query)}`;
  }, [query]);

  const pageTitle = query
    ? `Hasil Pencarian: "${query}" | SukaMuda`
    : "Pencarian Artikel | SukaMuda";

  const pageDescription = query
    ? `Hasil pencarian artikel SukaMuda untuk kata kunci "${query}".`
    : "Cari berita dan artikel di SukaMuda.";

  const searchSchema = useMemo(
    () => ({
      "@context": "https://schema.org",

      "@type": "SearchResultsPage",

      "@id": `${canonicalUrl}#webpage`,

      url: canonicalUrl,

      name: pageTitle,

      description: pageDescription,

      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },

      about: {
        "@id": `${SITE_URL}/#organization`,
      },

      inLanguage: "id-ID",
    }),
    [canonicalUrl, pageTitle, pageDescription],
  );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="category-container"
      style={{
        marginTop: "40px",
      }}
    >
      <Helmet>
        {/* =================================================
            DOCUMENT
            ================================================= */}

        <html lang="id-ID" />

        <title>{pageTitle}</title>

        <meta name="description" content={pageDescription} />

        {/* Search result pages jangan diindeks */}
        <meta name="robots" content="noindex,follow" />

        <meta name="googlebot" content="noindex,follow" />

        <link rel="canonical" href={canonicalUrl} />

        {/* =================================================
            OPEN GRAPH
            ================================================= */}

        <meta property="og:site_name" content="SukaMuda" />

        <meta property="og:type" content="website" />

        <meta property="og:locale" content="id_ID" />

        <meta property="og:title" content={pageTitle} />

        <meta property="og:description" content={pageDescription} />

        <meta property="og:url" content={canonicalUrl} />

        <meta property="og:image" content={`${SITE_URL}/sukamuda-share.jpg`} />

        <meta property="og:image:width" content="1200" />

        <meta property="og:image:height" content="630" />

        <meta property="og:image:alt" content={pageTitle} />

        {/* =================================================
            TWITTER / X
            ================================================= */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={pageTitle} />

        <meta name="twitter:description" content={pageDescription} />

        <meta name="twitter:image" content={`${SITE_URL}/sukamuda-share.jpg`} />

        {/* =================================================
            STRUCTURED DATA
            ================================================= */}

        <script type="application/ld+json">
          {JSON.stringify(searchSchema)}
        </script>
      </Helmet>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="category-header">
        <h1
          style={{
            textTransform: "none",
            color: "#000",
            marginBottom: "10px",
            fontSize: "1.5em",
          }}
        >
          {query ? `Hasil Pencarian untuk: "${query}"` : "Pencarian Artikel"}
        </h1>

        {query && !loading && !error && (
          <p
            style={{
              marginBottom: "30px",
              color: "#666",
              fontSize: "14px",
            }}
          >
            {articles.length > 0
              ? `${articles.length} hasil ditemukan`
              : "Tidak ada hasil ditemukan"}
          </p>
        )}
      </header>

      {/* =====================================================
          EMPTY QUERY
          ===================================================== */}

      {!query ? (
        <div className="category-empty" role="status">
          <p>Masukkan kata kunci untuk mencari artikel SukaMuda.</p>
        </div>
      ) : loading ? (
        /* ===================================================
           LOADING
           =================================================== */

        <div className="category-empty" role="status" aria-live="polite">
          Mencari berita SukaMuda...
        </div>
      ) : error ? (
        /* ===================================================
           ERROR
           =================================================== */

        <div className="category-empty" role="alert">
          <p>Gagal memuat hasil pencarian.</p>

          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginTop: "8px",
            }}
          >
            Silakan coba lagi beberapa saat lagi.
          </p>
        </div>
      ) : (
        /* ===================================================
           RESULTS
           =================================================== */

        <section
          className="article-grid"
          aria-label={`Hasil pencarian ${query}`}
        >
          {articles.length > 0 ? (
            articles.map((article, index) => {
              const slug = getSafeSlug(article);

              const authorName = article.user?.name || "Anonim";

              const imageUrl = resolveImageUrl(article.image);

              return (
                <Link
                  className="article-card"
                  key={article.id || slug || `search-${index}`}
                  to={`/article/${encodeURIComponent(slug)}`}
                  aria-label={`Baca artikel: ${
                    article.title || "Artikel SukaMuda"
                  }`}
                >
                  <div className="article-image-wrapper">
                    <img
                      src={imageUrl}
                      alt={article.title || "Gambar artikel SukaMuda"}
                      width="400"
                      height="225"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.onerror = null;

                        event.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>

                  <div className="article-content-preview">
                    <span className="badge-category">
                      {article.category || "Umum"}
                    </span>

                    <h2
                      style={{
                        fontSize: "inherit",
                        margin: 0,
                      }}
                    >
                      {article.title || "Judul artikel tidak tersedia"}
                    </h2>

                    <p className="article-excerpt">
                      {getExcerpt(article.content)}
                    </p>

                    <div className="article-author">
                      <span className="author-avatar-wrap" aria-hidden="true">
                        {getInitials(authorName)}
                      </span>

                      <span className="author-name">{authorName}</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div
              className="category-empty"
              role="status"
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <p>
                Berita <strong>"{query}"</strong> tidak ditemukan.
              </p>

              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginTop: "8px",
                }}
              >
                Coba gunakan kata kunci yang berbeda.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Search;
