import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  HStack,
  Avatar,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiTarget } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
  totalStartups: number;
  totalInvestors: number;
  totalFunding: string;
  successRate: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

interface StartupSummary {
  id: string;
  name: string;
  stage: string;
  funding: string;
  status: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [myStartups, setMyStartups] = useState<StartupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  // Personalized content based on user role
  const isAdmin = user?.roles?.includes('admin');
  const isEntrepreneur = user?.roles?.includes('entrepreneur');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on user role
        if (isAdmin) {
          setStats({
            totalStartups: 156,
            totalInvestors: 89,
            totalFunding: '$12.5M',
            successRate: 78
          });
          setActivities([
            { id: '1', type: 'admin', message: 'New startup "AI Vision" submitted for review', timestamp: '2 hours ago' },
            { id: '2', type: 'admin', message: 'Investor "TechVC" joined the platform', timestamp: '4 hours ago' },
            { id: '3', type: 'admin', message: 'Platform security scan completed successfully', timestamp: '1 day ago' }
          ]);
        } else {
          setStats({
            totalStartups: 3,
            totalInvestors: 12,
            totalFunding: '$250K',
            successRate: 67
          });
          setActivities([
            { id: '1', type: 'startup', message: 'Your startup "TechStart" received a new message', timestamp: '1 hour ago' },
            { id: '2', type: 'investment', message: 'Investor showed interest in your project', timestamp: '3 hours ago' },
            { id: '3', type: 'collaboration', message: 'New collaboration request from "DevCorp"', timestamp: '1 day ago' }
          ]);
        }
        
        setMyStartups([
          { id: '1', name: isAdmin ? 'Platform Overview' : 'TechStart Inc.', stage: isAdmin ? 'Live' : 'Seed', funding: isAdmin ? 'N/A' : '$50K', status: 'Active' },
          { id: '2', name: isAdmin ? 'User Management' : 'AI Vision', stage: isAdmin ? 'Beta' : 'Pre-Seed', funding: isAdmin ? 'N/A' : '$25K', status: 'In Review' }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text>Loading your personalized dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isAdmin ? 'Admin Dashboard' : 'Dashboard'} - KolaboLab</title>
        <meta name="description" content="Your personalized startup collaboration dashboard" />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW="7xl" py={8}>
          <VStack spacing={8} align="stretch">
            
            {/* Welcome Header */}
            <Box>
              <HStack spacing={4} mb={4}>
                <Avatar 
                  size="lg" 
                  name={`${user?.firstName} ${user?.lastName}`}
                  src={user?.avatar}
                />
                <VStack align="start" spacing={1}>
                  <Heading size="xl" className="gradient-text">
                    Welcome back, {user?.firstName}!
                  </Heading>
                  <Text color="gray.600" fontSize="lg">
                    {isAdmin 
                      ? "Here's your platform overview and admin insights" 
                      : "Here's what's happening with your startup journey"
                    }
                  </Text>
                  <HStack spacing={2}>
                    {user?.roles?.map((role) => (
                      <Badge 
                        key={role}
                        colorScheme={role === 'admin' ? 'red' : role === 'entrepreneur' ? 'brand' : 'green'} 
                        variant="subtle"
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    ))}
                  </HStack>
                  {user?.company && (
                    <Text fontSize="sm" color="gray.500">
                      {user.company} • {user.location}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>

            {/* Stats Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>{isAdmin ? 'Total Startups' : 'My Startups'}</StatLabel>
                    <StatNumber>{stats?.totalStartups}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      23.36%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>{isAdmin ? 'Total Investors' : 'Interested Investors'}</StatLabel>
                    <StatNumber>{stats?.totalInvestors}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      9.05%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>{isAdmin ? 'Platform Funding' : 'Total Funding'}</StatLabel>
                    <StatNumber>{stats?.totalFunding}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      12.15%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Success Rate</StatLabel>
                    <StatNumber>{stats?.successRate}%</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      5.25%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Recent Activity */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Recent Activity</Heading>
                <VStack spacing={3} align="stretch">
                  {activities.map((activity) => (
                    <Box key={activity.id} p={3} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                      <HStack justify="space-between">
                        <Text>{activity.message}</Text>
                        <Text fontSize="sm" color="gray.500">{activity.timestamp}</Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Quick Actions</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Button leftIcon={<FiTarget />} colorScheme="brand" variant="outline">
                    {isAdmin ? 'Review Startups' : 'Create Startup'}
                  </Button>
                  <Button leftIcon={<FiUsers />} colorScheme="green" variant="outline">
                    {isAdmin ? 'Manage Users' : 'Find Collaborators'}
                  </Button>
                  <Button leftIcon={<FiDollarSign />} colorScheme="purple" variant="outline">
                    {isAdmin ? 'Platform Analytics' : 'Seek Investment'}
                  </Button>
                </SimpleGrid>
              </CardBody>
            </Card>

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default DashboardPage;