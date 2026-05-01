import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFollow } from '../hooks/useFollow';
import { ProfileCard } from '../components/profile/ProfileCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { useStories } from '../hooks/useStories';
import { PostList } from '../components/posts/PostList';
import { usePosts } from '../hooks/usePosts'; // needed for some base functions if PostList expects them
import './Profile.scss';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const { isFollowing, toggleFollow, loading: followLoading } = useFollow();
  const { highlights } = useStories();
  const { deletePost, editPost, toggleLike, addComment, deleteComment } = usePosts();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Determine which username to fetch
  const targetUsername = username || currentUser?.username;
  const isOwnProfile = currentUser && targetUsername === currentUser.username;

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        if (!targetUsername) return;
        
        // Fetch User Profile
        const response = await authService.getUserProfile(targetUsername);
        const userData = response.success ? response.data : null;
        if (!userData) throw new Error('User not found');
        setProfileUser(userData);

        // Fetch User Posts
        const postsQuery = query(collection(db, 'posts'), where('user._id', '==', userData.uid));
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        
        // Sort manually by createdAt since Firestore requires a composite index for where + orderBy
        postsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setUserPosts(postsData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUsername]);

  const handleSaveProfile = async (updatedData) => {
    try {
      await authService.updateProfile(updatedData);
      refreshUser();
      // Optimistically update local state
      setProfileUser(prev => ({ ...prev, ...updatedData }));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  if (loading) {
    return <div className="profile-page loading"><p>Loading profile...</p></div>;
  }

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
              posts: userPosts.length,
              followers: profileUser.followers?.length || 0,
              following: profileUser.following?.length || 0,
            }
          }} 
          onEditClick={isOwnProfile ? () => setIsEditModalOpen(true) : null}
          isFollowing={isFollowing(profileUser.uid)}
          onFollowClick={() => toggleFollow(profileUser.uid)}
          followLoading={followLoading}
          showFollowButton={!isOwnProfile}
        />
        
        {highlights && highlights.length > 0 && isOwnProfile && (
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

        <div className="profile-posts-section">
          <h3>Posts</h3>
          <PostList 
            posts={userPosts}
            onDeletePost={deletePost}
            onEditPost={editPost}
            onLikePost={toggleLike}
            onAddComment={addComment}
            onDeleteComment={deleteComment}
          />
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={{
            name: profileUser.name || profileUser.username,
            username: profileUser.username,
            bio: profileUser.bio || '',
            location: profileUser.location || '',
            website: profileUser.website || '',
            avatar: profileUser.avatar,
            banner: profileUser.banner,
          }}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
