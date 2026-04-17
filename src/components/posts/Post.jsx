import React, { useState, memo } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2, Trash2, Edit2 } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { useAuth } from '../../context/AuthContext';
import './Post.scss';

export const Post = memo(({ post, onDelete, onEdit, onLike, onAddComment, onDeleteComment }) => {
  const { user: currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const authorData = post.user;

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderContentWithHashtags = (text) => {
    if (typeof text !== 'string') return text;
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
    onEdit(post._id, editContent, post.image);
    setIsEditing(false);
  };

  const isLiked = post.likes.includes(currentUser?._id);
  const isOwner = currentUser?._id === authorData?._id;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-info">
          <img src={authorData?.avatar || `https://ui-avatars.com/api/?name=${authorData?.username}&background=random`} alt={authorData?.name} className="author-avatar" />
          <div>
            <h4 className="author-name">{authorData?.name}</h4>
            <span className="author-username">@{authorData?.username}</span>
            <span className="dot-separator">·</span>
            <span className="post-time">{formatTimestamp(post.createdAt)}</span>
          </div>
        </div>
        
        {isOwner && (
          <div className="post-menu-container">
            <button className="icon-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <MoreHorizontal size={20} />
            </button>
            
            {isMenuOpen && (
              <div className="post-menu">
                <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}>
                  <Edit2 size={16} /> Edit
                </button>
                <button className="delete-btn" onClick={() => { onDelete(post._id); setIsMenuOpen(false); }}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
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
          {/* We'll update comment count logic later */}
        </button>
        <button 
          className={`action-btn like ${isLiked ? 'active' : ''}`}
          onClick={() => onLike(post._id)}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{post.likes.length}</span>
        </button>
        <button className="action-btn">
          <Share2 size={18} />
        </button>
      </div>

      {showComments && (
        <CommentSection 
          postId={post._id}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      )}
    </div>
  );
});

Post.displayName = 'Post';
