const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  dietaryPreferences: [{ type: String }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  // users who follow this user
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Guard against OverwriteModelError when files are required multiple times (nodemon reloads)
module.exports = mongoose.models && mongoose.models.User
  ? mongoose.models.User
  : mongoose.model('User', UserSchema);