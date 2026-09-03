import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "../utils/axiosConfig";
import VideoReelForm from "./VideoReelForm";
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
  FaChevronRight,
} from "react-icons/fa";
import "./AdminVideoReels.css";

const PAGE_SIZE = 15;
const PLATFORM_COLORS = {
  instagram: "#e4405f",
  tiktok: "#010101",
  facebook: "#1877f2",
  youtube: "#ff0000",
};
const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
};

const isCanceled = (error) =>
  error?.code === "ERR_CANCELED" || axios.isCancel?.(error) === true;

const safeUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const base =
      typeof window === "undefined"
        ? "https://sukamuda.co.id"
        : window.location.origin;
    const url = new URL(raw, base);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};

const ToastIcon = ({ type }) => {
  if (type === "success") return <FaCheckCircle aria-hidden="true" />;
  if (type === "error") return <FaTimesCircle aria-hidden="true" />;
  if (type === "warning") return <FaExclamationTriangle aria-hidden="true" />;
  return <FaInfoCircle aria-hidden="true" />;
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div
    className="av-toast-container"
    aria-live="polite"
    aria-relevant="additions removals"
  >
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`av-toast av-toast-${toast.type} ${toast.exiting ? "av-toast-exit" : ""}`}
        role={toast.type === "error" ? "alert" : "status"}
      >
        <span className="av-toast-icon">
          <ToastIcon type={toast.type} />
        </span>
        <span className="av-toast-message">{toast.message}</span>
        <button
          type="button"
          className="av-toast-close"
          onClick={() => onRemove(toast.id)}
          aria-label="Tutup notifikasi"
        >
          <FaTimes aria-hidden="true" />
        </button>
      </div>
    ))}
  </div>
);

