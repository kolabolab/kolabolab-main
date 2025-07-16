import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Icon,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Divider,
  Flex,
  Link,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { 
  FiPlus, 
  FiTrendingUp, 
  FiUsers, 
  FiDollarSign, 
  FiBriefcase,
  FiEye,
  FiMessageSquare,
  FiBell,
  FiMoreVertical,
  FiTarget,
  FiAward,
  FiArrowRight
} from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'

interface DashboardStats {
  totalStartups: number;
  activeCollaborations: number;
  totalInvestments: number;
  networkConnections: number;
}

interface Activity {
  id: string;
  type: 'startup_view' | 'collaboration_request' | 'investment_interest' | 'message' | 'match';
  title: string;
  description: string;
  timestamp: string;
  actor?: {
    name: string;
    avatar: string;
    role: string;
  };
  actionRequired?: boolean;
}

interface StartupSummary {
  id: string;
  name: string;
  stage: string;
  industry: string;
  views: number;
  collaborators: number;
  fundingProgress: number;
  fundingGoal: string;
  lastActivity: string;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [myStartups, setMyStartups] = useState<StartupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    // Simulate API calls
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      setStats({
        totalStartups: 3,
        activeCollaborations: 7,
        totalInvestments: 2,
        networkConnections: 156,
      });

      setActivities([
        {
          id: '1',
          type: 'collaboration_request',
          title: 'New collaboration request',
          description: 'Sarah Chen wants to join EcoTech Solutions as a Frontend Developer',
          timestamp: '2 hours ago',
          actor: {
            name: 'Sarah Chen',
            avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=SC',
            role: 'Frontend Developer'
          },
          actionRequired: true,
        },
        {
          id: '2',
          type: 'investment_interest',
          title: 'Investment interest',
          description: 'GreenTech Ventures expressed interest in your startup',
          timestamp: '5 hours ago',
          actor: {
            name: 'GreenTech Ventures',
            avatar: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=GV',
            role: 'Investment Fund'
          },
          actionRequired: true,
        },
        {
          id: '3',
          type: 'startup_view',
          title: 'Startup profile viewed',
          description: 'Your startup EcoTech Solutions was viewed 15 times today',
          timestamp: '8 hours ago',
          actionRequired: false,
        },
        {
          id: '4',
          type: 'match',
          title: 'New match found',
          description: 'AI found 3 potential collaborators matching your requirements',
          timestamp: '1 day ago',
          actionRequired: false,
        },
        {
          id: '5',
          type: 'message',
          title: 'New message',
          description: 'Michael Rodriguez sent you a message about your HealthBridge project',
          timestamp: '2 days ago',
          actor: {
            name: 'Michael Rodriguez',
            avatar: 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=MR',
            role: 'Product Manager'
          },
          actionRequired: false,
        },
      ]);

      setMyStartups([
        {
          id: '1',
          name: 'EcoTech Solutions',
          stage: 'Growth',
          industry: 'CleanTech',
          views: 234,
          collaborators: 5,
          fundingProgress: 75,
          fundingGoal: '$2M',
          lastActivity: '2 hours ago',
        },
        {
          id: '2',
          name: 'HealthBridge Connect',
          stage: 'MVP',
          industry: 'HealthTech',
          views: 89,
          collaborators: 3,
          fundingProgress: 30,
          fundingGoal: '$500K',
          lastActivity: '1 day ago',
        },
        {
          id: '3',
          name: 'AgriSmart IoT',
          stage: 'Idea',
          industry: 'AgriTech',
          views: 45,
          collaborators: 1,
          fundingProgress: 10,
          fundingGoal: '$1M',
          lastActivity: '3 days ago',
        },
      ]);

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'collaboration_request': return FiUsers;
      case 'investment_interest': return FiDollarSign;
      case 'startup_view': return FiEye;
      case 'match': return FiTarget;
      case 'message': return FiMessageSquare;
      default: return FiBell;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'collaboration_request': return 'blue';
      case 'investment_interest': return 'green';
      case 'startup_view': return 'purple';
      case 'match': return 'orange';
      case 'message': return 'gray';
      default: return 'gray';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Idea': return 'gray';
      case 'MVP': return 'blue';
      case 'Growth': return 'green';
      case 'Scale': return 'purple';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Dashboard - KolaboLab</title>
        </Helmet>
        <Box py={8}>
          <Container maxW="7xl">
            <VStack spacing={8} align="stretch">
              <Skeleton height="60px" />
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardBody p={6}>
                      <Skeleton height="80px" />
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                <Card>
                  <CardBody p={6}>
                    <SkeletonText noOfLines={8} spacing={4} />
                  </CardBody>
                </Card>
                <Card>
                  <CardBody p={6}>
                    <SkeletonText noOfLines={8} spacing={4} />
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - KolaboLab</title>
        <meta 
          name="description" 
          content="Your personalized KolaboLab dashboard. Manage your startups, collaborations, and investment activities." 
        />
      </Helmet>

