import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Hash, User, Search as SearchIcon } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
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
  
  const { query: searchQuery, setQuery: setSearchQuery } = useSearch();
  const [localQuery, setLocalQuery] = useState(urlQuery);
  
  const [allPosts] = useLocalStorage('social-dash-posts', []);
  const { deletePost, editPost, toggleLike, addComment, deleteComment } = usePosts();

  useEffect(() => {
    setLocalQuery(urlQuery);
  }, [urlQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  const results = useMemo(() => {
    if (!urlQuery) return { posts: [], users: [] };
    
    const normalizedQuery = urlQuery.toLowerCase();
    
    const filteredPosts = allPosts.filter(post => 
      post.content.toLowerCase().includes(normalizedQuery)
    );
    
    return {
      posts: filteredPosts,
    };
  }, [urlQuery, allPosts]);

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
          <button className="active">Posts</button>
          <button>Users</button>
          <button>Photos</button>
        </div>

        <div className="results-list">
          {results.posts.length > 0 ? (
            results.posts.map(post => (
              <Post 
                key={post.id} 
                post={post}
                onDelete={deletePost}
                onEdit={editPost}
                onLike={toggleLike}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
              />
            ))
          ) : (
            <div className="no-results-state">
              <p>No posts found matching your search.</p>
              <Link to="/" className="back-home">Go back to Home</Link>
            </div>
          )}
        </div>
      </div>

      <aside className="right-sidebar">
        <TrendingSection />
      </aside>
    </div>
  );
}
