import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import estimateCalories from '../services/calorieEstimator';
import './newdashboard.css';
import Profile from './Profile';
import RecipeCard from './RecipeCard';

export default function NewUserDashboard({ user }) {
  const navigate = useNavigate();
  const name = (user && user.name) || 'Sakshi Kumari';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const goToAdd = () => {
    // navigate to the dedicated Add Recipe page
    navigate('/add');
  };

  const [stats, setStats] = useState({ totalRecipes: 0, totalCalories: 0, favorites: 0, avgCalories: 0 });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('overview');
  const [profileEdit, setProfileEdit] = useState(false);
  const [myRecipes, setMyRecipes] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const res = await api.get('/recipes/mine');
        const recs = res.data || [];
        const totalRecipes = recs.length;
        const totalCalories = recs.reduce((sum, r) => {
          const c = (r.caloriesTotal && r.caloriesTotal > 0) ? r.caloriesTotal : estimateCalories(r);
          return sum + (Number(c) || 0);
        }, 0);
        const avgCalories = totalRecipes ? Math.round(totalCalories / totalRecipes) : 0;
        const favorites = (user.favorites || []).length || 0;
        if (mounted) {
          setStats({ totalRecipes, totalCalories, favorites, avgCalories });
          setMyRecipes(recs);
        }
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="nud-root">
      <header className="nud-topbar">
        <div className="nud-left">
          <div className="nud-brand">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#FF7A2D" />
              <path d="M8.2 12.8l1.9 1.9 4.2-5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span style={{ marginLeft: 8, fontWeight: 800 }}>HomePlate</span>
          </div>
        </div>
        <div className="nud-center">
          <nav className="nud-nav">
            <Link to="/dashboard" className="active">Dashboard</Link>
            <Link to="/add"><span className="icon-circle">+
            </span> Add Recipe</Link>
            <Link to="/feed">🌐 Public Feed</Link>
          </nav>
        </div>

        <div className="nud-right">
          <div className="nud-user-wrap" ref={null}>
            <button className="nud-user" onClick={(e) => { e.preventDefault(); const el = document.getElementById('nud-user-menu'); if (el) el.classList.toggle('open'); e.currentTarget.classList.toggle('open'); }} aria-haspopup="true" aria-expanded="false">{user && user.avatarUrl ? <img title={user.email || user.name} aria-label={user.email || user.name} src={user.avatarUrl.startsWith('http') ? user.avatarUrl : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + user.avatarUrl} alt="avatar" className="nud-avatar" /> : null}{name} <span className="nud-caret">▾</span></button>
            <div id="nud-user-menu" className="nud-user-menu">
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('overview'); setProfileOpen(true); }}>Overview</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('my'); setProfileOpen(true); }}>My Recipes</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('fav'); setProfileOpen(true); }}>Favorites</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('settings'); setProfileOpen(true); }}>Settings</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('overview'); setProfileEdit(true); setProfileOpen(true); }}>Edit Profile</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('manage'); setProfileOpen(true); }}>Manage Account</a>
            </div>
          </div>
          <button className="nud-logout" onClick={handleLogout}>⤴ Logout</button>
        </div>
      </header>

      <section className="nud-hero">
        <div className="nud-hero-inner">
          <h1>Let's cook something delicious, {name}!</h1>
          <p className="nud-hero-sub">Share recipes, track calories, and inspire the community.</p>
        </div>
      </section>

      {profileOpen && (
        <div className="nud-profile-modal">
          <div className="nud-profile-content">
            <button className="nud-profile-close" onClick={() => { setProfileOpen(false); setProfileEdit(false); }}>✕</button>
            <Profile user={user} defaultTab={profileTab} defaultEdit={profileEdit} />
          </div>
        </div>
      )}

      <section className="nud-stats container">
        <div className="stat-card">
          <div className="stat-num">{stats.totalRecipes}</div>
          <div className="stat-label">Total Recipes</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.totalCalories}</div>
          <div className="stat-label">Total Calories</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.favorites}</div>
          <div className="stat-label">Favorites</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.avgCalories}</div>
          <div className="stat-label">Avg Calories</div>
        </div>
      </section>

      {stats.totalRecipes === 0 ? (
        <main className="nud-empty container">
          <div className="nud-empty-card">
            <h2>No recipes yet</h2>
            <p>Start your culinary journey by adding your first recipe!</p>
            <div className="nud-actions">
              <button className="btn-primary" onClick={goToAdd}>Add Your First Recipe</button>
              <Link className="btn-secondary" to="/feed">Explore Public Feed</Link>
            </div>
          </div>
        </main>
      ) : (
        <main className="nud-recents container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2>Your Recent Recipes</h2>
            <button className="btn-primary" onClick={goToAdd}>Add Recipe</button>
          </div>
          <div className="nud-grid" style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))' }}>
            {myRecipes.slice(0, 8).map(r => (
              <div key={r._id || r.id}>
                <RecipeCard recipe={r} onOpen={(rec) => navigate('/feed')} />
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}