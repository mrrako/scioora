import React, { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, Bell, Sun, Moon, User, MessageSquare, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';
import { useSearch } from '../../hooks/useSearch';
import { NotificationDropdown } from './NotificationDropdown';
import { SearchResultsDropdown } from '../search/SearchResultsDropdown';
import './Navbar.scss';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { 
    notifications, 
    unreadCount: notifUnreadCount, 
    markAsRead: markNotifAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();
  
  const { totalUnreadCount: messageUnreadCount } = useMessages();
  const { query, setQuery, results } = useSearch();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowSearchResults(false);
  };

  const handleSearchFocus = () => {
    setShowSearchResults(true);
    setShowNotifications(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-search" ref={searchRef}>
        <SearchIcon className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search users or #hashtags..." 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={handleSearchFocus}
        />
        {showSearchResults && query && (
          <SearchResultsDropdown 
            results={results} 
            query={query} 
            onSelect={() => setShowSearchResults(false)} 
          />
        )}
      </div>
      <div className="navbar-actions">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <Link to="/messages" className="icon-btn message-btn" aria-label="Messages">
          <MessageSquare size={20} />
          {messageUnreadCount > 0 && <span className="badge message-badge">{messageUnreadCount}</span>}
        </Link>
        
        <div className="notification-wrapper" ref={notificationRef}>
          <button 
            className={`icon-btn ${showNotifications ? 'active' : ''}`} 
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notifUnreadCount > 0 && <span className="badge">{notifUnreadCount}</span>}
          </button>

          {showNotifications && (
            <NotificationDropdown 
              notifications={notifications}
              onMarkAsRead={markNotifAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAll}
            />
          )}
        </div>

        <div className="user-profile">
          <Link to={`/profile/${user?.username}`} className="avatar">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} alt="" />
          </Link>
          <span className="user-name">{user?.username}</span>
          <button className="logout-btn" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
