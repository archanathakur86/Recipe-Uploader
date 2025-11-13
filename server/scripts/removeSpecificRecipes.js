require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../src/models/Recipe');

const MONGO = process.env.MONGO_URI || process.env.MONGO || 'mongodb://127.0.0.1:27017/recipe_dev';

async function main() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const titlesToRemove = [
    'Creamy Pasta Carbonara',
    'Herb-Crusted Salmon',
    'Fresh Garden Salad',
    'Spiced Chickpea Curry',
    'Avocado Toast Deluxe'
  ];

  const res = await Recipe.deleteMany({ title: { $in: titlesToRemove } });
  console.log('Deleted count:', res.deletedCount);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
