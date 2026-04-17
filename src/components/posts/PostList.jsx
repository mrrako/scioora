import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from './Post';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export function PostList({ 
  posts, 
  onDeletePost, 
  onEditPost, 
  onLikePost, 
  onAddComment,
  onDeleteComment,
  hasMore, 
  loadMore, 
  loadingMore 
}) {
  const observerTarget = useRef(null);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <p>No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="post-list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <motion.div key={post._id || Math.random()} variants={itemVariants} layout>
            <Post 
              post={post} 
              onDelete={onDeletePost}
              onEdit={onEditPost}
              onLike={onLikePost}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Infinite Scroll Target */}
      <div ref={observerTarget} style={{ height: '20px', margin: '1rem 0' }}></div>

      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
          <p>Loading more posts...</p>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <p>You've caught up! No more posts to show.</p>
        </div>
      )}
    </motion.div>
  );
}
