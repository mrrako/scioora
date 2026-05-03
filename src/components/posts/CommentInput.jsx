import React, { useState, useRef, useLayoutEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CommentInput.scss';

/** ~1 line initially; grows until this height then scrolls */
const TEXTAREA_MAX_HEIGHT_PX = 160;

export function CommentInput({
  onSubmit,
  placeholder = 'Write a comment...',
  autoFocus = false,
  replyTarget,
}) {
  const { user: currentUser } = useAuth();
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
  }, [text]);

  const submitIfValid = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = 'auto';
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitIfValid();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitIfValid();
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
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
          />
          <button type="submit" disabled={!text.trim()}>Post</button>
        </div>
      </div>
    </form>
  );
}
