import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useFollow } from '../hooks/useFollow';
import { ProfileCard } from '../components/profile/ProfileCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { useStories } from '../hooks/useStories';
import './Profile.scss';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const { isFollowing, toggleFollow, loading: followLoading } = useFollow();
  const { highlights } = useStories();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Determine which user profile we are viewing
  const profileUser = useMemo(() => {
    if (!username || (currentUser && username === currentUser.username)) {
      return currentUser;
    }
    const allUsers = authService.getUsers();
    return allUsers.find(u => u.username === username);
  }, [username, currentUser]);

  const isOwnProfile = !username || (currentUser && username === currentUser.username);

  const handleSaveProfile = (updatedData) => {
    authService.updateUser(currentUser.id, updatedData);
    refreshUser();
  };

  if (!profileUser) {
    return (
      <div className="profile-page error">
        <h2>User not found</h2>
        <p>The profile you are looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileCard 
          profileData={{
            ...profileUser,
            stats: {
              posts: 124, // Mock stats for demo
              followers: profileUser.followers?.length || 0,
              following: profileUser.following?.length || 0,
            }
          }} 
          onEditClick={isOwnProfile ? () => setIsEditModalOpen(true) : null}
          isFollowing={isFollowing(profileUser.id)}
          onFollowClick={() => toggleFollow(profileUser.id)}
          followLoading={followLoading}
          showFollowButton={!isOwnProfile}
        />
        
        {highlights.length > 0 && isOwnProfile && (
          <div className="highlights-section">
            <h3>Highlights</h3>
            <div className="highlights-list">
              {highlights.map(h => (
                <div key={h.id} className="highlight-item">
                  <div className="highlight-circle">
                    <img src={h.items[0].image} alt={h.name} />
                  </div>
                  <span>{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          name: profileUser.name || profileUser.username,
          username: profileUser.username,
          bio: profileUser.bio,
          location: profileUser.location || '',
          website: profileUser.website || '',
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
