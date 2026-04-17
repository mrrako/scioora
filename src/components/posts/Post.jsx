import React, { useState, memo } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2, Trash2, Edit2 } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { countComments } from '../../hooks/usePosts';
import './Post.scss';

export const Post = memo(({ post, onDelete, onEdit, onLike, onAddComment, onDeleteComment }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderContentWithHashtags = (text) => {
    if (typeof text !== 'string') {
      // Handle the case where text is an object (corrupted post data)
      if (text && typeof text === 'object') {
        return text.content || 'Content unavailable';
      }
      return String(text);
    }
    const regex = /(#[a-zA-Z0-9_]+)/g;
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return <span key={index} className="hashtag">{part}</span>;
      }
      return part;
    });
  };

  const handleSaveEdit = () => {
    onEdit(post.id, editContent, post.image);
    setIsEditing(false);
  };

  const totalComments = Array.isArray(post.comments) ? countComments(post.comments) : post.comments;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-info">
          <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
          <div>
            <h4 className="author-name">{post.author.name}</h4>
            <span className="author-username">@{post.author.username}</span>
            <span className="dot-separator">·</span>
            <span className="post-time">{formatTimestamp(post.timestamp)}</span>
          </div>
        </div>
        
        <div className="post-menu-container">
          <button className="icon-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MoreHorizontal size={20} />
          </button>
          
          {isMenuOpen && (
            <div className="post-menu">
              <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}>
                <Edit2 size={16} /> Edit
              </button>
              <button className="delete-btn" onClick={() => { onDelete(post.id); setIsMenuOpen(false); }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        {isEditing ? (
          <div className="edit-area">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="edit-actions">
              <button onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        ) : (
          <p>{renderContentWithHashtags(post.content)}</p>
        )}
      </div>

      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Post content" />
        </div>
      )}

      <div className="post-actions">
        <button 
          className={`action-btn ${showComments ? 'active' : ''}`} 
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} />
          <span>{totalComments}</span>
        </button>
        <button 
          className={`action-btn like ${post.isLiked ? 'active' : ''}`}
          onClick={() => onLike(post.id)}
        >
          <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
          <span>{post.likes}</span>
        </button>
        <button className="action-btn">
          <Share2 size={18} />
        </button>
      </div>

      {showComments && (
        <CommentSection 
          comments={post.comments} 
          postId={post.id}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      )}
    </div>
  );
});

Post.displayName = 'Post';
