import React, { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import axios from "../utils/axiosConfig";

import "./Notifications.css";

/* =========================================================
   HELPERS
   ========================================================= */

const getNotificationIcon = (type) => {
  switch (type) {
    case "article_approved":
      return "✓";

    case "article_rejected":
      return "✕";

    case "article_liked":
      return "❤";

    case "article_pending":
      return "⏳";

    default:
      return "📄";
  }
};

const getNotificationClass = (type) => {
  switch (type) {
    case "article_approved":
      return "notif-approved";

    case "article_rejected":
      return "notif-rejected";

    case "article_liked":
      return "notif-liked";

    case "article_pending":
      return "notif-pending";

    default:
      return "";
  }
};

const formatNotificationDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getArticleSlug = (notification) => {
  const slug = notification?.article?.slug;

  if (slug !== undefined && slug !== null && String(slug).trim()) {
    return String(slug).trim();
  }

  const articleId = notification?.article_id;

  if (
    articleId !== undefined &&
    articleId !== null &&
    String(articleId).trim()
  ) {
    return String(articleId).trim();
  }

  return "";
};

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const [readingId, setReadingId] = useState(null);

  /* =======================================================
     FETCH
     ======================================================= */

  const fetchNotifications = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/notifications", {
        signal,
      });

      const data = response?.data?.data;

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      /*
       * Abort bukan error UI.
       */
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        return;
      }

      console.error("Error fetching notifications:", err);

      setNotifications([]);

      setError(err?.response?.data?.message || "Gagal memuat notifikasi.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    fetchNotifications(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchNotifications]);

  /* =======================================================
     MARK AS READ
     ======================================================= */

  const markAsRead = useCallback(async (notificationId) => {
    if (notificationId === undefined || notificationId === null) {
      return;
    }

    setReadingId(notificationId);

    try {
      await axios.patch(
        `/api/notifications/${encodeURIComponent(String(notificationId))}/read`,
      );

      setNotifications((current) =>
        current.map((notification) =>
          String(notification.id) === String(notificationId)
            ? {
                ...notification,
                is_read: true,
              }
            : notification,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    } finally {
      setReadingId(null);
    }
  }, []);

  /* =======================================================
     DELETE
     ======================================================= */

  const deleteNotification = useCallback(async (notificationId) => {
    if (notificationId === undefined || notificationId === null) {
      return;
    }

    setDeletingId(notificationId);

    try {
      await axios.delete(
        `/api/notifications/${encodeURIComponent(String(notificationId))}`,
      );

      setNotifications((current) =>
        current.filter(
          (notification) => String(notification.id) !== String(notificationId),
        ),
      );
    } catch (err) {
      console.error("Error deleting notification:", err);

      setError(err?.response?.data?.message || "Gagal menghapus notifikasi.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  /* =======================================================
     OPEN NOTIFICATION
     ======================================================= */

  const handleNotificationClick = useCallback(
    async (notification) => {
      if (!notification) {
        return;
      }

      if (!notification.is_read && notification.id !== undefined) {
        /*
         * Update UI dahulu agar terasa responsif.
         */
        setNotifications((current) =>
          current.map((item) =>
            String(item.id) === String(notification.id)
              ? {
                  ...item,
                  is_read: true,
                }
              : item,
          ),
        );

        /*
         * Simpan status ke backend,
         * tetapi jangan menghambat navigasi.
         */
        markAsRead(notification.id);
      }

      const articleSlug = getArticleSlug(notification);

      if (articleSlug) {
        navigate(`/article/${encodeURIComponent(articleSlug)}`);
      }
    },
    [markAsRead, navigate],
  );

  /* =======================================================
     COUNTERS
     ======================================================= */

  const unreadCount = notifications.filter((item) => !item?.is_read).length;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="notif-page-wrapper">
      <Helmet>
        <title>Notifikasi - SukaMuda</title>

        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <div className="notif-container">
        {/* =================================================
            HEADER
            ================================================= */}

        <header className="notif-header-section">
          <button
            type="button"
            className="btn-back-notif"
            onClick={() => navigate(-1)}
            aria-label="Kembali ke halaman sebelumnya"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div>
            <h1 className="notif-page-title">NOTIFICATION</h1>

            {!loading && notifications.length > 0 && (
              <p className="notif-unread-count" aria-live="polite">
                {unreadCount > 0
                  ? `${unreadCount} belum dibaca`
                  : "Semua sudah dibaca"}
              </p>
            )}
          </div>
        </header>

        {/* =================================================
            MAIN
            ================================================= */}

        <main className="notif-main-content">
          {loading ? (
            <div className="notif-loading" role="status" aria-live="polite">
              <p>Memuat notifikasi...</p>
            </div>
          ) : error ? (
            <div className="notif-error" role="alert">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => {
                  const controller = new AbortController();

                  fetchNotifications(controller.signal);
                }}
                className="btn-retry"
              >
                Coba Lagi
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty" role="status">
              <p>Tidak ada notifikasi</p>
            </div>
          ) : (
            <div
              className="notif-list-id"
              id="notifications"
              aria-label="Daftar notifikasi"
            >
              {notifications.map((item) => {
                const notificationId = item.id;

                const isUnread = !item.is_read;

                const isDeleting =
                  String(deletingId) === String(notificationId);

                const isReading = String(readingId) === String(notificationId);

                return (
                  <article
                    key={notificationId}
                    className={`notif-row-item${
                      isUnread ? " unread" : ""
                    } ${getNotificationClass(item.type)}`}
                  >
                    <button
                      type="button"
                      className="notif-content-button"
                      onClick={() => handleNotificationClick(item)}
                      disabled={isDeleting || isReading}
                      aria-label={`${item.message || "Notifikasi"}${
                        isUnread ? ", belum dibaca" : ""
                      }`}
                    >
                      <span
                        className={`notif-avatar-circle ${
                          getNotificationClass(item.type) || "notif-default"
                        }`}
                        aria-hidden="true"
                      >
                        {getNotificationIcon(item.type)}
                      </span>

                      <span className="notif-bubble-box">
                        <span className="notif-message">
                          {item.message || "Notifikasi"}
                        </span>

                        {item.rejection_reason && (
                          <span className="notif-rejection-reason">
                            <strong>Alasan:</strong> {item.rejection_reason}
                          </span>
                        )}

                        <time
                          className="notif-time"
                          dateTime={item.created_at || undefined}
                        >
                          {formatNotificationDate(item.created_at)}
                        </time>

                        {isReading && (
                          <span
                            className="notif-action-status"
                            aria-live="polite"
                          >
                            Menandai sudah dibaca...
                          </span>
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="notif-delete-btn"
                      aria-label={`Hapus notifikasi${
                        item.message ? `: ${item.message}` : ""
                      }`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        deleteNotification(notificationId);
                      }}
                      disabled={isDeleting}
                    >
                      <span aria-hidden="true">{isDeleting ? "…" : "✕"}</span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notifications;
