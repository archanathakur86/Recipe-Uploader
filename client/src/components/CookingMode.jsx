import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CookingMode.css';

export default function CookingMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Parse instructions into steps - FIXED to handle numbered lists
  const parseInstructions = (instructions) => {
    if (!instructions) return ['No instructions available'];
    
    // If already an array, return it
    if (Array.isArray(instructions)) {
      return instructions.filter(step => step && step.trim() !== '');
    }
    
    // If it's a string, parse numbered steps
    if (typeof instructions === 'string') {
      // Split by digits followed by a dot and space (e.g., "1. ", "12. ")
      const rawSteps = instructions.split(/\d+\.\s+/);
      
      // Filter out empty strings (first item is often empty before "1.")
      const steps = rawSteps
        .map(step => step.trim())
        .filter(step => step.length > 0);
      
      // If no numbered steps found, try splitting by newlines or periods
      if (steps.length === 0 || (steps.length === 1 && steps[0] === instructions.trim())) {
        // Try splitting by newlines first
        const lineSteps = instructions
          .split(/\n+/)
          .map(step => step.trim())
          .filter(step => step.length > 0)
          .map(step => {
            // Remove leading numbers/bullets
            return step.replace(/^[\d\.\)\-\*\•\s]+/, '').trim();
          })
          .filter(step => step.length > 5);
        
        if (lineSteps.length > 1) {
          return lineSteps;
        }
        
        // Fallback: split by periods
        const periodSteps = instructions
          .split('.')
          .map(step => step.trim())
          .filter(step => step.length > 5)
          .map(step => step.replace(/^\d+[\.\):\-\s]+/, '').trim());
        
        return periodSteps.length > 0 ? periodSteps : [instructions.trim()];
      }
      
      return steps;
    }
    
    return ['No instructions available'];
  };

  // Fetch recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/recipes/${id}`);
        const recipeData = response.data;
        
        // Parse instructions into proper steps
        const parsedInstructions = parseInstructions(recipeData.instructions);
        
        // Update recipe with parsed instructions
        setRecipe({
          ...recipeData,
          instructions: parsedInstructions.length > 0 ? parsedInstructions : ['No instructions available']
        });
      } catch (error) {
        console.error('Error fetching recipe:', error);
        alert('Failed to load recipe');
        navigate(-1);
      }
    };
    fetchRecipe();
  }, [id, navigate]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).toLowerCase();
      setTranscript(text);

      // Voice Commands
      if (text.includes('next') || text.includes('forward')) {
        handleNext();
        setTranscript('');
      } else if (text.includes('back') || text.includes('previous')) {
        handlePrevious();
        setTranscript('');
      } else if (text.includes('exit') || text.includes('quit')) {
        handleExit();
      } else if (text.includes('repeat')) {
        speakInstruction(recipe?.instructions[currentStep]);
        setTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition after no speech
        setTimeout(() => {
          if (isListening) {
            recognition.start();
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // Keep listening
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, currentStep, recipe]);

  // Start/Stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  // Text-to-Speech
  const speakInstruction = (instruction) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (recipe && currentStep < recipe.instructions.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      speakInstruction(recipe.instructions[newStep]);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      speakInstruction(recipe.instructions[newStep]);
    }
  };

  const handleExit = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    navigate(-1);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'n') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        handleExit();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, recipe, isListening]);

  if (!recipe) {
    return (
      <div className="cooking-mode-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  // Ensure instructions is always an array
  const instructions = Array.isArray(recipe.instructions) 
    ? recipe.instructions 
    : [];
  
  const totalSteps = instructions.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="cooking-mode-container">
      {/* Header */}
      <div className="cooking-mode-header">
        <button className="exit-btn" onClick={handleExit} title="Exit (ESC)">
          ✕
        </button>
        <h2 className="recipe-title-cooking">{recipe.title}</h2>
        <div className="voice-indicator">
          {isListening && (
            <span className="listening-pulse">
              🎤 Listening...
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="step-counter">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {/* Main Instruction Area - UPDATED WITH TAILWIND */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '60px 40px',
        textAlign: 'center'
      }}>
        
        {/* Big Orange Circle with Step Number */}
        <div 
          style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, #E85D04 0%, #F48C06 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(232, 93, 4, 0.6)',
            marginBottom: '32px',
            animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <span style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
          }}>
            {currentStep + 1}
          </span>
        </div>
        
        {/* Large Instruction Text */}
        <div style={{
          fontSize: '48px',
          fontWeight: '600',
          color: '#ffffff',
          lineHeight: '1.4',
          maxWidth: '1200px',
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          animation: 'fadeInUp 0.6s ease',
          fontFamily: "'Playfair Display', serif"
        }}>
          {instructions[currentStep] || 'No instruction available'}
        </div>
      </div>

      {/* Voice Command Hints */}
      {transcript && (
        <div className="transcript-display">
          Heard: "{transcript}"
        </div>
      )}

      {/* Navigation Controls */}
      <div className="cooking-mode-controls">
        <button 
          className="nav-btn prev-btn"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          title="Previous (← or 'Back')"
        >
          ← Previous
        </button>

        <button 
          className={`voice-btn ${isListening ? 'active' : ''}`}
          onClick={toggleListening}
          title="Toggle Voice Control (Space)"
        >
          {isListening ? '🎤 Stop' : '🎤 Start Voice'}
        </button>

        <button 
          className="nav-btn next-btn"
          onClick={handleNext}
          disabled={currentStep === totalSteps - 1}
          title="Next (→ or 'Next')"
        >
          Next →
        </button>
      </div>

      {/* Voice Commands Help */}
      <div className="voice-commands-help">
        <p>🎤 Voice Commands: "Next" | "Back" | "Repeat" | "Exit"</p>
        <p>⌨️ Keyboard: Arrow Keys | Space (voice toggle) | ESC (exit)</p>
      </div>

      {/* Completion Message */}
      {currentStep === totalSteps - 1 && (
        <div className="completion-badge">
          🎉 Final Step!
        </div>
      )}
    </div>
  );
}
