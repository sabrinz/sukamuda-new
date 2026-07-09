import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axiosConfig';
import VideoReelForm from './VideoReelForm';
import {
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaImage,
  FaVideo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import './AdminVideoReels.css';

/* ==============================
   Toast System
   ============================== */
let toastId = 0;

const ToastContainer = ({ toasts, onRemove }) => (
  <div className="av-toast-container">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`av-toast av-toast-${t.type} ${t.exiting ? 'av-toast-exit' : ''}`}
        role="alert"
      >
        <span className="av-toast-icon">
          {t.type === 'success' && <FaCheckCircle />}
          {t.type === 'error' && <FaTimesCircle />}
          {t.type === 'warning' && <FaExclamationTriangle />}
          {t.type === 'info' && <FaInfoCircle />}
        </span>
        <span>{t.message}</span>
        <button
          className="av-toast-close"
          onClick={() => onRemove(t.id)}
          aria-label="Tutup"
        >
          <FaTimes />
        </button>
      </div>
    ))}
  </div>
);

/* ==============================
   Confirm Modal
   ============================== */
const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;

  return (
    <div className="av-modal-backdrop" onClick={onCancel}>
      <div className="av-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="av-modal-icon av-modal-danger">
          <FaExclamationTriangle />
        </div>
        <h3 className="av-modal-title">{title}</h3>
        <p className="av-modal-message">{message}</p>
        <div className="av-modal-actions">
          <button
            className="av-modal-btn av-modal-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </button>
          <button
            className="av-modal-btn av-modal-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==============================
   Skeleton Loader
   ============================== */
const SkeletonTable = () => (
  <div className="reels-table-wrapper">
    <table className="reels-table">
      <thead>
        <tr>
          <th style={{ width: '50px' }}>#</th>
          <th style={{ width: '110px' }}>Thumbnail</th>
          <th>Judul</th>
          <th style={{ width: '100px' }}>Platform</th>
          <th style={{ width: '90px' }}>Status</th>
          <th style={{ width: '130px' }}>Penulis</th>
          <th style={{ width: '160px' }}>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }).map((_, i) => (
          <tr key={i}>
            <td><div className="av-skel av-skel-badge" style={{ width: 26, height: 26, margin: '0 auto' }} /></td>
            <td><div className="av-skel av-skel-thumb" /></td>
            <td><div className="av-skel av-skel-text" /></td>
            <td><div className="av-skel av-skel-badge" /></td>
            <td><div className="av-skel av-skel-badge" /></td>
            <td><div className="av-skel av-skel-text-short" /></td>
            <td><div className="av-skel av-skel-actions" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ==============================
   Pagination Component
   ============================== */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = Math.min(maxVisible, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Halaman sebelumnya"
      >
        <FaChevronLeft style={{ fontSize: 11 }} />
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
        ) : (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Halaman berikutnya"
      >
        <FaChevronRight style={{ fontSize: 11 }} />
      </button>
    </div>
  );
};

/* ==============================
   Main Component
   ============================== */
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

  // Toast state
  const [toasts, setToasts] = useState([]);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  /* ---- Toast helpers ---- */
  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 260);
    }, 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 260);
  }, []);

  /* ---- Confirm helper ---- */
  const showConfirm = useCallback((title, message, onConfirm) => {
    setConfirmModal({ open: true, title, message, onConfirm, loading: false });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
  }, []);

  /* ---- Data fetching ---- */
  const fetchReels = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/video-reels/admin/all', {
        params: {
          page: currentPage,
          status: filterStatus !== 'all' ? filterStatus : null,
          platform: filterPlatform !== 'all' ? filterPlatform : null,
          search: searchQuery || null
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setReels(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching reels:', error);
      addToast('Gagal mengambil data video reels', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterPlatform, searchQuery, addToast]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  /* ---- Handlers ---- */
  const handleDelete = async (id, title) => {
    showConfirm(
      'Hapus Video Reel',
      `Apakah Anda yakin ingin menghapus "${title || 'video ini'}"? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        setActionLoading(id);
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/video-reels/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          closeConfirm();
          addToast('Video reel berhasil dihapus', 'success');
          fetchReels();
        } catch (error) {
          closeConfirm();
          addToast('Gagal menghapus video reel', 'error');
          console.error('Error:', error);
        } finally {
          setActionLoading(null);
        }
      }
    );
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/video-reels/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Video reel disetujui', 'success');
      fetchReels();
    } catch (error) {
      addToast('Gagal menyetujui video reel', 'error');
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
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Video reel ditolak', 'warning');
      fetchReels();
    } catch (error) {
      addToast('Gagal menolak video reel', 'error');
      console.error('Error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (reel) => {
    setEditingReel(reel);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReel(null);
    addToast(
      editingReel ? 'Video reel berhasil diperbarui' : 'Video reel berhasil ditambahkan',
      'success'
    );
    fetchReels();
  };

  /* ---- Badge renderers ---- */
  const getPlatformBadge = (platform) => {
    const colors = {
      instagram: '#E4405F',
      tiktok: '#010101',
      facebook: '#1877F2',
      youtube: '#FF0000'
    };
    return (
      <span
        className="platform-badge"
        style={{ backgroundColor: colors[platform] || '#64748b' }}
      >
        {platform}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const labels = { active: 'Active', inactive: 'Inactive', draft: 'Draft' };
    return (
      <span className={`status-badge status-${status}`}>
        {labels[status] || status}
      </span>
    );
  };

  /* ---- Render ---- */
  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
        loading={confirmModal.loading}
      />

      {/* Main Content */}
      <div className="admin-video-reels-container">
        {/* Header */}
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
              <FaVideo />
              Tambah Video Reel
            </button>
          )}
        </div>

        {/* Form */}
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
              <FaTimes style={{ fontSize: 11 }} />
              Tutup Form
            </button>
          </div>
        )}

        {/* Toolbar */}
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

        {/* Loading Skeleton */}
        {loading && <SkeletonTable />}

        {/* Empty State */}
        {!loading && reels.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaVideo />
            </div>
            <p>Belum ada video reel</p>
            <p className="empty-state-sub">Mulai tambahkan video reel pertama Anda</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && reels.length > 0 && (
          <div className="reels-table-wrapper">
            <table className="reels-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '110px' }}>Thumbnail</th>
                  <th>Judul</th>
                  <th style={{ width: '100px' }}>Platform</th>
                  <th style={{ width: '90px' }}>Status</th>
                  <th style={{ width: '130px' }}>Penulis</th>
                  <th style={{ width: '160px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reels.map((reel, index) => (
                  <tr key={reel.id}>
                    <td>
                      <span className="av-row-index">
                        {(currentPage - 1) * 15 + index + 1}
                      </span>
                    </td>
                    <td>
                      <div className="thumbnail-cell">
                        {reel.thumbnail_url ? (
                          <img
                            src={reel.thumbnail_url}
                            alt={reel.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="placeholder-thumb">
                            <FaImage />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="title-cell">
                        <a
                          href={reel.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {reel.title}
                        </a>
                        {reel.description && (
                          <p className="description-preview">{reel.description}</p>
                        )}
                      </div>
                    </td>
                    <td>{getPlatformBadge(reel.platform)}</td>
                    <td>{getStatusBadge(reel.status)}</td>
                    <td>
                      <div className="av-author">
                        <span className="av-author-name">
                          {reel.user?.name || 'Unknown'}
                        </span>
                        {reel.user?.id && (
                          <span className="av-author-id">ID: {reel.user.id}</span>
                        )}
                      </div>
                    </td>
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
                          onClick={() => handleDelete(reel.id, reel.title)}
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

        {/* Pagination */}
        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  );
};

export default AdminVideoReels;