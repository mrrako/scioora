import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNotifications } from './useNotifications';

export function useFollow() {
  const { user: currentUser, refreshUser } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);

  const isFollowing = useCallback((userId) => {
    return currentUser?.following?.includes(userId);
  }, [currentUser]);

  const follow = useCallback(async (targetUserId) => {
    if (!currentUser || currentUser.id === targetUserId) return;
    setLoading(true);

    try {
      const users = authService.getUsers();
      const targetUser = users.find(u => u.id === targetUserId);
      
      if (!targetUser) return;

      // Update Current User
      const updatedFollowing = [...(currentUser.following || []), targetUserId];
      authService.updateUser(currentUser.id, { following: updatedFollowing });

      // Update Target User
      const updatedFollowers = [...(targetUser.followers || []), currentUser.id];
      authService.updateUser(targetUserId, { followers: updatedFollowers });

      // Trigger Notification
      addNotification({
        type: 'follow',
        userId: targetUserId,
        user: {
          id: currentUser.id,
          name: currentUser.username,
          avatar: currentUser.avatar,
        },
        content: 'started following you',
        isRead: false,
        timestamp: new Date().toISOString(),
      });

      refreshUser();
    } catch (err) {
      console.error('Follow failed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, addNotification, refreshUser]);

  const unfollow = useCallback(async (targetUserId) => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const users = authService.getUsers();
      const targetUser = users.find(u => u.id === targetUserId);

      if (!targetUser) return;

      // Update Current User
      const updatedFollowing = currentUser.following.filter(id => id !== targetUserId);
      authService.updateUser(currentUser.id, { following: updatedFollowing });

      // Update Target User
      const updatedFollowers = targetUser.followers.filter(id => id !== currentUser.id);
      authService.updateUser(targetUserId, { followers: updatedFollowers });

      refreshUser();
    } catch (err) {
      console.error('Unfollow failed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, refreshUser]);

  const toggleFollow = useCallback((userId) => {
    if (isFollowing(userId)) {
      return unfollow(userId);
    }
    return follow(userId);
  }, [isFollowing, follow, unfollow]);

  return { isFollowing, toggleFollow, follow, unfollow, loading };
}
