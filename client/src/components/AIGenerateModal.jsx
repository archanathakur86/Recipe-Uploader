import React, { useState } from 'react';
import api from '../services/api';

function tokenize(list) {
  return list
    .split(/[,;|\n]+/g) // split on commas/newlines/semicolons/pipes only (not spaces)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

function titleCase(s) { return s.replace(/\b\w/g, c => c.toUpperCase()); }

function localGenerate(ingList) {
  const raw = tokenize(ingList);
  if (!raw.length) return null;
  const set = new Set(raw);
  const hasGroup = (g) => GROUPS[g].some(set.has, set);
  const firstOf = (g) => GROUPS[g].find(set.has, set);

  // Groups/synonyms
  const GROUPS = {
    BEANS: ['beans','green beans','french beans','kidney beans','rajma','lobia','bean'],
    POTATO: ['potato','potatoes','aloo'],
    ONION: ['onion','onions'],
    TOMATO: ['tomato','tomatoes'],
    GARLIC: ['garlic'],
    GINGER: ['ginger'],
    CHILI: ['chili','chilli','green chili','green chilli'],
    PEAS: ['peas','matar'],
    PANEER: ['paneer'],
    CHICKPEA: ['chickpea','chickpeas','chana','chole','gram'],
    LENTIL: ['lentil','lentils','dal','daal','dahl','masoor','moong','toor','arhar'],
    RICE: ['rice'],
    EGG: ['egg','eggs'],
    BREAD: ['bread'],
    PASTA: ['pasta','noodles','spaghetti','macaroni'],
    CHEESE: ['cheese'],
    CAPSICUM: ['capsicum','bell pepper','pepper'],
    CHICKEN: ['chicken']
  };

  let title = 'Chef’s Quick Creation';
  let cuisine = 'Fusion';
  let description = 'A quick dish from your ingredients.';
  let style = 'generic'; // indian | stirfry | pasta | generic

  if (hasGroup('BEANS') && hasGroup('POTATO')) {
    title = 'Aloo Beans Sabzi'; cuisine = 'Indian'; style = 'indian';
    description = 'A dry-style Indian sabzi of beans and potatoes with simple spices.';
  } else if (hasGroup('CHICKPEA') && (hasGroup('ONION') || hasGroup('TOMATO'))) {
    title = 'Quick Chana Masala'; cuisine = 'Indian'; style = 'indian';
    description = 'Comforting chickpea curry with onion-tomato base.';
  } else if (hasGroup('LENTIL') && (hasGroup('ONION') || hasGroup('TOMATO'))) {
    title = 'Masoor Dal Tadka'; cuisine = 'Indian'; style = 'indian';
    description = 'Simple red lentil dal finished with a fragrant tadka.';
  } else if (hasGroup('RICE') && (hasGroup('PEAS') || hasGroup('POTATO'))) {
    title = 'Veg Pulao'; cuisine = 'Indian'; style = 'indian';
    description = 'One-pot aromatic rice with veggies and mild spices.';
  } else if (hasGroup('PANEER') && (hasGroup('TOMATO') || hasGroup('ONION') || hasGroup('CAPSICUM'))) {
    title = 'Paneer Jalfrezi'; cuisine = 'Indian'; style = 'indian';
    description = 'Stir-fried paneer with peppers in a tangy masala.';
  } else if (hasGroup('PASTA') && (hasGroup('TOMATO') || hasGroup('GARLIC'))) {
    title = 'Tomato Garlic Pasta'; cuisine = 'Italian'; style = 'pasta';
    description = 'Al dente pasta tossed in a garlicky tomato sauce.';
  } else if (hasGroup('BREAD') && (hasGroup('TOMATO') || hasGroup('CHEESE') || hasGroup('ONION'))) {
    title = 'Masala Cheese Toast'; cuisine = 'Café'; style = 'stirfry';
    description = 'Toasted bread with a masala topping and melted cheese.';
  } else if (hasGroup('CHICKEN') && (hasGroup('GARLIC') || hasGroup('ONION'))) {
    title = 'Garlic Chicken Stir-Fry'; cuisine = 'Asian'; style = 'stirfry';
    description = 'Tender chicken tossed quickly with aromatics and sauce.';
  } else if (hasGroup('BEANS')) {
    title = 'Garlicky Stir-Fried Beans'; cuisine = 'Asian'; style = 'stirfry';
    description = 'Crisp-tender beans with garlic and soy notes.';
  } else if (hasGroup('POTATO')) {
    title = 'Crispy Masala Potatoes'; cuisine = 'Indian'; style = 'indian';
    description = 'Golden pan-fried potatoes with warm spices.';
  }

  // Determine main ingredients (up to 3)
  const candidates = [
    firstOf('BEANS'), firstOf('POTATO'), firstOf('PANEER'), firstOf('CHICKPEA'), firstOf('LENTIL'),
    firstOf('RICE'), firstOf('PASTA'), firstOf('CHICKEN'), firstOf('EGG'), firstOf('CAPSICUM'),
    firstOf('TOMATO'), firstOf('ONION'), firstOf('GARLIC')
  ].filter(Boolean);
  const mains = Array.from(new Set(candidates)).slice(0, 3).map(titleCase);

  const pantry = ['salt','black pepper','oil'];
  const indianSpices = ['turmeric','coriander powder','red chilli','cumin seeds'];
  const sauceBits = ['soy sauce','vinegar'];
  const extras = style === 'indian' ? indianSpices : (style === 'stirfry' ? sauceBits : []);

  const ingredients = Array.from(new Set([...raw, ...pantry, ...extras])).map(titleCase);

  // Tools/utensils per style
  let tools = [];
  if (style === 'indian') tools = ['Kadhai/Pan', 'Spatula', 'Knife', 'Cutting Board'];
  else if (style === 'stirfry') tools = ['Wok/Kadhai', 'Spatula/Tongs', 'Knife', 'Cutting Board'];
  else if (style === 'pasta') tools = ['Saucepan', 'Skillet/Pan', 'Colander', 'Knife'];
  else tools = ['Pan', 'Spatula', 'Knife'];

  // Build contextual steps with utensil mention
  const chopItems = [hasGroup('ONION') && 'Onion', hasGroup('GARLIC') && 'Garlic', hasGroup('GINGER') && 'Ginger', ...mains]
    .filter(Boolean)
    .map(titleCase)
    .filter(item => item !== 'Rice' && item !== 'Pasta')
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 6);
  const extraPrepNotes = [];
  if (hasGroup('RICE')) extraPrepNotes.push('Rinse Rice until water runs clear');
  const prepLine = chopItems.length
    ? `Prep on a Cutting Board: chop ${chopItems.join(', ')}.`
    : 'Prep: gather and measure your ingredients.';
  const prepLineWithNotes = extraPrepNotes.length ? `${prepLine} ${extraPrepNotes.join('. ')}.` : prepLine;

  let steps = [];
  if (style === 'indian') {
    steps = [
      prepLineWithNotes,
      'Heat oil in a Kadhai/Pan; splutter Cumin Seeds, then sauté Onion & Garlic till translucent (if using).',
      'Add Turmeric, Coriander Powder and Red Chilli; cook 30 seconds.',
      `Add ${mains.join(' & ')} with a splash of water; cook covered until tender.`,
      'Season with Salt and Black Pepper; finish with lemon/coriander and serve.'
    ];
  } else if (style === 'pasta') {
    steps = [
      'Bring a Saucepan of salted water to a boil; cook Pasta until al dente; reserve some pasta water and drain in a Colander.',
      `In a Skillet/Pan, sauté ${hasGroup('GARLIC') ? 'Garlic' : 'aromatics'} in oil; add ${hasGroup('TOMATO') ? 'Tomatoes' : 'sauce base'} and reduce.`,
      `Toss Pasta with the sauce and ${mains.length ? mains[0] : 'main add-ins'}; loosen with pasta water as needed.`,
      'Season to taste; finish with herbs/cheese and serve.'
    ];
  } else if (style === 'stirfry') {
    steps = [
      prepLineWithNotes.replace('chop', 'slice'),
      `Heat oil in a Wok/Kadhai; stir-fry ${mains.join(', ')} on high heat.`,
      'Add Soy Sauce (and Vinegar if using); toss to coat.',
      'Season and serve immediately while crisp-tender.'
    ];
  } else {
    steps = [
      prepLineWithNotes,
      `Heat oil in a Pan; sauté ${hasGroup('ONION') ? 'Onion' : 'aromatics'} till fragrant.`,
      `Add ${mains.join(' & ')} and cook through, stirring occasionally.`,
      'Season to taste and finish with herbs/chili/lemon.'
    ];
  }

  const time = Math.min(40, 12 + raw.length * 3);
  const servings = raw.length >= 6 ? 3 : 2;

  return { title, cuisine, description, tools, ingredients, steps, time, servings };
}

