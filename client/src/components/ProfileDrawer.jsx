import React from 'react';
import './profileDrawer.css';
import api from '../services/api';

export default function ProfileDrawer({ open, onClose, profile, loading }) {
  if (!open) return null;

  const handleFollow = async () => {
    if (!profile || !profile.id) return;
    try {
      await api.post(`/users/${profile.id}/follow`);
      alert('Followed');
    } catch (err) {
      console.error('follow error', err);
      alert('Failed to follow');
    }
  };

  const handleMessage = () => {
    // placeholder behaviour
    alert('Messaging feature coming soon — you can message this user here later.');
  };

  return (
    <div className="pd-overlay" onClick={onClose}>
      <aside className="pd-drawer" onClick={e => e.stopPropagation()}>
        <header className="pd-header">
          <div className="pd-avatar-wrap">
            <img className="pd-avatar" src={profile?.avatarUrl || '/assets/avatar-placeholder.png'} alt={profile?.name} />
          </div>
          <div className="pd-meta">
            <h3>{profile?.name || 'Unknown'}</h3>
            <div className="pd-stats">{(profile?.recipes || []).length} public recipes · {(profile?.followerCount || 0)} followers</div>
          </div>
          <button className="pd-close" onClick={onClose}>✕</button>
        </header>

        <main className="pd-body">
          <section className="pd-bio">
            <h4>About</h4>
            <p>{profile?.bio || 'This user has not added a bio yet.'}</p>
          </section>

          <section className="pd-actions">
            <button className="btn-primary" onClick={handleFollow}>Follow</button>
            <button className="btn-secondary" onClick={handleMessage}>Message</button>
          </section>

          <section className="pd-gallery">
            <h4>Public recipes</h4>
            <div className="pd-grid">
              {(profile?.recipes || []).map(r => (
                <div key={r._id || r.title} className="pd-card" onClick={() => { window.location.href = `/recipe/${r._id}`; }}>
                  <div className="pd-img" style={{ backgroundImage: `url(${r.imageUrl || '/assets/placeholder.jpg'})` }} />
                  <div className="pd-title">{r.title}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </aside>
    </div>
  );
}
