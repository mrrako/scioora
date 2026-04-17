import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { StoryViewer } from './StoryViewer';
import { AddStoryModal } from './AddStoryModal';
import './StoryBar.scss';

export function StoryBar({ stories, onAddStory, onToggleHighlight }) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [showAddStory, setShowAddStory] = useState(false);

  const handleOpenStory = (index) => {
    setSelectedStoryIndex(index);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
  };

  return (
    <div className="story-bar-container">
      <div className="story-bar">
        <div className="story-item add-story" onClick={() => setShowAddStory(true)}>
          <div className="avatar-wrapper">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" alt="Your Story" className="avatar" />
            <div className="plus-icon">
              <Plus size={14} strokeWidth={3} />
            </div>
          </div>
          <span>Your Story</span>
        </div>

        {stories.map((userStory, index) => (
          <div key={userStory.id} className="story-item" onClick={() => handleOpenStory(index)}>
            <div className="avatar-wrapper has-story">
              <img src={userStory.user.avatar} alt={userStory.user.name} className="avatar" />
            </div>
            <span>{userStory.user.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {selectedStoryIndex !== null && (
        <StoryViewer 
          stories={stories} 
          initialUserIndex={selectedStoryIndex} 
          onClose={handleCloseStory}
          onToggleHighlight={onToggleHighlight}
        />
      )}

      {showAddStory && (
        <AddStoryModal 
          onClose={() => setShowAddStory(false)} 
          onAdd={onAddStory}
        />
      )}
    </div>
  );
}
