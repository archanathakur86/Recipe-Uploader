import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import RecipeView from './components/RecipeView';
import Landing from './components/Landing';
import NewUserDashboard from './components/NewUserDashboard';
import ExistingUserDashboard from './components/ExistingUserDashboard';
import PublicFeed from './components/PublicFeed';
import AddRecipe from './components/AddRecipe';
import MyRecipes from './components/MyRecipes';
import Profile from './components/Profile';
import PublicProfile from './components/PublicProfile';
import './styles/main.css';
import ProfileDrawer from './components/ProfileDrawer';
import api from './services/api';
import { useCallback } from 'react';
import RecipeDetail from './components/RecipeDetail';
import CookingMode from './components/CookingMode';

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // update app-level user when profile edits are saved elsewhere
  useEffect(() => {
    const onUserUpdated = (e) => {
      if (e?.detail) setUser(e.detail);
    };
    window.addEventListener('userUpdated', onUserUpdated);
    return () => window.removeEventListener('userUpdated', onUserUpdated);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProfile, setDrawerProfile] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const openProfile = useCallback(async (userId) => {
    try {
      setDrawerLoading(true);
      setDrawerOpen(true);
      const res = await api.get(`/users/${userId}/public`);
      setDrawerProfile(res.data);
    } catch (err) {
      console.error('failed to load profile', err);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e?.detail?.id) openProfile(e.detail.id); };
    window.addEventListener('openProfileDrawer', handler);
    return () => window.removeEventListener('openProfileDrawer', handler);
  }, [openProfile]);

  return (
    <div className="app">
  <ProfileDrawer open={drawerOpen} profile={drawerProfile} loading={drawerLoading} onClose={() => setDrawerOpen(false)} />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={
              user && user.name === 'Demo Chef'
                ? <ExistingUserDashboard user={user} />
                : <NewUserDashboard user={user} />
            }
          />
          <Route path="/signin" element={<SignIn onAuth={setUser} />} />
          <Route path="/signup" element={<SignUp onAuth={setUser} />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/recipe/:id/cooking" element={<CookingMode />} />
          <Route path="/recipes" element={<MyRecipes />} />
          <Route path="/feed" element={<PublicFeed />} />
          <Route path="/add" element={<AddRecipe user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/user/:id" element={<PublicProfile />} />
        </Routes>
      </main>
    </div>
  );
}