import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Gagal memuat notifikasi');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate to article detail if needed
    if (notification.article_id) {
      const articleSlug = notification.article?.slug || notification.article_id;
      navigate(`/article/${articleSlug}`);
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

  return (
    <div className="notif-page-wrapper">
      <div className="notif-container">
        {/* Header: Tombol back dan Judul */}
        <header className="notif-header-section">
          <button className="btn-back-notif" onClick={() => navigate(-1)}>
            ←
          </button>
          <h2 className="notif-page-title">NOTIFICATION</h2>
        </header>

        {/* List Notifikasi */}
        <main className="notif-main-content">
          {loading ? (
            <div className="notif-loading">
              <p>Memuat notifikasi...</p>
            </div>
          ) : error ? (
            <div className="notif-error">
              <p>{error}</p>
              <button onClick={fetchNotifications} className="btn-retry">
                Coba Lagi
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <p>Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="notif-list-id" id="notifications">
              {notifications.map((item) => (
                <div 
                  key={item.id} 
                  className={`notif-row-item ${!item.is_read ? 'unread' : ''} ${getNotificationClass(item.type)}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className={`notif-avatar-circle ${item.type}`}>
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="notif-bubble-box">
                    <p className="notif-message">{item.message}</p>
                    {item.rejection_reason && (
                      <div className="notif-rejection-reason">
                        <strong>Alasan:</strong> {item.rejection_reason}
                      </div>
                    )}
                    <span className="notif-time">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <button 
                    className="notif-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                  >
                    ✕
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