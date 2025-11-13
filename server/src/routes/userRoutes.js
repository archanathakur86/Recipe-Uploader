const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const Recipe = require('../models/Recipe');

const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') });

router.get('/me', auth, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, favorites: u.favorites, bio: u.bio || '', avatarUrl: u.avatarUrl || '', followerCount: (u.followers || []).length });
});

// Accept multipart/form-data with optional avatar file and bio/name fields
router.put('/me', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    if (name) req.user.name = name;
    if (typeof bio !== 'undefined') req.user.bio = bio;
    // accept dietaryPreferences as JSON string or repeated fields
    if (req.body.dietaryPreferences) {
      try {
        req.user.dietaryPreferences = typeof req.body.dietaryPreferences === 'string'
          ? JSON.parse(req.body.dietaryPreferences)
          : req.body.dietaryPreferences;
      } catch (e) {
        req.user.dietaryPreferences = Array.isArray(req.body.dietaryPreferences) ? req.body.dietaryPreferences : [req.body.dietaryPreferences];
      }
    }
    if (req.file) {
      // store relative path for client to fetch
      req.user.avatarUrl = `/uploads/${req.file.filename}`;
    }
    // support explicit avatar removal from client
    if (req.body && (req.body.removeAvatar === '1' || req.body.removeAvatar === 'true' || req.body.removeAvatar === true)) {
      req.user.avatarUrl = '';
    }
    await req.user.save();
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email, bio: req.user.bio || '', avatarUrl: req.user.avatarUrl || '', followerCount: (req.user.followers || []).length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/me/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });
    const bcrypt = require('bcryptjs');
    const ok = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid current password' });
    const salt = await bcrypt.genSalt(10);
    req.user.passwordHash = await bcrypt.hash(newPassword, salt);
    await req.user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account (also remove their recipes)
router.delete('/me', auth, async (req, res) => {
  try {
    // remove user's recipes
    await Recipe.deleteMany({ owner: req.user._id });
    await req.user.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public profile view for discovery: returns name, avatar, bio and their public recipes
router.get('/:id/public', async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('name avatarUrl bio');
    if (!u) return res.status(404).json({ message: 'Not found' });
    const recipes = await Recipe.find({ owner: u._id, isPublic: true }).select('title imageUrl caloriesTotal createdAt').sort({ createdAt: -1 }).limit(50);
    res.json({ id: u._id, name: u.name, avatarUrl: u.avatarUrl || '', bio: u.bio || '', recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle follow/unfollow another user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const meId = req.user._id;
    const already = (target.followers || []).some(f => f.toString() === meId.toString());
    if (already) {
      // unfollow
      target.followers = (target.followers || []).filter(f => f.toString() !== meId.toString());
      await target.save();
      return res.json({ message: 'Unfollowed', followerCount: (target.followers || []).length });
    } else {
      target.followers = (target.followers || []).concat([meId]);
      await target.save();
      return res.json({ message: 'Followed', followerCount: (target.followers || []).length });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List followers for a user (public) - returns basic info
router.get('/:id/followers', async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('followers');
    if (!u) return res.status(404).json({ message: 'Not found' });
    const ids = u.followers || [];
    const users = await User.find({ _id: { $in: ids } }).select('name email avatarUrl');
    res.json({ count: users.length, followers: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
