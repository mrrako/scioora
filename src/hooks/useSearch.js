import { useState, useMemo, useEffect } from 'react';
import authService from '../services/authService';
import { usePosts } from './usePosts';

export function useSearch() {
  const { posts } = usePosts();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authService.getAllUsers();
        if (response.success) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Error fetching users for search:', error);
      }
    };
    fetchUsers();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return { users: [], hashtags: [] };

    const normalizedQuery = query.toLowerCase().trim();
    
    const filteredUsers = users.filter(user => 
      (user.name && user.name.toLowerCase().includes(normalizedQuery)) || 
      (user.username && user.username.toLowerCase().includes(normalizedQuery))
    );

    const hashtagMap = new Set();
    posts.forEach(post => {
      if (typeof post.content === 'string') {
        const hashtags = post.content.match(/#[a-zA-Z0-9_]+/g);
        if (hashtags) {
          hashtags.forEach(tag => {
            if (tag.toLowerCase().includes(normalizedQuery)) {
              hashtagMap.add(tag.toLowerCase());
            }
          });
        }
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
