import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import estimateCalories from '../services/calorieEstimator';
import Toast from './Toast';

export default function RecipeView({ user }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [r, setR] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', undoId: null });

  useEffect(() => { api.get(`/recipes/${id}`).then(res => setR(res.data)).catch(() => setR(null)); }, [id]);

  if (r === null) return <div style={{padding:24}}>Loading...</div>;

  const isOwner = user && r.owner && (user._id === r.owner || user._id === r.owner._id);

  const handleDelete = async () => {
    try {
      await api.delete(`/recipes/${id}`);
      setToast({ open: true, message: 'Recipe deleted', undoId: id });
      // navigate to feed after a short delay so toast is visible
      setTimeout(() => nav('/recipes'), 800);
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const undoDelete = async () => {
    try {
      if (!toast.undoId) return;
      await api.post(`/recipes/${toast.undoId}/restore`);
      setToast({ open: false, message: '', undoId: null });
      // reload recipe
      const res = await api.get(`/recipes/${id}`);
      setR(res.data);
    } catch (err) {
      console.error('Undo failed', err);
      alert('Undo failed');
    }
  };

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>{r.title}</h2>
          {r.owner && (
            <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
              By{' '}
              <a href={`/user/${r.owner._id ? r.owner._id : r.owner}`} onClick={e => { e.preventDefault(); nav(`/user/${r.owner._id ? r.owner._id : r.owner}`); }}>{r.owner.name || (typeof r.owner === 'string' ? r.owner : 'Chef')}</a>
            </div>
          )}
        </div>
        <div>
          {isOwner && (
            <>
              <button style={{ marginRight: 8 }} onClick={() => nav(`/recipe/${id}?edit=1`)}>Edit</button>
              <button onClick={handleDelete} style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8 }}>Delete</button>
            </>
          )}
        </div>
      </div>

      {r.imageUrl && <img src={`${process.env.REACT_APP_API_URL?.replace('/api','') || 'http://localhost:5000'}${r.imageUrl}`} alt="" style={{ width: '100%', marginTop: 12, borderRadius: 10 }} />}
  <div style={{ marginTop: 10 }}><strong>Calories:</strong> {(r.caloriesTotal && r.caloriesTotal > 0 ? r.caloriesTotal : estimateCalories(r))} kcal</div>
      <h4>Ingredients</h4>
      <ul>{(r.ingredients || []).map((ing, i) => <li key={i}>{ing.name} {ing.quantity ? `(${ing.quantity})` : ''} — {ing.calories || '—'} kcal</li>)}</ul>
      <h4>Instructions</h4>
      <p style={{ whiteSpace: 'pre-wrap' }}>{r.instructions}</p>
  <Toast open={toast.open} message={toast.message} actionText="Undo" onAction={undoDelete} onClose={() => setToast({ open: false })} />
    </div>
  );
}