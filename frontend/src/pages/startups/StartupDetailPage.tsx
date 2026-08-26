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
  Badge,
  Icon,
  Avatar,
  Progress,
  Link,
  Image,
  Skeleton,
  SkeletonText,
  useToast,
  useDisclosure,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'
import { 
  FiMapPin, 
  FiUsers, 
  FiCalendar,
  FiEye,
  FiHeart,
  FiShare2,
  FiMessageSquare,
  FiStar,
  FiAward,
  FiExternalLink,
  FiMail,
  FiLinkedin,
  FiArrowLeft
} from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'
import { normalizeRole, isRichRole } from '@/utils/roleSerializer'
import type { RoleEntry } from '@/types/roles'
import { useAuthStore } from '@/hooks/useAuth'
import ApplicationFormModal from './components/ApplicationFormModal'
import UpdateFeed from './components/UpdateFeed'

interface StartupDetail {
  id: string;
  userId: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  stage: string;
  industry: string;
  location: string;
  website: string;
  logo: string;
  coverImage: string;
  foundedDate: string;
  teamSize: number;
  views: number;
  followers: number;
  fundingGoal: string;
  fundingRaised: string;
  fundingProgress: number;
  tags: string[];
  lookingFor: RoleEntry[];
  featured: boolean;
  socialImpact: string;
  founder: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
    email: string;
    linkedin: string;
    experience: string;
  };
  team: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    skills: string[];
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    completed: boolean;
  }>;
  openPositions: Array<{
    id: string;
    title: string;
    type: 'full-time' | 'part-time' | 'equity' | 'volunteer';
    description: string;
    skills: string[];
    commitment: string;
    hasRichDetails: boolean;
  }>;
}

const StartupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isApplicationModalOpen, onOpen: onApplicationModalOpen, onClose: onApplicationModalClose } = useDisclosure();
  const user = useAuthStore((state) => state.user);
  
  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{ title: string; skills: string[] } | null>(null);

  useEffect(() => {
    const loadStartupDetails = async () => {
      setLoading(true);
      
      try {
        const devHosts = ['kolabolab-api-dev', '0fc93d16', 'localhost', 'kolabolab-dev'];
        const isDev = devHosts.some(h => window.location.hostname.indexOf(h) !== -1);
        const apiBaseUrl = isDev
          ? 'https://kolabolab-api-dev.beryour.workers.dev'
          : 'https://kolabolab-api.beryour.workers.dev';
        
        const response = await fetch(`${apiBaseUrl}/api/startups/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          const s = data.startup;
          
          setStartup({
            id: s.id,
            userId: s.userId || '',
            name: s.name,
            tagline: s.description ? s.description.substring(0, 100) : s.stage + ' stage startup',
            description: s.description || '',
            longDescription: s.pitch || s.description || '',
            stage: s.stage,
            industry: s.industry || 'Technology',
            location: s.location || 'Global',
            website: s.website || '',
            logo: '',
            coverImage: '',
            foundedDate: s.createdAt?.split('T')[0]?.split('-')[0] || '2024',
            teamSize: s.teamSize || 1,
            views: 0,
            followers: 0,
            fundingGoal: '$' + ((s.fundingAmount || 0) / 100).toLocaleString(),
            fundingRaised: '$0',
            fundingProgress: 0,
            tags: s.tags || [],
            lookingFor: s.lookingFor || [],
            featured: false,
            socialImpact: s.socialImpact || '',
            founder: {
              name: s.founder ? `${s.founder.firstName} ${s.founder.lastName}` : 'Founder',
              role: 'Founder',
              avatar: s.founder?.avatar || '',
              bio: '',
              email: s.founder?.email || '',
              linkedin: s.founderLinkedin || '',
              experience: ''
            },
            team: [],
            milestones: [],
            openPositions: (s.lookingFor || []).map((entry: RoleEntry, i: number) => {
              const role = normalizeRole(entry);
              const hasRichDetails = isRichRole(entry);
              return {
                id: String(i + 1),
                title: role.title,
                type: s.compensationType || 'equity',
                description: role.description || `Looking for a ${role.title} to join the team`,
                skills: role.skills || [],
                commitment: role.commitment ||
                  (s.compensationType === 'paid' ? 'Paid (Salary)' :
                   s.compensationType === 'equity_salary' ? 'Equity + Salary' :
                   s.compensationType === 'volunteer' ? 'Volunteer' :
                   s.compensationType === 'stipend' ? 'Stipend' :
                   s.compensationType === 'mixed' ? 'Varies by role' :
                   'Equity-based'),
                hasRichDetails,
              };
            })
          });
        } else {
          setStartup(null);
        }
      } catch (error) {
        console.error('Failed to load startup:', error);
        setStartup(null);
      }
      
      setLoading(false);
    };

    if (id) {
      loadStartupDetails();
    }
  }, [id]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? 'Unfollowed' : 'Following',
      description: isFollowing ? 'You are no longer following this startup' : 'You are now following this startup',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRoleApply = (roleTitle: string, roleSkills: string[]) => {
    setSelectedRole({ title: roleTitle, skills: roleSkills });
    onApplicationModalOpen();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied!',
      description: 'Startup link has been copied to your clipboard.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Startup - KolaboLab</title>
        </Helmet>
        <Box py={8}>
          <Container maxW="6xl">
            <VStack spacing={8} align="stretch">
              <Skeleton height="300px" borderRadius="xl" />
              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                <Box gridColumn={{ base: 1, lg: "1 / 3" }}>
                  <VStack spacing={6} align="stretch">
                    <SkeletonText noOfLines={4} spacing={4} />
                    <SkeletonText noOfLines={8} spacing={4} />
                  </VStack>
                </Box>
                <VStack spacing={6} align="stretch">
                  <Skeleton height="200px" />
                  <Skeleton height="300px" />
                </VStack>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (!startup) {
    return (
      <Box py={20}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Heading size="lg" color="text-tertiary">Startup Not Found</Heading>
            <Text color="text-secondary">The startup you're looking for doesn't exist or has been removed.</Text>
            <Button as={RouterLink} to="/startups" variant="solid" colorScheme="brand">
              Browse All Startups
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{startup.name} - KolaboLab</title>
        <meta name="description" content={startup.description} />
      </Helmet>

      <Box>
        {/* Hero Section */}
        <Box position="relative" overflow="hidden" bgGradient="linear(to-br, brand.600, brand.800)">
          {/* The API returns no cover image, so rendering <Image src=""> gave a
              broken element over a grey void. Show the venture's own artwork
              when it exists, otherwise a branded gradient that looks deliberate. */}
          {startup.coverImage ? (
            <Image
              src={startup.coverImage}
              alt={`${startup.name} cover`}
              w="full"
              h="300px"
              objectFit="cover"
              filter="brightness(0.7)"
            />
          ) : (
            <Box w="full" h="300px" aria-hidden="true" />
          )}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="linear-gradient(to bottom, rgba(9,10,15,0.35), rgba(9,10,15,0.75))"
          />
          <Container maxW="6xl" position="relative" zIndex={1}>
            <VStack spacing={6} align="start" py={12} color="white">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                color="white"
                onClick={() => navigate(-1)}
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                Back
              </Button>
              
              <HStack spacing={6} align="start">
                <Image
                  src={startup.logo}
                  alt={`${startup.name} logo`}
                  boxSize="120px"
                  borderRadius="xl"
                  border="4px solid white"
                  bg="bg-surface"
                />
                <VStack align="start" spacing={3} flex={1}>
                  <HStack spacing={3}>
                    <Heading size="xl">{startup.name}</Heading>
                    {startup.featured && (
                      <Badge colorScheme="yellow" px={3} py={1}>
                        <HStack spacing={1}>
                          <Icon as={FiStar} w={3} h={3} />
                          <Text>Featured</Text>
                        </HStack>
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xl" opacity={0.9}>
                    {startup.tagline}
                  </Text>
                  <HStack spacing={4} fontSize="sm">
                    <HStack spacing={1}>
                      <Icon as={FiMapPin} />
                      <Text>{startup.location}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FiUsers} />
                      <Text>{startup.teamSize} team members</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FiCalendar} />
                      <Text>Founded {startup.foundedDate}</Text>
                    </HStack>
                  </HStack>
                </VStack>
                
                <VStack spacing={3}>
                  <HStack spacing={3}>
                    <Button
                      leftIcon={<FiHeart />}
                      variant={isFollowing ? "solid" : "outline"}
                      colorScheme="red"
                      onClick={handleFollow}
                      size="lg"
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button
                      leftIcon={<FiShare2 />}
                      variant="outline"
                      color="white"
                      borderColor="white"
                      onClick={handleShare}
                      size="lg"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      Share
                    </Button>
                  </HStack>
                  <HStack spacing={4} fontSize="sm" opacity={0.8}>
                    <HStack spacing={1}>
                      <Icon as={FiEye} />
                      <Text>{startup.views} views</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FiHeart} />
                      <Text>{startup.followers} followers</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
          </Container>
        </Box>

        {/* Content */}
        <Container maxW="6xl" py={12}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
            {/* Main Content */}
            <Box gridColumn={{ base: 1, lg: "1 / 3" }}>
              <Tabs variant="soft-rounded" colorScheme="brand">
                <TabList mb={6}>
                  <Tab>Overview</Tab>
                  <Tab>Team</Tab>
                  <Tab>Milestones</Tab>
                  <Tab>Opportunities</Tab>
                  <Tab>Updates</Tab>
                </TabList>

                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={8} align="stretch">
                      <Card className="glass-panel">
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading size="md">About {startup.name}</Heading>
                            <Text>{startup.description}</Text>
                            <Text lineHeight="tall" color="text-secondary">
                              {startup.longDescription}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card className="glass-panel">
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading size="md">Social Impact</Heading>
                            <HStack spacing={3}>
                              <Icon as={FiAward} color="green.500" w={6} h={6} />
                              <Text fontSize="lg" fontWeight="semibold">
                                {startup.socialImpact}
                              </Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card className="glass-panel">
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading size="md">Technologies & Tags</Heading>
                            <HStack spacing={2} flexWrap="wrap">
                              {startup.tags.map((tag) => (
                                <Badge key={tag} colorScheme="brand" px={3} py={1}>
                                  {tag}
                                </Badge>
                              ))}
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Team Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={6} align="stretch">
                      {/* Founder */}
                      <Card className="glass-panel">
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading size="md">Founder</Heading>
                            <HStack spacing={4} align="start">
                              <Avatar size="lg" src={startup.founder.avatar} />
                              <VStack align="start" spacing={2} flex={1}>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {startup.founder.name}
                                  </Text>
                                  <Text color="text-secondary">{startup.founder.role}</Text>
                                </VStack>
                                <Text fontSize="sm">{startup.founder.bio}</Text>
                                <HStack spacing={3}>
                                  <Link
                                    href={`mailto:${startup.founder.email}`}
                                    color="interactive-accent"
                                    _hover={{ textDecoration: 'underline' }}
                                  >
                                    <HStack spacing={1}>
                                      <Icon as={FiMail} />
                                      <Text fontSize="sm">Contact</Text>
                                    </HStack>
                                  </Link>
                                  <Link
                                    href={`https://${startup.founder.linkedin}`}
                                    color="interactive-accent"
                                    _hover={{ textDecoration: 'underline' }}
                                    isExternal
                                  >
                                    <HStack spacing={1}>
                                      <Icon as={FiLinkedin} />
                                      <Text fontSize="sm">LinkedIn</Text>
                                    </HStack>
                                  </Link>
                                </HStack>
                              </VStack>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Team Members */}
                      <Card className="glass-panel">
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading size="md">Team Members</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              {startup.team.map((member) => (
                                <Card key={member.id} variant="outline">
                                  <CardBody p={4}>
                                    <HStack spacing={3} align="start">
                                      <Avatar size="md" src={member.avatar} />
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text fontWeight="semibold">{member.name}</Text>
                                        <Text fontSize="sm" color="text-secondary">
                                          {member.role}
                                        </Text>
                                        <Text fontSize="sm">{member.bio}</Text>
                                        <HStack spacing={1} flexWrap="wrap">
                                          {member.skills.map((skill) => (
                                            <Badge key={skill} size="sm" colorScheme="gray">
                                              {skill}
                                            </Badge>
                                          ))}
                                        </HStack>
                                      </VStack>
                                    </HStack>
                                  </CardBody>
                                </Card>
                              ))}
                            </SimpleGrid>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Milestones Tab */}
                  <TabPanel px={0}>
                    <Card className="glass-panel">
                      <CardBody p={6}>
                        <VStack spacing={6} align="stretch">
                          <Heading size="md">Roadmap & Milestones</Heading>
                          <VStack spacing={4} align="stretch">
                            {startup.milestones.map((milestone, index) => (
                              <Box key={milestone.id}>
                                <HStack spacing={4} align="start">
                                  <Box
                                    w={4}
                                    h={4}
                                    borderRadius="full"
                                    bg={milestone.completed ? 'green.500' : 'gray.300'}
                                    mt={1}
                                  />
                                  <VStack align="start" spacing={1} flex={1}>
                                    <HStack spacing={3}>
                                      <Text fontWeight="semibold">{milestone.title}</Text>
                                      <Badge
                                        colorScheme={milestone.completed ? 'green' : 'gray'}
                                        size="sm"
                                      >
                                        {milestone.completed ? 'Completed' : 'Planned'}
                                      </Badge>
                                    </HStack>
                                    <Text color="text-secondary" fontSize="sm">
                                      {milestone.description}
                                    </Text>
                                    <Text fontSize="xs" color="text-tertiary">
                                      Target: {new Date(milestone.date).toLocaleDateString()}
                                    </Text>
                                  </VStack>
                                </HStack>
                                {index < startup.milestones.length - 1 && (
                                  <Box
                                    w="2px"
                                    h={6}
                                    bg="chakra-subtle-bg"
                                    ml={2}
                                    mt={2}
                                  />
                                )}
                              </Box>
                            ))}
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>

                  {/* Opportunities Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={6} align="stretch">
                      <Card className="glass-panel">
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading size="md">Open Positions</Heading>
                            <Text color="text-secondary">
                              Join our mission and help us build the future together.
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      {startup.openPositions.map((position) => (
                        <Card key={position.id} variant="outline" className="card-hover" borderLeft={position.hasRichDetails ? '4px solid' : undefined} borderLeftColor={position.hasRichDetails ? 'brand.400' : undefined}>
                          <CardBody p={6}>
                            <VStack spacing={4} align="stretch">
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={2}>
                                  <Heading size="sm">{position.title}</Heading>
                                  <HStack spacing={2}>
                                    <Badge
                                      colorScheme={
                                        position.type === 'full-time' ? 'green' :
                                        position.type === 'equity' ? 'purple' :
                                        'blue'
                                      }
                                    >
                                      {position.type.replace('-', ' ')}
                                    </Badge>
                                    <Text fontSize="sm" color="text-secondary">
                                      {position.commitment}
                                    </Text>
                                  </HStack>
                                </VStack>
                                {(!user || user.id !== startup.userId) && (
                                  <Button
                                    size="sm"
                                    variant="solid"
                                    colorScheme="brand"
                                    onClick={() => handleRoleApply(position.title, position.skills)}
                                  >
                                    Apply
                                  </Button>
                                )}
                              </HStack>
                              
                              <Text fontSize="sm" color={position.hasRichDetails ? undefined : 'gray.500'} fontStyle={position.hasRichDetails ? undefined : 'italic'}>{position.description}</Text>
                              
                              {position.skills.length > 0 && (
                                <Box>
                                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                    {position.hasRichDetails ? 'Skills:' : 'Required Skills:'}
                                  </Text>
                                  <HStack spacing={2} flexWrap="wrap">
                                    {position.skills.map((skill) => (
                                      <Badge key={skill} size="sm" colorScheme={position.hasRichDetails ? 'brand' : 'gray'}>
                                        {skill}
                                      </Badge>
                                    ))}
                                  </HStack>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </TabPanel>

                  {/* Updates Tab */}
                  <TabPanel px={0}>
                    <UpdateFeed
                      startupId={startup.id}
                      isCreator={!!user && user.id === startup.userId}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* Sidebar */}
            <VStack spacing={6} align="stretch">
              {/* Quick Stats */}
              <Card className="glass-panel">
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Quick Stats</Heading>
                    <SimpleGrid columns={2} spacing={4}>
                      <Stat>
                        <StatLabel fontSize="xs">Stage</StatLabel>
                        <StatNumber fontSize="md">{startup.stage}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel fontSize="xs">Industry</StatLabel>
                        <StatNumber fontSize="md">{startup.industry}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel fontSize="xs">Team Size</StatLabel>
                        <StatNumber fontSize="md">{startup.teamSize}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel fontSize="xs">Founded</StatLabel>
                        <StatNumber fontSize="md">{startup.foundedDate}</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Funding Progress */}
              <Card className="glass-panel">
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Funding</Heading>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">Raised</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {startup.fundingRaised} of {startup.fundingGoal}
                        </Text>
                      </HStack>
                      <Progress
                        value={startup.fundingProgress}
                        colorScheme="success"
                        size="lg"
                        borderRadius="full"
                      />
                      <Text fontSize="sm" color="text-secondary" textAlign="center">
                        {startup.fundingProgress}% funded
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Looking For */}
              <Card className="glass-panel">
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Looking For</Heading>
                    <Text fontSize="sm" color="text-tertiary">Click a role to see details and apply</Text>
                    <VStack spacing={2} align="stretch">
                      {startup.lookingFor.map((entry, idx) => {
                        const role = normalizeRole(entry);
                        const roleSkills: string[] = Array.isArray(role.skills)
                          ? role.skills
                          : typeof role.skills === 'string'
                            ? (role.skills as string).split(',').map((s: string) => s.trim()).filter(Boolean)
                            : [];
                        return (
                          <HStack key={role.title + '-' + idx} justify="space-between">
                            <Badge
                              colorScheme="brand"
                              p={2}
                              borderRadius="md"
                              cursor="pointer"
                              _hover={{ bg: 'brand.100', transform: 'scale(1.05)' }}
                              transition="all 0.2s"
                              onClick={() => {
                                // Switch to Opportunities tab
                                const tabsEl = document.querySelector('[role="tablist"]');
                                if (tabsEl) {
                                  const opportunitiesTab = tabsEl.querySelectorAll('[role="tab"]')[3] as HTMLElement;
                                  if (opportunitiesTab) opportunitiesTab.click();
                                }
                                // Scroll to the opportunities section
                                setTimeout(() => {
                                  document.querySelector('[role="tabpanel"]:not([hidden])')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                              }}
                            >
                              {role.title} →
                            </Badge>
                            {(!user || user.id !== startup.userId) && (
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="brand"
                                onClick={() => handleRoleApply(role.title, roleSkills)}
                              >
                                Apply
                              </Button>
                            )}
                          </HStack>
                        );
                      })}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Contact */}
              <Card className="glass-panel">
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Get in Touch</Heading>
                    <VStack spacing={3} align="stretch">
                      <Button
                        leftIcon={<FiMessageSquare />}
                        variant="solid"
                        colorScheme="brand"
                        size="sm"
                        onClick={() => toast({
                          title: 'Message Feature',
                          description: 'Direct messaging coming soon!',
                          status: 'info',
                          duration: 3000,
                        })}
                      >
                        Send Message
                      </Button>
                      <Button
                        leftIcon={<FiExternalLink />}
                        variant="outline"
                        size="sm"
                        as={Link}
                        href={startup.website}
                        isExternal
                      >
                        Visit Website
                      </Button>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </SimpleGrid>
        </Container>

        {/* Application Modal */}
        {selectedRole && (
          <ApplicationFormModal
            isOpen={isApplicationModalOpen}
            onClose={() => {
              onApplicationModalClose();
              setSelectedRole(null);
            }}
            startupId={startup.id}
            roleTitle={selectedRole.title}
            roleSkills={selectedRole.skills}
          />
        )}
      </Box>
    </>
  )
}

export default StartupDetailPage