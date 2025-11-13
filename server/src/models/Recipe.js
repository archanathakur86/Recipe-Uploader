const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  calories: { type: Number, default: 0 }
});

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: [IngredientSchema],
  instructions: String,
  imageUrl: String,
  caloriesTotal: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  // soft-delete support
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  isPublic: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  taste: { type: String, trim: true },
  flavors: [{ type: String, trim: true, lowercase: true }]
}, { timestamps: true });

// Text index for full-text search across title, instructions and ingredient names
RecipeSchema.index({ title: 'text', instructions: 'text', 'ingredients.name': 'text' });

module.exports = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);