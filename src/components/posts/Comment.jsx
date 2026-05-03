import React, { useState } from 'react';
import { CommentInput } from './CommentInput';
import { Trash2, CornerDownRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Comment.scss';
import { formatFirestoreDate } from '../../utils/firestoreDate';

export function Comment({ comment, postId, onReply, onDelete, depth = 0, parentAuthor }) {
  const { user: currentUser } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReplySubmit = (text) => {
    onReply(text, comment._id);
    setShowReplyInput(false);
  };

  const isOwner = currentUser?._id === comment.user?._id;
  const replyTargetHandle = parentAuthor?.username || parentAuthor?.name;

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
            {parentAuthor && replyTargetHandle && (
              <div className="reply-to-line">
                <CornerDownRight size={14} className="reply-to-icon" aria-hidden />
                <span className="reply-to-text">
                  Replying to{' '}
                  <span className="reply-to-mention">@{replyTargetHandle}</span>
                </span>
              </div>
            )}
            <div className="comment-header">
              <span className="author-name">{comment.user?.name}</span>
              <span className="timestamp">{formatFirestoreDate(comment.createdAt) || '—'}</span>
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
              <CommentInput
                onSubmit={handleReplySubmit}
                autoFocus
                placeholder="Write a reply..."
                replyTarget={comment.user}
              />
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
                  parentAuthor={comment.user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
