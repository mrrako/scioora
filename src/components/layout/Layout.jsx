import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { useNotifications } from '../../hooks/useNotifications';

export function Layout() {
  useNotifications(); // Global listener for all pages under Layout
  return (
    <div className="app-container">
      <div className="mesh-background"></div>
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
