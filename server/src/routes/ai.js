const express = require('express');
const router = express.Router();

const { generateRecipeAI } = require('../controllers/aiController');

router.post('/generate', generateRecipeAI);

module.exports = router;