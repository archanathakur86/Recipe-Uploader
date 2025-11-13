import React, { useEffect, useState } from 'react';
import estimateCalories from '../services/calorieEstimator';
import { Link } from 'react-router-dom';
import api from '../services/api';

function resolveImageSrc(r = {}) {
  const candidates = [];
  const pushStr = (v) => { if (typeof v === 'string' && v.trim()) candidates.push(v.trim()); };
  const pushObj = (v) => { if (v && typeof v === 'object') { pushStr(v.url || v.path || v.src); } };

  pushStr(r.imageUrl);
  pushStr(r.image);
  pushStr(r.photo);
  pushStr(r.coverUrl);
  pushStr(r.imagePath);
  pushStr(r.img);
  pushObj(r.image);

  const val = candidates.find(Boolean);
  if (!val) return '';

  const isHttp = /^https?:\/\//i.test(val);
  if (isHttp) return val;

  let origin = '';
  try {
    const base = api?.defaults?.baseURL || '';
    if (base) {
      const u = new URL(base, window.location.origin);
      origin = u.origin; // e.g., http://localhost:5000 if base is http://localhost:5000/api
    }
  } catch (_) {}
  if (!origin) {
    origin = window.location.origin.includes(':300') ? 'http://localhost:5000' : window.location.origin;
  }

  const path = val.replace(/^\.+\/?/, '').replace(/^\/?/, '');
  return `${origin}/${path}`;
}

// Derive a human-friendly taste summary from recipe data
function tasteFromRecipe(r = {}) {
  // ...existing taste logic...
  const title = String(r.title || '').toLowerCase();
  const cuisine = String(r.cuisine || '').toLowerCase();
  const desc = String(r.description || '').toLowerCase();
  const ingredients = Array.isArray(r.ingredients) ? r.ingredients.map(x => String(x).toLowerCase()) : [];
  if (typeof r.taste === 'string' && r.taste.trim()) return r.taste;
  const tags = new Set();
  const hasAny = (arr) => arr.some(k => title.includes(k) || desc.includes(k) || ingredients.some(i => i.includes(k)));
  if (hasAny(['chilli','chili','red chilli','green chilli','garam masala','pepper','cayenne'])) tags.add('Spicy');
  if (hasAny(['tomato','lemon','lime','vinegar','tamarind','yogurt','curd'])) tags.add('Tangy');
  if (hasAny(['garlic'])) tags.add('Garlicky');
  if (hasAny(['basil','oregano','parsley','cilantro','coriander leaves','mint'])) tags.add('Herby');
  if (hasAny(['cream','butter','ghee','milk','paneer','cheese'])) tags.add('Rich & creamy');
  if (hasAny(['soy sauce','mushroom','umami'])) tags.add('Umami');
  if (hasAny(['smoked','tandoor','charred'])) tags.add('Smoky');
  if (hasAny(['honey','sweet','caramelized'])) tags.add('Sweet-savory');
  if (title.includes('salad') || desc.includes('salad')) { tags.add('Fresh'); }
  if (title.includes('pulao') || desc.includes('pulao')) tags.add('Fragrant');
  if (cuisine.includes('indian')) tags.add('Aromatic spices');
  if (cuisine.includes('italian')) { tags.add('Savory'); tags.add('Herby'); }
  const list = Array.from(tags).slice(0, 3);
  return list.length ? list.join(', ') : 'Balanced, home-style flavors';
}

