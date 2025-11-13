import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './profile.css';
import estimateCalories from '../services/calorieEstimator';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get(`/users/${id}/public`);
        setProfile(r.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!profile) return <div style={{ padding: 24 }}>Profile not found</div>;

  return (
    <div className="container" style={{ padding: 20 }}>
      <div className="profile-header">
        <div className="profile-meta">
          <div className="avatar">{profile.avatarUrl ? <img src={(profile.avatarUrl.startsWith('http') ? profile.avatarUrl : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + profile.avatarUrl)} alt="avatar" /> : <span>{(profile.name || 'U')[0]}</span>}</div>
          <div>
            <div className="p-name">{profile.name}</div>
            <div className="p-email">{profile.bio}</div>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Shared Recipes</h3>
      {(!profile.recipes || profile.recipes.length === 0) ? (
        <div>No public recipes yet.</div>
      ) : (
        <div className="rl-grid" style={{ marginTop: 12 }}>
          {profile.recipes.map(r => (
            <article key={r._id} className="rl-card">
              <div className="rl-image" style={{ backgroundImage: `url(${r.imageUrl ? ((r.imageUrl.startsWith('http') ? r.imageUrl : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + r.imageUrl)) : '/assets/carbonara.jpg'})` }}>
                <div className="rl-cal">{(r.caloriesTotal && r.caloriesTotal > 0 ? r.caloriesTotal : estimateCalories(r))} cal</div>
              </div>
              <div className="rl-body">
                <h3 className="rl-title"><Link to={`/recipe/${r._id}`}>{r.title}</Link></h3>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
