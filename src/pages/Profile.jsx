import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  IoSchoolOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import axios, { ensureCsrfToken } from '../utils/axiosConfig';
import './Profile.css';

const daftarProfession = [
  'Content Writer',
  'Blogger',
  'Freelance Writer',
  'Contributor',
  'Mahasiswa',
  'Pelajar',
  'Other'
];

const pilihanInterest = [
  'News',
  'Lifestyle',
  'Music & Film',
  'Health',
  'Hobby',
  'Science',
  'Sport',
  'Gadget',
  'Automotive'
];

const STUDENT_PROFESSIONS = ['Pelajar', 'Mahasiswa', 'Pelajar/Mahasiswa'];

const isStudent = (p) => STUDENT_PROFESSIONS.includes(p);

const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_COVER_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  let cleanUrl = url;
  let queryPart = '';

  const qIndex = url.indexOf('?');

  if (qIndex !== -1) {
    cleanUrl = url.substring(0, qIndex);
    queryPart = url.substring(qIndex);
  }

  const doubled = cleanUrl.match(
    /^(https?:\/\/[^/]+\/storage\/)(https?:\/\/[^/]+\/storage\/.+)/
  );

  if (doubled) {
    return doubled[2] + queryPart;
  }

  const doubledNoProto = cleanUrl.match(
    /^(https?:\/\/[^/]+\/)([^/]+\/)(storage\/.+)/
  );

  if (doubledNoProto && cleanUrl.includes('/storage/')) {
    const afterFirst = cleanUrl.replace(/^https?:\/\/[^/]+\/+/, '');

    if (/^(https?:\/\/)?[^/]+\/storage\//.test(afterFirst)) {
      const lastStorage = cleanUrl.lastIndexOf('/storage/');

      if (lastStorage > 0) {
        return cleanUrl.substring(lastStorage) + queryPart;
      }
    }
  }

  return url;
};

const validateImageFile = (file, allowedTypes) => {
  if (!file) {
    return {
      valid: false,
      reason: 'Tidak ada file.'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      reason: 'Format tidak didukung. Gunakan JPG/PNG/WEBP.'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      reason: 'Ukuran maksimal 5 MB.'
    };
  }

  return {
    valid: true,
    reason: ''
  };
};

const createPreviewUrl = (file) => {
  if (!file) {
    return {
      url: null,
      revoke: null
    };
  }

  const url = URL.createObjectURL(file);

  return {
    url,
    revoke: () => URL.revokeObjectURL(url)
  };
};

