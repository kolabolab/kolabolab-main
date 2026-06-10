import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Button,
  Select,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  useColorModeValue,
  useToast,
  Tag,
  Wrap,
  WrapItem,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  useReceivedApplications,
  useUpdateApplicationStatus,
} from '../../hooks/useApplications';
import type { ApplicationStatus } from '../../types/applications';

const statusColorMap: Record<ApplicationStatus, string> = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const ReceivedApplicationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError, refetch } = useReceivedApplications(
    page,
    roleFilter || undefined,
    statusFilter || undefined
  );

  const updateStatus = useUpdateApplicationStatus();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const handleStatusUpdate = (id: string, status: 'accepted' | 'rejected') => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast({
            title: `Application ${status}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        },
        onError: (error) => {
          toast({
            title: 'Failed to update application',
            description: error.message || 'Something went wrong',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  };

  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <>
      <Helmet>
        <title>Received Applications - KolaboLab</title>
        <meta
          name="description"
          content="View and manage applications received for your startup roles."
        />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW={{ base: '7xl', '2xl': '90%' }} py={8}>
          <VStack spacing={8} align="stretch">
            {/* Page Header */}
            <Box>
              <Heading size="xl" className="gradient-text">
                Received Applications
              </Heading>
              <Text color="gray.600" fontSize="lg" mt={2}>
                Review and manage applications for your startup roles
              </Text>
            </Box>

            {/* Filter Controls */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={4} flexWrap="wrap">
                  <Box flex="1" minW="200px">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Filter by Role
                    </Text>
                    <Input
                      placeholder="Role title..."
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPage(1);
                      }}
                      size="sm"
                    />
                  </Box>
                  <Box minW="180px">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Filter by Status
                    </Text>
                    <Select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      size="sm"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            {/* Applications Table */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" py={8}>
                    <Spinner size="lg" color="brand.500" />
                  </Box>
                ) : isError ? (
                  <VStack spacing={4} py={8}>
                    <Text color="red.500">
                      Failed to load applications. Please try again.
                    </Text>
                    <Button
                      colorScheme="brand"
                      variant="outline"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </VStack>
                ) : !data?.applications || data.applications.length === 0 ? (
                  <VStack spacing={4} py={12} textAlign="center">
                    <Text fontSize="lg" color="gray.500">
                      No applications received yet
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Applications from candidates will appear here once they
                      apply to your startup roles.
                    </Text>
                  </VStack>
                ) : (
                  <>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Applicant</Th>
                            <Th>Role</Th>
                            <Th>Message</Th>
                            <Th>Skills</Th>
                            <Th>Date</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {data.applications.map((application) => (
                            <Tr key={application.id}>
                              <Td fontWeight="medium">
                                <ChakraLink
                                  as={Link}
                                  to={`/users/${application.applicantId}`}
                                  color="brand.500"
                                  _hover={{ textDecoration: 'underline' }}
                                >
                                  {application.applicantName}
                                </ChakraLink>
                              </Td>
                              <Td>{application.roleTitle}</Td>
                              <Td maxW="250px">
                                <Text noOfLines={2} fontSize="sm">
                                  {application.message}
                                </Text>
                              </Td>
                              <Td maxW="200px">
                                {application.highlightedSkills.length > 0 ? (
                                  <Wrap spacing={1}>
                                    {application.highlightedSkills.map(
                                      (skill) => (
                                        <WrapItem key={skill}>
                                          <Tag
                                            size="sm"
                                            colorScheme="brand"
                                            variant="subtle"
                                          >
                                            {skill}
                                          </Tag>
                                        </WrapItem>
                                      )
                                    )}
                                  </Wrap>
                                ) : (
                                  <Text fontSize="sm" color="gray.400">
                                    —
                                  </Text>
                                )}
                              </Td>
                              <Td>{formatDate(application.createdAt)}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    statusColorMap[application.status]
                                  }
                                  variant="subtle"
                                >
                                  {application.status.charAt(0).toUpperCase() +
                                    application.status.slice(1)}
                                </Badge>
                              </Td>
                              <Td>
                                {application.status === 'pending' ? (
                                  <HStack spacing={2}>
                                    <Button
                                      size="xs"
                                      colorScheme="green"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          application.id,
                                          'accepted'
                                        )
                                      }
                                      isLoading={updateStatus.isPending}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="xs"
                                      colorScheme="red"
                                      variant="outline"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          application.id,
                                          'rejected'
                                        )
                                      }
                                      isLoading={updateStatus.isPending}
                                    >
                                      Reject
                                    </Button>
                                  </HStack>
                                ) : (
                                  <Text fontSize="sm" color="gray.400">
                                    —
                                  </Text>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <HStack justify="center" mt={6} spacing={4}>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="brand"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          isDisabled={page <= 1}
                        >
                          Previous
                        </Button>
                        <Text fontSize="sm" color="gray.600">
                          Page {page} of {totalPages}
                        </Text>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="brand"
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          isDisabled={page >= totalPages}
                        >
                          Next
                        </Button>
                      </HStack>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default ReceivedApplicationsPage;
