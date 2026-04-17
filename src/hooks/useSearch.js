import { useState, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { authService, STORAGE_USERS_KEY, DEMO_USERS } from '../services/authService';

export function useSearch() {
  const [posts] = useLocalStorage('social-dash-posts-v2', []);
  const [users] = useLocalStorage(STORAGE_USERS_KEY, DEMO_USERS);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { users: [], hashtags: [] };

    const normalizedQuery = query.toLowerCase().trim();
    
    // Use the users from state/localStorage dependency
    const filteredUsers = users.filter(user => 
      (user.name && user.name.toLowerCase().includes(normalizedQuery)) || 
      (user.username && user.username.toLowerCase().includes(normalizedQuery))
    );

    const hashtagMap = new Set();
    posts.forEach(post => {
      const hashtags = post.content.match(/#[a-zA-Z0-9_]+/g);
      if (hashtags) {
        hashtags.forEach(tag => {
          if (tag.toLowerCase().includes(normalizedQuery)) {
            hashtagMap.add(tag.toLowerCase());
          }
        });
      }
    });

    return {
      users: filteredUsers.slice(0, 5),
      hashtags: Array.from(hashtagMap).slice(0, 5),
    };
  }, [query, posts, users]);

  return {
    query,
    setQuery,
    results,
  };
}
