import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import estimateCalories from '../services/calorieEstimator';
import './RecipeDetail.css';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/recipes/${id}`);
        setRecipe(response.data);
        
        // Check if recipe is in user's favorites
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.favorites && user.favorites.includes(id)) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        alert('Failed to load recipe');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/recipes/${id}/favorite`);
        setIsFavorite(false);
      } else {
        await api.post(`/recipes/${id}/favorite`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status');
    }
  };

  if (loading) {
    return (
      <div className="recipe-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-error">
        <h2>Recipe not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const calories = recipe.caloriesTotal || estimateCalories(recipe);

  return (
    <div className="recipe-detail-container">
      {/* Header with Back Button */}
      <div className="recipe-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
        >
          {isFavorite ? '❤️' : '🤍'} {isFavorite ? 'Favorited' : 'Favorite'}
        </button>
      </div>

      {/* Recipe Hero Section */}
      <div className="recipe-hero">
        {recipe.imageUrl && (
          <div 
            className="recipe-hero-image"
            style={{ backgroundImage: `url(${recipe.imageUrl})` }}
          />
        )}
        <div className="recipe-hero-content">
          <h1 className="recipe-title">{recipe.title}</h1>
          {recipe.description && (
            <p className="recipe-description">{recipe.description}</p>
          )}
          
          {/* Recipe Meta Info */}
          <div className="recipe-meta">
            <div className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span>{recipe.prepTime || 30} min</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🔥</span>
              <span>{calories} cal</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🍽️</span>
              <span>{recipe.servings || 4} servings</span>
            </div>
            {recipe.healthScore && (
              <div className="meta-item health-score">
                <span className="meta-icon">🛡️</span>
                <span>Health: {recipe.healthScore}/10</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Start Cooking Mode Button - PROMINENT */}
      <div className="cooking-mode-section">
        <button 
          className="start-cooking-btn"
          onClick={() => navigate(`/recipe/${id}/cooking`)}
        >
          <span className="cooking-btn-icon">👨‍🍳</span>
          <div className="cooking-btn-content">
            <span className="cooking-btn-title">Start Cooking Mode</span>
            <span className="cooking-btn-subtitle">Hands-free with voice control</span>
          </div>
          <span className="cooking-btn-arrow">→</span>
        </button>
      </div>

      {/* Health Warnings */}
      {recipe.healthWarnings && (
        <div className="health-warning-box">
          <strong>⚠️ Health Warning:</strong> {recipe.healthWarnings}
        </div>
      )}

      {/* Nutritional Claims */}
      {recipe.nutritionalClaims && recipe.nutritionalClaims.length > 0 && (
        <div className="nutritional-claims">
          {recipe.nutritionalClaims.map((claim, idx) => (
            <span key={idx} className="claim-badge">
              ✓ {claim}
            </span>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="recipe-content-grid">
        
        {/* Ingredients Section */}
        <div className="recipe-section ingredients-section">
          <h2>🥘 Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="ingredient-item">
                  <span className="ingredient-checkbox"></span>
                  <span className="ingredient-text">
                    {typeof ing === 'string' ? ing : (
                      <>
                        {ing.quantity && <strong>{ing.quantity}</strong>} {ing.name || ing}
                      </>
                    )}
                  </span>
                </li>
              ))
            ) : (
              <li>No ingredients listed</li>
            )}
          </ul>
        </div>

        {/* Instructions Section */}
        <div className="recipe-section instructions-section">
          <h2>📝 Instructions</h2>
          <div className="instructions-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(() => {
              // Parse instructions into steps
              let instructionSteps = [];
              
              if (Array.isArray(recipe.instructions)) {
                instructionSteps = recipe.instructions.filter(step => step && step.trim() !== '');
              } else if (typeof recipe.instructions === 'string') {
                // Split by "Number + Dot + Space" (e.g., "1. ", "12. ")
                const rawSteps = recipe.instructions.split(/\d+\.\s+/);
                instructionSteps = rawSteps
                  .map(step => step.trim())
                  .filter(step => step.length > 0);
                
                // Fallback: if no numbered steps found, try newlines
                if (instructionSteps.length === 0 || (instructionSteps.length === 1 && instructionSteps[0] === recipe.instructions.trim())) {
                  instructionSteps = recipe.instructions
                    .split(/\n+/)
                    .map(step => step.trim())
                    .filter(step => step.length > 0)
                    .map(step => step.replace(/^[\d\.\)\-\*\•\s]+/, '').trim())
                    .filter(step => step.length > 0);
                }
              }
              
              return instructionSteps.length > 0 ? (
                instructionSteps.map((step, idx) => (
                  <div key={idx} className="instruction-step" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* Orange Circle Badge with Number */}
                    <div style={{
                      minWidth: '40px',
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #E85D04, #F48C06)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '700',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(232, 93, 4, 0.3)'
                    }}>
                      {idx + 1}
                    </div>
                    
                    {/* Step Content */}
                    <div style={{
                      flex: 1,
                      fontSize: '16px',
                      lineHeight: '1.8',
                      color: '#374151',
                      paddingTop: '8px'
                    }}>
                      {step}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#9CA3AF', fontSize: '15px' }}>No instructions provided</div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="recipe-footer">
        <div className="recipe-footer-info">
          <p>
            <strong>Created by:</strong> {recipe.author?.name || 'Anonymous'}
          </p>
          {recipe.createdAt && (
            <p>
              <strong>Added:</strong> {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="recipe-actions">
          <button className="action-btn" onClick={() => navigate(`/recipe/${id}/edit`)}>
            ✏️ Edit Recipe
          </button>
          <button className="action-btn secondary" onClick={() => window.print()}>
            🖨️ Print
          </button>
          <button className="action-btn secondary" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Recipe link copied!');
          }}>
            🔗 Share
          </button>
        </div>
      </div>
    </div>
  );
}
