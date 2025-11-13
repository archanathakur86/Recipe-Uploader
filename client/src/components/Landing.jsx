import React from 'react';
import { Link } from 'react-router-dom';
import './landing.css';
import carbonara from '../assets/carbonara.jpg';
import salmon from '../assets/salmon.jpg';
import heroImg from '../assets/hero.jpg';
import bgBehind from '../assets/clom.jpg';
import Features from './Features';

export default function Landing() {
  // debug asset paths in browser console to confirm imports
  try { console.log('asset paths:', { carbonara, salmon, heroImg }); } catch (e) {}
  return (
    <>
      <div className="landing-hero">
        <header className="landing-nav">
          <div className="brand">
            <svg className="hp-check-sm" viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#FF7A2D" />
              <path d="M8.2 12.8l1.9 1.9 4.2-5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            HomePlate
          </div>
          <nav>
            <Link className="btn btn-cta" to="/signin">Login</Link>
            <Link className="btn btn-cta" to="/signup">Sign Up</Link>
          </nav>
        </header>

        <div className="hero-content">
          <div className="hero-left">
            <div className="tag">Smartly curated</div>
            <h1>
              Your Personal <span className="accent">Cloud</span> <span className="accent">Kitchen</span>
            </h1>
            <p className="lead">
              Store, organize, and discover recipes with our intelligent cloud platform. Generate new recipes with AI,
              track nutrition, and share with a vibrant cooking community.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary" to="/signup">Start Cooking →</Link>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true">
            <div className="mock-cards-wrap">
              <div className="mock-cards-bg" style={{ backgroundImage: `url(${bgBehind})` }} />
              <div className="mock-cards">
                <div className="mock-card mock-card-large">
                  <img
                    src={heroImg}
                    alt="Hero dish"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onLoad={(e) => { if (e && e.currentTarget) { e.currentTarget.style.border = '3px solid rgba(34,197,94,0.9)'; setTimeout(() => { if (e.currentTarget) e.currentTarget.style.border = ''; }, 900); } }}
                    onError={(e) => { console.warn('Hero image failed to load', e); }}
                  />
                  <div className="mock-meta">
                    <span className="mock-cal">520 cal</span>
                    <div className="mock-title">Hero Shot</div>
                  </div>
                </div>

                <div className="mock-card mock-card-medium">
                  <img src={salmon} alt="Herb-Crusted Grilled Salmon" />
                  <div className="mock-meta">
                    <span className="mock-cal">380 cal</span>
                    <div className="mock-title">Herb-Crusted Grilled Salmon</div>
                  </div>
                </div>

                <div className="mock-card mock-card-small">
                  <img src={heroImg} alt="Fresh ingredients" />
                  <div className="mock-meta">
                    <span className="mock-cal">220 cal</span>
                    <div className="mock-title">Fresh Garden Salad</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features and social proof inserted below hero */}
      <Features />
    </>
  );
}