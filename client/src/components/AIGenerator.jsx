import React, { useState } from 'react';
import api from '../services/api';

export default function AIGenerator({ user, onCreate }) {
  const [prompt, setPrompt] = useState('');
  const generate = async () => {
    if (!user) return alert('Sign in to use AI');
    try {
      const { data } = await api.post('/ai/generate', { prompt });
      // create recipe from AI result
      await api.post('/recipes', { ...data, ingredients: data.ingredients || [] });
      setPrompt('');
      onCreate();
    } catch (err) {
      alert('AI error');
    }
  };
  return (
    <div className="card ai">
      <h4>AI Recipe Generator</h4>
      <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe dish or ingredients" />
      <button onClick={generate}>Generate</button>
    </div>
  );
}