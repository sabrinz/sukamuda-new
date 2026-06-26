import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "../utils/axiosConfig";
import "./Category.css"; // Kita pakai CSS category biar tampilannya konsisten

const baseUrl = import.meta.env.VITE_API_URL || 'https://sukamuda.co.id';

const Search = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ambil kata kunci dari URL (misal: ?q=bensin)
  const query = new URLSearchParams(useLocation().search).get("q");

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/public-articles');
        
        // Filter berita yang judul atau isinya mengandung kata kunci
        const filtered = response.data.filter((item) => {
          const searchContent = (item.title + item.content).toLowerCase();
          return searchContent.includes(query.toLowerCase());
        });

        setArticles(filtered);
      } catch (error) {
        console.error("Gagal mencari berita:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchSearch();
  }, [query]);

  return (
    <div className="category-container" style={{ marginTop: '120px' }}>
      <header className="category-header">
        <h2>Hasil Pencarian untuk: <span style={{ color: '#f97316' }}>"{query}"</span></h2>
      </header>

      {loading ? (
        <div className="category-empty">Mencari berita SukaMuda...</div>
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
                <p style={{ fontSize: '14px', color: '#666' }}>Coba cari pake kata kunci lain!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;