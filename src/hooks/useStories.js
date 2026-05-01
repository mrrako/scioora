import { useState, useCallback, useEffect } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';

export function useStories() {
  const { user: currentUser } = useAuth();
  const [stories, setStories] = useState([]);
  const [highlights, setHighlights] = useState([]);

  // Fetch stories
  useEffect(() => {
    if (!currentUser) return;
    
    const storiesQuery = query(collection(db, 'stories'));
    
    const unsubscribe = onSnapshot(storiesQuery, (snapshot) => {
      const allStories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const followingIds = currentUser.following || [];
      
      const activeStories = allStories
        .filter(userStory => {
          return userStory.user.id === currentUser.uid || followingIds.includes(userStory.user.id);
        })
        .map(userStory => ({
          ...userStory,
          items: userStory.items.filter(item => {
            const storyDate = new Date(item.timestamp);
            const now = new Date();
            return (now - storyDate) < 24 * 60 * 60 * 1000;
          }),
        }))
        .filter(userStory => userStory.items.length > 0);

      setStories(activeStories);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch highlights
  useEffect(() => {
    if (!currentUser) return;
    
    const highlightsRef = doc(db, 'highlights', currentUser.uid);
    const unsubscribe = onSnapshot(highlightsRef, (docSnap) => {
      if (docSnap.exists()) {
        setHighlights(docSnap.data().items || []);
      } else {
        setHighlights([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addStory = useCallback(async (item) => {
    if (!currentUser) return;

    try {
      const newItem = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        ...item,
      };

      const storyRef = doc(db, 'stories', currentUser.uid);
      const storySnap = await getDoc(storyRef);

      if (storySnap.exists()) {
        const existingItems = storySnap.data().items || [];
        await setDoc(storyRef, {
          user: {
            id: currentUser.uid,
            name: currentUser.username,
            avatar: currentUser.avatar,
          },
          items: [newItem, ...existingItems]
        });
      } else {
        await setDoc(storyRef, {
          user: {
            id: currentUser.uid,
            name: currentUser.username,
            avatar: currentUser.avatar,
          },
          items: [newItem]
        });
      }
    } catch (error) {
      console.error('Error adding story:', error);
    }
  }, [currentUser]);

  const toggleHighlight = useCallback(async (storyItem, highlightId, categoryName) => {
    if (!currentUser) return;

    try {
      const highlightsRef = doc(db, 'highlights', currentUser.uid);
      const docSnap = await getDoc(highlightsRef);
      
      let currentHighlights = [];
      if (docSnap.exists()) {
        currentHighlights = docSnap.data().items || [];
      }

      const existingIndex = currentHighlights.findIndex(h => h.id === highlightId || h.name === categoryName);
      
      if (existingIndex >= 0) {
        currentHighlights[existingIndex].items.push(storyItem);
      } else {
        currentHighlights.push({
          id: highlightId || uuidv4(),
          name: categoryName || 'New Highlight',
          items: [storyItem],
          timestamp: new Date().toISOString(),
        });
      }

      await setDoc(highlightsRef, { items: currentHighlights });
    } catch (error) {
      console.error('Error toggling highlight:', error);
    }
  }, [currentUser]);

  return {
    stories,
    highlights,
    addStory,
    toggleHighlight,
  };
}
