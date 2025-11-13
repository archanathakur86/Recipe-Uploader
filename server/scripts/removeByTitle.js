require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../src/models/Recipe');

const MONGO = process.env.MONGO_URI || process.env.MONGO || 'mongodb://127.0.0.1:27017/recipe_dev';
const titleToRemove = process.env.DELETE_TITLE || process.argv[2];

if (!titleToRemove) {
  console.error('Usage: DELETE_TITLE="Recipe Title" node scripts/removeByTitle.js OR node scripts/removeByTitle.js "Recipe Title"');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGO);
  const regex = new RegExp('^' + titleToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
  const docs = await Recipe.find({ title: regex }).limit(50);
  if (!docs || docs.length === 0) {
    console.log('No recipes found matching title:', titleToRemove);
    await mongoose.disconnect();
    return process.exit(0);
  }

  console.log('Found', docs.length, 'recipes matching title. Deleting...');
  for (const d of docs) {
    try {
      await Recipe.deleteOne({ _id: d._id });
      console.log('Deleted', d._id, d.title);
    } catch (err) {
      console.error('Delete failed for', d._id, err.message || err);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
