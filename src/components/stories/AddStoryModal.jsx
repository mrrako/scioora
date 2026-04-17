import React, { useState } from 'react';
import { X, Image, Type } from 'lucide-react';
import './AddStoryModal.scss';

export function AddStoryModal({ onClose, onAdd }) {
  const [image, setImage] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (image || text) {
      onAdd({ image: image || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', text });
      onClose();
    }
  };

  return (
    <div className="add-story-overlay" onClick={onClose}>
      <div className="add-story-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Story</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><Image size={18} /> Image URL (Optional)</label>
            <input 
              type="text" 
              placeholder="Paste image link here..." 
              value={image}
              onChange={e => setImage(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label><Type size={18} /> Story Text</label>
            <textarea 
              placeholder="Type your story message..." 
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
            />
          </div>

          <div className="preview-placeholder">
            {image ? (
              <img src={image} alt="Preview" className="image-preview" />
            ) : (
              <div className="empty-preview">
                <Image size={48} />
                <p>Preview will appear here</p>
              </div>
            )}
            {text && <p className="text-overlay">{text}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="add-btn" disabled={!image && !text}>Add to Story</button>
          </div>
        </form>
      </div>
    </div>
  );
}
