import React, { useState } from 'react';
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube, FaLink, FaPlay } from 'react-icons/fa';
import './VideoReels.css';

const VideoReels = ({ reels = [] }) => {
  const [hoveredReel, setHoveredReel] = useState(null);

  const getPlatformIcon = (platform, size = 15) => {
    const p = (platform || '').toLowerCase();
    const style = { fontSize: `${size}px` };
    switch (p) {
      case 'instagram': return <FaInstagram aria-hidden="true" style={{ ...style, color: '#E4405F' }} />;
      case 'tiktok':    return <FaTiktok aria-hidden="true" style={{ ...style, color: '#000' }} />;
      case 'facebook':  return <FaFacebook aria-hidden="true" style={{ ...style, color: '#1877F2' }} />;
      case 'youtube':   return <FaYoutube aria-hidden="true" style={{ ...style, color: '#FF0000' }} />;
      default:          return <FaLink aria-hidden="true" style={{ ...style, color: '#999' }} />;
    }
  };

  if (!reels || reels.length === 0) {
    return (
      <div className="vr-empty" role="status">
        <FaPlay aria-hidden="true" style={{ fontSize: 24, opacity: 0.15 }} />
        <p>Belum ada video reels yang tersedia</p>
      </div>
    );
  }

  return (
    <div className="vr-container">
      <div className="vr-scroll">
        {reels.map((reel, idx) => (
          <a
            key={reel.id || idx}
            className="vr-card"
            href={reel.video_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              "Tonton di " +
              (reel.platform || "Platform") +
              ": " +
              (reel.title || "video") +
              " (tab baru)"
            }
            onMouseEnter={() => setHoveredReel(reel.id)}
            onMouseLeave={() => setHoveredReel(null)}
            onFocus={() => setHoveredReel(reel.id)}
            onBlur={() => setHoveredReel(null)}
          >
            {/* ── Thumbnail 9:16 ── */}
            <div className="vr-thumb">
              {reel.thumbnail_url ? (
                <img
                  src={reel.thumbnail_url}
                  alt={reel.title || 'Thumbnail video'}
                  className="vr-thumb-img"
                  loading="lazy"
                  decoding="async"
                  width={172}
                  height={305}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Placeholder kalau gambar tidak ada / error */}
              <div
                className="vr-thumb-placeholder"
                aria-hidden="true"
                style={{ display: reel.thumbnail_url ? 'none' : 'flex' }}
              >
                {getPlatformIcon(reel.platform, 28)}
              </div>

              {/* Gradient overlay bawah */}
              <div className="vr-thumb-gradient" aria-hidden="true" />

              {/* Badge platform pojok kanan atas */}
              <div className="vr-platform-badge" aria-hidden="true">
                {getPlatformIcon(reel.platform, 12)}
              </div>

              {/* Play button tengah */}
              <div className={`vr-play ${hoveredReel === reel.id ? 'vr-play--active' : ''}`} aria-hidden="true">
                <FaPlay aria-hidden="true" />
              </div>

              {/* Hover overlay "Tonton di..." */}
              <div className={`vr-hover-overlay ${hoveredReel === reel.id ? 'vr-hover-overlay--show' : ''}`} aria-hidden="true">
                <span>Tonton di {reel.platform || 'Platform'}</span>
                <FaPlay aria-hidden="true" style={{ fontSize: 11, marginLeft: 5 }} />
              </div>
            </div>

            {/* ── Info bawah card ── */}
            <div className="vr-info">
              {/* PERBAIKAN AKSESIBILITAS: H4 diubah ke H3 agar hierarki heading benar */}
              <h3 className="vr-title" title={reel.title}>
                {reel.title}
              </h3>

              {reel.description && (
                <p className="vr-desc" title={reel.description}>
                  {reel.description}
                </p>
              )}

              <div className="vr-spacer" />

              {reel.user && (
                <div className="vr-author">
                  {reel.user.profile_photo_url ? (
                    <img
                      src={reel.user.profile_photo_url}
                      alt=""
                      className="vr-author-avatar"
                      loading="lazy"
                      decoding="async"
                      width={18}
                      height={18}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="vr-author-fallback" aria-hidden="true">
                      {(reel.user.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="vr-author-name">{reel.user.name}</span>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default VideoReels;