import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPageSimple from './pages/LandingPageSimple'
import StartupsPage from './pages/StartupsPage'
import StartupCreateSimple from './pages/StartupCreateSimple'
import CollaborateSimple from './pages/CollaborateSimple'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPageSimple />} />
          <Route path="/startups" element={<StartupsPage />} />
          <Route path="/startups/create" element={<StartupCreateSimple />} />
          <Route path="/collaborate" element={<CollaborateSimple />} />
          <Route path="*" element={<LandingPageSimple />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
