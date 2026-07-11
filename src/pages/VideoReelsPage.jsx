import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import axios from '../utils/axiosConfig';
import VideoReels from '../components/VideoReels';
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube } from 'react-icons/fa';
import './VideoReelsPage.css';

const baseUrl = import.meta.env.VITE_API_URL || 'https://sukamuda.co.id';

const fetchAllReels = async (platform = 'all') => {
  if (platform === 'all') {
    const response = await axios.get('/api/video-reels');
    return response.data;
  } else {
    const response = await axios.get(`/api/video-reels/platform/${platform}`);
    return response.data;
  }
};

function VideoReelsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const { data: reels = [], isLoading, error } = useQuery({
    queryKey: ['videoReels', selectedPlatform],
    queryFn: () => fetchAllReels(selectedPlatform),
    staleTime: 1000 * 60 * 5,
  });

  const platforms = [
    { id: 'all', label: 'Semua Platform', icon: null, color: '#667eea' },
    { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E4405F' },
    { id: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#000' },
    { id: 'facebook', label: 'Facebook', icon: FaFacebook, color: '#1877F2' },
    { id: 'youtube', label: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  ];

  const currentData = Array.isArray(reels) ? reels : (reels.data || []);
  const canonicalUrl = `${baseUrl}/video-reels${selectedPlatform !== 'all' ? `?platform=${selectedPlatform}` : ''}`;

  const schemaWebPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Video Reels - Sukamuda",
    "description": "Koleksi video terbaru dari berbagai platform di Sukamuda.",
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Sukamuda",
      "url": baseUrl
    },
    "inLanguage": "id-ID"
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Beranda",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Video Reels"
      }
    ]
  };

  return (
    <div className="video-reels-page">

      <Helmet>
        <title>Video Reels - Sukamuda</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content="Koleksi video terbaru dari berbagai platform di Sukamuda." />
        <meta property="og:title" content="Video Reels - Sukamuda" />
        <meta property="og:description" content="Koleksi video terbaru dari berbagai platform di Sukamuda." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(schemaWebPage)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(schemaBreadcrumb)}
        </script>
      </Helmet>

      <div className="page-header">
        <h1>Video Reels</h1>
        <p>Koleksi video terbaru dari berbagai platform</p>
      </div>

      {/* Platform Filter */}
      <div className="platform-filters">
        {platforms.map(platform => {
          const IconComponent = platform.icon;
          return (
            <button
              key={platform.id}
              className={`platform-filter-btn ${selectedPlatform === platform.id ? 'active' : ''}`}
              onClick={() => setSelectedPlatform(platform.id)}
              style={{
                backgroundColor: platform.color,
                borderColor: platform.color
              }}
            >
              {IconComponent && <IconComponent className="platform-icon-filter" />}
              <span>{platform.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Memuat video reels...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>Terjadi kesalahan saat memuat video reels</p>
        </div>
      )}

      {/* Reels Display */}
      {!isLoading && !error && (
        <div className="reels-section">
          {currentData.length === 0 ? (
            <div className="empty-reels">
              <p>Belum ada video reels untuk platform ini</p>
            </div>
          ) : (
            <>
              <div className="reels-count">
                Menampilkan <strong>{currentData.length}</strong> video
              </div>
              <VideoReels reels={currentData} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoReelsPage;