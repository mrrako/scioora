import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, MessageSquare, Search, Plus } from 'lucide-react';
import { CreatePostModal } from '../posts/CreatePostModal';
import { usePosts } from '../../hooks/usePosts';
import './BottomNav.scss';

export function BottomNav() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { addPost } = usePosts();

  return (
    <>
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Search size={24} />
          <span>Explore</span>
        </NavLink>
        
        <button className="nav-item plus-btn" onClick={() => setIsCreateModalOpen(true)}>
          <div className="plus-icon-wrapper">
            <Plus size={28} />
          </div>
        </button>

        <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={24} />
          <span>Chats</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={24} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onPost={addPost}
      />
    </>
  );
}
