require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../src/models/Recipe');

const MONGO = process.env.MONGO_URI || process.env.MONGO || 'mongodb://127.0.0.1:27017/recipe_dev';

function makeSummaryFromRecipe(r) {
  const cuisine = r.owner && r.owner.name ? r.owner.name : (r.externalId ? 'International' : 'Local');
  const heads = (r.ingredients || []).slice(0,3).map(i=>i.name).filter(Boolean);
  if (heads.length) return `A ${cuisine}-style ${r.title} featuring ${heads.join(', ')} — flavorful and satisfying.`;
  return `A delicious ${r.title} with balanced flavors.`;
}

async function main(){
  await mongoose.connect(MONGO, { useNewUrlParser:true, useUnifiedTopology:true });
  const toUpdate = await Recipe.find({ $or: [ { summary: { $exists: false } }, { summary: null }, { summary: '' } ] }).limit(2000);
  console.log('Found recipes needing summaries:', toUpdate.length);
  let updated = 0;
  for (const r of toUpdate){
    r.summary = makeSummaryFromRecipe(r);
    await r.save();
    updated++;
    if (updated % 100 === 0) console.log('Updated', updated);
  }
  console.log('Done. Updated:', updated);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e=>{ console.error(e); process.exit(1); });
