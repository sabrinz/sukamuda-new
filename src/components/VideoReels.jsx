import React, { useState } from 'react';
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube } from 'react-icons/fa';
import './VideoReels.css';

const VideoReels = ({ reels = [] }) => {
  const [hoveredReel, setHoveredReel] = useState(null);

  const getPlatformIcon = (platform) => {
    const platformLower = (platform || '').toLowerCase();
    
    switch (platformLower) {
      case 'instagram':
        return <FaInstagram className="platform-icon instagram-icon" style={{ color: '#E4405F', fontSize: '18px' }} />;
      case 'tiktok':
        return <FaTiktok className="platform-icon tiktok-icon" style={{ color: '#000', fontSize: '18px' }} />;
      case 'facebook':
        return <FaFacebook className="platform-icon facebook-icon" style={{ color: '#1877F2', fontSize: '18px' }} />;
      case 'youtube':
        return <FaYoutube className="platform-icon youtube-icon" style={{ color: '#FF0000', fontSize: '18px' }} />;
      default:
        return <FaLink className="platform-icon" style={{ color: '#555', fontSize: '18px' }} />;
    }
  };

  const handleReelClick = (reel) => {
    if (reel.video_url) {
      window.open(reel.video_url, '_blank');
    }
  };

  if (!reels || reels.length === 0) {
    return (
      <div className="video-reels-empty">
        <p>Belum ada video reels yang tersedia</p>
      </div>
    );
  }

  return (
    <div className="video-reels-container">
      {/* Wrapper yang akan kita jadikan horizontal scroll di CSS */}
      <div className="video-reels-grid horizontal-scroll">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="video-reel-item"
            onMouseEnter={() => setHoveredReel(reel.id)}
            onMouseLeave={() => setHoveredReel(null)}
            onClick={() => handleReelClick(reel)}
          >
            {/* Thumbnail */}
            <div className="reel-thumbnail">
              {reel.thumbnail_url ? (
                <img
                  src={reel.thumbnail_url}
                  alt={reel.title}
                  className="reel-image"
                />
              ) : (
                <div className="reel-placeholder">
                  <div className="placeholder-icon">
                    {getPlatformIcon(reel.platform)}
                  </div>
                </div>
              )}

              {/* Platform Badge - Dibuat Putih & Tanpa Teks */}
              <div className="platform-badge-white">
                {getPlatformIcon(reel.platform)}
              </div>

              {/* Hover Overlay
              {hoveredReel === reel.id && (
                <div className="reel-overlay">
                  <div className="overlay-content">
                    <p className="overlay-text">Buka di {reel.platform || 'Platform'}</p>
                    <span className="arrow-icon">→</span>
                  </div>
                </div>
              )} */}
            </div>

            {/* Reel Info */}
            <div className="reel-info">
              <h4 className="reel-title" title={reel.title}>
                {reel.title}
              </h4>
              {reel.description && (
                <p className="reel-description" title={reel.description}>
                  {reel.description}
                </p>
              )}
              
              {/* Spacer untuk mendorong author ke bagian paling bawah agar rata */}
              <div style={{ flexGrow: 1 }}></div>

              {reel.user && (
                <div className="reel-author">
                  {reel.user.profile_photo_url && (
                    <img 
                      src={reel.user.profile_photo_url} 
                      alt={reel.user.name}
                      className="author-avatar-small"
                    />
                  )}
                  <span className="author-name">{reel.user.name}</span>
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