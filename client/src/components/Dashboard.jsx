import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RecipeCard from './RecipeCard';
import RecipeEditor from './RecipeEditor';
import SearchBar from './SearchBar';
import AIGenerator from './AIGenerator';

export default function Dashboard({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');

  const load = async () => {
    try {
      const res = await api.get(user ? '/recipes/mine' : '/recipes/feed');
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, [user]);

  const onSearch = async q => {
    setQuery(q);
    if (!q) return load();
    const res = await api.get(`/recipes/search?q=${encodeURIComponent(q)}`);
    setRecipes(res.data);
  };

  return (
    <div className="dashboard">
      <div className="panel">
        <SearchBar onSearch={onSearch} />
        <AIGenerator user={user} onCreate={load} />
        {user && <RecipeEditor onCreate={load} />}
      </div>
      <div className="feed">
        {recipes.map(r => <RecipeCard key={r._id} recipe={r} onChange={load} />)}
      </div>
    </div>
  );
}