import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

const notificationService = {
  createNotification: async (data) => {
    try {
      const { recipientId, sender, type, message, link } = data;
      
      // Don't notify yourself
      if (recipientId === sender.uid || recipientId === sender._id) return;

      const notification = {
        recipientId,
        sender: {
          uid: sender.uid || sender._id,
          username: sender.username,
          name: sender.fullName || sender.name || sender.username,
          avatar: sender.avatar || ''
        },
        type, // 'follow', 'like', 'comment', 'post', 'story'
        message,
        link: link || '',
        isRead: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notification);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  },

  notifyFollowers: async (sender, type, message, link) => {
    try {
      // Find followers
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', sender.uid || sender._id)));
      if (userDoc.empty) return;
      
      const followers = userDoc.docs[0].data().followers || [];
      if (followers.length === 0) return;

      const batch = writeBatch(db);
      const notificationsRef = collection(db, 'notifications');

      followers.forEach(followerId => {
        const notifRef = doc(notificationsRef);
        batch.set(notifRef, {
          recipientId: followerId,
          sender: {
            uid: sender.uid || sender._id,
            username: sender.username,
            name: sender.fullName || sender.name || sender.username,
            avatar: sender.avatar || ''
          },
          type,
          message,
          link: link || '',
          isRead: false,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error notifying followers:', error);
    }
  }
};

export default notificationService;
