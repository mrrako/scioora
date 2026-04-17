import { useState, useCallback, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const SOCKET_URL = 'http://localhost:5000';

export function useMessages() {
  const { user: currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]); // Messages for the active chat
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Initialize Socket
  useEffect(() => {
    if (currentUser) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      newSocket.emit('setup', currentUser);

      newSocket.on('message_received', (newMessage) => {
        // If message is for the active chat, add it to state
        setMessages((prev) => [...prev, newMessage]);
        // Also refresh chat list to show last message
        fetchChats();
      });

      return () => newSocket.close();
    }
  }, [currentUser]);

  const fetchChats = useCallback(async () => {
    if (!currentUser) return;
    try {
      // In a real app, you'd have an /api/chat/list endpoint
      // For now, we'll get all users and simulate the list
      const users = await authService.getAllUsers();
      const chatList = users
        .filter(u => u._id !== currentUser._id)
        .map(user => ({
          id: user._id, // Using userId as chatId for simplicity in 1-on-1
          user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            status: 'offline', // Socket logic for online status can be added later
          },
          lastMessage: 'Open to chat',
          timestamp: new Date().toISOString(),
          unreadCount: 0,
        }));
      setChats(chatList);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const fetchMessages = useCallback(async (userId) => {
    try {
      const response = await api.get(`/chat/${userId}`);
      if (response.success) {
        setMessages(response.data);
        setActiveChatId(userId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const sendMessage = useCallback((receiverId, text) => {
    if (socket && currentUser) {
      const messageData = {
        sender: currentUser._id,
        receiver: receiverId,
        text,
      };
      
      // Emit socket event
      socket.emit('new_message', messageData);

      // Optimistically add to messages (or wait for socket confirmation)
      // socket.on('message_sent', ...) would be cleaner
    }
  }, [socket, currentUser]);

  // Handle message_sent confirmation
  useEffect(() => {
    if (socket) {
      socket.on('message_sent', (sentMessage) => {
        setMessages((prev) => [...prev, sentMessage]);
        fetchChats();
      });
      return () => socket.off('message_sent');
    }
  }, [socket, fetchChats]);

  return {
    chats,
    messages,
    sendMessage,
    fetchMessages,
    activeChatId,
    totalUnreadCount: 0 // Will implement unread count later
  };
}
