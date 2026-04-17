import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await api.get('/posts/feed');
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (content, image) => {
    try {
      const response = await api.post('/posts', { content, image });
      if (response.success) {
        // Add current user info to the post for immediate UI update
        const newPost = {
          ...response.data,
          user: {
            _id: currentUser._id,
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar
          }
        };
        setPosts((prev) => [newPost, ...prev]);
        return true;
      }
    } catch (error) {
      console.error('Error adding post:', error);
      return false;
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      if (response.success) {
        setPosts((prev) => prev.filter((post) => post._id !== postId));
        return true;
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  const editPost = async (postId, content, image) => {
    try {
      const response = await api.put(`/posts/${postId}`, { content, image });
      if (response.success) {
        setPosts((prev) =>
          prev.map((post) => (post._id === postId ? { ...post, content, image } : post))
        );
        return true;
      }
    } catch (error) {
      console.error('Error editing post:', error);
      return false;
    }
  };

  const toggleLike = async (postId) => {
    const post = posts.find((p) => p._id === postId);
    const isLiked = post.likes.includes(currentUser._id);
    const endpoint = isLiked ? `/posts/${postId}/unlike` : `/posts/${postId}/like`;

    try {
      const response = await api.post(endpoint);
      if (response.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id === postId) {
              const newLikes = isLiked
                ? p.likes.filter((id) => id !== currentUser._id)
                : [...p.likes, currentUser._id];
              return { ...p, likes: newLikes };
            }
            return p;
          })
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (postId, text, parentId) => {
    try {
      const response = await api.post('/comments', { postId, text, parentId });
      if (response.success) {
        // Since getComments is a separate call, we might want to refresh comments in the UI
        // or update the local state if the component manages it.
        return response.data;
      }
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
    refreshPosts: fetchPosts,
  };
}
