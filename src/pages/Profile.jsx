import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IoPencilSharp,
  IoHeart,
  IoTrashOutline,
  IoDocumentTextOutline,
  IoFlagOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCameraOutline,
  IoImagesOutline,
  IoSparkles,
  IoArrowForward,
  IoCreateOutline,
  IoCloseOutline,
  IoBookmarkOutline,
  IoCheckmarkDoneOutline,
  IoPersonOutline,
  IoSchoolOutline,
  IoGridOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import axios, { ensureCsrfToken } from '../utils/axiosConfig';
import './Profile.css';

const daftarProfession = ['Content Writer', 'Blogger', 'Freelance Writer', 'Contributor', 'Mahasiswa', 'Pelajar', 'Other'];
const pilihanInterest  = ['News', 'Lifestyle', 'Music & Film', 'Health', 'Hobby', 'Science', 'Sport', 'Gadget', 'Automotive'];

const STUDENT_PROFESSIONS = ['Pelajar', 'Mahasiswa', 'Pelajar/Mahasiswa'];
const isStudent = (p) => STUDENT_PROFESSIONS.includes(p);

const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  // 1. Coba potong dulu parameter ?v= di belakang agar regex bisa mendeteksi pola ganda dengan bersih
  let cleanUrl = url;
  let queryPart = '';
  const qIndex = url.indexOf('?');
  if (qIndex !== -1) {
    cleanUrl = url.substring(0, qIndex);
    queryPart = url.substring(qIndex); // simpan ?v=... nya
  }

  // 2. Deteksi pola ganda: domain/storage/domain/storage/...
  // Pola regex ini spesifik mencari /storage/ yang diawali domain
  const doubled = cleanUrl.match(/^(https?:\/\/[^/]+\/storage\/)(https?:\/\/[^/]+\/storage\/.+)/);
  if (doubled) {
    // Ambil bagian kedua yang benar, lalu tempelkan query ?v=... kembali
    return doubled[2] + queryPart;
  }

  // 3. Fallback deteksi ganda tanpa protocol kedua
  const doubledNoProto = cleanUrl.match(/^(https?:\/\/[^/]+\/)([^/]+\/)(storage\/.+)/);
  if (doubledNoProto && cleanUrl.includes('/storage/')) {
    const afterFirst = cleanUrl.replace(/^https?:\/\/[^/]+\/+/, '');
    if (/^(https?:\/\/)?[^/]+\/storage\//.test(afterFirst)) {
      const lastStorage = cleanUrl.lastIndexOf('/storage/');
      if (lastStorage > 0) return cleanUrl.substring(lastStorage) + queryPart;
    }
  }

  // Jika tidak ganda, kembalikan URL utuh + query nya
  return url;
};

