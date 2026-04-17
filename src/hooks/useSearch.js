import { useState, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { authService } from '../services/authService';

export function useSearch() {
  const [posts] = useLocalStorage('social-dash-posts-v2', []);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { users: [], hashtags: [] };

    const normalizedQuery = query.toLowerCase().trim();
    const allUsers = authService.getUsers();

    const filteredUsers = allUsers.filter(user => 
      user.name?.toLowerCase().includes(normalizedQuery) || 
      user.username.toLowerCase().includes(normalizedQuery)
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
  }, [query, posts]);

  return {
    query,
    setQuery,
    results,
  };
}