export default function AIGenerateModal({ open, onClose }) {
  const [raw, setRaw] = useState('egg, tomato, onion, bread');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  if (!open) return null;

  const handleGenerate = async () => {
    const input = (raw || '').trim();
    if (!input) {
      setStatus('Please enter at least one ingredient (use commas)');
      setResult(null);
      return;
    }

    setLoading(true);
    setStatus('Local suggestion');
    const local = localGenerate(input);
    setResult(local);

    try {
      const res = await api.post('/ai/generate', { ingredients: input });
      if (res && res.data && typeof res.data === 'object') {
        setResult(res.data);
        setStatus('');
      }
    } catch (e) {
      console.warn('AI unavailable, kept local suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
    >
      <div style={{ width:'min(720px, 92vw)', maxHeight:'88vh', overflow:'auto', background:'#fff', borderRadius:12, boxShadow:'0 12px 40px rgba(0,0,0,0.25)', padding:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <h3 style={{ margin:0 }}>Generate Recipe from Ingredients</h3>
          <button onClick={onClose} className="btn" style={{ padding:'6px 10px' }}>✕</button>
        </div>

        <label style={{ display:'block', marginTop:12, fontWeight:600 }}>Your ingredients (comma-separated):</label>
        <textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          rows={4}
          placeholder="e.g. beans, potato, onion"
          style={{ width:'100%', borderRadius:8, border:'1px solid #d4d7dd', padding:10, fontSize:14, marginTop:6 }}
        />
        <div style={{ color:'#6b7280', fontSize:12, marginTop:6 }}>Tip: separate items with commas only. Example: beans, potato, onion</div>

        <div style={{ marginTop:16, display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ padding:'10px 14px' }}>
            {loading? 'Generating…' : 'Generate'}
          </button>
          {status && <span style={{ color: status.includes('Please') ? '#b91c1c' : '#64748b', fontSize:13 }}>{status}</span>}
        </div>

        {result && (
          <div style={{ marginTop:18, borderTop:'1px solid #eee', paddingTop:14 }}>
            <h4 style={{ margin:'0 0 6px' }}>{result.title} <span style={{ color:'#6b7280' }}>· {result.cuisine}</span></h4>
            <p style={{ marginTop:0, color:'#475569' }}>{result.description}</p>
            {Array.isArray(result.tools) && result.tools.length > 0 && (
              <div style={{ margin:'8px 0 10px 0', color:'#334155' }}>
                <div style={{ fontWeight:600, marginBottom:6 }}>Tools/Utensils</div>
                <ul style={{ margin:0, paddingLeft:18 }}>
                  {result.tools.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <div style={{ fontWeight:600, marginBottom:6 }}>Ingredients</div>
                <ul style={{ margin:0, paddingLeft:18 }}>
                  {result.ingredients.map((it,i)=>(<li key={i}>{it}</li>))}
                </ul>
              </div>
              <div>
                <div style={{ fontWeight:600, marginBottom:6 }}>Steps</div>
                <ol style={{ margin:0, paddingLeft:18 }}>
                  {result.steps.map((s,i)=>(<li key={i} style={{ marginBottom:6 }}>{s}</li>))}
                </ol>
              </div>
            </div>
            <div style={{ marginTop:10, color:'#64748b' }}>Ready in ~{result.time} mins · Serves {result.servings}</div>
          </div>
        )}
      </div>
    </div>
  );
}