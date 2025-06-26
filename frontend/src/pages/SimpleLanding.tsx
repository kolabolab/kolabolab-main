import React from 'react'
import './SimpleLanding.css'

const SimpleLanding = () => {
  return (
    <div className="landing-container">
      <header className="header">
        <nav className="nav">
          <div className="logo">Kolabolab</div>
          <div className="nav-links">
            <a href="/startups">Startups</a>
            <a href="/collaborate">Collaborate</a>
            <a href="/investors">Investors</a>
            <button className="btn-primary">Get Started</button>
          </div>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Connect, <span className="highlight">Collaborate</span>, Create
            </h1>
            <p className="hero-subtitle">
              The inclusive startup ecosystem where entrepreneurs, collaborators, and investors 
              from all walks of life come together to build the future.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary large">Get Started Free</button>
              <button className="btn-secondary large">Explore Startups</button>
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
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">Kolabolab</div>
              <p>Building an inclusive startup ecosystem where innovation thrives through diversity.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Platform</h4>
                <a href="/startups">Browse Startups</a>
                <a href="/collaborate">Find Collaborators</a>
                <a href="/investors">Investor Dashboard</a>
              </div>
              <div className="footer-section">
                <h4>Resources</h4>
                <a href="/help">Help Center</a>
                <a href="/blog">Blog</a>
                <a href="/accessibility">Accessibility</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Kolabolab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default SimpleLanding