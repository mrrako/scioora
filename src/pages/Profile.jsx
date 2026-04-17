import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useFollow } from '../hooks/useFollow';
import { ProfileCard } from '../components/profile/ProfileCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { useStories } from '../hooks/useStories';
import './Profile.scss';

import { usePosts } from '../hooks/usePosts';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const { isFollowing, toggleFollow, loading: followLoading } = useFollow();
  const { highlights } = useStories();
  const { posts: allPosts } = usePosts();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Determine which user profile we are viewing
  const profileUser = useMemo(() => {
    if (!username || (currentUser && username === currentUser.username)) {
      return currentUser;
    }
    const allUsers = authService.getUsers();
    return allUsers.find(u => u.username === username);
  }, [username, currentUser]);

  // Calculate actual posts for this user
  const userPostsCount = useMemo(() => {
    if (!profileUser) return 0;
    // Note: in a real app, this would be a filtered count from the hook
    // For now, let's filter the posts we have access to
    const allStoragePosts = JSON.parse(localStorage.getItem('social-dash-posts-v2') || '[]');
    return allStoragePosts.filter(p => p.authorId === profileUser.id).length;
  }, [profileUser]);

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
              posts: userPostsCount,
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
          avatar: profileUser.avatar,
          banner: profileUser.banner,
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
