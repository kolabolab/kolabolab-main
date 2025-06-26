import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Collaborate.css'

interface Collaborator {
  id: string
  name: string
  title: string
  location: string
  skills: string[]
  bio: string
  avatar?: string
  lookingFor: string[]
  experience: string
  availability: string
  impactAreas: string[]
}

const CollaborateSimple = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedImpactArea, setSelectedImpactArea] = useState('')

  const collaborators: Collaborator[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Full Stack Developer & Accessibility Expert',
      location: 'San Francisco, CA (Remote)',
      skills: ['React', 'Node.js', 'WCAG 2.2', 'Screen Reader Testing', 'TypeScript'],
      bio: 'Passionate about building inclusive web applications. 5+ years experience in accessible design and development.',
      lookingFor: ['Social Impact Startups', 'Healthcare Tech', 'Education Platforms'],
      experience: '5+ years',
      availability: '10-15 hours/week',
      impactAreas: ['Accessibility & Inclusion', 'Healthcare Access', 'Education Equity']
    },
    {
      id: '2',
      name: 'Marcus Thompson',
      title: 'Product Designer & UX Researcher',
      location: 'London, UK',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Inclusive Design'],
      bio: 'Design leader focused on creating products that work for everyone. Expert in user-centered design and accessibility.',
      lookingFor: ['Early-stage Startups', 'B2C Products', 'Social Impact'],
      experience: '7+ years',
      availability: '5-10 hours/week',
      impactAreas: ['Accessibility & Inclusion', 'Mental Health', 'Civic Technology']
    },
    {
      id: '3',
      name: 'Dr. Amara Okafor',
      title: 'Data Scientist & AI Ethics Researcher',
      location: 'Toronto, Canada',
      skills: ['Python', 'Machine Learning', 'Bias Detection', 'Statistical Analysis', 'TensorFlow'],
      bio: 'PhD in Computer Science with focus on ethical AI. Building fair and transparent machine learning systems.',
      lookingFor: ['AI/ML Startups', 'Bias Detection', 'Fair Algorithms'],
      experience: '8+ years',
      availability: '15-20 hours/week',
      impactAreas: ['AI Ethics', 'Economic Opportunity', 'Healthcare Access']
    },
    {
      id: '4',
      name: 'Raj Patel',
      title: 'Mobile Developer & Entrepreneur',
      location: 'Mumbai, India (Remote)',
      skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
      bio: 'Built 3 successful mobile apps. Passionate about technology for emerging markets and accessibility.',
      lookingFor: ['Mobile-first Startups', 'Emerging Markets', 'Social Commerce'],
      experience: '6+ years',
      availability: '20+ hours/week',
      impactAreas: ['Economic Opportunity', 'Financial Inclusion', 'Education Equity']
    },
    {
      id: '5',
      name: 'Elena Rodriguez',
      title: 'Marketing Strategist & Growth Expert',
      location: 'Barcelona, Spain',
      skills: ['Growth Marketing', 'Content Strategy', 'Social Media', 'Analytics', 'Multilingual'],
      bio: 'Growth marketing specialist with experience in global expansion. Fluent in 4 languages.',
      lookingFor: ['Global Expansion', 'B2C Startups', 'Content Creation'],
      experience: '5+ years',
      availability: '8-12 hours/week',
      impactAreas: ['Global Reach', 'Cultural Inclusion', 'Education Equity']
    },
    {
      id: '6',
      name: 'David Kim',
      title: 'Backend Engineer & DevOps Specialist',
      location: 'Seoul, South Korea',
      skills: ['Kubernetes', 'AWS', 'Python', 'PostgreSQL', 'Microservices'],
      bio: 'Senior engineer with expertise in scalable infrastructure. Passionate about clean energy tech.',
      lookingFor: ['CleanTech Startups', 'Infrastructure', 'Climate Solutions'],
      experience: '9+ years',
      availability: '10-15 hours/week',
      impactAreas: ['Environmental Sustainability', 'Climate Change', 'Clean Energy']
    }
  ]

  const skills = ['React', 'Node.js', 'Python', 'Design', 'Mobile', 'AI/ML', 'DevOps', 'Marketing', 'Accessibility']
  const locations = ['Remote', 'San Francisco', 'New York', 'London', 'Toronto', 'Mumbai', 'Barcelona', 'Seoul']
  const impactAreas = [
    'Accessibility & Inclusion', 'Healthcare Access', 'Education Equity', 
    'Environmental Sustainability', 'Economic Opportunity', 'Mental Health',
    'Climate Change', 'Civic Technology', 'Financial Inclusion'
  ]

  const filteredCollaborators = collaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.bio.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSkill = selectedSkill === '' || collaborator.skills.some(skill => 
      skill.toLowerCase().includes(selectedSkill.toLowerCase()))
    
    const matchesLocation = selectedLocation === '' || 
                           collaborator.location.toLowerCase().includes(selectedLocation.toLowerCase())
    
    const matchesImpactArea = selectedImpactArea === '' || 
                             collaborator.impactAreas.includes(selectedImpactArea)
    
    return matchesSearch && matchesSkill && matchesLocation && matchesImpactArea
  })

  return (
    <div className="collaborate-page">
      <div className="page-header">
        <div className="container">
          <h1>Find Collaborators</h1>
          <p>Connect with talented individuals who are passionate about using technology for social good.</p>
        </div>
      </div>

      <div className="container">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, skills, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search collaborators"
            />
          </div>
          
          <div className="filters">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="filter-select"
              aria-label="Filter by skill"
            >
              <option value="">All Skills</option>
              {skills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="filter-select"
              aria-label="Filter by location"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={selectedImpactArea}
              onChange={(e) => setSelectedImpactArea(e.target.value)}
              className="filter-select"
              aria-label="Filter by impact area"
            >
              <option value="">All Impact Areas</option>
              {impactAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="collaborators-grid">
          {filteredCollaborators.map(collaborator => (
            <div key={collaborator.id} className="collaborator-card">
              <div className="collaborator-header">
                <div className="avatar">
                  {collaborator.avatar ? (
                    <img src={collaborator.avatar} alt={`${collaborator.name} avatar`} />
                  ) : (
                    <div className="avatar-placeholder">
                      {collaborator.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <div className="collaborator-info">
                  <h3>{collaborator.name}</h3>
                  <p className="title">{collaborator.title}</p>
                  <p className="location">{collaborator.location}</p>
                </div>
              </div>

              <div className="collaborator-bio">
                <p>{collaborator.bio}</p>
              </div>

              <div className="collaborator-details">
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span className="value">{collaborator.experience}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Availability:</span>
                  <span className="value">{collaborator.availability}</span>
                </div>
              </div>

              <div className="skills-section">
                <h4>Skills</h4>
                <div className="skills-tags">
                  {collaborator.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="looking-for-section">
                <h4>Looking For</h4>
                <ul className="looking-for-list">
                  {collaborator.lookingFor.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="impact-areas-section">
                <h4>Impact Areas</h4>
                <div className="impact-tags">
                  {collaborator.impactAreas.map(area => (
                    <span key={area} className="impact-tag">{area}</span>
                  ))}
                </div>
              </div>

              <div className="collaborator-actions">
                <button className="btn-primary">Connect</button>
                <button className="btn-secondary">View Profile</button>
              </div>
            </div>
          ))}
        </div>

        {filteredCollaborators.length === 0 && (
          <div className="no-results">
            <h3>No collaborators found</h3>
            <p>Try adjusting your search terms or filters to find more collaborators.</p>
          </div>
        )}

        <div className="become-collaborator">
          <div className="cta-content">
            <h2>Want to Become a Collaborator?</h2>
            <p>Join our community of talented individuals making a positive impact through technology.</p>
            <Link to="/volunteer/register" className="btn-primary large">Join as Collaborator</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborateSimple