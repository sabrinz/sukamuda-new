import React, { useMemo } from "react";

import { Link, useLocation, useParams } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import { useInfiniteQuery } from "@tanstack/react-query";

import axios, { baseURL } from "../utils/axiosConfig";

import "./Category.css";

/* =========================================================
   SITE CONFIG
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";

const SITE_NAME = "SukaMuda";

const SHARE_IMAGE = `${SITE_URL}/sukamuda-share.jpg`;

const ARTICLES_PER_PAGE = 12;

const ROBOTS_INDEX =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

const ROBOTS_NOINDEX = "noindex,follow";

/* =========================================================
   CATEGORY CONFIG
   =========================================================
   Struktur:
   - root category
   - subcategory
   ========================================================= */

const CATEGORY_CONFIG = {
  news: {
    label: "News",
    aliases: ["news", "school", "college", "general"],
  },

  school: {
    label: "School",
    aliases: ["school"],
  },

  college: {
    label: "College",
    aliases: ["college"],
  },

  general: {
    label: "General",
    aliases: ["general"],
  },

  lifestyle: {
    label: "Lifestyle",
    aliases: ["lifestyle", "style", "culinary", "traveling", "food", "travel"],
  },

  style: {
    label: "Style",
    aliases: ["style"],
  },

  culinary: {
    label: "Culinary",
    aliases: ["culinary", "food"],
  },

  traveling: {
    label: "Traveling",
    aliases: ["traveling", "travel"],
  },

  sport: {
    label: "Sport & E-Sport",
    aliases: ["sport", "sport-e-sport", "sport-esport", "sport e-sport"],
  },

  music: {
    label: "Music & Film",
    aliases: [
      "music",
      "music-film",
      "musicfilm",
      "music & film",
      "music and film",
    ],
  },

  otomotif: {
    label: "Otomotif",
    aliases: ["otomotif"],
  },

  science: {
    label: "Science",
    aliases: ["science"],
  },

  health: {
    label: "Health",
    aliases: ["health"],
  },

  tech: {
    label: "Tech",
    aliases: ["tech", "technology"],
  },

  podcast: {
    label: "Podcast",
    aliases: ["podcast"],
  },
};

/* =========================================================
   CATEGORY GROUPS
   =========================================================
   Dipakai untuk menentukan kategori utama.
   ========================================================= */

const CATEGORY_ROOTS = {
  news: ["news", "school", "college", "general"],

  lifestyle: ["lifestyle", "style", "culinary", "traveling", "food", "travel"],

  sport: ["sport", "sport-e-sport", "sport-esport", "sport e-sport"],

  music: ["music", "music-film", "musicfilm", "music & film", "music and film"],

  otomotif: ["otomotif"],

  science: ["science"],

  health: ["health"],

  tech: ["tech", "technology"],

  podcast: ["podcast"],
};

/* =========================================================
   HELPERS
   ========================================================= */

const normalizeCategory = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
};

const normalizeCategorySlug = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getCategoryDefinition = (slug) => {
  const normalized = normalizeCategorySlug(slug);

  if (CATEGORY_CONFIG[normalized]) {
    return {
      slug: normalized,
      ...CATEGORY_CONFIG[normalized],
    };
  }

  const normalizedNoSymbols = normalizeCategory(normalized);

  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    const found = config.aliases.some(
      (alias) => normalizeCategory(alias) === normalizedNoSymbols,
    );

    if (found) {
      return {
        slug: key,
        ...config,
      };
    }
  }

  return {
    slug: normalized,
    label:
      normalized
        .split("-")
        .filter(Boolean)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ") || "Kategori",
    aliases: [normalized],
  };
};

const getRootCategory = (slug) => {
  const normalized = normalizeCategorySlug(slug);

  if (CATEGORY_ROOTS[normalized]) {
    return normalized;
  }

  const normalizedNoSymbols = normalizeCategory(normalized);

  for (const [root, aliases] of Object.entries(CATEGORY_ROOTS)) {
    if (
      aliases.some((alias) => normalizeCategory(alias) === normalizedNoSymbols)
    ) {
      return root;
    }
  }

  return normalized;
};

const getCategoryAliases = (slug) => {
  const normalized = normalizeCategorySlug(slug);

  /*
   * Prioritaskan definisi spesifik.
   *
   * /category/school
   * hanya mencari school.
   *
   * /category/news
   * mencari news + school + college + general.
   */

  if (CATEGORY_CONFIG[normalized]) {
    return CATEGORY_CONFIG[normalized].aliases;
  }

  return [normalized];
};

