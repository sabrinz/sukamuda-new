import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  return (
    <div className="video-reels-page">
      <div className="page-header">
        <h1>Video Reels</h1>
        <p>Koleksi video terbaru dari berbagai platform</p>
      </div>

      {/* Platform Filter */}
      <div className="platform-filters">
        {platforms.map(platform => (
          <button
            key={platform.id}
            className={`platform-filter-btn ${selectedPlatform === platform.id ? 'active' : ''}`}
            onClick={() => setSelectedPlatform(platform.id)}
            style={{
              backgroundColor: platform.color,
              borderColor: platform.color
            }}
          >
            {platform.icon && <platform.icon className="platform-icon-filter" />}
            <span>{platform.label}</span>
          </button>
        ))}
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