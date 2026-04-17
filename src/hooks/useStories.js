import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';

const INITIAL_STORIES = [
  {
    id: 'story-1',
    user: {
      id: 'u-1',
      name: 'Jane Doe',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    },
    items: [
      { id: 'item-1', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'item-2', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', timestamp: new Date(Date.now() - 7200000).toISOString() },
    ],
  },
  {
    id: 'story-2',
    user: {
      id: 'u-2',
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    },
    items: [
      { id: 'item-3', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', timestamp: new Date(Date.now() - 14400000).toISOString() },
    ],
  },
];

export function useStories() {
  const { user: currentUser } = useAuth();
  const [allStories, setAllStories] = useLocalStorage('social-dash-stories', INITIAL_STORIES);
  const [highlights, setHighlights] = useLocalStorage('social-dash-highlights', []);

  // Filter stories older than 24 hours and only show own + following stories
  const activeStories = allStories
    .filter(userStory => {
      if (!currentUser) return false;
      const followingIds = currentUser.following || [];
      return userStory.user.id === currentUser.id || followingIds.includes(userStory.user.id);
    })
    .map(userStory => ({
      ...userStory,
      items: userStory.items.filter(item => {
        const storyDate = new Date(item.timestamp);
        const now = new Date();
        return (now - storyDate) < 24 * 60 * 60 * 1000;
      }),
    }))
    .filter(userStory => userStory.items.length > 0);

  const addStory = useCallback((item) => {
    if (!currentUser) return;

    setAllStories((prev) => {
      const userStory = prev.find(s => s.user.id === currentUser.id);
      const newItem = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        ...item,
      };

      if (userStory) {
        return prev.map(s => 
          s.user.id === currentUser.id 
            ? { ...s, items: [newItem, ...s.items] } 
            : s
        );
      } else {
        return [{
          id: uuidv4(),
          user: {
            id: currentUser.id,
            name: currentUser.username,
            avatar: currentUser.avatar,
          },
          items: [newItem],
        }, ...prev];
      }
    });
  }, [setAllStories, currentUser]);

  const toggleHighlight = useCallback((storyItem, highlightId, categoryName) => {
    setHighlights((prev) => {
      const existing = prev.find(h => h.id === highlightId || h.name === categoryName);
      if (existing) {
        return prev.map(h => 
          (h.id === highlightId || h.name === categoryName)
            ? { ...h, items: [...h.items, storyItem] }
            : h
        );
      } else {
        return [...prev, {
          id: highlightId || uuidv4(),
          name: categoryName || 'New Highlight',
          items: [storyItem],
          timestamp: new Date().toISOString(),
        }];
      }
    });
  }, [setHighlights]);

  return {
    stories: activeStories,
    highlights,
    addStory,
    toggleHighlight,
  };
}
