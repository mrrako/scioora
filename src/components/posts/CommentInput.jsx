import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CommentInput.scss';

export function CommentInput({
  onSubmit,
  placeholder = 'Write a comment...',
  autoFocus = false,
  replyTarget,
}) {
  const { user: currentUser } = useAuth();
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  const mention = replyTarget?.username || replyTarget?.name;
  const avatarSrc =
    currentUser?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'User')}&background=random`;

  return (
    <form className={`comment-input-form ${replyTarget ? 'has-reply-target' : ''}`} onSubmit={handleSubmit}>
      {replyTarget && mention && (
        <div className="reply-context-bar">
          <span className="reply-context-label">Replying to</span>
          <span className="reply-context-mention">@{mention}</span>
        </div>
      )}
      <div className="comment-input-row">
        <img src={avatarSrc} alt="" className="comment-avatar" />
        <div className="input-wrapper">
          <input 
            type="text" 
            placeholder={placeholder} 
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus={autoFocus}
          />
          <button type="submit" disabled={!text.trim()}>Post</button>
        </div>
      </div>
    </form>
  );
}
