import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Link, useNavigate } from "react-router-dom";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  FaCheck,
  FaEye,
  FaPen,
  FaTimes,
  FaTrash,
  FaUndo,
} from "react-icons/fa";
import axios from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext";
import RejectionModal from "../components/RejectionModal";
import AdminVideoReels from "../components/AdminVideoReels";
import "./AdminDashboard.css";

const PAGE_SIZE = 15;
const COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#84cc16",
  "#a855f7",
  "#6b7280",
];
const CATEGORIES = [
  ["school", "School"],
  ["college", "College"],
  ["general", "General"],
  ["style", "Style"],
  ["culinary", "Culinary"],
  ["traveling", "Traveling"],
  ["sport", "Sport & E-Sport"],
  ["music", "Music & Film"],
  ["otomotif", "Otomotif"],
  ["science", "Science"],
  ["health", "Health"],
  ["tech", "Tech"],
  ["podcast", "Podcast"],
].map(([slug, label]) => ({ slug, label }));
const EMPTY_CONFIRM = {
  isOpen: false,
  type: "",
  article: null,
  title: "",
  description: "",
  loading: false,
};
const EMPTY_REJECTION = {
  isOpen: false,
  articleId: null,
  articleTitle: null,
  isLoading: false,
};

const isCanceled = (error) =>
  error?.code === "ERR_CANCELED" || axios.isCancel?.(error) === true;

const categoryLabel = (slug) => {
  const value = String(slug || "");
  return (
    CATEGORIES.find((item) => item.slug === value)?.label ||
    (value ? value.charAt(0).toUpperCase() + value.slice(1) : "Tanpa kategori")
  );
};

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

