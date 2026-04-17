import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';

const generateMockPosts = () => {
  return [];
};

const PAGE_SIZE = 5;

const addCommentToTree = (comments, parentId, newComment) => {
  if (!parentId) return [...comments, newComment];
  return comments.map(comment => {
    if (comment.id === parentId) return { ...comment, replies: [...comment.replies, newComment] };
    if (comment.replies.length > 0) return { ...comment, replies: addCommentToTree(comment.replies, parentId, newComment) };
    return comment;
  });
};

const deleteCommentFromTree = (comments, commentId) => {
  return comments.filter(comment => comment.id !== commentId).map(comment => {
    if (comment.replies.length > 0) return { ...comment, replies: deleteCommentFromTree(comment.replies, commentId) };
    return comment;
  });
};

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
  const [allPosts, setAllPosts] = useLocalStorage('social-dash-posts-v2', generateMockPosts());

  // Data Migration/Cleanup: Fix any "broken" posts from previous sessions
  useEffect(() => {
    const hasBrokenPosts = allPosts.some(p => typeof p.content !== 'string');
    if (hasBrokenPosts) {
      setAllPosts(prev => prev.map(p => {
        if (typeof p.content !== 'string') {
          // If content is the post object itself (old bug), extract the string
          return { ...p, content: p.content?.content || 'New Post' };
        }
        return p;
      }));
    }
  }, [allPosts, setAllPosts]);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter posts by following list + own posts
  const filteredPosts = useMemo(() => {
    if (!currentUser) return [];
    const followingIds = currentUser.following || [];
    
    return allPosts.filter(post => {
      // Graceful fallback for older posts without authorId
      const authorId = post.authorId || (post.author.username === 'jane_doe' ? 'u-1' : post.author.username === 'alex_johnson' ? 'u-2' : 'u-3');
      return authorId === currentUser.id || followingIds.includes(authorId);
    });
  }, [allPosts, currentUser]);

  const normalizedPosts = useMemo(() => 
    filteredPosts.map(p => ({
      ...p,
      comments: Array.isArray(p.comments) ? p.comments : []
    })), [filteredPosts]);

  const visiblePosts = normalizedPosts.slice(0, page * PAGE_SIZE);
  const hasMore = visiblePosts.length < normalizedPosts.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore, hasMore]);

  const addPost = useCallback((postContent, postImage) => {
    const newPost = {
      id: uuidv4(),
      authorId: currentUser.id,
      author: {
        name: currentUser.name || currentUser.username,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      content: postContent,
      image: postImage,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      isLiked: false,
    };
    setAllPosts((prev) => [newPost, ...prev]);
  }, [currentUser, setAllPosts]);

  const deletePost = useCallback((postId) => {
    setAllPosts((prev) => prev.filter((post) => post.id !== postId));
  }, [setAllPosts]);

  const editPost = useCallback((postId, updatedContent, updatedImage) => {
    setAllPosts((prev) => prev.map((post) => post.id === postId ? { ...post, content: updatedContent, image: updatedImage } : post));
  }, [setAllPosts]);

  const toggleLike = useCallback((postId) => {
    setAllPosts((prev) => prev.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  }, [setAllPosts]);

  const addComment = useCallback((postId, parentId, text, author) => {
    const newComment = { id: uuidv4(), author, text, timestamp: new Date().toISOString(), replies: [] };
    setAllPosts((prev) => prev.map(post => {
      if (post.id === postId) return { ...post, comments: addCommentToTree(Array.isArray(post.comments) ? post.comments : [], parentId, newComment) };
      return post;
    }));
  }, [setAllPosts]);

  const deleteComment = useCallback((postId, commentId) => {
    setAllPosts((prev) => prev.map(post => {
      if (post.id === postId) return { ...post, comments: deleteCommentFromTree(Array.isArray(post.comments) ? post.comments : [], commentId) };
      return post;
    }));
  }, [setAllPosts]);

  return {
    posts: visiblePosts,
    hasMore,
    loadingMore,
    loadMore,
    addPost,
    deletePost,
    editPost,
    toggleLike,
    addComment,
    deleteComment,
    getTrendingHashtags: () => {
      const hashtagMap = {};
      allPosts.forEach(post => {
        if (typeof post.content === 'string') {
          const hashtags = post.content.match(/#[a-zA-Z0-9_]+/g);
          if (hashtags) {
            hashtags.forEach(tag => {
              const normalizedTag = tag.toLowerCase();
              hashtagMap[normalizedTag] = (hashtagMap[normalizedTag] || 0) + 1;
            });
          }
        }
      });
      return Object.entries(hashtagMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }));
    }
  };
}
