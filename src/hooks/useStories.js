import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';

const INITIAL_STORIES = [];

export function useStories() {
  const { user: currentUser } = useAuth();
  const [allStories, setAllStories] = useLocalStorage('social-dash-stories-v2', INITIAL_STORIES);
  const [highlights, setHighlights] = useLocalStorage('social-dash-highlights-v2', []);

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
