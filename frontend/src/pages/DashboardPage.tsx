import React from 'react';
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
  VStack,
  HStack,
  Avatar,
  Badge,
  Button,
  Icon,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import {
  Rocket,
  Settings,
  Users,
  Search,
  Handshake,
  TrendingUp,
  PieChart,
  Briefcase,
  FileText,
  Inbox,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats, useDashboardActivities, useUserStartups } from '../hooks/useDashboardData';
import { useMyApplications } from '../hooks/useApplications';
import { EmptyStateStartups } from '../components/EmptyStateStartups';
import { EmptyStateActivities } from '../components/EmptyStateActivities';
import { ErrorState } from '../components/ErrorState';
import DashboardFeed from './dashboard/components/DashboardFeed';
import EmailVerificationBanner from '../components/EmailVerificationBanner';

/**
 * Format funding amount from cents to a USD currency display string.
 */
function formatFunding(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/**
 * Returns true when all stat values are zero, meaning no percentage
 * change indicators should be displayed.
 */
function areAllStatsZero(stats: { totalStartups: number; totalInvestors: number; totalFunding: number; successRate: number }): boolean {
  return stats.totalStartups === 0 && stats.totalInvestors === 0 && stats.totalFunding === 0 && stats.successRate === 0;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType;
  colorScheme: string;
  path: string;
}

const ENTREPRENEUR_ACTIONS: QuickAction[] = [
  { label: 'Create Startup', icon: Rocket, colorScheme: 'brand', path: '/create-startup' },
  { label: 'Manage Startups', icon: Settings, colorScheme: 'brand', path: '/dashboard#my-startups' },
  { label: 'Received Applications', icon: Inbox, colorScheme: 'brand', path: '/applications/received' },
];

const COLLABORATOR_ACTIONS: QuickAction[] = [
  { label: 'Discover Teams', icon: Search, colorScheme: 'accent', path: '/search' },
  { label: 'My Collaborations', icon: Handshake, colorScheme: 'accent', path: '/collaborations' },
  { label: 'My Applications', icon: FileText, colorScheme: 'accent', path: '/applications/mine' },
];

const INVESTOR_ACTIONS: QuickAction[] = [
  { label: 'Browse Opportunities', icon: TrendingUp, colorScheme: 'purple', path: '/investments' },
  { label: 'My Portfolio', icon: PieChart, colorScheme: 'purple', path: '/portfolio' },
];

const ADMIN_ACTIONS: QuickAction[] = [
  { label: 'Review Startups', icon: Briefcase, colorScheme: 'red', path: '/admin' },
  { label: 'Manage Users', icon: Users, colorScheme: 'red', path: '/admin' },
];

/**
 * Returns role-based quick actions for the given user roles.
 * Combines actions when a user has multiple roles.
 */
export function getQuickActionsForRoles(roles: string[]): QuickAction[] {
  if (roles.includes('admin')) {
    return ADMIN_ACTIONS;
  }

  const actions: QuickAction[] = [];

  if (roles.includes('entrepreneur')) {
    actions.push(...ENTREPRENEUR_ACTIONS);
  }
  if (roles.includes('collaborator')) {
    actions.push(...COLLABORATOR_ACTIONS);
  }
  if (roles.includes('investor')) {
    actions.push(...INVESTOR_ACTIONS);
  }

  return actions;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: activities, loading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = useDashboardActivities();
  const { data: startups, loading: startupsLoading, error: startupsError, refetch: refetchStartups } = useUserStartups();
  const { data: myApplicationsData, isLoading: applicationsLoading } = useMyApplications();

  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const activityBg = useColorModeValue('gray.50', 'gray.700');

  const roles = user?.roles || [];
  const isAdmin = user?.roles?.includes('admin');
  const quickActions = getQuickActionsForRoles(user?.roles ?? []);

  return (
    <>
      <Helmet>
        <title>{isAdmin ? 'Admin Dashboard' : 'Dashboard'} - KolaboLab</title>
        <meta name="description" content="Your personalized startup collaboration dashboard" />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW={{ base: "7xl", "2xl": "90%", "3xl": "85%" }} py={8}>
          <VStack spacing={8} align="stretch">

            {/* Email Verification Banner */}
            <EmailVerificationBanner />

            {/* Welcome Header */}
            <Box>
              <HStack spacing={4} mb={4}>
                <Avatar
                  size="lg"
                  name={`${user?.firstName} ${user?.lastName}`}
                  src={user?.avatar}
                />
                <VStack align="start" spacing={1}>
                  <Heading
                    as="h1"
                    fontSize={{ base: '1.875rem', md: '2.5rem' }}
                    lineHeight="1.05"
                    letterSpacing="-0.03em"
                  >
                    Welcome back, {user?.firstName}!
                  </Heading>
                  <Text color="text-secondary" fontSize="lg">
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
                    <Text fontSize="sm" color="text-tertiary">
                      {user.company} • {user.location}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>

            {/* Stats Grid */}
            {statsLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <Spinner size="lg" color="interactive-accent" />
              </Box>
            ) : statsError ? (
              <ErrorState error={statsError.message} onRetry={refetchStats} />
            ) : stats ? (
              <Box
                bg={cardBg}
                border="1px solid"
                borderColor="border-subtle"
                borderRadius="xl"
                overflow="hidden"
              >
                <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={0}>
                  {[
                    {
                      label: isAdmin ? 'Total Startups' : 'My Startups',
                      value: String(stats.totalStartups),
                      help: 'Startups created',
                    },
                    {
                      label: isAdmin ? 'Total Investors' : 'Interested Investors',
                      value: String(stats.totalInvestors),
                      help: 'Across all startups',
                    },
                    {
                      label: isAdmin ? 'Platform Funding' : 'Total Funding',
                      value: formatFunding(stats.totalFunding),
                      help: 'Total raised',
                    },
                    {
                      label: 'Success Rate',
                      value: `${stats.successRate}%`,
                      help: 'Of your startups',
                    },
                  ].map((item, i) => (
                    <Box
                      key={item.help}
                      px={{ base: 5, lg: 7 }}
                      py={{ base: 5, lg: 6 }}
                      borderLeft={{ base: 'none', lg: i === 0 ? 'none' : '1px solid' }}
                      borderTop={{ base: i > 1 ? '1px solid' : 'none', lg: 'none' }}
                      borderColor="border-subtle"
                    >
                      <Stat>
                        <StatLabel
                          fontSize="xs"
                          fontWeight="600"
                          letterSpacing="0.1em"
                          textTransform="uppercase"
                          color="text-tertiary"
                        >
                          {item.label}
                        </StatLabel>
                        <StatNumber
                          fontFamily="heading"
                          fontSize={{ base: '1.875rem', lg: '2.5rem' }}
                          lineHeight="1.05"
                          letterSpacing="-0.03em"
                          mt={2}
                        >
                          {item.value}
                        </StatNumber>
                        {!areAllStatsZero(stats) && (
                          <StatHelpText color="text-secondary" mt={2} mb={0}>
                            {item.help}
                          </StatHelpText>
                        )}
                      </Stat>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            ) : null}

            {/* Working surfaces: primary column + narrow rail.
                Previously every module was a full-width card of equal
                weight, so nothing led the page. */}
            <SimpleGrid
              columns={{ base: 1, xl: 3 }}
              spacing={{ base: 6, xl: 8 }}
              alignItems="start"
            >
              <VStack gridColumn={{ xl: "span 2" }} align="stretch" spacing={{ base: 6, xl: 8 }}>
            {/* My Startups */}
            {roles.includes('entrepreneur') && (
            <Card bg={cardBg} id="my-startups">
              <CardBody>
                <Heading size="md" mb={4}>My Startups</Heading>
                {startupsLoading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <Spinner size="md" color="interactive-accent" />
                  </Box>
                ) : startupsError ? (
                  <ErrorState error={startupsError.message} onRetry={refetchStartups} />
                ) : startups.length === 0 ? (
                  <EmptyStateStartups onCreateStartup={() => navigate('/create-startup')} />
                ) : (
                  <VStack spacing={3} align="stretch">
                    {startups.map((startup) => (
                      <Box
                        key={startup.id}
                        p={3}
                        borderRadius="md"
                        bg={activityBg}
                        cursor="pointer"
                        _hover={{ bg: 'brand.50', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                        opacity={startup.status === 'pending_approval' ? 0.75 : 1}
                        borderLeft={startup.status === 'pending_approval' ? '3px solid' : 'none'}
                        borderLeftColor={startup.status === 'pending_approval' ? 'orange.400' : 'transparent'}
                        onClick={() => navigate(`/startups/${startup.id}`)}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" color="text-primary">{startup.name}</Text>
                            <Text fontSize="sm" color="text-tertiary">{startup.stage}</Text>
                          </VStack>
                          <HStack spacing={3}>
                            <Text fontSize="sm" fontWeight="medium">
                              {formatFunding(startup.fundingAmount)}
                            </Text>
                            {startup.status === 'pending_approval' ? (
                              <Badge colorScheme="orange" variant="subtle">
                                Pending Approval
                              </Badge>
                            ) : (
                              <Badge
                                colorScheme={startup.status === 'active' ? 'green' : startup.status === 'successful' ? 'blue' : 'gray'}
                                variant="subtle"
                              >
                                {startup.status}
                              </Badge>
                            )}
                            {isAdmin && (
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!window.confirm(`Are you sure you want to delete "${startup.name}"?`)) return;
                                  try {
                                    const devHosts = ['kolabolab-api-dev', '0fc93d16', 'localhost', 'kolabolab-dev'];
                                    const isDev = devHosts.some(h => window.location.hostname.indexOf(h) !== -1);
                                    const apiBaseUrl = isDev ? 'https://kolabolab-api-dev.beryour.workers.dev' : 'https://kolabolab-api.beryour.workers.dev';
                                    const accessToken = localStorage.getItem('accessToken');
                                    const res = await fetch(`${apiBaseUrl}/api/startups/${startup.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${accessToken}` },
                                    });
                                    if (res.ok) {
                                      refetchStartups();
                                      refetchStats();
                                    }
                                  } catch (e2) { console.error('Delete failed:', e2); }
                                }}
                              >
                                Delete
                              </Button>
                            )}
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
            )}

            {/* My Applications (Collaborator) */}
            {roles.includes('collaborator') && (
            <Card bg={cardBg} id="my-applications">
              <CardBody>
                <Heading size="md" mb={4}>My Applications</Heading>
                {applicationsLoading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <Spinner size="md" color="interactive-accent" />
                  </Box>
                ) : !myApplicationsData?.applications?.length ? (
                  <VStack spacing={3} py={6}>
                    <Text color="text-tertiary" textAlign="center">
                      You haven't submitted any applications yet. Browse startups to find opportunities.
                    </Text>
                    <Button
                      as={RouterLink}
                      to="/startups"
                      colorScheme="accent"
                      variant="outline"
                      size="sm"
                    >
                      Browse Startups
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {myApplicationsData.applications.map((application) => (
                      <Box
                        key={application.id}
                        p={3}
                        borderRadius="md"
                        bg={activityBg}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{application.startupName}</Text>
                            <Text fontSize="sm" color="text-tertiary">{application.roleTitle}</Text>
                          </VStack>
                          <Badge
                            colorScheme={
                              application.status === 'accepted' ? 'green' :
                              application.status === 'rejected' ? 'red' : 'yellow'
                            }
                            variant="subtle"
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
            )}

            {/* Investment Overview (Investor) */}
            {roles.includes('investor') && (
            <Card bg={cardBg} id="investment-overview">
              <CardBody>
                <Heading size="md" mb={4}>Investment Overview</Heading>
                <Text color="text-tertiary">Investment tracking coming soon. Browse startups to discover opportunities.</Text>
                <Button mt={4} as={RouterLink} to="/startups" colorScheme="brand" variant="outline" size="sm">
                  Browse Startups
                </Button>
              </CardBody>
            </Card>
            )}

            {/* Quick Actions */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Recent Updates</Heading>
                <DashboardFeed />
              </CardBody>
            </Card>

              </VStack>

              <VStack align="stretch" spacing={{ base: 6, xl: 8 }}>
            {/* Recent Activity */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Recent Activity</Heading>
                {activitiesLoading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <Spinner size="md" color="interactive-accent" />
                  </Box>
                ) : activitiesError ? (
                  <ErrorState error={activitiesError.message} onRetry={refetchActivities} />
                ) : activities.length === 0 ? (
                  <EmptyStateActivities />
                ) : (
                  <VStack spacing={3} align="stretch">
                    {activities.map((activity) => (
                      <Box key={activity.id} p={3} borderRadius="md" bg={activityBg}>
                        <HStack justify="space-between">
                          <Text>{activity.message}</Text>
                          <Text fontSize="sm" color="text-tertiary">{activity.timestamp}</Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Quick Actions (navigation) */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Quick Actions</Heading>
                {/* Lives in the narrow rail now, so it stacks instead of
                    forcing 4 columns into ~370px. */}
                <SimpleGrid columns={{ base: 1, sm: 2, xl: 1 }} spacing={3}>
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      leftIcon={<Icon as={action.icon} />}
                      colorScheme={action.colorScheme}
                      variant="outline"
                      onClick={() => navigate(action.path)}
                      justifyContent="flex-start"
                      fontWeight="500"
                    >
                      {action.label}
                    </Button>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
              </VStack>
            </SimpleGrid>

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default DashboardPage;
