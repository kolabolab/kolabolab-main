import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const isActiveLink = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="layout-container">
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo">
            Kolabolab
          </Link>
          <div className="nav-links">
            <Link 
              to="/startups" 
              className={`nav-link ${isActiveLink('/startups') ? 'active' : ''}`}
            >
              Startups
            </Link>
            <Link 
              to="/collaborate" 
              className={`nav-link ${isActiveLink('/collaborate') ? 'active' : ''}`}
            >
              Collaborate
            </Link>
            <Link 
              to="/investors" 
              className={`nav-link ${isActiveLink('/investors') ? 'active' : ''}`}
            >
              Investors
            </Link>
            <Link to="/startups/create" className="btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Link to="/" className="logo">Kolabolab</Link>
              <p>Building an inclusive startup ecosystem where innovation thrives through diversity.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h3>Platform</h3>
                <Link to="/startups">Browse Startups</Link>
                <Link to="/collaborate">Find Collaborators</Link>
                <Link to="/investors">Investor Dashboard</Link>
                <Link to="/volunteer">Volunteer Opportunities</Link>
              </div>
              <div className="footer-section">
                <h3>Resources</h3>
                <Link to="/help">Help Center</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/accessibility">Accessibility</Link>
                <Link to="/funding">Funding Opportunities</Link>
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

export default Layout