const Profile = () => {
  const { updateUser } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    bio: '',
    profession: 'Content Writer',
    schoolName: '',
    interest: [],
    avatar: '',
    coverPhoto: '',
  });

  const [posts, setPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [tempData, setTempData] = useState(userData);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState({
    id: null,
    type: null,
    title: ''
  });

  const [deleting, setDeleting] = useState(false);

  const [reportTarget, setReportTarget] = useState({
    id: null,
    title: ''
  });

  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const [imageVersion, setImageVersion] = useState(Date.now());

  const avatarPreviewRef = useRef(null);
  const coverPreviewRef = useRef(null);
  const toastTimerRef = useRef(null);
  const loadingRef = useRef(false);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      message,
      type
    });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }

      if (coverPreviewRef.current) {
        URL.revokeObjectURL(coverPreviewRef.current);
      }
    };
  }, []);

  const profileData = useMemo(() => {
    const needsSchool = isStudent(userData.profession);

    const checks = [
      Boolean(String(userData.profession || '').trim()),
      needsSchool
        ? Boolean(String(userData.schoolName || '').trim())
        : true,
      Array.isArray(userData.interest) &&
        userData.interest.length > 0,
      Boolean(String(userData.bio || '').trim()),
    ];

    const completed = checks.filter(Boolean).length;

    return {
      percent: Math.round((completed / checks.length) * 100),
      isComplete: completed === checks.length,
      remaining: checks.length - completed,
    };
  }, [userData]);

  const loadProfile = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      const res = await axios.get('/api/profile');
      const d = res.data?.data;

      if (!d) return;

      const avatar = d.avatar || '';
      const coverPhoto = d.coverPhoto || '';

      const normalizedUserData = {
        name: d.name || 'User',
        email: d.email || '',
        bio: d.bio || '',
        profession: d.profession || 'Content Writer',
        schoolName: d.schoolName || '',
        interest: Array.isArray(d.interests) ? d.interests : [],
        avatar,
        coverPhoto,
      };

      setUserData(normalizedUserData);

      // =========================================================
      // SINKRONKAN USER PROFILE KE AUTH CONTEXT
      // Supaya Navbar langsung ikut berubah tanpa refresh halaman.
      // =========================================================
      updateUser({
        name: normalizedUserData.name,
        email: normalizedUserData.email,
        avatar,
        profile_photo_url: avatar,
      });

      const safe = (arr) =>
        Array.isArray(arr) ? arr : [];

      setPosts(safe(d.posts));
      setDrafts(safe(d.drafts));
      setFavorites(safe(d.favorites));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Gagal mengambil data profil.'
      );
    } finally {
      loadingRef.current = false;
    }
  }, [updateUser]);

  useEffect(() => {
    let active = true;

    const init = async () => {
      await loadProfile();

      if (active) {
        setLoading(false);
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [loadProfile]);

  useEffect(() => {
    if (!loading && location.state?.openEditProfile) {
      setIsEditModalOpen(true);

      navigate(location.pathname, {
        replace: true,
        state: null
      });
    }
  }, [loading, location, navigate]);

  useEffect(() => {
    if (
      isEditModalOpen ||
      deleteTarget.id ||
      reportTarget.id
    ) {
      const originalOverflow =
        document.body.style.overflow;

      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow =
          originalOverflow;
      };
    }
  }, [
    isEditModalOpen,
    deleteTarget.id,
    reportTarget.id
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;

      if (isEditModalOpen && !saving) {
        setIsEditModalOpen(false);
      }

      if (deleteTarget.id) {
        clearDelete();
      }

      if (reportTarget.id) {
        clearReport();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () =>
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
  }, [
    isEditModalOpen,
    saving,
    deleteTarget.id,
    reportTarget.id
  ]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  const clearDelete = () =>
    !deleting &&
    setDeleteTarget({
      id: null,
      type: null,
      title: ''
    });

  const clearReport = () =>
    !reporting &&
    setReportTarget({
      id: null,
      title: ''
    });

  const openModal = () => {
    setTempData(userData);

    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(
        avatarPreviewRef.current
      );
      avatarPreviewRef.current = null;
    }

    if (coverPreviewRef.current) {
      URL.revokeObjectURL(
        coverPreviewRef.current
      );
      coverPreviewRef.current = null;
    }

    setAvatarFile(null);
    setAvatarPreview(null);
    setCoverPhotoFile(null);
    setCoverPhotoPreview(null);
    setIsEditModalOpen(true);
  };

  const toggleInterest = (it) => {
    const cur = Array.isArray(tempData.interest)
      ? tempData.interest
      : [];

    setTempData({
      ...tempData,
      interest: cur.includes(it)
        ? cur.filter((i) => i !== it)
        : [...cur, it]
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validation = validateImageFile(
      file,
      ALLOWED_AVATAR_TYPES
    );

    if (!validation.valid) {
      showToast(
        validation.reason,
        'error'
      );

      e.target.value = '';
      return;
    }

    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(
        avatarPreviewRef.current
      );
    }

    const { url } = createPreviewUrl(file);

    avatarPreviewRef.current = url;
    setAvatarFile(file);
    setAvatarPreview(url);
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validation = validateImageFile(
      file,
      ALLOWED_COVER_TYPES
    );

    if (!validation.valid) {
      showToast(
        validation.reason,
        'error'
      );

      e.target.value = '';
      return;
    }

    if (coverPreviewRef.current) {
      URL.revokeObjectURL(
        coverPreviewRef.current
      );
    }

    const { url } = createPreviewUrl(file);

    coverPreviewRef.current = url;
    setCoverPhotoFile(file);
    setCoverPhotoPreview(url);
  };

  const handleSaveProfile = async () => {
    if (!tempData.name?.trim()) {
      showToast(
        'Nama tidak boleh kosong.',
        'error'
      );
      return;
    }

    setSaving(true);

    try {
      await ensureCsrfToken();

      const fd = new FormData();

      fd.append(
        'name',
        tempData.name || ''
      );

      fd.append(
        'bio',
        tempData.bio || ''
      );

      fd.append(
        'profession',
        tempData.profession || ''
      );

      fd.append(
        'schoolName',
        isStudent(tempData.profession)
          ? tempData.schoolName || ''
          : ''
      );

      (
        Array.isArray(tempData.interest)
          ? tempData.interest
          : []
      ).forEach((item) => {
        fd.append(
          'interests[]',
          item
        );
      });

      if (avatarFile) {
        fd.append(
          'avatarFile',
          avatarFile
        );
      }

      if (coverPhotoFile) {
        fd.append(
          'coverPhotoFile',
          coverPhotoFile
        );
      }

      await axios.post(
        '/api/profile',
        fd
      );

      // Ambil ulang data terbaru dari server.
      // loadProfile() juga otomatis update AuthContext.
      await loadProfile();

      setImageVersion(Date.now());

      setIsEditModalOpen(false);

      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(
          avatarPreviewRef.current
        );
        avatarPreviewRef.current = null;
      }

      if (coverPreviewRef.current) {
        URL.revokeObjectURL(
          coverPreviewRef.current
        );
        coverPreviewRef.current = null;
      }

      setAvatarFile(null);
      setAvatarPreview(null);
      setCoverPhotoFile(null);
      setCoverPhotoPreview(null);

      showToast(
        'Profil berhasil diperbarui.',
        'success'
      );
    } catch (err) {
      console.error(err);

      showToast(
        'Gagal menyimpan profil.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!deleteTarget.id) return;

    setDeleting(true);

    try {
      await ensureCsrfToken();

      await axios.delete(
        `/api/articles/${deleteTarget.id}`
      );

      const rm = (list, id) =>
        list.filter(
          (x) => x.id !== id
        );

      const {
        id,
        type
      } = deleteTarget;

      if (type === 'post') {
        setPosts((p) =>
          rm(p, id)
        );
      }

      if (type === 'draft') {
        setDrafts((p) =>
          rm(p, id)
        );
      }

      if (type === 'favorite') {
        setFavorites((p) =>
          rm(p, id)
        );
      }

      setDeleteTarget({
        id: null,
        type: null,
        title: ''
      });

      showToast(
        'Artikel berhasil dihapus.',
        'success'
      );
    } catch {
      showToast(
        'Gagal menghapus artikel.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleReportArticle = async () => {
    if (
      !reportTarget.id ||
      !reportReason.trim()
    ) {
      return;
    }

    setReporting(true);

    try {
      await ensureCsrfToken();

      await axios.post(
        '/api/reports',
        {
          article_id:
            reportTarget.id,
          reason:
            reportReason.trim()
        }
      );

      setReportTarget({
        id: null,
        title: ''
      });

      setReportReason('');

      showToast(
        'Laporan berhasil dikirim.',
        'success'
      );
    } catch (err) {
      console.error(err);

      showToast(
        'Gagal mengirim laporan.',
        'error'
      );
    } finally {
      setReporting(false);
    }
  };

  const addCacheBust = (url) => {
    if (!url || url.startsWith('blob:')) {
      return url;
    }

    const sep = url.includes('?')
      ? '&'
      : '?';

    return `${url}${sep}v=${imageVersion}`;
  };

  const avatarSrc = addCacheBust(
    sanitizeImageUrl(
      avatarPreview ||
        userData.avatar
    )
  );

  const coverSrc = addCacheBust(
    sanitizeImageUrl(
      coverPhotoPreview ||
        userData.coverPhoto
    )
  );

  const initials =
    userData.name
      ?.charAt(0)
      .toUpperCase() || '?';

  const hasAvatarImg =
    Boolean(avatarSrc);

  const hasCoverImg =
    Boolean(coverSrc);

  const TABS = [
    {
      id: 'Posts',
      label: 'Published',
      count: posts.length,
      icon: (
        <IoDocumentTextOutline
          size={15}
          aria-hidden="true"
        />
      )
    },
    {
      id: 'Draft',
      label: 'Drafts',
      count: drafts.length,
      icon: (
        <IoCreateOutline
          size={15}
          aria-hidden="true"
        />
      )
    },
    {
      id: 'Favorite',
      label: 'Favorites',
      count: favorites.length,
      icon: (
        <IoHeart
          size={14}
          aria-hidden="true"
        />
      )
    }
  ];

  return (
    <div className="pf-page">
      <header className="pf-cover-section">
        <div className="pf-cover-wrapper">
          <div
            className={`pf-cover-bg${
              hasCoverImg
                ? ' pf-cover-bg--has-image'
                : ''
            }`}
            style={
              hasCoverImg
                ? {
                    backgroundImage:
                      `url(${coverSrc})`
                  }
                : undefined
            }
            role="img"
            aria-label={
              hasCoverImg
                ? 'Foto sampul profil'
                : undefined
            }
          >
            {!hasCoverImg && (
              <>
                <div
                  className="pf-cover-mesh"
                  aria-hidden="true"
                />
                <div
                  className="pf-cover-orb pf-cover-orb--1"
                  aria-hidden="true"
                />
                <div
                  className="pf-cover-orb pf-cover-orb--2"
                  aria-hidden="true"
                />
                <div
                  className="pf-cover-orb pf-cover-orb--3"
                  aria-hidden="true"
                />
                <div
                  className="pf-cover-grid-lines"
                  aria-hidden="true"
                />
              </>
            )}
          </div>

          <div
            className="pf-cover-gradient"
            aria-hidden="true"
          />

          <div
            className="pf-cover-shine"
            aria-hidden="true"
          />
        </div>
      </header>

      <section
        className="pf-card-section"
        aria-label="Informasi profil"
      >
        <div className="pf-card">
          <div className="pf-card-avatar-wrap">
            <button
              className="pf-avatar-trigger"
              onClick={openModal}
              aria-label="Ganti foto profil"
              type="button"
            >
              <div className="pf-avatar-ring">
                {hasAvatarImg ? (
                  <img
                    className="pf-avatar-img-tag"
                    src={avatarSrc}
                    alt={`Foto profil ${userData.name}`}
                    width={112}
                    height={112}
                  />
                ) : (
                  <div
                    className="pf-avatar-img pf-avatar-img--fallback"
                    aria-hidden="true"
                  >
                    <span
                      className="pf-avatar-initial"
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              <span
                className="pf-avatar-badge"
                aria-hidden="true"
              >
                <IoCameraOutline size={11} />
              </span>
            </button>
          </div>

          <div className="pf-card-info">
            <h1 className="pf-card-name">
              {userData.name}
            </h1>

            <div className="pf-card-tags">
              <span className="pf-tag">
                <IoSparkles
                  size={11}
                  aria-hidden="true"
                />
                {userData.profession}
              </span>

              {isStudent(
                userData.profession
              ) &&
                userData.schoolName && (
                  <span className="pf-tag pf-tag--sub">
                    <IoSchoolOutline
                      size={11}
                      aria-hidden="true"
                    />
                    {userData.schoolName}
                  </span>
                )}
            </div>

            {userData.bio && (
              <p className="pf-card-bio">
                {userData.bio}
              </p>
            )}

            <div className="pf-card-meta-row">
              {userData.email && (
                <span className="pf-meta-email">
                  {userData.email}
                </span>
              )}
            </div>

            {Array.isArray(
              userData.interest
            ) &&
              userData.interest.length >
                0 && (
                <div
                  className="pf-interest-pills"
                  aria-label="Minat"
                >
                  {userData.interest.map(
                    (it) => (
                      <span
                        key={it}
                        className="pf-interest-pill"
                      >
                        {it}
                      </span>
                    )
                  )}
                </div>
              )}

            <button
              className="pf-edit-profile-btn"
              onClick={openModal}
              type="button"
            >
              <IoPencilSharp
                size={13}
                aria-hidden="true"
              />
              <span>Edit Profil</span>
            </button>
          </div>
        </div>
      </section>

      <main
        className="pf-main"
        id="pf-main-content"
      >
        {error && (
          <div
            className="pf-error-banner"
            role="alert"
          >
            <IoAlertCircle
              size={18}
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        {!profileData.isComplete && (
          <div
            className="pf-completion-card"
            role="status"
          >
            <div className="pf-comp-header">
              <div
                className="pf-comp-icon-wrap"
                aria-hidden="true"
              >
                <IoSparkles size={14} />
              </div>

              <div className="pf-comp-text">
                <h4>
                  Lengkapi Profilmu
                </h4>
                <p>
                  {profileData.remaining}{' '}
                  langkah lagi untuk
                  profil sempurna
                </p>
              </div>
            </div>

            <div className="pf-comp-footer">
              <div
                className="pf-comp-progress"
                role="progressbar"
                aria-valuenow={
                  profileData.percent
                }
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Kelengkapan profil ${profileData.percent}%`}
              >
                <div className="pf-comp-bar">
                  <div
                    className="pf-comp-fill"
                    style={{
                      width: `${profileData.percent}%`
                    }}
                  />
                </div>

                <span className="pf-comp-pct">
                  {profileData.percent}%
                </span>
              </div>

              <button
                className="pf-comp-btn"
                onClick={openModal}
                type="button"
              >
                Lengkapi
                <IoArrowForward
                  size={12}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        )}

        <nav
          className="pf-tabs"
          role="tablist"
          aria-label="Konten profil"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`pf-tab ${
                activeTab === tab.id
                  ? 'pf-tab--active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(tab.id)
              }
              type="button"
              role="tab"
              aria-selected={
                activeTab === tab.id
              }
              aria-controls={`pf-tabpanel-${tab.id}`}
              id={`pf-tab-${tab.id}`}
            >
              <span className="pf-tab-icon">
                {tab.icon}
              </span>

              <span className="pf-tab-label">
                {tab.label}
              </span>

              {tab.count > 0 && (
                <span
                  className="pf-tab-count"
                  aria-label={`${tab.count} item`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <section className="pf-tab-content">
          {activeTab === 'Posts' &&
            (posts.length > 0 ? (
              <div
                className="pf-grid"
                role="tabpanel"
                id="pf-tabpanel-Posts"
                aria-labelledby="pf-tab-Posts"
              >
                {posts.map((p, i) => (
                  <ArticleCard
                    key={p.id}
                    data={p}
                    idx={i}
                    type="post"
                    onReport={() =>
                      setReportTarget({
                        id: p.id,
                        title: p.title
                      })
                    }
                    onDelete={() =>
                      setDeleteTarget({
                        id: p.id,
                        type: 'post',
                        title: p.title
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={
                  <IoDocumentTextOutline
                    size={26}
                    aria-hidden="true"
                  />
                }
                msg="Belum ada artikel yang diterbitkan."
                sub="Mulai bagikan ceritamu kepada dunia."
                cta="Tulis Artikel Pertama"
                onClick={() =>
                  navigate('/write')
                }
              />
            ))}

          {activeTab === 'Draft' &&
            (drafts.length > 0 ? (
              <div
                className="pf-grid"
                role="tabpanel"
                id="pf-tabpanel-Draft"
                aria-labelledby="pf-tab-Draft"
              >
                {drafts.map((d, i) => (
                  <ArticleCard
                    key={d.id}
                    data={d}
                    idx={i}
                    type="draft"
                    onDelete={() =>
                      setDeleteTarget({
                        id: d.id,
                        type: 'draft',
                        title: d.title
                      })
                    }
                    onEdit={() =>
                      navigate('/write', {
                        state: {
                          draft: d
                        }
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={
                  <IoCreateOutline
                    size={26}
                    aria-hidden="true"
                  />
                }
                msg="Belum ada draft."
                sub="Ide-ide mu menunggu untuk ditulis."
                cta="Mulai Menulis"
                onClick={() =>
                  navigate('/write')
                }
              />
            ))}

          {activeTab === 'Favorite' &&
            (favorites.length > 0 ? (
              <div
                className="pf-grid"
                role="tabpanel"
                id="pf-tabpanel-Favorite"
                aria-labelledby="pf-tab-Favorite"
              >
                {favorites.map((f, i) => (
                  <ArticleCard
                    key={f.id}
                    data={f}
                    idx={i}
                    type="favorite"
                    userName={
                      f.author?.name
                    }
                    onDelete={() =>
                      setDeleteTarget({
                        id: f.id,
                        type: 'favorite',
                        title: f.title
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={
                  <IoBookmarkOutline
                    size={26}
                    aria-hidden="true"
                  />
                }
                msg="Belum ada artikel favorit."
                sub="Simpan artikel yang kamu suka untuk dibaca nanti."
              />
            ))}
        </section>
      </main>

      {isEditModalOpen && (
        <div
          className="pf-overlay"
          onClick={() =>
            !saving &&
            setIsEditModalOpen(false)
          }
          role="dialog"
          aria-modal="true"
          aria-label="Edit profil"
        >
          <div
            className="pf-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="pf-modal-head">
              <div>
                <h2 id="pf-modal-title">
                  Edit Profil
                </h2>

                <p id="pf-modal-desc">
                  Perbarui informasi publik
                  kamu
                </p>
              </div>

              <button
                className="pf-modal-close"
                onClick={() =>
                  !saving &&
                  setIsEditModalOpen(false)
                }
                aria-label="Tutup dialog edit profil"
                type="button"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="pf-modal-body">
              <div className="pf-fm-avatar-section">
                <div
                  className={`pf-fm-avatar-display${
                    avatarSrc
                      ? ' pf-fm-avatar-display--has-preview'
                      : ''
                  }`}
                  onClick={() =>
                    document
                      .getElementById(
                        'pf-avatar-input'
                      )
                      ?.click()
                  }
                  role="button"
                  tabIndex={0}
                  aria-label="Pilih foto profil baru"
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' ||
                      e.key === ' '
                    ) {
                      e.preventDefault();

                      document
                        .getElementById(
                          'pf-avatar-input'
                        )
                        ?.click();
                    }
                  }}
                >
                  {avatarSrc ? (
                    <img
                      className="pf-fm-avatar-circle-img"
                      src={avatarSrc}
                      alt="Preview foto profil"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <div
                      className="pf-fm-avatar-circle"
                      aria-hidden="true"
                    >
                      <span>
                        {initials}
                      </span>
                    </div>
                  )}

                  <div
                    className="pf-fm-avatar-overlay"
                    aria-hidden="true"
                  >
                    <IoCameraOutline size={20} />
                    <span>
                      Ganti Foto
                    </span>
                  </div>

                  <input
                    id="pf-avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={
                      handleAvatarChange
                    }
                    hidden
                    tabIndex={-1}
                  />
                </div>

                {avatarFile && (
                  <div
                    className="pf-fm-file-status pf-fm-file-status--success"
                    role="status"
                  >
                    <IoCheckmarkDoneOutline
                      size={13}
                      aria-hidden="true"
                    />
                    <span>
                      {avatarFile.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="pf-fm-group">
                <label
                  className="pf-fm-label"
                  id="pf-label-cover"
                >
                  Foto Sampul
                </label>

                <div
                  className={`pf-fm-cover-area${
                    hasCoverImg
                      ? ' pf-fm-cover-area--has-preview'
                      : ''
                  }`}
                  onClick={() =>
                    document
                      .getElementById(
                        'pf-cover-input'
                      )
                      ?.click()
                  }
                  role="button"
                  tabIndex={0}
                  aria-labelledby="pf-label-cover"
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' ||
                      e.key === ' '
                    ) {
                      e.preventDefault();

                      document
                        .getElementById(
                          'pf-cover-input'
                        )
                        ?.click();
                    }
                  }}
                >
                  {hasCoverImg ? (
                    <>
                      <img
                        className="pf-fm-cover-img-tag"
                        src={coverSrc}
                        alt="Preview foto sampul"
                        loading="lazy"
                      />

                      <div
                        className="pf-fm-cover-overlay"
                        aria-hidden="true"
                      >
                        <IoImagesOutline size={16} />
                        <span>
                          Ganti Sampul
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="pf-fm-cover-empty">
                      <IoImagesOutline
                        size={22}
                        aria-hidden="true"
                      />
                      <span>
                        Pilih Foto Sampul
                      </span>
                      <small>
                        JPG, PNG, atau WEBP —
                        Maks 5MB
                      </small>
                    </div>
                  )}

                  <input
                    id="pf-cover-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleCoverPhotoChange
                    }
                    hidden
                    tabIndex={-1}
                  />
                </div>

                {coverPhotoFile && (
                  <div
                    className="pf-fm-file-status pf-fm-file-status--success"
                    role="status"
                  >
                    <IoCheckmarkDoneOutline
                      size={13}
                      aria-hidden="true"
                    />
                    <span>
                      {coverPhotoFile.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="pf-fm-group">
                <label
                  className="pf-fm-label"
                  htmlFor="pf-input-name"
                >
                  Nama Lengkap
                </label>

                <input
                  id="pf-input-name"
                  className="pf-fm-input"
                  value={tempData.name}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      name: e.target.value
                    })
                  }
                  placeholder="Nama kamu"
                  autoComplete="name"
                  maxLength={100}
                />
              </div>

              <div className="pf-fm-group">
                <label
                  className="pf-fm-label"
                  htmlFor="pf-input-bio"
                >
                  Bio
                </label>

                <textarea
                  id="pf-input-bio"
                  className="pf-fm-input pf-fm-textarea"
                  value={tempData.bio}
                  rows={3}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      bio: e.target.value
                    })
                  }
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  maxLength={500}
                />
              </div>

              <div className="pf-fm-row">
                <div className="pf-fm-group">
                  <label
                    className="pf-fm-label"
                    htmlFor="pf-select-profession"
                  >
                    Profesi
                  </label>

                  <select
                    id="pf-select-profession"
                    className="pf-fm-input pf-fm-select"
                    value={
                      tempData.profession
                    }
                    onChange={(e) => {
                      const v =
                        e.target.value;

                      setTempData({
                        ...tempData,
                        profession: v,
                        schoolName:
                          isStudent(v)
                            ? tempData.schoolName
                            : ''
                      });
                    }}
                  >
                    {daftarProfession.map(
                      (p) => (
                        <option
                          key={p}
                          value={p}
                        >
                          {p}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {isStudent(
                  tempData.profession
                ) && (
                  <div className="pf-fm-group">
                    <label
                      className="pf-fm-label"
                      htmlFor="pf-input-school"
                    >
                      {tempData.profession ===
                      'Pelajar'
                        ? 'Asal Sekolah'
                        : 'Asal Kampus'}
                    </label>

                    <input
                      id="pf-input-school"
                      className="pf-fm-input"
                      value={
                        tempData.schoolName
                      }
                      onChange={(e) =>
                        setTempData({
                          ...tempData,
                          schoolName:
                            e.target.value
                        })
                      }
                      placeholder={
                        tempData.profession ===
                        'Pelajar'
                          ? 'Nama sekolah'
                          : 'Nama kampus'
                      }
                      maxLength={150}
                    />
                  </div>
                )}
              </div>

              <div className="pf-fm-group">
                <span
                  className="pf-fm-label"
                  id="pf-label-interest"
                >
                  Minat
                </span>

                <div
                  className="pf-fm-chips"
                  role="group"
                  aria-labelledby="pf-label-interest"
                >
                  {pilihanInterest.map(
                    (it) => (
                      <button
                        type="button"
                        key={it}
                        className={`pf-fm-chip ${
                          (
                            tempData.interest ||
                            []
                          ).includes(it)
                            ? 'pf-fm-chip--on'
                            : ''
                        }`}
                        onClick={() =>
                          toggleInterest(it)
                        }
                        aria-pressed={(
                          tempData.interest ||
                          []
                        ).includes(it)}
                      >
                        {it}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="pf-modal-foot">
              <button
                className="pf-btn-ghost"
                onClick={() =>
                  !saving &&
                  setIsEditModalOpen(false)
                }
                disabled={saving}
                type="button"
              >
                Batal
              </button>

              <button
                className="pf-btn-primary"
                onClick={
                  handleSaveProfile
                }
                disabled={saving}
                type="button"
              >
                {saving ? (
                  <>
                    <span
                      className="pf-spinner"
                      aria-hidden="true"
                    />
                    <span>
                      Menyimpan...
                    </span>
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget.id && (
        <div
          className="pf-overlay"
          onClick={clearDelete}
          role="alertdialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus artikel"
          aria-describedby="pf-delete-desc"
        >
          <div
            className="pf-dialog"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className="pf-dialog-icon pf-dialog-icon--danger"
              aria-hidden="true"
            >
              <IoTrashOutline size={22} />
            </div>

            <h3>
              Hapus Artikel?
            </h3>

            <p id="pf-delete-desc">
              "
              <strong>
                {deleteTarget.title}
              </strong>
              " akan dihapus permanen dan
              tidak bisa dikembalikan.
            </p>

            <div className="pf-dialog-actions">
              <button
                className="pf-btn-ghost"
                onClick={clearDelete}
                disabled={deleting}
                type="button"
              >
                Batal
              </button>

              <button
                className="pf-btn-danger"
                onClick={
                  handleDeleteArticle
                }
                disabled={deleting}
                type="button"
              >
                {deleting ? (
                  <>
                    <span
                      className="pf-spinner"
                      aria-hidden="true"
                    />
                    <span>
                      Menghapus...
                    </span>
                  </>
                ) : (
                  'Hapus Permanen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportTarget.id && (
        <div
          className="pf-overlay"
          onClick={clearReport}
          role="dialog"
          aria-modal="true"
          aria-label="Laporkan artikel"
          aria-describedby="pf-report-desc"
        >
          <div
            className="pf-dialog"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className="pf-dialog-icon"
              aria-hidden="true"
            >
              <IoFlagOutline size={22} />
            </div>

            <h3>
              Laporkan Artikel
            </h3>

            <p id="pf-report-desc">
              "
              <strong>
                {reportTarget.title}
              </strong>
              "
            </p>

            <label
              htmlFor="pf-report-textarea"
              className="pf-sr-only"
            >
              Alasan pelaporan
            </label>

            <textarea
              id="pf-report-textarea"
              className="pf-dialog-textarea"
              placeholder="Jelaskan alasan pelaporan..."
              value={reportReason}
              onChange={(e) =>
                setReportReason(
                  e.target.value
                )
              }
              rows={4}
              maxLength={1000}
            />

            <div className="pf-dialog-actions">
              <button
                className="pf-btn-ghost"
                onClick={clearReport}
                disabled={reporting}
                type="button"
              >
                Batal
              </button>

              <button
                className="pf-btn-primary"
                onClick={
                  handleReportArticle
                }
                disabled={
                  reporting ||
                  !reportReason.trim()
                }
                type="button"
              >
                {reporting ? (
                  <>
                    <span
                      className="pf-spinner"
                      aria-hidden="true"
                    />
                    <span>
                      Mengirim...
                    </span>
                  </>
                ) : (
                  'Kirim Laporan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`pf-toast${
            toast.type === 'error'
              ? ' pf-toast--error'
              : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.type === 'success' ? (
            <IoCheckmarkCircle
              size={16}
              aria-hidden="true"
            />
          ) : (
            <IoAlertCircle
              size={16}
              aria-hidden="true"
            />
          )}

          <span>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
};

const ArticleCard = React.memo(
  ({
    data,
    type,
    idx = 0,
    onDelete,
    onEdit,
    onReport,
    userName
  }) => {
    const date = data.createdAt
      ? new Date(
          data.createdAt
        ).toLocaleDateString(
          'id-ID',
          {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }
        )
      : '';

    const isDraft =
      type === 'draft';

    const sanitizedImage =
      sanitizeImageUrl(
        data.image
      );

    return (
      <article
        className="pf-article-card"
        style={{
          animationDelay: `${
            idx * 0.07
          }s`
        }}
      >
        <div className="pf-ac-thumb">
          {sanitizedImage ? (
            <img
              src={sanitizedImage}
              alt={
                data.title
                  ? `Thumbnail artikel: ${data.title}`
                  : 'Thumbnail artikel'
              }
              loading="lazy"
              width={320}
              height={180}
            />
          ) : (
            <div
              className="pf-ac-thumb-ph"
              aria-hidden="true"
            >
              <IoDocumentTextOutline
                size={24}
              />
            </div>
          )}

          {data.category && (
            <span className="pf-ac-cat">
              {data.category}
            </span>
          )}

          {isDraft && (
            <span className="pf-ac-draft-badge">
              Draft
            </span>
          )}
        </div>

        <div className="pf-ac-body">
          <div className="pf-ac-meta">
            <span>
              {data.category ||
                'Umum'}
            </span>

            <span
              className="pf-ac-dot"
              aria-hidden="true"
            />

            <time
              dateTime={
                data.createdAt ||
                undefined
              }
            >
              {date}
            </time>

            {userName && (
              <>
                <span
                  className="pf-ac-dot"
                  aria-hidden="true"
                />

                <span>
                  {userName}
                </span>
              </>
            )}
          </div>

          <h3 className="pf-ac-title">
            {data.title ||
              'Tanpa Judul'}
          </h3>

          <div className="pf-ac-footer">
            {type === 'post' ||
            type === 'favorite' ? (
              <Link
                to={`/article/${data.slug}`}
                className="pf-ac-read"
              >
                Baca
                <IoArrowForward
                  size={12}
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <button
                className="pf-ac-read"
                onClick={onEdit}
                type="button"
              >
                Lanjutkan
                <IoArrowForward
                  size={12}
                  aria-hidden="true"
                />
              </button>
            )}

            <div className="pf-ac-actions">
              {onReport &&
                type === 'post' && (
                  <button
                    className="pf-ac-act"
                    onClick={onReport}
                    title="Laporkan"
                    aria-label={`Laporkan artikel: ${
                      data.title ||
                      'Tanpa Judul'
                    }`}
                    type="button"
                  >
                    <IoFlagOutline
                      size={13}
                    />
                  </button>
                )}

              {onDelete && (
                <button
                  className="pf-ac-act pf-ac-act--danger"
                  onClick={onDelete}
                  title="Hapus"
                  aria-label={`Hapus artikel: ${
                    data.title ||
                    'Tanpa Judul'
                  }`}
                  type="button"
                >
                  <IoTrashOutline
                    size={13}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }
);

ArticleCard.displayName =
  'ArticleCard';

const EmptyState = ({
  icon,
  msg,
  sub,
  cta,
  onClick
}) => (
  <div className="pf-empty">
    <div
      className="pf-empty-icon"
      aria-hidden="true"
    >
      {icon}
    </div>

    <p className="pf-empty-title">
      {msg}
    </p>

    {sub && (
      <p className="pf-empty-desc">
        {sub}
      </p>
    )}

    {cta && (
      <button
        className="pf-btn-primary pf-empty-cta"
        onClick={onClick}
        type="button"
      >
        {cta}
        <IoArrowForward
          size={13}
          aria-hidden="true"
        />
      </button>
    )}
  </div>
);

const ProfileSkeleton = () => (
  <div
    className="pf-page"
    aria-busy="true"
    aria-label="Memuat profil"
  >
    <header className="pf-cover-section">
      <div className="pf-cover-wrapper">
        <div
          className="pf-cover-bg pf-skel-dark"
          aria-hidden="true"
        />
      </div>
    </header>

    <section
      className="pf-card-section"
      aria-hidden="true"
    >
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

    <main
      className="pf-main"
      aria-hidden="true"
    >
      <div className="pf-skel-bar w100 h6 mb16" />

      <div className="pf-grid">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="pf-article-card pf-skel-card"
          >
            <div className="pf-skel-thumb" />

            <div
              className="pf-ac-body"
              style={{
                padding: 14
              }}
            >
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