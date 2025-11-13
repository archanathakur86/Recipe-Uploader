const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Guard against OverwriteModelError when modules are reloaded
module.exports = mongoose.models && mongoose.models.User
  ? mongoose.models.User
  : mongoose.model('User', UserSchema);