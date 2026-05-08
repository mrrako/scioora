import { useEffect, useCallback, useRef } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export function useNotifications(activeChatId = null) {
  const { user: currentUser } = useAuth();
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

  useEffect(() => {
    if (!currentUser) return;

    const globalQuery = query(
      collection(db, 'messages'),
      where('receiver', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
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
            
            // Notify if window is hidden OR if the user is not currently looking at this specific chat
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
}
