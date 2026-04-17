import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from './Comment';
import { CommentInput } from './CommentInput';
import api from '../../services/api';
import './CommentSection.scss';

export function CommentSection({ postId, onAddComment, onDeleteComment }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get(`/comments/${postId}`);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleTopLevelSubmit = async (text) => {
    const newComment = await onAddComment(postId, text);
    if (newComment) {
      setComments((prev) => [newComment, ...prev]);
    }
  };

  const handleDelete = async (commentId) => {
    const success = await onDeleteComment(postId, commentId);
    if (success) {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    }
  };

  const handleReply = async (text, parentId) => {
    const newComment = await onAddComment(postId, text, parentId);
    if (newComment) {
      // Refresh to get nested structure correctly or update locally
      fetchComments();
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <CommentInput onSubmit={handleTopLevelSubmit} placeholder="Add a comment..." />
      </div>
      
      <div className="comments-list">
        {loading ? (
          <p className="loading-comments">Loading comments...</p>
        ) : comments && comments.length > 0 ? (
          comments.map(comment => (
            <Comment 
              key={comment._id} 
              comment={comment} 
              postId={postId}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="no-comments">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
