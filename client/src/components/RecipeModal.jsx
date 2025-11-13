import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './recipeModal.css';

export default function RecipeModal({ open, recipe, onClose, ...props }) {
  // Ensure hooks are always called in the same order
  const [editingTaste, setEditingTaste] = useState(false);
  const [tasteStr, setTasteStr] = useState(recipe?.taste || '');
  const [flavorsStr, setFlavorsStr] = useState(Array.isArray(recipe?.flavors) ? recipe.flavors.join(', ') : '');

  useEffect(() => {
    setTasteStr(recipe?.taste || '');
    setFlavorsStr(Array.isArray(recipe?.flavors) ? recipe.flavors.join(', ') : '');
  }, [recipe]);

  const saveTaste = async () => {
    try {
      const payload = {
        taste: (tasteStr || '').trim(),
        flavors: (flavorsStr || '').split(/[,]+/).map(s => s.trim()).filter(Boolean)
      };
      if (recipe?._id) {
        await api.patch(`/recipes/${recipe._id}`, payload);
      }
      if (props.onChange) props.onChange();
      setEditingTaste(false);
    } catch (e) {
      console.error('save taste failed', e);
      alert('Failed to save taste');
    }
  };

  // Guard rendering after hooks
  if (!open || !recipe) return null;

  const ingredients = recipe.ingredients || [];

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal" onClick={e => e.stopPropagation()}>
        <button className="rm-close" onClick={onClose}>✕</button>
        <div className="rm-header">
          <div className="rm-img" style={{ backgroundImage: `url(${recipe.imageUrl || '/assets/placeholder.jpg'})` }} />
          <div className="rm-meta">
            <h2>{recipe.title}</h2>
            <div className="rm-summary">{recipe.summary || recipe.taste || recipe.description || 'Delicious recipe'}</div>

            {/* Taste / Flavors editor block */}
            <div className="rm-taste" style={{ marginTop: 8 }}>
              {!editingTaste ? (
                <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13, color:'#0f172a' }}>Taste</div>
                    <div style={{ fontSize:14, color:'#475569' }}>{recipe?.taste || 'Add a short flavor note (e.g., spicy, tangy, garlicky)'}</div>
                    {Array.isArray(recipe?.flavors) && recipe.flavors.length > 0 && (
                      <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Flavors: {recipe.flavors.join(', ')}</div>
                    )}
                  </div>
                  <button className="btn btn-ghost" onClick={()=>setEditingTaste(true)}>Edit</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, alignItems:'center' }}>
                  <input value={tasteStr} onChange={e=>setTasteStr(e.target.value)} placeholder="Taste summary (e.g., spicy, tangy, garlicky)" />
                  <input value={flavorsStr} onChange={e=>setFlavorsStr(e.target.value)} placeholder="Flavors (comma-separated)" />
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-primary" onClick={saveTaste}>Save</button>
                    <button className="btn" onClick={()=>{ setEditingTaste(false); setTasteStr(recipe?.taste||''); setFlavorsStr(Array.isArray(recipe?.flavors)?recipe.flavors.join(', '):''); }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rm-content">
          <section className="rm-section">
            <h3>Ingredients</h3>
            <ul className="rm-ingredients">
              {ingredients.length === 0 ? <li>No ingredients listed</li> : ingredients.map((ing, idx) => (
                <li key={idx}>{ing.quantity ? `${ing.quantity} ` : ''}{ing.name}</li>
              ))}
            </ul>
          </section>

          <section className="rm-section">
            <h3>How to make</h3>
            <div className="rm-instructions">{recipe.instructions || recipe.strInstructions || 'Instructions not available.'}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
