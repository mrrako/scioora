import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_NOTIFICATIONS = [];

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage('social-dash-notifications-v2', INITIAL_NOTIFICATIONS);

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
