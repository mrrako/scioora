import { useState, useCallback, useEffect } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
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
  const [activeReceiverId, setActiveReceiverId] = useState(null);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState(() => () => {});

  const fetchChats = useCallback(async () => {
    if (!currentUser) return;
    try {
      // Simulate getting all users except current
      const response = await authService.getAllUsers();
      if (response.success) {
        const chatList = response.data
          .filter(u => u.uid !== currentUser.uid)
          .map(user => ({
            id: user.uid,
            user: {
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
    if (!currentUser) return;
    
    // Clean up previous listener
    unsubscribeMessages();
    
    setActiveReceiverId(receiverId);
    setActiveChatId(receiverId);

    const chatId = getChatId(currentUser.uid, receiverId);
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to ISO string for the UI if needed
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
    });

    setUnsubscribeMessages(() => unsubscribe);
  }, [currentUser, unsubscribeMessages]);

  const sendMessage = useCallback(async (receiverId, text) => {
    if (!currentUser || !text.trim()) return;
    
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
      // fetchChats could be called here to update "lastMessage" if we were storing it
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [currentUser]);

  // Clean up on unmount
  useEffect(() => {
    return () => unsubscribeMessages();
  }, [unsubscribeMessages]);

  return {
    chats,
    messages,
    sendMessage,
    fetchMessages,
    activeChatId,
    totalUnreadCount: 0
  };
}
