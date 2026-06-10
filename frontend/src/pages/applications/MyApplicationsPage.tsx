import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Badge,
  Spinner,
  Card,
  CardBody,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useMyApplications } from '../../hooks/useApplications'
import { ErrorState } from '../../components/ErrorState'
import type { ApplicationStatus } from '../../types/applications'

function getStatusColorScheme(status: ApplicationStatus): string {
  switch (status) {
    case 'pending':
      return 'orange'
    case 'accepted':
      return 'green'
    case 'rejected':
      return 'red'
    default:
      return 'gray'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const MyApplicationsPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useMyApplications()

  const cardBg = useColorModeValue('white', 'gray.800')
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  return (
    <>
      <Helmet>
        <title>My Applications - KolaboLab</title>
        <meta
          name="description"
          content="View and track the status of your submitted role applications on KolaboLab."
        />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW="6xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Heading size="xl" className="gradient-text">
              My Applications
            </Heading>

            {isLoading ? (
              <Box display="flex" justifyContent="center" py={12}>
                <Spinner size="lg" color="brand.500" />
              </Box>
            ) : isError ? (
              <ErrorState
                error={error?.message || 'Failed to load applications'}
                onRetry={() => refetch()}
              />
            ) : !data?.applications || data.applications.length === 0 ? (
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={4} py={8} textAlign="center">
                    <Text fontSize="lg" color="gray.500">
                      You haven't submitted any applications yet
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Browse startups and apply to roles that interest you.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {data.applications.map((application) => (
                  <Card key={application.id} bg={cardBg}>
                    <CardBody>
                      <HStack justify="space-between" align="start" flexWrap="wrap" gap={3}>
                        <VStack align="start" spacing={1}>
                          <Text
                            as={RouterLink}
                            to={`/startups/${application.startupId}`}
                            fontWeight="bold"
                            color="brand.600"
                            _hover={{ textDecoration: 'underline', color: 'brand.700' }}
                          >
                            {application.startupName}
                          </Text>
                          <Text fontSize="md" color="gray.700">
                            {application.roleTitle}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Submitted {formatDate(application.createdAt)}
                          </Text>
                        </VStack>
                        <Badge
                          colorScheme={getStatusColorScheme(application.status)}
                          variant="subtle"
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default MyApplicationsPage
