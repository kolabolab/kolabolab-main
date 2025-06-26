import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Icon,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiUsers, FiTrendingUp, FiDollarSign, FiSearch } from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'

const FeatureCard = ({ icon, title, description }: {
  icon: any
  title: string
  description: string
}) => (
  <Card>
    <CardBody textAlign="center" p={6}>
      <VStack spacing={4}>
        <Icon as={icon} boxSize={12} color="brand.500" />
        <Heading size="md">{title}</Heading>
        <Text color="gray.600">{description}</Text>
      </VStack>
    </CardBody>
  </Card>
)

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <VStack spacing={2}>
    <Text fontSize="3xl" fontWeight="bold" color="brand.500">
      {number}
    </Text>
    <Text fontSize="sm" color="gray.600" textAlign="center">
      {label}
    </Text>
  </VStack>
)

const HomePage: React.FC = () => {
  const bgGradient = useColorModeValue(
    'linear(to-r, brand.50, white)',
    'linear(to-r, gray.900, gray.800)'
  )

  return (
    <>
      <Helmet>
        <title>KolaboLab - Connect, Collaborate, Create</title>
        <meta 
          name="description" 
          content="Join KolaboLab to connect with entrepreneurs, find collaborators, and discover investment opportunities in tech startups with social impact." 
        />
      </Helmet>

      <Box>
        {/* Hero Section */}
        <Box bg={bgGradient} py={20}>
          <Container maxW="6xl">
            <VStack spacing={8} textAlign="center">
              <Badge colorScheme="brand" fontSize="sm" px={3} py={1} rounded="full">
                Platform for Tech Innovation
              </Badge>
              
              <Heading
                size="2xl"
                fontWeight="bold"
                color="gray.800"
                maxW="4xl"
              >
                Connect, Collaborate, and Create the Future
              </Heading>
              
              <Text fontSize="xl" color="gray.600" maxW="2xl">
                Join a community of entrepreneurs, skilled collaborators, and investors 
                building meaningful technology solutions with social impact.
              </Text>
              
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  colorScheme="brand"
                  variant="solid"
                  rightIcon={<Icon as={FiUsers} />}
                >
                  Join Community
                </Button>
                <Button
                  as={RouterLink}
                  to="/startups"
                  size="lg"
                  colorScheme="brand"
                  variant="outline"
                  rightIcon={<Icon as={FiSearch} />}
                >
                  Explore Startups
                </Button>
              </HStack>
            </VStack>
          </Container>
        </Box>

        {/* Stats Section */}
        <Box py={16} bg="white">
          <Container maxW="6xl">
            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={8}>
              <StatCard number="1,200+" label="Active Startups" />
              <StatCard number="5,000+" label="Community Members" />
              <StatCard number="$50M+" label="Funding Raised" />
              <StatCard number="300+" label="Successful Collaborations" />
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box py={20} bg="gray.50">
          <Container maxW="6xl">
            <VStack spacing={12}>
              <VStack spacing={4} textAlign="center">
                <Heading size="xl">How KolaboLab Works</Heading>
                <Text fontSize="lg" color="gray.600" maxW="2xl">
                  Our platform connects three key groups in the startup ecosystem
                </Text>
              </VStack>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
                <FeatureCard
                  icon={FiUsers}
                  title="For Entrepreneurs"
                  description="Share your startup idea, find skilled collaborators, and connect with investors to bring your vision to life."
                />
                <FeatureCard
                  icon={FiTrendingUp}
                  title="For Collaborators"
                  description="Discover exciting projects that match your skills and interests. Contribute to meaningful startups and grow your network."
                />
                <FeatureCard
                  icon={FiDollarSign}
                  title="For Investors"
                  description="Find promising startups with social impact. Connect directly with founders and make informed investment decisions."
                />
              </Grid>
            </VStack>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box py={20} bg="brand.500">
          <Container maxW="4xl">
            <VStack spacing={8} textAlign="center" color="white">
              <Heading size="xl">Ready to Start Building?</Heading>
              <Text fontSize="lg" opacity={0.9}>
                Join thousands of innovators who are already creating the future on KolaboLab
              </Text>
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  variant="cta-primary"
                >
                  Get Started Free
                </Button>
                <Button
                  as={RouterLink}
                  to="/startups"
                  size="lg"
                  variant="cta-secondary"
                >
                  Browse Projects
                </Button>
              </HStack>
            </VStack>
          </Container>
        </Box>
      </Box>
    </>
  )
}

export default HomePage