import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  HStack,
  VStack,
  Badge,
  Avatar,
  useColorModeValue,
  Select,
  Wrap,
  WrapItem,
  Icon,
  Divider,
} from '@chakra-ui/react'
import { FaSearch, FaMapMarkerAlt, FaDollarSign, FaUsers, FaHeart } from 'react-icons/fa'
import { useState } from 'react'

interface Startup {
  id: string
  title: string
  description: string
  founder: {
    name: string
    avatar: string
  }
  tags: string[]
  fundingStage: string
  location: string
  teamSize: number
  equityOffered?: number
  isLiked: boolean
  fundingGoal: string
}

const mockStartups: Startup[] = [
  {
    id: '1',
    title: 'EcoDelivery - Sustainable Last Mile',
    description: 'Revolutionary eco-friendly delivery solution using electric bikes and AI route optimization to reduce carbon footprint in urban areas.',
    founder: {
      name: 'Maria Rodriguez',
      avatar: '/avatars/maria.jpg'
    },
    tags: ['#sustainability', '#logistics', '#ai', '#greentech'],
    fundingStage: 'Seed',
    location: 'Barcelona, Spain',
    teamSize: 4,
    equityOffered: 15,
    isLiked: false,
    fundingGoal: '$500K'
  },
  {
    id: '2',
    title: 'AccessibilityFirst - Inclusive Web Platform',
    description: 'AI-powered platform that automatically makes websites accessible for people with disabilities, ensuring WCAG compliance.',
    founder: {
      name: 'Ahmed Hassan',
      avatar: '/avatars/ahmed.jpg'
    },
    tags: ['#accessibility', '#ai', '#inclusion', '#saas'],
    fundingStage: 'Pre-Seed',
    location: 'Cairo, Egypt',
    teamSize: 3,
    equityOffered: 20,
    isLiked: true,
    fundingGoal: '$250K'
  },
  {
    id: '3',
    title: 'VoiceConnect - Global Communication',
    description: 'Real-time voice translation app connecting people across language barriers with advanced AI and cultural context understanding.',
    founder: {
      name: 'Yuki Tanaka',
      avatar: '/avatars/yuki.jpg'
    },
    tags: ['#ai', '#translation', '#communication', '#global'],
    fundingStage: 'Series A',
    location: 'Tokyo, Japan',
    teamSize: 12,
    equityOffered: 8,
    isLiked: false,
    fundingGoal: '$2M'
  },
  {
    id: '4',
    title: 'AgriTech Solutions - Smart Farming',
    description: 'IoT-based precision agriculture platform helping small farmers optimize crop yields while reducing water usage by 40%.',
    founder: {
      name: 'Priya Patel',
      avatar: '/avatars/priya.jpg'
    },
    tags: ['#agritech', '#iot', '#sustainability', '#farming'],
    fundingStage: 'Seed',
    location: 'Mumbai, India',
    teamSize: 7,
    equityOffered: 12,
    isLiked: true,
    fundingGoal: '$750K'
  },
  {
    id: '5',
    title: 'MentalHealth AI - Wellness Support',
    description: 'AI-powered mental health companion providing 24/7 support with evidence-based cognitive behavioral therapy techniques.',
    founder: {
      name: 'Dr. Lisa Thompson',
      avatar: '/avatars/lisa.jpg'
    },
    tags: ['#mentalhealth', '#ai', '#wellness', '#healthcare'],
    fundingStage: 'Pre-Seed',
    location: 'Toronto, Canada',
    teamSize: 5,
    equityOffered: 18,
    isLiked: false,
    fundingGoal: '$400K'
  },
  {
    id: '6',
    title: 'BlockchainVote - Secure Democracy',
    description: 'Transparent and secure voting platform using blockchain technology to ensure election integrity and accessibility.',
    founder: {
      name: 'Carlos Silva',
      avatar: '/avatars/carlos.jpg'
    },
    tags: ['#blockchain', '#democracy', '#security', '#govtech'],
    fundingStage: 'Seed',
    location: 'São Paulo, Brazil',
    teamSize: 8,
    equityOffered: 10,
    isLiked: true,
    fundingGoal: '$1M'
  }
]