const formatCategoryLabel = (slug) => {
  return getCategoryDefinition(slug).label;
};

/* =========================================================
   TEXT HELPERS
   ========================================================= */

const stripHtml = (value) => {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getExcerpt = (article) => {
  const source = article?.summary || article?.excerpt || article?.content || "";

  const text = stripHtml(source);

  if (text.length <= 150) {
    return text;
  }

  return text.slice(0, 150).trimEnd() + "...";
};

const getInitials = (name) => {
  const normalized = String(name || "").trim();

  if (!normalized) {
    return "?";
  }

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/* =========================================================
   URL HELPERS
   ========================================================= */

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

const resolveAssetUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const normalized = value.trim();

  if (isAbsoluteHttpUrl(normalized)) {
    return normalized
      .replace("http://127.0.0.1:8000", SITE_URL)
      .replace("http://localhost:8000", SITE_URL)
      .replace("https://api.sukamuda.co.id", SITE_URL);
  }

  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return normalized;
  }

  if (normalized.startsWith("/storage/")) {
    return `${baseURL}${normalized}`;
  }

  if (normalized.startsWith("/")) {
    return `${baseURL}${normalized}`;
  }

  return `${baseURL}/storage/${normalized.replace(/^\/+/, "")}`;
};

/* =========================================================
   YOUTUBE
   ========================================================= */

const getYoutubeVideoId = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  try {
    const parsed = new URL(value.trim());

    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      return parsed.pathname.replace(/^\/+/, "").split("/")[0].trim();
    }

    const youtubeHost =
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com" ||
      host === "www.youtube-nocookie.com";

    if (!youtubeHost) {
      return "";
    }

    if (parsed.pathname === "/watch") {
      return (parsed.searchParams.get("v") || "").split("&")[0].trim();
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (["embed", "shorts", "live"].includes(parts[0])) {
      return (parts[1] || "").split("?")[0].split("&")[0].split("#")[0].trim();
    }

    return "";
  } catch {
    return "";
  }
};

const getYoutubeThumbnailUrl = (value) => {
  const videoId = getYoutubeVideoId(value);

  if (!videoId) {
    return "";
  }

  return (
    "https://img.youtube.com/vi/" +
    encodeURIComponent(videoId) +
    "/hqdefault.jpg"
  );
};

/* =========================================================
   ARTICLE IMAGE
   ========================================================= */

const getArticleImage = (article) => {
  const rawImage =
    article?.image || article?.featured_image || article?.thumbnail || "";

  return (
    resolveAssetUrl(rawImage) ||
    getYoutubeThumbnailUrl(article?.video_link) ||
    PLACEHOLDER_IMAGE
  );
};

const PLACEHOLDER_IMAGE = "/placeholder.svg";

/* =========================================================
   API
   ========================================================= */

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.articles)) {
      return payload.articles;
    }

    if (Array.isArray(payload.results)) {
      return payload.results;
    }
  }

  return [];
};

