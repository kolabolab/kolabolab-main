import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Spinner, Text, VStack, Container } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'

// Layout components
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Page components (lazy loaded for better performance)
const HomePage = React.lazy(() => import('./pages/HomePage'))
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'))
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))
const StartupListPage = React.lazy(() => import('./pages/startups/StartupListPage'))
const StartupDetailPage = React.lazy(() => import('./pages/startups/StartupDetailPage'))
const CreateStartupPage = React.lazy(() => import('./pages/startups/CreateStartupPage'))
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'))
const SearchPage = React.lazy(() => import('./pages/SearchPage'))
const CollaborationsPage = React.lazy(() => import('./pages/CollaborationsPage'))
const InvestmentsPage = React.lazy(() => import('./pages/InvestmentsPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

// Protected route wrapper
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Loading component for route transitions with new design
const RouteLoader = () => (
  <Box minH="50vh" display="flex" alignItems="center" justifyContent="center">
    <Container maxW="md" textAlign="center">
      <VStack spacing={6}>
        <Box position="relative">
          <Spinner 
            size="xl" 
            color="brand.500" 
            thickness="4px"
            className="float-animation"
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w={12}
            h={12}
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%)"
            className="float-animation"
            style={{ animationDelay: '0.5s' }}
          />
        </Box>
        <VStack spacing={2}>
          <Text 
            fontSize="lg" 
            fontWeight="600"
            className="gradient-text"
          >
            Loading Amazing Content...
          </Text>
          <Text fontSize="sm" opacity={0.7}>
            Preparing your startup collaboration experience
          </Text>
        </VStack>
      </VStack>
    </Container>
  </Box>
)

function App() {
  useEffect(() => {
    // Add accessibility enhancements
    const handleRouteChange = () => {
      // Announce route changes to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.setAttribute('class', 'sr-only');
      announcement.textContent = `Navigated to ${document.title}`;
      document.body.appendChild(announcement);
      
      // Clean up after announcement
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Box minH="100vh">
          {/* Skip Link for Accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          <Navbar />
          
          <Box 
            as="main" 
            id="main-content"
            minH="calc(100vh - 80px)"
          >
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                
                {/* Auth routes */}
                <Route path="/auth/login" element={<Navigate to="/login" replace />} />
                <Route path="/auth/register" element={<Navigate to="/register" replace />} />
                <Route path="/auth/signin" element={<Navigate to="/login" replace />} />
                <Route path="/auth/signup" element={<Navigate to="/register" replace />} />
                <Route path="/signin" element={<Navigate to="/login" replace />} />
                <Route path="/signup" element={<Navigate to="/register" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Startup routes */}
                <Route path="/startups" element={<StartupListPage />} />
                <Route path="/startup" element={<Navigate to="/startups" replace />} />
                <Route path="/startups/:id" element={<StartupDetailPage />} />
                <Route path="/startup/:id" element={<Navigate to="/startups/:id" replace />} />
                
                {/* Search routes */}
                <Route path="/search" element={<SearchPage />} />
                <Route path="/find" element={<Navigate to="/search" replace />} />
                <Route path="/explore" element={<Navigate to="/search" replace />} />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-startup"
                  element={
                    <ProtectedRoute>
                      <CreateStartupPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create"
                  element={<Navigate to="/create-startup" replace />}
                />
                <Route
                  path="/new-startup"
                  element={<Navigate to="/create-startup" replace />}
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={<Navigate to="/profile" replace />}
                />
                <Route
                  path="/settings"
                  element={<Navigate to="/profile" replace />}
                />
                <Route
                  path="/collaborations"
                  element={
                    <ProtectedRoute>
                      <CollaborationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/collaborate"
                  element={<Navigate to="/collaborations" replace />}
                />
                <Route
                  path="/partnerships"
                  element={<Navigate to="/collaborations" replace />}
                />
                <Route
                  path="/investments"
                  element={
                    <ProtectedRoute>
                      <InvestmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invest"
                  element={<Navigate to="/investments" replace />}
                />
                <Route
                  path="/funding"
                  element={<Navigate to="/investments" replace />}
                />
                
                {/* Additional helpful routes */}
                <Route path="/about" element={<Navigate to="/" replace />} />
                <Route path="/contact" element={<Navigate to="/" replace />} />
                <Route path="/help" element={<Navigate to="/" replace />} />
                <Route path="/support" element={<Navigate to="/" replace />} />
                <Route path="/faq" element={<Navigate to="/" replace />} />
                <Route path="/pricing" element={<Navigate to="/" replace />} />
                <Route path="/features" element={<Navigate to="/" replace />} />
                <Route path="/demo" element={<Navigate to="/startups" replace />} />
                
                {/* Legacy route compatibility */}
                <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
                <Route path="/user/*" element={<Navigate to="/profile" replace />} />
                <Route path="/company/*" element={<Navigate to="/startups" replace />} />
                <Route path="/organizations/*" element={<Navigate to="/startups" replace />} />
                
                {/* 404 page - must be last */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Box>
          
          <Footer />
        </Box>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App