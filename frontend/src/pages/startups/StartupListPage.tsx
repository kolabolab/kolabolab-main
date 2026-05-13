import React, { useState, useEffect, useRef } from 'react';
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
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Icon,
  Flex,
  Tag,
  TagLabel,
  Image,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiMapPin, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp,
  FiEye,
  FiHeart,
  FiStar,
  FiArrowRight
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

interface Startup {
  id: string;
  name: string;
  description: string;
  stage: 'Idea' | 'MVP' | 'Early Stage' | 'Growth' | 'Scale';
  industry: string;
  location: string;
  fundingGoal: string;
  teamSize: number;
  tags: string[];
  logo: string;
  featured: boolean;
  lookingFor: string[];
  website?: string;
}

const mockStartups: Startup[] = [
  {
    id: '1',
    name: 'EcoTech Solutions',
    description: 'Revolutionary platform for sustainable technology solutions that reduce carbon footprint while increasing business efficiency.',
    stage: 'Growth',
    industry: 'CleanTech',
    location: 'San Francisco, CA',
    fundingGoal: '$2M',
    teamSize: 12,
    tags: ['Sustainability', 'AI', 'IoT'],
    logo: 'https://via.placeholder.com/60x60/1890FF/FFFFFF?text=ET',
    featured: true,
    lookingFor: ['CTO', 'Investors', 'Marketing Lead'],
    website: 'https://ecotech.example.com'
  },
  {
    id: '2',
    name: 'HealthBridge',
    description: 'Connecting rural communities with healthcare professionals through telemedicine and mobile health solutions.',
    stage: 'Early Stage',
    industry: 'HealthTech',
    location: 'Austin, TX',
    fundingGoal: '$1.5M',
    teamSize: 8,
    tags: ['Healthcare', 'Mobile', 'Social Impact'],
    logo: 'https://via.placeholder.com/60x60/10B981/FFFFFF?text=HB',
    featured: false,
    lookingFor: ['Lead Developer', 'Medical Advisor', 'Investors'],
    website: 'https://healthbridge.example.com'
  },
  {
    id: '3',
    name: 'EduFlow',
    description: 'Personalized learning platform that adapts to student needs and provides real-time feedback to educators.',
    stage: 'MVP',
    industry: 'EdTech',
    location: 'Boston, MA',
    fundingGoal: '$800K',
    teamSize: 5,
    tags: ['Education', 'Machine Learning', 'Analytics'],
    logo: 'https://via.placeholder.com/60x60/6B7280/FFFFFF?text=EF',
    featured: true,
    lookingFor: ['Frontend Developer', 'UX Designer', 'Education Expert'],
    website: 'https://eduflow.example.com'
  },
  {
    id: '4',
    name: 'AgriSmart',
    description: 'Smart farming solutions using IoT sensors and data analytics to optimize crop yields and reduce water usage.',
    stage: 'Growth',
    industry: 'AgriTech',
    location: 'Denver, CO',
    fundingGoal: '$3M',
    teamSize: 15,
    tags: ['Agriculture', 'IoT', 'Data Analytics'],
    logo: 'https://via.placeholder.com/60x60/10B981/FFFFFF?text=AS',
    featured: false,
    lookingFor: ['Hardware Engineer', 'Sales Director', 'Investors'],
    website: 'https://agrismart.example.com'
  },
  {
    id: '5',
    name: 'FinanceForAll',
    description: 'Democratizing financial services for underbanked communities through blockchain and mobile technology.',
    stage: 'Early Stage',
    industry: 'FinTech',
    location: 'New York, NY',
    fundingGoal: '$2.5M',
    teamSize: 10,
    tags: ['Blockchain', 'Financial Inclusion', 'Mobile'],
    logo: 'https://via.placeholder.com/60x60/1890FF/FFFFFF?text=FF',
    featured: true,
    lookingFor: ['Blockchain Developer', 'Compliance Officer', 'Investors'],
    website: 'https://financeforall.example.com'
  },
  {
    id: '6',
    name: 'CodeMentor',
    description: 'AI-powered coding education platform that provides personalized mentorship and real-world project experience.',
    stage: 'MVP',
    industry: 'EdTech',
    location: 'Seattle, WA',
    fundingGoal: '$1M',
    teamSize: 6,
    tags: ['Coding Education', 'AI Mentorship', 'Career Development'],
    logo: 'https://via.placeholder.com/60x60/6B7280/FFFFFF?text=CM',
    featured: false,
    lookingFor: ['Senior Developer', 'Content Creator', 'Community Manager'],
    website: 'https://codementor.example.com'
  }
];

