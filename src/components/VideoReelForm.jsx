import React, { useState } from 'react';
import axios from '../utils/axiosConfig'; // Sesuaikan dengan lokasi axiosConfig-mu
import { FaLink, FaImage } from 'react-icons/fa';
import './VideoReelForm.css';

const VideoReelForm = ({ onSuccess, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    video_url: initialData?.video_url || '',
    platform: initialData?.platform || 'auto',
  });

  // State terpisah khusus untuk menangani file gambar
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.thumbnail_url || '');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  // Fungsi untuk menangani saat user memilih file gambar dari komputernya
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran maksimal 2MB
      if (file.size > 2097152) {
        setError('Ukuran gambar terlalu besar! Maksimal 2MB.');
        e.target.value = ''; // Reset input file
        setThumbnailFile(null);
        return;
      }
      setThumbnailFile(file);
      // Membuat URL preview lokal untuk ditampilkan di form
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const detectPlatformPreview = (url) => {
    const url_lower = url.toLowerCase();

    if (url_lower.includes('instagram.com') || url_lower.includes('ig.me')) {
      return 'instagram';
    } else if (url_lower.includes('tiktok.com') || url_lower.includes('vm.tiktok.com')) {
      return 'tiktok';
    } else if (url_lower.includes('facebook.com') || url_lower.includes('fb.watch')) {
      return 'facebook';
    } else if (url_lower.includes('youtube.com') || url_lower.includes('youtu.be')) {
      return 'youtube';
    }

    return 'unknown';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Judul tidak boleh kosong');
      return;
    }

    if (!formData.video_url.trim()) {
      setError('URL video tidak boleh kosong');
      return;
    }

    try {
      new URL(formData.video_url);
    } catch {
      setError('URL video tidak valid');
      return;
    }

    setSubmitting(true);

    try {
      // Menggunakan FormData karena kita mengirim file fisik (bukan teks JSON biasa)
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('video_url', formData.video_url);
      submitData.append('platform', formData.platform === 'auto' ? 'auto' : formData.platform);

      // Jika ada file gambar yang dipilih, masukkan ke FormData
      if (thumbnailFile) {
        submitData.append('thumbnail', thumbnailFile);
      }

      // Aturan Khusus Laravel: Update dengan file (FormData) harus menggunakan POST + _method: PUT
      const isEditing = !!initialData?.id;
      const endpoint = isEditing ? `/api/video-reels/${initialData.id}` : '/api/video-reels';

      if (isEditing) {
        submitData.append('_method', 'PUT');
      }

      // Ambil token login (sesuaikan key-nya dengan yang ada di localStorage kamu)
      const token = localStorage.getItem('token'); 

      const response = await axios.post(endpoint, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      setSuccess(isEditing ? 'Video reel berhasil diperbarui!' : 'Video reel berhasil ditambahkan!');

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.data);
        }

        if (!isEditing) {
          setFormData({
            title: '',
            description: '',
            video_url: '',
            platform: 'auto',
          });
          setThumbnailFile(null);
          setPreviewUrl('');
        }
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan video reel';
      setError(errorMsg);
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const detectedPlatform = detectPlatformPreview(formData.video_url);
  const platformLabels = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    facebook: 'Facebook',
    youtube: 'YouTube',
    unknown: 'Platform Tidak Dikenal',
  };

  return (
    <div className="video-reel-form-container">
      <form onSubmit={handleSubmit} className="video-reel-form">
        <h3>{initialData?.id ? 'Edit Video Reel' : 'Tambah Video Reel Baru'}</h3>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <div className="form-group">
          <label htmlFor="title">
            Judul <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Contoh: Tutorial React Hooks"
            maxLength={255}
            disabled={submitting || isLoading}
          />
          <span className="char-count">{formData.title.length}/255</span>
        </div>

        <div className="form-group">
          <label htmlFor="description">Deskripsi</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Jelaskan tentang video ini (opsional)"
            rows="3"
            maxLength={500}
            disabled={submitting || isLoading}
          />
          <span className="char-count">{formData.description.length}/500</span>
        </div>

        <div className="form-group">
          <label htmlFor="video_url">
            URL Video <span className="required">*</span>
          </label>
          <div className="url-input-wrapper">
            <FaLink className="icon" />
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://instagram.com/... atau https://tiktok.com/..."
              disabled={submitting || isLoading}
            />
          </div>
          {formData.video_url && (
            <div className="platform-preview">
              <span className="label">Platform Terdeteksi:</span>
              <span className={`badge badge-${detectedPlatform}`}>
                {platformLabels[detectedPlatform]}
              </span>
            </div>
          )}
        </div>

        <div className="form-row-reel">
          <div className="form-group">
            <label htmlFor="platform">Platform (Opsional)</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              disabled={submitting || isLoading}
            >
              <option value="auto">Auto Deteksi</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          {/* BAGIAN INPUT THUMBNAIL YANG SUDAH DIUBAH JADI FILE UPLOAD */}
          <div className="form-group">
            <label htmlFor="thumbnail_file">Thumbnail Gambar (Opsional)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="thumbnail_file"
                accept="image/jpeg, image/png, image/jpg, image/webp"
                onChange={handleFileChange}
                disabled={submitting || isLoading}
                style={{ marginBottom: '10px', display: 'block' }}
              />
            </div>
            
            {/* Tampilkan kotak preview gambar jika ada */}
            {previewUrl && (
              <div className="image-preview" style={{ marginTop: '10px' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', border: '1px solid #ccc' }} 
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={submitting || isLoading}>
            {submitting ? 'Menyimpan...' : initialData?.id ? 'Perbarui' : 'Tambahkan'}
          </button>
        </div>

        <div className="form-info">
          <p>
            <strong>Tips:</strong> Gunakan tautan langsung video dari platform media sosial. Sistem akan otomatis mendeteksi platform-nya.
          </p>
        </div>
      </form>
    </div>
  );
};

export default VideoReelForm;