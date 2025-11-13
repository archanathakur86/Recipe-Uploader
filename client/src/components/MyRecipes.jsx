import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './recipeList.css';
import estimateCalories from '../services/calorieEstimator';
import ConfirmModal from './ConfirmModal';

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/recipes/mine');
      setRecipes(res.data || []);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('unauth');
      } else {
        setError('failed');
      }
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (!pendingDeleteId) return;
    try {
      await api.delete(`/recipes/${pendingDeleteId}`);
      setPendingDeleteId(null);
      load();
    } catch (err) {
      console.error('Failed to delete recipe:', err?.response?.data || err.message || err);
      setError('delete-failed');
    }
  };

  const handleCancelDelete = () => { setConfirmOpen(false); setPendingDeleteId(null); };

  const handleEdit = (id) => navigate(`/recipe/${id}?edit=1`);

  if (loading) return <div style={{padding:24}}>Loading...</div>;

  if (error === 'unauth') {
    return (
      <div style={{padding:24}}>
        <p>Please <Link to="/signin">sign in</Link> to view your recipes.</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div style={{padding:24}}>
        <div className="empty">No recipes yet. <Link to="/add">Add your first recipe</Link></div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '12px 0 18px', color: '#0f172a' }}>My Recipes</h2>
      <div className="rl-grid">
        {recipes.map(r => (
          <article key={r._id} className="rl-card">
            <div
              className="rl-image"
              style={{ backgroundImage: `url(${r.imageUrl ? (r.imageUrl.startsWith('http') ? r.imageUrl : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + r.imageUrl) : '/assets/carbonara.jpg'})` }}
            >
                <div className="rl-cal">{(r.caloriesTotal && r.caloriesTotal > 0 ? r.caloriesTotal : estimateCalories(r))} cal</div>
            </div>

            <div className="rl-body">
              <h3 className="rl-title"><Link to={`/recipe/${r._id}`}>{r.title}</Link></h3>
              <p className="rl-desc">{(r.ingredients || []).map(i => i.name).slice(0,6).join(', ')}</p>
            </div>

            <div className="rl-footer">
              <span className="rl-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              <div className="rl-actions">
                <button className="icon-btn" onClick={() => handleEdit(r._id)}>Edit</button>
                <button className="icon-btn" onClick={() => handleDeleteClick(r._id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Delete recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Yes, delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
