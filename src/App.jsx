import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import SearchPage from './pages/SearchPage';
import Analytics from './pages/Analytics';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import { AnimatePresence, motion } from 'framer-motion';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  useTheme();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <PageWrapper><LoginPage /></PageWrapper>} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <PageWrapper><SignupPage /></PageWrapper>} 
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="profile/:username" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="messages" element={<PageWrapper><Messages /></PageWrapper>} />
            <Route path="search" element={<PageWrapper><SearchPage /></PageWrapper>} />
            <Route path="analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
            <Route path="audience" element={<PageWrapper><div>Audience Page</div></PageWrapper>} />
            <Route path="settings" element={<PageWrapper><div>Settings Page</div></PageWrapper>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
