import React from 'react';
import './ChatList.scss';

export function ChatList({ chats, activeChatId, onSelectChat }) {
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Messages</h3>
      </div>
      <div className="chat-items">
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            className={`chat-item ${activeChatId === chat.id ? 'active' : ''} ${chat.unreadCount > 0 ? 'unread' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="avatar-wrapper">
              <img src={chat.user.avatar} alt={chat.user.name} className="chat-avatar" />
              <span className={`status-indicator ${chat.user.status}`} />
            </div>
            <div className="chat-info">
              <div className="chat-header">
                <span className="user-name">{chat.user.name}</span>
                <span className="timestamp">{formatTime(chat.timestamp)}</span>
              </div>
              <p className="last-message">{chat.lastMessage}</p>
            </div>
            {chat.unreadCount > 0 && <span className="unread-badge">{chat.unreadCount}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
