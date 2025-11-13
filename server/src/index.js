const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Log which AI provider is configured at startup without exposing secrets
const aiProvider = process.env.GOOGLE_API_KEY ? 'gemini' : (process.env.OPENAI_API_KEY ? 'openai' : 'none');
console.log(`[AI] provider: ${aiProvider}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ai', aiRoutes);

// Database connection (supports MONGO_URI or MONGODB_URI)
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('No MongoDB connection string found in MONGO_URI or MONGODB_URI');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });