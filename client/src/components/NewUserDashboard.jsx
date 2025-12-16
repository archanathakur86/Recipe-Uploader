import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import estimateCalories from '../services/calorieEstimator';
import './newdashboard.css';
import Profile from './Profile';
import RecipeCard from './RecipeCard';
import AIGenerateModal from './AIGenerateModal';

export default function NewUserDashboard({ user }) {
  const navigate = useNavigate();
  const name = (user && user.name) || 'Sakshi Kumari';
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/signin'); };
  const goToAdd = () => navigate('/add');

  const [stats, setStats] = useState({ totalRecipes: 0, totalCalories: 0, favorites: 0, avgCalories: 0 });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('overview');
  const [profileEdit, setProfileEdit] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [myRecipes, setMyRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [feedPreview, setFeedPreview] = useState([]);
  const [streak, setStreak] = useState(12);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [aiRecipe, setAiRecipe] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const mineRes = await api.get('/recipes/mine');
        const recs = mineRes.data || [];
        const totalRecipes = recs.length;
        const totalCalories = recs.reduce((sum, r) => {
          const c = (r.caloriesTotal && r.caloriesTotal > 0) ? r.caloriesTotal : estimateCalories(r);
          return sum + (Number(c) || 0);
        }, 0);
        const avgCalories = totalRecipes ? Math.round(totalCalories / totalRecipes) : 0;
        const favIds = (user.favorites || []).map(f => f.toString());
        const favs = [];
        for (const id of favIds.slice(0, 12)) {
          try { const r = await api.get(`/recipes/${id}`); favs.push(r.data); } catch (e) {}
        }
        const favoritesCount = favIds.length;
        let feed = [];
        try { 
          const feedRes = await api.get('/recipes/feed'); 
          feed = Array.isArray(feedRes.data) ? feedRes.data.filter(r => r.title !== 'CI Test Recipe').slice(0, 6) : []; 
        } catch (_) {}
        if (mounted) {
          setStats({ totalRecipes, totalCalories, favorites: favoritesCount, avgCalories });
          setMyRecipes(recs);
          setFavorites(favs);
          setFeedPreview(feed);
        }
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, [user]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Available ingredients for Fridge Finder
  const availableIngredients = [
    { emoji: '🥚', name: 'Eggs' },
    { emoji: '🥬', name: 'Spinach' },
    { emoji: '🍅', name: 'Tomato' },
    { emoji: '🧀', name: 'Cheese' },
    { emoji: '🥑', name: 'Avocado' },
    { emoji: '🥕', name: 'Carrot' },
    { emoji: '🥔', name: 'Potato' },
    { emoji: '🧅', name: 'Onion' }
  ];

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient.name)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient.name));
    } else if (selectedIngredients.length < 3) {
      setSelectedIngredients([...selectedIngredients, ingredient.name]);
    }
  };

  console.log('Dashboard state check - selectedIngredients:', selectedIngredients);

  const handleGenerateRecipe = async () => {
    if (selectedIngredients.length < 1) {
      alert('Please select at least 1 ingredient');
      return;
    }

    setIsGenerating(true);
    setAiRecipe(null); // Clear previous result

    try {
      const response = await api.post('/recipes/generate-ai', {
        ingredients: selectedIngredients
      });

      if (response.data && response.data.recipe) {
        const recipeData = response.data.recipe;
        const healthAnalysis = response.data.healthAnalysis || {};
        
        setAiRecipe({
          name: recipeData.title || recipeData.name,
          description: recipeData.description || 'A delicious AI-generated recipe!',
          fullRecipe: recipeData,
          healthScore: healthAnalysis.score || recipeData.healthScore,
          healthWarnings: healthAnalysis.warnings || recipeData.healthWarnings,
          nutritionalClaims: healthAnalysis.claims || recipeData.nutritionalClaims
        });
      } else {
        // Fallback if API doesn't return expected format
        setAiRecipe({
          name: `${selectedIngredients.join(' & ')} Delight`,
          description: `A delicious recipe combining ${selectedIngredients.join(', ')}. Try this amazing combination!`
        });
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      
      // If API fails, show a nice fallback message
      if (error.response?.status === 404 || error.response?.status === 500) {
        alert('AI generation service is currently unavailable. Please try the manual AI Recipe button below!');
      } else {
        // Show a demo result on error
        setAiRecipe({
          name: `${selectedIngredients.join(' & ')} Special`,
          description: `Here's a creative idea: Try combining ${selectedIngredients.join(', ')} with some herbs and spices. Sauté together for a quick and tasty dish!`,
          isDemoResult: true
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="nud-root">
      <header className="nud-topbar">
        <div className="nud-left">
          <div className="nud-brand">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#FF7A2D" />
              <path d="M8.2 12.8l1.9 1.9 4.2-5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span style={{ marginLeft: 8, fontWeight: 800 }}>HomePlate</span>
          </div>
        </div>
        <div className="nud-center">
          <nav className="nud-nav">
            <Link to="/dashboard" className="active">Dashboard</Link>
            <Link to="/add"><span className="icon-circle">+</span> Add Recipe</Link>
            <Link to="/feed">🌐 Public Feed</Link>
          </nav>
        </div>
        <div className="nud-right">
          {/* Streak Flame */}
          <div className="streak-flame">
            <span className="streak-icon">🔥</span>
            <span className="streak-number">{streak}</span>
            <span className="streak-label">Day Streak</span>
          </div>

          <div className="nud-user-wrap" ref={null}>
            <button className="nud-user" onClick={(e) => { e.preventDefault(); const el = document.getElementById('nud-user-menu'); if (el) el.classList.toggle('open'); e.currentTarget.classList.toggle('open'); }} aria-haspopup="true" aria-expanded={profileOpen}>{user && user.avatarUrl ? <img title={user.email || user.name} aria-label={user.email || user.name} src={user.avatarUrl.startsWith('http') ? user.avatarUrl : (process.env.REACT_APP_API_URL?.replace('/api','') || '') + user.avatarUrl} alt="avatar" className="nud-avatar" /> : null}{name} <span className="nud-caret">▾</span></button>
            <div id="nud-user-menu" className="nud-user-menu">
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('overview'); setProfileOpen(true); }}>Overview</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('my'); setProfileOpen(true); }}>My Recipes</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('fav'); setProfileOpen(true); }}>Favorites</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('settings'); setProfileOpen(true); }}>Settings</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('overview'); setProfileEdit(true); setProfileOpen(true); }}>Edit Profile</a>
              <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('nud-user-menu')?.classList.remove('open'); setProfileTab('manage'); setProfileOpen(true); }}>Manage Account</a>
            </div>
          </div>
          <button className="nud-logout" onClick={handleLogout}>⤴ Logout</button>
        </div>
      </header>

      {/* Bento Grid Dashboard */}
      <div className="bento-dashboard">
        
        {/* Box 1: Hero - Welcome + Recipe of Day */}
        <div className="bento-box bento-hero">
          <div className="bento-hero-content">
            <h1>{getGreeting()}, {name}!</h1>
            <p>Ready to cook something amazing today? Explore recipes, track nutrition, and share your culinary creations.</p>
            <div className="bento-hero-cta">
              <button className="btn-primary" onClick={goToAdd}>
                ✨ Create Recipe
              </button>
              <Link className="btn-secondary" to="/feed">
                🌐 Explore Feed
              </Link>
            </div>
          </div>
        </div>

        {/* Box 2: Quick Actions Sidebar */}
        <div className="bento-box bento-meal-plan">
          <h3>Quick Actions</h3>
          <div 
            className="meal-plan-item" 
            onClick={() => navigate('/add')}
            style={{ cursor: 'pointer' }}
          >
            <span className="meal-plan-day">NEW</span>
            <span className="meal-plan-name">Create Recipe</span>
            <span className="meal-plan-emoji">✨</span>
          </div>
          <div 
            className="meal-plan-item" 
            onClick={() => navigate('/feed')}
            style={{ cursor: 'pointer' }}
          >
            <span className="meal-plan-day">FEED</span>
            <span className="meal-plan-name">Browse Recipes</span>
            <span className="meal-plan-emoji">🌐</span>
          </div>
          <div 
            className="meal-plan-item" 
            onClick={() => { setProfileTab('my'); setProfileOpen(true); }}
            style={{ cursor: 'pointer' }}
          >
            <span className="meal-plan-day">MY</span>
            <span className="meal-plan-name">My Recipes</span>
            <span className="meal-plan-emoji">🍳</span>
          </div>
          <div 
            className="meal-plan-item" 
            onClick={() => { setProfileTab('fav'); setProfileOpen(true); }}
            style={{ cursor: 'pointer' }}
          >
            <span className="meal-plan-day">FAV</span>
            <span className="meal-plan-name">Favorites</span>
            <span className="meal-plan-emoji">❤️</span>
          </div>
        </div>

        {/* Box 3: Calories Chart */}
        <div className="bento-box bento-calories">
          <h4>Total Calories</h4>
          <div className="calories-circle">
            <span className="calories-number">{stats.totalCalories > 999 ? Math.round(stats.totalCalories / 1000) + 'k' : stats.totalCalories}</span>
          </div>
          <p className="calories-label">across all recipes</p>
        </div>

        {/* Box 4: Shopping List / Stats */}
        <div className="bento-box bento-shopping">
          <h4>Your Stats</h4>
          <div className="shopping-item">
            <div className="shopping-checkbox" style={{background: 'var(--accent-orange)'}}></div>
            <span>{stats.totalRecipes} Recipes</span>
          </div>
          <div className="shopping-item">
            <div className="shopping-checkbox" style={{background: 'var(--accent-orange)'}}></div>
            <span>{stats.favorites} Favorites</span>
          </div>
          <div className="shopping-item">
            <div className="shopping-checkbox" style={{background: 'var(--accent-orange)'}}></div>
            <span>{stats.avgCalories} Avg Cal</span>
          </div>
        </div>

        {/* Box 5: Fridge Finder Widget */}
        <div className="bento-box bento-fridge-widget">
          <h4>🧊 What's in Your Fridge?</h4>
          <p>Select 3 ingredients to generate a recipe idea</p>
          
          <div className="fridge-ingredients">
            {availableIngredients.map((ing) => (
              <div
                key={ing.name}
                className={`ingredient-tag ${selectedIngredients.includes(ing.name) ? 'selected' : ''}`}
                onClick={() => toggleIngredient(ing)}
              >
                {ing.emoji} {ing.name}
                {selectedIngredients.includes(ing.name) && (
                  <span className="ingredient-remove">×</span>
                )}
              </div>
            ))}
          </div>

          <div className="fridge-cta">
            <button
              className={`ai-recipe-btn ${selectedIngredients.length >= 1 ? 'active' : ''}`}
              disabled={selectedIngredients.length < 1 || isGenerating}
              onClick={handleGenerateRecipe}
            >
              {isGenerating ? (
                <>
                  <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</span> 
                  Generating...
                </>
              ) : (
                <>
                  ✨ Generate Recipe
                </>
              )}
            </button>
          </div>

          {aiRecipe && (
            <div className="ai-recipe-result">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h5 style={{ margin: 0 }}>🎉 {aiRecipe.name}</h5>
                {aiRecipe.healthScore && (
                  <span 
                    className="health-badge"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: aiRecipe.healthScore >= 8 ? '#22C55E' : aiRecipe.healthScore < 5 ? '#EF4444' : '#FFA500',
                      color: 'white'
                    }}
                  >
                    🛡️ {aiRecipe.healthScore}/10
                  </span>
                )}
              </div>
              <p>{aiRecipe.description}</p>
              {aiRecipe.healthWarnings && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '10px', 
                  background: '#FEF3C7', 
                  borderLeft: '3px solid #F59E0B',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  <strong>⚠️ Warning:</strong> {aiRecipe.healthWarnings}
                </div>
              )}
              {aiRecipe.nutritionalClaims && aiRecipe.nutritionalClaims.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {aiRecipe.nutritionalClaims.map((claim, idx) => (
                    <span 
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        background: '#E0F2FE',
                        color: '#0369A1',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                    >
                      {claim}
                    </span>
                  ))}
                </div>
              )}
              {aiRecipe.isDemoResult && (
                <small style={{ display: 'block', marginTop: '8px', color: 'var(--warm-gray)', fontSize: '12px' }}>
                  💡 This is a demo suggestion. Use the AI Recipe button below for full AI generation!
                </small>
              )}
              {aiRecipe.fullRecipe && (
                <button 
                  className="btn-primary" 
                  style={{ marginTop: '12px', padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => {
                    // You can navigate to recipe detail or open in modal
                    console.log('Full recipe:', aiRecipe.fullRecipe);
                    alert('Recipe details: ' + JSON.stringify(aiRecipe.fullRecipe, null, 2));
                  }}
                >
                  View Full Recipe
                </button>
              )}
            </div>
          )}
        </div>

        {/* Box 6: Quick Stats */}
        <div className="bento-box bento-quick-stats">
          <h4>📊 Recipe Overview</h4>
          <div className="quick-stats-grid">
            <div className="quick-stat-item">
              <div className="quick-stat-number">{stats.totalRecipes}</div>
              <div className="quick-stat-label">Recipes</div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-number">{stats.favorites}</div>
              <div className="quick-stat-label">Favorites</div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-number">{myRecipes.length}</div>
              <div className="quick-stat-label">Created</div>
            </div>
          </div>
        </div>
      </div>

      {profileOpen && (
        <div className="nud-profile-modal">
          <div className="nud-profile-content">
            <button className="nud-profile-close" onClick={() => { setProfileOpen(false); setProfileEdit(false); }}>✕</button>
            <Profile user={user} defaultTab={profileTab} defaultEdit={profileEdit} />
          </div>
        </div>
      )}

      <section className="nud-collections container">
        {/* My Recipes Section */}
        <div className="dash-section">
          <div className="section-header">
            <h2 className="section-title">🍳 My Recipes</h2>
            <button className="btn view-all-btn" onClick={() => { setProfileTab('my'); setProfileOpen(true); }}>View All →</button>
          </div>
          {myRecipes.length === 0 ? (
            <div className="empty-state">
              <p>You haven't added any recipes yet.</p>
              <button className="btn-primary" onClick={goToAdd}>Create Your First Recipe</button>
            </div>
          ) : (
            <div className="recipe-grid">
              {myRecipes.slice(0, 4).map(r => (
                <div key={r._id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
                  <RecipeCard recipe={r} onOpen={() => navigate(`/recipe/${r._id}`)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorites Section */}
        <div className="dash-section">
          <div className="section-header">
            <h2 className="section-title">❤️ Favorites</h2>
            <button className="btn view-all-btn" onClick={() => { setProfileTab('fav'); setProfileOpen(true); }}>View All →</button>
          </div>
          {favorites.length === 0 ? (
            <div className="empty-state">
              <p>No favorites yet. Explore recipes to add your favorites!</p>
              <Link className="btn-primary" to="/feed">Browse Recipes</Link>
            </div>
          ) : (
            <div className="recipe-grid">
              {favorites.slice(0, 4).map(r => (
                <div key={r._id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
                  <RecipeCard recipe={r} onOpen={() => navigate(`/recipe/${r._id}`)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Public Feed Section */}
        <div className="dash-section">
          <div className="section-header">
            <h2 className="section-title">🌐 Public Feed</h2>
            <Link className="btn view-all-btn" to="/feed">Explore All →</Link>
          </div>
          {feedPreview.length === 0 ? (
            <div className="empty-state">
              <p>Feed will appear here.</p>
            </div>
          ) : (
            <div className="recipe-grid">
              {feedPreview.slice(0, 4).map(r => (
                <div key={r._id || r.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
                  <RecipeCard recipe={r} onOpen={() => navigate(`/recipe/${r._id || r.id}`)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <button className="ai-fab" title="Generate a recipe from your ingredients" onClick={() => setAiOpen(true)}>
        <span className="ai-fab-icon">✨</span>
        <span className="ai-fab-label">AI Recipe</span>
      </button>
      <AIGenerateModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}