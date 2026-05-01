import { useState, useCallback, useEffect, useRef } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

export function useMessages() {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const unsubscribeRef = useRef(null);

  const fetchChats = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await authService.getAllUsers();
      if (response.success) {
        const chatList = response.data
          .filter(u => u.uid !== currentUser.uid)
          .map(user => ({
            id: user.uid,
            user: {
              uid: user.uid,
              _id: user.uid,
              name: user.fullName || user.username || 'User',
              username: user.username,
              avatar: user.avatar,
              status: 'offline',
            },
            lastMessage: 'Open to chat',
            timestamp: new Date().toISOString(),
            unreadCount: 0,
          }));
        setChats(chatList);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const fetchMessages = useCallback((receiverId) => {
    if (!currentUser || !receiverId) return;
    
    // Clean up previous listener using ref to avoid re-render loops
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    setActiveChatId(receiverId);

    const chatId = getChatId(currentUser.uid, receiverId);
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    unsubscribeRef.current = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === 'function') {
          createdAt = createdAt.toDate().toISOString();
        }
        
        return {
          _id: doc.id,
          ...data,
          createdAt: createdAt
        };
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Snapshot error:", error);
    });
  }, [currentUser]); // Only depend on currentUser

  const sendMessage = useCallback(async (receiverId, text) => {
    if (!currentUser || !text.trim() || !receiverId) return;
    
    const chatId = getChatId(currentUser.uid, receiverId);
    
    const newMessage = {
      chatId,
      sender: currentUser.uid,
      receiver: receiverId,
      text,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'messages'), newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [currentUser]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    chats,
    messages,
    sendMessage,
    fetchMessages,
    activeChatId,
    totalUnreadCount: 0
  };
}
