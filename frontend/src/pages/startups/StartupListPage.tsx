import React, { useEffect, useRef } from 'react';
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
  Button,
  Badge,
  Icon,
  Flex,
  Tag,
  TagLabel,
  Image,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiEye,
  FiHeart,
  FiStar,
  FiArrowRight,
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useStartupSearch, StartupSearchResult } from '../../hooks/useStartupSearch';
import FilterPanel from './components/FilterPanel';

const StartupCard: React.FC<{ startup: StartupSearchResult }> = ({ startup }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in', 'visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Idea': return 'gray';
      case 'MVP': return 'blue';
      case 'Early Stage': return 'brand';
      case 'Growth': return 'brand';
      case 'Scale': return 'brand';
      default: return 'gray';
    }
  };

  const tags: string[] = Array.isArray(startup.tags) ? startup.tags : [];
  const lookingFor: any[] = Array.isArray(startup.lookingFor) ? startup.lookingFor : [];
  const fundingGoal = startup.fundingAmount
    ? `$${(startup.fundingAmount / 100).toLocaleString()}`
    : '';

  // Extract role titles from lookingFor (handles both string and object formats)
  const roleLabels = lookingFor.map((role) => {
    if (typeof role === 'string') return role;
    if (role && typeof role === 'object' && role.title) return role.title;
    return '';
  }).filter(Boolean);

  return (
    <Card
      ref={cardRef}
      className="fade-in card-hover card-secondary"
      cursor="pointer"
      height="100%"
      position="relative"
    >
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack spacing={4}>
            <Box
              boxSize="60px"
              borderRadius="lg"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text fontSize="xl" fontWeight="bold" color="gray.400">
                {startup.name.slice(0, 2).toUpperCase()}
              </Text>
            </Box>
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md" className="gradient-text" noOfLines={1}>
                {startup.name}
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme={getStageColor(startup.stage)} size="sm">
                  {startup.stage}
                </Badge>
                {startup.industry && (
                  <Text fontSize="sm" color="gray.500">
                    {startup.industry}
                  </Text>
                )}
              </HStack>
            </VStack>
          </HStack>

          {/* Description */}
          <Text fontSize="sm" lineHeight="tall" noOfLines={3}>
            {startup.description}
          </Text>

          {/* Tags */}
          {tags.length > 0 && (
            <HStack spacing={2} flexWrap="wrap">
              {tags.slice(0, 3).map((tag) => (
                <Tag key={tag} size="sm" colorScheme="gray" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              ))}
              {tags.length > 3 && (
                <Tag size="sm" colorScheme="brand" borderRadius="full">
                  <TagLabel>+{tags.length - 3}</TagLabel>
                </Tag>
              )}
            </HStack>
          )}

          {/* Looking For */}
          {roleLabels.length > 0 && (
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={2}>
                Looking for:
              </Text>
              <HStack spacing={1} flexWrap="wrap">
                {roleLabels.slice(0, 2).map((role) => (
                  <Badge key={role} colorScheme="accent" size="sm" borderRadius="md">
                    {role}
                  </Badge>
                ))}
                {roleLabels.length > 2 && (
                  <Badge colorScheme="brand" size="sm" borderRadius="md">
                    +{roleLabels.length - 2} more
                  </Badge>
                )}
              </HStack>
            </Box>
          )}

          {/* Stats */}
          <HStack spacing={4} fontSize="xs" color="gray.500">
            {startup.location && (
              <HStack spacing={1}>
                <Icon as={FiMapPin} />
                <Text>{startup.location}</Text>
              </HStack>
            )}
            <HStack spacing={1}>
              <Icon as={FiUsers} />
              <Text>{startup.teamSize} team</Text>
            </HStack>
            {fundingGoal && (
              <HStack spacing={1}>
                <Icon as={FiDollarSign} />
                <Text>{fundingGoal}</Text>
              </HStack>
            )}
          </HStack>

          {/* Actions */}
          <HStack spacing={3} pt={2}>
            <Button
              as={RouterLink}
              to={`/startups/${startup.id}`}
              variant="solid"
              colorScheme="brand"
              rightIcon={<FiArrowRight />}
              flex={1}
              size="sm"
            >
              View Details
            </Button>
            <Button
              as={RouterLink}
              to="/login"
              variant="outline"
              colorScheme="gray"
              size="sm"
              title="Sign in to save startup"
            >
              <Icon as={FiHeart} />
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const LoadingSkeleton: React.FC = () => (
  <Card>
    <CardBody p={6}>
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <Skeleton boxSize="60px" borderRadius="lg" />
          <VStack align="start" spacing={2} flex={1}>
            <Skeleton height="20px" width="60%" />
            <Skeleton height="16px" width="40%" />
          </VStack>
        </HStack>
        <SkeletonText noOfLines={3} spacing={2} />
        <HStack spacing={2}>
          <Skeleton height="20px" width="60px" borderRadius="full" />
          <Skeleton height="20px" width="80px" borderRadius="full" />
          <Skeleton height="20px" width="70px" borderRadius="full" />
        </HStack>
        <Skeleton height="40px" borderRadius="md" />
      </VStack>
    </CardBody>
  </Card>
);

const StartupListPage: React.FC = () => {
  const { filters, setFilter, clearFilters, results, total, loading, error } = useStartupSearch();

  return (
    <>
      <Helmet>
        <title>Discover Startups - KolaboLab</title>
        <meta
          name="description"
          content="Explore innovative startups on KolaboLab. Discover tech companies with social impact looking for collaborators and investors."
        />
        <meta name="keywords" content="startups, innovation, technology, social impact, collaboration, investment opportunities" />
      </Helmet>

      <Box>
        {/* Hero Section */}
        <Box className="primary-context" py={20}>
          <Container maxW="6xl">
            <VStack spacing={8} textAlign="center">
              <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight="700"
                maxW="4xl"
              >
                Discover Innovative{' '}
                <Text as="span" className="gradient-text">
                  Startups
                </Text>
              </Heading>
              <Text fontSize="xl" maxW="3xl" opacity={0.8}>
                Explore cutting-edge companies building the future of technology with social impact.
                Connect with startups that match your interests and expertise.
              </Text>

              {/* Filter Panel */}
              <FilterPanel
                filters={filters}
                onFilterChange={setFilter}
                onClearFilters={clearFilters}
                total={total}
                loading={loading}
              />
            </VStack>
          </Container>
        </Box>

        {/* Results Section */}
        <Container maxW="6xl" py={12}>
          {/* Error Banner */}
          {error && (
            <Alert status="error" mb={6} borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Error loading startups</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
              <CloseButton position="relative" onClick={() => {/* error clears on next successful fetch */}} />
            </Alert>
          )}

          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </SimpleGrid>
          ) : (
            <VStack spacing={12} align="stretch">
              {/* Results Summary */}
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <Text color="gray.600">
                  {total} startup{total !== 1 ? 's' : ''} found
                  {filters.q && ` for "${filters.q}"`}
                </Text>
              </Flex>

              {/* Startup Cards */}
              {results.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {results.map((startup) => (
                    <StartupCard key={startup.id} startup={startup} />
                  ))}
                </SimpleGrid>
              )}

              {/* No Results */}
              {results.length === 0 && !error && (
                <VStack spacing={6} py={12} textAlign="center">
                  <Icon as={FiTrendingUp} w={12} h={12} color="gray.400" />
                  <VStack spacing={2}>
                    <Heading size="lg" color="gray.600">
                      No startups found
                    </Heading>
                    <Text color="gray.500">
                      Try adjusting your search criteria or browse all startups.
                    </Text>
                  </VStack>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    colorScheme="brand"
                    size="lg"
                  >
                    Clear Filters
                  </Button>
                </VStack>
              )}

              {/* Call to Action */}
              <Box className="support-context" p={8} borderRadius="xl" textAlign="center">
                <VStack spacing={4}>
                  <Heading size="lg">
                    Ready to Launch Your Startup?
                  </Heading>
                  <Text color="gray.600">
                    Join our platform and connect with collaborators and investors who share your vision.
                  </Text>
                  <HStack spacing={4}>
                    <Button
                      as={RouterLink}
                      to="/create-startup"
                      variant="solid"
                      colorScheme="brand"
                      size="lg"
                      rightIcon={<FiArrowRight />}
                    >
                      Create Startup Profile
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/register"
                      variant="outline"
                      colorScheme="blue"
                      size="lg"
                    >
                      Join as Collaborator
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          )}
        </Container>
      </Box>
    </>
  );
};

export default StartupListPage;
