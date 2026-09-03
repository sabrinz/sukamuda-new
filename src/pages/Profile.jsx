import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

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
} from "react-icons/io5";

import { useAuth } from "../context/AuthContext";
import axios, { ensureCsrfToken } from "../utils/axiosConfig";

import "./Profile.css";

/* =========================================================
   CONSTANTS
   ========================================================= */

const DEFAULT_PROFESSION = "Content Writer";

const PROFESSIONS = [
  "Content Writer",
  "Blogger",
  "Freelance Writer",
  "Contributor",
  "Mahasiswa",
  "Pelajar",
  "Other",
];

const INTERESTS = [
  "News",
  "Lifestyle",
  "Music & Film",
  "Health",
  "Hobby",
  "Science",
  "Sport",
  "Gadget",
  "Automotive",
];

const STUDENT_PROFESSIONS = ["Pelajar", "Mahasiswa", "Pelajar/Mahasiswa"];

const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

/* =========================================================
   HELPERS
   ========================================================= */

const isStudent = (profession) =>
  STUDENT_PROFESSIONS.includes(String(profession || "").trim());

const getApiBaseUrl = () => {
  const value = (import.meta.env?.VITE_API_URL || "https://sukamuda.co.id")
    .toString()
    .trim();

  return value.replace(/\/+$/, "");
};

const API_BASE_URL = getApiBaseUrl();

const isAbsoluteHttpUrl = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const sanitizeImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const original = value.trim();

  if (!original) {
    return "";
  }

  if (original.startsWith("data:") || original.startsWith("blob:")) {
    return original;
  }

  if (isAbsoluteHttpUrl(original)) {
    try {
      const url = new URL(original);

      /*
       * Jika URL sudah menuju storage,
       * jangan tambahkan storage lagi.
       */
      return url.toString();
    } catch {
      return "";
    }
  }

  /*
   * Normalisasi slash di awal.
   */
  const normalized = original.replace(/^\/+/, "");

  /*
   * Sudah path storage.
   */
  if (normalized.startsWith("storage/")) {
    return `${API_BASE_URL}/${normalized}`;
  }

  /*
   * Path umum dari backend.
   */
  return `${API_BASE_URL}/storage/${normalized}`;
};

