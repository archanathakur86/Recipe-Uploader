// filepath: server/src/controllers/aiController.js
const fetch = global.fetch || require('node-fetch');

function tokenize(list) {
  return String(list || '')
    .split(/[,;|\n]+/g)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}
const titleCase = (s) => String(s).replace(/\b\w/g, c => c.toUpperCase());

function localGenerateContextual(ingList) {
  const raw = tokenize(ingList);
  if (!raw.length) return null;
  const set = new Set(raw);
  const group = {
    BEANS: ['beans','green beans','french beans','kidney beans','rajma','lobia','bean'],
    POTATO: ['potato','potatoes','aloo'],
    ONION: ['onion','onions'], TOMATO: ['tomato','tomatoes'], GARLIC: ['garlic'], GINGER: ['ginger'],
    PEAS: ['peas','matar'], PANEER: ['paneer'], CHICKPEA: ['chickpea','chickpeas','chana','chole','gram'],
    LENTIL: ['lentil','lentils','dal','daal','dahl','masoor','moong','toor','arhar'], RICE: ['rice'],
    EGG: ['egg','eggs'], BREAD: ['bread'], PASTA: ['pasta','noodles','spaghetti','macaroni'], CHEESE: ['cheese'],
    CAPSICUM: ['capsicum','bell pepper','pepper'], CHICKEN: ['chicken']
  };
  const hasG = (G) => group[G].some(x => set.has(x));
  const firstG = (G) => group[G].find(x => set.has(x));

  let title = 'Chef’s Quick Creation', cuisine = 'Fusion', description = 'A quick dish from your ingredients.', style = 'generic';
  if (hasG('BEANS') && hasG('POTATO')) { title='Aloo Beans Sabzi'; cuisine='Indian'; style='indian'; description='A dry-style Indian sabzi of beans and potatoes with simple spices.'; }
  else if (hasG('CHICKPEA') && (hasG('ONION') || hasG('TOMATO'))) { title='Quick Chana Masala'; cuisine='Indian'; style='indian'; description='Comforting chickpea curry with onion-tomato base.'; }
  else if (hasG('LENTIL') && (hasG('ONION') || hasG('TOMATO'))) { title='Masoor Dal Tadka'; cuisine='Indian'; style='indian'; description='Simple red lentil dal finished with a fragrant tadka.'; }
  else if (hasG('RICE') && (hasG('PEAS') || hasG('POTATO'))) { title='Veg Pulao'; cuisine='Indian'; style='indian'; description='One-pot aromatic rice with veggies and mild spices.'; }
  else if (hasG('PANEER') && (hasG('TOMATO') || hasG('ONION') || hasG('CAPSICUM'))) { title='Paneer Jalfrezi'; cuisine='Indian'; style='indian'; description='Stir-fried paneer with peppers in a tangy masala.'; }
  else if (hasG('PASTA') && (hasG('TOMATO') || hasG('GARLIC'))) { title='Tomato Garlic Pasta'; cuisine='Italian'; style='pasta'; description='Al dente pasta tossed in a garlicky tomato sauce.'; }
  else if (hasG('BREAD') && (hasG('TOMATO') || hasG('CHEESE') || hasG('ONION'))) { title='Masala Cheese Toast'; cuisine='Café'; style='stirfry'; description='Toasted bread with a masala topping and melted cheese.'; }
  else if (hasG('CHICKEN') && (hasG('GARLIC') || hasG('ONION'))) { title='Garlic Chicken Stir-Fry'; cuisine='Asian'; style='stirfry'; description='Tender chicken tossed quickly with aromatics and sauce.'; }
  else if (hasG('BEANS')) { title='Garlicky Stir-Fried Beans'; cuisine='Asian'; style='stirfry'; description='Crisp-tender beans with garlic and soy notes.'; }
  else if (hasG('POTATO')) { title='Crispy Masala Potatoes'; cuisine='Indian'; style='indian'; description='Golden pan-fried potatoes with warm spices.'; }

  const mains = Array.from(new Set([
    firstG('BEANS'), firstG('POTATO'), firstG('PANEER'), firstG('CHICKPEA'), firstG('LENTIL'), firstG('RICE'), firstG('PASTA'),
    firstG('EGG'), firstG('CAPSICUM'), firstG('TOMATO'), firstG('ONION'), firstG('GARLIC')
  ].filter(Boolean))).slice(0,3).map(titleCase);

  const pantry = ['salt','black pepper','oil'];
  const indianSpices = ['turmeric','coriander powder','red chilli','cumin seeds'];
  const sauceBits = ['soy sauce','vinegar'];
  const extras = style === 'indian' ? indianSpices : (style === 'stirfry' ? sauceBits : []);

  const ingredients = Array.from(new Set([...raw, ...pantry, ...extras])).map(titleCase);

  let tools = [];
  if (style === 'indian') tools = ['Kadhai/Pan', 'Spatula', 'Knife', 'Cutting Board'];
  else if (style === 'stirfry') tools = ['Wok/Kadhai', 'Spatula/Tongs', 'Knife', 'Cutting Board'];
  else if (style === 'pasta') tools = ['Saucepan', 'Skillet/Pan', 'Colander', 'Knife'];
  else tools = ['Pan', 'Spatula', 'Knife'];

  const chopItems = [set.has('onion') && 'Onion', set.has('garlic') && 'Garlic', set.has('ginger') && 'Ginger', ...mains]
    .filter(Boolean)
    .map(titleCase)
    .filter(item => item !== 'Rice' && item !== 'Pasta')
    .filter((v,i,a)=>a.indexOf(v)===i)
    .slice(0,6);
  const extraPrep = [];
  if (set.has('rice')) extraPrep.push('Rinse Rice until water runs clear');
  const prepLine = chopItems.length ? `Prep on a Cutting Board: chop ${chopItems.join(', ')}.` : 'Prep: gather and measure your ingredients.';
  const prepWithNotes = extraPrep.length ? `${prepLine} ${extraPrep.join('. ')}.` : prepLine;

  let steps = [];
  if (style === 'indian') {
    steps = [
      prepWithNotes,
      'Heat oil in a Kadhai/Pan; splutter Cumin Seeds, then sauté Onion & Garlic till translucent (if using).',
      'Add Turmeric, Coriander Powder and Red Chilli; cook 30 seconds.',
      `Add ${mains.join(' & ')} with a splash of water; cook covered until tender.`,
      'Season with Salt and Black Pepper; finish with lemon/coriander and serve.'
    ];
  } else if (style === 'pasta') {
    steps = [
      'Bring a Saucepan of salted water to a boil; cook Pasta until al dente; reserve some pasta water and drain in a Colander.',
      `In a Skillet/Pan, sauté ${set.has('garlic')?'Garlic':'aromatics'}; add ${set.has('tomato')?'Tomatoes':'sauce base'} and reduce.`,
      `Toss Pasta with the sauce and ${mains[0] || 'main add-ins'}; loosen with pasta water.`,
      'Season to taste; finish with herbs/cheese and serve.'
    ];
  } else if (style === 'stirfry') {
    steps = [
      prepWithNotes.replace('chop', 'slice'),
      `Heat oil in a Wok/Kadhai; stir-fry ${mains.join(', ')} on high heat.`,
      'Add Soy Sauce (and Vinegar if using); toss to coat.',
      'Season and serve immediately while crisp-tender.'
    ];
  } else {
    steps = [
      prepWithNotes,
      `Heat oil in a Pan; sauté ${set.has('onion')?'Onion':'aromatics'} till fragrant.`,
      `Add ${mains.join(' & ')} and cook through, stirring occasionally.`,
      'Season to taste and finish with herbs/chili/lemon.'
    ];
  }

  return {
    title, cuisine, description, tools, ingredients, steps,
    time: Math.min(40, 12 + raw.length * 3),
    servings: raw.length >= 6 ? 3 : 2,
  };
}

