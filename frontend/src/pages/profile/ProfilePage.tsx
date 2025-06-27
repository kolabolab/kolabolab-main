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
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Badge,
  Icon,
  Avatar,
  Image,
  Divider,
  Flex,
  Link,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Switch,
} from '@chakra-ui/react'
// import { Link as RouterLink } from 'react-router-dom'
import { 
  FiEdit3, 
  FiMapPin,
  FiMail,
  FiLinkedin,
  FiGithub,
  FiGlobe,
  FiPlus,
  FiX,
  FiEye,
  FiUsers,
  FiSettings,
  FiCamera,
  FiExternalLink
} from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  coverImage: string;
  role: 'entrepreneur' | 'collaborator' | 'investor';
  title: string;
  bio: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  experience: string;
  skills: string[];
  interests: string[];
  languages: string[];
  timezone: string;
  isPublic: boolean;
  openToWork: boolean;
  openToMentor: boolean;
  stats: {
    profileViews: number;
    connections: number;
    startups: number;
    collaborations: number;
    investments: number;
  };
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    tags: string[];
    type: 'startup' | 'project' | 'investment';
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
}

interface EditableSection {
  basic: boolean;
  bio: boolean;
  skills: boolean;
  portfolio: boolean;
  social: boolean;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditableSection>({
    basic: false,
    bio: false,
    skills: false,
    portfolio: false,
    social: false,
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [, setErrors] = useState<Record<string, string>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    link: '',
    tags: '',
    type: 'project' as 'startup' | 'project' | 'investment',
  });
  const toast = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user profile data
    const mockProfile: UserProfile = {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@example.com',
      avatar: 'https://via.placeholder.com/120x120/10B981/FFFFFF?text=SC',
      coverImage: 'https://via.placeholder.com/1200x300/10B981/FFFFFF?text=Cover',
      role: 'collaborator',
      title: 'Senior Full-Stack Developer & AI Specialist',
      bio: 'Passionate full-stack developer with 8+ years of experience building scalable web applications and AI-powered solutions. I specialize in React, Python, and machine learning, with a focus on creating technology that makes a positive social impact.',
      location: 'San Francisco, CA',
      website: 'https://sarahchen.dev',
      linkedin: 'linkedin.com/in/sarahchen',
      github: 'github.com/sarahchen',
      experience: '8+ years',
      skills: ['React', 'Python', 'TypeScript', 'Node.js', 'AI/ML', 'PostgreSQL', 'AWS', 'Docker'],
      interests: ['Sustainability', 'Social Impact', 'EdTech', 'HealthTech', 'Open Source'],
      languages: ['English', 'Mandarin', 'Spanish'],
      timezone: 'PST',
      isPublic: true,
      openToWork: true,
      openToMentor: false,
      stats: {
        profileViews: 1247,
        connections: 156,
        startups: 3,
        collaborations: 12,
        investments: 0,
      },
      portfolio: [
        {
          id: '1',
          title: 'EcoTech Solutions',
          description: 'Built the entire frontend and AI recommendation system for this sustainability platform',
          image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=EcoTech',
          link: '/startups/1',
          tags: ['React', 'AI/ML', 'Sustainability'],
          type: 'startup',
        },
        {
          id: '2',
          title: 'Open Source ML Library',
          description: 'Created an open-source machine learning library for sustainable technology applications',
          image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=ML',
          link: 'https://github.com/sarahchen/eco-ml',
          tags: ['Python', 'Machine Learning', 'Open Source'],
          type: 'project',
        },
        {
          id: '3',
          title: 'Climate Data Dashboard',
          description: 'Interactive dashboard for visualizing climate impact data for non-profits',
          image: 'https://via.placeholder.com/300x200/6B7280/FFFFFF?text=Climate',
          link: 'https://climate-dashboard.example.com',
          tags: ['React', 'D3.js', 'Data Visualization'],
          type: 'project',
        },
      ],
      achievements: [
        {
          id: '1',
          title: 'Top Contributor',
          description: 'Recognized as a top contributor to sustainable technology projects',
          date: '2024-01-15',
          icon: '🏆',
        },
        {
          id: '2',
          title: 'Open Source Champion',
          description: 'Contributed to 50+ open source projects',
          date: '2023-12-01',
          icon: '🌟',
        },
        {
          id: '3',
          title: 'Mentor of the Year',
          description: 'Mentored 10+ junior developers',
          date: '2023-11-15',
          icon: '👩‍🏫',
        },
      ],
    };
    