const StartupCard: React.FC<{ startup: Startup }> = ({ startup }) => {
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

  const getVariantClass = () => {
    if (startup.featured) return 'card-primary';
    return startup.industry === 'HealthTech' || startup.industry === 'CleanTech' ? 'card-support' : 'card-secondary';
  };

  return (
    <Card
      ref={cardRef}
      className={`fade-in card-hover ${getVariantClass()}`}
      cursor="pointer"
      height="100%"
      position="relative"
    >
      {startup.featured && (
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme="brand"
          borderRadius="full"
          px={3}
          py={1}
          fontSize="xs"
        >
          <HStack spacing={1}>
            <Icon as={FiStar} w={3} h={3} />
            <Text>Featured</Text>
          </HStack>
        </Badge>
      )}

      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack spacing={4}>
            <Image
              src={startup.logo}
              alt={`${startup.name} logo`}
              boxSize="60px"
              borderRadius="lg"
              fallback={
                <Box
                  boxSize="60px"
                  borderRadius="lg"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="xl" fontWeight="bold" color="gray.400">
                    {startup.name.slice(0, 2).toUpperCase()}
                  </Text>
                </Box>
              }
            />
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md" className="gradient-text" noOfLines={1}>
                {startup.name}
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme={getStageColor(startup.stage)} size="sm">
                  {startup.stage}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  {startup.industry}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Description */}
          <Text fontSize="sm" lineHeight="tall" noOfLines={3}>
            {startup.description}
          </Text>

          {/* Tags */}
          <HStack spacing={2} flexWrap="wrap">
            {startup.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} size="sm" colorScheme="gray" borderRadius="full">
                <TagLabel>{tag}</TagLabel>
              </Tag>
            ))}
            {startup.tags.length > 3 && (
              <Tag size="sm" colorScheme="brand" borderRadius="full">
                <TagLabel>+{startup.tags.length - 3}</TagLabel>
              </Tag>
            )}
          </HStack>

          {/* Looking For */}
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={2}>
              Looking for:
            </Text>
            <HStack spacing={1} flexWrap="wrap">
              {startup.lookingFor.slice(0, 2).map((role) => (
                <Badge key={role} colorScheme="accent" size="sm" borderRadius="md">
                  {role}
                </Badge>
              ))}
              {startup.lookingFor.length > 2 && (
                <Badge colorScheme="brand" size="sm" borderRadius="md">
                  +{startup.lookingFor.length - 2} more
                </Badge>
              )}
            </HStack>
          </Box>

          {/* Stats */}
          <HStack spacing={4} fontSize="xs" color="gray.500">
            <HStack spacing={1}>
              <Icon as={FiMapPin} />
              <Text>{startup.location}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiUsers} />
              <Text>{startup.teamSize} team</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiDollarSign} />
              <Text>{startup.fundingGoal}</Text>
            </HStack>
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
            {startup.website && (
              <Button
                as="a"
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="sm"
              >
                <Icon as={FiEye} />
              </Button>
            )}
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
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStartups(mockStartups);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = !selectedStage || startup.stage === selectedStage;
    const matchesIndustry = !selectedIndustry || startup.industry === selectedIndustry;
    
    return matchesSearch && matchesStage && matchesIndustry;
  });

  const featuredStartups = filteredStartups.filter(s => s.featured);
  const regularStartups = filteredStartups.filter(s => !s.featured);

  const industries = Array.from(new Set(startups.map(s => s.industry)));
  const stages = Array.from(new Set(startups.map(s => s.stage)));

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

              {/* Search and Filters */}
              <VStack spacing={4} w="full" maxW="4xl">
                <InputGroup size="lg">
                  <InputLeftElement>
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search startups, technologies, or industries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={useColorModeValue('white', 'gray.800')}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 1px var(--primary-navy, #1B2A4A)',
                    }}
                  />
                </InputGroup>

                <HStack spacing={4} w="full" flexWrap="wrap" justify="center">
                  <HStack spacing={2}>
                    <Icon as={FiFilter} color="gray.500" />
                    <Text fontSize="sm" color="gray.600">Filters:</Text>
                  </HStack>
                  <Select
                    placeholder="All Stages"
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    maxW="150px"
                    size="sm"
                  >
                    {stages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </Select>
                  <Select
                    placeholder="All Industries"
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    maxW="150px"
                    size="sm"
                  >
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </Select>
                </HStack>
              </VStack>
            </VStack>
          </Container>
        </Box>

        {/* Results Section */}
        <Container maxW="6xl" py={12}>
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
                  {filteredStartups.length} startup{filteredStartups.length !== 1 ? 's' : ''} found
                  {searchTerm && ` for "${searchTerm}"`}
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Sort by:</Text>
                  <Select size="sm" maxW="120px" defaultValue="featured">
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="funding">Funding Goal</option>
                    <option value="stage">Stage</option>
                  </Select>
                </HStack>
              </Flex>

              {/* Featured Startups */}
              {featuredStartups.length > 0 && (
                <VStack spacing={6} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={FiStar} color="brand.500" />
                    <Heading size="lg" className="gradient-text">
                      Featured Startups
                    </Heading>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {featuredStartups.map((startup) => (
                      <StartupCard key={startup.id} startup={startup} />
                    ))}
                  </SimpleGrid>
                </VStack>
              )}

              {/* All Startups */}
              {regularStartups.length > 0 && (
                <VStack spacing={6} align="stretch">
                  <Heading size="lg">
                    {featuredStartups.length > 0 ? 'More Startups' : 'All Startups'}
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {regularStartups.map((startup) => (
                      <StartupCard key={startup.id} startup={startup} />
                    ))}
                  </SimpleGrid>
                </VStack>
              )}

              {/* No Results */}
              {filteredStartups.length === 0 && (
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
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStage('');
                      setSelectedIndustry('');
                    }}
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