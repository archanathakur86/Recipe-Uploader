require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Recipe = require('../src/models/Recipe');
const User = require('../src/models/User');

const MONGO = process.env.MONGO_URI || process.env.MONGO || 'mongodb://127.0.0.1:27017/recipe_dev';

async function ensureFakeUsers() {
  const fake = [
    { name: 'Chef Asha', email: 'asha@homeplate.local' },
    { name: 'Chef Rahul', email: 'rahul@homeplate.local' },
    { name: 'Chef Noor', email: 'noor@homeplate.local' },
    { name: 'Chef Liam', email: 'liam@homeplate.local' },
    { name: 'Chef Maya', email: 'maya@homeplate.local' }
  ];

  const users = [];
  for (const f of fake) {
    let u = await User.findOne({ email: f.email });
    if (!u) {
      const hash = await bcrypt.hash('password123', 10);
      u = new User({ name: f.name, email: f.email, password: hash, avatarUrl: '/assets/avatar-placeholder.png' });
      await u.save();
      console.log('Created fake user', f.email);
    }
    users.push(u);
  }
  return users;
}

async function main() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  // remove the five unwanted recipes by exact title
  const titlesToRemove = [
    'Creamy Pasta Carbonara',
    'Herb-Crusted Salmon',
    'Fresh Garden Salad',
    'Spiced Chickpea Curry',
    'Avocado Toast Deluxe'
  ];
  const del = await Recipe.deleteMany({ title: { $in: titlesToRemove } });
  console.log('Removed recipes:', del.deletedCount);

  const users = await ensureFakeUsers();

  // assign owners to recipes missing owner
  const orphanRecipes = await Recipe.find({ $or: [{ owner: null }, { owner: { $exists: false } }] }).limit(2000);
  console.log('Found orphan recipes:', orphanRecipes.length);

  for (const r of orphanRecipes) {
    const pick = users[Math.floor(Math.random() * users.length)];
    r.owner = pick._id;
    await r.save();
  }

  console.log('Assigned owners to orphan recipes');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
