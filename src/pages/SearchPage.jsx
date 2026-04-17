import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Hash, User } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Post } from '../components/posts/Post';
import { usePosts } from '../hooks/usePosts';
import { TrendingSection } from '../components/search/TrendingSection';
import './SearchPage.scss';

export default function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [allPosts] = useLocalStorage('social-dash-posts', []);
  const { deletePost, editPost, toggleLike, addComment, deleteComment } = usePosts();

  const results = useMemo(() => {
    if (!query) return { posts: [], users: [] };
    
    const normalizedQuery = query.toLowerCase();
    
    const filteredPosts = allPosts.filter(post => 
      post.content.toLowerCase().includes(normalizedQuery)
    );
    
    return {
      posts: filteredPosts,
      // For simplicity, we'll just show the posts here. 
      // User searching is handled in the navbar dropdown.
    };
  }, [query, allPosts]);

  return (
    <div className="search-page-layout">
      <div className="search-results-area">
        <h2 className="page-title">
          {query.startsWith('#') ? `Hashtag: ${query}` : `Search results for "${query}"`}
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
