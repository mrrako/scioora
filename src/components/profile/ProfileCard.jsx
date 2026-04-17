import React from 'react';
import { MapPin, Link as LinkIcon, Calendar, Edit2 } from 'lucide-react';
import './ProfileCard.scss';

export function ProfileCard({ profileData, onEditClick, onFollowClick, isFollowing, followLoading, showFollowButton }) {
  const { name, username, bio, location, website, joinDate, stats, coverPhoto, profilePicture } = profileData;

  return (
    <div className="profile-card">
      <div className="cover-photo" style={{ backgroundImage: `url(${coverPhoto})` }}>
        {onEditClick && (
          <button className="edit-cover-btn" aria-label="Edit Cover Photo">
            <Edit2 size={16} />
          </button>
        )}
      </div>
      
      <div className="profile-info-container">
        <div className="profile-header">
          <div className="profile-picture-wrapper">
            <img src={profilePicture || `https://ui-avatars.com/api/?name=${username}&background=random`} alt={`${name}'s profile`} className="profile-picture" />
            {onEditClick && (
              <button className="edit-avatar-btn" aria-label="Edit Profile Picture">
                <Edit2 size={16} />
              </button>
            )}
          </div>
          
          {onEditClick ? (
            <button className="edit-profile-btn" onClick={onEditClick}>
              Edit Profile
            </button>
          ) : showFollowButton ? (
            <button 
              className={`follow-btn ${isFollowing ? 'following' : ''}`} 
              onClick={onFollowClick}
              disabled={followLoading}
            >
              {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          ) : null}
        </div>

        <div className="profile-details">
          <h1 className="profile-name">{name}</h1>
          <span className="profile-username">@{username}</span>
          
          <p className="profile-bio">{bio}</p>
          
          <div className="profile-meta">
            {location && (
              <span className="meta-item">
                <MapPin size={16} />
                {location}
              </span>
            )}
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="meta-item link">
                <LinkIcon size={16} />
                {website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="meta-item">
              <Calendar size={16} />
              Joined {joinDate}
            </span>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.posts}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.following}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
