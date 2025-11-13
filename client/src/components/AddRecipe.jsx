import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import RecipeModal from './RecipeModal';
import './addrecipe.css';

export default function AddRecipe({ user }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [calories, setCalories] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flavors, setFlavors] = useState('');
  const [taste, setTaste] = useState('');

  const onFile = e => {
    const f = e.target.files && e.target.files[0];
    setImage(f || null);
  };

  const [createdRecipe, setCreatedRecipe] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!user && !localStorage.getItem('token')) return alert('Please sign in to add recipes');
    if (!title.trim()) return alert('Please enter a title');
    if (!flavors.trim()) return alert('Please enter flavors (comma-separated)');
    if (!ingredientsText.trim()) return alert('Please add ingredients');
    if (!instructions.trim()) return alert('Please add instructions');
    if (!image) return alert('Please upload an image');

    const ingredients = ingredientsText.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const [name, qty] = line.split('|').map(s => s && s.trim());
      return { name: name || line, quantity: qty || '' };
    });

    const form = new FormData();
    form.append('title', title);
    form.append('instructions', instructions);
    form.append('ingredients', JSON.stringify(ingredients));
    form.append('caloriesTotal', calories || '0');
    form.append('isPublic', isPublic);
    form.append('flavors', flavors);
    form.append('taste', taste);
    if (image) form.append('image', image);

    setBusy(true);
    try {
      const res = await api.post('/recipes', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      // prefer navigating to the new recipe view if server returns created recipe
      if (res && res.data && res.data._id) {
        // show preview modal; closing it returns to dashboard
        setCreatedRecipe(res.data);
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save recipe');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="add-recipe-root container">
      <h2>Create Your Recipe</h2>
      <form className="add-recipe-form form-grid" onSubmit={submit}>
        <div className="col-left">
          <label style={{ marginBottom: 12 }}>
            <div className="label">Recipe Title</div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Creamy Pasta Carbonara" required />
          </label>

          <label>
            <div className="label">Taste (optional)</div>
            <input value={taste} onChange={e => setTaste(e.target.value)} placeholder="e.g., spicy, tangy, garlicky" />
          </label>

          <label style={{ marginTop: 12 }}>
            <div className="label">Flavors (comma-separated)</div>
            <input value={flavors} onChange={e => setFlavors(e.target.value)} placeholder="e.g., spicy, herby, creamy" required />
          </label>

          <label style={{ marginTop: 12, marginBottom: 12 }}>
            <div className="label">Ingredients</div>
            <textarea value={ingredientsText} onChange={e => setIngredientsText(e.target.value)} placeholder={`List each ingredient on a new line...\nSpaghetti\nPancetta\nEggs`} required />
          </label>

          <label>
            <div className="label">Total Calories</div>
            <input value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g., 520" />
          </label>
        </div>

        <div className="col-right">
          <label>
            <div className="label">Upload an Image</div>
            <div className="upload-box">
              <input type="file" accept="image/*" onChange={onFile} required />
              <div className="upload-hint">Click to browse or drag your image here</div>
            </div>
          </label>

          <label style={{ marginBottom: 12 }}>
            <div className="label">Instructions</div>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Describe the cooking steps in detail..." rows={6} required />
          </label>

          <label style={{ marginTop: 12 }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
            <span style={{ marginLeft: 8 }}>Make this recipe public (visible in Feed)</span>
          </label>
        </div>

        <div className="actions actions-row">
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save Recipe'}</button>
          <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
        </div>
      </form>
      <RecipeModal open={!!createdRecipe} recipe={createdRecipe} onClose={() => { setCreatedRecipe(null); navigate('/dashboard'); }} />
    </div>
  );
}
