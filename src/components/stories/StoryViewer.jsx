import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, Bookmark } from 'lucide-react';
import './StoryViewer.scss';

export function StoryViewer({ stories, initialUserIndex, onClose, onToggleHighlight }) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentUser = stories[currentUserIndex];
  const currentItem = currentUser.items[currentItemIndex];

  const handleNext = useCallback(() => {
    if (currentItemIndex < currentUser.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentItemIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentItemIndex, currentUserIndex, stories, onClose]);

  const handlePrev = useCallback(() => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentItemIndex(stories[currentUserIndex - 1].items.length - 1);
      setProgress(0);
    }
  }, [currentItemIndex, currentUserIndex, stories]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (100 * 50ms)

    return () => clearInterval(timer);
  }, [handleNext, currentItemIndex, currentUserIndex]);

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer-content" onClick={e => e.stopPropagation()}>
        <div className="progress-bars">
          {currentUser.items.map((_, idx) => (
            <div key={idx} className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: idx < currentItemIndex ? '100%' : idx === currentItemIndex ? `${progress}%` : '0%' 
                }} 
              />
            </div>
          ))}
        </div>

        <div className="story-header">
          <div className="user-info">
            <img src={currentUser.user.avatar} alt="" className="avatar" />
            <span className="name">{currentUser.user.name}</span>
            <span className="time">{new Date(currentItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="story-media">
          <img src={currentItem.image} alt="" />
          {currentItem.text && <p className="story-text">{currentItem.text}</p>}
        </div>

        <div className="story-navigation">
          <button className="nav-btn prev" onClick={handlePrev} disabled={currentUserIndex === 0 && currentItemIndex === 0}>
            <ChevronLeft size={32} />
          </button>
          <button className="nav-btn next" onClick={handleNext}>
            <ChevronRight size={32} />
          </button>
        </div>

    <div className="story-footer">
          <input type="text" placeholder={`Reply to ${currentUser.user.name}...`} />
          <div className="footer-actions">
            <button><Heart size={24} /></button>
            <button><Send size={24} /></button>
            <button 
              className="highlight-btn" 
              onClick={() => {
                onToggleHighlight(currentItem, null, 'Saved Stories');
                alert('Added to highlights!');
              }}
            >
              <Bookmark size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
