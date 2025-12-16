# HomePlate - AI-Powered Recipe Management Platform

> Transform your cooking experience with intelligent recipe management, AI-powered meal planning, and comprehensive nutrition tracking.

##  Features

### 🤖 AI Recipe Generation
- Generate recipes from available ingredients in seconds
- Smart ingredient substitution suggestions
- Dietary restriction compatibility (Vegan, Keto, Gluten-Free)
- Instant macro and calorie calculations

###  Nutrition Tracking
- Automatic calorie and macro breakdown
- Daily/weekly nutrition dashboard
- Allergen warnings and ingredient alerts
- Health score ratings for each recipe

###  Smart Inventory Management
- Digital pantry with expiration tracking
- Auto-generated shopping lists
- Recipe suggestions from existing inventory
- Helps users manage inventory efficiently and reduce food waste

###  Community Features
- Share recipes with the community
- Follow inspiring chefs
- Save favorite recipes
- Rate and review dishes

##  Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **CSS3** - Modern styling with animations
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication

### AI Integration
- **Google Gemini API** - Recipe generation
- **OpenAI API** - Additional AI features (optional)

##  Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Google Gemini API key

### Clone Repository
```bash
git clone https://github.com/yourusername/Recipe-upload.git
cd Recipe-upload/my-mern-app
```

### Backend Setup
```bash
cd server
npm install

# Create .env file
cat > .env << EOL
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
EOL

# Start server
npm run dev
```

### Frontend Setup
```bash
cd ../client
npm install

# Start React app
npm start
```

The app will run on:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Environment Variables

Create `.env` file in the server directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_secret_key_here
GOOGLE_API_KEY=AIza...your_key_here
OPENAI_API_KEY=sk-...your_key_here
```

##  Project Structure

```
Recipe-upload/
├── my-mern-app/
│   ├── client/                 # React frontend
│   │   ├── public/
│   │   └── src/
│   │       ├── assets/         # Images and static files
│   │       ├── components/     # React components
│   │       │   ├── Landing.jsx
│   │       │   └── landing.css
│   │       └── App.js
│   │
│   └── server/                 # Node.js backend
│       ├── src/
│       │   ├── models/         # MongoDB models
│       │   ├── routes/         # API routes
│       │   ├── middleware/     # Auth & validation
│       │   └── index.js        # Entry point
│       └── .env
│
└── README.md
```

##  Usage

### 1. Sign Up / Login
Create an account or log in to access all features.

### 2. Generate AI Recipes
- Navigate to AI Recipe Generator
- Enter available ingredients
- Select dietary preferences
- Get instant recipe with instructions

### 3. Track Nutrition
- All recipes include automatic nutrition facts
- View daily/weekly nutrition dashboard
- Set and track health goals

### 4. Manage Inventory
- Add items to your digital pantry
- Get expiration alerts
- Generate shopping lists automatically

## API Endpoints

### Authentication
```
POST /api/auth/signup     - Register new user
POST /api/auth/signin     - Login user
GET  /api/auth/profile    - Get user profile
```

### Recipes
```
GET    /api/recipes       - Get all recipes
POST   /api/recipes       - Create recipe
GET    /api/recipes/:id   - Get single recipe
PUT    /api/recipes/:id   - Update recipe
DELETE /api/recipes/:id   - Delete recipe
```

### AI Generation
```
POST /api/ai/generate     - Generate recipe with AI
POST /api/ai/nutrition    - Calculate nutrition
```

## Features Showcase

### Premium Landing Page
- Glass-morphism navbar with scroll effect
- Floating hero cards with animations
- Gradient text effects and smooth transitions
- Responsive design for all devices

### User Dashboard
- Recipe collection management
- Nutrition analytics
- Inventory tracking
- Community feed

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Acknowledgments

- Google Gemini API for AI recipe generation
- MongoDB Atlas for cloud database
- React.js community for excellent documentation
- All contributors and testers

## Contact

For questions or support:
- Email: archanathakurs246@gmail.com
- GitHub: [@yourusername](https://github.com/archanathakur86)

## Learning Outcomes

- Gained hands-on experience with MERN stack development
- Integrated AI APIs into a full-stack application
- Implemented authentication and protected routes
- Improved understanding of REST APIs and database modeling
- Enhanced frontend UI/UX and responsive design skills

## Project Status

This project is actively being improved with planned enhancements such as better AI prompts, UI refinements, and additional user features.

---

*Transform your kitchen, one recipe at a time.* 