const normalizeArticleList = (articles) => {
  if (!Array.isArray(articles)) {
    return [];
  }

  const seen = new Set();

  return articles.filter((article) => {
    if (!article || typeof article !== "object") {
      return false;
    }

    const identity = article.id ?? article.slug ?? article.title;

    if (
      identity === undefined ||
      identity === null ||
      String(identity).trim() === ""
    ) {
      return false;
    }

    const key = String(identity).trim();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

const fetchPublicArticles = async ({
  signal,
  page = 1,
  categories = [],
} = {}) => {
  const normalizedCategories = Array.from(
    new Set(
      (Array.isArray(categories) ? categories : [categories])
        .map(normalizeCategorySlug)
        .filter(Boolean),
    ),
  );

  const response = await axios.get("/api/public-articles", {
    signal,
    params: {
      page,
      per_page: ARTICLES_PER_PAGE,
      categories: normalizedCategories.join(","),
    },
  });

  const articles = normalizeArticleList(extractArrayPayload(response?.data));

  const hasMoreHeader = String(
    response?.headers?.["x-has-more-pages"] ?? "",
  ).trim();

  const hasMore =
    hasMoreHeader === "1" ||
    (hasMoreHeader === "" && articles.length === ARTICLES_PER_PAGE);

  return {
    articles,
    nextPage: hasMore ? page + 1 : undefined,
  };
};

/* =========================================================
   CATEGORY
   ========================================================= */

const Category = () => {
  const { slug: rawSlug } = useParams();

  const location = useLocation();

  const normalizedSlug = normalizeCategorySlug(rawSlug);

  const categoryDefinition = useMemo(
    () => getCategoryDefinition(normalizedSlug),
    [normalizedSlug],
  );

  const categoryRoot = useMemo(
    () => getRootCategory(normalizedSlug),
    [normalizedSlug],
  );

  const categoryLabel = categoryDefinition.label;

  const isKnownCategory =
    Boolean(CATEGORY_CONFIG[normalizedSlug]) ||
    Object.values(CATEGORY_CONFIG).some((config) =>
      config.aliases.some(
        (alias) =>
          normalizeCategory(alias) === normalizeCategory(normalizedSlug),
      ),
    );

  /* =======================================================
     PAGE
     ======================================================= */

  const requestedPage = useMemo(() => {
    const params = new URLSearchParams(location.search);

    const rawPage = params.get("page");

    const parsed = Number(rawPage);

    if (Number.isInteger(parsed) && parsed >= 1) {
      return parsed;
    }

    return 1;
  }, [location.search]);

  /* =======================================================
     CANONICAL
     ======================================================= */

  const canonicalUrl = useMemo(() => {
    const safeSlug = categoryDefinition.slug || normalizedSlug || "general";

    const path = `/category/${encodeURIComponent(safeSlug)}`;

    return `${SITE_URL}${path}`;
  }, [categoryDefinition.slug, normalizedSlug]);

  /* =======================================================
     QUERY
     ======================================================= */

  const {
    data: articlePages,
    isLoading: loading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["publicArticles", "category", normalizedSlug, requestedPage],

    queryFn: ({ signal, pageParam }) =>
      fetchPublicArticles({
        signal,
        page: pageParam,
        categories: getCategoryAliases(normalizedSlug),
      }),

    initialPageParam: requestedPage,

    getNextPageParam: (lastPage) => lastPage?.nextPage,

    enabled: Boolean(normalizedSlug),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 1,

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,
  });

  const allArticles = useMemo(
    () =>
      normalizeArticleList(
        articlePages?.pages.flatMap((page) => page?.articles || []) || [],
      ),
    [articlePages],
  );

  /* =======================================================
     ACCEPTED CATEGORIES
     ======================================================= */

  const acceptedCategories = useMemo(() => {
    const aliases = getCategoryAliases(normalizedSlug);

    return new Set(aliases.map(normalizeCategory));
  }, [normalizedSlug]);

  /* =======================================================
     FILTER
     ======================================================= */

  const categoryArticles = useMemo(() => {
    if (!Array.isArray(allArticles)) {
      return [];
    }

    return allArticles.filter((article) => {
      if (!article?.category) {
        return false;
      }

      const normalizedArticleCategory = normalizeCategory(article.category);

      return acceptedCategories.has(normalizedArticleCategory);
    });
  }, [allArticles, acceptedCategories]);

  /* =======================================================
     VISIBLE ARTICLES
     ======================================================= */

  const visibleArticles = categoryArticles;

  const hasMore = Boolean(hasNextPage);

  /* =======================================================
     LOAD MORE
     ======================================================= */

  const handleLoadMore = () => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  };

  /* =======================================================
     SCHEMA ITEMS
     ======================================================= */

  const schemaItemList = useMemo(() => {
    return categoryArticles
      .slice(0, 20)
      .map((article, index) => {
        const articleSlug = String(article?.slug || "").trim();

        if (!articleSlug) {
          return null;
        }

        return {
          "@type": "ListItem",

          position: index + 1,

          name: String(article?.title || "Artikel").trim(),

          url: `${SITE_URL}/article/${encodeURIComponent(articleSlug)}`,
        };
      })
      .filter(Boolean);
  }, [categoryArticles]);

  /* =======================================================
     BREADCRUMB
     ======================================================= */

  const schemaBreadcrumb = useMemo(
    () => ({
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

          name: categoryLabel,

          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl, categoryLabel],
  );

  /* =======================================================
     COLLECTION PAGE
     ======================================================= */

  const schemaCollectionPage = useMemo(
    () => ({
      "@type": "CollectionPage",

      "@id": `${canonicalUrl}#collection`,

      url: canonicalUrl,

      name: `Kategori ${categoryLabel} - ${SITE_NAME}`,

      headline: `Berita ${categoryLabel} Terbaru`,

      description: `Kumpulan berita dan artikel terbaru seputar ${categoryLabel} di ${SITE_NAME}.`,

      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },

      about: {
        "@id": `${SITE_URL}/#organization`,
      },

      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },

      inLanguage: "id-ID",

      mainEntity: {
        "@type": "ItemList",

        name: `Artikel ${categoryLabel}`,

        numberOfItems: categoryArticles.length,

        itemListElement: schemaItemList,
      },
    }),
    [canonicalUrl, categoryLabel, categoryArticles.length, schemaItemList],
  );

  /* =======================================================
     STRUCTURED DATA
     ======================================================= */

  const structuredData = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",

        "@graph": [
          {
            "@type": "Organization",

            "@id": `${SITE_URL}/#organization`,

            name: SITE_NAME,

            url: `${SITE_URL}/`,
          },

          {
            "@type": "WebSite",

            "@id": `${SITE_URL}/#website`,

            name: SITE_NAME,

            url: `${SITE_URL}/`,

            inLanguage: "id-ID",

            publisher: {
              "@id": `${SITE_URL}/#organization`,
            },
          },

          schemaBreadcrumb,
          schemaCollectionPage,
        ],
      }),
    [schemaBreadcrumb, schemaCollectionPage],
  );

  /* =======================================================
     META DESCRIPTION
     ======================================================= */

  const metaDescription = `Baca artikel terbaru dan terpopuler di kategori ${categoryLabel} hanya di ${SITE_NAME}.`;

  /* =======================================================
     INVALID CATEGORY
     ======================================================= */

  /*
   * Tidak perlu membuat page SEO index
   * untuk kategori yang tidak dikenal.
   */

  const robots =
    normalizedSlug && isKnownCategory ? ROBOTS_INDEX : ROBOTS_NOINDEX;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section
      className="category-container"
      aria-labelledby="category-page-title"
    >
      {/* ===================================================
          SEO
          =================================================== */}

      <Helmet>
        <html lang="id-ID" />

        <title>{`Kategori ${categoryLabel} | ${SITE_NAME}`}</title>

        <meta name="description" content={metaDescription} />

        <meta name="robots" content={robots} />

        <meta name="googlebot" content={robots} />

        <link rel="canonical" href={canonicalUrl} />

        <link rel="alternate" hrefLang="id-ID" href={canonicalUrl} />

        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

        <meta property="og:site_name" content={SITE_NAME} />

        <meta property="og:type" content="website" />

        <meta property="og:locale" content="id_ID" />

        <meta
          property="og:title"
          content={`Kategori ${categoryLabel} | ${SITE_NAME}`}
        />

        <meta property="og:description" content={metaDescription} />

        <meta property="og:url" content={canonicalUrl} />

        <meta property="og:image" content={SHARE_IMAGE} />

        <meta property="og:image:secure_url" content={SHARE_IMAGE} />

        <meta property="og:image:type" content="image/jpeg" />

        <meta property="og:image:width" content="1200" />

        <meta property="og:image:height" content="630" />

        <meta
          property="og:image:alt"
          content={`Kategori ${categoryLabel} - ${SITE_NAME}`}
        />

        <meta name="twitter:card" content="summary_large_image" />

        <meta
          name="twitter:title"
          content={`Kategori ${categoryLabel} | ${SITE_NAME}`}
        />

        <meta name="twitter:description" content={metaDescription} />

        <meta name="twitter:image" content={SHARE_IMAGE} />

        <meta
          name="twitter:image:alt"
          content={`Kategori ${categoryLabel} - ${SITE_NAME}`}
        />

        <script type="application/ld+json">{structuredData}</script>
      </Helmet>

      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="category-header">
        <h1
          id="category-page-title"
          style={{
            textTransform: "capitalize",
            color: "#000",
            marginBottom: "30px",
            fontSize: "1.5em",
          }}
        >
          Kategori: {categoryLabel}
        </h1>
      </header>

      <h2 id="category-articles-heading" className="category-sr-only">
        Daftar artikel kategori {categoryLabel}
      </h2>

      {/* ===================================================
          LOADING
          =================================================== */}

      {loading && (
        <div
          className="category-empty"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          Memuat berita {categoryLabel}
          ...
        </div>
      )}

      {/* ===================================================
          ERROR
          =================================================== */}

      {!loading && isError && (
        <div className="category-empty" role="alert">
          <p>Gagal memuat artikel kategori {categoryLabel}.</p>

          <button type="button" onClick={() => refetch()}>
            Coba lagi
          </button>
        </div>
      )}

      {/* ===================================================
          CONTENT
          =================================================== */}

      {!loading && !isError && (
        <>
          <section
            className="article-grid"
            aria-labelledby="category-articles-heading"
          >
            {visibleArticles.length > 0 ? (
              visibleArticles.map((article, index) => {
                const articleSlug = String(article?.slug || "").trim();

                const title = String(
                  article?.title || "Artikel SukaMuda",
                ).trim();

                const authorName = String(
                  article?.user?.name || article?.author_name || "Anonim",
                ).trim();

                const rawAuthorImage =
                  article?.user?.avatar ||
                  article?.user?.profile_photo_url ||
                  article?.user?.photo ||
                  article?.user?.image ||
                  article?.user?.picture ||
                  article?.author_avatar ||
                  "";

                const authorPhotoUrl = resolveAssetUrl(rawAuthorImage);

                const imageUrl = getArticleImage(article);

                const categoryItemLabel = formatCategoryLabel(
                  article?.category || categoryLabel,
                );

                const excerpt = getExcerpt(article);

                const cardContent = (
                  <>
                    <div className="article-image-wrapper">
                      <img
                        src={imageUrl}
                        alt={title}
                        width="400"
                        height="225"
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 400px"
                        onError={(event) => {
                          const image = event.currentTarget;

                          image.onerror = null;

                          const currentSrc = String(image.src || "");

                          if (!currentSrc.endsWith(PLACEHOLDER_IMAGE)) {
                            image.src = PLACEHOLDER_IMAGE;
                          }
                        }}
                      />
                    </div>

                    <div className="article-content-preview">
                      <span className="badge-category">
                        {categoryItemLabel}
                      </span>

                      <h3>{title}</h3>

                      {excerpt && <p className="article-excerpt">{excerpt}</p>}

                      <div className="article-author">
                        <div className="author-avatar-wrap">
                          {authorPhotoUrl ? (
                            <>
                              <img
                                src={authorPhotoUrl}
                                alt=""
                                className="author-avatar-img"
                                width="24"
                                height="24"
                                loading="lazy"
                                decoding="async"
                                onError={(event) => {
                                  const image = event.currentTarget;

                                  image.onerror = null;

                                  image.style.display = "none";

                                  const fallback =
                                    image.parentElement?.querySelector(
                                      ".author-avatar-initials",
                                    );

                                  if (fallback) {
                                    fallback.style.display = "flex";
                                  }
                                }}
                              />

                              <span
                                className="author-avatar-initials"
                                style={{
                                  display: "none",
                                }}
                                aria-hidden="true"
                              >
                                {getInitials(authorName)}
                              </span>
                            </>
                          ) : (
                            <span
                              className="author-avatar-initials"
                              aria-hidden="true"
                            >
                              {getInitials(authorName)}
                            </span>
                          )}
                        </div>

                        <span className="author-name">{authorName}</span>
                      </div>
                    </div>
                  </>
                );

                if (!articleSlug) {
                  return (
                    <article
                      className="article-card"
                      key={article.id ?? `article-${index}`}
                    >
                      {cardContent}
                    </article>
                  );
                }

                return (
                  <Link
                    className="article-card"
                    key={article.id ?? articleSlug}
                    to={`/article/${encodeURIComponent(articleSlug)}`}
                    aria-label={`Baca artikel: ${title}`}
                  >
                    {cardContent}
                  </Link>
                );
              })
            ) : (
              <div className="category-empty" role="status">
                <p>
                  Belum ada artikel di kategori <strong>{categoryLabel}</strong>
                  .
                </p>
              </div>
            )}
          </section>

          {/* =============================================
                LOAD MORE
                ============================================= */}

          {hasMore && (
            <div
              className="category-load-more"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "40px",
              }}
            >
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                aria-busy={isFetchingNextPage}
                aria-label={`Muat lebih banyak artikel kategori ${categoryLabel}`}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              >
                {isFetchingNextPage ? "Memuat..." : "Muat Lebih Banyak"}
              </button>
            </div>
          )}
        </>
      )}

      {/* ===================================================
          DEBUG-SAFE ROOT
          =================================================== */}

      {categoryRoot && false && <span aria-hidden="true">{categoryRoot}</span>}
    </section>
  );
};

export default Category;