const addCacheBust = (url, version) => {
  if (!url || url.startsWith("blob:")) {
    return url || "";
  }

  if (!version) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${encodeURIComponent(String(version))}`;
};

const getInitials = (name) => {
  const value = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return value || "?";
};

const getArticleSlug = (article) => {
  if (!article) {
    return "";
  }

  return String(article.slug || article.url_slug || "").trim();
};

const getArticleId = (article) => {
  if (!article) {
    return null;
  }

  return article.id ?? article.article_id ?? null;
};

const getArticleDate = (article) =>
  article?.createdAt ||
  article?.created_at ||
  article?.publishedAt ||
  article?.published_at ||
  "";

const getArticleImage = (article) =>
  article?.image || article?.thumbnail || article?.thumbnail_url || "";

const validateImageFile = (file, allowedTypes) => {
  if (!file) {
    return {
      valid: false,
      reason: "Tidak ada file.",
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      reason: "Format tidak didukung. Gunakan JPG, PNG, WEBP.",
    };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      valid: false,
      reason: "Ukuran maksimal 5 MB.",
    };
  }

  return {
    valid: true,
    reason: "",
  };
};

const createPreviewUrl = (file) => {
  if (!file) {
    return "";
  }

  return URL.createObjectURL(file);
};

/* =========================================================
   PROFILE DATA NORMALIZATION
   ========================================================= */

const normalizeProfileResponse = (data) => {
  if (!data) {
    return null;
  }

  return {
    name: data.name || "User",

    email: data.email || "",

    bio: data.bio || "",

    profession: data.profession || DEFAULT_PROFESSION,

    schoolName: data.schoolName ?? data.school_name ?? "",

    interest: Array.isArray(data.interests)
      ? data.interests
      : Array.isArray(data.interest)
        ? data.interest
        : [],

    avatar: data.avatar || data.profile_photo_url || data.profilePhotoUrl || "",

    coverPhoto:
      data.coverPhoto ?? data.cover_photo ?? data.cover_photo_url ?? "",
  };
};

/* =========================================================
   PROFILE
   ========================================================= */

const Profile = () => {
  const { updateUser } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  /* =======================================================
     STATE
     ======================================================= */

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("Posts");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [error, setError] = useState(null);

  const [toast, setToast] = useState(null);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    profession: DEFAULT_PROFESSION,
    schoolName: "",
    interest: [],
    avatar: "",
    coverPhoto: "",
  });

  const [tempData, setTempData] = useState(userData);

  const [posts, setPosts] = useState([]);

  const [drafts, setDrafts] = useState([]);

  const [favorites, setFavorites] = useState([]);

  const [avatarFile, setAvatarFile] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);

  const [coverPhotoFile, setCoverPhotoFile] = useState(null);

  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);

  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState({
    id: null,
    type: null,
    title: "",
  });

  const [deleting, setDeleting] = useState(false);

  const [reportTarget, setReportTarget] = useState({
    id: null,
    title: "",
  });

  const [reportReason, setReportReason] = useState("");

  const [reporting, setReporting] = useState(false);

  const [imageVersion, setImageVersion] = useState(null);

  /* =======================================================
     REFS
     ======================================================= */

  const avatarPreviewRef = useRef(null);

  const coverPreviewRef = useRef(null);

  const toastTimerRef = useRef(null);

  const loadingRef = useRef(false);

  const modalRef = useRef(null);

  const modalCloseRef = useRef(null);

  /* =======================================================
     TOAST
     ======================================================= */

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({
      message,
      type,
    });

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  /* =======================================================
     OBJECT URL CLEANUP
     ======================================================= */

  const revokeAvatarPreview = useCallback(() => {
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);

      avatarPreviewRef.current = null;
    }

    setAvatarPreview(null);
  }, []);

  const revokeCoverPreview = useCallback(() => {
    if (coverPreviewRef.current) {
      URL.revokeObjectURL(coverPreviewRef.current);

      coverPreviewRef.current = null;
    }

    setCoverPhotoPreview(null);
  }, []);

  /* =======================================================
     MODAL CLEANUP
     ======================================================= */

  const closeEditModal = useCallback(() => {
    if (saving) {
      return;
    }

    setIsEditModalOpen(false);

    revokeAvatarPreview();
    revokeCoverPreview();

    setAvatarFile(null);
    setCoverPhotoFile(null);
  }, [saving, revokeAvatarPreview, revokeCoverPreview]);

  /* =======================================================
     DELETE / REPORT RESET
     ======================================================= */

  const clearDelete = useCallback(() => {
    if (deleting) {
      return;
    }

    setDeleteTarget({
      id: null,
      type: null,
      title: "",
    });
  }, [deleting]);

  const clearReport = useCallback(() => {
    if (reporting) {
      return;
    }

    setReportTarget({
      id: null,
      title: "",
    });

    setReportReason("");
  }, [reporting]);

  /* =======================================================
     TOAST / PREVIEW GLOBAL CLEANUP
     ======================================================= */

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }

      if (coverPreviewRef.current) {
        URL.revokeObjectURL(coverPreviewRef.current);
      }
    };
  }, []);

  /* =======================================================
     PROFILE COMPLETION
     ======================================================= */

  const profileData = useMemo(() => {
    const needsSchool = isStudent(userData.profession);

    const checks = [
      Boolean(String(userData.profession || "").trim()),

      needsSchool ? Boolean(String(userData.schoolName || "").trim()) : true,

      Array.isArray(userData.interest) && userData.interest.length > 0,

      Boolean(String(userData.bio || "").trim()),
    ];

    const completed = checks.filter(Boolean).length;

    return {
      percent: Math.round((completed / checks.length) * 100),
      isComplete: completed === checks.length,
      remaining: checks.length - completed,
    };
  }, [userData]);

  /* =======================================================
     LOAD PROFILE
     ======================================================= */

  const loadProfile = useCallback(
    async (signal) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;

      try {
        setError(null);

        const response = await axios.get("/api/profile", { signal });

        const rawData = response?.data?.data;

        if (!rawData) {
          throw new Error("Data profil tidak tersedia.");
        }

        const normalized = normalizeProfileResponse(rawData);

        if (!normalized) {
          throw new Error("Data profil tidak valid.");
        }

        setUserData(normalized);

        setTempData(normalized);

        const safeArray = (value) => (Array.isArray(value) ? value : []);

        setPosts(
          safeArray(rawData.posts || rawData.published || rawData.articles),
        );

        setDrafts(safeArray(rawData.drafts));

        setFavorites(safeArray(rawData.favorites));

        updateUser({
          name: normalized.name,

          email: normalized.email,

          avatar: normalized.avatar,

          profile_photo_url: normalized.avatar,
        });

        setImageVersion(Date.now());
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
          return;
        }

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil data profil.";

        setError(message);
      } finally {
        loadingRef.current = false;
      }
    },
    [updateUser],
  );

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const initialize = async () => {
      await loadProfile(controller.signal);

      if (active) {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadProfile]);

  /* =======================================================
     OPEN EDIT FROM NAVIGATION STATE
     ======================================================= */

  useEffect(() => {
    if (loading || !location.state?.openEditProfile) {
      return;
    }

    openEditModal();

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [loading, location.pathname, location.state, navigate]);

  /* =======================================================
     BODY LOCK
     ======================================================= */

  useEffect(() => {
    const hasModal =
      isEditModalOpen || Boolean(deleteTarget.id) || Boolean(reportTarget.id);

    if (!hasModal) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEditModalOpen, deleteTarget.id, reportTarget.id]);

  /* =======================================================
     ESCAPE KEY + MODAL FOCUS
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isEditModalOpen && !saving) {
          closeEditModal();
          return;
        }

        if (deleteTarget.id) {
          clearDelete();
          return;
        }

        if (reportTarget.id) {
          clearReport();
        }

        return;
      }

      /*
       * Basic focus trap untuk modal utama.
       */
      if (event.key !== "Tab" || !isEditModalOpen || !modalRef.current) {
        return;
      }

      const focusable = modalRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditModalOpen,
    saving,
    deleteTarget.id,
    reportTarget.id,
    closeEditModal,
    clearDelete,
    clearReport,
  ]);

  useEffect(() => {
    if (isEditModalOpen && modalCloseRef.current) {
      window.setTimeout(() => {
        modalCloseRef.current?.focus();
      }, 0);
    }
  }, [isEditModalOpen]);

  /* =======================================================
     EDIT MODAL
     ======================================================= */

  const openEditModal = useCallback(() => {
    setTempData(userData);

    revokeAvatarPreview();
    revokeCoverPreview();

    setAvatarFile(null);
    setCoverPhotoFile(null);

    setIsEditModalOpen(true);
  }, [userData, revokeAvatarPreview, revokeCoverPreview]);

  /* =======================================================
     INTEREST
     ======================================================= */

  const toggleInterest = useCallback((interest) => {
    setTempData((previous) => {
      const current = Array.isArray(previous.interest) ? previous.interest : [];

      const next = current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest];

      return {
        ...previous,
        interest: next,
      };
    });
  }, []);

  /* =======================================================
     AVATAR CHANGE
     ======================================================= */

  const handleAvatarChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const validation = validateImageFile(file, ALLOWED_AVATAR_TYPES);

      if (!validation.valid) {
        showToast(validation.reason, "error");

        event.target.value = "";

        return;
      }

      revokeAvatarPreview();

      const preview = createPreviewUrl(file);

      avatarPreviewRef.current = preview;

      setAvatarFile(file);
      setAvatarPreview(preview);
    },
    [showToast, revokeAvatarPreview],
  );

  /* =======================================================
     COVER CHANGE
     ======================================================= */

  const handleCoverPhotoChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const validation = validateImageFile(file, ALLOWED_COVER_TYPES);

      if (!validation.valid) {
        showToast(validation.reason, "error");

        event.target.value = "";

        return;
      }

      revokeCoverPreview();

      const preview = createPreviewUrl(file);

      coverPreviewRef.current = preview;

      setCoverPhotoFile(file);
      setCoverPhotoPreview(preview);
    },
    [showToast, revokeCoverPreview],
  );

  /* =======================================================
     SAVE PROFILE
     ======================================================= */

  const handleSaveProfile = useCallback(async () => {
    const name = String(tempData.name || "").trim();

    if (!name) {
      showToast("Nama tidak boleh kosong.", "error");

      return;
    }

    const profession = String(tempData.profession || DEFAULT_PROFESSION).trim();

    const interests = Array.isArray(tempData.interest) ? tempData.interest : [];

    setSaving(true);

    try {
      await ensureCsrfToken();

      const formData = new FormData();

      formData.append("name", name);

      formData.append("bio", String(tempData.bio || ""));

      formData.append("profession", profession);

      formData.append(
        "schoolName",
        isStudent(profession) ? String(tempData.schoolName || "") : "",
      );

      interests.forEach((interest) => {
        formData.append("interests[]", String(interest));
      });

      if (avatarFile) {
        formData.append("avatarFile", avatarFile);
      }

      if (coverPhotoFile) {
        formData.append("coverPhotoFile", coverPhotoFile);
      }

      await axios.post("/api/profile", formData);

      await loadProfile();

      setImageVersion(Date.now());

      setIsEditModalOpen(false);

      revokeAvatarPreview();
      revokeCoverPreview();

      setAvatarFile(null);
      setCoverPhotoFile(null);

      showToast("Profil berhasil diperbarui.", "success");
    } catch (err) {
      const message = err?.response?.data?.message || "Gagal menyimpan profil.";

      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }, [
    tempData,
    avatarFile,
    coverPhotoFile,
    loadProfile,
    revokeAvatarPreview,
    revokeCoverPreview,
    showToast,
  ]);

  /* =======================================================
     DELETE ARTICLE
     ======================================================= */

  const handleDeleteArticle = useCallback(async () => {
    if (!deleteTarget.id) {
      return;
    }

    setDeleting(true);

    try {
      await ensureCsrfToken();

      await axios.delete(
        `/api/articles/${encodeURIComponent(String(deleteTarget.id))}`,
      );

      const targetId = String(deleteTarget.id);

      const removeById = (items) =>
        items.filter((item) => String(getArticleId(item)) !== targetId);

      if (deleteTarget.type === "post") {
        setPosts(removeById(posts));
      }

      if (deleteTarget.type === "draft") {
        setDrafts(removeById(drafts));
      }

      setDeleteTarget({
        id: null,
        type: null,
        title: "",
      });

      showToast("Artikel berhasil dihapus.", "success");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Gagal menghapus artikel.";

      showToast(message, "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, posts, drafts, showToast]);

  /* =======================================================
     REPORT ARTICLE
     ======================================================= */

  const handleReportArticle = useCallback(async () => {
    const trimmedReason = String(reportReason || "").trim();

    if (!reportTarget.id || !trimmedReason) {
      return;
    }

    setReporting(true);

    try {
      await ensureCsrfToken();

      await axios.post("/api/reports", {
        article_id: reportTarget.id,

        reason: trimmedReason,
      });

      setReportTarget({
        id: null,
        title: "",
      });

      setReportReason("");

      showToast("Laporan berhasil dikirim.", "success");
    } catch (err) {
      const message = err?.response?.data?.message || "Gagal mengirim laporan.";

      showToast(message, "error");
    } finally {
      setReporting(false);
    }
  }, [reportTarget.id, reportReason, showToast]);

  /* =======================================================
     URLS
     ======================================================= */

  const avatarSrc = useMemo(() => {
    const source = avatarPreview || userData.avatar || "";

    return addCacheBust(
      source.startsWith("blob:") ? source : sanitizeImageUrl(source),
      imageVersion,
    );
  }, [avatarPreview, userData.avatar, imageVersion]);

  const coverSrc = useMemo(() => {
    const source = coverPhotoPreview || userData.coverPhoto || "";

    return addCacheBust(
      source.startsWith("blob:") ? source : sanitizeImageUrl(source),
      imageVersion,
    );
  }, [coverPhotoPreview, userData.coverPhoto, imageVersion]);

  const hasAvatarImg = Boolean(avatarSrc);

  const hasCoverImg = Boolean(coverSrc);

  const initials = getInitials(userData.name);

  /* =======================================================
     TABS
     ======================================================= */

  const tabs = useMemo(
    () => [
      {
        id: "Posts",
        label: "Published",
        count: posts.length,
        icon: <IoDocumentTextOutline size={15} aria-hidden="true" />,
      },

      {
        id: "Draft",
        label: "Drafts",
        count: drafts.length,
        icon: <IoCreateOutline size={15} aria-hidden="true" />,
      },

      {
        id: "Favorite",
        label: "Favorites",
        count: favorites.length,
        icon: <IoHeart size={14} aria-hidden="true" />,
      },
    ],
    [posts.length, drafts.length, favorites.length],
  );

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return <ProfileSkeleton />;
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="pf-page">
      {/* ===================================================
          COVER
          =================================================== */}

      <header className="pf-cover-section">
        <div className="pf-cover-wrapper">
          <div
            className={`pf-cover-bg${
              hasCoverImg ? " pf-cover-bg--has-image" : ""
            }`}
            style={
              hasCoverImg
                ? {
                    backgroundImage: `url("${coverSrc}")`,
                  }
                : undefined
            }
            role={hasCoverImg ? "img" : undefined}
            aria-label={hasCoverImg ? "Foto sampul profil" : undefined}
          >
            {!hasCoverImg && (
              <>
                <div className="pf-cover-mesh" aria-hidden="true" />

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

                <div className="pf-cover-grid-lines" aria-hidden="true" />
              </>
            )}
          </div>

          <div className="pf-cover-gradient" aria-hidden="true" />

          <div className="pf-cover-shine" aria-hidden="true" />
        </div>
      </header>

      {/* ===================================================
          PROFILE CARD
          =================================================== */}

      <section className="pf-card-section" aria-label="Informasi profil">
        <div className="pf-card">
          <div className="pf-card-avatar-wrap">
            <button
              className="pf-avatar-trigger"
              onClick={openEditModal}
              aria-label="Ganti foto profil"
              type="button"
            >
              <div className="pf-avatar-ring">
                {hasAvatarImg ? (
                  <img
                    className="pf-avatar-img-tag"
                    src={avatarSrc}
                    alt={`Foto profil ${userData.name}`}
                    width="112"
                    height="112"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div
                    className="pf-avatar-img pf-avatar-img--fallback"
                    aria-hidden="true"
                  >
                    <span className="pf-avatar-initial">{initials}</span>
                  </div>
                )}
              </div>

              <span className="pf-avatar-badge" aria-hidden="true">
                <IoCameraOutline size={11} />
              </span>
            </button>
          </div>

          <div className="pf-card-info">
            <h1 className="pf-card-name">{userData.name}</h1>

            <div className="pf-card-tags">
              {userData.profession && (
                <span className="pf-tag">
                  <IoSparkles size={11} aria-hidden="true" />

                  {userData.profession}
                </span>
              )}

              {isStudent(userData.profession) && userData.schoolName && (
                <span className="pf-tag pf-tag--sub">
                  <IoSchoolOutline size={11} aria-hidden="true" />

                  {userData.schoolName}
                </span>
              )}
            </div>

            {userData.bio && <p className="pf-card-bio">{userData.bio}</p>}

            {userData.email && (
              <div className="pf-card-meta-row">
                <span className="pf-meta-email">{userData.email}</span>
              </div>
            )}

            {Array.isArray(userData.interest) &&
              userData.interest.length > 0 && (
                <div className="pf-interest-pills" aria-label="Minat">
                  {userData.interest.map((interest) => (
                    <span key={interest} className="pf-interest-pill">
                      {interest}
                    </span>
                  ))}
                </div>
              )}

            <button
              className="pf-edit-profile-btn"
              onClick={openEditModal}
              type="button"
            >
              <IoPencilSharp size={13} aria-hidden="true" />

              <span>Edit Profil</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN
          =================================================== */}

      <main className="pf-main" id="pf-main-content">
        {error && (
          <div className="pf-error-banner" role="alert">
            <IoAlertCircle size={18} aria-hidden="true" />

            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            PROFILE COMPLETION
            ================================================= */}

        {!profileData.isComplete && (
          <div className="pf-completion-card" role="status">
            <div className="pf-comp-header">
              <div className="pf-comp-icon-wrap" aria-hidden="true">
                <IoSparkles size={14} />
              </div>

              <div className="pf-comp-text">
                <h4>Lengkapi Profilmu</h4>

                <p>
                  {profileData.remaining} langkah lagi untuk profil lebih
                  lengkap
                </p>
              </div>
            </div>

            <div className="pf-comp-footer">
              <div
                className="pf-comp-progress"
                role="progressbar"
                aria-valuenow={profileData.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Kelengkapan profil ${profileData.percent}%`}
              >
                <div className="pf-comp-bar">
                  <div
                    className="pf-comp-fill"
                    style={{
                      width: `${profileData.percent}%`,
                    }}
                  />
                </div>

                <span className="pf-comp-pct">{profileData.percent}%</span>
              </div>

              <button
                className="pf-comp-btn"
                onClick={openEditModal}
                type="button"
              >
                Lengkapi
                <IoArrowForward size={12} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            TABS
            ================================================= */}

        <nav className="pf-tabs" role="tablist" aria-label="Konten profil">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                className={`pf-tab${active ? " pf-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`pf-tabpanel-${tab.id}`}
                id={`pf-tab-${tab.id}`}
              >
                <span className="pf-tab-icon">{tab.icon}</span>

                <span className="pf-tab-label">{tab.label}</span>

                {tab.count > 0 && (
                  <span
                    className="pf-tab-count"
                    aria-label={`${tab.count} item`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* =================================================
            POSTS
            ================================================= */}

        {activeTab === "Posts" && (
          <section
            className="pf-tab-content"
            role="tabpanel"
            id="pf-tabpanel-Posts"
            aria-labelledby="pf-tab-Posts"
          >
            {posts.length > 0 ? (
              <div className="pf-grid">
                {posts.map((post, index) => (
                  <ArticleCard
                    key={getArticleId(post) ?? `post-${index}`}
                    data={post}
                    idx={index}
                    type="post"
                    onReport={() =>
                      setReportTarget({
                        id: getArticleId(post),
                        title: post.title || "Tanpa Judul",
                      })
                    }
                    onDelete={() =>
                      setDeleteTarget({
                        id: getArticleId(post),
                        type: "post",
                        title: post.title || "Tanpa Judul",
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IoDocumentTextOutline size={26} aria-hidden="true" />}
                msg="Belum ada artikel yang diterbitkan."
                sub="Mulai bagikan ceritamu kepada pembaca."
                cta="Tulis Artikel Pertama"
                onClick={() => navigate("/write")}
              />
            )}
          </section>
        )}

        {/* =================================================
            DRAFTS
            ================================================= */}

        {activeTab === "Draft" && (
          <section
            className="pf-tab-content"
            role="tabpanel"
            id="pf-tabpanel-Draft"
            aria-labelledby="pf-tab-Draft"
          >
            {drafts.length > 0 ? (
              <div className="pf-grid">
                {drafts.map((draft, index) => (
                  <ArticleCard
                    key={getArticleId(draft) ?? `draft-${index}`}
                    data={draft}
                    idx={index}
                    type="draft"
                    onDelete={() =>
                      setDeleteTarget({
                        id: getArticleId(draft),
                        type: "draft",
                        title: draft.title || "Tanpa Judul",
                      })
                    }
                    onEdit={() =>
                      navigate("/write", {
                        state: {
                          draft,
                        },
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IoCreateOutline size={26} aria-hidden="true" />}
                msg="Belum ada draft."
                sub="Ide-ide kamu menunggu untuk ditulis."
                cta="Mulai Menulis"
                onClick={() => navigate("/write")}
              />
            )}
          </section>
        )}

        {/* =================================================
            FAVORITES
            ================================================= */}

        {activeTab === "Favorite" && (
          <section
            className="pf-tab-content"
            role="tabpanel"
            id="pf-tabpanel-Favorite"
            aria-labelledby="pf-tab-Favorite"
          >
            {favorites.length > 0 ? (
              <div className="pf-grid">
                {favorites.map((favorite, index) => (
                  <ArticleCard
                    key={getArticleId(favorite) ?? `favorite-${index}`}
                    data={favorite}
                    idx={index}
                    type="favorite"
                    userName={
                      favorite.author?.name || favorite.user?.name || ""
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IoBookmarkOutline size={26} aria-hidden="true" />}
                msg="Belum ada artikel favorit."
                sub="Simpan artikel yang kamu suka untuk dibaca nanti."
              />
            )}
          </section>
        )}
      </main>

      {/* ===================================================
          EDIT PROFILE MODAL
          =================================================== */}

      {isEditModalOpen && (
        <div
          className="pf-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pf-modal-title"
          aria-describedby="pf-modal-desc"
        >
          <div ref={modalRef} className="pf-modal">
            <div className="pf-modal-head">
              <div>
                <h2 id="pf-modal-title">Edit Profil</h2>

                <p id="pf-modal-desc">Perbarui informasi publik kamu.</p>
              </div>

              <button
                ref={modalCloseRef}
                className="pf-modal-close"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Tutup dialog edit profil"
                type="button"
              >
                <IoCloseOutline size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="pf-modal-body">
              {/* AVATAR */}

              <div className="pf-fm-avatar-section">
                <div
                  className={`pf-fm-avatar-display${
                    avatarSrc ? " pf-fm-avatar-display--has-preview" : ""
                  }`}
                  onClick={() =>
                    document.getElementById("pf-avatar-input")?.click()
                  }
                  role="button"
                  tabIndex={0}
                  aria-label="Pilih foto profil baru"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();

                      document.getElementById("pf-avatar-input")?.click();
                    }
                  }}
                >
                  {avatarSrc ? (
                    <img
                      className="pf-fm-avatar-circle-img"
                      src={avatarSrc}
                      alt="Preview foto profil"
                      width="96"
                      height="96"
                    />
                  ) : (
                    <div className="pf-fm-avatar-circle" aria-hidden="true">
                      <span>{initials}</span>
                    </div>
                  )}

                  <div className="pf-fm-avatar-overlay" aria-hidden="true">
                    <IoCameraOutline size={20} />

                    <span>Ganti Foto</span>
                  </div>

                  <input
                    id="pf-avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarChange}
                    hidden
                    tabIndex={-1}
                  />
                </div>

                {avatarFile && (
                  <div
                    className="pf-fm-file-status pf-fm-file-status--success"
                    role="status"
                  >
                    <IoCheckmarkDoneOutline size={13} aria-hidden="true" />

                    <span>{avatarFile.name}</span>
                  </div>
                )}
              </div>

              {/* COVER */}

              <div className="pf-fm-group">
                <label className="pf-fm-label" id="pf-label-cover">
                  Foto Sampul
                </label>

                <div
                  className={`pf-fm-cover-area${
                    coverSrc ? " pf-fm-cover-area--has-preview" : ""
                  }`}
                  onClick={() =>
                    document.getElementById("pf-cover-input")?.click()
                  }
                  role="button"
                  tabIndex={0}
                  aria-labelledby="pf-label-cover"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();

                      document.getElementById("pf-cover-input")?.click();
                    }
                  }}
                >
                  {coverSrc ? (
                    <>
                      <img
                        className="pf-fm-cover-img-tag"
                        src={coverSrc}
                        alt="Preview foto sampul"
                        loading="lazy"
                        decoding="async"
                      />

                      <div className="pf-fm-cover-overlay" aria-hidden="true">
                        <IoImagesOutline size={16} />

                        <span>Ganti Sampul</span>
                      </div>
                    </>
                  ) : (
                    <div className="pf-fm-cover-empty">
                      <IoImagesOutline size={22} aria-hidden="true" />

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
                    tabIndex={-1}
                  />
                </div>

                {coverPhotoFile && (
                  <div
                    className="pf-fm-file-status pf-fm-file-status--success"
                    role="status"
                  >
                    <IoCheckmarkDoneOutline size={13} aria-hidden="true" />

                    <span>{coverPhotoFile.name}</span>
                  </div>
                )}
              </div>

              {/* NAME */}

              <div className="pf-fm-group">
                <label className="pf-fm-label" htmlFor="pf-input-name">
                  Nama Lengkap
                </label>

                <input
                  id="pf-input-name"
                  className="pf-fm-input"
                  value={tempData.name}
                  onChange={(event) =>
                    setTempData((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Nama kamu"
                  autoComplete="name"
                  maxLength={100}
                />
              </div>

              {/* BIO */}

              <div className="pf-fm-group">
                <label className="pf-fm-label" htmlFor="pf-input-bio">
                  Bio
                </label>

                <textarea
                  id="pf-input-bio"
                  className="pf-fm-input pf-fm-textarea"
                  value={tempData.bio}
                  rows={3}
                  onChange={(event) =>
                    setTempData((previous) => ({
                      ...previous,
                      bio: event.target.value,
                    }))
                  }
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  maxLength={500}
                />
              </div>

              {/* PROFESSION / SCHOOL */}

              <div className="pf-fm-row">
                <div className="pf-fm-group">
                  <label className="pf-fm-label" htmlFor="pf-select-profession">
                    Profesi
                  </label>

                  <select
                    id="pf-select-profession"
                    className="pf-fm-input pf-fm-select"
                    value={tempData.profession}
                    onChange={(event) => {
                      const value = event.target.value;

                      setTempData((previous) => ({
                        ...previous,
                        profession: value,
                        schoolName: isStudent(value) ? previous.schoolName : "",
                      }));
                    }}
                  >
                    {PROFESSIONS.map((profession) => (
                      <option key={profession} value={profession}>
                        {profession}
                      </option>
                    ))}
                  </select>
                </div>

                {isStudent(tempData.profession) && (
                  <div className="pf-fm-group">
                    <label className="pf-fm-label" htmlFor="pf-input-school">
                      {tempData.profession === "Pelajar"
                        ? "Asal Sekolah"
                        : "Asal Kampus"}
                    </label>

                    <input
                      id="pf-input-school"
                      className="pf-fm-input"
                      value={tempData.schoolName}
                      onChange={(event) =>
                        setTempData((previous) => ({
                          ...previous,
                          schoolName: event.target.value,
                        }))
                      }
                      placeholder={
                        tempData.profession === "Pelajar"
                          ? "Nama sekolah"
                          : "Nama kampus"
                      }
                      maxLength={150}
                    />
                  </div>
                )}
              </div>

              {/* INTERESTS */}

              <div className="pf-fm-group">
                <span className="pf-fm-label" id="pf-label-interest">
                  Minat
                </span>

                <div
                  className="pf-fm-chips"
                  role="group"
                  aria-labelledby="pf-label-interest"
                >
                  {INTERESTS.map((interest) => {
                    const active = (tempData.interest || []).includes(interest);

                    return (
                      <button
                        type="button"
                        key={interest}
                        className={`pf-fm-chip${
                          active ? " pf-fm-chip--on" : ""
                        }`}
                        onClick={() => toggleInterest(interest)}
                        aria-pressed={active}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FOOT */}

            <div className="pf-modal-foot">
              <button
                className="pf-btn-ghost"
                onClick={closeEditModal}
                disabled={saving}
                type="button"
              >
                Batal
              </button>

              <button
                className="pf-btn-primary"
                onClick={handleSaveProfile}
                disabled={saving}
                type="button"
              >
                {saving ? (
                  <>
                    <span className="pf-spinner" aria-hidden="true" />

                    <span>Menyimpan...</span>
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE DIALOG
          =================================================== */}

      {deleteTarget.id && (
        <div
          className="pf-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              clearDelete();
            }
          }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="pf-delete-title"
          aria-describedby="pf-delete-desc"
        >
          <div className="pf-dialog">
            <div
              className="pf-dialog-icon pf-dialog-icon--danger"
              aria-hidden="true"
            >
              <IoTrashOutline size={22} />
            </div>

            <h3 id="pf-delete-title">Hapus Artikel?</h3>

            <p id="pf-delete-desc">
              "<strong>{deleteTarget.title}</strong>" akan dihapus permanen dan
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
                onClick={handleDeleteArticle}
                disabled={deleting}
                type="button"
              >
                {deleting ? (
                  <>
                    <span className="pf-spinner" aria-hidden="true" />

                    <span>Menghapus...</span>
                  </>
                ) : (
                  "Hapus Permanen"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          REPORT DIALOG
          =================================================== */}

      {reportTarget.id && (
        <div
          className="pf-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              clearReport();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pf-report-title"
          aria-describedby="pf-report-desc"
        >
          <div className="pf-dialog">
            <div className="pf-dialog-icon" aria-hidden="true">
              <IoFlagOutline size={22} />
            </div>

            <h3 id="pf-report-title">Laporkan Artikel</h3>

            <p id="pf-report-desc">
              "<strong>{reportTarget.title}</strong>"
            </p>

            <label htmlFor="pf-report-textarea" className="pf-sr-only">
              Alasan pelaporan
            </label>

            <textarea
              id="pf-report-textarea"
              className="pf-dialog-textarea"
              placeholder="Jelaskan alasan pelaporan..."
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
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
                onClick={handleReportArticle}
                disabled={reporting || !reportReason.trim()}
                type="button"
              >
                {reporting ? (
                  <>
                    <span className="pf-spinner" aria-hidden="true" />

                    <span>Mengirim...</span>
                  </>
                ) : (
                  "Kirim Laporan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          TOAST
          =================================================== */}

      {toast && (
        <div
          className={`pf-toast${
            toast.type === "error" ? " pf-toast--error" : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.type === "success" ? (
            <IoCheckmarkCircle size={16} aria-hidden="true" />
          ) : (
            <IoAlertCircle size={16} aria-hidden="true" />
          )}

          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   ARTICLE CARD
   ========================================================= */

const ArticleCard = React.memo(
  ({ data, type, idx = 0, onDelete, onEdit, onReport, userName = "" }) => {
    const articleId = getArticleId(data);

    const slug = getArticleSlug(data);

    const dateValue = getArticleDate(data);

    const formattedDate = dateValue
      ? new Date(dateValue).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

    const articleImage = sanitizeImageUrl(getArticleImage(data));

    const isDraft = type === "draft";

    const isFavorite = type === "favorite";

    const title = data.title || "Tanpa Judul";

    const articleHref = slug ? `/article/${encodeURIComponent(slug)}` : "";

    const handleImageError = (event) => {
      event.currentTarget.onerror = null;

      event.currentTarget.style.display = "none";
    };

    return (
      <article
        className="pf-article-card"
        style={{
          animationDelay: `${idx * 0.07}s`,
        }}
      >
        <div className="pf-ac-thumb">
          {articleImage ? (
            <img
              src={articleImage}
              alt={`Thumbnail artikel: ${title}`}
              loading="lazy"
              decoding="async"
              width={320}
              height={180}
              onError={handleImageError}
            />
          ) : (
            <div className="pf-ac-thumb-ph" aria-hidden="true">
              <IoDocumentTextOutline size={24} />
            </div>
          )}

          {data.category && <span className="pf-ac-cat">{data.category}</span>}

          {isDraft && <span className="pf-ac-draft-badge">Draft</span>}
        </div>

        <div className="pf-ac-body">
          <div className="pf-ac-meta">
            <span>{data.category || "Umum"}</span>

            {formattedDate && (
              <>
                <span className="pf-ac-dot" aria-hidden="true" />

                <time dateTime={dateValue || undefined}>{formattedDate}</time>
              </>
            )}

            {userName && (
              <>
                <span className="pf-ac-dot" aria-hidden="true" />

                <span>{userName}</span>
              </>
            )}
          </div>

          <h3 className="pf-ac-title">{title}</h3>

          <div className="pf-ac-footer">
            {isDraft ? (
              <button className="pf-ac-read" onClick={onEdit} type="button">
                Lanjutkan
                <IoArrowForward size={12} aria-hidden="true" />
              </button>
            ) : slug ? (
              <Link to={articleHref} className="pf-ac-read">
                Baca
                <IoArrowForward size={12} aria-hidden="true" />
              </Link>
            ) : (
              <span className="pf-ac-read" aria-disabled="true">
                Tidak tersedia
              </span>
            )}

            <div className="pf-ac-actions">
              {onReport && type === "post" && articleId && (
                <button
                  className="pf-ac-act"
                  onClick={(event) => {
                    event.stopPropagation();
                    onReport();
                  }}
                  title="Laporkan"
                  aria-label={`Laporkan artikel: ${title}`}
                  type="button"
                >
                  <IoFlagOutline size={13} aria-hidden="true" />
                </button>
              )}

              {onDelete &&
                (type === "post" || type === "draft") &&
                articleId && (
                  <button
                    className="pf-ac-act pf-ac-act--danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete();
                    }}
                    title="Hapus"
                    aria-label={`Hapus artikel: ${title}`}
                    type="button"
                  >
                    <IoTrashOutline size={13} aria-hidden="true" />
                  </button>
                )}

              {isFavorite && (
                <span
                  className="pf-ac-favorite-mark"
                  aria-label="Artikel favorit"
                  title="Artikel favorit"
                >
                  <IoHeart size={13} aria-hidden="true" />
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  },
);

ArticleCard.displayName = "ArticleCard";

/* =========================================================
   EMPTY STATE
   ========================================================= */

const EmptyState = ({ icon, msg, sub, cta, onClick }) => (
  <div className="pf-empty">
    <div className="pf-empty-icon" aria-hidden="true">
      {icon}
    </div>

    <p className="pf-empty-title">{msg}</p>

    {sub && <p className="pf-empty-desc">{sub}</p>}

    {cta && (
      <button
        className="pf-btn-primary pf-empty-cta"
        onClick={onClick}
        type="button"
      >
        {cta}

        <IoArrowForward size={13} aria-hidden="true" />
      </button>
    )}
  </div>
);

/* =========================================================
   PROFILE SKELETON
   ========================================================= */

const ProfileSkeleton = () => (
  <div className="pf-page" aria-busy="true" aria-label="Memuat profil">
    <header className="pf-cover-section">
      <div className="pf-cover-wrapper">
        <div className="pf-cover-bg pf-skel-dark" aria-hidden="true" />
      </div>
    </header>

    <section className="pf-card-section" aria-hidden="true">
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

    <main className="pf-main" aria-hidden="true">
      <div className="pf-skel-bar w100 h6 mb16" />

      <div className="pf-grid">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="pf-article-card pf-skel-card">
            <div className="pf-skel-thumb" />

            <div
              className="pf-ac-body"
              style={{
                padding: 14,
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
