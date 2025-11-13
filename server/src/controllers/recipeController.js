const path = require('path');
const fs = require('fs');
const Recipe = require('../models/Recipe');

// Create a recipe (expects multipart/form-data with optional image)
async function createRecipe(req, res) {
  try {
    const { title, instructions, ingredients, caloriesTotal, isPublic } = req.body;
    const imageUrl = req.file ? `uploads/${req.file.filename}` : '';
    const recipe = new Recipe({
      title,
      instructions,
      caloriesTotal: Number(caloriesTotal) || 0,
      isPublic: isPublic === 'true' || isPublic === true,
      owner: req.user ? req.user._id : null,
      imageUrl,
    });

    if (ingredients) {
      try {
        recipe.ingredients = JSON.parse(ingredients);
      } catch (e) {
        // fallback: accept plain text list
        recipe.ingredients = String(ingredients).split('\n').map(l => ({ name: l.trim() })).filter(Boolean);
      }
    }

    // Handle taste and flavors
    const body = req.body || {};
    const flavors = Array.isArray(body.flavors) ? body.flavors : (typeof body.flavors === 'string' ? body.flavors.split(/[\s,]+/).filter(Boolean) : []);
    recipe.taste = typeof body.taste === 'string' ? body.taste.trim() : undefined;
    recipe.flavors = flavors;

    await recipe.save();
    return res.status(201).json(recipe);
  } catch (err) {
    console.error('createRecipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get a single recipe
async function getRecipe(req, res) {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id).populate('owner', 'name avatarUrl');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    return res.json(recipe);
  } catch (err) {
    console.error('getRecipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Update a recipe (owner only)
async function updateRecipe(req, res) {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const ownerId = recipe.owner && (recipe.owner._id ? recipe.owner._id.toString() : recipe.owner.toString());
    const userId = req.user && (req.user._id ? req.user._id.toString() : req.user.toString());
    if (!userId || ownerId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const { title, instructions, ingredients, caloriesTotal, isPublic } = req.body;
    if (title) recipe.title = title;
    if (instructions) recipe.instructions = instructions;
    if (typeof isPublic !== 'undefined') recipe.isPublic = isPublic === 'true' || isPublic === true;
    if (typeof caloriesTotal !== 'undefined') recipe.caloriesTotal = Number(caloriesTotal) || 0;
    if (ingredients) {
      try { recipe.ingredients = JSON.parse(ingredients); }
      catch (e) { recipe.ingredients = String(ingredients).split('\n').map(l => ({ name: l.trim() })).filter(Boolean); }
    }
    if (req.file) {
      recipe.imageUrl = `uploads/${req.file.filename}`;
    }

    // Handle taste and flavors
    const body = req.body || {};
    const flavors = Array.isArray(body.flavors) ? body.flavors : (typeof body.flavors === 'string' ? body.flavors.split(/[\s,]+/).filter(Boolean) : undefined);
    const update = { ...body };
    if (typeof body.taste === 'string') update.taste = body.taste.trim();
    if (flavors) update.flavors = flavors;

    await recipe.save();
    return res.json(recipe);
  } catch (err) {
    console.error('updateRecipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Delete a recipe (owner only)
async function deleteRecipe(req, res) {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const ownerId = recipe.owner && (recipe.owner._id ? recipe.owner._id.toString() : recipe.owner.toString());
    const userId = req.user && (req.user._id ? req.user._id.toString() : req.user.toString());
    if (!userId || ownerId !== userId) return res.status(403).json({ message: 'Forbidden' });

    // soft-delete: mark deleted flags, keep files for potential restore
    recipe.deleted = true;
    recipe.deletedAt = new Date();
    recipe.deletedBy = req.user._id;
    await recipe.save();
    return res.json({ message: 'Recipe soft-deleted' });
  } catch (err) {
    console.error('deleteRecipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// restore a soft-deleted recipe (owner only)
async function restoreRecipe(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const ownerId = recipe.owner && (recipe.owner._id ? recipe.owner._id.toString() : recipe.owner.toString());
    const userId = req.user && (req.user._id ? req.user._id.toString() : req.user.toString());
    if (!userId || ownerId !== userId) return res.status(403).json({ message: 'Forbidden' });
    recipe.deleted = false;
    recipe.deletedAt = null;
    recipe.deletedBy = null;
    await recipe.save();
    return res.json({ message: 'Recipe restored', recipe });
  } catch (err) {
    console.error('restoreRecipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// helper: map TheMealDB meal to recipe-like object
function mapMealToRecipe(meal) {
  if (!meal) return null;
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) ingredients.push({ name: name.trim(), quantity: measure ? measure.trim() : '' });
  }
  return {
    _id: `meal_${meal.idMeal}`,
    title: meal.strMeal,
    instructions: meal.strInstructions,
    ingredients,
    caloriesTotal: null,
    isPublic: true,
    imageUrl: meal.strMealThumb,
    owner: { _id: 'external', name: meal.strArea || 'World' },
    createdAt: new Date().toISOString()
  };
}

async function fetchMealDbSearch(q) {
  try {
    const base = 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(q || '');
    const res = await fetch(base);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !data.meals) return [];
    return data.meals.map(mapMealToRecipe).filter(Boolean);
  } catch (err) {
    console.error('fetchMealDbSearch error:', err);
    return [];
  }
}

// Feed: latest public recipes (DB first, then fallback to TheMealDB)
async function getFeed(req, res) {
  try {
    // exclude soft-deleted recipes
    let recipes = await Recipe.find({ isPublic: true, deleted: { $ne: true } }).sort({ createdAt: -1 }).limit(50).populate('owner', 'name avatarUrl');
    if (!recipes || recipes.length === 0) {
      // fallback to external public recipes
      const ext = await fetchMealDbSearch('');
      return res.json(ext);
    }
    return res.json(recipes);
  } catch (err) {
    console.error('getFeed error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Search: q can be text or username; fallback to TheMealDB if no DB results
async function searchRecipes(req, res) {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return getFeed(req, res);

    const User = require('../models/User');
    const userMatch = await User.findOne({ name: new RegExp(q, 'i') });
    if (userMatch) {
      const recipes = await Recipe.find({ owner: userMatch._id, isPublic: true, deleted: { $ne: true } }).sort({ createdAt: -1 }).populate('owner', 'name avatarUrl');
      if (recipes && recipes.length) return res.json(recipes);
      return res.json([]);
    }

    // Try text index search first
    let recipes = [];
    try {
      recipes = await Recipe.find({
        $text: { $search: q },
        isPublic: true,
        deleted: { $ne: true }
      }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(100).populate('owner', 'name avatarUrl');
    } catch (e) {
      console.error('text search failed:', e);
    }

    if (recipes && recipes.length) return res.json(recipes);

    // Try simple regex match on title or ingredient names
    try {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      recipes = await Recipe.find({
        isPublic: true,
        deleted: { $ne: true },
        $or: [
          { title: regex },
          { 'ingredients.name': regex }
        ]
      }).sort({ createdAt: -1 }).limit(200).populate('owner', 'name avatarUrl');
    } catch (e) {
      console.error('regex search failed:', e);
    }

    if (recipes && recipes.length) return res.json(recipes);

    // fallback to external recipe source
    const ext = await fetchMealDbSearch(q);
    return res.json(ext);
  } catch (err) {
    console.error('searchRecipes error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  restoreRecipe,
  getFeed,
  searchRecipes,
  // return recipes for the authenticated user
  getMine: async function (req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const userId = (req.user && (req.user._id || req.user)) || null;
      if (!userId) return res.json([]);
      // owner can be stored as ObjectId or string for legacy entries; match both, exclude deleted
      const recipes = await Recipe.find({ $or: [{ owner: userId }, { owner: userId.toString() }], deleted: { $ne: true } }).sort({ createdAt: -1 }).populate('owner', 'name avatarUrl');
      return res.json(recipes || []);
    } catch (err) {
      console.error('getMine error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // list recent recipes with no owner (or owner null) for debugging
  listOrphans: async function (req, res) {
    try {
      const recs = await Recipe.find({ $or: [{ owner: null }, { owner: { $exists: false } }], deleted: { $ne: true } }).sort({ createdAt: -1 }).limit(50).select('title createdAt imageUrl caloriesTotal').lean();
      return res.json(recs || []);
    } catch (err) {
      console.error('listOrphans error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // claim an orphan recipe for the authenticated user
  claimOrphan: async function (req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { id } = req.params;
      const recipe = await Recipe.findById(id);
      if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
      if (recipe.owner) return res.status(400).json({ message: 'Recipe already has an owner' });
      recipe.owner = req.user._id;
      await recipe.save();
      return res.json({ message: 'Claimed', recipe });
    } catch (err) {
      console.error('claimOrphan error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
};

// Add favorite toggling handler
async function toggleFavorite(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const userId = req.user._id || req.user;
    const { id } = req.params;
    const RecipeModel = require('../models/Recipe');
    const User = require('../models/User');

    const recipe = await RecipeModel.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idx = (user.favorites || []).findIndex(f => f.toString() === id.toString());
    let added = false;
    if (idx === -1) {
      // add to favorites
      user.favorites = user.favorites || [];
      user.favorites.push(recipe._id);
      recipe.likes = (recipe.likes || 0) + 1;
      added = true;
    } else {
      // remove
      user.favorites.splice(idx, 1);
      recipe.likes = Math.max(0, (recipe.likes || 0) - 1);
    }

    await user.save();
    await recipe.save();

    return res.json({ message: added ? 'Favorited' : 'Unfavorited', favorites: user.favorites, likes: recipe.likes });
  } catch (err) {
    console.error('toggleFavorite error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// export the new handler
module.exports.toggleFavorite = toggleFavorite;

// increment share count for a recipe
async function shareRecipe(req, res) {
  try {
    const { id } = req.params;
    const RecipeModel = require('../models/Recipe');
    const recipe = await RecipeModel.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    recipe.shares = (recipe.shares || 0) + 1;
    await recipe.save();
    return res.json({ message: 'Shared', shares: recipe.shares });
  } catch (err) {
    console.error('shareRecipe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports.shareRecipe = shareRecipe;