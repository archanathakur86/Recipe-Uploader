import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './signin.css';

export default function SignIn({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      onAuth && onAuth(data.user);
      nav('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Signin failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="signin-split">
      <aside className="signin-left">
        <div className="branding">
            <div className="logo-wrap">
              <svg className="hp-check" viewBox="0 0 24 24" width="46" height="46" aria-hidden>
                <circle cx="12" cy="12" r="10" fill="#FF7A2D" />
                <path d="M8.2 12.8l1.9 1.9 4.2-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div className="brand-text">
                <div className="brand-title">HomePlate</div>
                <div className="brand-tag">Your smart recipe assistant</div>
              </div>
            </div>

          <ul className="features-list">
            <li><span className="dot">🤖</span> AI recipe generation</li>
            <li><span className="dot">🧾</span> Nutrition analysis</li>
            <li><span className="dot">❤️</span> Save your favorites</li>
            <li><span className="dot">🌐</span> Share with community</li>
          </ul>
        </div>
      </aside>

      <main className="signin-right">
        <div className="signin-card">
          <h2>Welcome Back</h2>
          <p className="sub">Sign in to your recipe collection</p>

          <form onSubmit={submit} className="signin-form">
            <label className="field">
              <span className="label-text">Email</span>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="label-text">Password</span>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="signin-btn" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}