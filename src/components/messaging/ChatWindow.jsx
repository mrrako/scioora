import React, { useEffect, useRef } from 'react';
import { MessageSquare, Phone, Video, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ChatWindow.scss';

export function ChatWindow({ chat, messages, isTyping }) {
  const { user: currentUser } = useAuth();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!chat) {
    return (
      <div className="chat-window-empty">
        <MessageSquare size={64} />
        <h3>Select a chat to start messaging</h3>
      </div>
    );
  }

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="user-info">
          <img src={chat.user.avatar} alt={chat.user.name} className="chat-avatar" />
          <div>
            <h4>{chat.user.name}</h4>
            <span className={`status ${chat.user.status}`}>{chat.user.status}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn"><Phone size={20} /></button>
          <button className="icon-btn"><Video size={20} /></button>
          <button className="icon-btn"><Info size={20} /></button>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`message-wrapper ${isMe ? 'sent' : 'received'}`}>
              {!isMe && <img src={chat.user.avatar} alt="" className="message-avatar" />}
              <div className="message-bubble">
                <p>{msg.text}</p>
                <span className="timestamp">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="message-wrapper received">
            <img src={chat.user.avatar} alt="" className="message-avatar" />
            <div className="message-bubble typing">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