const StartupCard = ({ startup }: { startup: Startup }) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const [isLiked, setIsLiked] = useState(startup.isLiked)

  const getFundingStageColor = (stage: string) => {
    switch (stage) {
      case 'Pre-Seed': return 'purple'
      case 'Seed': return 'blue'
      case 'Series A': return 'green'
      default: return 'gray'
    }
  }

  return (
    <Card bg={cardBg} h="full" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.2s">
      <CardHeader pb={2}>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <Badge colorScheme={getFundingStageColor(startup.fundingStage)} variant="subtle">
              {startup.fundingStage}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              colorScheme={isLiked ? "red" : "gray"}
              onClick={() => setIsLiked(!isLiked)}
              aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
            >
              <Icon as={FaHeart} color={isLiked ? "red.500" : "gray.400"} />
            </Button>
          </HStack>
          
          <Heading size="md" noOfLines={2}>
            {startup.title}
          </Heading>
          
          <HStack>
            <Avatar size="sm" src={startup.founder.avatar} name={startup.founder.name} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="semibold">
                {startup.founder.name}
              </Text>
              <HStack fontSize="xs" color="gray.500">
                <Icon as={FaMapMarkerAlt} />
                <Text>{startup.location}</Text>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack align="start" spacing={4}>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')} noOfLines={3}>
            {startup.description}
          </Text>
          
          <Wrap spacing={1}>
            {startup.tags.map((tag) => (
              <WrapItem key={tag}>
                <Badge variant="outline" colorScheme="brand" fontSize="xs">
                  {tag}
                </Badge>
              </WrapItem>
            ))}
          </Wrap>
          
          <Divider />
          
          <HStack justify="space-between" w="full" fontSize="sm">
            <HStack>
              <Icon as={FaUsers} color="gray.500" />
              <Text>{startup.teamSize} members</Text>
            </HStack>
            <HStack>
              <Icon as={FaDollarSign} color="green.500" />
              <Text>{startup.fundingGoal}</Text>
            </HStack>
          </HStack>
          
          {startup.equityOffered && (
            <Text fontSize="sm" color="brand.500" fontWeight="semibold">
              {startup.equityOffered}% equity offered
            </Text>
          )}
          
          <Button colorScheme="brand" size="sm" w="full">
            View Details
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

const StartupBrowse = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            Discover Innovative Startups
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="lg">
            Find your next collaboration opportunity, investment, or volunteer project
          </Text>
        </Box>

        {/* Search and Filters */}
        <Card bg={useColorModeValue('white', 'gray.800')}>
          <CardBody>
            <VStack spacing={4}>
              <InputGroup size="lg">
                <InputLeftElement>
                  <Icon as={FaSearch} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Search startups by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              <HStack spacing={4} w="full" flexWrap="wrap">
                <Select
                  placeholder="All Funding Stages"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  maxW="200px"
                >
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                </Select>
                
                <Select
                  placeholder="All Locations"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  maxW="200px"
                >
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                </Select>
                
                <Button variant="outline" colorScheme="brand">
                  Clear Filters
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Results */}
        <Box>
          <HStack justify="space-between" mb={6}>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Showing {mockStartups.length} startups
            </Text>
            <Select maxW="200px" defaultValue="newest">
              <option value="newest">Newest First</option>
              <option value="funding">Funding Stage</option>
              <option value="team-size">Team Size</option>
              <option value="location">Location</option>
            </Select>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
            {mockStartups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </SimpleGrid>
        </Box>

        {/* Load More */}
        <Box textAlign="center">
          <Button size="lg" variant="outline" colorScheme="brand">
            Load More Startups
          </Button>
        </Box>
      </VStack>
    </Container>
  )
}

export default StartupBrowse