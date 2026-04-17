import React from 'react';
import { Heart, MessageCircle, UserPlus, Trash2, Check } from 'lucide-react';
import './NotificationDropdown.scss';

export function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, onClearAll }) {
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="type-icon like" size={16} fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="type-icon comment" size={16} fill="currentColor" />;
      case 'follow':
        return <UserPlus className="type-icon follow" size={16} fill="currentColor" />;
      default:
        return null;
    }
  };

  return (
    <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="dropdown-header">
        <h3>Notifications</h3>
        <div className="header-actions">
          <button className="action-btn" onClick={onMarkAllAsRead} title="Mark all as read">
            <Check size={18} />
          </button>
        </div>
      </div>

      <div className="notification-list">
        {notifications && notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif._id} 
              className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
              onClick={() => onMarkAsRead(notif._id)}
            >
              <div className="avatar-container">
                <img 
                  src={notif.sender?.avatar || `https://ui-avatars.com/api/?name=${notif.sender?.username}&background=random`} 
                  alt={notif.sender?.name} 
                  className="user-avatar" 
                />
                <div className="icon-overlay">
                  {getIcon(notif.type)}
                </div>
              </div>
              <div className="notification-content">
                <p>
                  <strong>{notif.sender?.name}</strong> {notif.message}
                </p>
                <span className="timestamp">{formatTimestamp(notif.createdAt)}</span>
              </div>
              {!notif.isRead && <div className="unread-dot" />}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No notifications yet</p>
          </div>
        )}
      </div>

      {notifications && notifications.length > 0 && (
        <div className="dropdown-footer">
          <button>View all notifications</button>
        </div>
      )}
    </div>
  );
}
