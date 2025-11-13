import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import estimateCalories from '../services/calorieEstimator';
import './newdashboard.css';

export default function ExistingUserDashboard({ user }) {
  const navigate = useNavigate();
  const name = (user && user.name) || 'Demo Chef';
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const goToAdd = () => navigate('/add');

  const [stats, setStats] = useState({ totalRecipes: 0, totalCalories: 0, favorites: (user?.favorites || []).length || 0, avgCalories: 0 });

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
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
        if (mounted) setStats({ totalRecipes, totalCalories, favorites, avgCalories });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="nud-root">
      <header className="nud-topbar">
        <div className="nud-left">
          <div className="nud-brand">HomePlate</div>
          <nav className="nud-nav">
            <Link to="/dashboard" className="active">Dashboard</Link>
            <Link to="/add"><span className="icon-circle">+</span> Add Recipe</Link>
            <Link to="/feed">🌐 Public Feed</Link>
          </nav>
        </div>

        <div className="nud-right">
          <Link to="/profile" className="nud-user">{name}</Link>
          <button className="nud-logout" onClick={handleLogout}>⤴ Logout</button>
        </div>
      </header>

      <section className="nud-hero">
        <div className="nud-hero-inner">
          <h1>Let's cook something delicious, {name}!</h1>
          <p className="nud-hero-sub">Share recipes, track calories, and inspire the community.</p>
        </div>
      </section>

      <section className="nud-stats container">
        <div className="stat-card">
          <div className="stat-num">{stats.totalRecipes}</div>
          <div className="stat-label">Total Recipes</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.totalCalories.toLocaleString()}</div>
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

      <section className="container" style={{ paddingTop: 8 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto 20px', display: 'flex', gap: 12 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search recipes by title, ingredients, or instructions..."
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid rgba(15,23,42,0.08)',
              fontSize: 15
            }}
          />
          <button className="btn-primary" onClick={() => {/* implement search */}}>Search</button>
        </div>
      </section>

      <main className="nud-empty container">
        <div className="nud-empty-card">
          <h2>Your recipes</h2>
          <p>You have recipes — they will show here. Use the search above to filter.</p>
          <div className="nud-actions">
            <button className="btn-primary" onClick={goToAdd}>Add New Recipe</button>
            <Link className="btn-secondary" to="/feed">Explore Public Feed</Link>
          </div>
        </div>
      </main>
    </div>
  );
}