import React from 'react';
import { Home, BarChart2, Users, Settings, LogOut, LayoutDashboard, User, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.scss';
import logo from '../../assets/logo.png';

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="SCIOOORA" className="app-logo" />
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <User size={20} />
              <span>Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/messages" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <MessageCircle size={20} />
              <span>Messages</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <BarChart2 size={20} />
              <span>Analytics</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/audience" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} />
              <span>Audience</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
