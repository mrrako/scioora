import React from 'react';
import { TrendingUp, UserPlus } from 'lucide-react';
import { usePosts } from '../../hooks/usePosts';
import './TrendingSection.scss';

export function TrendingSection() {
  const { getTrendingHashtags } = usePosts();
  const trending = getTrendingHashtags();

  const suggestedUsers = [
    { name: 'Sarah Williams', username: 'sarahw', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
    { name: 'Mike Ross', username: 'miker', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
    { name: 'Harvey Specter', username: 'harvey', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
  ];

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
              <div key={tag} className="trending-item">
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
          {suggestedUsers.map(user => (
            <div key={user.username} className="follow-item">
              <img src={user.avatar} alt="" className="user-avatar" />
              <div className="user-info">
                <span className="name">{user.name}</span>
                <span className="username">@{user.username}</span>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
          ))}
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
