import React, { useState } from 'react';
import { CommentInput } from './CommentInput';
import { Trash2, CornerDownRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Comment.scss';

export function Comment({ comment, postId, onReply, onDelete, depth = 0 }) {
  const { user: currentUser } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleReplySubmit = (text) => {
    onReply(text, comment._id);
    setShowReplyInput(false);
  };

  const isOwner = currentUser?._id === comment.user?._id;

  return (
    <div className={`comment-thread depth-${depth}`}>
      <div className="comment-body">
        <img 
          src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.username}&background=random`} 
          alt={comment.user?.name} 
          className="comment-avatar" 
        />
        
        <div className="comment-content-wrapper">
          <div className="comment-bubble">
            <div className="comment-header">
              <span className="author-name">{comment.user?.name}</span>
              <span className="timestamp">{formatTimestamp(comment.createdAt)}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
          
          <div className="comment-actions">
            <button className="action-btn reply" onClick={() => setShowReplyInput(!showReplyInput)}>
              <CornerDownRight size={14} /> Reply
            </button>
            {isOwner && (
              <button className="action-btn delete" onClick={() => onDelete(comment._id)}>
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>

          {showReplyInput && (
            <div className="reply-input-container">
              <CommentInput onSubmit={handleReplySubmit} autoFocus placeholder="Write a reply..." />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="nested-replies">
              {comment.replies.map(reply => (
                <Comment 
                  key={reply._id} 
                  comment={reply} 
                  postId={postId}
                  onReply={onReply}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
