import React, { useMemo, useState } from "react";
import "./Interests.css";
import { useNavigate, useLocation } from "react-router-dom"; // <-- TAMBAH useLocation
import { Helmet } from "react-helmet-async";
import { categories } from "../data/articles";

const Interests = () => {
  const navigate = useNavigate();
  const location = useLocation();              // <-- TAMBAH INI
  const registerData = location.state || {};    // <-- TAMBAH INI
  const [selected, setSelected] = useState([]);

  const interestOptions = useMemo(
    () => categories.map((item) => ({ slug: item.slug, label: item.label })),
    []
  );

  const toggleInterest = (slug) => {
    if (selected.includes(slug)) {
      setSelected(selected.filter((item) => item !== slug));
    } else {
      setSelected([...selected, slug]);
    }
  };

  // Bawa pilihan minat ikut ke halaman berikutnya (dipakai nanti saat backend siap)
  const goNext = () => {
    navigate("/success", { state: { ...registerData, interests: selected } });
  };

  return (
    <div className="interests-page">

      <Helmet>
        <title>Pilih Minat Anda - Sukamuda</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Decorative */}
      <div className="deco-blob deco-blob-1" aria-hidden="true"></div>
      <div className="deco-blob deco-blob-2" aria-hidden="true"></div>

      <div className="interests-card">
        {/* Header */}
        <div className="card-header">
          <div className="card-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 className="card-title">Pilih Minat Anda</h1>
          <p className="card-subtitle">
            Pilih satu atau lebih kategori untuk menemukan artikel yang relevan dengan Anda.
          </p>
        </div>

        {/* Tags */}
        <div className="tags-grid" role="group" aria-label="Pilihan kategori minat">
          {interestOptions.map((item, index) => {
            const isActive = selected.includes(item.slug);
            return (
              <button
                key={item.slug}
                type="button"
                className={`tag-btn ${isActive ? "tag-active" : ""}`}
                onClick={() => toggleInterest(item.slug)}
                aria-pressed={isActive}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <span className="tag-text">{item.label}</span>
                <span className="tag-icon" aria-hidden="true">
                  {isActive ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Count */}
        {selected.length > 0 && (
          <div className="selected-count" role="status">
            <span className="count-dot" aria-hidden="true"></span>
            <span>{selected.length} kategori dipilih</span>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions">
          {/* ✅ BENERIN: lempar registerData ke Success */}
          <button type="button" className="btn-skip" onClick={goNext}>
            Lewati
          </button>
          <button
            type="button"
            className={`btn-next ${selected.length > 0 ? "btn-next-active" : ""}`}
            onClick={goNext}
            disabled={selected.length === 0}
          >
            <span>Selanjutnya</span>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interests;