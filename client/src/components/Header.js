import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useRef } from 'react';
import Profile from './Profile';

export default function Header() {
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [user, setUser] = useState(() => {
    try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('overview');
  const [profileEdit, setProfileEdit] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [menuOpen]);

  useEffect(() => {
    const onStorage = () => {
      try { const raw = localStorage.getItem('user'); setUser(raw ? JSON.parse(raw) : null); } catch (e) { setUser(null); }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  return (
    <header className="app-header">
      <div className="logo">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="#FF7A2D" />
          <path d="M8.2 12.8l1.9 1.9 4.2-5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span style={{ marginLeft: 8, fontWeight: 800 }}>HomePlate</span>
      </div>

      <nav>
        <Link to="/">Home</Link>
  <Link to="/feed">Feed</Link>
        <Link to="/profile">Profile</Link>
        {token ? (
          <div className="header-user" ref={menuRef}>
            {user && user.avatarUrl ? (
              <img className="header-avatar" title={user.email || user.name} aria-label={user.email || user.name} src={user.avatarUrl.startsWith('http') ? user.avatarUrl : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + user.avatarUrl} alt={user.name || 'avatar'} />
            ) : null}
            <button className="header-username" onClick={() => setMenuOpen(o => !o)}>{user ? (user.name || user.id || 'Profile') : 'Profile'}</button>
            <button className="link-like" onClick={logout}>Logout</button>
      {menuOpen && (
              <div className="header-dropdown">
                <button className="header-dropdown-item" onClick={() => { setProfileTab('overview'); setProfileOpen(true); setMenuOpen(false); }}>My Profile</button>
                <button className="header-dropdown-item" onClick={() => { setProfileTab('overview'); setProfileEdit(true); setProfileOpen(true); setMenuOpen(false); }}>Edit Profile</button>
                <button className="header-dropdown-item" onClick={() => { setProfileTab('my'); setProfileOpen(true); setMenuOpen(false); }}>My Recipes</button>
                <button className="header-dropdown-item" onClick={() => { setProfileTab('fav'); setProfileOpen(true); setMenuOpen(false); }}>Favorites</button>
                <button className="header-dropdown-item" onClick={() => { setProfileTab('settings'); setProfileOpen(true); setMenuOpen(false); }}>Settings</button>
                <button className="header-dropdown-item" onClick={() => { setProfileTab('manage'); setProfileOpen(true); setMenuOpen(false); }}>Manage Account</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signin">Sign In</Link>
        )}
      </nav>
      {profileOpen && (
        <div className="header-profile-modal" onClick={() => { setProfileOpen(false); setProfileEdit(false); }}>
          <div className="header-profile-content" onClick={e => e.stopPropagation()}>
            <button className="header-profile-close" onClick={() => { setProfileOpen(false); setProfileEdit(false); }}>✕</button>
            <Profile defaultTab={profileTab} defaultEdit={profileEdit} />
          </div>
        </div>
      )}
    </header>
  );
}