import React, { useState } from 'react';
import api from '../services/api';

export default function RecipeEditor({ onCreate }) {
  const [title, setTitle] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [image, setImage] = useState(null);

  const submit = async e => {
    e.preventDefault();
    const ingredients = ingredientsText.split('\n').filter(Boolean).map(line => {
      const [name, qty] = line.split('|').map(s => s && s.trim());
      return { name: name || line, quantity: qty || '' };
    });
    const form = new FormData();
    form.append('title', title);
    form.append('instructions', instructions);
    form.append('ingredients', JSON.stringify(ingredients));
    if (image) form.append('image', image);
    try {
      await api.post('/recipes', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle(''); setIngredientsText(''); setInstructions(''); setImage(null);
      onCreate();
    } catch (err) {
      alert('Create failed');
    }
  };

  return (
    <form onSubmit={submit} className="card">
      <h4>New Recipe</h4>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={ingredientsText} onChange={e => setIngredientsText(e.target.value)} placeholder="Ingredients (one per line; optional: name|qty)"></textarea>
      <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Instructions"></textarea>
      <input type="file" onChange={e => setImage(e.target.files[0])} />
      <button type="submit">Add Recipe</button>
    </form>
  );
}