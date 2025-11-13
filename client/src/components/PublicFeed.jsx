import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './recipeList.css';
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';
import ProfileDrawer from './ProfileDrawer';
import Toast from './Toast';
import AIGenerateModal from './AIGenerateModal';

// Compute canonical taste tags from a recipe
function computeTasteTags(r = {}) {
  const title = String(r.title || '').toLowerCase();
  const cuisine = String(r.cuisine || '').toLowerCase();
  const desc = String(r.description || '').toLowerCase();
  const ings = Array.isArray(r.ingredients) ? r.ingredients.map(x => String(x).toLowerCase()) : [];
  const has = (w) => title.includes(w) || desc.includes(w) || ings.some(i => i.includes(w));
  const tags = new Set();
  // include user-provided taste/flavors
  if (typeof r.taste === 'string' && r.taste.trim()) r.taste.toLowerCase().split(/[\s,]+/).forEach(t=>t&&tags.add(t));
  if (Array.isArray(r.flavors)) r.flavors.map(x=>String(x).toLowerCase()).forEach(t=>t&&tags.add(t));
  // heuristics
  if (has('chilli') || has('chili') || has('pepper') || has('garam masala') || has('red chilli')) tags.add('spicy');
  if (has('tomato') || has('lemon') || has('lime') || has('vinegar') || has('tamarind') || has('yogurt') || has('curd')) tags.add('tangy');
  if (has('garlic')) tags.add('garlicky');
  if (has('basil') || has('oregano') || has('parsley') || has('cilantro') || has('coriander') || has('mint')) tags.add('herby');
  if (has('soy sauce') || has('mushroom') || has('umami')) tags.add('umami');
  if (has('butter') || has('ghee') || has('cream') || has('milk') || has('paneer') || has('cheese')) tags.add('creamy');
  if (has('smoked') || has('smoky') || has('tandoor') || has('charred')) tags.add('smoky');
  if (has('honey') || has('sweet') || has('caramel')) tags.add('sweet');
  if (title.includes('salad') || desc.includes('salad')) tags.add('fresh');
  if (title.includes('pulao') || desc.includes('pulao')) tags.add('fragrant');
  if (cuisine.includes('indian')) tags.add('aromatic');
  if (cuisine.includes('italian')) tags.add('savory');
  // texture hints (optional for search)
  if (has('crisp') || has('crispy')) tags.add('crispy');
  if (has('sauce') || has('gravy')) tags.add('saucy');
  if (has('rice')) tags.add('fluffy');
  if (has('pasta') || has('spaghetti')) tags.add('al dente');
  return Array.from(tags);
}

