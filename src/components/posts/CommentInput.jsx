import React, { useState } from 'react';
import './CommentInput.scss';

export function CommentInput({ onSubmit, placeholder = "Write a comment...", autoFocus = false }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form className="comment-input-form" onSubmit={handleSubmit}>
      <img 
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" 
        alt="Avatar" 
        className="comment-avatar"
      />
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
    </form>
  );
}
