import React from 'react';
import { Comment } from './Comment';
import { CommentInput } from './CommentInput';
import { useAuth } from '../../context/AuthContext';
import './CommentSection.scss';

export function CommentSection({ comments, postId, onAddComment, onDeleteComment }) {
  const { user: currentUser } = useAuth();
  
  const handleTopLevelSubmit = (text) => {
    const author = {
      name: currentUser?.name || currentUser?.username || 'Unknown User',
      username: currentUser?.username || 'unknown',
      avatar: currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.username || 'User'}&background=random`,
    };
    onAddComment(postId, null, text, author);
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <CommentInput onSubmit={handleTopLevelSubmit} placeholder="Add a comment..." />
      </div>
      
      <div className="comments-list">
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              postId={postId}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
          ))
        ) : (
          <p className="no-comments">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
