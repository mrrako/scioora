import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
  limit
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export function useNotifications(activeChatId = null) {
  const { user: currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Message notification refs
  const globalUnsubscribeRef = useRef(null);
  const isInitialLoad = useRef(true);

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audio.play().catch(err => console.log('Sound play blocked by browser:', err));
  }, []);

  const showBrowserNotification = useCallback((senderName, text) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(`New message from ${senderName}`, {
        body: text,
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(`New message from ${senderName}`, {
            body: text,
            icon: '/favicon.ico'
          });
        }
      });
    }
  }, []);

  // Effect for system notifications (likes, follows, etc.)
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === 'function') {
          createdAt = createdAt.toDate().toISOString();
        }
        return {
          _id: doc.id,
          ...data,
          createdAt
        };
      });
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Effect for message notifications
  useEffect(() => {
    if (!currentUser) return;

    const globalQuery = query(
      collection(db, 'messages'),
      where('receiver', '==', currentUser.uid)
    );

    globalUnsubscribeRef.current = onSnapshot(globalQuery, (snapshot) => {
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const msgData = change.doc.data();
          if (msgData.sender !== currentUser.uid) {
            playNotificationSound();
            
            const senderResp = await authService.getUserById(msgData.sender);
            const senderName = senderResp.success ? (senderResp.data.fullName || senderResp.data.username) : 'Someone';
            
            if (document.hidden || activeChatId !== msgData.sender) {
              showBrowserNotification(senderName, msgData.text);
            }
          }
        }
      });
    });

    return () => {
      if (globalUnsubscribeRef.current) {
        globalUnsubscribeRef.current();
      }
    };
  }, [currentUser, activeChatId, playNotificationSound, showBrowserNotification]);

  const markAsRead = async (id) => {
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      const unreadQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', currentUser.uid),
        where('isRead', '==', false)
      );
      
      const snapshot = await getDocs(unreadQuery);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((document) => {
        batch.update(document.ref, { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAll = async () => {
    if (!currentUser) return;
    try {
      const allQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(allQuery);
      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i += 500) {
        const batch = writeBatch(db);
        docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    refreshNotifications: () => {},
  };
}
