import React, { useState, useEffect } from 'react';
import { TrendingUp, UserPlus } from 'lucide-react';
import { usePosts } from '../../hooks/usePosts';
import './TrendingSection.scss';

import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { useFollow } from '../../hooks/useFollow';
import { useNavigate } from 'react-router-dom';

export function TrendingSection() {
  const { user: currentUser } = useAuth();
  const { posts } = usePosts();
  const { toggleFollow, isFollowing } = useFollow();
  const navigate = useNavigate();
  
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentUser) return;
      try {
        const allUsers = await authService.getAllUsers();
        const suggestions = allUsers
          .filter(u => u._id !== currentUser._id && !currentUser.following?.includes(u._id))
          .slice(0, 3);
        setSuggestedUsers(suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };
    fetchSuggestions();
  }, [currentUser]);

  const trending = React.useMemo(() => {
    const hashtagMap = {};
    posts.forEach(post => {
      if (typeof post.content === 'string') {
        const hashtags = post.content.match(/#[a-zA-Z0-9_]+/g);
        if (hashtags) {
          hashtags.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            hashtagMap[normalizedTag] = (hashtagMap[normalizedTag] || 0) + 1;
          });
        }
      }
    });
    return Object.entries(hashtagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  return (
    <div className="trending-section">
      <div className="trending-card">
        <div className="card-header">
          <TrendingUp size={18} />
          <h4>Trending Hashtags</h4>
        </div>
        <div className="trending-list">
          {trending.length > 0 ? (
            trending.map(({ tag, count }) => (
              <div 
                key={tag} 
                className="trending-item"
                onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                style={{ cursor: 'pointer' }}
              >
                <span className="tag-name">{tag}</span>
                <span className="tag-count">{count} {count === 1 ? 'post' : 'posts'}</span>
              </div>
            ))
          ) : (
            <p className="empty-msg">No trending hashtags yet</p>
          )}
        </div>
      </div>

      <div className="trending-card">
        <div className="card-header">
          <UserPlus size={18} />
          <h4>Who to follow</h4>
        </div>
        <div className="follow-list">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map(user => (
              <div key={user._id} className="follow-item">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                  alt="" 
                  className="user-avatar" 
                  onClick={() => navigate(`/profile/${user.username}`)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="user-info" onClick={() => navigate(`/profile/${user.username}`)} style={{ cursor: 'pointer' }}>
                  <span className="name">{user.name}</span>
                  <span className="username">@{user.username}</span>
                </div>
                <button 
                  className={`follow-btn ${isFollowing(user._id) ? 'following' : ''}`}
                  onClick={() => toggleFollow(user._id)}
                >
                  {isFollowing(user._id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          ) : (
            <p className="empty-msg">No suggestions available</p>
          )}
        </div>
      </div>

      <div className="footer-links">
        <a href="#">About</a>
        <a href="#">Help</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <p>© 2026 SocialDash</p>
      </div>
    </div>
  );
}
