import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './Write.css';
import axios from '../utils/axiosConfig';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

// ==========================================
// 1. CUSTOM BLOT UNTUK IMAGE + CAPTION
// ==========================================
const BlockEmbed = Quill.import('blots/block/embed');

class ImageCaptionBlot extends BlockEmbed {
  static create(value) {
    let node = super.create();
    
    // Elemen Gambar
    let img = document.createElement('img');
    img.setAttribute('src', value.url);
    node.appendChild(img);
    
    // Elemen Caption (Jika ada)
    if (value.caption) {
      let caption = document.createElement('figcaption');
      caption.innerText = value.caption;
      node.appendChild(caption);
    }
    
    return node;
  }

  static value(node) {
    let img = node.querySelector('img');
    let caption = node.querySelector('figcaption');
    return {
      url: img ? img.getAttribute('src') : '',
      caption: caption ? caption.innerText : ''
    };
  }
}

ImageCaptionBlot.blotName = 'imageCaption';
ImageCaptionBlot.tagName = 'figure';
ImageCaptionBlot.className = 'ql-image-caption';
Quill.register(ImageCaptionBlot);
// ==========================================

const categories = [
  { slug: 'school', label: 'School' },
  { slug: 'college', label: 'College' },
  { slug: 'general', label: 'General' },
  { slug: 'style', label: 'Style' },
  { slug: 'culinary', label: 'Culinary' },
  { slug: 'traveling', label: 'Traveling' },
  { slug: 'sport', label: 'Sport & E-Sport' },
  { slug: 'music', label: 'Music & Film' },
  { slug: 'otomotif', label: 'Otomotif' },
  { slug: 'science', label: 'Science' },
  { slug: 'health', label: 'Health' },
  { slug: 'tech', label: 'Tech' },
  { slug: 'podcast', label: 'Podcast' },
];

