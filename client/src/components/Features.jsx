import React from 'react';
import './features.css';

const FeatureCard = ({ title, desc, children }) => (
  <div className="feature-card">
    <div className="icon">{children}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

export default function Features() {
  return (
    <section className="features-section" aria-labelledby="features-heading">
      <div className="container">
        <h2 id="features-heading">Everything you need to master cooking</h2>

        <div className="features-grid">
          <FeatureCard
            title="Recipe Management"
            desc="Create, edit, and organize your favorite recipes."
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16" stroke="#FF7A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11h6" stroke="#FF7A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 15h10" stroke="#FF7A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </FeatureCard>

          <FeatureCard
            title="AI-Powered Generation"
            desc="Generate recipes and get nutritional insights with Gemini AI."
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="#FF7A2D" strokeWidth="2"/>
              <path d="M8 12h8" stroke="#FF7A2D" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 8v8" stroke="#FF7A2D" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </FeatureCard>

          <FeatureCard
            title="Community Sharing"
            desc="Share creations and discover recipes from other chefs."
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" stroke="#FF7A2D" strokeWidth="1.5" fill="none"/>
              <path d="M8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z" stroke="#FF7A2D" strokeWidth="1.5" fill="none"/>
              <path d="M8 13c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3zM16 13c-.29 0-.574.02-.854.06" stroke="#FF7A2D" strokeWidth="1.2" fill="none"/>
            </svg>
          </FeatureCard>

          <FeatureCard
            title="Favorites System"
            desc="Save and organize recipes you love for quick access."
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 20s-7-4.6-9-7.2C1.3 9.9 5 6 8.5 6 10 6 12 7.2 12 7.2S14 6 15.5 6C19 6 22.7 9.9 21 12.8 19 15.4 12 20 12 20z" stroke="#FF7A2D" strokeWidth="1.3" fill="rgba(255,122,45,0.06)"/>
            </svg>
          </FeatureCard>
        </div>

        <div className="social-proof">
          <div className="stat">
            <div className="num">10K+</div>
            <div className="label">Recipes Created</div>
          </div>
          <div className="stat">
            <div className="num">5K+</div>
            <div className="label">Happy Chefs</div>
          </div>
          <div className="stat">
            <div className="num">50K+</div>
            <div className="label">Meals Cooked</div>
          </div>
        </div>
      </div>

      <div className="cta-banner">
        <div className="container">
          <div className="cta-inner">
            <div>
              <h3>Ready to start your culinary adventure?</h3>
              <p>Join Culina and start organizing, generating, and sharing your best dishes.</p>
            </div>
            <div>
              <a className="btn btn-cta" href="/signup">Get Started</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}