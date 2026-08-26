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
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  CheckboxGroup,
  Badge,
  Icon,
  Avatar,
  Link,
  Skeleton,
  SkeletonText,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Tabs,
  TabList,
  Tab,
  Divider,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { 
  FiSearch, 
  FiFilter,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiBriefcase,
  FiHeart,
  FiEye,
  FiTrendingUp,
  FiStar,
  FiAward,
  FiTarget,
  FiX
} from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'
import { PageHeader } from '../components/layout/PageHeader'

interface SearchFilters {
  query: string;
  type: 'all' | 'startups' | 'people' | 'opportunities';
  location: string;
  stage: string[];
  industry: string[];
  skills: string[];
  fundingRange: [number, number];
  teamSize: string;
  founded: string;
  lookingFor: string[];
}

interface SearchResult {
  id: string;
  type: 'startup' | 'person' | 'opportunity';
  title: string;
  subtitle: string;
  description: string;
  location: string;
  image: string;
  tags: string[];
  metrics?: {
    views?: number;
    followers?: number;
    funding?: string;
    stage?: string;
    teamSize?: number;
    experience?: string;
    role?: string;
    skills?: string[];
  };
  featured?: boolean;
}

const SearchPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    location: '',
    stage: [],
    industry: [],
    skills: [],
    fundingRange: [0, 10000000],
    teamSize: '',
    founded: '',
    lookingFor: [],
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const toast = useToast();

  useEffect(() => {
    performSearch();
  }, [filters]);

  const performSearch = async () => {
    setLoading(true);
    
    try {
      const devHosts = ['kolabolab-api-dev', '0fc93d16', 'localhost', 'kolabolab-dev'];
      const isDev = devHosts.some(h => window.location.hostname.indexOf(h) !== -1);
      const apiBaseUrl = isDev
        ? 'https://kolabolab-api-dev.beryour.workers.dev'
        : 'https://kolabolab-api.beryour.workers.dev';
      
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.type !== 'all') params.set('type', filters.type);
      
      const response = await fetch(`${apiBaseUrl}/api/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setResultCount(data.results?.length || 0);
      } else {
        setResults([]);
        setResultCount(0);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setResultCount(0);
    }
    
    setLoading(false);
  };
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      location: '',
      stage: [],
      industry: [],
      skills: [],
      fundingRange: [0, 10000000],
      teamSize: '',
      founded: '',
      lookingFor: [],
    });
    setActiveFilters([]);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'startup': return FiBriefcase;
      case 'person': return FiUsers;
      case 'opportunity': return FiTarget;
      default: return FiSearch;
    }
  };

  const getResultColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'startup': return 'brand';
      case 'person': return 'blue';
      case 'opportunity': return 'green';
      default: return 'gray';
    }
  };

  const formatFundingRange = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <>
      <Helmet>
        <title>Search - KolaboLab</title>
        <meta 
          name="description" 
          content="Search KolaboLab for startups, collaborators, investors, and opportunities. Find exactly what you're looking for." 
        />
      </Helmet>

      <Box py={8}>
        <Container maxW={{ base: "7xl", "2xl": "90%", "3xl": "85%" }}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <PageHeader
              eyebrow="Discover"
              title="Find your next opportunity"
              lede="Search ventures, people and open roles across the platform."
            />

            {/* Search Bar */}
            <Card className="glass-panel">
              <CardBody p={6}>
                <VStack spacing={4}>
                  <InputGroup size="lg">
                    <InputLeftElement>
                      <Icon as={FiSearch} color="text-tertiary" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search startups, people, skills, or opportunities..."
                      value={filters.query}
                      onChange={(e) => handleFilterChange('query', e.target.value)}
                      className="glass-panel"
                      size="lg"
                    />
                    {filters.query && (
                      <InputRightElement>
                        <IconButton
                          icon={<FiX />}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFilterChange('query', '')}
                          aria-label="Clear search"
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>

                  <HStack spacing={4} w="full" flexWrap="wrap">
                    <Tabs index={filters.type === 'all' ? 0 : filters.type === 'startups' ? 1 : filters.type === 'people' ? 2 : 3} onChange={(index) => {
                      const types = ['all', 'startups', 'people', 'opportunities'];
                      handleFilterChange('type', types[index]);
                    }}>
                      <TabList>
                        <Tab>All Results</Tab>
                        <Tab>Startups</Tab>
                        <Tab>People</Tab>
                        <Tab>Opportunities</Tab>
                      </TabList>
                    </Tabs>

                    <Button
                      leftIcon={<FiFilter />}
                      variant="outline"
                      onClick={onOpen}
                      colorScheme="gray"
                    >
                      Filters
                      {activeFilters.length > 0 && (
                        <Badge ml={2} colorScheme="brand" borderRadius="full">
                          {activeFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <HStack spacing={2} flexWrap="wrap">
                <Text fontSize="sm" color="text-secondary">Active filters:</Text>
                {activeFilters.map((filter) => (
                  <Badge key={filter} colorScheme="brand" px={3} py={1}>
                    {filter}
                    <IconButton
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      ml={1}
                      aria-label={`Remove ${filter} filter`}
                    />
                  </Badge>
                ))}
                <Button size="sm" variant="ghost" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </HStack>
            )}

            {/* Results */}
            <Box>
              <HStack justify="space-between" mb={6}>
                <Text color="text-secondary">
                  {loading ? 'Searching...' : `${results.filter((r) => {
                    if (filters.type === 'all') return true;
                    if (filters.type === 'startups') return r.type === 'startup';
                    if (filters.type === 'people') return r.type === 'person';
                    if (filters.type === 'opportunities') return r.type === 'opportunity';
                    return true;
                  }).length} results found`}
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="text-tertiary">Sort by:</Text>
                  <Select size="sm" maxW="140px" defaultValue="relevance">
                    <option value="relevance">Relevance</option>
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="funding">Funding Amount</option>
                  </Select>
                </HStack>
              </HStack>

              {loading ? (
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="glass-panel">
                      <CardBody p={6}>
                        <HStack spacing={4} align="start">
                          <Skeleton w="80px" h="80px" borderRadius="lg" />
                          <VStack align="start" spacing={2} flex={1}>
                            <Skeleton height="20px" width="200px" />
                            <Skeleton height="16px" width="150px" />
                            <SkeletonText noOfLines={2} spacing={2} width="100%" />
                            <Skeleton height="20px" width="100px" />
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : results.length > 0 ? (
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {results.filter((result) => {
                    if (filters.type === 'all') return true;
                    if (filters.type === 'startups') return result.type === 'startup';
                    if (filters.type === 'people') return result.type === 'person';
                    if (filters.type === 'opportunities') return result.type === 'opportunity';
                    return true;
                  }).map((result) => (
                    <Card key={`${result.type}-${result.id}-${result.title}`} className="card-hover glass-panel">
                      <CardBody p={6}>
                        <VStack spacing={4} align="stretch">
                          <HStack spacing={4} align="start">
                            <Box position="relative">
                              <Avatar
                                size="xl"
                                src={result.image}
                                borderRadius="lg"
                              />
                              {result.featured && (
                                <Box
                                  position="absolute"
                                  top={-1}
                                  right={-1}
                                  bg="yellow.400"
                                  borderRadius="full"
                                  p={1}
                                >
                                  <Icon as={FiStar} w={3} h={3} color="white" />
                                </Box>
                              )}
                            </Box>
                            
                            <VStack align="start" spacing={2} flex={1}>
                              <HStack spacing={2} align="start">
                                <Badge
                                  colorScheme={getResultColor(result.type)}
                                  px={2}
                                  py={1}
                                >
                                  <Icon as={getResultIcon(result.type)} w={3} h={3} mr={1} />
                                  {result.type}
                                </Badge>
                                {result.featured && (
                                  <Badge colorScheme="yellow" px={2} py={1}>
                                    Featured
                                  </Badge>
                                )}
                              </HStack>
                              
                              <VStack align="start" spacing={1}>
                                <Link
                                  as={RouterLink}
                                  to={`/${result.type === 'startup' ? 'startups' : result.type === 'person' ? 'profile' : 'opportunities'}/${result.id}`}
                                  fontWeight="bold"
                                  fontSize="lg"
                                  _hover={{ textDecoration: 'underline' }}
                                >
                                  {result.title}
                                </Link>
                                <Text color="text-secondary" fontSize="sm">
                                  {result.subtitle}
                                </Text>
                                <HStack spacing={1}>
                                  <Icon as={FiMapPin} color="text-tertiary" w={3} h={3} />
                                  <Text fontSize="sm" color="text-tertiary">
                                    {result.location}
                                  </Text>
                                </HStack>
                              </VStack>
                            </VStack>
                          </HStack>

                          <Text fontSize="sm" color="text-secondary" noOfLines={2}>
                            {result.description}
                          </Text>

                          <HStack spacing={2} flexWrap="wrap">
                            {result.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} size="sm" colorScheme="gray">
                                {tag}
                              </Badge>
                            ))}
                            {result.tags.length > 4 && (
                              <Text fontSize="xs" color="text-tertiary">
                                +{result.tags.length - 4} more
                              </Text>
                            )}
                          </HStack>

                          {result.metrics && (
                            <Box>
                              <Divider mb={3} />
                              <SimpleGrid columns={3} spacing={4} fontSize="sm">
                                {result.metrics.views && (
                                  <VStack spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiEye} color="text-tertiary" w={3} h={3} />
                                      <Text color="text-tertiary">Views</Text>
                                    </HStack>
                                    <Text fontWeight="semibold">{result.metrics.views}</Text>
                                  </VStack>
                                )}
                                {result.metrics.followers && (
                                  <VStack spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiHeart} color="text-tertiary" w={3} h={3} />
                                      <Text color="text-tertiary">Followers</Text>
                                    </HStack>
                                    <Text fontWeight="semibold">{result.metrics.followers}</Text>
                                  </VStack>
                                )}
                                {result.metrics.funding && (
                                  <VStack spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiDollarSign} color="text-tertiary" w={3} h={3} />
                                      <Text color="text-tertiary">Funding</Text>
                                    </HStack>
                                    <Text fontWeight="semibold">{result.metrics.funding}</Text>
                                  </VStack>
                                )}
                                {result.metrics.stage && (
                                  <VStack spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiTrendingUp} color="text-tertiary" w={3} h={3} />
                                      <Text color="text-tertiary">Stage</Text>
                                    </HStack>
                                    <Text fontWeight="semibold">{result.metrics.stage}</Text>
                                  </VStack>
                                )}
                                {result.metrics.teamSize && (
                                  <VStack spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiUsers} color="text-tertiary" w={3} h={3} />
                                      <Text color="text-tertiary">Team</Text>
                                    </HStack>
                                    <Text fontWeight="semibold">{result.metrics.teamSize}</Text>
                                  </VStack>
                                )}
                                {result.metrics.experience && (
                                  <VStack spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiAward} color="text-tertiary" w={3} h={3} />
                                      <Text color="text-tertiary">Experience</Text>
                                    </HStack>
                                    <Text fontWeight="semibold">{result.metrics.experience}</Text>
                                  </VStack>
                                )}
                              </SimpleGrid>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Card className="glass-panel">
                  <CardBody p={12} textAlign="center">
                    <VStack spacing={4}>
                      <Icon as={FiSearch} w={12} h={12} color="text-tertiary" />
                      <Heading size="md" color="text-tertiary">No results found</Heading>
                      <Text color="text-secondary" maxW="md">
                        Try adjusting your search terms or filters to find what you're looking for.
                      </Text>
                      <Button onClick={clearAllFilters} variant="outline" colorScheme="brand">
                        Clear Filters
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </Box>
          </VStack>
        </Container>

        {/* Filter Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Search Filters</DrawerHeader>

            <DrawerBody>
              <VStack spacing={6} align="stretch">
                {/* Location Filter */}
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FiMapPin} color="text-tertiary" />
                    </InputLeftElement>
                    <Input
                      placeholder="City, State, or Country"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                {/* Stage Filter */}
                <FormControl>
                  <FormLabel>Startup Stage</FormLabel>
                  <CheckboxGroup
                    value={filters.stage}
                    onChange={(value) => handleFilterChange('stage', value)}
                  >
                    <VStack align="start" spacing={2}>
                      {['Idea', 'MVP', 'Early Stage', 'Growth', 'Scale', 'Mature'].map((stage) => (
                        <Checkbox key={stage} value={stage}>
                          {stage}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </FormControl>

                {/* Industry Filter */}
                <FormControl>
                  <FormLabel>Industry</FormLabel>
                  <CheckboxGroup
                    value={filters.industry}
                    onChange={(value) => handleFilterChange('industry', value)}
                  >
                    <VStack align="start" spacing={2}>
                      {['FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'AI/ML', 'SaaS', 'E-commerce', 'Social Impact'].map((industry) => (
                        <Checkbox key={industry} value={industry}>
                          {industry}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </FormControl>

                {/* Funding Range Filter */}
                <FormControl>
                  <FormLabel>Funding Range</FormLabel>
                  <Box px={4}>
                    <RangeSlider
                      value={filters.fundingRange}
                      onChange={(value) => handleFilterChange('fundingRange', value)}
                      min={0}
                      max={10000000}
                      step={100000}
                    >
                      <RangeSliderTrack>
                        <RangeSliderFilledTrack />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} />
                      <RangeSliderThumb index={1} />
                    </RangeSlider>
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="sm">{formatFundingRange(filters.fundingRange[0])}</Text>
                      <Text fontSize="sm">{formatFundingRange(filters.fundingRange[1])}</Text>
                    </HStack>
                  </Box>
                </FormControl>

                {/* Team Size Filter */}
                <FormControl>
                  <FormLabel>Team Size</FormLabel>
                  <Select
                    placeholder="Any size"
                    value={filters.teamSize}
                    onChange={(e) => handleFilterChange('teamSize', e.target.value)}
                  >
                    <option value="1-5">1-5 people</option>
                    <option value="6-15">6-15 people</option>
                    <option value="16-50">16-50 people</option>
                    <option value="51+">51+ people</option>
                  </Select>
                </FormControl>

                {/* Skills Filter */}
                <FormControl>
                  <FormLabel>Skills</FormLabel>
                  <CheckboxGroup
                    value={filters.skills}
                    onChange={(value) => handleFilterChange('skills', value)}
                  >
                    <VStack align="start" spacing={2}>
                      {['React', 'Python', 'AI/ML', 'DevOps', 'Product Management', 'Marketing', 'Sales', 'Design'].map((skill) => (
                        <Checkbox key={skill} value={skill}>
                          {skill}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </FormControl>

                {/* Clear Filters */}
                <Button variant="outline" onClick={clearAllFilters} w="full">
                  Clear All Filters
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  )
}

export default SearchPage