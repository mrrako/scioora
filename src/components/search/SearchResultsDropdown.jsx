import React from 'react';
import { User, Hash, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SearchResultsDropdown.scss';

export function SearchResultsDropdown({ results, query, onSelect }) {
  const navigate = useNavigate();

  const handleResultClick = (type, value) => {
    onSelect();
    if (type === 'user') {
      navigate(`/profile/${value}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  if (!query) return null;

  const hasResults = results.users.length > 0 || results.hashtags.length > 0;

  return (
    <div className="search-results-dropdown" onClick={(e) => e.stopPropagation()}>
      {!hasResults ? (
        <div className="no-results">
          <p>No results for "{query}"</p>
        </div>
      ) : (
        <>
          {results.users.length > 0 && (
            <div className="results-group">
              <span className="group-label">Users</span>
              {results.users.map(user => (
                <div 
                  key={user.id} 
                  className="result-item user"
                  onClick={() => handleResultClick('user', user.username)}
                >
                  <img src={user.avatar} alt="" className="user-avatar" />
                  <div className="user-info">
                    <span className="name">{user.name}</span>
                    <span className="username">@{user.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.hashtags.length > 0 && (
            <div className="results-group">
              <span className="group-label">Hashtags</span>
              {results.hashtags.map(tag => (
                <div 
                  key={tag} 
                  className="result-item hashtag"
                  onClick={() => handleResultClick('hashtag', tag)}
                >
                  <div className="hash-icon">
                    <Hash size={16} />
                  </div>
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}

          <div className="results-footer" onClick={() => handleResultClick('all', query)}>
            <Search size={16} />
            <span>Search all results for "{query}"</span>
          </div>
        </>
      )}
    </div>
  );
}
