import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'like',
    user: {
      name: 'Jane Doe',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    },
    content: 'liked your post',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'comment',
    user: {
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    },
    content: 'commented: "Great work on the dashboard!"',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'follow',
    user: {
      name: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    },
    content: 'started following you',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage('social-dash-notifications', INITIAL_NOTIFICATIONS);

  const addNotification = useCallback((notification) => {
    const newNotif = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, [setNotifications]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, [setNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [setNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