const articleImage = (article) => {
  const image = String(article?.image || "").trim();
  if (!image) return "https://placehold.co/150x150?text=SukaMuda";
  if (/^https?:\/\//i.test(image)) return safeUrl(image);
  return `https://sukamuda.co.id/storage/${image.replace(/^\/+/, "")}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("id-ID");
};

const ModalFrame = ({
  open,
  labelledBy,
  describedBy,
  onClose,
  locked,
  children,
  small,
}) => {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector("button, [href], [tabindex]:not([tabindex='-1'])")
        ?.focus();
    });
    const onKey = (event) => {
      if (event.key === "Escape" && !locked) {
        event.preventDefault();
        onClose();
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
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = oldOverflow;
      previousFocus.current?.focus?.();
    };
  }, [locked, onClose, open]);

  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (!locked && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`modal-content ${small ? "trending-modal" : ""}`}
        role={describedBy ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

const SkeletonRows = ({ columns = 7, count = 6 }) => (
  <>
    {Array.from({ length: count }, (_, row) => (
      <tr key={row} className="skeleton-row" aria-hidden="true">
        {Array.from({ length: columns }, (_, column) => (
          <td key={column}>
            <span className={`skeleton-b ${column === 1 ? "w60" : "w40"}`} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const ActionButton = ({ label, className = "", children, ...props }) => (
  <button
    type="button"
    className={`btn-action ${className}`}
    title={label}
    aria-label={label}
    {...props}
  >
    {children}
  </button>
);

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("articles");
  const [articles, setArticles] = useState([]);
  const [reports, setReports] = useState([]);
  const [trash, setTrash] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [trashLoading, setTrashLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  });
  const [previewArticle, setPreviewArticle] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [notice, setNotice] = useState("");
  const [confirmModal, setConfirmModal] = useState(EMPTY_CONFIRM);
  const [rejectionModal, setRejectionModal] = useState(EMPTY_REJECTION);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") navigate("/", { replace: true });
  }, [isLoggedIn, navigate, user?.role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const buildParams = useCallback(
    (includeStatus = true) => {
      const params = { page: currentPage };
      if (includeStatus && filterStatus !== "all") params.status = filterStatus;
      if (filterCategory !== "all") params.category = filterCategory;
      if (debouncedSearch) params.search = debouncedSearch;
      return params;
    },
    [currentPage, debouncedSearch, filterCategory, filterStatus],
  );

  const fetchArticles = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const response = await axios.get("/api/articles", {
          params: buildParams(true),
          signal,
        });
        const payload = response?.data || {};
        const rows = Array.isArray(payload.data) ? payload.data : [];
        const lastPage = Math.max(1, Number(payload.last_page) || 1);
        setArticles(rows);
        setTotalPages(lastPage);
        setPerPage(Math.max(1, Number(payload.per_page) || PAGE_SIZE));
        setStats((previous) => ({
          ...previous,
          ...(payload.stats && typeof payload.stats === "object"
            ? payload.stats
            : {}),
          total: Number(payload.total) || 0,
        }));
        if (currentPage > lastPage) setCurrentPage(lastPage);
      } catch (error) {
        if (!isCanceled(error)) {
          console.error("Gagal mengambil data berita:", error);
          setNotice("Gagal mengambil data berita.");
        }
      } finally {
        setLoading(false);
      }
    },
    [buildParams, currentPage],
  );

  const fetchTrash = useCallback(
    async (signal) => {
      setTrashLoading(true);
      try {
        const response = await axios.get("/api/articles/trash", {
          params: buildParams(false),
          signal,
        });
        const payload = response?.data || {};
        const lastPage = Math.max(1, Number(payload.last_page) || 1);
        setTrash(Array.isArray(payload.data) ? payload.data : []);
        setTotalPages(lastPage);
        setPerPage(Math.max(1, Number(payload.per_page) || PAGE_SIZE));
        if (currentPage > lastPage) setCurrentPage(lastPage);
      } catch (error) {
        if (!isCanceled(error)) {
          console.error("Gagal mengambil sampah:", error);
          setNotice("Gagal mengambil data sampah artikel.");
        }
      } finally {
        setTrashLoading(false);
      }
    },
    [buildParams, currentPage],
  );

  const fetchReports = useCallback(async (signal) => {
    setReportsLoading(true);
    try {
      const response = await axios.get("/api/reports", { signal });
      setReports(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      if (!isCanceled(error)) {
        console.error("Gagal mengambil laporan:", error);
        setNotice("Gagal mengambil data laporan.");
      }
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const fetchChartStats = useCallback(async (signal) => {
    setStatsLoading(true);
    try {
      const response = await axios.get("/api/articles", {
        params: { status: "approved", per_page: 1000 },
        signal,
      });
      const rows = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      const counts = rows.reduce((result, article) => {
        if (article?.status === "approved") {
          const key = String(article.category || "general");
          result[key] = (result[key] || 0) + 1;
        }
        return result;
      }, {});
      const total = Object.values(counts).reduce(
        (sum, value) => sum + value,
        0,
      );
      setChartData(
        Object.entries(counts).map(([key, value]) => ({
          name: categoryLabel(key),
          value,
          percentage: total ? Number(((value / total) * 100).toFixed(1)) : 0,
        })),
      );
    } catch (error) {
      if (!isCanceled(error)) {
        console.error("Gagal mengambil statistik:", error);
        setNotice("Gagal mengambil data statistik.");
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin" || activeView === "video-reels")
      return undefined;
    const controller = new AbortController();
    setNotice("");
    if (activeView === "articles") fetchArticles(controller.signal);
    if (activeView === "trash") fetchTrash(controller.signal);
    if (activeView === "reports") fetchReports(controller.signal);
    if (activeView === "stats") fetchChartStats(controller.signal);
    return () => controller.abort();
  }, [
    activeView,
    fetchArticles,
    fetchChartStats,
    fetchReports,
    fetchTrash,
    isLoggedIn,
    user?.role,
  ]);

  const refreshActiveView = useCallback(async () => {
    if (activeView === "trash") return fetchTrash();
    if (activeView === "reports") return fetchReports();
    return fetchArticles();
  }, [activeView, fetchArticles, fetchReports, fetchTrash]);

  const invalidatePublic = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["publicArticles"] }),
      queryClient.invalidateQueries({ queryKey: ["article"] }),
    ]);
  }, [queryClient]);

  const updateStatus = useCallback(
    async (article, status) => {
      setActionLoading(article.id);
      setNotice("");
      try {
        await axios.patch(
          `/api/articles/${encodeURIComponent(article.id)}/status`,
          { status },
        );
        await Promise.all([refreshActiveView(), invalidatePublic()]);
        setNotice("Status artikel berhasil diperbarui.");
      } catch (error) {
        console.error(error);
        setNotice("Gagal memperbarui status artikel.");
      } finally {
        setActionLoading(null);
      }
    },
    [invalidatePublic, refreshActiveView],
  );

  const openConfirm = useCallback((type, article) => {
    const title = {
      trash: "Pindahkan ke sampah?",
      restore: "Pulihkan artikel?",
      permanent: "Hapus permanen dari sampah?",
    }[type];
    const description = {
      trash: "Artikel akan dipindahkan ke sampah dan dapat dipulihkan kembali.",
      restore: "Artikel akan dikembalikan ke status pending.",
      permanent: "Artikel akan dihapus permanen dan tidak dapat dikembalikan.",
    }[type];
    setConfirmModal({
      isOpen: true,
      type,
      article,
      title,
      description,
      loading: false,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal((current) => (current.loading ? current : EMPTY_CONFIRM));
  }, []);

  const runConfirmAction = useCallback(async () => {
    const { article, type } = confirmModal;
    if (!article?.id) return;
    setConfirmModal((current) => ({ ...current, loading: true }));
    setActionLoading(article.id);
    try {
      const id = encodeURIComponent(article.id);
      if (type === "trash") await axios.delete(`/api/articles/${id}`);
      if (type === "restore") await axios.patch(`/api/articles/${id}/restore`);
      if (type === "permanent")
        await axios.delete(`/api/articles/${id}/permanent`);
      await Promise.all([refreshActiveView(), invalidatePublic()]);
      setConfirmModal(EMPTY_CONFIRM);
      setNotice(
        type === "trash"
          ? "Artikel dipindahkan ke sampah."
          : type === "restore"
            ? "Artikel berhasil dipulihkan."
            : "Artikel berhasil dihapus permanen.",
      );
    } catch (error) {
      console.error(error);
      setConfirmModal((current) => ({ ...current, loading: false }));
      setNotice("Tindakan gagal diproses.");
    } finally {
      setActionLoading(null);
    }
  }, [confirmModal, invalidatePublic, refreshActiveView]);

  const confirmRejection = useCallback(
    async (reason) => {
      setRejectionModal((current) => ({ ...current, isLoading: true }));
      try {
        await axios.patch(
          `/api/articles/${encodeURIComponent(rejectionModal.articleId)}/status`,
          {
            status: "rejected",
            rejection_reason: reason,
          },
        );
        await Promise.all([fetchArticles(), invalidatePublic()]);
        setRejectionModal(EMPTY_REJECTION);
        setNotice("Artikel berhasil ditolak.");
      } catch (error) {
        console.error(error);
        setRejectionModal((current) => ({ ...current, isLoading: false }));
        setNotice("Gagal menolak artikel.");
      }
    },
    [fetchArticles, invalidatePublic, rejectionModal.articleId],
  );

  const switchView = (view) => {
    setActiveView(view);
    setCurrentPage(1);
    setNotice("");
  };

  const renderArticleRows = (items, mode = "articles") => {
    if ((mode === "articles" ? loading : trashLoading) && !items.length) {
      return <SkeletonRows columns={mode === "articles" ? 7 : 6} count={6} />;
    }
    if (!items.length) {
      return (
        <tr>
          <td colSpan={mode === "articles" ? 7 : 6} className="empty-state">
            {mode === "trash" ? "Sampah kosong" : "Tidak ada artikel ditemukan"}
          </td>
        </tr>
      );
    }
    return items.map((article, index) => {
      const title = String(article.title || "Tanpa judul");
      const busy = actionLoading !== null;
      return (
        <tr key={article.id}>
          <td className="cell-index">
            {(currentPage - 1) * perPage + index + 1}
          </td>
          <td>
            <div className="article-cell">
              <img
                src={articleImage(article)}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/150x150?text=SukaMuda";
                }}
              />
              <span>{title}</span>
            </div>
          </td>
          <td>{article.user?.name || "Anonim"}</td>
          <td>
            <span className="badge-category">
              {categoryLabel(article.category)}
            </span>
          </td>
          {mode === "articles" ? (
            <>
              <td>
                <span
                  className={`status-badge status-${["pending", "approved", "rejected"].includes(article.status) ? article.status : "unknown"}`}
                >
                  {String(article.status || "unknown").toUpperCase()}
                </span>
              </td>
              <td>
                <div className="action-group">
                  <ActionButton
                    label={`Preview ${title}`}
                    onClick={() => setPreviewArticle(article)}
                  >
                    <FaEye />
                  </ActionButton>
                  <ActionButton
                    label={`Edit ${title}`}
                    onClick={() =>
                      navigate("/write", {
                        state: { draft: article, returnPath: "/admin" },
                      })
                    }
                  >
                    <FaPen />
                  </ActionButton>
                  {article.status === "pending" && (
                    <>
                      <ActionButton
                        label={`Setujui ${title}`}
                        className="btn-approve"
                        disabled={busy}
                        onClick={() => updateStatus(article, "approved")}
                      >
                        <FaCheck />
                      </ActionButton>
                      <ActionButton
                        label={`Tolak ${title}`}
                        className="btn-reject"
                        disabled={busy}
                        onClick={() =>
                          setRejectionModal({
                            isOpen: true,
                            articleId: article.id,
                            articleTitle: title,
                            isLoading: false,
                          })
                        }
                      >
                        <FaTimes />
                      </ActionButton>
                    </>
                  )}
                  {article.status === "approved" && (
                    <ActionButton
                      label={`Tarik ${title} ke pending`}
                      disabled={busy}
                      onClick={() => updateStatus(article, "pending")}
                    >
                      <FaUndo />
                    </ActionButton>
                  )}
                  <ActionButton
                    label={`Pindahkan ${title} ke sampah`}
                    disabled={busy}
                    onClick={() => openConfirm("trash", article)}
                  >
                    <FaTrash />
                  </ActionButton>
                </div>
              </td>
              <td>
                <span className="views-cell">
                  <FaEye /> {article.views || 0}
                </span>
              </td>
            </>
          ) : (
            <>
              <td>{formatDate(article.deleted_at)}</td>
              <td>
                <div className="action-group">
                  <ActionButton
                    label={`Preview ${title}`}
                    onClick={() => setPreviewArticle(article)}
                  >
                    <FaEye />
                  </ActionButton>
                  <ActionButton
                    label={`Pulihkan ${title}`}
                    disabled={busy}
                    onClick={() => openConfirm("restore", article)}
                  >
                    <FaUndo />
                  </ActionButton>
                  <ActionButton
                    label={`Hapus permanen ${title}`}
                    className="btn-reject"
                    disabled={busy}
                    onClick={() => openConfirm("permanent", article)}
                  >
                    <FaTimes />
                  </ActionButton>
                </div>
              </td>
            </>
          )}
        </tr>
      );
    });
  };

  if (!isLoggedIn || user?.role !== "admin") return null;

  return (
    <main className="admin-dashboard-container">
      <header className="admin-header">
        <div className="admin-logo">
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <div>
            <h1>Panel Kendali</h1>
            <p>
              Halo <strong>{user?.name}</strong> — Kelola konten dengan presisi.
            </p>
          </div>
        </div>
        <nav
          className="admin-header-right"
          aria-label="Pilihan tampilan dashboard"
        >
          {["stats", "articles", "reports", "trash", "video-reels"].map(
            (view) => (
              <button
                key={view}
                type="button"
                className={`btn-view-toggle ${activeView === view ? "active" : ""}`}
                aria-pressed={activeView === view}
                onClick={() => switchView(view)}
              >
                {view === "stats"
                  ? "Statistik"
                  : view === "articles"
                    ? "Artikel"
                    : view === "reports"
                      ? `Laporan${reports.length ? ` (${reports.length})` : ""}`
                      : view === "trash"
                        ? `Sampah${trash.length ? ` (${trash.length})` : ""}`
                        : "Video Reels"}
              </button>
            ),
          )}
          <Link to="/write" className="btn-create-new">
            + Tulis Baru
          </Link>
        </nav>
      </header>

      {notice && (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      )}

      {activeView === "articles" && (
        <>
          <button
            type="button"
            className="stat-card stat-total"
            onClick={() => {
              setFilterStatus("all");
              setFilterCategory("all");
              setSearchQuery("");
              setCurrentPage(1);
            }}
          >
            <span className="stat-number">{loading ? "—" : stats.total}</span>
            <span className="stat-label">Total Artikel</span>
          </button>
          <div className="admin-toolbar">
            <div className="search-box">
              <input
                type="search"
                placeholder="Cari judul atau penulis..."
                aria-label="Cari judul atau penulis"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="toolbar-right">
              <select
                className="filter-select"
                aria-label="Filter status artikel"
                value={filterStatus}
                onChange={(event) => {
                  setFilterStatus(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="filter-select"
                aria-label="Filter kategori artikel"
                value={filterCategory}
                onChange={(event) => {
                  setFilterCategory(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Kategori</option>
                {CATEGORIES.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-table-wrapper">
            <div className="admin-table-scroll">
              <table className="admin-table">
                <caption className="sr-only">Daftar artikel</caption>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Artikel</th>
                    <th>Penulis</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th>Aksi</th>
                    <th>Dilihat</th>
                  </tr>
                </thead>
                <tbody>{renderArticleRows(articles)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeView === "reports" && (
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <caption className="sr-only">Daftar laporan artikel</caption>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Artikel Dilaporkan</th>
                  <th>Pelapor</th>
                  <th>Alasan</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reportsLoading ? (
                  <SkeletonRows columns={6} count={5} />
                ) : reports.length ? (
                  reports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="article-cell">
                          <img src={articleImage(report.article)} alt="" />
                          <span>
                            {report.article?.title || "Artikel tidak tersedia"}
                          </span>
                        </div>
                      </td>
                      <td>{report.user?.name || "Anonim"}</td>
                      <td className="reason-cell">{report.reason || "-"}</td>
                      <td>{formatDate(report.created_at)}</td>
                      <td>
                        <div className="action-group">
                          <ActionButton
                            label="Lihat artikel"
                            onClick={() => setPreviewArticle(report.article)}
                          >
                            <FaEye />
                          </ActionButton>
                          {report.article && (
                            <ActionButton
                              label="Pindahkan ke sampah"
                              onClick={() =>
                                openConfirm("trash", report.article)
                              }
                            >
                              <FaTrash />
                            </ActionButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Belum ada laporan masuk
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === "trash" && (
        <>
          <div className="admin-toolbar">
            <div className="search-box">
              <input
                type="search"
                placeholder="Cari artikel di sampah..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={filterCategory}
              onChange={(event) => {
                setFilterCategory(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-table-wrapper">
            <div className="admin-table-scroll">
              <table className="admin-table">
                <caption className="sr-only">Sampah artikel</caption>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Artikel</th>
                    <th>Penulis</th>
                    <th>Kategori</th>
                    <th>Dihapus</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>{renderArticleRows(trash, "trash")}</tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeView === "stats" && (
        <section className="chart-panel" aria-labelledby="chart-title">
          <h2 id="chart-title">Distribusi Artikel per Kategori</h2>
          {statsLoading ? (
            <div className="inline-loader">
              <span className="admin-spinner" />
              Memuat data...
            </div>
          ) : chartData.length ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  innerRadius={60}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} Artikel (${props.payload.percentage}%)`,
                    name,
                  ]}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              Belum ada data artikel yang disetujui
            </div>
          )}
        </section>
      )}

      {activeView === "video-reels" && (
        <div className="video-reels-view">
          <AdminVideoReels />
        </div>
      )}

      {totalPages > 1 &&
        !["stats", "reports", "video-reels"].includes(activeView) && (
          <nav className="admin-pagination" aria-label="Navigasi halaman">
            <button
              type="button"
              className="page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              ← Sebelumnya
            </button>
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Selanjutnya →
            </button>
          </nav>
        )}

      <ModalFrame
        open={Boolean(previewArticle)}
        labelledBy="preview-title"
        onClose={() => setPreviewArticle(null)}
      >
        <div className="modal-header">
          <h3 id="preview-title">{previewArticle?.title}</h3>
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            <strong>{previewArticle?.user?.name || "Anonim"}</strong> ·{" "}
            {categoryLabel(previewArticle?.category)} ·{" "}
            {String(previewArticle?.status || "").toUpperCase()}
          </div>
          {previewArticle?.image && (
            <img
              className="modal-hero"
              src={articleImage(previewArticle)}
              alt=""
            />
          )}
          <div
            className="modal-article-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(previewArticle?.content || ""),
            }}
          />
        </div>
      </ModalFrame>

      <ModalFrame
        open={confirmModal.isOpen}
        labelledBy="confirm-title"
        describedBy="confirm-description"
        onClose={closeConfirm}
        locked={confirmModal.loading}
        small
      >
        <div className="modal-header">
          <h3 id="confirm-title">{confirmModal.title}</h3>
        </div>
        <div className="modal-body">
          <p id="confirm-description">{confirmModal.description}</p>
          <p>
            <strong>{confirmModal.article?.title}</strong>
          </p>
          <div className="trending-modal-actions">
            <button
              type="button"
              className="btn-action2"
              onClick={closeConfirm}
              disabled={confirmModal.loading}
            >
              Batal
            </button>
            <button
              type="button"
              className="confirm-danger"
              onClick={runConfirmAction}
              disabled={confirmModal.loading}
            >
              {confirmModal.loading
                ? "Memproses..."
                : confirmModal.type === "permanent"
                  ? "Hapus Permanen"
                  : confirmModal.type === "restore"
                    ? "Pulihkan"
                    : "Lanjutkan"}
            </button>
          </div>
        </div>
      </ModalFrame>

      <RejectionModal
        isOpen={rejectionModal.isOpen}
        articleTitle={rejectionModal.articleTitle}
        onConfirm={confirmRejection}
        onCancel={() =>
          !rejectionModal.isLoading && setRejectionModal(EMPTY_REJECTION)
        }
        isLoading={rejectionModal.isLoading}
      />
    </main>
  );
};

export default AdminDashboard;