const Profile = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState('Posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError]                   = useState(null);
  const [toast, setToast]                   = useState(null);

  const [userData, setUserData] = useState({
    name: '', email: '', bio: '', profession: 'Content Writer',
    schoolName: '', interest: [], avatar: '', coverPhoto: '',
  });

  const [posts, setPosts]     = useState([]);
  const [drafts, setDrafts]   = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [tempData, setTempData]         = useState(userData);
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const [saving, setSaving]             = useState(false);

  const [deleteTarget, setDeleteTarget] = useState({ id: null, type: null, title: '' });
  const [deleting, setDeleting]         = useState(false);

  const [reportTarget, setReportTarget] = useState({ id: null, title: '' });
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting]       = useState(false);

  // ★ State untuk cache buster
  const [imageVersion, setImageVersion] = useState(Date.now());

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const profileData = useMemo(() => {
    const needsSchool = isStudent(userData.profession);
    const checks = [
      Boolean(String(userData.profession || '').trim()),
      needsSchool ? Boolean(String(userData.schoolName || '').trim()) : true,
      Array.isArray(userData.interest) && userData.interest.length > 0,
      Boolean(String(userData.bio || '').trim()),
    ];
    const completed = checks.filter(Boolean).length;
    return {
      percent: Math.round((completed / checks.length) * 100),
      isComplete: completed === checks.length,
      remaining: checks.length - completed,
    };
  }, [userData]);

  // ★ Pisahkan fungsi load profil agar bisa dipanggil ulang
  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get('/api/profile');
      const d = res.data?.data;
      if (!d) return;
      setUserData({
        name:       d.name       || 'User',
        email:      d.email      || '',
        bio:        d.bio        || '',
        profession: d.profession || 'Content Writer',
        schoolName: d.schoolName || '',
        interest:   Array.isArray(d.interests) ? d.interests : [],
        avatar:     d.avatar     || '',
        coverPhoto: d.coverPhoto || '',
      });
      const safe = (arr) => (Array.isArray(arr) ? arr : []);
      setPosts(safe(d.posts));
      setDrafts(safe(d.drafts));
      setFavorites(safe(d.favorites));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data profil.');
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      await loadProfile();
      if (active) setLoading(false);
    };
    init();
    return () => { active = false; };
  }, [loadProfile]);

  useEffect(() => {
    if (!loading && location.state?.openEditProfile) {
      setIsEditModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [loading, location, navigate]);

  const openModal = () => {
    setTempData(userData);
    setAvatarFile(null);
    setAvatarPreview(null);
    setCoverPhotoFile(null);
    setCoverPhotoPreview(null);
    setIsEditModalOpen(true);
  };

  const toggleInterest = (it) => {
    const cur = Array.isArray(tempData.interest) ? tempData.interest : [];
    setTempData({ ...tempData, interest: cur.includes(it) ? cur.filter((i) => i !== it) : [...cur, it] });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      showToast('Format tidak didukung. Gunakan JPG/PNG/WEBP.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran maksimal 5 MB.', 'error');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Format tidak didukung. Gunakan JPG/PNG/WEBP.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran maksimal 5 MB.', 'error');
      return;
    }
    setCoverPhotoFile(file);
    setCoverPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!tempData.name?.trim()) {
      showToast('Nama tidak boleh kosong.', 'error');
      return;
    }
    setSaving(true);
    try {
      await ensureCsrfToken();
      const fd = new FormData();
      fd.append('name', tempData.name || '');
      fd.append('bio', tempData.bio || '');
      fd.append('profession', tempData.profession || '');
      fd.append('schoolName', isStudent(tempData.profession) ? tempData.schoolName || '' : '');
      (Array.isArray(tempData.interest) ? tempData.interest : []).forEach((item) => fd.append('interests[]', item));
      if (avatarFile) fd.append('avatarFile', avatarFile);
      if (coverPhotoFile) fd.append('coverPhotoFile', coverPhotoFile);

      await axios.post('/api/profile', fd);

      // ★ PERBAIKAN UTAMA: Re-fetch profil dari server setelah simpan
      // Ini menjamin data avatar/coverPhoto selalu akurat
      await loadProfile();

      // Update cache buster agar gambar langsung refresh
      setImageVersion(Date.now());

      if (refreshUser) await refreshUser();

      setIsEditModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setCoverPhotoFile(null);
      setCoverPhotoPreview(null);
      showToast('Profil berhasil diperbarui.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan profil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!deleteTarget.id) return;
    setDeleting(true);
    try {
      await ensureCsrfToken();
      await axios.delete(`/api/articles/${deleteTarget.id}`);
      const rm = (list, id) => list.filter((x) => x.id !== id);
      const { id, type } = deleteTarget;
      if (type === 'post') setPosts((p) => rm(p, id));
      if (type === 'draft') setDrafts((p) => rm(p, id));
      if (type === 'favorite') setFavorites((p) => rm(p, id));
      setDeleteTarget({ id: null, type: null, title: '' });
      showToast('Artikel berhasil dihapus.', 'success');
    } catch {
      showToast('Gagal menghapus artikel.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleReportArticle = async () => {
    if (!reportTarget.id || !reportReason.trim()) return;
    setReporting(true);
    try {
      await ensureCsrfToken();
      await axios.post('/api/reports', { article_id: reportTarget.id, reason: reportReason.trim() });
      setReportTarget({ id: null, title: '' });
      setReportReason('');
      showToast('Laporan berhasil dikirim.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengirim laporan.', 'error');
    } finally {
      setReporting(false);
    }
  };

  const clearDelete = () => !deleting && setDeleteTarget({ id: null, type: null, title: '' });
  const clearReport = () => !reporting && setReportTarget({ id: null, title: '' });

  if (loading) return <ProfileSkeleton />;

  // ★ Cache buster function
  const addCacheBust = (url) => {
    if (!url || url.startsWith('blob:')) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${imageVersion}`;
  };

  const avatarSrc    = addCacheBust(sanitizeImageUrl(avatarPreview || userData.avatar));
  const coverSrc     = addCacheBust(sanitizeImageUrl(coverPhotoPreview || userData.coverPhoto));
  const initials     = userData.name?.charAt(0).toUpperCase() || '?';
  const hasAvatarImg = Boolean(avatarSrc);
  const hasCoverImg  = Boolean(coverSrc);

  const TABS = [
    { id: 'Posts',    label: 'Published', count: posts.length,     icon: <IoDocumentTextOutline size={15} /> },
    { id: 'Draft',    label: 'Drafts',    count: drafts.length,    icon: <IoCreateOutline size={15} /> },
    { id: 'Favorite', label: 'Favorites', count: favorites.length, icon: <IoHeart size={14} /> },
  ];

  return (
    <div className="pf-page">

      {/* ═══ COVER PHOTO ═══ */}
      <header className="pf-cover-section">
        <div className="pf-cover-wrapper">
          <div className="pf-cover-bg" style={hasCoverImg ? { backgroundImage: `url(${coverSrc})` } : undefined}>
            {!hasCoverImg && (
              <>
                <div className="pf-cover-mesh" />
                <div className="pf-cover-orb pf-cover-orb--1" />
                <div className="pf-cover-orb pf-cover-orb--2" />
                <div className="pf-cover-orb pf-cover-orb--3" />
                <div className="pf-cover-grid-lines" />
              </>
            )}
          </div>
          <div className="pf-cover-gradient" />
          <div className="pf-cover-shine" />
        </div>
      </header>

      {/* ═══ PROFILE CARD ═══ */}
      <section className="pf-card-section">
        <div className="pf-card">

          <div className="pf-card-avatar-wrap">
            <button className="pf-avatar-trigger" onClick={openModal} aria-label="Ganti foto profil">
              <div className="pf-avatar-ring">
                {hasAvatarImg ? (
                  <img
                    className="pf-avatar-img-tag"
                    src={avatarSrc}
                    alt={userData.name}
                  />
                ) : (
                  <div className="pf-avatar-img pf-avatar-img--fallback">
                    <span className="pf-avatar-initial">{initials}</span>
                  </div>
                )}
              </div>
              <span className="pf-avatar-badge">
                <IoCameraOutline size={11} />
              </span>
            </button>
          </div>

          {/* Info */}
          <div className="pf-card-info">
            <h1 className="pf-card-name">{userData.name}</h1>

            <div className="pf-card-tags">
              <span className="pf-tag">
                <IoSparkles size={11} />
                {userData.profession}
              </span>
              {isStudent(userData.profession) && userData.schoolName && (
                <span className="pf-tag pf-tag--sub">
                  <IoSchoolOutline size={11} />
                  {userData.schoolName}
                </span>
              )}
            </div>

            {userData.bio && <p className="pf-card-bio">{userData.bio}</p>}

            <div className="pf-card-meta-row">
              {userData.email && (
                <span className="pf-meta-email">{userData.email}</span>
              )}
            </div>

            {Array.isArray(userData.interest) && userData.interest.length > 0 && (
              <div className="pf-interest-pills">
                {userData.interest.map((it) => (
                  <span key={it} className="pf-interest-pill">{it}</span>
                ))}
              </div>
            )}

            <button className="pf-edit-profile-btn" onClick={openModal}>
              <IoPencilSharp size={13} />
              <span>Edit Profil</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="pf-main">

        {error && (
          <div className="pf-error-banner">
            <IoAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!profileData.isComplete && (
          <div className="pf-completion-card">
            <div className="pf-comp-header">
              <div className="pf-comp-icon-wrap">
                <IoSparkles size={14} />
              </div>
              <div className="pf-comp-text">
                <h4>Lengkapi Profilmu</h4>
                <p>{profileData.remaining} langkah lagi untuk profil sempurna</p>
              </div>
            </div>
            <div className="pf-comp-footer">
              <div className="pf-comp-progress">
                <div className="pf-comp-bar">
                  <div className="pf-comp-fill" style={{ width: `${profileData.percent}%` }} />
                </div>
                <span className="pf-comp-pct">{profileData.percent}%</span>
              </div>
              <button className="pf-comp-btn" onClick={openModal}>
                Lengkapi
                <IoArrowForward size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <nav className="pf-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`pf-tab ${activeTab === tab.id ? 'pf-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="pf-tab-icon">{tab.icon}</span>
              <span className="pf-tab-label">{tab.label}</span>
              {tab.count > 0 && <span className="pf-tab-count">{tab.count}</span>}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <section className="pf-tab-content">
          {activeTab === 'Posts' && (
            posts.length > 0 ? (
              <div className="pf-grid">
                {posts.map((p, i) => (
                  <ArticleCard
                    key={p.id}
                    data={p}
                    idx={i}
                    type="post"
                    onReport={() => setReportTarget({ id: p.id, title: p.title })}
                    onDelete={() => setDeleteTarget({ id: p.id, type: 'post', title: p.title })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IoDocumentTextOutline size={26} />}
                msg="Belum ada artikel yang diterbitkan."
                sub="Mulai bagikan ceritamu kepada dunia."
                cta="Tulis Artikel Pertama"
                onClick={() => navigate('/write')}
              />
            )
          )}

          {activeTab === 'Draft' && (
            drafts.length > 0 ? (
              <div className="pf-grid">
                {drafts.map((d, i) => (
                  <ArticleCard
                    key={d.id}
                    data={d}
                    idx={i}
                    type="draft"
                    onDelete={() => setDeleteTarget({ id: d.id, type: 'draft', title: d.title })}
                    onEdit={() => navigate('/write', { state: { draft: d } })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IoCreateOutline size={26} />}
                msg="Belum ada draft."
                sub="Ide-ide mu menunggu untuk ditulis."
                cta="Mulai Menulis"
                onClick={() => navigate('/write')}
              />
            )
          )}

          {activeTab === 'Favorite' && (
            favorites.length > 0 ? (
              <div className="pf-grid">
                {favorites.map((f, i) => (
                  <ArticleCard
                    key={f.id}
                    data={f}
                    idx={i}
                    type="favorite"
                    userName={f.author?.name}
                    onDelete={() => setDeleteTarget({ id: f.id, type: 'favorite', title: f.title })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IoBookmarkOutline size={26} />}
                msg="Belum ada artikel favorit."
                sub="Simpan artikel yang kamu suka untuk dibaca nanti."
              />
            )
          )}
        </section>
      </main>

      {/* ═══ EDIT MODAL ═══ */}
      {isEditModalOpen && (
        <div className="pf-overlay" onClick={() => !saving && setIsEditModalOpen(false)}>
          <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pf-modal-head">
              <div>
                <h2>Edit Profil</h2>
                <p>Perbarui informasi publik kamu</p>
              </div>
              <button
                className="pf-modal-close"
                onClick={() => !saving && setIsEditModalOpen(false)}
                aria-label="Tutup"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="pf-modal-body">
              {/* Avatar Section */}
              <div className="pf-fm-avatar-section">
                <div
                  className={`pf-fm-avatar-display ${hasAvatarImg ? 'pf-fm-avatar-display--has-preview' : ''}`}
                  onClick={() => document.getElementById('pf-avatar-input')?.click()}
                >
                  {avatarSrc ? (
                    <img
                      className="pf-fm-avatar-circle-img"
                      src={avatarSrc}
                      alt="Preview"
                    />
                  ) : (
                    <div className="pf-fm-avatar-circle">
                      <span>{initials}</span>
                    </div>
                  )}
                  <div className="pf-fm-avatar-overlay">
                    <IoCameraOutline size={20} />
                    <span>Ganti Foto</span>
                  </div>
                  <input
                    id="pf-avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarChange}
                    hidden
                  />
                </div>
                {avatarFile && (
                  <div className="pf-fm-file-status pf-fm-file-status--success">
                    <IoCheckmarkDoneOutline size={13} />
                    <span>{avatarFile.name}</span>
                  </div>
                )}
              </div>

              {/* Cover Photo */}
              <div className="pf-fm-group">
                <label className="pf-fm-label">Foto Sampul</label>
                <div
                  className={`pf-fm-cover-area ${hasCoverImg ? 'pf-fm-cover-area--has-preview' : ''}`}
                  onClick={() => document.getElementById('pf-cover-input')?.click()}
                >
                  {hasCoverImg ? (
                    <>
                      <img
                        className="pf-fm-cover-img-tag"
                        src={coverSrc}
                        alt="Cover preview"
                      />
                      <div className="pf-fm-cover-overlay">
                        <IoImagesOutline size={16} />
                        <span>Ganti Sampul</span>
                      </div>
                    </>
                  ) : (
                    <div className="pf-fm-cover-empty">
                      <IoImagesOutline size={22} />
                      <span>Pilih Foto Sampul</span>
                      <small>JPG, PNG, atau WEBP — Maks 5MB</small>
                    </div>
                  )}
                  <input
                    id="pf-cover-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverPhotoChange}
                    hidden
                  />
                </div>
                {coverPhotoFile && (
                  <div className="pf-fm-file-status pf-fm-file-status--success">
                    <IoCheckmarkDoneOutline size={13} />
                    <span>{coverPhotoFile.name}</span>
                  </div>
                )}
              </div>

              {/* Nama */}
              <div className="pf-fm-group">
                <label className="pf-fm-label">Nama Lengkap</label>
                <input
                  className="pf-fm-input"
                  value={tempData.name}
                  onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                  placeholder="Nama kamu"
                />
              </div>

              {/* Bio */}
              <div className="pf-fm-group">
                <label className="pf-fm-label">Bio</label>
                <textarea
                  className="pf-fm-input pf-fm-textarea"
                  value={tempData.bio}
                  rows={3}
                  onChange={(e) => setTempData({ ...tempData, bio: e.target.value })}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                />
              </div>

              {/* Profesi + Sekolah */}
              <div className="pf-fm-row">
                <div className="pf-fm-group">
                  <label className="pf-fm-label">Profesi</label>
                  <select
                    className="pf-fm-input pf-fm-select"
                    value={tempData.profession}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempData({
                        ...tempData,
                        profession: v,
                        schoolName: isStudent(v) ? tempData.schoolName : '',
                      });
                    }}
                  >
                    {daftarProfession.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                {isStudent(tempData.profession) && (
                  <div className="pf-fm-group">
                    <label className="pf-fm-label">
                      {tempData.profession === 'Pelajar' ? 'Asal Sekolah' : 'Asal Kampus'}
                    </label>
                    <input
                      className="pf-fm-input"
                      value={tempData.schoolName}
                      onChange={(e) => setTempData({ ...tempData, schoolName: e.target.value })}
                      placeholder={tempData.profession === 'Pelajar' ? 'Nama sekolah' : 'Nama kampus'}
                    />
                  </div>
                )}
              </div>

              {/* Interest */}
              <div className="pf-fm-group">
                <label className="pf-fm-label">Minat</label>
                <div className="pf-fm-chips">
                  {pilihanInterest.map((it) => (
                    <button
                      type="button"
                      key={it}
                      className={`pf-fm-chip ${(tempData.interest || []).includes(it) ? 'pf-fm-chip--on' : ''}`}
                      onClick={() => toggleInterest(it)}
                    >
                      {it}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pf-modal-foot">
              <button
                className="pf-btn-ghost"
                onClick={() => !saving && setIsEditModalOpen(false)}
                disabled={saving}
              >
                Batal
              </button>
              <button className="pf-btn-primary" onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <span className="pf-spinner" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE MODAL ═══ */}
      {deleteTarget.id && (
        <div className="pf-overlay" onClick={clearDelete}>
          <div className="pf-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="pf-dialog-icon pf-dialog-icon--danger">
              <IoTrashOutline size={22} />
            </div>
            <h3>Hapus Artikel?</h3>
            <p>"<strong>{deleteTarget.title}</strong>" akan dihapus permanen dan tidak bisa dikembalikan.</p>
            <div className="pf-dialog-actions">
              <button className="pf-btn-ghost" onClick={clearDelete} disabled={deleting}>Batal</button>
              <button className="pf-btn-danger" onClick={handleDeleteArticle} disabled={deleting}>
                {deleting ? (
                  <><span className="pf-spinner" />Menghapus...</>
                ) : (
                  'Hapus Permanen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REPORT MODAL ═══ */}
      {reportTarget.id && (
        <div className="pf-overlay" onClick={clearReport}>
          <div className="pf-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="pf-dialog-icon">
              <IoFlagOutline size={22} />
            </div>
            <h3>Laporkan Artikel</h3>
            <p>"<strong>{reportTarget.title}</strong>"</p>
            <textarea
              className="pf-dialog-textarea"
              placeholder="Jelaskan alasan pelaporan..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            />
            <div className="pf-dialog-actions">
              <button className="pf-btn-ghost" onClick={clearReport} disabled={reporting}>Batal</button>
              <button
                className="pf-btn-primary"
                onClick={handleReportArticle}
                disabled={reporting || !reportReason.trim()}
              >
                {reporting ? (
                  <><span className="pf-spinner" />Mengirim...</>
                ) : (
                  'Kirim Laporan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className={`pf-toast ${toast.type === 'error' ? 'pf-toast--error' : ''}`}>
          {toast.type === 'success' ? <IoCheckmarkCircle size={16} /> : <IoAlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   SUBCOMPONENTS
═══════════════════════════════════════════ */

const ArticleCard = ({ data, type, idx = 0, onDelete, onEdit, onReport }) => {
  const date = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const isDraft = type === 'draft';

  return (
    <article className="pf-article-card" style={{ animationDelay: `${idx * 0.07}s` }}>
      <div className="pf-ac-thumb">
        {data.image ? (
          <img src={data.image} alt={data.title} loading="lazy" />
        ) : (
          <div className="pf-ac-thumb-ph">
            <IoDocumentTextOutline size={24} />
          </div>
        )}
        {data.category && <span className="pf-ac-cat">{data.category}</span>}
        {isDraft && <span className="pf-ac-draft-badge">Draft</span>}
      </div>
      <div className="pf-ac-body">
        <div className="pf-ac-meta">
          <span>{data.category || 'Umum'}</span>
          <span className="pf-ac-dot" />
          <span>{date}</span>
        </div>
        <h3 className="pf-ac-title">{data.title || 'Tanpa Judul'}</h3>
        <div className="pf-ac-footer">
          {type === 'post' || type === 'favorite' ? (
            <Link to={`/article/${data.slug}`} className="pf-ac-read">
              Baca
              <IoArrowForward size={12} />
            </Link>
          ) : (
            <button className="pf-ac-read" onClick={onEdit}>
              Lanjutkan
              <IoArrowForward size={12} />
            </button>
          )}
          <div className="pf-ac-actions">
            {onReport && type === 'post' && (
              <button className="pf-ac-act" onClick={onReport} title="Laporkan">
                <IoFlagOutline size={13} />
              </button>
            )}
            {onDelete && (
              <button className="pf-ac-act pf-ac-act--danger" onClick={onDelete} title="Hapus">
                <IoTrashOutline size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const EmptyState = ({ icon, msg, sub, cta, onClick }) => (
  <div className="pf-empty">
    <div className="pf-empty-icon">{icon}</div>
    <p className="pf-empty-title">{msg}</p>
    {sub && <p className="pf-empty-desc">{sub}</p>}
    {cta && (
      <button className="pf-btn-primary pf-empty-cta" onClick={onClick}>
        {cta}
        <IoArrowForward size={13} />
      </button>
    )}
  </div>
);

const ProfileSkeleton = () => (
  <div className="pf-page">
    <header className="pf-cover-section">
      <div className="pf-cover-wrapper">
        <div className="pf-cover-bg pf-skel-dark" />
      </div>
    </header>
    <section className="pf-card-section">
      <div className="pf-card pf-skel-card-wrap">
        <div className="pf-card-avatar-wrap">
          <div className="pf-avatar-ring">
            <div className="pf-avatar-img pf-skel-circle" />
          </div>
        </div>
        <div className="pf-card-info">
          <div className="pf-skel-bar w50 h9 mb8" />
          <div className="pf-skel-bar w35 h6 mb10" />
          <div className="pf-skel-bar w80 h5 mb6" />
          <div className="pf-skel-bar w60 h5" />
        </div>
      </div>
    </section>
    <main className="pf-main">
      <div className="pf-skel-bar w100 h6 mb16" />
      <div className="pf-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="pf-article-card pf-skel-card">
            <div className="pf-skel-thumb" />
            <div className="pf-ac-body" style={{ padding: 14 }}>
              <div className="pf-skel-bar w40 h4 mb6" />
              <div className="pf-skel-bar w90 h7 mb6" />
              <div className="pf-skel-bar w65 h5" />
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default Profile;