import React, { useState } from 'react';
import { Send, Image, Smile, Paperclip } from 'lucide-react';
import './MessageInput.scss';

export function MessageInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <div className="input-actions">
        <button type="button" className="icon-btn"><Paperclip size={20} /></button>
        <button type="button" className="icon-btn"><Image size={20} /></button>
      </div>
      <div className="input-wrapper">
        <textarea 
          placeholder="Type a message..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button type="button" className="icon-btn"><Smile size={20} /></button>
      </div>
      <button 
        type="submit" 
        className="send-btn" 
        disabled={!text.trim() || disabled}
      >
        <Send size={20} />
      </button>
    </form>
  );
}
