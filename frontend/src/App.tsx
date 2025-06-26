import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'

// Layout components
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Sidebar } from './components/layout/Sidebar'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { LoadingSpinner } from './components/common/LoadingSpinner'

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
import { useAuth } from './hooks/useAuth'

// Loading component for route transitions
const RouteLoader = () => (
  <Flex justify="center" align="center" minH="50vh">
    <VStack spacing={4}>
      <Spinner size="xl" color="blue.500" thickness="4px" />
      <Text color="gray.600" fontSize="lg">Loading...</Text>
    </VStack>
  </Flex>
)

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Box minH="100vh" bg="gray.50">
          <Navbar />
          
          <Flex>
            {user && <Sidebar />}
            
            <Box 
              flex="1" 
              ml={user ? { base: 0, md: "250px" } : 0}
              transition="margin-left 0.3s"
            >
              <Box as="main" minH="calc(100vh - 80px)" p={{ base: 4, md: 6 }}>
                <Suspense fallback={<RouteLoader />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/startups" element={<StartupListPage />} />
                    <Route path="/startups/:id" element={<StartupDetailPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    
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
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
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
                      path="/investments"
                      element={
                        <ProtectedRoute>
                          <InvestmentsPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* 404 page */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Box>
              
              <Footer />
            </Box>
          </Flex>
        </Box>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App