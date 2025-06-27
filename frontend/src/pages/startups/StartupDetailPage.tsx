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
  Progress,
  Divider,
  Flex,
  Link,
  Image,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'
import { 
  FiMapPin, 
  FiUsers, 
  FiDollarSign, 
  FiCalendar,
  FiEye,
  FiHeart,
  FiShare2,
  FiMessageSquare,
  FiStar,
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiExternalLink,
  FiMail,
  FiLinkedin,
  FiGithub,
  FiArrowLeft
} from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'

interface StartupDetail {
  id: string;
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
  lookingFor: string[];
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
  }>;
}

const StartupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useEffect(() => {
    const loadStartupDetails = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on ID
      const mockData: StartupDetail = {
        id: id || '1',
        name: id === '1' ? 'EcoTech Solutions' : id === '2' ? 'HealthBridge' : 'EduFlow',
        tagline: id === '1' ? 'Sustainable technology for a greener future' : 
                 id === '2' ? 'Connecting rural communities with healthcare' : 
                 'Personalized learning for every student',
        description: id === '1' ? 'Revolutionary platform for sustainable technology solutions that reduce carbon footprint while increasing business efficiency.' :
                     id === '2' ? 'Connecting rural communities with healthcare professionals through telemedicine and mobile health solutions.' :
                     'Personalized learning platform that adapts to student needs and provides real-time feedback to educators.',
        longDescription: `We're building the future of ${id === '1' ? 'sustainable technology' : id === '2' ? 'healthcare accessibility' : 'education technology'} by leveraging cutting-edge AI and machine learning to create solutions that not only solve real-world problems but also create positive social impact. Our platform has already helped thousands of users and we're just getting started.

Our mission is to democratize access to ${id === '1' ? 'clean technology' : id === '2' ? 'quality healthcare' : 'personalized education'} while building a sustainable business model that can scale globally. We believe that technology should be a force for good, and we're committed to creating solutions that benefit both people and the planet.`,
        stage: id === '1' ? 'Growth' : id === '2' ? 'Early Stage' : 'MVP',
        industry: id === '1' ? 'CleanTech' : id === '2' ? 'HealthTech' : 'EdTech',
        location: id === '1' ? 'San Francisco, CA' : id === '2' ? 'Austin, TX' : 'Boston, MA',
        website: `https://${id === '1' ? 'ecotech' : id === '2' ? 'healthbridge' : 'eduflow'}.example.com`,
        logo: `https://via.placeholder.com/120x120/${id === '1' ? '10B981' : id === '2' ? '3B82F6' : '6B7280'}/FFFFFF?text=${id === '1' ? 'ET' : id === '2' ? 'HB' : 'EF'}`,
        coverImage: `https://via.placeholder.com/1200x400/${id === '1' ? '10B981' : id === '2' ? '3B82F6' : '6B7280'}/FFFFFF?text=Cover`,
        foundedDate: '2023',
        teamSize: id === '1' ? 12 : id === '2' ? 8 : 5,
        views: id === '1' ? 2340 : id === '2' ? 1580 : 890,
        followers: id === '1' ? 156 : id === '2' ? 89 : 67,
        fundingGoal: id === '1' ? '$2M' : id === '2' ? '$1.5M' : '$800K',
        fundingRaised: id === '1' ? '$1.5M' : id === '2' ? '$450K' : '$240K',
        fundingProgress: id === '1' ? 75 : id === '2' ? 30 : 30,
        tags: id === '1' ? ['Sustainability', 'AI', 'IoT', 'CleanTech'] :
              id === '2' ? ['Healthcare', 'Telemedicine', 'Social Impact', 'Mobile'] :
              ['Education', 'AI', 'Personalization', 'Analytics'],
        lookingFor: id === '1' ? ['CTO', 'Marketing Lead', 'Investors'] :
                    id === '2' ? ['Lead Developer', 'Medical Advisor', 'Investors'] :
                    ['Frontend Developer', 'UX Designer', 'Education Expert'],
        featured: id === '1',
        socialImpact: id === '1' ? 'Reducing carbon emissions by 40% for partner companies' :
                      id === '2' ? 'Providing healthcare access to 10,000+ rural residents' :
                      'Improving learning outcomes for 5,000+ students',
        founder: {
          name: 'Alex Chen',
          role: 'CEO & Founder',
          avatar: 'https://via.placeholder.com/80x80/10B981/FFFFFF?text=AC',
          bio: 'Former sustainability engineer at Tesla with 8+ years of experience in clean technology. Passionate about building solutions that create positive environmental impact.',
          email: 'alex@ecotech.example.com',
          linkedin: 'linkedin.com/in/alexchen',
          experience: '8+ years in CleanTech'
        },
        team: [
          {
            id: '1',
            name: 'Sarah Johnson',
            role: 'CTO',
            avatar: 'https://via.placeholder.com/60x60/3B82F6/FFFFFF?text=SJ',
            bio: 'Full-stack engineer with expertise in AI and machine learning',
            skills: ['Python', 'React', 'AI/ML', 'DevOps']
          },
          {
            id: '2',
            name: 'Michael Rodriguez',
            role: 'Head of Product',
            avatar: 'https://via.placeholder.com/60x60/6B7280/FFFFFF?text=MR',
            bio: 'Product manager with 6+ years experience in sustainable technology',
            skills: ['Product Strategy', 'User Research', 'Analytics', 'Design']
          }
        ],
        milestones: [
          {
            id: '1',
            title: 'Product Launch',
            description: 'Successfully launched MVP with 100+ early users',
            date: '2024-01-15',
            completed: true
          },
          {
            id: '2',
            title: 'Series A Funding',
            description: 'Raise $2M Series A to scale operations',
            date: '2024-06-30',
            completed: false
          },
          {
            id: '3',
            title: 'International Expansion',
            description: 'Expand to European markets',
            date: '2024-12-31',
            completed: false
          }
        ],
        openPositions: [
          {
            id: '1',
            title: 'Senior Frontend Developer',
            type: 'full-time',
            description: 'Join our team to build the next generation of sustainable technology solutions',
            skills: ['React', 'TypeScript', 'UI/UX', 'Testing'],
            commitment: 'Full-time, Equity + Salary'
          },
          {
            id: '2',
            title: 'Marketing Lead',
            type: 'equity',
            description: 'Lead our marketing efforts and help us reach more customers',
            skills: ['Digital Marketing', 'Content Strategy', 'Analytics', 'Brand Building'],
            commitment: 'Part-time, Equity-based'
          }
        ]
      };
      
      setStartup(mockData);
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

  const handleApply = (positionId: string) => {
    setSelectedPosition(positionId);
    onOpen();
  };

  const submitApplication = () => {
    toast({
      title: 'Application Sent!',
      description: 'Your application has been sent to the startup founder.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
    setApplicationMessage('');
    setSelectedPosition(null);
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
            <Heading size="lg" color="gray.500">Startup Not Found</Heading>
            <Text color="gray.600">The startup you're looking for doesn't exist or has been removed.</Text>
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
        <Box position="relative" overflow="hidden">
          <Image
            src={startup.coverImage}
            alt={`${startup.name} cover`}
            w="full"
            h="300px"
            objectFit="cover"
            filter="brightness(0.7)"
          />
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))"
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
                  bg="white"
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
                            <Text lineHeight="tall" color="gray.600">
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
                                  <Text color="gray.600">{startup.founder.role}</Text>
                                </VStack>
                                <Text fontSize="sm">{startup.founder.bio}</Text>
                                <HStack spacing={3}>
                                  <Link
                                    href={`mailto:${startup.founder.email}`}
                                    color="brand.500"
                                    _hover={{ textDecoration: 'underline' }}
                                  >
                                    <HStack spacing={1}>
                                      <Icon as={FiMail} />
                                      <Text fontSize="sm">Contact</Text>
                                    </HStack>
                                  </Link>
                                  <Link
                                    href={`https://${startup.founder.linkedin}`}
                                    color="blue.500"
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
                                        <Text fontSize="sm" color="gray.600">
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
                                    <Text color="gray.600" fontSize="sm">
                                      {milestone.description}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      Target: {new Date(milestone.date).toLocaleDateString()}
                                    </Text>
                                  </VStack>
                                </HStack>
                                {index < startup.milestones.length - 1 && (
                                  <Box
                                    w="2px"
                                    h={6}
                                    bg="gray.200"
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
                            <Text color="gray.600">
                              Join our mission and help us build the future together.
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      {startup.openPositions.map((position) => (
                        <Card key={position.id} variant="outline" className="card-hover">
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
                                    <Text fontSize="sm" color="gray.600">
                                      {position.commitment}
                                    </Text>
                                  </HStack>
                                </VStack>
                                <Button
                                  size="sm"
                                  variant="solid"
                                  colorScheme="brand"
                                  onClick={() => handleApply(position.id)}
                                >
                                  Apply
                                </Button>
                              </HStack>
                              
                              <Text fontSize="sm">{position.description}</Text>
                              
                              <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                  Required Skills:
                                </Text>
                                <HStack spacing={2} flexWrap="wrap">
                                  {position.skills.map((skill) => (
                                    <Badge key={skill} size="sm" colorScheme="gray">
                                      {skill}
                                    </Badge>
                                  ))}
                                </HStack>
                              </Box>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
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
                        colorScheme="green"
                        size="lg"
                        borderRadius="full"
                      />
                      <Text fontSize="sm" color="gray.600" textAlign="center">
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
                    <VStack spacing={2} align="stretch">
                      {startup.lookingFor.map((role) => (
                        <Badge key={role} colorScheme="brand" p={2} borderRadius="md">
                          {role}
                        </Badge>
                      ))}
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
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Apply for Position</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Text>
                  Send a message to {startup.name} about your interest in joining their team.
                </Text>
                <FormControl>
                  <FormLabel>Your Message</FormLabel>
                  <Textarea
                    placeholder="Tell them why you're interested and what you can contribute..."
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    rows={6}
                  />
                </FormControl>
                <HStack spacing={3} pt={4}>
                  <Button variant="ghost" onClick={onClose} flex={1}>
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="brand"
                    onClick={submitApplication}
                    flex={1}
                    isDisabled={!applicationMessage.trim()}
                  >
                    Send Application
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}

export default StartupDetailPage