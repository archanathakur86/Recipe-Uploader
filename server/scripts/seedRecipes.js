/*
  seedRecipes.js
  Fetches recipes from TheMealDB and inserts them into the local MongoDB as public recipes.
  Usage: ensure server/.env has MONGO_URI, then run:
    node scripts/seedRecipes.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Recipe = require('../src/models/Recipe');

const MONGO = process.env.MONGO_URI || process.env.MONGO || 'mongodb://127.0.0.1:27017/recipe_dev';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed: ' + res.status + ' ' + url);
  return res.json();
}

function makeSummary(meal, ingredients) {
  const cuisine = meal.strArea || 'International';
  const heads = (ingredients || []).slice(0,3).map(i => i.name).filter(Boolean);
  if (heads.length) return `A ${cuisine}-style ${meal.strMeal} featuring ${heads.join(', ')} — flavorful and satisfying.`;
  return `A delicious ${meal.strMeal} with classic ${cuisine} flavors.`;
}

function mapMealToRecipe(meal) {
  if (!meal) return null;
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) ingredients.push({ name: name.trim(), quantity: measure ? measure.trim() : '' });
  }
  return {
    title: meal.strMeal,
    instructions: meal.strInstructions || '',
    ingredients,
    caloriesTotal: null,
    isPublic: true,
    imageUrl: meal.strMealThumb || '',
    externalId: meal.idMeal || null,
    owner: null,
    summary: makeSummary(meal, ingredients),
    createdAt: new Date()
  };
}

async function main() {
  console.log('Connecting to MongoDB...', MONGO);
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected.');

  try {
    // get list of categories
    const catData = await fetchJson('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
    const categories = (catData.meals || []).map(c => c.strCategory).slice(0, 50);
    console.log('Found categories:', categories.length);

    let inserted = 0;
    const seen = new Set();

    for (const cat of categories) {
      try {
        const listUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`;
        const listData = await fetchJson(listUrl);
        const meals = listData.meals || [];

        for (const m of meals) {
          try {
            const id = m.idMeal;
            if (!id || seen.has(id)) continue;
            const look = await fetchJson(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const meal = (look.meals && look.meals[0]) || null;
            const recipeObj = mapMealToRecipe(meal);
            if (!recipeObj) continue;

            // avoid duplicates by externalId
            const exists = await Recipe.findOne({ externalId: recipeObj.externalId });
            if (exists) { seen.add(recipeObj.externalId); continue; }

            const doc = new Recipe(recipeObj);
            await doc.save();
            inserted++;
            seen.add(recipeObj.externalId);

            if (inserted % 50 === 0) console.log('Inserted', inserted);

            // stop when we reach ~1000 to avoid very long runs
            if (inserted >= 1000) break;
          } catch (inner) {
            console.error('meal insert error', inner.message || inner);
          }
        }

        if (inserted >= 1000) break;
      } catch (cErr) {
        console.error('category fetch error', cErr.message || cErr);
      }
    }

    console.log('Seeding complete. Inserted:', inserted);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
