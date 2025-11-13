import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RecipeCard from './RecipeCard';
import ConfirmModal from './ConfirmModal';
import './profile.css';

export default function Profile({ user, defaultTab, defaultEdit }) {
  const navigate = useNavigate();
  const [me, setMe] = useState(user || null);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const avatarInput = useRef(null);
  const [tab, setTab] = useState(defaultTab || 'overview');
  const [settingsMsg, setSettingsMsg] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [myRecipes, setMyRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orphans, setOrphans] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !me) {
      navigate('/signin');
      return;
    }

  const load = async () => {
      try {
        const r = await api.get('/users/me');
        setMe(r.data);
    setBioDraft(r.data.bio || '');
  setNameDraft(r.data.name || '');
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [navigate]);

  // follow defaultTab changes from parent (e.g. open profile modal on a specific tab)
  useEffect(() => {
    if (defaultTab) setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!me) return;

  // initialize editing state if parent requested edit mode
  if (defaultEdit) setEditing(true);

    const loadLists = async () => {
      try {
        const mine = await api.get('/recipes/mine');
        setMyRecipes(mine.data || []);

        // refresh orphans when viewing profile (but only when needed)
        try {
          const or = await api.get('/recipes/orphans');
          setOrphans(or.data || []);
        } catch (e) {
          // ignore: orphans endpoint may be restricted or empty
          console.warn('Failed loading orphans', e?.response?.data || e.message || e);
        }

        // load favorite recipes (user.favorites is array of ids)
        const favIds = (me.favorites || []).map(f => f.toString());
        const favs = [];
        for (const id of favIds) {
          try {
            const res = await api.get(`/recipes/${id}`);
            favs.push(res.data);
          } catch (e) { /* ignore missing */ }
        }
        setFavorites(favs);
      } catch (err) {
        console.error(err);
      }
    };

    loadLists();
  }, [me]);

  useEffect(() => {
    if (defaultTab) setTab(defaultTab === 'manage' ? 'manage' : defaultTab);
  }, [defaultTab]);

  const claimOrphan = async (id) => {
    try {
      await api.post(`/recipes/${id}/claim`);
      // refresh lists
      const mine = await api.get('/recipes/mine');
      setMyRecipes(mine.data || []);
      const or = await api.get('/recipes/orphans');
      setOrphans(or.data || []);
    } catch (err) {
      console.error('Claim failed', err);
      alert(err.response?.data?.message || 'Failed to claim recipe');
    }
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    try {
      await api.delete(`/recipes/${id}`);
      const mine = await api.get('/recipes/mine');
      setMyRecipes(mine.data || []);
      // also refresh favorites/orphans
      const or = await api.get('/recipes/orphans');
      setOrphans(or.data || []);
    } catch (err) {
      console.error('Delete failed', err);
      alert(err.response?.data?.message || 'Failed to delete recipe');
    }
  };

  const logoutAccount = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  };

  if (!me) return <div style={{ padding: 24 }}>Loading profile...</div>;

  return (
    <div className="profile-root container" style={{ padding: 20 }}>
      <div className="profile-header">
        <div className="profile-meta">
          <div className="avatar">
            {me.avatarUrl ? <img src={(me.avatarUrl.startsWith('http') ? me.avatarUrl : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + me.avatarUrl)} alt="avatar" /> : <span>{(me.name || 'U')[0]}</span>}
          </div>
          <div>
            <div className="p-name">{me.name || me.email}</div>
            <div className="p-email">{me.email}</div>
          </div>
        </div>

        <div className="profile-stats">
          <div><strong>{myRecipes.length}</strong><div>My Recipes</div></div>
          <div><strong>{favorites.length}</strong><div>Favorites</div></div>
          <div><strong>{me.followerCount || 0}</strong><div>Followers</div></div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={tab==='overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab==='my' ? 'active' : ''} onClick={() => setTab('my')}>My Recipes</button>
        <button className={tab==='fav' ? 'active' : ''} onClick={() => setTab('fav')}>Favorites</button>
  <button className={tab==='settings' ? 'active' : ''} onClick={() => setTab('settings')}>Settings</button>
  <button className={tab==='orphans' ? 'active' : ''} onClick={() => setTab('orphans')}>Orphans</button>
      </div>

      <div className="profile-body">
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{flex:1}}>
                <h3>Welcome, {me.name || 'Chef'}!</h3>
                <p>{me.bio || 'Tell the community about your cooking style.'}</p>
                {!editing ? (
                  <div style={{ marginTop: 12 }}>
                    <button className="btn" onClick={() => setEditing(true)}>Edit profile</button>
                    <Link to="/add" className="btn btn-primary" style={{ marginLeft: 8 }}>Add Recipe</Link>
                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ marginBottom: 8 }}>
                      <label className="label-text">Name</label>
                      <input value={nameDraft} onChange={e => setNameDraft(e.target.value)} style={{ width:'100%', padding:8, marginBottom:8 }} />
                      <label className="label-text">Bio</label>
                      <textarea value={bioDraft} onChange={e => setBioDraft(e.target.value)} rows={4} style={{ width: '100%', padding:8 }} />
                    </div>
                    <div>
                      <label className="label-text">Avatar</label>
                      <input type="file" ref={avatarInput} accept="image/*" />
                      {me.avatarUrl && (
                        <div style={{ marginTop:8 }}>
                          <button className="btn btn-outline" onClick={async () => {
                            try {
                              await api.put('/users/me', { removeAvatar: true });
                              // refresh user
                              const r = await api.get('/users/me');
                              setMe(r.data);
                              try { localStorage.setItem('user', JSON.stringify(r.data)); } catch (e) {}
                            } catch (err) { console.error(err); alert('Failed to remove avatar'); }
                          }}>Delete avatar</button>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop:10 }}>
                      <button className="btn btn-primary" onClick={async () => {
                        const fd = new FormData();
                          fd.append('name', nameDraft || '');
                          fd.append('bio', bioDraft || '');
                          if (avatarInput.current && avatarInput.current.files[0]) fd.append('avatar', avatarInput.current.files[0]);
                          try {
                            const res = await api.put('/users/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                setMe(res.data);
                                try { localStorage.setItem('user', JSON.stringify(res.data)); } catch (e) {}
                                // notify the app that the user object changed
                                try { window.dispatchEvent(new CustomEvent('userUpdated', { detail: res.data })); } catch (e) {}
                            setEditing(false);
                          } catch (err) { console.error(err); alert('Update failed'); }
                      }}>Save</button>
                      <button className="btn" style={{ marginLeft:8 }} onClick={() => { setEditing(false); setBioDraft(me.bio || ''); }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ width:300 }}>
                <h4>Activity</h4>
                <div className="activity-list">
                  {myRecipes.slice(0,5).map(r => (
                    <div key={r._id} className="activity-item">Added recipe <Link to={`/recipe/${r._id}`}>{r.title}</Link></div>
                  ))}
                  {favorites.slice(0,5).map(r => (
                    <div key={r._id} className="activity-item">Favorited <Link to={`/recipe/${r._id}`}>{r.title}</Link></div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-outline" onClick={async () => {
                  try {
                    const res = await api.get(`/users/${me.id || me._id}/followers`);
                    setFollowersList(res.data.followers || []);
                    setShowFollowers(true);
                  } catch (err) { console.error('Load followers', err); alert('Failed to load followers'); }
                }}>View followers</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'my' && (
          <div>
            {myRecipes.length === 0 ? (
              <div>No recipes yet. <Link to="/add">Add your first recipe</Link></div>
            ) : (
              <div className="rl-grid">
                {myRecipes.map(r => <RecipeCard key={r._id} recipe={r} onChange={async () => { const mine = await api.get('/recipes/mine'); setMyRecipes(mine.data || []); }} onDelete={deleteRecipe} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'fav' && (
          <div>
            {favorites.length === 0 ? (
              <div>No favorites yet. Explore the <Link to="/feed">Public Feed</Link>.</div>
            ) : (
              <div className="rl-grid">
                {favorites.map(r => <RecipeCard key={r._id} recipe={r} onChange={() => {}} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div>
            <h3>Settings</h3>
            <div style={{ marginTop:12 }}>
              <h4>Dietary preferences</h4>
              {['Vegetarian','Vegan','Gluten-Free','Dairy-Free','Nut-Free'].map(pref => (
                <label key={pref} style={{ display:'block', marginBottom:8 }}>
                  <input type="checkbox" checked={(me.dietaryPreferences||[]).includes(pref)} onChange={e => {
                    const cur = new Set(me.dietaryPreferences || []);
                    if (e.target.checked) cur.add(pref); else cur.delete(pref);
                    const arr = Array.from(cur);
                    setMe(prev => ({ ...prev, dietaryPreferences: arr }));
                  }} />
                  <span style={{ marginLeft:8 }}>{pref}</span>
                </label>
              ))}
              <div style={{ marginTop:10 }}>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    const prefs = me.dietaryPreferences || [];
                    // send JSON body — server expects JSON for updates
                      const res = await api.put('/users/me', { dietaryPreferences: prefs });
                      // re-fetch authoritative user data so server-side fields (like followerCount) are present
                      const r = await api.get('/users/me');
                      setMe(r.data);
                      try { localStorage.setItem('user', JSON.stringify(r.data)); } catch (e) {}
                      try { window.dispatchEvent(new CustomEvent('userUpdated', { detail: r.data })); } catch (e) {}
                    setSettingsMsg('Preferences saved');
                  } catch (err) { console.error(err); setSettingsMsg('Save failed'); }
                }}>Save preferences</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'manage' && (
          <div className="manage-root">
            <h3>Manage account</h3>

            <div className="manage-grid">
              <div className="manage-card account-card">
                <div className="manage-card-head">Account</div>
                <div className="account-row"><span className="row-label">Email</span><span className="row-value">{me.email}</span></div>
                <div className="account-row"><span className="row-label">User ID</span><span className="row-value">{me.id || me._id}</span></div>
                {me.createdAt && <div className="account-row"><span className="row-label">Created</span><span className="row-value">{new Date(me.createdAt).toLocaleDateString()}</span></div>}
                <div className="manage-actions"><button className="btn btn-outline" onClick={logoutAccount}>Logout</button></div>
              </div>

              <div className="manage-card pw-card">
                <div className="manage-card-head">Change password</div>
                <div className="manage-body">
                  <div className="field"><label className="label-text">Current password</label><input type="password" id="curpass" /></div>
                  <div className="field"><label className="label-text">New password</label><input type="password" id="newpass" /></div>
                  <div className="manage-actions"><button className="btn btn-primary" onClick={async () => {
                    const cur = document.getElementById('curpass').value;
                    const nw = document.getElementById('newpass').value;
                    try {
                      const r = await api.put('/users/me/password', { currentPassword: cur, newPassword: nw });
                      setSettingsMsg(r.data?.message || 'Password changed');
                    } catch (err) { console.error(err); setSettingsMsg(err.response?.data?.message || 'Change failed'); }
                  }}>Change password</button></div>
                </div>
              </div>
            </div>

            <div className="manage-card delete-card">
              <div className="manage-card-head">Delete account</div>
              <div className="manage-body">
                <p style={{ marginTop:6, color:'#7f1d1d' }}>Deleting your account is permanent. All your recipes and data will be removed.</p>
                <div className="manage-actions"><button className="btn btn-danger" onClick={() => setConfirmOpen(true)}>Delete account</button></div>
                {settingsMsg && <div style={{ marginTop:8 }}>{settingsMsg}</div>}
                <ConfirmModal open={confirmOpen} title="Delete account" message="This will permanently remove your account and recipes. Are you sure?" confirmText="Delete" cancelText="Cancel" onConfirm={async () => {
                  try {
                    await api.delete('/users/me');
                    // logout locally
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/signin';
                  } catch (err) { console.error(err); alert('Delete failed'); }
                }} onCancel={() => setConfirmOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {showFollowers && (
          <div className="followers-modal">
            <div className="followers-card">
              <div className="followers-head"><h4>Followers ({followersList.length})</h4><button className="btn" onClick={() => setShowFollowers(false)}>Close</button></div>
              <div className="followers-list">
                {followersList.length === 0 ? <div>No followers yet.</div> : followersList.map(f => (
                  <div key={f._id || f.email} className="f-item">
                    <img src={f.avatarUrl || '/assets/avatar-placeholder.png'} alt={f.name} className="f-avatar" />
                    <div className="f-meta"><div className="f-name">{f.name}</div><div className="f-email">{f.email}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'orphans' && (
          <div>
            <h3>Orphan recipes (created while unauthenticated)</h3>
            {orphans.length === 0 ? (
              <div>No orphan recipes found.</div>
            ) : (
              <div className="orphans-scroll">
                <div className="rl-grid">
                  {orphans.map(r => (
                    <div key={r._id} className="rl-card">
                      <div className="rl-image" style={{ backgroundImage: `url(${r.imageUrl ? (r.imageUrl.startsWith('http') ? r.imageUrl : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + r.imageUrl) : '/assets/carbonara.jpg'})` }} />
                      <div className="rl-body">
                        <h3 className="rl-title">{r.title}</h3>
                        <p className="rl-desc">{r.summary || ((r.ingredients||[]).slice(0,4).map(i=>i.name).join(', '))}</p>
                      </div>
                      <div className="rl-footer" style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <button className="btn" onClick={() => claimOrphan(r._id)}>Claim</button>
                        <span style={{ marginLeft: 'auto' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