    setProfile(mockProfile);
    setLoading(false);
  };

  const handleEdit = (section: keyof EditableSection) => {
    setEditing(prev => ({ ...prev, [section]: !prev[section] }));
    setErrors({});
  };

  const handleSave = async (section: keyof EditableSection) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEditing(prev => ({ ...prev, [section]: false }));
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && profile && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => prev ? {
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      } : null);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile(prev => prev ? {
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    } : null);
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && profile && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => prev ? {
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      } : null);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfile(prev => prev ? {
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    } : null);
  };

  const handleAddPortfolio = () => {
    if (portfolioForm.title && portfolioForm.description && profile) {
      const newProject = {
        id: Date.now().toString(),
        title: portfolioForm.title,
        description: portfolioForm.description,
        image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=New',
        link: portfolioForm.link,
        tags: portfolioForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        type: portfolioForm.type,
      };
      
      setProfile(prev => prev ? {
        ...prev,
        portfolio: [...prev.portfolio, newProject]
      } : null);
      
      setPortfolioForm({
        title: '',
        description: '',
        link: '',
        tags: '',
        type: 'project',
      });
      
      onClose();
      toast({
        title: 'Portfolio item added',
        description: 'Your new project has been added to your portfolio.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'entrepreneur': return '🚀';
      case 'collaborator': return '🤝';
      case 'investor': return '💰';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'entrepreneur': return 'orange';
      case 'collaborator': return 'brand';
      case 'investor': return 'green';
      default: return 'gray';
    }
  };

  if (loading || !profile) {
    return (
      <>
        <Helmet>
          <title>Profile - KolaboLab</title>
        </Helmet>
        <Box py={8}>
          <Container maxW="6xl">
            <Text>Loading profile...</Text>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.firstName} {profile.lastName} - KolaboLab</title>
        <meta 
          name="description" 
          content={`${profile.firstName} ${profile.lastName} - ${profile.title}. ${profile.bio.substring(0, 160)}...`}
        />
      </Helmet>

      <Box>
        {/* Cover Section */}
        <Box position="relative" overflow="hidden">
          <Image
            src={profile.coverImage}
            alt="Profile cover"
            w="full"
            h="250px"
            objectFit="cover"
            filter="brightness(0.8)"
          />
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))"
          />
          <Container maxW="6xl" position="relative" zIndex={1}>
            <Flex justify="space-between" align="end" py={8} color="white">
              <HStack spacing={6} align="end">
                <Box position="relative">
                  <Avatar
                    size="2xl"
                    src={profile.avatar}
                    border="4px solid white"
                    bg="white"
                  />
                  <IconButton
                    icon={<FiCamera />}
                    size="sm"
                    position="absolute"
                    bottom={2}
                    right={2}
                    borderRadius="full"
                    aria-label="Change avatar"
                    onClick={() => toast({
                      title: 'Photo Upload',
                      description: 'Photo upload functionality coming soon!',
                      status: 'info',
                      duration: 3000,
                    })}
                  />
                </Box>
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Heading size="xl">{profile.firstName} {profile.lastName}</Heading>
                    <Badge
                      colorScheme={getRoleColor(profile.role)}
                      px={3}
                      py={1}
                      fontSize="sm"
                    >
                      {getRoleIcon(profile.role)} {profile.role}
                    </Badge>
                  </HStack>
                  <Text fontSize="lg" opacity={0.9}>
                    {profile.title}
                  </Text>
                  <HStack spacing={4} fontSize="sm">
                    <HStack spacing={1}>
                      <Icon as={FiMapPin} />
                      <Text>{profile.location}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FiEye} />
                      <Text>{profile.stats.profileViews} views</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FiUsers} />
                      <Text>{profile.stats.connections} connections</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>
              
              <Button
                leftIcon={<FiSettings />}
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                Settings
              </Button>
            </Flex>
          </Container>
        </Box>

        {/* Content */}
        <Container maxW="6xl" py={8}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
            {/* Main Content */}
            <Box gridColumn={{ base: 1, lg: "1 / 3" }}>
              <VStack spacing={8} align="stretch">
                {/* About Section */}
                <Card className="glass-panel">
                  <CardHeader>
                    <Flex justify="space-between" align="center">
                      <Heading size="md">About</Heading>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiEdit3 />}
                        onClick={() => handleEdit('bio')}
                      >
                        {editing.bio ? 'Cancel' : 'Edit'}
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={0}>
                    {editing.bio ? (
                      <VStack spacing={4} align="stretch">
                        <Textarea
                          value={profile.bio}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                          rows={4}
                        />
                        <HStack>
                          <Button
                            size="sm"
                            variant="solid"
                            colorScheme="brand"
                            onClick={() => handleSave('bio')}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit('bio')}
                          >
                            Cancel
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <Text lineHeight="tall">{profile.bio}</Text>
                    )}
                  </CardBody>
                </Card>

                {/* Skills & Interests */}
                <Card className="glass-panel">
                  <CardHeader>
                    <Flex justify="space-between" align="center">
                      <Heading size="md">Skills & Interests</Heading>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiEdit3 />}
                        onClick={() => handleEdit('skills')}
                      >
                        {editing.skills ? 'Done' : 'Edit'}
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={6} align="stretch">
                      {/* Skills */}
                      <Box>
                        <Text fontWeight="semibold" mb={3}>Skills</Text>
                        <HStack spacing={2} flexWrap="wrap" mb={editing.skills ? 3 : 0}>
                          {profile.skills.map((skill) => (
                            <Badge
                              key={skill}
                              colorScheme="brand"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {skill}
                              {editing.skills && (
                                <IconButton
                                  icon={<FiX />}
                                  size="xs"
                                  variant="ghost"
                                  ml={1}
                                  onClick={() => handleRemoveSkill(skill)}
                                  aria-label={`Remove ${skill}`}
                                />
                              )}
                            </Badge>
                          ))}
                        </HStack>
                        {editing.skills && (
                          <HStack>
                            <Input
                              placeholder="Add a skill"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                              size="sm"
                            />
                            <Button size="sm" onClick={handleAddSkill}>
                              Add
                            </Button>
                          </HStack>
                        )}
                      </Box>

                      <Divider />

                      {/* Interests */}
                      <Box>
                        <Text fontWeight="semibold" mb={3}>Interests</Text>
                        <HStack spacing={2} flexWrap="wrap" mb={editing.skills ? 3 : 0}>
                          {profile.interests.map((interest) => (
                            <Badge
                              key={interest}
                              colorScheme="gray"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {interest}
                              {editing.skills && (
                                <IconButton
                                  icon={<FiX />}
                                  size="xs"
                                  variant="ghost"
                                  ml={1}
                                  onClick={() => handleRemoveInterest(interest)}
                                  aria-label={`Remove ${interest}`}
                                />
                              )}
                            </Badge>
                          ))}
                        </HStack>
                        {editing.skills && (
                          <HStack>
                            <Input
                              placeholder="Add an interest"
                              value={newInterest}
                              onChange={(e) => setNewInterest(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                              size="sm"
                            />
                            <Button size="sm" onClick={handleAddInterest}>
                              Add
                            </Button>
                          </HStack>
                        )}
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Portfolio */}
                <Card className="glass-panel">
                  <CardHeader>
                    <Flex justify="space-between" align="center">
                      <Heading size="md">Portfolio</Heading>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiPlus />}
                        onClick={onOpen}
                      >
                        Add Project
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {profile.portfolio.map((item) => (
                        <Card key={item.id} variant="outline" className="card-hover">
                          <CardBody p={4}>
                            <VStack spacing={3} align="stretch">
                              <Image
                                src={item.image}
                                alt={item.title}
                                borderRadius="md"
                                h="120px"
                                objectFit="cover"
                                w="full"
                              />
                              <VStack align="start" spacing={2}>
                                <HStack justify="space-between" w="full">
                                  <Badge colorScheme={item.type === 'startup' ? 'brand' : 'blue'}>
                                    {item.type}
                                  </Badge>
                                  <Link href={item.link} isExternal>
                                    <Icon as={FiExternalLink} w={4} h={4} color="gray.500" />
                                  </Link>
                                </HStack>
                                <Text fontWeight="semibold">{item.title}</Text>
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  {item.description}
                                </Text>
                                <HStack spacing={1} flexWrap="wrap">
                                  {item.tags.map((tag) => (
                                    <Badge key={tag} size="sm" colorScheme="gray">
                                      {tag}
                                    </Badge>
                                  ))}
                                </HStack>
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Achievements */}
                <Card className="glass-panel">
                  <CardHeader>
                    <Heading size="md">Achievements</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      {profile.achievements.map((achievement) => (
                        <HStack key={achievement.id} spacing={4} p={3} borderRadius="md" bg="gray.50" _dark={{ bg: 'gray.700' }}>
                          <Text fontSize="2xl">{achievement.icon}</Text>
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold">{achievement.title}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {achievement.description}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(achievement.date).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>

            {/* Sidebar */}
            <VStack spacing={6} align="stretch">
              {/* Quick Stats */}
              <Card className="glass-panel">
                <CardHeader>
                  <Heading size="md">Profile Stats</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <Stat>
                      <StatLabel fontSize="xs">Profile Views</StatLabel>
                      <StatNumber fontSize="lg">{profile.stats.profileViews}</StatNumber>
                      <StatHelpText>This month</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize="xs">Connections</StatLabel>
                      <StatNumber fontSize="lg">{profile.stats.connections}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize="xs">Collaborations</StatLabel>
                      <StatNumber fontSize="lg">{profile.stats.collaborations}</StatNumber>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>

              {/* Contact Info */}
              <Card className="glass-panel">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Contact Info</Heading>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<FiEdit3 />}
                      onClick={() => handleEdit('social')}
                    >
                      {editing.social ? 'Done' : 'Edit'}
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={FiMail} color="gray.500" />
                      <Text fontSize="sm">{profile.email}</Text>
                    </HStack>
                    {profile.website && (
                      <HStack spacing={3}>
                        <Icon as={FiGlobe} color="gray.500" />
                        <Link href={profile.website} isExternal fontSize="sm" color="brand.500">
                          {profile.website}
                        </Link>
                      </HStack>
                    )}
                    {profile.linkedin && (
                      <HStack spacing={3}>
                        <Icon as={FiLinkedin} color="gray.500" />
                        <Link href={`https://${profile.linkedin}`} isExternal fontSize="sm" color="brand.500">
                          {profile.linkedin}
                        </Link>
                      </HStack>
                    )}
                    {profile.github && (
                      <HStack spacing={3}>
                        <Icon as={FiGithub} color="gray.500" />
                        <Link href={`https://${profile.github}`} isExternal fontSize="sm" color="brand.500">
                          {profile.github}
                        </Link>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Availability */}
              <Card className="glass-panel">
                <CardHeader>
                  <Heading size="md">Availability</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">Open to work</Text>
                      <Switch
                        isChecked={profile.openToWork}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, openToWork: e.target.checked } : null)}
                        colorScheme="brand"
                      />
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Available for mentoring</Text>
                      <Switch
                        isChecked={profile.openToMentor}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, openToMentor: e.target.checked } : null)}
                        colorScheme="brand"
                      />
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Public profile</Text>
                      <Switch
                        isChecked={profile.isPublic}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, isPublic: e.target.checked } : null)}
                        colorScheme="brand"
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Languages & Details */}
              <Card className="glass-panel">
                <CardHeader>
                  <Heading size="md">Details</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>Languages</Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {profile.languages.map((language) => (
                          <Badge key={language} size="sm" colorScheme="blue">
                            {language}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={1}>Experience</Text>
                      <Text fontSize="sm" color="gray.600">{profile.experience}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={1}>Timezone</Text>
                      <Text fontSize="sm" color="gray.600">{profile.timezone}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </SimpleGrid>
        </Container>

        {/* Add Portfolio Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Portfolio Item</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Project name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={portfolioForm.type}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="project">Project</option>
                    <option value="startup">Startup</option>
                    <option value="investment">Investment</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project..."
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Link (optional)</FormLabel>
                  <Input
                    value={portfolioForm.link}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <Input
                    value={portfolioForm.tags}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="React, Python, AI (comma separated)"
                  />
                </FormControl>

                <HStack spacing={3} pt={4}>
                  <Button variant="ghost" onClick={onClose} flex={1}>
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="brand"
                    onClick={handleAddPortfolio}
                    flex={1}
                    isDisabled={!portfolioForm.title || !portfolioForm.description}
                  >
                    Add Project
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

export default ProfilePage