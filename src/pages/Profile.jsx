import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IoPencilSharp,
  IoHeart,
  IoTrashOutline,
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoTimeOutline,
  IoFileTrayOutline,
  IoFlagOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import axios, { ensureCsrfToken } from '../utils/axiosConfig';
import './Profile.css';

const daftarProfession = ['Content Writer', 'Blogger', 'Freelance Writer', 'Contributor', 'Mahasiswa', 'Pelajar', 'Other'];
const pilihanInterest  = ['News', 'Lifestyle', 'Music & Film', 'Health', 'Hobby', 'Science', 'Sport', 'Gadget', 'Automotive'];

const Profile = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState('Posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError]                   = useState(null);

  const [userData, setUserData] = useState({
    name: '', email: '', bio: '', profession: 'Content Writer',
    schoolName: '', interest: [], avatar: '', coverPhoto: '',
  });

  const [posts, setPosts]                     = useState([]);
  const [drafts, setDrafts]                   = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [rejectedArticles, setRejectedArticles] = useState([]);
  const [favorites, setFavorites]             = useState([]);

  const [tempData, setTempData]   = useState(userData);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const [saving, setSaving]       = useState(false);

  const [deleteTarget, setDeleteTarget] = useState({ id: null, type: null, title: '' });
  const [deleting, setDeleting]         = useState(false);

  const [reportTarget, setReportTarget] = useState({ id: null, title: '' });
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting]       = useState(false);

  /* ── completion ── */
  const profileData = useMemo(() => {
    const needsSchool = ['Pelajar', 'Mahasiswa', 'Pelajar/Mahasiswa'].includes(userData.profession);
    const checks = [
      { done: Boolean(String(userData.profession || '').trim()) },
      { done: needsSchool ? Boolean(String(userData.schoolName || '').trim()) : true },
      { done: Array.isArray(userData.interest) && userData.interest.length > 0 },
    ];
    const completed = checks.filter(c => c.done).length;
    return {
      percent: Math.round((completed / checks.length) * 100),
      isComplete: completed === checks.length,
    };
  }, [userData]);

  /* ── fetch ── */
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await axios.get('/api/profile');
        const d = res.data?.data;
        if (!d || !active) return;

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

        const safe = arr => Array.isArray(arr) ? arr : [];
        setPosts(safe(d.posts));
        setDrafts(safe(d.drafts));
        setPendingArticles(safe(d.pending));
        setRejectedArticles(safe(d.rejected));
        setFavorites(safe(d.favorites));
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Gagal mengambil data profil.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loading && location.state?.openEditProfile) {
      setIsEditModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [loading, location, navigate]);

  /* ── handlers ── */
  const openModal = () => {
    setTempData(userData);
    setAvatarFile(null);
    setAvatarPreview(null);
    setCoverPhotoFile(null);
    setCoverPhotoPreview(null);
    setIsEditModalOpen(true);
  };

  const toggleInterest = it => {
    const cur = Array.isArray(tempData.interest) ? tempData.interest : [];
    setTempData({
      ...tempData,
      interest: cur.includes(it) ? cur.filter(i => i !== it) : [...cur, it],
    });
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) { alert('Format file tidak didukung. Gunakan JPG/PNG/WEBP.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5 MB.'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverPhotoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { alert('Format foto sampul tidak didukung. Gunakan JPG/PNG/WEBP.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran foto sampul maksimal 5 MB.'); return; }
    setCoverPhotoFile(file);
    setCoverPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!tempData.name?.trim()) { alert('Nama tidak boleh kosong.'); return; }
    setSaving(true);
    try {
      await ensureCsrfToken();
      const fd = new FormData();
      fd.append('name',       tempData.name || '');
      fd.append('bio',        tempData.bio  || '');
      fd.append('profession', tempData.profession || '');
      const isStudent = ['Pelajar', 'Mahasiswa', 'Pelajar/Mahasiswa'].includes(tempData.profession);
      fd.append('schoolName', isStudent ? tempData.schoolName || '' : '');
      (Array.isArray(tempData.interest) ? tempData.interest : [])
        .forEach(item => fd.append('interests[]', item));
      if (avatarFile) fd.append('avatarFile', avatarFile);
      if (coverPhotoFile) fd.append('coverPhotoFile', coverPhotoFile);

      const res = await axios.post('/api/profile', fd);
      const sd  = res.data?.data;
      if (sd) {
        setUserData({
          name:       sd.name       || '',
          email:      sd.email      || '',
          bio:        sd.bio        || '',
          profession: sd.profession || '',
          schoolName: sd.schoolName || '',
          interest:   Array.isArray(sd.interests) ? sd.interests : [],
          avatar:     sd.avatar     || '',
          coverPhoto: sd.coverPhoto || '',
        });
        if (refreshUser) await refreshUser();
      }
      setIsEditModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan profil.');
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
      const rm = (list, id) => list.filter(x => x.id !== id);
      const { id, type } = deleteTarget;
      if (type === 'post')     setPosts(p => rm(p, id));
      if (type === 'draft')    setDrafts(p => rm(p, id));
      if (type === 'pending')  setPendingArticles(p => rm(p, id));
      if (type === 'rejected') setRejectedArticles(p => rm(p, id));
      if (type === 'favorite') setFavorites(p => rm(p, id));
      setDeleteTarget({ id: null, type: null, title: '' });
    } catch {
      alert('Gagal menghapus artikel.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReportArticle = async () => {
    if (!reportTarget.id || !reportReason.trim()) return;
    setReporting(true);
    try {
      await ensureCsrfToken();
      await axios.post('/api/reports', {
        article_id: reportTarget.id,
        reason: reportReason.trim(),
      });
      alert('Laporan berhasil dikirim.');
      setReportTarget({ id: null, title: '' });
      setReportReason('');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim laporan.');
    } finally {
      setReporting(false);
    }
  };

  const clearDelete = () => !deleting && setDeleteTarget({ id: null, type: null, title: '' });
  const clearReport = () => !reporting && setReportTarget({ id: null, title: '' });

  /* ── loading ── */
  if (loading) return <div className="pp-loading">Memuat profil…</div>;

  const avatarBg = avatarPreview || userData.avatar;
  const coverBg = coverPhotoPreview || userData.coverPhoto;
  const initials = userData.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="pp-page">

      {/* ── HEADER ── */}
      <div className="pp-header">
        <div
          className="pp-banner"
          style={coverBg ? {
            backgroundImage: `url(${coverBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        />
        <div className="pp-info-row">
          <div className="pp-avatar-wrap">
            <div
              className="pp-avatar"
              style={avatarBg ? { backgroundImage: `url(${avatarBg})` } : {}}
              onClick={openModal}
            >
              {!avatarBg && initials}
            </div>
            <div className="pp-avatar-edit" onClick={openModal}>
              <IoPencilSharp size={12} />
            </div>
          </div>

          <div className="pp-meta">
            <div className="pp-name-row">
              <h1 className="pp-name">{userData.name}</h1>
              <button className="pp-edit-btn" onClick={openModal} aria-label="Edit profil">
                <IoPencilSharp size={14} />
              </button>
            </div>
            <p className="pp-bio">{userData.bio || 'Belum ada bio.'}</p>
            <p className="pp-prof">
              {userData.profession}
              {['Pelajar', 'Mahasiswa', 'Pelajar/Mahasiswa'].includes(userData.profession) && userData.schoolName ? ` · ${userData.schoolName}` : ''}
            </p>
            {Array.isArray(userData.interest) && userData.interest.length > 0 && (
              <div className="pp-pills">
                {userData.interest.map((it, i) => (
                  <span key={i} className="pp-pill">{it} +</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="pp-error">
          <div className="pp-error-inner">⚠️ {error}</div>
        </div>
      )}

      {/* ── COMPLETION ── */}
      {!profileData.isComplete && (
        <div className="pp-completion">
          <div className="pp-cw">
            <div className="pp-cw-text">
              <h4>Lengkapi Profil</h4>
              <p>Tingkatkan kredibilitasmu</p>
            </div>
            <div className="pp-cw-bar">
              <div className="pp-cw-fill" style={{ width: `${profileData.percent}%` }} />
            </div>
            <div className="pp-cw-pct">{profileData.percent}%</div>
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="pp-tabs">
        {[
          { id: 'Posts',    label: 'Posts',    icon: <IoDocumentTextOutline size={15} /> },
          { id: 'Draft',    label: `Draft (${drafts.length})`, icon: <IoFileTrayOutline size={15} /> },
          { id: 'Favorite', label: 'Favorite', icon: <IoHeart size={14} style={{ color: '#ef4444' }} /> },
        ].map((tab, i, arr) => (
          <React.Fragment key={tab.id}>
            <button
              className={`pp-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
            {i < arr.length - 1 && <span className="pp-tab-sep">|</span>}
          </React.Fragment>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="pp-content">
        {activeTab === 'Posts' && (
          posts.length > 0
            ? posts.map(p => (
                <ArticleCard key={p.id} data={p} type="post" userName={userData.name}
                  onReport={() => setReportTarget({ id: p.id, title: p.title })} />
              ))
            : <EmptyState message="Belum ada artikel yang diterbitkan." />
        )}

        {/*  */}

        {activeTab === 'Draft' && (
          drafts.length > 0
            ? drafts.map(d => (
                <ArticleCard key={d.id} data={d} type="draft" userName={userData.name}
                  onDelete={() => setDeleteTarget({ id: d.id, type: 'draft', title: d.title })}
                  onEdit={() => navigate('/write', { state: { draft: d } })} />
              ))
            : <EmptyState message="Draft kosong." />
        )}

        {activeTab === 'Favorite' && (
          favorites.length > 0
            ? favorites.map(fav => (
                <ArticleCard key={fav.id} data={fav} type="favorite" userName={fav.author?.name} />
              ))
            : <EmptyState message="Belum ada artikel yang disukai." />
        )}
      </div>

      {/* ── MODAL EDIT ── */}
      {isEditModalOpen && (
        <div className="pp-overlay" onClick={() => !saving && setIsEditModalOpen(false)}>
          <div className="pp-modal" onClick={e => e.stopPropagation()}>
            <div className="pp-modal-head">
              <h2>Edit Profil</h2>
              <button className="pp-modal-close" onClick={() => !saving && setIsEditModalOpen(false)}>
                <IoCloseCircleOutline size={24} />
              </button>
            </div>
            <div className="pp-modal-body">
              <div className="pp-field">
                <label className="pp-label">Nama Lengkap</label>
                <input className="pp-input" value={tempData.name}
                  onChange={e => setTempData({ ...tempData, name: e.target.value })} />
              </div>
              <div className="pp-field">
                <label className="pp-label">Bio</label>
                <input className="pp-input" value={tempData.bio}
                  onChange={e => setTempData({ ...tempData, bio: e.target.value })} />
              </div>
              <div className="pp-field">
                <label className="pp-label">Profesi</label>
                <select className="pp-select" value={tempData.profession}
                  onChange={e => {
                    const profession = e.target.value;
                    const isStudent = ['Pelajar', 'Mahasiswa', 'Pelajar/Mahasiswa'].includes(profession);
                    setTempData({
                      ...tempData,
                      profession,
                      schoolName: isStudent ? tempData.schoolName : '',
                    });
                  }}>
                  {daftarProfession.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {['Pelajar'].includes(tempData.profession) && (
                <div className="pp-field">
                  <label className="pp-label">Asal Sekolah</label>
                  <input className="pp-input" value={tempData.schoolName}
                    onChange={e => setTempData({ ...tempData, schoolName: e.target.value })}
                    placeholder="Nama sekolah" />
                </div>
              )}

              {['Mahasiswa'].includes(tempData.profession) && (
                <div className="pp-field">
                  <label className="pp-label">Asal Kampus</label>
                  <input className="pp-input" value={tempData.schoolName}
                    onChange={e => setTempData({ ...tempData, schoolName: e.target.value })}
                    placeholder="Nama Kampus" />
                </div>
              )}

              <div className="pp-field">
                <label className="pp-label">Minat</label>
                <div className="pp-interest-grid">
                  {pilihanInterest.map(it => (
                    <div
                      key={it}
                      className={`pp-interest-chip ${(tempData.interest || []).includes(it) ? 'active' : ''}`}
                      onClick={() => toggleInterest(it)}
                    >
                      {it} {(tempData.interest || []).includes(it) ? '✓' : '+'}
                    </div>
                  ))}
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label">Ganti Foto Profil</label>
                <input type="file" className="pp-input" accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange} />
                {avatarFile && (
                  <small style={{ color: 'green', marginTop: 5, display: 'block' }}>
                    {avatarFile.name}
                  </small>
                )}
              </div>
              <div className="pp-field">
                <label className="pp-label">Ganti Foto Sampul</label>
                <input type="file" className="pp-input" accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverPhotoChange} />
                {(coverPhotoFile || coverPhotoPreview || userData.coverPhoto) && (
                  <div className="pp-cover-preview">
                    <img
                      src={coverPhotoPreview || userData.coverPhoto}
                      alt="Preview foto sampul"
                    />
                  </div>
                )}
                {coverPhotoFile && (
                  <small style={{ color: 'green', marginTop: 5, display: 'block' }}>
                    {coverPhotoFile.name}
                  </small>
                )}
              </div>
            </div>
            <div className="pp-modal-foot">
              <button className="pp-btn pp-btn-ghost" onClick={() => !saving && setIsEditModalOpen(false)}>
                Batal
              </button>
              <button className="pp-btn pp-btn-primary" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DELETE ── */}
      {deleteTarget.id && (
        <div className="pp-overlay" onClick={clearDelete}>
          <div className="pp-del-modal" onClick={e => e.stopPropagation()}>
            <div className="pp-del-icon"><IoTrashOutline size={40} /></div>
            <h2>Hapus Artikel?</h2>
            <p>"{deleteTarget.title}" akan dihapus permanen dan tidak dapat dikembalikan.</p>
            <div className="pp-del-btns">
              <button className="pp-btn pp-btn-ghost" onClick={clearDelete}>Batal</button>
              <button className="pp-btn pp-btn-danger" onClick={handleDeleteArticle} disabled={deleting}>
                {deleting ? 'Menghapus…' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL REPORT ── */}
      {reportTarget.id && (
        <div className="pp-overlay" onClick={clearReport}>
          <div className="pp-report-modal" onClick={e => e.stopPropagation()}>
            <div className="pp-report-icon"><IoFlagOutline size={40} /></div>
            <h2>Laporkan Artikel</h2>
            <p>Artikel: "{reportTarget.title}"</p>
            <textarea
              className="pp-report-textarea"
              placeholder="Jelaskan alasan pelaporan..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={4}
            />
            <div className="pp-report-btns">
              <button className="pp-btn pp-btn-ghost" onClick={clearReport}>Batal</button>
              <button className="pp-btn pp-btn-primary" onClick={handleReportArticle} disabled={reporting || !reportReason.trim()}>
                {reporting ? 'Mengirim…' : 'Kirim Laporan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   SUB COMPONENTS
───────────────────────────────────────────── */
const ArticleCard = ({ data, type, userName, onDelete, onEdit, onReport }) => {
  const date = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : '-';

  return (
    <div className="pp-card">
      <div className="pp-card-thumb">
        {data.image
          ? <img src={data.image} alt={data.title} loading="lazy" />
          : null}
        {type === 'pending'  && <span className="pp-card-badge badge-pending">Review</span>}
        {type === 'rejected' && <span className="pp-card-badge badge-rejected">Revisi</span>}
        {type === 'draft'    && <span className="pp-card-badge badge-draft">Draft</span>}
        {type === 'post'     && data.category && <span className="pp-card-cat">{data.category}</span>}
        {type === 'favorite' && data.category && <span className="pp-card-cat">{data.category}</span>}
      </div>
      <div className="pp-card-body">
        <div>
          {userName && <p className="pp-card-author">Nama : {userName}</p>}
          <p className="pp-card-submeta">
            {data.category || 'Umum'} | {date}
          </p>
          <h3 className="pp-card-title">{data.title || 'Tanpa Judul'}</h3>
        </div>
        <div className="pp-card-actions">
          {type !== 'favorite' && type !== 'post' ? (
            <button className="pp-btn pp-btn-primary" onClick={onEdit}>
              {type === 'rejected' ? 'Revisi' : 'Lanjutkan Menulis'}
            </button>
          ) : (
            <Link to={`/article/${data.slug}`} className="pp-btn pp-btn-link">
              Selengkapnya &rarr;
            </Link>
          )}
          {onDelete && (
            <button className="pp-trash" onClick={onDelete} aria-label="Hapus artikel">
              <IoTrashOutline size={18} />
            </button>
          )}
          {onReport && type === 'post' && (
            <button className="pp-report" onClick={onReport} aria-label="Laporkan artikel">
              <IoFlagOutline size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="pp-empty">
    <IoFileTrayOutline size={40} />
    <p>{message}</p>
  </div>
);

export default Profile;