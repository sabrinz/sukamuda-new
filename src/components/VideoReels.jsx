import React, { useState } from 'react';
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube, FaLink, FaPlay } from 'react-icons/fa';
import './VideoReels.css';

const VideoReels = ({ reels = [] }) => {
  const [hoveredReel, setHoveredReel] = useState(null);

  const getPlatformIcon = (platform, size = 15) => {
    const p = (platform || '').toLowerCase();
    const style = { fontSize: `${size}px` };
    switch (p) {
      case 'instagram': return <FaInstagram style={{ ...style, color: '#E4405F' }} />;
      case 'tiktok':    return <FaTiktok style={{ ...style, color: '#000' }} />;
      case 'facebook':  return <FaFacebook style={{ ...style, color: '#1877F2' }} />;
      case 'youtube':   return <FaYoutube style={{ ...style, color: '#FF0000' }} />;
      default:          return <FaLink style={{ ...style, color: '#999' }} />;
    }
  };

  const handleClick = (reel) => {
    if (reel.video_url) {
      window.open(reel.video_url, '_blank');
    }
  };

  if (!reels || reels.length === 0) {
    return (
      <div className="vr-empty">
        <FaPlay style={{ fontSize: 24, opacity: 0.15 }} />
        <p>Belum ada video reels yang tersedia</p>
      </div>
    );
  }

  return (
    <div className="vr-container">
      <div className="vr-scroll">
        {reels.map((reel, idx) => (
          <div
            key={reel.id || idx}
            className="vr-card"
            onMouseEnter={() => setHoveredReel(reel.id)}
            onMouseLeave={() => setHoveredReel(null)}
            onClick={() => handleClick(reel)}
          >
            {/* ── Thumbnail 9:16 ── */}
            <div className="vr-thumb">
              {reel.thumbnail_url ? (
                <img
                  src={reel.thumbnail_url}
                  alt={reel.title}
                  className="vr-thumb-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Placeholder kalau gambar tidak ada / error */}
              <div
                className="vr-thumb-placeholder"
                style={{ display: reel.thumbnail_url ? 'none' : 'flex' }}
              >
                {getPlatformIcon(reel.platform, 28)}
              </div>

              {/* Gradient overlay bawah */}
              <div className="vr-thumb-gradient" />

              {/* Badge platform pojok kanan atas */}
              <div className="vr-platform-badge">
                {getPlatformIcon(reel.platform, 12)}
              </div>

              {/* Play button tengah */}
              <div className={`vr-play ${hoveredReel === reel.id ? 'vr-play--active' : ''}`}>
                <FaPlay />
              </div>

              {/* Hover overlay "Tonton di..." */}
              <div className={`vr-hover-overlay ${hoveredReel === reel.id ? 'vr-hover-overlay--show' : ''}`}>
                <span>Tonton di {reel.platform || 'Platform'}</span>
                <FaPlay style={{ fontSize: 11, marginLeft: 5 }} />
              </div>
            </div>

            {/* ── Info bawah card ── */}
            <div className="vr-info">
              <h4 className="vr-title" title={reel.title}>
                {reel.title}
              </h4>

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
                      alt={reel.user.name}
                      className="vr-author-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="vr-author-fallback">
                      {(reel.user.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="vr-author-name">{reel.user.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoReels;