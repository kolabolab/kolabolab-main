import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './StartupCreate.css'

interface StartupForm {
  name: string
  description: string
  industry: string
  stage: string
  location: string
  teamSize: number
  fundingGoal: string
  website: string
  contactEmail: string
  pitch: string
  lookingFor: string[]
  impactArea: string
  accessibilityFeatures: string
}

const StartupCreateSimple = () => {
  const [formData, setFormData] = useState<StartupForm>({
    name: '',
    description: '',
    industry: '',
    stage: 'Pre-seed',
    location: '',
    teamSize: 1,
    fundingGoal: '',
    website: '',
    contactEmail: '',
    pitch: '',
    lookingFor: [],
    impactArea: '',
    accessibilityFeatures: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const industries = [
    'HealthTech', 'EdTech', 'FinTech', 'CleanTech', 'FoodTech', 
    'Aerospace', 'AI/ML', 'Social Impact', 'Accessibility', 'Other'
  ]

  const stages = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+']

  const impactAreas = [
    'Healthcare Access', 'Education Equity', 'Environmental Sustainability',
    'Economic Opportunity', 'Accessibility & Inclusion', 'Civic Technology',
    'Mental Health', 'Food Security', 'Climate Change', 'Other'
  ]

  const collaborationNeeds = [
    'Technical Co-founder', 'Lead Developer', 'UI/UX Designer', 
    'Product Manager', 'Marketing Expert', 'Business Development',
    'Data Scientist', 'Accessibility Expert', 'Legal Advisor', 'Investor'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(value)
        ? prev.lookingFor.filter(item => item !== value)
        : [...prev.lookingFor, value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Startup idea submitted:', formData)
    setSubmitted(true)
    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="startup-create-page">
        <div className="container">
          <div className="success-message">
            <h1>🎉 Your Startup Idea Has Been Submitted!</h1>
            <p>Thank you for sharing your vision with the Kolabolab community.</p>
            <div className="next-steps">
              <h2>What happens next?</h2>
              <ul>
                <li>Your startup will be reviewed and published within 24 hours</li>
                <li>Potential collaborators and investors will be able to discover your project</li>
                <li>You'll receive notifications when people express interest</li>
                <li>Our matching algorithm will suggest relevant connections</li>
              </ul>
            </div>
            <div className="action-buttons">
              <Link to="/startups" className="btn-primary">Browse Other Startups</Link>
              <Link to="/collaborate" className="btn-secondary">Find Collaborators</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="startup-create-page">
      <div className="page-header">
        <div className="container">
          <h1>Submit Your Startup Idea</h1>
          <p>Share your vision and connect with collaborators and investors who can help bring it to life.</p>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleSubmit} className="startup-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Startup Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your startup name"
                aria-describedby="name-help"
              />
              <small id="name-help">This will be displayed publicly to potential collaborators and investors.</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Brief Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe your startup in 2-3 sentences"
                aria-describedby="description-help"
              />
              <small id="description-help">Keep it concise and compelling - this will be the first thing people see.</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="industry">Industry *</label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select an industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stage">Current Stage *</label>
                <select
                  id="stage"
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  required
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country or 'Remote'"
                />
              </div>

              <div className="form-group">
                <label htmlFor="teamSize">Current Team Size</label>
                <input
                  type="number"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Social Impact & Accessibility</h2>
            
            <div className="form-group">
              <label htmlFor="impactArea">Primary Impact Area *</label>
              <select
                id="impactArea"
                name="impactArea"
                value={formData.impactArea}
                onChange={handleInputChange}
                required
                aria-describedby="impact-help"
              >
                <option value="">Select your primary social impact area</option>
                {impactAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <small id="impact-help">How does your startup contribute to social good?</small>
            </div>

            <div className="form-group">
              <label htmlFor="accessibilityFeatures">Accessibility Features</label>
              <textarea
                id="accessibilityFeatures"
                name="accessibilityFeatures"
                value={formData.accessibilityFeatures}
                onChange={handleInputChange}
                rows={2}
                placeholder="Describe any accessibility features your product includes or plans to include"
                aria-describedby="accessibility-help"
              />
              <small id="accessibility-help">This helps us match you with users and collaborators focused on inclusive design.</small>
            </div>
          </div>

          <div className="form-section">
            <h2>Detailed Pitch</h2>
            
            <div className="form-group">
              <label htmlFor="pitch">Full Pitch *</label>
              <textarea
                id="pitch"
                name="pitch"
                value={formData.pitch}
                onChange={handleInputChange}
                required
                rows={8}
                placeholder="Describe the problem you're solving, your solution, target market, business model, and what makes your approach unique..."
                aria-describedby="pitch-help"
              />
              <small id="pitch-help">Be detailed - this is where you tell your full story to potential collaborators and investors.</small>
            </div>
          </div>

          <div className="form-section">
            <h2>What Are You Looking For?</h2>
            
            <fieldset className="checkbox-group">
              <legend>Select all that apply:</legend>
              {collaborationNeeds.map(need => (
                <label key={need} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.lookingFor.includes(need)}
                    onChange={() => handleCheckboxChange(need)}
                  />
                  <span>{need}</span>
                </label>
              ))}
            </fieldset>
          </div>

          <div className="form-section">
            <h2>Contact & Additional Info</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactEmail">Contact Email *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website (Optional)</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fundingGoal">Funding Goal (Optional)</label>
              <input
                type="text"
                id="fundingGoal"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleInputChange}
                placeholder="e.g., $50,000 or €100,000"
                aria-describedby="funding-help"
              />
              <small id="funding-help">If you're seeking investment, specify the amount and currency.</small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Your Startup Idea'}
            </button>
            <Link to="/startups" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StartupCreateSimple