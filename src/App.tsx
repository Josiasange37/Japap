import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import CreatePostPage from './pages/Create';
import Trending from './pages/Trending';
import Notifications from './pages/Notifications';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CommunityGuidelines from './pages/CommunityGuidelines';
import { useApp } from './context/AppContext';

function App() {
  const { user } = useApp();

  // If user hasn't finished onboarding, force them there
  const isOnboarded = user?.onboarded;

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={!isOnboarded ? <Onboarding /> : <Navigate to="/" replace />}
      />

      <Route
        path="/"
        element={isOnboarded ? <Home /> : <Navigate to="/onboarding" replace />}
      />

      <Route
        path="/profile"
        element={isOnboarded ? <Profile /> : <Navigate to="/onboarding" replace />}
      />

      <Route
        path="/create"
        element={isOnboarded ? <CreatePostPage /> : <Navigate to="/onboarding" replace />}
      />

      <Route
        path="/trending"
        element={isOnboarded ? <Trending /> : <Navigate to="/onboarding" replace />}
      />

      <Route
        path="/notifications"
        element={isOnboarded ? <Notifications /> : <Navigate to="/onboarding" replace />}
      />

      {/* Public Pages (Always accessible for AdSense bots) */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/guidelines" element={<CommunityGuidelines />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
