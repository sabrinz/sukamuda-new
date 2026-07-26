import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from '../utils/axiosConfig';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/notifications');

      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Gagal memuat notifikasi');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        '/api/notifications/' + notificationId + '/read'
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        '/api/notifications/' + notificationId
      );

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.article_id) {
      const articleSlug =
        notification.article?.slug || notification.article_id;

      navigate('/article/' + articleSlug);
    }
  };

  const handleNotificationKeyDown = (event, notification) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNotificationClick(notification);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'article_approved':
        return '✓';

      case 'article_rejected':
        return '✕';

      case 'article_liked':
        return '❤';

      case 'article_pending':
        return '⏳';

      default:
        return '📄';
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'article_approved':
        return 'notif-approved';

      case 'article_rejected':
        return 'notif-rejected';

      case 'article_liked':
        return 'notif-liked';

      case 'article_pending':
        return 'notif-pending';

      default:
        return '';
    }
  };

  const formatNotificationDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notif-page-wrapper">
      <Helmet>
        <title>Notifikasi - Sukamuda</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="notif-container">
        {/* HEADER */}
        <header className="notif-header-section">
          <button
            type="button"
            className="btn-back-notif"
            onClick={() => navigate(-1)}
            aria-label="Kembali ke halaman sebelumnya"
          >
            <span aria-hidden="true">←</span>
          </button>

          <h1 className="notif-page-title">NOTIFICATION</h1>
        </header>

        {/* LIST NOTIFIKASI */}
        <main className="notif-main-content">
          {loading ? (
            <div
              className="notif-loading"
              role="status"
              aria-live="polite"
            >
              <p>Memuat notifikasi...</p>
            </div>
          ) : error ? (
            <div
              className="notif-error"
              role="alert"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={fetchNotifications}
                className="btn-retry"
              >
                Coba Lagi
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div
              className="notif-empty"
              role="status"
            >
              <p>Tidak ada notifikasi</p>
            </div>
          ) : (
            <div
              className="notif-list-id"
              id="notifications"
              aria-label="Daftar notifikasi"
            >
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notif-row-item ${
                    !item.is_read ? 'unread' : ''
                  } ${getNotificationClass(item.type)}`}
                  onClick={() => handleNotificationClick(item)}
                  onKeyDown={(event) =>
                    handleNotificationKeyDown(event, item)
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.message}${
                    !item.is_read ? ', belum dibaca' : ''
                  }`}
                >
                  <div
                    className={`notif-avatar-circle ${item.type}`}
                    aria-hidden="true"
                  >
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="notif-bubble-box">
                    <p className="notif-message">
                      {item.message}
                    </p>

                    {item.rejection_reason && (
                      <div className="notif-rejection-reason">
                        <strong>Alasan:</strong>
                        {item.rejection_reason}
                      </div>
                    )}

                    <span className="notif-time">
                      {formatNotificationDate(item.created_at)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="notif-delete-btn"
                    aria-label="Hapus notifikasi"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notifications;