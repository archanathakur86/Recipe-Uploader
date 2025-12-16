import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './recipeList.css';
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';
import ProfileDrawer from './ProfileDrawer';
import Toast from './Toast';
import AIGenerateModal from './AIGenerateModal';

export default function PublicFeed() {
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProfile, setDrawerProfile] = useState(null);
  const [modalRecipe, setModalRecipe] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', undoId: null });
  const [offline, setOffline] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const demoRecipes = [
    { _id: 'demo1', title: 'Herb-Crusted Grilled Salmon', description: 'Demo card shown while API is offline.', imageUrl: '', calories: 380 },
    { _id: 'demo2', title: 'Fresh Garden Salad', description: 'Try starting the backend to see real recipes.', imageUrl: '', calories: 220 }
  ];

  const fetchFeed = async () => {
    setLoading(true); setError(null); setOffline(false);
    try {
      const res = await api.get('/recipes/feed');
      const data = Array.isArray(res.data) ? res.data : [];
      console.log('Fetched recipes:', data.length);
      console.log('Sample recipe data:', data[0]);
      setAllRecipes(data);
      setRecipes(data);
    } catch (err) {
      if (!err.response) {
        setOffline(true);
        setError('Backend unreachable (start server on PORT 5000)');
        setRecipes(demoRecipes);
        setAllRecipes(demoRecipes);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load feed');
        setRecipes([]);
        setAllRecipes([]);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFeed(); }, []);

  const isCiTest = (r) => {
    if (!r || !r.title) return false;
    const t = (r.title || '').toLowerCase();
    if (t.includes('ci test') || t.includes('ci-test') || t.includes('ci_test')) return true;
    if (t === 'test' || t === 'test recipe' || t.includes('test recipe')) return true;
    if (t === 'ci' || t === 'test-only' || t.includes('ci-only')) return true;
    return false;
  };

  const handleSearch = (searchQuery) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setRecipes(allRecipes);
      return;
    }
    
    console.log('Searching for:', q);
    
    const filtered = allRecipes.filter(r => {
      // Recipe title
      const title = (r.title || '').toLowerCase();
      
      // Username - check multiple possible fields
      const userName = (r.user?.name || r.userName || r.author?.name || r.createdBy?.name || '').toLowerCase();
      const userEmail = (r.user?.email || r.userEmail || '').toLowerCase();
      
      // Debug log for first search
      if (q && allRecipes.indexOf(r) === 0) {
        console.log('Recipe user data:', {
          'r.user': r.user,
          'r.userName': r.userName,
          'userName variable': userName,
          'searching for': q
        });
      }
      
      // Description
      const description = (r.description || '').toLowerCase();
      
      // Ingredients - check all possible formats
      const ingredients = (r.ingredients || []).map(i => {
        if (typeof i === 'string') return i.toLowerCase();
        return (i.name || i.ingredient || '').toLowerCase();
      }).join(' ');
      
      // Instructions/steps - handle both string and array
      let instructions = '';
      const instructionData = r.instructions || r.steps || '';
      if (typeof instructionData === 'string') {
        instructions = instructionData.toLowerCase();
      } else if (Array.isArray(instructionData)) {
        instructions = instructionData.map(s => {
          if (typeof s === 'string') return s.toLowerCase();
          return (s.text || s.step || '').toLowerCase();
        }).join(' ');
      }
      
      // Tags/categories if available
      const tags = (r.tags || r.categories || []).join(' ').toLowerCase();
      
      // Cuisine type
      const cuisine = (r.cuisine || '').toLowerCase();
      
      // Check if search query matches any field
      const matches = 
        title.includes(q) || 
        userName.includes(q) || 
        userEmail.includes(q) ||
        description.includes(q) || 
        ingredients.includes(q) ||
        instructions.includes(q) ||
        tags.includes(q) ||
        cuisine.includes(q);
      
      if (matches) {
        console.log('Match found:', r.title, 'by', userName || 'unknown user');
      }
      
      return matches;
    });
    
    console.log('Filtered results:', filtered.length, 'out of', allRecipes.length);
    setRecipes(filtered);
  };

  const onSearch = (e) => { e.preventDefault(); handleSearch(query); };
  const openRecipeModal = (r) => setModalRecipe(r);
  const closeModal = () => setModalRecipe(null);

  const handleDelete = async (id) => {
    try { await api.delete(`/recipes/${id}`); setToast({ open: true, message: 'Recipe deleted', undoId: id }); fetchFeed(); }
    catch { alert('Delete failed'); }
  };
  const undoDelete = async () => {
    try { if (!toast.undoId) return; await api.post(`/recipes/${toast.undoId}/restore`); setToast({ open: false, message: '', undoId: null }); fetchFeed(); } catch {}
  };

  const visible = recipes.filter(r => !isCiTest(r));

  return (
    <div className="rl-root">
      <div className="feed-header">
        <h2><span className="feed-icon" aria-hidden>🍽</span> Public Feed</h2>
        <form className="feed-search" onSubmit={onSearch}>
          <input 
            value={query} 
            onChange={e => { 
              setQuery(e.target.value); 
              handleSearch(e.target.value); 
            }} 
            placeholder="🔍 Search by recipe name, username, or ingredients..." 
          />
          <button type="submit" className="search-btn">Search</button>
          <button type="button" className="clear-btn" onClick={() => { setQuery(''); setRecipes(allRecipes); }}>Clear</button>
        </form>
      </div>

      {error && (
        <div className="feed-error"><div>{error}</div><button onClick={() => fetchFeed()}>Retry</button></div>
      )}

      {offline && (
        <div className="empty" style={{ background:'#fffbf6', border:'1px solid #ffe7d7', borderRadius:10, padding:14 }}>
          Backend offline: start it via “cd server && npm run dev” (PORT=5000). Showing demo recipes.
        </div>
      )}

      {loading ? <div className="rl-grid">Loading...</div> : (
        <div className="rl-grid wide">
          {visible.length === 0 ? <div className="empty">No recipes found.</div> : visible.map(r => (
            <div key={r._id || r.id}>
              <RecipeCard recipe={r} onChange={() => fetchFeed()} onDelete={handleDelete} onOpen={openRecipeModal} />
            </div>
          ))}
        </div>
      )}

      <RecipeModal open={!!modalRecipe} recipe={modalRecipe} onClose={closeModal} />
      <ProfileDrawer open={drawerOpen} profile={drawerProfile} onClose={() => setDrawerOpen(false)} />
      <Toast open={toast.open} message={toast.message} actionText="Undo" onAction={undoDelete} onClose={() => setToast({ open: false })} />

      <button className="ai-fab" title="Generate a recipe from your ingredients" onClick={() => setAiOpen(true)}>
        <span className="ai-fab-icon">✨</span>
        <span className="ai-fab-label">AI Recipe</span>
      </button>
      <AIGenerateModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
