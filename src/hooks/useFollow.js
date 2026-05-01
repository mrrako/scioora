import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export function useFollow() {
  const { user: currentUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const isFollowing = useCallback((userId) => {
    return currentUser?.following?.includes(userId);
  }, [currentUser]);

  const toggleFollow = useCallback(async (userId) => {
    if (!currentUser || currentUser.uid === userId) return;
    setLoading(true);

    try {
      const currentlyFollowing = isFollowing(userId);
      
      if (currentlyFollowing) {
        await authService.unfollowUser(userId);
      } else {
        await authService.followUser(userId);
      }

      // Refresh the current user to get the updated following array
      // In a real app, you might just update local state optimistically, 
      // but refreshing ensures it's perfectly in sync.
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Toggle follow failed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isFollowing, refreshUser]);

  return { isFollowing, toggleFollow, loading };
}
