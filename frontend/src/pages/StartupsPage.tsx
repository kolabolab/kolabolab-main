import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './StartupsPage.css'

interface Startup {
  id: string
  name: string
  description: string
  stage: string
  industry: string
  location: string
  teamSize: number
  fundingGoal?: number
  logo?: string
}

const StartupsPage = () => {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')

  // Mock data for now - replace with API call
  useEffect(() => {
    const mockStartups: Startup[] = [
      {
        id: '1',
        name: 'EcoTech Solutions',
        description: 'Sustainable technology for environmental monitoring and carbon footprint reduction.',
        stage: 'Seed',
        industry: 'CleanTech',
        location: 'San Francisco, CA',
        teamSize: 8,
        fundingGoal: 500000
      },
      {
        id: '2',
        name: 'HealthAI',
        description: 'AI-powered healthcare diagnostics platform for early disease detection.',
        stage: 'Series A',
        industry: 'HealthTech',
        location: 'Boston, MA',
        teamSize: 15,
        fundingGoal: 2000000
      },
      {
        id: '3',
        name: 'EduConnect',
        description: 'Connecting students worldwide through collaborative learning platforms.',
        stage: 'Pre-seed',
        industry: 'EdTech',
        location: 'Austin, TX',
        teamSize: 5,
        fundingGoal: 250000
      },
      {
        id: '4',
        name: 'FinanceFlow',
        description: 'Blockchain-based financial services for underbanked communities.',
        stage: 'Seed',
        industry: 'FinTech',
        location: 'New York, NY',
        teamSize: 12,
        fundingGoal: 1000000
      },
      {
        id: '5',
        name: 'FoodChain',
        description: 'Supply chain transparency platform for sustainable food production.',
        stage: 'Series A',
        industry: 'FoodTech',
        location: 'Portland, OR',
        teamSize: 20,
        fundingGoal: 3000000
      },
      {
        id: '6',
        name: 'SpaceLink',
        description: 'Satellite communication technology for remote area connectivity.',
        stage: 'Series B',
        industry: 'Aerospace',
        location: 'Los Angeles, CA',
        teamSize: 45,
        fundingGoal: 10000000
      }
    ]

    setTimeout(() => {
      setStartups(mockStartups)
      setLoading(false)
    }, 1000)
  }, [])

  const industries = ['All', 'CleanTech', 'HealthTech', 'EdTech', 'FinTech', 'FoodTech', 'Aerospace']

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = selectedIndustry === '' || selectedIndustry === 'All' || 
                           startup.industry === selectedIndustry
    return matchesSearch && matchesIndustry
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="startups-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing startups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="startups-page">
      <div className="page-header">
        <div className="container">
          <h1>Kolabolab: Discover Startups</h1>
          <p>Explore innovative companies and find your next opportunity to collaborate or invest.</p>
          <Link to="/startups/create" className="btn-primary">Submit Your Startup</Link>
        </div>
      </div>

      <div className="container">
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search startups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="industry-filters">
            {industries.map(industry => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry === 'All' ? '' : industry)}
                className={`filter-btn ${(selectedIndustry === industry || (selectedIndustry === '' && industry === 'All')) ? 'active' : ''}`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        <div className="startups-grid">
          {filteredStartups.map(startup => (
            <div key={startup.id} className="startup-card">
              <div className="startup-header">
                <div className="startup-logo">
                  {startup.logo ? (
                    <img src={startup.logo} alt={`${startup.name} logo`} />
                  ) : (
                    <div className="logo-placeholder">
                      {startup.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="startup-info">
                  <h3>{startup.name}</h3>
                  <p className="location">{startup.location}</p>
                </div>
                <div className="stage-badge">
                  {startup.stage}
                </div>
              </div>
              
              <p className="startup-description">{startup.description}</p>
              
              <div className="startup-details">
                <div className="detail-item">
                  <span className="label">Industry:</span>
                  <span className="value">{startup.industry}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Team Size:</span>
                  <span className="value">{startup.teamSize} members</span>
                </div>
                {startup.fundingGoal && (
                  <div className="detail-item">
                    <span className="label">Funding Goal:</span>
                    <span className="value">{formatCurrency(startup.fundingGoal)}</span>
                  </div>
                )}
              </div>
              
              <div className="startup-actions">
                <button className="btn-secondary">Learn More</button>
                <Link to="/collaborate" className="btn-primary">Collaborate</Link>
              </div>
            </div>
          ))}
        </div>

        {filteredStartups.length === 0 && (
          <div className="no-results">
            <h3>No startups found</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StartupsPage