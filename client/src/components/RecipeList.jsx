import React, { useState } from 'react';
import './recipeList.css';

const sampleRecipes = [
  {
    id: '1',
    title: 'Creamy Pasta Carbonara',
    description: 'Spaghetti, pancetta, eggs, parmesan cheese, black pepper, garlic, olive oil.',
    image: '/images/carbonara.jpg',
    calories: 520,
    date: '8/30/2025'
  },
  {
    id: '2',
    title: 'Herb-Crusted Grilled Salmon',
    description: 'Salmon fillets, lemon, dill, parsley, garlic, olive oil, salt, pepper, asparagus.',
    image: '/images/salmon.jpg',
    calories: 380,
    date: '8/30/2025'
  }
];

export default function RecipeList() {
  const [tab, setTab] = useState('all'); // 'all' | 'fav' | 'feed'
  const favoritesCount = 0;
  const publicFeedCount = 3;

  const recipesToShow = tab === 'all' ? sampleRecipes : tab === 'fav' ? [] : sampleRecipes;

  return (
    <div className="rl-root">
      <div className="rl-top">
        <nav className="rl-tabs">
          <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
            All Recipes
          </button>
          <button className={`tab ${tab === 'fav' ? 'active' : ''}`} onClick={() => setTab('fav')}>
            Favorites ({favoritesCount})
          </button>
          <button className={`tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>
            Public Feed ({publicFeedCount})
          </button>
        </nav>
      </div>

      <div className="rl-grid">
        {recipesToShow.length === 0 ? (
          <div className="empty">No recipes to show.</div>
        ) : (
          recipesToShow.map(r => (
            <article key={r.id} className="rl-card">
              <div className="rl-image" style={{ backgroundImage: `url(${r.image})` }}>
                <div className="rl-cal">{r.calories} cal</div>
              </div>

              <div className="rl-body">
                <h3 className="rl-title">{r.title}</h3>
                <p className="rl-desc">{r.description}</p>
              </div>

              <div className="rl-footer">
                <span className="rl-date">{r.date}</span>

                <div className="rl-actions">
                  <button className="icon-btn" title="Share" onClick={() => navigator.share ? navigator.share({ title: r.title, text: r.description, url: window.location.href }) : alert('Share not available')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 12v7a1 1 0 0 0 1 1h14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 5l-3-3-3 3" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2v14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>

                  <button className="icon-btn" title="Delete" onClick={() => alert('Delete clicked')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 6h18" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}