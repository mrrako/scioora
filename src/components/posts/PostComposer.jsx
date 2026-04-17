import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Image as ImageIcon, Smile, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../../context/AuthContext';
import './PostComposer.scss';

export function PostComposer({ onPost }) {
  const { user: currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onEmojiClick = (emojiObject) => {
    setContent((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = () => {
    if (!content.trim() && !image) return;

    onPost(content.trim(), image);
    setContent('');
    setImage(null);
  };

  return (
    <div className="post-composer">
      <div className="composer-top">
        <img 
          src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.username}&background=random`} 
          alt="Avatar" 
          className="composer-avatar" 
        />
        <div className="composer-input-area">
          <textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={content.split('\n').length > 2 ? content.split('\n').length : 2}
          />
          {image && (
            <div className="image-preview">
              <img src={image} alt="Preview" />
              <button className="remove-image-btn" onClick={removeImage}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="composer-actions">
        <div className="action-buttons">
          <button 
            className="icon-btn" 
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          
          <div className="emoji-picker-container">
            <button 
              className="icon-btn" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add Emoji"
            >
              <Smile size={20} />
            </button>
            {showEmojiPicker && (
              <div className="emoji-popover">
                <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
              </div>
            )}
          </div>
        </div>
        
        <button 
          className="post-btn" 
          onClick={handleSubmit}
          disabled={!content.trim() && !image}
        >
          Post
        </button>
      </div>
    </div>
  );
}
