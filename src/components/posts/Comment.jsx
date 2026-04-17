import React, { useState } from 'react';
import { CommentInput } from './CommentInput';
import { Trash2, CornerDownRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Comment.scss';

export function Comment({ comment, postId, onAddComment, onDeleteComment, depth = 0 }) {
  const { user: currentUser } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleReplySubmit = (text) => {
    const author = {
      name: currentUser?.name || currentUser?.username || 'Unknown User',
      username: currentUser?.username || 'unknown',
      avatar: currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.username || 'User'}&background=random`,
    };
    onAddComment(postId, comment.id, text, author);
    setShowReplyInput(false);
  };

  return (
    <div className={`comment-thread depth-${depth}`}>
      <div className="comment-body">
        <img src={comment.author.avatar} alt={comment.author.name} className="comment-avatar" />
        
        <div className="comment-content-wrapper">
          <div className="comment-bubble">
            <div className="comment-header">
              <span className="author-name">{comment.author.name}</span>
              <span className="timestamp">{formatTimestamp(comment.timestamp)}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
          
          <div className="comment-actions">
            <button className="action-btn reply" onClick={() => setShowReplyInput(!showReplyInput)}>
              <CornerDownRight size={14} /> Reply
            </button>
            <button className="action-btn delete" onClick={() => onDeleteComment(postId, comment.id)}>
              <Trash2 size={14} /> Delete
            </button>
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
                  key={reply.id} 
                  comment={reply} 
                  postId={postId}
                  onAddComment={onAddComment}
                  onDeleteComment={onDeleteComment}
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
