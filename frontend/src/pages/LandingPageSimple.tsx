import React from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

const LandingPageSimple = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Kolabolab: Connect, <span className="highlight">Collaborate</span>, Create
          </h1>
          <p className="hero-subtitle">
            The inclusive startup ecosystem where entrepreneurs, collaborators, and investors 
            from all walks of life come together to build the future.
          </p>
          <div className="hero-buttons">
            <Link to="/startups/create" className="btn-primary large">Get Started Free</Link>
            <Link to="/startups" className="btn-secondary large">Explore Startups</Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">1,200+</span>
            <span className="stat-label">Startups</span>
          </div>
          <div className="stat">
            <span className="stat-number">5,000+</span>
            <span className="stat-label">Collaborators</span>
          </div>
          <div className="stat">
            <span className="stat-number">800+</span>
            <span className="stat-label">Investors</span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Built for Everyone</h2>
          <p className="section-subtitle">
            Our platform is designed with accessibility and inclusion at its core, 
            ensuring everyone can participate in the startup ecosystem.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Community</h3>
              <p>Connect with entrepreneurs and investors worldwide. Multi-language support and optimization for all markets.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Smart Matching</h3>
              <p>AI-powered algorithms that connect you with the right people while promoting diversity and eliminating bias.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>First Investor Connection</h3>
              <p>Streamlined workflow to connect with your first investor within 60 days. Transparent process and fair terms.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Build the Future?</h2>
            <p>
              Join thousands of entrepreneurs, collaborators, and investors who are creating 
              the next generation of innovative startups. Your journey starts here.
            </p>
            <div className="cta-buttons">
              <Link to="/startups/create" className="btn-primary large">Start Your Journey</Link>
              <Link to="/collaborate" className="btn-secondary large">Find Collaborators</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPageSimple