import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';
import heroImg from '../assets/hero.jpg';
import salmon from '../assets/salmon.jpg';
import carbonara from '../assets/carbonara.jpg';
import nutritionImg from '../assets/nutrition.jpg';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className={`premium-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-wrapper">
          <Link to="/" className="logo-brand">
            <div className="logo-circle">🍳</div>
            <span className="brand-name">HomePlate<span className="brand-pro">PRO</span></span>
          </Link>
          
          <div className="nav-menu">
            <a href="#features" className="nav-item">Features</a>
            <a href="#how" className="nav-item">How it Works</a>
            <a href="#reviews" className="nav-item">Reviews</a>
            <a href="#pricing" className="nav-item">Pricing</a>
          </div>
          
          <div className="nav-cta">
            <Link to="/signin" className="link-signin">Log In</Link>
            <Link to="/signup" className="btn-gradient">Start Free Trial →</Link>
          </div>
        </div>
      </nav>

      <section className="epic-hero">
        <div className="hero-bg-gradient"></div>
        <div className="hero-wrapper">
          <div className="hero-content-left">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Now with AI-Powered Recipe Generation
            </div>
            
            <h1 className="hero-mega-title">
              Your Kitchen,
              <br />
              <span className="gradient-text">Reimagined</span>
            </h1>
            
            <p className="hero-description">
              Join 50,000+ home chefs using AI to create perfect recipes, track nutrition automatically, 
              and never waste food again. Transform your cooking experience in 60 seconds.
            </p>
            
            <div className="hero-actions">
              <Link to="/signup" className="btn-hero-primary">
                Start Free - No Card Required
                <span className="btn-arrow">→</span>
              </Link>
              <button className="btn-hero-secondary">
                <span className="play-icon">▶</span>
                Watch 90s Demo
              </button>
            </div>
            
            <div className="hero-proof">
              <div className="proof-avatars">
                <img src={salmon} alt="" className="avatar" />
                <img src={carbonara} alt="" className="avatar" />
                <img src={heroImg} alt="" className="avatar" />
              </div>
              <div className="proof-text">
                <strong>4.9/5</strong> from 12,000+ reviews
                <div className="stars">★★★★★</div>
              </div>
            </div>
          </div>
          
          <div className="hero-content-right">
            <div className="hero-visual">
              <div className="visual-card card-main">
                <img src={heroImg} alt="Recipe Dashboard" />
                <div className="card-overlay">
                  <span className="overlay-badge">✨ AI Generated</span>
                </div>
              </div>
              <div className="visual-card card-float-1">
                <img src={salmon} alt="Recipe" />
              </div>
              <div className="visual-card card-float-2">
                <img src={carbonara} alt="Recipe" />
              </div>
              <div className="floating-stats">
                <div className="stat-mini">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Recipes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trusted-by">
        <div className="trusted-wrapper">
          <p className="trusted-text">Trusted by home chefs at</p>
          <div className="companies-grid">
            <div className="company-item">FOOD NETWORK</div>
            <div className="company-item">BON APPÉTIT</div>
            <div className="company-item">TASTY</div>
            <div className="company-item">EPICURIOUS</div>
            <div className="company-item">SERIOUS EATS</div>
          </div>
        </div>
      </section>

      <section id="features" className="premium-features">
        <div className="features-wrapper">
          <div className="section-header-center">
            <span className="section-badge">POWERFUL FEATURES</span>
            <h2 className="section-mega-title">Everything you need to<br />master your kitchen</h2>
            <p className="section-subtitle">Stop juggling apps. HomePlate combines AI recipe generation, nutrition tracking, and inventory management in one beautiful platform.</p>
          </div>

          <div className="feature-showcase">
            <div className="feature-content">
              <div className="feature-icon-box">🤖</div>
              <span className="feature-label">AI-POWERED</span>
              <h3 className="feature-heading">Generate Recipes from Anything</h3>
              <p className="feature-desc">
                Type "chicken, broccoli, rice" and watch magic happen. Our AI creates complete recipes 
                with instructions, timing, and nutrition in 3 seconds flat.
              </p>
              <ul className="feature-benefits">
                <li><span className="check">✓</span> Works with any ingredients you have</li>
                <li><span className="check">✓</span> Dietary filters (Vegan, Keto, Gluten-Free)</li>
                <li><span className="check">✓</span> Smart substitution suggestions</li>
                <li><span className="check">✓</span> Saves 4+ hours per week meal planning</li>
              </ul>
              <Link to="/signup" className="feature-cta">Try AI Generator Free →</Link>
            </div>
            <div className="feature-visual">
              <div className="visual-frame">
                <img src={salmon} alt="AI Recipe Generation" />
                <div className="visual-badge top-right">⚡ 3 sec generation</div>
              </div>
            </div>
          </div>

          <div className="feature-showcase reversed">
            <div className="feature-content">
              <div className="feature-icon-box">💚</div>
              <span className="feature-label">HEALTH INSIGHTS</span>
              <h3 className="feature-heading">Nutrition Tracking on Autopilot</h3>
              <p className="feature-desc">
                Zero manual entry. Every recipe automatically includes complete nutrition facts, 
                calorie counts, and macro breakdowns. Hit your goals effortlessly.
              </p>
              <ul className="feature-benefits">
                <li><span className="check">✓</span> Automatic calorie & macro calculation</li>
                <li><span className="check">✓</span> Daily/weekly nutrition dashboard</li>
                <li><span className="check">✓</span> Allergen warnings & ingredient alerts</li>
                <li><span className="check">✓</span> Integrates with fitness apps</li>
              </ul>
              <Link to="/signup" className="feature-cta">Start Tracking Free →</Link>
            </div>
            <div className="feature-visual">
              <div className="visual-frame">
                <img src={nutritionImg} alt="Nutrition Tracking Dashboard" />
                <div className="visual-badge top-left">📊 Auto-calculated</div>
              </div>
            </div>
          </div>

          <div className="feature-showcase">
            <div className="feature-content">
              <div className="feature-icon-box">📦</div>
              <span className="feature-label">SMART PANTRY</span>
              <h3 className="feature-heading">Never Waste Food Again</h3>
              <p className="feature-desc">
                Digital pantry tracks what you have, alerts before expiration, and suggests recipes 
                based on your inventory. Reduce food waste by 40% on average.
              </p>
              <ul className="feature-benefits">
                <li><span className="check">✓</span> Expiration tracking & alerts</li>
                <li><span className="check">✓</span> Auto-generated shopping lists</li>
                <li><span className="check">✓</span> Recipe suggestions from inventory</li>
                <li><span className="check">✓</span> Save $100+ monthly on groceries</li>
              </ul>
              <Link to="/signup" className="feature-cta">Start Saving Free →</Link>
            </div>
            <div className="feature-visual">
              <div className="visual-frame">
                <img src={heroImg} alt="Inventory Management" />
                <div className="visual-badge top-right">💰 Avg $100/mo saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-banner">
        <div className="stats-wrapper">
          <div className="stat-block">
            <div className="stat-big">50K+</div>
            <div className="stat-small">Active Home Chefs</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <div className="stat-big">2M+</div>
            <div className="stat-small">Recipes Generated</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <div className="stat-big">4.9★</div>
            <div className="stat-small">Average Rating</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <div className="stat-big">98%</div>
            <div className="stat-small">Would Recommend</div>
          </div>
        </div>
      </section>

      <section id="reviews" className="testimonials-premium">
        <div className="testimonials-wrapper">
          <div className="section-header-center">
            <span className="section-badge">WALL OF LOVE</span>
            <h2 className="section-mega-title">Loved by thousands</h2>
          </div>
          
          <div className="testimonials-masonry">
            <div className="testimonial-premium">
              <div className="testimonial-header">
                <img src={salmon} alt="User" className="testimonial-avatar" />
                <div>
                  <div className="testimonial-name">Sarah Johnson</div>
                  <div className="testimonial-role">Home Chef • NYC</div>
                </div>
                <div className="testimonial-stars">★★★★★</div>
              </div>
              <p className="testimonial-quote">
                "Game changer! I've tried every recipe app and this is the only one that actually uses AI well. 
                Generated a 5-star dinner from random pantry items in 30 seconds."
              </p>
            </div>

            <div className="testimonial-premium featured">
              <div className="testimonial-header">
                <img src={carbonara} alt="User" className="testimonial-avatar" />
                <div>
                  <div className="testimonial-name">Michael Chen</div>
                  <div className="testimonial-role">Fitness Coach • SF</div>
                </div>
                <div className="testimonial-stars">★★★★★</div>
              </div>
              <p className="testimonial-quote">
                "The nutrition tracking is insanely accurate. Lost 18 lbs without feeling like I'm dieting. 
                HomePlate calculates everything automatically - I just cook and eat."
              </p>
            </div>

            <div className="testimonial-premium">
              <div className="testimonial-header">
                <img src={heroImg} alt="User" className="testimonial-avatar" />
                <div>
                  <div className="testimonial-name">Emily Rodriguez</div>
                  <div className="testimonial-role">Busy Mom • Austin</div>
                </div>
                <div className="testimonial-stars">★★★★★</div>
              </div>
              <p className="testimonial-quote">
                "Saves me 5+ hours every week. The AI meal planner knows what my kids will actually eat. 
                Our grocery bill dropped 30% with the inventory tracking!"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="cta-wrapper">
          <div className="cta-content-center">
            <h2 className="cta-title">Start cooking smarter today</h2>
            <p className="cta-subtitle">Join 50,000+ home chefs. Free for 14 days, no credit card required.</p>
            <div className="cta-buttons-stack">
              <Link to="/signup" className="btn-cta-mega">
                Start Free Trial
                <span className="btn-arrow">→</span>
              </Link>
              <p className="cta-fine-print">✓ Free forever for basic features  ✓ Cancel anytime  ✓ No setup fees</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="premium-footer">
        <div className="footer-wrapper">
          <div className="footer-top">
            <div className="footer-brand-col">
              <div className="footer-logo">
                <div className="logo-circle">🍳</div>
                <span className="brand-name">HomePlate</span>
              </div>
              <p className="footer-tagline">The intelligent cooking platform trusted by 50,000+ home chefs worldwide.</p>
              <div className="social-links">
                <a href="#" className="social-icon">𝕏</a>
                <a href="#" className="social-icon">in</a>
                <a href="#" className="social-icon">f</a>
                <a href="#" className="social-icon">📷</a>
              </div>
            </div>
            
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#">AI Generator</a>
              <a href="#">Mobile App</a>
            </div>
            
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Press Kit</a>
            </div>
            
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#">Help Center</a>
              <a href="#">Community</a>
              <a href="#">API Docs</a>
              <Link to="/signin">Login</Link>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2024 HomePlate. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}