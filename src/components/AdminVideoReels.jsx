import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import VideoReelForm from './VideoReelForm';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaImage } from 'react-icons/fa';
import './AdminVideoReels.css';

const AdminVideoReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReels();
  }, [currentPage, filterStatus, filterPlatform]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchReels(true);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchReels = async () => {
    setLoading(true);
    try {
      // Ambil token untuk berjaga-jaga jika route admin/all ini juga butuh otorisasi
      const token = localStorage.getItem('token'); 
      
      const response = await axios.get('/api/video-reels/admin/all', {
        params: {
          page: currentPage,
          status: filterStatus !== 'all' ? filterStatus : null,
          platform: filterPlatform !== 'all' ? filterPlatform : null,
          search: searchQuery
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setReels(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching reels:', error);
      alert('Gagal mengambil data video reels');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus video reel ini?')) return;

    setActionLoading(id);
    try {
      const token = localStorage.getItem('token'); // Ambil token dari storage
      await axios.delete(`/api/video-reels/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Video reel berhasil dihapus');
      fetchReels();
    } catch (error) {
      alert('Gagal menghapus video reel');
      console.error('Error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      // axios.patch butuh 3 parameter: (url, data, config)
      await axios.patch(`/api/video-reels/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Video reel disetujui');
      fetchReels();
    } catch (error) {
      alert('Gagal menyetujui video reel');
      console.error('Error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/video-reels/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Video reel ditolak');
      fetchReels();
    } catch (error) {
      alert('Gagal menolak video reel');
      console.error('Error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (reel) => {
    setEditingReel(reel);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReel(null);
    fetchReels();
  };

  const getPlatformBadge = (platform) => {
    const colors = {
      'instagram': '#E4405F',
      'tiktok': '#000000',
      'facebook': '#1877F2',
      'youtube': '#FF0000'
    };

    return (
      <span
        className="platform-badge"
        style={{ backgroundColor: colors[platform] || '#999' }}
      >
        {platform.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const classes = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'draft': 'status-draft'
    };

    return (
      <span className={`status-badge ${classes[status] || ''}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="admin-video-reels-container">
      <div className="admin-video-reels-header">
        <h2>Manajemen Video Reels</h2>
        {!showForm && (
          <button
            className="btn-add-reel"
            onClick={() => {
              setEditingReel(null);
              setShowForm(true);
            }}
          >
            + Tambah Video Reel
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-section">
          <VideoReelForm
            initialData={editingReel}
            onSuccess={handleFormSuccess}
          />
          <button
            className="btn-close-form"
            onClick={() => {
              setShowForm(false);
              setEditingReel(null);
            }}
          >
            ✕ Tutup Form
          </button>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="search-boxx">
          <input
            type="text"
            placeholder="Cari judul atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-right">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filterPlatform}
            onChange={(e) => {
              setFilterPlatform(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">Semua Platform</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '40px 0' }}>
          <div className="admin-spinner"></div>
          <p style={{ fontWeight: 'bold', color: '#666' }}>Memuat Data...</p>
        </div>
      )}

      {!loading && reels.length === 0 && (
        <div className="empty-state">
          <p>Belum ada video reel. Mulai tambahkan sekarang!</p>
        </div>
      )}

      {!loading && reels.length > 0 && (
        <div className="reels-table-wrapper">
          <table className="reels-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '150px' }}>Thumbnail</th>
                <th>Judul</th>
                <th style={{ width: '100px' }}>Platform</th>
                <th style={{ width: '90px' }}>Status</th>
                <th style={{ width: '150px' }}>Penulis</th>
                <th style={{ width: '180px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reels.map((reel, index) => (
                <tr key={reel.id}>
                  <td>{(currentPage - 1) * 15 + index + 1}</td>
                  <td>
                    <div className="thumbnail-cell">
                      {reel.thumbnail_url ? (
                        <img src={reel.thumbnail_url} alt={reel.title} />
                      ) : (
                        <div className="placeholder-thumb">
                          <FaImage />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="title-cell">
                      <a href={reel.video_url} target="_blank" rel="noopener noreferrer">
                        {reel.title}
                      </a>
                      {reel.description && (
                        <p className="description-preview">{reel.description}</p>
                      )}
                    </div>
                  </td>
                  <td>{getPlatformBadge(reel.platform)}</td>
                  <td>{getStatusBadge(reel.status)}</td>
                  <td>{reel.user?.name || 'Unknown'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(reel)}
                        disabled={actionLoading === reel.id}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      {reel.status === 'draft' && (
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(reel.id)}
                          disabled={actionLoading === reel.id}
                          title="Setujui"
                        >
                          <FaCheck />
                        </button>
                      )}

                      {reel.status === 'active' && (
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(reel.id)}
                          disabled={actionLoading === reel.id}
                          title="Tolak"
                        >
                          <FaTimes />
                        </button>
                      )}

                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(reel.id)}
                        disabled={actionLoading === reel.id}
                        title="Hapus"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVideoReels;