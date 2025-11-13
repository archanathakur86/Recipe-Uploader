import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './signup.css';

export default function SignUp({ onAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    if (password !== confirm) return alert('Passwords do not match');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', data.token);
      onAuth && onAuth(data.user);
      nav('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="signup-split">
      <aside className="signup-left">
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

      <main className="signup-right">
        <div className="signup-card">
          <h2>Create Your Account</h2>
          <p className="sub">Start your culinary journey today</p>

          <form onSubmit={submit} className="signup-form">
            <label className="field">
              <span className="label-text">Username</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Choose a username" required />
            </label>

            <label className="field">
              <span className="label-text">Email</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            </label>

            <label className="field">
              <span className="label-text">Password</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
            </label>

            <label className="field">
              <span className="label-text">Confirm Password</span>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your password" required />
            </label>

            <button type="submit" className="signup-btn" disabled={busy}>{busy ? 'Creating...' : 'Sign Up'}</button>

            <div className="signin-link">Already have an account? <Link to="/signin">Sign in</Link></div>
          </form>
        </div>
      </main>
    </div>
  );
}