// Map user inputs to canonical flavor tokens
function extractFlavorTokens(q) {
  const tokens = String(q || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
  const map = {
    spicy: ['spicy','masaledar','teekha','mirchi','hot'],
    tangy: ['tangy','sour','khatta','lemon','lime','tamarind','vinegar','tomato'],
    garlicky: ['garlic','garlicky'],
    herby: ['herb','herby','basil','oregano','parsley','mint','cilantro','coriander'],
    umami: ['umami','soy','soy sauce','mushroom'],
    creamy: ['creamy','rich','butter','ghee','cream','cheese','paneer'],
    smoky: ['smoky','smoked','tandoor','charred'],
    sweet: ['sweet','honey','caramel'],
    savory: ['savory'],
    aromatic: ['aromatic','fragrant'],
    fresh: ['fresh','salad'],
    crispy: ['crispy','crisp'],
    saucy: ['saucy','gravy'],
    fluffy: ['fluffy'],
    'al dente': ['al dente']
  };
  const found = new Set();
  for (const tk of tokens) {
    for (const key of Object.keys(map)) {
      if (key === tk || map[key].includes(tk)) found.add(key);
    }
  }
  return Array.from(found);
}

export default function PublicFeed() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProfile, setDrawerProfile] = useState(null);
  const [modalRecipe, setModalRecipe] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', undoId: null });
  const [offline, setOffline] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [flavorFilter, setFlavorFilter] = useState([]);

  const demoRecipes = [
    { _id: 'demo1', title: 'Herb-Crusted Grilled Salmon', description: 'Demo card shown while API is offline.', imageUrl: '', calories: 380 },
    { _id: 'demo2', title: 'Fresh Garden Salad', description: 'Try starting the backend to see real recipes.', imageUrl: '', calories: 220 }
  ];

  const fetchFeed = async (q) => {
    setLoading(true);
    setError(null);
    setOffline(false);
    try {
      const url = q ? `/recipes/search?q=${encodeURIComponent(q)}` : '/recipes/feed';
      const res = await api.get(url);
      console.log('PublicFeed data:', res.data);
      setRecipes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('PublicFeed fetch error:', err);
      // If backend is unreachable, show demo cards instead of a blank page
      if (!err.response) {
        setOffline(true);
        setError('Backend unreachable (start server on PORT 5000)');
        setRecipes(demoRecipes);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load feed');
        setRecipes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeed(''); }, []);

  // hide known CI/test recipes from the public feed (non-destructive client-side filter)
  const isCiTest = (r) => {
    if (!r || !r.title) return false;
    const t = (r.title || '').toString().toLowerCase();
    if (t.includes('ci test') || t.includes('ci-test') || t.includes('ci_test')) return true;
    if (t === 'test' || t === 'test recipe' || t.includes('test recipe')) return true;
    if (t === 'ci' || t === 'test-only' || t.includes('ci-only')) return true;
    return false;
  };

  const onSearch = (e) => {
    e.preventDefault();
    const flavors = extractFlavorTokens(query);
    if (flavors.length) {
      setFlavorFilter(flavors);
      // fetch full feed for client-side flavor filter
      fetchFeed('');
    } else {
      setFlavorFilter([]);
      fetchFeed(query);
    }
  };

  const openRecipeModal = (r) => setModalRecipe(r);
  const closeModal = () => setModalRecipe(null);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/recipes/${id}`);
      setToast({ open: true, message: 'Recipe deleted', undoId: id });
      fetchFeed(query);
    } catch (err) {
      console.error('delete failed', err);
      alert('Delete failed');
    }
  };

  const undoDelete = async () => {
    try {
      if (!toast.undoId) return;
      await api.post(`/recipes/${toast.undoId}/restore`);
      setToast({ open: false, message: '', undoId: null });
      fetchFeed(query);
    } catch (err) {
      console.error('undo failed', err);
    }
  };

  // Apply client-side flavor filter if set
  const applyFilters = (list) => {
    const base = list.filter(r => !isCiTest(r));
    if (!flavorFilter.length) return base;
    return base.filter(r => {
      const tags = computeTasteTags(r);
      return tags.some(t => flavorFilter.includes(t));
    });
  };

  return (
    <div className="rl-root">
      <div className="feed-header">
        <h2><span className="feed-icon" aria-hidden>🍽</span> Public Feed</h2>
        <form className="feed-search" onSubmit={onSearch}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by dish, user or flavor (e.g., spicy, tangy)" />
          <button type="submit" className="search-btn">Search</button>
          <button type="button" className="clear-btn" onClick={() => { setQuery(''); setFlavorFilter([]); fetchFeed(''); }}>Clear</button>
        </form>
      </div>

      {error && (
        <div className="feed-error">
          <div>{error}</div>
          <button onClick={() => fetchFeed(query)}>Retry</button>
        </div>
      )}

      {offline && (
        <div className="empty" style={{ background:'#fffbf6', border:'1px solid #ffe7d7', borderRadius:10, padding:14 }}>
          Backend offline: start it via “cd server && npm run dev” (PORT=5000). Showing demo recipes.
        </div>
      )}

      {loading ? (
        <div className="rl-grid">Loading...</div>
      ) : (
        <div className="rl-grid wide">
          {applyFilters(recipes).length === 0 ? (
            <div className="empty">No recipes found. Try a different flavor like “herby” or “creamy”.</div>
          ) : (
            applyFilters(recipes).map(r => (
              <div key={r._id || r.id}>
                <RecipeCard recipe={r} onChange={() => fetchFeed(query)} onDelete={handleDelete} onOpen={(rec) => openRecipeModal(rec)} />
              </div>
            ))
          )}
        </div>
      )}

      <RecipeModal open={!!modalRecipe} recipe={modalRecipe} onClose={closeModal} />
      <ProfileDrawer open={drawerOpen} profile={drawerProfile} onClose={() => setDrawerOpen(false)} />
      <Toast open={toast.open} message={toast.message} actionText="Undo" onAction={undoDelete} onClose={() => setToast({ open: false })} />

      {/* Floating AI Recipe button + modal */}
      <button className="ai-fab" title="Generate a recipe from your ingredients" onClick={() => setAiOpen(true)}>
        <span className="ai-fab-icon">✨</span>
        <span className="ai-fab-label">AI Recipe</span>
      </button>
      <AIGenerateModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