const ConfirmModal = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) => {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => cancelRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll(
          "button:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
        ),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
      previousFocus.current?.focus?.();
    };
  }, [loading, onCancel, open]);

  if (!open) return null;
  return (
    <div
      className="av-modal-backdrop"
      onMouseDown={(event) => {
        if (!loading && event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="av-modal-box"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="av-modal-title"
        aria-describedby="av-modal-message"
        tabIndex={-1}
      >
        <div className="av-modal-icon" aria-hidden="true">
          <FaExclamationTriangle />
        </div>
        <h3 id="av-modal-title">{title}</h3>
        <p id="av-modal-message">{message}</p>
        <div className="av-modal-actions">
          <button
            ref={cancelRef}
            type="button"
            className="av-modal-btn av-modal-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="button"
            className="av-modal-btn av-modal-btn-danger"
            onClick={onConfirm}
            disabled={loading || typeof onConfirm !== "function"}
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonTable = () => (
  <div className="reels-table-wrapper" aria-hidden="true">
    <table className="reels-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Thumbnail</th>
          <th>Judul</th>
          <th>Platform</th>
          <th>Status</th>
          <th>Penulis</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, index) => (
          <tr key={index}>
            <td>
              <div className="av-skel av-skel-index" />
            </td>
            <td>
              <div className="av-skel av-skel-thumb" />
            </td>
            <td>
              <div className="av-skel av-skel-text" />
            </td>
            <td>
              <div className="av-skel av-skel-badge" />
            </td>
            <td>
              <div className="av-skel av-skel-badge" />
            </td>
            <td>
              <div className="av-skel av-skel-text-short" />
            </td>
            <td>
              <div className="av-skel av-skel-actions" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const pageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);
  if (current <= 3) end = 5;
  if (current >= total - 2) start = total - 4;
  return [
    1,
    ...(start > 2 ? ["a"] : []),
    ...Array.from({ length: end - start + 1 }, (_, index) => start + index),
    ...(end < total - 1 ? ["b"] : []),
    total,
  ];
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = useMemo(
    () => pageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Navigasi halaman">
      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Halaman sebelumnya"
      >
        <FaChevronLeft aria-hidden="true" />
      </button>
      {pages.map((page) =>
        typeof page === "string" ? (
          <span key={page} className="pagination-ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            type="button"
            key={page}
            className={`pagination-btn ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-label={`Halaman ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ),
      )}
      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Halaman berikutnya"
      >
        <FaChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
};

const Thumbnail = ({ url, title }) => {
  const source = useMemo(() => safeUrl(url), [url]);
  const [failed, setFailed] = useState("");
  return (
    <div className="thumbnail-cell">
      {source && failed !== source ? (
        <img
          src={source}
          alt={title ? `Thumbnail ${title}` : "Thumbnail video"}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(source)}
        />
      ) : (
        <div
          className="placeholder-thumb"
          aria-label="Thumbnail tidak tersedia"
        >
          <FaImage aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

const AdminVideoReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReel, setEditingReel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [actionLoading, setActionLoading] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
    loading: false,
  });
  const toastId = useRef(0);
  const timers = useRef(new Set());
  const requestId = useRef(0);

  const schedule = useCallback((fn, delay) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      fn();
    }, delay);
    timers.current.add(timer);
  }, []);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    [],
  );

  const removeToast = useCallback(
    (id) => {
      setToasts((items) =>
        items.map((item) =>
          item.id === id ? { ...item, exiting: true } : item,
        ),
      );
      schedule(
        () => setToasts((items) => items.filter((item) => item.id !== id)),
        260,
      );
    },
    [schedule],
  );

  const addToast = useCallback(
    (message, type = "info") => {
      const id = ++toastId.current;
      setToasts((items) => [...items, { id, message, type, exiting: false }]);
      schedule(() => removeToast(id), 3200);
    },
    [removeToast, schedule],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const closeConfirm = useCallback(() => {
    setConfirmModal((state) =>
      state.loading ? state : { ...state, open: false, onConfirm: null },
    );
  }, []);
  const forceCloseConfirm = useCallback(() => {
    setConfirmModal({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
      loading: false,
    });
  }, []);

  const fetchReels = useCallback(
    async (signal) => {
      const id = ++requestId.current;
      setLoading(true);
      try {
        const params = { page: currentPage };
        if (filterStatus !== "all") params.status = filterStatus;
        if (filterPlatform !== "all") params.platform = filterPlatform;
        if (debouncedSearch) params.search = debouncedSearch;
        const response = await axios.get("/api/video-reels/admin/all", {
          params,
          signal,
        });
        if (id !== requestId.current) return;
        const data = response?.data || {};
        const lastPage = Math.max(1, Number(data.last_page) || 1);
        setReels(Array.isArray(data.data) ? data.data : []);
        setTotalPages(lastPage);
        setPerPage(Math.max(1, Number(data.per_page) || PAGE_SIZE));
        if (currentPage > lastPage) setCurrentPage(lastPage);
      } catch (error) {
        if (!isCanceled(error)) {
          console.error("Error fetching reels:", error);
          addToast("Gagal mengambil data video reels", "error");
        }
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [addToast, currentPage, debouncedSearch, filterPlatform, filterStatus],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchReels(controller.signal);
    return () => controller.abort();
  }, [fetchReels]);

  const refresh = useCallback(() => fetchReels(), [fetchReels]);
  const updateStatus = useCallback(
    async (id, action) => {
      setActionLoading(id);
      try {
        await axios.patch(
          `/api/video-reels/${encodeURIComponent(id)}/${action}`,
          {},
        );
        addToast(
          action === "approve" ? "Video reel disetujui" : "Video reel ditolak",
          action === "approve" ? "success" : "warning",
        );
        await refresh();
      } catch (error) {
        console.error(error);
        addToast(
          action === "approve"
            ? "Gagal menyetujui video reel"
            : "Gagal menolak video reel",
          "error",
        );
      } finally {
        setActionLoading(null);
      }
    },
    [addToast, refresh],
  );

  const askDelete = useCallback(
    (id, title) => {
      setConfirmModal({
        open: true,
        title: "Hapus Video Reel",
        message: `Apakah Anda yakin ingin menghapus “${title || "video ini"}”? Tindakan ini tidak dapat dibatalkan.`,
        loading: false,
        onConfirm: async () => {
          setConfirmModal((state) => ({ ...state, loading: true }));
          setActionLoading(id);
          try {
            await axios.delete(`/api/video-reels/${encodeURIComponent(id)}`);
            forceCloseConfirm();
            addToast("Video reel berhasil dihapus", "success");
            await refresh();
          } catch (error) {
            console.error(error);
            forceCloseConfirm();
            addToast("Gagal menghapus video reel", "error");
          } finally {
            setActionLoading(null);
          }
        },
      });
    },
    [addToast, forceCloseConfirm, refresh],
  );

  const closeForm = () => {
    setShowForm(false);
    setEditingReel(null);
  };
  const formSuccess = () => {
    addToast(
      editingReel
        ? "Video reel berhasil diperbarui"
        : "Video reel berhasil ditambahkan",
      "success",
    );
    closeForm();
    refresh();
  };

  return (
    <div className="admin-video-reels-root">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmModal {...confirmModal} onCancel={closeConfirm} />
      <section
        className="admin-video-reels-container"
        aria-labelledby="admin-video-title"
        aria-busy={loading}
      >
        <header className="admin-video-reels-header">
          <h2 id="admin-video-title">Manajemen Video Reels</h2>
          {!showForm && (
            <button
              type="button"
              className="btn-add-reel"
              onClick={() => {
                setEditingReel(null);
                setShowForm(true);
              }}
            >
              <FaVideo aria-hidden="true" />
              Tambah Video Reel
            </button>
          )}
        </header>

        {showForm && (
          <div className="form-section">
            <VideoReelForm initialData={editingReel} onSuccess={formSuccess} />
            <button
              type="button"
              className="btn-close-form"
              onClick={closeForm}
            >
              <FaTimes aria-hidden="true" />
              Tutup Form
            </button>
          </div>
        )}

        <div className="admin-toolbar">
          <div className="search-boxx">
            <input
              type="search"
              placeholder="Cari judul atau deskripsi..."
              aria-label="Cari judul atau deskripsi video reel"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="toolbar-right">
            <select
              value={filterStatus}
              onChange={(event) => {
                setFilterStatus(event.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
              aria-label="Filter status"
            >
              <option value="all">Semua Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={filterPlatform}
              onChange={(event) => {
                setFilterPlatform(event.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
              aria-label="Filter platform"
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
          <>
            <span className="av-sr-only" role="status">
              Memuat data video reels…
            </span>
            <SkeletonTable />
          </>
        )}
        {!loading && reels.length === 0 && (
          <div className="empty-state" role="status">
            <div className="empty-state-icon" aria-hidden="true">
              <FaVideo />
            </div>
            <p>Belum ada video reel</p>
            <p className="empty-state-sub">
              Mulai tambahkan video reel pertama Anda
            </p>
          </div>
        )}

        {!loading && reels.length > 0 && (
          <div className="reels-table-wrapper">
            <table className="reels-table">
              <caption className="av-sr-only">Daftar video reels</caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Thumbnail</th>
                  <th scope="col">Judul</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Status</th>
                  <th scope="col">Penulis</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reels.map((reel, index) => {
                  const title = String(reel?.title || "Tanpa judul");
                  const platform = String(
                    reel?.platform || "unknown",
                  ).toLowerCase();
                  const status = String(
                    reel?.status || "unknown",
                  ).toLowerCase();
                  const link = safeUrl(reel?.video_url);
                  const busy = actionLoading !== null;
                  return (
                    <tr key={reel.id}>
                      <td>
                        <span className="av-row-index">
                          {(currentPage - 1) * perPage + index + 1}
                        </span>
                      </td>
                      <td>
                        <Thumbnail url={reel.thumbnail_url} title={title} />
                      </td>
                      <td>
                        <div className="title-cell">
                          {link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {title}
                            </a>
                          ) : (
                            <span className="title-cell-text">{title}</span>
                          )}
                          {reel.description && (
                            <p className="description-preview">
                              {reel.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className="platform-badge"
                          style={{
                            backgroundColor:
                              PLATFORM_COLORS[platform] || "#64748b",
                          }}
                        >
                          {platform}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${STATUS_LABELS[status] ? status : "unknown"}`}
                        >
                          {STATUS_LABELS[status] || status}
                        </span>
                      </td>
                      <td>
                        <div className="av-author">
                          <span className="av-author-name">
                            {reel.user?.name || "Unknown"}
                          </span>
                          {reel.user?.id != null && (
                            <span className="av-author-id">
                              ID: {reel.user.id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn-edit"
                            disabled={busy}
                            data-tooltip="Edit"
                            aria-label={`Edit ${title}`}
                            onClick={() => {
                              setEditingReel(reel);
                              setShowForm(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            <FaEdit aria-hidden="true" />
                          </button>
                          {status === "draft" && (
                            <button
                              type="button"
                              className="btn-approve"
                              disabled={busy}
                              data-tooltip="Setujui"
                              aria-label={`Setujui ${title}`}
                              onClick={() => updateStatus(reel.id, "approve")}
                            >
                              <FaCheck aria-hidden="true" />
                            </button>
                          )}
                          {status === "active" && (
                            <button
                              type="button"
                              className="btn-reject"
                              disabled={busy}
                              data-tooltip="Tolak"
                              aria-label={`Tolak ${title}`}
                              onClick={() => updateStatus(reel.id, "reject")}
                            >
                              <FaTimes aria-hidden="true" />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-delete"
                            disabled={busy}
                            data-tooltip="Hapus"
                            aria-label={`Hapus ${title}`}
                            onClick={() => askDelete(reel.id, title)}
                          >
                            <FaTrash aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>
    </div>
  );
};

export default AdminVideoReels;