async function generateRecipeAI(req, res) {
  try {
    const { ingredients } = req.body || {};
    if (!ingredients || typeof ingredients !== 'string' || !ingredients.trim()) {
      return res.status(400).json({ message: 'ingredients (string) required' });
    }

    const googleKey = process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const systemInstr = 'You are a cooking assistant. Given a few ingredients, output a single JSON object for a plausible recipe. Output JSON ONLY with keys: title (string), cuisine (string), description (string), tools (string[]), ingredients (string[]), steps (string[]), time (number minutes), servings (number). Do not include markdown.';
    const userInstr = `Ingredients available: ${ingredients}\nGenerate a quick home-friendly dish using mostly these. Keep ingredients array concise and steps 5-8.`;

    let aiText = '';

    if (typeof fetch === 'function' && googleKey) {
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${systemInstr}\n\n${userInstr}\n\nRespond with JSON only.` }] }] })
        });
        if (resp.ok) {
          const data = await resp.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          aiText = parts.map(p => p.text || '').join(' ').trim();
        } else {
          console.warn('Gemini API error status', resp.status);
        }
      } catch (err) {
        console.warn('Gemini API error', err?.message || err);
      }
    }

    if (!aiText && typeof fetch === 'function' && openaiKey) {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: [ { role: 'system', content: systemInstr }, { role: 'user', content: userInstr } ], temperature: 0.7 })
        });
        if (resp.ok) {
          const data = await resp.json();
          aiText = (data?.choices?.[0]?.message?.content || '').trim();
        } else {
          console.warn('OpenAI API error status', resp.status);
        }
      } catch (err) {
        console.warn('OpenAI API error', err?.message || err);
      }
    }

    let json;
    if (aiText) {
      try { json = JSON.parse(aiText); } catch (e) {
        const match = aiText.match(/\{[\s\S]*\}/);
        if (match) { try { json = JSON.parse(match[0]); } catch (e2) {} }
      }
    }

    if (!json || !json.title || !Array.isArray(json.ingredients) || !Array.isArray(json.steps)) {
      const fallback = localGenerateContextual(ingredients);
      return res.json(fallback || { title: 'Chef\'s Quick Creation', cuisine: 'Fusion', description: 'A quick dish using your ingredients.', tools: ['Pan','Spatula','Knife'], ingredients: tokenize(ingredients).map(titleCase), steps: ['Prep: chop ingredients.', 'Cook to taste.'], time: 20, servings: 2 });
    }

    json.time = Number(json.time) || 20;
    json.servings = Number(json.servings) || 2;
    json.cuisine = String(json.cuisine || 'Fusion');
    json.description = String(json.description || 'A quick dish using your ingredients.');
    json.tools = Array.isArray(json.tools) ? json.tools : (localGenerateContextual(ingredients)?.tools || ['Pan','Knife']);

    return res.json(json);
  } catch (e) {
    console.error('AI generate error:', e);
    try {
      const fallback = localGenerateContextual(req.body?.ingredients || '');
      return res.json(fallback || { title: 'Chef\'s Quick Creation', cuisine: 'Fusion', description: 'A quick dish using your ingredients.', tools: ['Pan','Spatula','Knife'], ingredients: tokenize(req.body?.ingredients).map(titleCase), steps: ['Prep: chop ingredients.', 'Cook to taste.'], time: 20, servings: 2 });
    } catch (e2) {
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = { generateRecipeAI };