export default function RecipeCard({ recipe, onChange, onDelete, onOpen }) {
  const base = process.env.REACT_APP_API_URL?.replace('/api','') || 'http://localhost:5000';

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(recipe.likes || 0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return setLiked(false);
      const me = JSON.parse(raw);
      const favs = me && (me.favorites || []);
      setLiked(Array.isArray(favs) && favs.findIndex(f => f && f.toString() === (recipe._id || '').toString()) !== -1);
    } catch (err) {
      setLiked(false);
    }
  }, [recipe._id]);

  const isOwner = (() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return false;
      const me = JSON.parse(raw);
      const meId = me._id || me.id || me;
      const ownerId = recipe.owner && (recipe.owner._id ? recipe.owner._id : recipe.owner);
      return !!(meId && ownerId && meId.toString() === ownerId.toString());
    } catch (err) { return false; }
  })();

  const toggleFav = async (e) => {
    e && e.stopPropagation();
    try {
      const next = !liked;
      setLiked(next);
      setLikes(l => next ? l + 1 : Math.max(0, l - 1));

      const res = await api.post(`/recipes/${recipe._id}/favorite`);
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const me = JSON.parse(raw);
          if (res && res.favorites) me.favorites = res.favorites;
          else {
            me.favorites = me.favorites || [];
            const idx = me.favorites.findIndex(f => f && f.toString() === recipe._id.toString());
            if (next && idx === -1) me.favorites.push(recipe._id);
            if (!next && idx !== -1) me.favorites.splice(idx, 1);
          }
          localStorage.setItem('user', JSON.stringify(me));
        }
      } catch (err) { }

      onChange && onChange();
    } catch (err) {
      console.error('favorite failed', err);
      setLiked(prev => !prev);
      setLikes(l => Math.max(0, l + (liked ? 1 : -1)));
      if (err.response && err.response.status === 401) alert('Please sign in to favorite recipes');
    }
  };

  const openProfile = (id, e) => {
    e && e.stopPropagation();
    window.dispatchEvent(new CustomEvent('openProfileDrawer', { detail: { id } }));
  };

  const handleOpen = (e) => {
    if (onOpen) onOpen(recipe);
  };

  // no inline dropdown here; header will show user dropdown

  const shareRecipe = async (e) => {
    e && e.stopPropagation();
    try {
      // record share on server
      try { await api.post(`/recipes/${recipe._id}/share`); } catch (e) { /* non-blocking */ }

      const url = window.location.origin + `/recipe/${recipe._id}`;
      const shareData = { title: recipe.title, text: shortDesc, url };
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Recipe link copied to clipboard');
      } else {
        // fallback: create temporary input
        const tmp = document.createElement('input');
        document.body.appendChild(tmp);
        tmp.value = url;
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        alert('Recipe link copied to clipboard');
      }
    } catch (err) {
      console.error('share failed', err);
      alert('Could not share the recipe');
    }
  };

  // short description fallback
  const shortDesc = recipe.summary || ((recipe.ingredients || []).slice(0,4).map(i=>i.name).join(', '));
  const taste = tasteFromRecipe(recipe);
  const imgSrc = resolveImageSrc(recipe);

  return (
    <div className="recipe-card card" onClick={handleOpen} style={{ cursor: onOpen ? 'pointer' : 'default' }}>
      {imgSrc && (
        <div className="rl-media">
          <img className="rl-img" src={imgSrc} alt={recipe?.title || 'Recipe image'} loading="lazy" />
        </div>
      )}
      <div className="rl-body">
        <Link to={`/recipe/${recipe._id}`} className="rl-title" onClick={(e)=>{ e.stopPropagation(); }}>{recipe.title}</Link>
        <p className="rl-desc">{taste}</p>
        {recipe.owner && recipe.owner.name ? (
          <div className="owner-inline" onClick={(e) => { e.stopPropagation(); openProfile(recipe.owner._id || recipe.owner, e); }}>
            <img className="owner-inline-avatar" src={recipe.owner?.avatarUrl ? (recipe.owner.avatarUrl.startsWith("http") ? recipe.owner.avatarUrl : base + recipe.owner.avatarUrl) : '/assets/avatar-placeholder.png'} alt={recipe.owner?.name || 'author'} />
            <span className="owner-inline-name">{recipe.owner?.name}</span>
          </div>
        ) : null}

        <div className="rl-footer">
          <div className="rl-date">{(recipe.caloriesTotal && recipe.caloriesTotal > 0 ? recipe.caloriesTotal : estimateCalories(recipe))} kcal</div>
          <div className="rl-actions">
            <button onClick={toggleFav} title="Favorite" className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }}>
              {liked ? '❤️' : '🤍'}
            </button>
            <button onClick={shareRecipe} title="Share" className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, marginLeft: 6 }}>🔗&nbsp;Share</button>
            {onDelete && isOwner && (
              <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this recipe? This cannot be undone.')) { onDelete(recipe._id); } }} title="Delete" className="icon-btn" style={{ marginLeft: 8 }}>🗑</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}