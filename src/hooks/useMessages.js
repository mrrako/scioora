import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

// Helper to get a stable chatId for two users regardless of who is current
const getChatId = (id1, id2) => {
  return [id1, id2].sort().join('_');
};

export function useMessages() {
  const { user: currentUser } = useAuth();
  
  // Shared global messages and chats state
  const [allMessages, setAllMessages] = useLocalStorage('social-dash-global-messages-v2', {});

  // Data Migration: Convert old 'me' senderId to actual userId
  useEffect(() => {
    if (!currentUser) return;
    let hasChanges = false;
    const migratedMessages = { ...allMessages };

    Object.keys(migratedMessages).forEach(chatId => {
      migratedMessages[chatId] = migratedMessages[chatId].map(msg => {
        if (msg.senderId === 'me') {
          hasChanges = true;
          return { ...msg, senderId: currentUser.id };
        }
        return msg;
      });
    });

    if (hasChanges) {
      setAllMessages(migratedMessages);
    }
  }, [currentUser, allMessages, setAllMessages]);

  // Generate the chat list for the current user based on global messages
  const chats = useMemo(() => {
    if (!currentUser) return [];
    const allUsers = authService.getUsers();
    
    return allUsers
      .filter(u => u.id !== currentUser.id)
      .map((user, index) => {
        const chatId = getChatId(currentUser.id, user.id);
        const chatMessages = allMessages[chatId] || [];
        const lastMsg = chatMessages[chatMessages.length - 1];
        
        // Calculate unread count (messages NOT from me and NOT read)
        const unreadCount = chatMessages.filter(m => m.senderId !== currentUser.id && !m.isRead).length;

        return {
          id: chatId,
          user: {
            id: user.id,
            name: user.name || user.username,
            avatar: user.avatar,
            status: index % 2 === 0 ? 'online' : 'offline',
          },
          lastMessage: lastMsg ? lastMsg.text : 'No messages yet',
          timestamp: lastMsg ? lastMsg.timestamp : new Date(Date.now() - (index + 1) * 3600000).toISOString(),
          unreadCount,
        };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [currentUser, allMessages]);

  const sendMessage = useCallback((chatId, text) => {
    if (!currentUser) return;

    const newMessage = {
      id: uuidv4(),
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setAllMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));
  }, [currentUser, setAllMessages]);

  const markAsRead = useCallback((chatId) => {
    if (!currentUser || !allMessages[chatId]) return;
    
    const hasUnread = allMessages[chatId].some(m => m.senderId !== currentUser.id && !m.isRead);
    if (!hasUnread) return;

    setAllMessages((prev) => ({
      ...prev,
      [chatId]: prev[chatId].map(msg => 
        msg.senderId !== currentUser.id ? { ...msg, isRead: true } : msg
      ),
    }));
  }, [currentUser, allMessages, setAllMessages]);

  const totalUnreadCount = useMemo(() => {
    return chats.reduce((acc, chat) => acc + chat.unreadCount, 0);
  }, [chats]);

  return {
    chats,
    messages: allMessages,
    sendMessage,
    markAsRead,
    totalUnreadCount
  };
}
