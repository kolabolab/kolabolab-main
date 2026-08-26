import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Badge,
  Button,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  useColorModeValue,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from '../components/layout/PageHeader';
import { adminAPI } from '../services/apiClient';
import AnalyticsSection from './admin/AnalyticsSection';

interface AdminStats {
  totalUsers: number;
  totalStartups: number;
  pendingStartups: number;
}

interface PendingStartup {
  id: string;
  name: string;
  stage: string;
  status?: string;
  createdAt: string;
  creator: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingStartups, setPendingStartups] = useState<PendingStartup[]>([]);
  const [allStartups, setAllStartups] = useState<PendingStartup[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  // Chakra's toast `id` does not itself dedupe; StrictMode's double-invoked
  // effects fired every error toast twice and they stacked over the cards.
  const notifyOnce = useCallback(
    (opts: Parameters<ReturnType<typeof useToast>>[0] & { id: string }) => {
      if (!toastRef.current.isActive(opts.id)) toastRef.current(opts);
    },
    []
  );
  // Distinguishes "nothing here" from "we could not load it" — the page used to
  // claim that nothing exists after a 403.
  const [loadFailed, setLoadFailed] = useState<Record<string, boolean>>({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PendingStartup | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch {
      setLoadFailed((f) => ({ ...f, stats: true }));
      notifyOnce({
        id: 'admin-failed-to-load-stats',
        title: 'Failed to load stats',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  const fetchPendingStartups = useCallback(async () => {
    setPendingLoading(true);
    try {
      const data = await adminAPI.getPendingStartups();
      setPendingStartups(data);
    } catch {
      setLoadFailed((f) => ({ ...f, pending: true }));
      notifyOnce({
        id: 'admin-failed-to-load-pending-startups',
        title: 'Failed to load pending startups',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPendingLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
    fetchPendingStartups();
    // Fetch all startups
    adminAPI
      .getAllStartups()
      .then(setAllStartups)
      .catch(() => setLoadFailed((f) => ({ ...f, allStartups: true })));
    // Fetch all users
    adminAPI
      .getUsers()
      .then(setAllUsers)
      .catch(() => setLoadFailed((f) => ({ ...f, users: true })));
  }, [fetchStats, fetchPendingStartups]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.approveStartup(id);
      toast({
        id: 'admin-startup-approved',
        title: 'Startup approved',
        description: 'The startup is now visible to all users.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await fetchPendingStartups();
      await fetchStats();
    } catch {
      notifyOnce({
        id: 'admin-failed-to-approve-startup',
        title: 'Failed to approve startup',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.rejectStartup(id);
      toast({
        id: 'admin-startup-rejected',
        title: 'Startup rejected',
        description: 'The startup has been rejected.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await fetchPendingStartups();
      await fetchStats();
    } catch {
      notifyOnce({
        id: 'admin-failed-to-reject-startup',
        title: 'Failed to reject startup',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (startup: PendingStartup) => {
    setDeleteTarget(startup);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    onClose();
    try {
      await adminAPI.deleteStartup(deleteTarget.id);
      toast({
        id: 'admin-startup-deleted',
        title: 'Startup deleted',
        description: `"${deleteTarget.name}" has been permanently deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await fetchPendingStartups();
      await fetchStats();
    } catch {
      notifyOnce({
        id: 'admin-failed-to-delete-startup',
        title: 'Failed to delete startup',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const getStatusColorScheme = (status: string): string => {
    switch (status) {
      case 'active':
        return 'green';
      case 'pending_approval':
        return 'orange';
      case 'successful':
        return 'blue';
      case 'failed':
        return 'red';
      case 'paused':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - KolaboLab</title>
        <meta name="description" content="Admin dashboard for managing the KolaboLab platform" />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW={{ base: '7xl', '2xl': '90%' }} py={8}>
          <VStack spacing={8} align="stretch">
            {/* Page Header */}
            <Box>
            <PageHeader
              eyebrow="Platform"
              title="Admin dashboard"
              lede="Approve ventures, monitor activity and manage platform members."
            />
            </Box>

            {/* Platform Stats Section */}
            <Box>
              <Heading size="md" mb={4}>
                Platform Stats
              </Heading>
              {statsLoading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <Spinner size="lg" color="interactive-accent" />
                </Box>
              ) : !stats ? (
                <Card bg={cardBg}>
                  <CardBody>
                    <Text color="text-secondary" textAlign="center" py={4} fontSize="sm">
                      {loadFailed.stats
                        ? 'Could not load platform stats — you may not have admin access.'
                        : 'No platform stats available yet.'}
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Users</StatLabel>
                        <StatNumber>{stats.totalUsers}</StatNumber>
                        <StatHelpText>Registered accounts</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Startups</StatLabel>
                        <StatNumber>{stats.totalStartups}</StatNumber>
                        <StatHelpText>All startups on platform</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel>Pending Approval</StatLabel>
                        <StatNumber>{stats.pendingStartups}</StatNumber>
                        <StatHelpText>Awaiting review</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              )}
            </Box>

            {/* Analytics Section */}
            <AnalyticsSection />

            {/* Pending Startups Section */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>
                  Pending Startups
                </Heading>
                {pendingLoading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <Spinner size="md" color="interactive-accent" />
                  </Box>
                ) : pendingStartups.length === 0 ? (
                  <Text color="text-tertiary" textAlign="center" py={6}>
                    No startups pending approval
                  </Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Creator</Th>
                          <Th>Stage</Th>
                          <Th>Date</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {pendingStartups.map((startup) => (
                          <Tr key={startup.id}>
                            <Td fontWeight="medium">
                              <Link as={RouterLink} to={`/startups/${startup.id}`} color="interactive-accent" _hover={{ textDecoration: 'underline' }}>
                                {startup.name}
                              </Link>
                            </Td>
                            <Td>
                              {startup.creator.firstName} {startup.creator.lastName}
                            </Td>
                            <Td>
                              <Badge variant="subtle" colorScheme="purple">
                                {startup.stage}
                              </Badge>
                            </Td>
                            <Td>{formatDate(startup.createdAt)}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  onClick={() => handleApprove(startup.id)}
                                  isLoading={actionLoading === startup.id}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => handleReject(startup.id)}
                                  isLoading={actionLoading === startup.id}
                                >
                                  Reject
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </CardBody>
            </Card>

            {/* All Startups Section */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>
                  All Startups
                </Heading>
                {pendingLoading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <Spinner size="md" color="interactive-accent" />
                  </Box>
                ) : allStartups.length === 0 ? (
                  <Text color="text-tertiary" textAlign="center" py={6}>
                    {loadFailed.allStartups ? 'Could not load startups — you may not have admin access.' : 'No startups on the platform'}
                  </Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Creator</Th>
                          <Th>Status</Th>
                          <Th>Date</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {allStartups.map((startup) => (
                          <Tr key={startup.id}>
                            <Td fontWeight="medium">
                              <Link as={RouterLink} to={`/startups/${startup.id}`} color="interactive-accent" _hover={{ textDecoration: 'underline' }}>
                                {startup.name}
                              </Link>
                            </Td>
                            <Td>
                              {startup.creator.firstName} {startup.creator.lastName}
                            </Td>
                            <Td>
                              <Badge
                                variant="subtle"
                                colorScheme={getStatusColorScheme(startup.status || 'pending_approval')}
                              >
                                {startup.status === 'pending_approval' || !startup.status
                                  ? 'Pending'
                                  : startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
                              </Badge>
                            </Td>
                            <Td>{formatDate(startup.createdAt)}</Td>
                            <Td>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteClick(startup)}
                                isLoading={actionLoading === startup.id}
                              >
                                Delete
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </CardBody>
            </Card>
              {/* All Users Section */}
              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="md" mb={4}>
                    All Users
                  </Heading>
                  {allUsers.length === 0 ? (
                    <Text color="text-tertiary" textAlign="center" py={6}>
                      No users on the platform
                    </Text>
                  ) : (
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Roles</Th>
                            <Th>Joined</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {allUsers.map((user: any) => (
                            <Tr key={user.id}>
                              <Td fontWeight="medium">{user.firstName} {user.lastName}</Td>
                              <Td>{user.email}</Td>
                              <Td>
                                {(user.roles || []).map((role: string) => (
                                  <Badge key={role} colorScheme={role === 'admin' ? 'red' : 'brand'} mr={1} size="sm">
                                    {role}
                                  </Badge>
                                ))}
                              </Td>
                              <Td>{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </CardBody>
              </Card>
          </VStack>
        </Container>
      </Box>


      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef as React.RefObject<HTMLButtonElement>}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Startup
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot
              be undone and will remove all associated data.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef as React.RefObject<HTMLButtonElement>} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default AdminDashboardPage;
