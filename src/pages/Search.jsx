import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "../utils/axiosConfig";
import "./Category.css"; // Kita pakai CSS category biar tampilannya konsisten

const baseUrl = import.meta.env.VITE_API_URL || 'https://sukamuda.co.id';

const Search = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ambil kata kunci dari URL (misal: ?q=bensin)
  const query = new URLSearchParams(useLocation().search).get("q") || "";

  useEffect(() => {
    // Guard anti race-condition: abaikan respons lama kalau query sudah berganti
    let active = true;

    const fetchSearch = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/public-articles');
        if (!active) return;

        // Filter berita yang judul atau isinya mengandung kata kunci
        const filtered = response.data.filter((item) => {
          const searchContent = ((item.title || '') + (item.content || '')).toLowerCase();
          return searchContent.includes(query.toLowerCase());
        });

        setArticles(filtered);
      } catch (error) {
        console.error("Gagal mencari berita:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (query) {
      fetchSearch();
    } else {
      setArticles([]);
      setLoading(false);
    }

    return () => { active = false; };
  }, [query]);

  // Membuat URL Canonical Dinamis untuk Halaman Pencarian
  const canonicalUrl = `${baseUrl}/search?q=${encodeURIComponent(query)}`;

  const pageTitle = query ? `Hasil Pencarian: "${query}" - SukaMuda` : "Pencarian - SukaMuda";

  // Struktur Data JSON-LD untuk Search Results
  const schemaSearchResults = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": query ? `Hasil Pencarian untuk "${query}" - SukaMuda` : "Pencarian Artikel - SukaMuda",
    "url": canonicalUrl,
    "description": query 
      ? `Menampilkan hasil pencarian artikel terpercaya untuk kata kunci "${query}" di SukaMuda.`
      : "Halaman pencarian berita dan artikel literasi anak muda di SukaMuda."
  };

  return (
    <div className="category-container" style={{ marginTop: "40px" }}>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        
        {/* STANDAR PORTAL BERITA: Hasil internal search sebaiknya noindex agar tidak dianggap spam duplikasi konten oleh Google */}
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Suntikan JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemaSearchResults)}
        </script>
      </Helmet>

      <header className="category-header">
        <h1 style={{ textTransform: 'none', color: '#000', marginBottom: '30px', fontSize: '1.5em' }}>
          {query ? `Hasil Pencarian untuk: "${query}"` : "Pencarian Artikel"}
        </h1>
      </header>

      {loading ? (
        <div className="category-empty" role="status">Mencari berita SukaMuda...</div>
      ) : (
        <div className="article-grid">
          {articles.length > 0 ? (
            articles.map((article) => (
              <Link className="article-card" key={article.id} to={`/article/${article.slug}`}>
                <div className="article-image-wrapper">
                  <img
                    src={article.image
                      ? (article.image.startsWith('http') ? article.image : `${baseUrl}/storage/${article.image}`)
                      : "https://via.placeholder.com/400x250"}
                    alt={article.title}
                    width="400"
                    height="225"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x250"; }}
                  />
                </div>
                <div className="article-content-preview">
                   <span className="badge-category">{article.category}</span>
                   <h3>{article.title}</h3>
                   <p className="article-author">Oleh: {article.user?.name || 'Anonim'}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="category-empty">
                <p>Waduh, berita <strong>"{query}"</strong> nggak ketemu, Bi.</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>Coba cari pake kata kunci lain!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;