      <Box py={8}>
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            {/* Welcome Header */}
            <Box>
              <Heading size="xl" mb={2} className="gradient-text">
                Welcome back! 👋
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Here's what's happening with your startup journey
              </Text>
            </Box>

            {/* Quick Actions */}
            <Card className="glass-panel">
              <CardBody p={6}>
                <HStack spacing={4} flexWrap="wrap">
                  <Button
                    as={RouterLink}
                    to="/create-startup"
                    leftIcon={<FiPlus />}
                    variant="solid"
                    colorScheme="brand"
                    size="lg"
                    
                  >
                    Create Startup
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/startups"
                    leftIcon={<FiUsers />}
                    variant="outline"
                    colorScheme="brand"
                    size="lg"
                  >
                    Find Collaborators
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/investments"
                    leftIcon={<FiDollarSign />}
                    variant="outline"
                    colorScheme="green"
                    size="lg"
                  >
                    Investment Opportunities
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Stats Overview */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Card className="card-hover">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>My Startups</StatLabel>
                    <StatNumber fontSize="2xl">{stats?.totalStartups}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiBriefcase} mr={1} />
                      Active projects
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card className="card-hover">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Collaborations</StatLabel>
                    <StatNumber fontSize="2xl">{stats?.activeCollaborations}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiUsers} mr={1} />
                      Active partnerships
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card className="card-hover">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Investments</StatLabel>
                    <StatNumber fontSize="2xl">{stats?.totalInvestments}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiDollarSign} mr={1} />
                      Portfolio companies
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card className="card-hover">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Network</StatLabel>
                    <StatNumber fontSize="2xl">{stats?.networkConnections}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiTrendingUp} mr={1} />
                      Connections
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              {/* Recent Activity */}
              <Card className="glass-panel">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Recent Activity</Heading>
                    <Button variant="ghost" size="sm" rightIcon={<FiArrowRight />}>
                      View All
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    {activities.map((activity) => (
                      <Box key={activity.id}>
                        <HStack spacing={3} align="start">
                          <Box
                            p={2}
                            borderRadius="full"
                            bg={`${getActivityColor(activity.type)}.100`}
                            color={`${getActivityColor(activity.type)}.600`}
                          >
                            <Icon as={getActivityIcon(activity.type)} />
                          </Box>
                          <Box flex={1}>
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontWeight="semibold" fontSize="sm">
                                  {activity.title}
                                  {activity.actionRequired && (
                                    <Badge ml={2} colorScheme="red" size="sm">
                                      Action Required
                                    </Badge>
                                  )}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {activity.description}
                                </Text>
                                {activity.actor && (
                                  <HStack spacing={2}>
                                    <Avatar size="xs" src={activity.actor.avatar} />
                                    <Text fontSize="xs" color="gray.500">
                                      {activity.actor.name} • {activity.actor.role}
                                    </Text>
                                  </HStack>
                                )}
                                <Text fontSize="xs" color="gray.500">
                                  {activity.timestamp}
                                </Text>
                              </VStack>
                              {activity.actionRequired && (
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<FiMoreVertical />}
                                    variant="ghost"
                                    size="sm"
                                  />
                                  <MenuList>
                                    <MenuItem>View Details</MenuItem>
                                    <MenuItem>Accept</MenuItem>
                                    <MenuItem>Decline</MenuItem>
                                  </MenuList>
                                </Menu>
                              )}
                            </HStack>
                          </Box>
                        </HStack>
                        {activity.id !== activities[activities.length - 1].id && (
                          <Divider mt={4} />
                        )}
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* My Startups */}
              <Card className="glass-panel">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">My Startups</Heading>
                    <Button
                      as={RouterLink}
                      to="/create-startup"
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiPlus />}
                    >
                      New Startup
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    {myStartups.map((startup) => (
                      <Card key={startup.id} variant="outline" className="card-hover">
                        <CardBody p={4}>
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Link
                                  as={RouterLink}
                                  to={`/startups/${startup.id}`}
                                  fontWeight="semibold"
                                  _hover={{ textDecoration: 'underline' }}
                                >
                                  {startup.name}
                                </Link>
                                <HStack spacing={2}>
                                  <Badge colorScheme={getStageColor(startup.stage)} size="sm">
                                    {startup.stage}
                                  </Badge>
                                  <Text fontSize="sm" color="gray.500">
                                    {startup.industry}
                                  </Text>
                                </HStack>
                              </VStack>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<FiMoreVertical />}
                                  variant="ghost"
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem>Edit Startup</MenuItem>
                                  <MenuItem>View Analytics</MenuItem>
                                  <MenuItem>Manage Team</MenuItem>
                                  <MenuItem>Settings</MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>

                            <SimpleGrid columns={3} spacing={4} fontSize="sm">
                              <VStack spacing={1}>
                                <Text color="gray.500">Views</Text>
                                <Text fontWeight="semibold">{startup.views}</Text>
                              </VStack>
                              <VStack spacing={1}>
                                <Text color="gray.500">Collaborators</Text>
                                <Text fontWeight="semibold">{startup.collaborators}</Text>
                              </VStack>
                              <VStack spacing={1}>
                                <Text color="gray.500">Funding</Text>
                                <Text fontWeight="semibold">{startup.fundingGoal}</Text>
                              </VStack>
                            </SimpleGrid>

                            <Box>
                              <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Funding Progress
                                </Text>
                                <Text fontSize="sm" fontWeight="semibold">
                                  {startup.fundingProgress}%
                                </Text>
                              </HStack>
                              <Progress
                                value={startup.fundingProgress}
                                colorScheme="green"
                                size="sm"
                                borderRadius="full"
                              />
                            </Box>

                            <HStack justify="space-between" fontSize="sm">
                              <Text color="gray.500">
                                Last activity: {startup.lastActivity}
                              </Text>
                              <Link
                                as={RouterLink}
                                to={`/startups/${startup.id}`}
                                color="brand.500"
                                fontWeight="semibold"
                                _hover={{ textDecoration: 'underline' }}
                              >
                                View Details →
                              </Link>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Recommendations */}
            <Card className="support-context">
              <CardBody p={8}>
                <VStack spacing={6} textAlign="center">
                  <Box>
                    <Icon as={FiAward} w={12} h={12} color="blue.500" mb={4} />
                    <Heading size="lg" mb={2}>
                      Boost Your Startup Success
                    </Heading>
                    <Text color="gray.600" maxW="2xl">
                      Based on your activity, here are some personalized recommendations to accelerate your growth.
                    </Text>
                  </Box>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                    <VStack spacing={3} p={4} borderRadius="lg" bg={cardBg}>
                      <Icon as={FiUsers} w={8} h={8} color="brand.500" />
                      <Text fontWeight="semibold">Find Co-founders</Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Complete your team with skilled co-founders
                      </Text>
                      <Button size="sm" variant="outline" colorScheme="brand">
                        Browse Talent
                      </Button>
                    </VStack>
                    
                    <VStack spacing={3} p={4} borderRadius="lg" bg={cardBg}>
                      <Icon as={FiDollarSign} w={8} h={8} color="green.500" />
                      <Text fontWeight="semibold">Secure Funding</Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Connect with investors aligned with your vision
                      </Text>
                      <Button size="sm" variant="outline" colorScheme="green">
                        Find Investors
                      </Button>
                    </VStack>
                    
                    <VStack spacing={3} p={4} borderRadius="lg" bg={cardBg}>
                      <Icon as={FiTrendingUp} w={8} h={8} color="purple.500" />
                      <Text fontWeight="semibold">Growth Tools</Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Access resources to scale your startup
                      </Text>
                      <Button size="sm" variant="outline" colorScheme="purple">
                        Explore Tools
                      </Button>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default DashboardPage