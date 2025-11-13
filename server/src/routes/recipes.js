const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');

// multer setup: save uploads to server/uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Public feed and search
router.get('/feed', recipeController.getFeed);
router.get('/search', recipeController.searchRecipes);

// My recipes (requires auth)
router.get('/mine', auth, recipeController.getMine);
// debugging: orphan recipes and claim
router.get('/orphans', recipeController.listOrphans);
router.post('/:id/claim', auth, recipeController.claimOrphan);

// Recipe CRUD
router.get('/:id', recipeController.getRecipe);
router.post('/', auth, upload.single('image'), recipeController.createRecipe);
router.put('/:id', auth, upload.single('image'), recipeController.updateRecipe);
router.delete('/:id', auth, recipeController.deleteRecipe);
router.post('/:id/restore', auth, recipeController.restoreRecipe);
// toggle favorite for authenticated user
router.post('/:id/favorite', auth, recipeController.toggleFavorite);
// record a share (no auth required)
router.post('/:id/share', recipeController.shareRecipe);

module.exports = router;