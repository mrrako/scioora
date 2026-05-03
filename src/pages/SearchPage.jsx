import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, User as UserIcon } from 'lucide-react';
import { Post } from '../components/posts/Post';
import { usePosts } from '../hooks/usePosts';
import { useSearch } from '../hooks/useSearch';
import { TrendingSection } from '../components/search/TrendingSection';
import './SearchPage.scss';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const urlQuery = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('posts');
  const [localQuery, setLocalQuery] = useState(urlQuery);
  
  const { posts: allPosts, deletePost, editPost, toggleLike, addComment, deleteComment } = usePosts();
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults } = useSearch();

  useEffect(() => {
    setLocalQuery(urlQuery);
    // When URL query changes, also update the search hook query to fetch users
    setSearchQuery(urlQuery);
  }, [urlQuery, setSearchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  const results = useMemo(() => {
    const normalizedQuery = urlQuery.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return { posts: [], users: [], photos: [] };
    }
    
    const filteredPosts = allPosts.filter(post => 
      post.content?.toLowerCase().includes(normalizedQuery)
    );

    const filteredPhotos = allPosts.filter(post => 
      post.image && post.content?.toLowerCase().includes(normalizedQuery)
    );
    
    return {
      posts: filteredPosts,
      users: searchResults.users || [],
      photos: filteredPhotos
    };
  }, [urlQuery, allPosts, searchResults]);

  const renderResults = () => {
    if (!urlQuery) {
      return (
        <div className="explore-empty-state">
          <h3>Explore SCIOOORA</h3>
          <p>Search for people, hashtags, or interesting topics.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'users':
        return (
          <div className="users-results">
            {results.users.length > 0 ? (
              results.users.map(user => (
                <Link to={`/profile/${user.username}`} key={user._id || user.uid} className="user-result-item">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="" />
                  <div className="user-info">
                    <span className="name">{user.name || user.username}</span>
                    <span className="username">@{user.username}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="no-results">No users found.</p>
            )}
          </div>
        );
      case 'photos':
        return (
          <div className="photos-results">
            {results.photos.length > 0 ? (
              <div className="photos-grid">
                {results.photos.map(post => (
                  <div key={post._id} className="photo-item">
                    <img src={post.image} alt="" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-results">No photos found.</p>
            )}
          </div>
        );
      default:
        return (
          <div className="posts-results">
            {results.posts.length > 0 ? (
              results.posts.map(post => (
                <Post 
                  key={post._id} 
                  post={post}
                  onDelete={deletePost}
                  onEdit={editPost}
                  onLike={toggleLike}
                  onAddComment={addComment}
                  onDeleteComment={deleteComment}
                />
              ))
            ) : (
              <p className="no-results">No posts found.</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="search-page-layout">
      <div className="search-results-area">
        <div className="mobile-search-header">
          <form onSubmit={handleSearch} className="search-form">
            <SearchIcon size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search SCIOOORA..." 
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
          </form>
        </div>

        <h2 className="page-title">
          {urlQuery ? (urlQuery.startsWith('#') ? `Hashtag: ${urlQuery}` : `Results for "${urlQuery}"`) : 'Explore'}
        </h2>
        
        <div className="results-tabs">
          <button 
            className={activeTab === 'posts' ? 'active' : ''} 
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'photos' ? 'active' : ''} 
            onClick={() => setActiveTab('photos')}
          >
            Photos
          </button>
        </div>

        <div className="results-list">
          {renderResults()}
        </div>
      </div>

      <aside className="right-sidebar">
        <TrendingSection />
      </aside>
    </div>
  );
}
