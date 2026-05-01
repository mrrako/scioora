import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from './Comment';
import { CommentInput } from './CommentInput';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import './CommentSection.scss';

export function CommentSection({ postId, onAddComment, onDeleteComment }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

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
    await onAddComment(postId, text, parentId);
    // onSnapshot will handle the update
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
