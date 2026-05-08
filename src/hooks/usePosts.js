import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { parseFirestoreDate } from '../utils/firestoreDate';
import notificationService from '../services/notificationService';

export const countComments = (comments) => {
  if (!comments || !Array.isArray(comments)) return 0;
  let count = comments.length;
  for (const comment of comments) {
    if (comment.replies && Array.isArray(comment.replies)) count += countComments(comment.replies);
  }
  return count;
};

export function usePosts() {
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadingMore = false;

  useEffect(() => {
    if (!currentUser) return;
    queueMicrotask(() => setLoading(true));

    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map((fireDoc) => {
        const data = fireDoc.data();
        const created = parseFirestoreDate(data.createdAt);
        return {
          _id: fireDoc.id,
          ...data,
          createdAt: created ? created.toISOString() : data.createdAt,
        };
      });
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addPost = async (content, image) => {
    if (!currentUser) return false;
    try {
      const newPost = {
        content,
        image: image || null,
        likes: [],
        createdAt: serverTimestamp(),
        user: {
          _id: currentUser.uid,
          name: currentUser.fullName || currentUser.username || 'User',
          username: currentUser.username,
          avatar: currentUser.avatar || ''
        }
      };
      
      await addDoc(collection(db, 'posts'), newPost);

      // Notify followers about new post
      await notificationService.notifyFollowers(
        currentUser,
        'post',
        'shared a new post',
        '/'
      );

      return true;
    } catch (error) {
      console.error('Error adding post:', error);
      return false;
    }
  };

  const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  const editPost = async (postId, content, image) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { content, image: image || null });
      return true;
    } catch (error) {
      console.error('Error editing post:', error);
      return false;
    }
  };

  const toggleLike = async (postId) => {
    if (!currentUser) return;
    const post = posts.find((p) => p._id === postId);
    if (!post) return;
    
    const isLiked = post.likes.includes(currentUser.uid);
    const postRef = doc(db, 'posts', postId);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });

        // Notify post owner
        if (post.user._id !== currentUser.uid) {
          await notificationService.createNotification({
            recipientId: post.user._id,
            sender: currentUser,
            type: 'like',
            message: 'liked your post',
            link: '/'
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (postId, text, parentId) => {
    if (!currentUser) return null;
    try {
      const newComment = {
        postId,
        text,
        parentId: parentId || null,
        createdAt: serverTimestamp(),
        user: {
          _id: currentUser.uid,
          name: currentUser.fullName || currentUser.username || 'User',
          username: currentUser.username,
          avatar: currentUser.avatar || ''
        }
      };
      const docRef = await addDoc(collection(db, 'comments'), newComment);

      // Notify post owner
      const post = posts.find(p => p._id === postId);
      if (post && post.user._id !== currentUser.uid) {
        await notificationService.createNotification({
          recipientId: post.user._id,
          sender: currentUser,
          type: 'comment',
          message: 'commented on your post',
          link: '/'
        });
      }

      return { _id: docRef.id, ...newComment };
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  };

  return {
    posts,
    loading,
    loadingMore,
    addPost,
    deletePost,
    editPost,
    toggleLike,
    addComment,
    refreshPosts: () => {}, // onSnapshot handles this automatically
  };
}
