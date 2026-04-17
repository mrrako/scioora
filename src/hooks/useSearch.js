import { useState, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MOCK_USERS = [
  { id: 'u-1', name: 'Alex Johnson', username: 'alexj', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
  { id: 'u-2', name: 'Jane Doe', username: 'janed', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
  { id: 'u-3', name: 'Sarah Williams', username: 'sarahw', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
  { id: 'u-4', name: 'Mike Ross', username: 'miker', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
  { id: 'u-5', name: 'Harvey Specter', username: 'harvey', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' },
];

export function useSearch() {
  const [posts] = useLocalStorage('social-dash-posts', []);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { users: [], hashtags: [] };

    const normalizedQuery = query.toLowerCase().trim();
    const isHashtagSearch = normalizedQuery.startsWith('#');
    const searchTerms = isHashtagSearch ? [normalizedQuery] : normalizedQuery.split(' ');

    const filteredUsers = MOCK_USERS.filter(user => 
      user.name.toLowerCase().includes(normalizedQuery) || 
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