const initialState = {
  title: "",
  category: "",
  teaser: "",
  tags: "",
  thumbnailCaption: "",
  audioLink: "",
  videoLink: "",
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

const getSpotifyEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const normalized = url.trim();
    if (normalized.startsWith('spotify:')) {
      const parts = normalized.split(':').filter(Boolean);
      if (parts.length >= 3) {
        return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
      }
      return '';
    }
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes('spotify.com')) return '';
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] === 'embed') {
      parts.shift();
    }
    if (parts.length >= 2) {
      return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}`;
    }
    return '';
  } catch {
    return '';
  }
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const normalized = url.trim();
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();
    let videoId = '';

    if (host.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      if (parsed.pathname.startsWith('/watch')) {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1];
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1];
      } else if (parsed.pathname.startsWith('/live')) {
        videoId = parsed.searchParams.get('v');
      } else {
        const parts = parsed.pathname.split('/').filter(Boolean);
        videoId = parts[parts.length - 1] || '';
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
};

const getYoutubeThumbnailUrl = (url) => {
  if (!url) return '';
  try {
    const normalized = url.trim();
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();
    let videoId = '';

    if (host.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      if (parsed.pathname.startsWith('/watch')) {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1];
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1];
      } else if (parsed.pathname.startsWith('/live')) {
        videoId = parsed.searchParams.get('v');
      } else {
        const parts = parsed.pathname.split('/').filter(Boolean);
        videoId = parts[parts.length - 1] || '';
      }
    }

    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  } catch {
    return '';
  }
};

const buildPodcastContentHtml = (audioLink, videoLink) => {
  let html = '';
  const spotifyEmbed = getSpotifyEmbedUrl(audioLink);
  const youtubeEmbed = getYoutubeEmbedUrl(videoLink);

  if (audioLink) {
    html += `
      <div class="podcast-embed podcast-audio">
        <iframe
          src="${spotifyEmbed}"
          width="100%"
          height="232"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    `;
  }

  if (videoLink) {
    html += `
      <div class="podcast-embed podcast-video" style="margin-top:24px;">
        <iframe
          src="${youtubeEmbed}"
          width="100%"
          height="360"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    `;
  }

  if (!html) {
    html = '<p>Podcast akan segera hadir.</p>';
  }

  return html;
};

function Write() {
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const editData = location.state?.draft;
  const returnPath = location.state?.returnPath || '/profile';

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("publish");
  const [form, dispatch] = useReducer(formReducer, initialState);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);
  const isAdmin = user?.role === 'admin';

  // ─── STATE & REF BARU UNTUK MODAL IMAGE QUILL ───
  const [insertImageModalOpen, setInsertImageModalOpen] = useState(false);
  const [insertImageBase64, setInsertImageBase64] = useState(null);
  const [insertImageCaption, setInsertImageCaption] = useState("");
  const currentSelectionRef = useRef(null);

  // ─── POSISI FUNGSI YANG BENAR (Di dalam Write) ───
  const handleModalFileChange = (e) => {
    const file = e.target.files?.[0];
    
    // Jika user batal memilih file
    if (!file) {
      setInsertImageBase64(null);
      return;
    }

    // Batasan maksimal size file 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      e.target.value = ""; // Reset input
      setInsertImageBase64(null);
      return;
    }

    // Konversi file ke base64 agar bisa dimasukkan ke Quill
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target.result;
      setInsertImageBase64(base64); // Simpan ke state
    };
    reader.onerror = () => {
      alert("Terjadi kesalahan saat membaca file gambar.");
    };
    
    reader.readAsDataURL(file);
  };

  // ─── Proses file thumbnail (tanpa validasi resolusi) ───
  const processFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Ukuran file maksimal 5MB." }));
      return;
    }
    setThumbnailFile(file);
    setErrors(prev => ({ ...prev, image: null }));
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target?.result);
    reader.readAsDataURL(file);
  };

  // ─── FUNGSI BARU: INSERT GAMBAR & CAPTION KE QUILL ───
  const handleInsertCustomImage = () => {
    if (!insertImageBase64) {
      alert("Silakan pilih gambar terlebih dahulu.");
      return;
    }

    const quill = quillRef.current;
    if (!quill) return;

    const range = currentSelectionRef.current || quill.getSelection(true) || { index: quill.getLength() - 1, length: 0 };
    const alignValue = quill.getFormat(range)?.align || null;

    // Masukkan Custom Blot
    quill.insertEmbed(range.index, 'imageCaption', {
      url: insertImageBase64,
      caption: insertImageCaption
    }, 'user');

    // Terapkan alignment jika ada
    quill.setSelection(range.index + 1, 0, 'silent');
    if (alignValue) {
      quill.formatLine(range.index, 1, 'align', alignValue, 'user');
    }

    // Reset dan tutup modal
    setInsertImageModalOpen(false);
    setInsertImageBase64(null);
    setInsertImageCaption("");
  };


  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Tulis isi berita di sini...",
        modules: {
          toolbar: {
            container: "#quill-toolbar",
            handlers: {
              undo() { this.quill.history.undo(); },
              redo() { this.quill.history.redo(); },

              // ─── Custom image handler: Membuka Modal Custom ───
              image() {
                // Simpan posisi kursor terakhir
                currentSelectionRef.current = this.quill.getSelection(true);
                // Buka Modal
                setInsertImageModalOpen(true);
              },
            },
          },
          history: { delay: 1000, maxStack: 100 },
        },
      });
    }

    if (editData) {
      dispatch({ type: 'SET_FIELD', field: 'title', value: editData.title || "" });
      dispatch({ type: 'SET_FIELD', field: 'category', value: editData.category || "" });
      dispatch({ type: 'SET_FIELD', field: 'teaser', value: editData.summary || editData.teaser || "" });
      dispatch({ type: 'SET_FIELD', field: 'tags', value: editData.tags || "" });
      dispatch({ type: 'SET_FIELD', field: 'thumbnailCaption', value: editData.image_caption || editData.thumbnailCaption || "" });
      dispatch({ type: 'SET_FIELD', field: 'audioLink', value: editData.audio_link || editData.audioLink || "" });
      dispatch({ type: 'SET_FIELD', field: 'videoLink', value: editData.video_link || editData.videoLink || "" });

      if (editData.image) setThumbnailPreview(editData.image);
      if (quillRef.current && editData.content) {
        quillRef.current.root.innerHTML = editData.content;
      }
    }
  }, [editData]);

  const handleInputChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    // Jika admin memasukkan video link untuk podcast, coba ekstrak thumbnail otomatis
    if (field === 'videoLink' && isAdmin && !thumbnailFile) {
      const thumb = getYoutubeThumbnailUrl(value || "");
      if (thumb) {
        setThumbnailPreview(thumb);
      }
    }
  };

  const availableCategories = categories.filter((item) => item.slug !== 'podcast' || isAdmin || form.category === 'podcast');
  const isPodcast = form.category === 'podcast';

  const handleCategoryChange = (e) => {
    const currentScrollY = window.scrollY;
    handleInputChange('category', e.target.value);
    requestAnimationFrame(() => { window.scrollTo(0, currentScrollY); });
  };

  const openRelatedModal = async () => {
    if (!form.category) {
      setErrors(prev => ({ ...prev, category: 'Pilih kategori terlebih dahulu untuk menambahkan Baca Juga.' }));
      return;
    }

    setRelatedError(null);
    setRelatedLoading(true);
    setRelatedModalOpen(true);

    try {
      const response = await axios.get(`/api/articles/list/${form.category}`);
      const related = response.data || [];
      const filtered = related.filter((item) => item.id !== editData?.id);
      setRelatedArticles(filtered);
    } catch (error) {
      console.error('Gagal memuat daftar artikel terkait:', error);
      setRelatedError('Tidak dapat memuat daftar artikel. Coba lagi.');
      setRelatedArticles([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const insertRelatedShortcode = (articleId, articleTitle) => {
    const quill = quillRef.current;
    if (!quill) return;

    const range = quill.getSelection(true) || { index: quill.getLength() - 1, length: 0 };
    
    // Insert teks yang terlihat user = judul artikel
    // Tapi simpan shortcode di akhir sebagai "marker" tersembunyi
    const displayText = `Baca Juga: ${articleTitle}`;
    
    quill.insertText(range.index, '\n', 'user');
    quill.insertText(range.index + 1, displayText, {
      bold: true,
      color: '#c0392b',
      link: `/article/${articleId}`   // ← sesuaikan dengan routing kamu
    }, 'user');
    quill.insertText(range.index + 1 + displayText.length, '\n', 'user');
    
    quill.setSelection(range.index + displayText.length + 2, 0, 'silent');
    setRelatedModalOpen(false);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.category) newErrors.category = "Kategori wajib dipilih.";
    if (!form.title.trim()) newErrors.title = "Judul tidak boleh kosong.";

    const tagsArray = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tagsArray.length < 2 || tagsArray.length > 10) {
      newErrors.tags = "Tag minimal 2 dan maksimal 10.";
    }

    if (!isPodcast && !thumbnailFile && !thumbnailPreview) newErrors.image = "Thumbnail wajib diunggah.";

    if (isPodcast) {
      if (modalType === 'publish' && !form.audioLink.trim() && !form.videoLink.trim()) {
        newErrors.audioLink = "Masukkan link Spotify atau YouTube untuk podcast.";
        newErrors.videoLink = "Masukkan link Spotify atau YouTube untuk podcast.";
      }
    } else {
      if (modalType === 'publish') {
        const content = quillRef.current?.root?.innerHTML || "";
        if (!content || content === '<p><br></p>') newErrors.content = "Isi berita tidak boleh kosong.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── HELPER: Download YouTube thumbnail and convert to File ───
  const downloadThumbnailAsFile = async (videoLink) => {
    try {
      const thumbnailUrl = getYoutubeThumbnailUrl(videoLink);
      if (!thumbnailUrl) return null;
      
      const response = await fetch(thumbnailUrl);
      if (!response.ok) return null;
      
      const blob = await response.blob();
      const fileName = `thumbnail-${Date.now()}.jpg`;
      return new File([blob], fileName, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Failed to download thumbnail:', error);
      return null;
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateForm()) { setShowModal(false); return; }

    setLoading(true);
    const contentHtml = isPodcast
      ? buildPodcastContentHtml(form.audioLink.trim(), form.videoLink.trim())
      : quillRef.current?.root?.innerHTML || "";
    const formData = new FormData();

    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('content', contentHtml);
    formData.append('summary', form.teaser);
    formData.append('tags', form.tags);
    formData.append('image_caption', form.thumbnailCaption);
    formData.append('thumbnailCaption', form.thumbnailCaption);
    if (isPodcast) {
      if (form.audioLink.trim()) formData.append('audio_link', form.audioLink.trim());
      if (form.videoLink.trim()) formData.append('video_link', form.videoLink.trim());
    }
    if (modalType === 'draft') {
      formData.append('status', 'draft');
    } else if (!editData?.id) {
      formData.append('status', 'review');
    }
    
    // Handle thumbnail file: prioritize custom upload, then extract from YouTube
    let finalThumbnailFile = thumbnailFile;
    if (!finalThumbnailFile && isPodcast && form.videoLink.trim()) {
      finalThumbnailFile = await downloadThumbnailAsFile(form.videoLink.trim());
    }
    if (finalThumbnailFile) formData.append('image', finalThumbnailFile);
    if (editData?.id) {
      formData.append('id', editData.id);
      formData.append('_method', 'PUT');
    }

    try {
      const url = editData?.id ? `/api/articles/${editData.id}` : '/api/articles';
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201 || response.status === 200) {
        queryClient.invalidateQueries(['publicArticles']);
        queryClient.invalidateQueries(['userArticles']);
        if (editData?.id) {
          navigate(returnPath);
        } else {
          navigate(modalType === 'draft' ? "/profile" : "/write-success");
        }
      }
    } catch (error) {
      console.error("Gagal kirim ke database:", error.response?.data);
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const formattedErrors = {};
        for (let key in apiErrors) formattedErrors[key] = apiErrors[key][0];
        setErrors(formattedErrors);
      } else {
        alert("Gagal mengirim: " + (error.response?.data?.message || "Cek koneksi/login"));
      }
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="page menulis-form-page">
      <main className="content">
        <section className="write-form">

          {/* Header */}
          <div className="write-header">
            <button className="back-link-btn" onClick={() => navigate(returnPath)}>
              <span className="back-icon"> ← </span>
            </button>
            <h2 className="write-heading">WRITE</h2>
            <div />
          </div>

          {/* Category */}
          <div className="form-row">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={handleCategoryChange}
            >
              <option value="" disabled>Pilih Kategori</option>
              {availableCategories.map((item) => (
                <option key={item.slug} value={item.slug}>{item.label}</option>
              ))}
            </select>
            {errors.category && <small style={{ color: 'red', marginTop: 4, display: 'block' }}>{errors.category}</small>}
          </div>

          {/* Title */}
          <div className="form-row">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              placeholder="Write Here"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
            {errors.title && <small style={{ color: 'red', marginTop: 4, display: 'block' }}>{errors.title}</small>}
          </div>

          {isPodcast ? (
            <>
              <div className="form-row">
                <label className="form-label">Link Spotify</label>
                <input
                  className="form-input"
                  placeholder="Masukkan link Spotify episode"
                  value={form.audioLink}
                  onChange={(e) => handleInputChange('audioLink', e.target.value)}
                />
                {errors.audioLink && <small style={{ color: 'red', marginTop: 4, display: 'block' }}>{errors.audioLink}</small>}
              </div>

              <div className="form-row">
                <label className="form-label">Link YouTube</label>
                <input
                  className="form-input"
                  placeholder="Masukkan link YouTube video"
                  value={form.videoLink}
                  onChange={(e) => handleInputChange('videoLink', e.target.value)}
                />
                {errors.videoLink && <small style={{ color: 'red', marginTop: 4, display: 'block' }}>{errors.videoLink}</small>}
              </div>

              <div className="form-row">
                <label className="form-label">Thumbnail (opsional)</label>
                <div className="thumbnail-upload-row">
                  <div
                    className="thumbnail-drop-mini"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        processFile(file);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      className="hidden-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    <span>Choose File</span>
                  </div>

                  {thumbnailPreview && (
                    <div className="thumbnail-preview-box">
                      <img
                        className="thumbnail-preview-mini"
                        src={thumbnailPreview}
                        alt="Preview"
                      />
                      <button
                        type="button"
                        className="remove-thumbnail-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailPreview(null);
                          setThumbnailFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                {errors.image && (
                  <small style={{ color: "red", marginTop: 4, display: "block" }}>
                    {errors.image}
                  </small>
                )}
              </div>

              <div className="form-row">
                <label className="form-label">Caption Thumbnail (opsional)</label>
                <input
                  className="form-input"
                  placeholder="Tulis caption thumbnail jika ingin"
                  value={form.thumbnailCaption}
                  onChange={(e) => handleInputChange('thumbnailCaption', e.target.value)}
                />
              </div>

              <div className="form-row">
                <p style={{ color: '#555', margin: '0 0 16px' }}>
                  Podcast hanya bisa dibuat oleh admin. Masukkan link Spotify audio dan/atau YouTube video. Jika YouTube thumbnail gagal, upload thumbnail untuk tampilan preview sebelum klik; di dalam artikel hanya audio/video.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Thumbnail */}
              <div className="form-row">
                <label className="form-label">Thumbnail</label>

                <div className="thumbnail-upload-row">

                  {/* Input Upload / Box Dasar */}
                  <div
                    className="thumbnail-drop-mini"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        processFile(file);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      className="hidden-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    <span>Choose File</span>
                  </div>

                  {/* Preview Box */}
                  {thumbnailPreview && (
                    <div className="thumbnail-preview-box">
                      <img
                        className="thumbnail-preview-mini"
                        src={thumbnailPreview}
                        alt="Preview"
                      />
                      <button
                        type="button"
                        className="remove-thumbnail-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailPreview(null);
                          setThumbnailFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {errors.image && (
                  <small style={{ color: "red", marginTop: 4, display: "block" }}>
                    {errors.image}
                  </small>
                )}
              </div>

              {/* Caption Thumbnail */}
              <div className="form-row">
                <label className="form-label">Caption Thumbnail</label>
                <div>
                  <input
                    className="form-input"
                    placeholder="Tulis caption gambar thumbnail"
                    value={form.thumbnailCaption}
                    onChange={(e) => handleInputChange('thumbnailCaption', e.target.value)}
                  />
                  <p className="thumbnail-caption-hint">Caption ini akan tampil di bawah gambar utama artikel.</p>
                </div>
              </div>

              <div className="editor-wrapper">
                <div id="quill-toolbar" className="editor-toolbar">
              <button className="ql-undo" type="button">
                <svg viewBox="0 0 18 18"><polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon><path className="ql-stroke" d="M6,10a4,4,0,1,1,1.5,3.1"></path></svg>
              </button>
              <button className="ql-redo" type="button">
                <svg viewBox="0 0 18 18"><polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path className="ql-stroke" d="M12,10a4,4,0,1,0-1.5,3.1"></path></svg>
              </button>
              <button className="ql-bold" type="button" />
              <button className="ql-italic" type="button" />
              <button className="ql-strike" type="button" />
              <button className="ql-underline" type="button" />
              <button className="ql-blockquote" type="button" />
              <button className="ql-list" value="ordered" type="button" />
              <button className="ql-list" value="bullet" type="button" />
              <button className="ql-align" value="" type="button" />
              <button className="ql-align" value="center" type="button" />
              <button className="ql-align" value="right" type="button" />
              <button className="ql-link" type="button" />
              <button className="ql-image" type="button" />
              <button className="related-button" type="button" onClick={openRelatedModal}>+ Baca Juga</button>
            </div>
            <div ref={editorRef} className="editor-body" />
            {errors.content && <small style={{ color: 'red', marginTop: 4, display: 'block' }}>{errors.content}</small>}
          </div>

              <div className="form-row">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  placeholder="Write Here"
                  value={form.teaser}
                  onChange={(e) => handleInputChange('teaser', e.target.value)}
                  maxLength={300}
                />
              </div>
            </>
          )}

          <div className="form-row">
            <label className="form-label">Tag</label>
            <input
              className="form-input"
              placeholder="Pisahkan dengan koma"
              value={form.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
            {errors.tags && <small style={{ color: 'red', marginTop: 4, display: 'block' }}>{errors.tags}</small>}
          </div>

          {/* Action buttons */}
          <div className="form-actions">
            <button className="btn-draft" type="button" onClick={() => openModal('draft')} disabled={loading}>Draft</button>
            <button className="btn-submit" type="button" onClick={() => openModal('publish')} disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>

        </section>
      </main>

      {/* Modal Submit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">
              {modalType === 'draft' ? 'Simpan sebagai Draft?' : 'Kirim artikel untuk ditinjau admin?'}
            </h2>
            <p className="modal-subtitle">
              {modalType === 'draft'
                ? 'Artikel akan disimpan dan bisa kamu lanjutkan nanti.'
                : '"Artikel akan masuk antrian review sebelum dipublikasikan."'}
            </p>
            <div className="modal-buttons">
              <button className="btn-batal" onClick={() => setShowModal(false)}>Batal</button>
              <button
                className="btn-konfirmasi-hapus"
                style={{ backgroundColor: modalType === 'draft' ? '#555' : '#007bff' }}
                onClick={handleFinalSubmit}
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : modalType === 'draft' ? 'Simpan Draft' : 'Kirim ke Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL BARU: INSERT GAMBAR & CAPTION (QUILL) ─── */}
      {insertImageModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title" style={{ marginBottom: '24px' }}>Sisipkan Gambar</h2>
            
            <div className="form-row" style={{ gridTemplateColumns: '1fr', textAlign: 'left', gap: '8px', marginBottom: '16px' }}>
              <label className="form-label" style={{ marginBottom: '0' }}>Pilih Gambar</label>
              <input 
                type="file" 
                accept="image/*" 
                className="form-input" 
                onChange={handleModalFileChange} 
                style={{ padding: '10px' }} 
              />
              {insertImageBase64 && <p style={{ fontSize: '12px', color: 'green', margin: 0 }}>Gambar berhasil dipilih dan divalidasi.</p>}
            </div>

            <div className="form-row" style={{ gridTemplateColumns: '1fr', textAlign: 'left', gap: '8px', marginBottom: '28px' }}>
              <label className="form-label" style={{ marginBottom: '0' }}>Keterangan Gambar (Opsional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ilustrasi - Keterangan gambar..." 
                value={insertImageCaption} 
                onChange={(e) => setInsertImageCaption(e.target.value)} 
              />
            </div>

            <div className="modal-buttons">
              <button 
                className="btn-batal" 
                onClick={() => {
                  setInsertImageModalOpen(false);
                  setInsertImageBase64(null);
                  setInsertImageCaption("");
                }}
              >
                Batal
              </button>
              <button 
                className="btn-konfirmasi-hapus" 
                style={{ backgroundColor: '#1e76d0' }} 
                onClick={handleInsertCustomImage}
              >
                Sisipkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Baca Juga */}
      {relatedModalOpen && (
        <div className="modal-overlay">
          <div className="related-modal-container">
            <div className="modal-header-row">
              <div>
                <h2 className="modal-title">Pilih Artikel Baca Juga</h2>
                <p className="modal-subtitle">Menampilkan artikel dengan kategori yang sama: {form.category || 'Belum dipilih'}</p>
              </div>
              <button className="btn-batal" onClick={() => setRelatedModalOpen(false)}>Tutup</button>
            </div>
            {relatedLoading ? (
              <p style={{ textAlign: 'center', marginTop: 18 }}>Memuat artikel...</p>
            ) : relatedError ? (
              <p style={{ color: '#d83a34', textAlign: 'center', marginTop: 18 }}>{relatedError}</p>
            ) : relatedArticles.length === 0 ? (
              <p style={{ textAlign: 'center', marginTop: 18 }}>Tidak ada artikel dalam kategori ini.</p>
            ) : (
              <div className="related-article-list">
                {relatedArticles.map((item) => (
                  <button
                    key={item.id}
                    className="related-article-item"
                    type="button"
                    onClick={() => insertRelatedShortcode(item.id, item.title)}
                  >
                    <span>{item.title}</span>
                    <strong>[related:{item.id}]</strong>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Write;