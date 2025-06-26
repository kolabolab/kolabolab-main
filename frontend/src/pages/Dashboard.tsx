import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Button,
  VStack,
  HStack,
  Avatar,
  Badge,
  Icon,
} from '@chakra-ui/react'
import { FaRocket, FaUsers, FaChartLine, FaPlus } from 'react-icons/fa'
import { Link as RouterLink } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const Dashboard = () => {
  const { user } = useAuthStore()
  const cardBg = useColorModeValue('white', 'gray.800')

  if (!user) {
    return (
      <Container maxW="6xl" py={8}>
        <Text>Please log in to access your dashboard.</Text>
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Welcome Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user.firstName}! 👋
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Here's what's happening in your startup journey.
          </Text>
        </Box>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Active Collaborations</StatLabel>
                <StatNumber>3</StatNumber>
                <StatHelpText>2 new this month</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Profile Views</StatLabel>
                <StatNumber>127</StatNumber>
                <StatHelpText>+15% from last month</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Network Connections</StatLabel>
                <StatNumber>45</StatNumber>
                <StatHelpText>Growing your network</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Actions */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Button
                as={RouterLink}
                to="/startups/create"
                leftIcon={<Icon as={FaRocket} />}
                variant="startup"
                size="lg"
                height="auto"
                whiteSpace="normal"
                p={6}
              >
                <VStack spacing={2}>
                  <Text fontWeight="bold">Create Startup</Text>
                  <Text fontSize="sm" opacity={0.8}>Share your idea with the community</Text>
                </VStack>
              </Button>
              
              <Button
                as={RouterLink}
                to="/collaborate"
                leftIcon={<Icon as={FaUsers} />}
                variant="outline"
                size="lg"
                height="auto"
                whiteSpace="normal"
                p={6}
              >
                <VStack spacing={2}>
                  <Text fontWeight="bold">Find Collaborators</Text>
                  <Text fontSize="sm" opacity={0.8}>Connect with talented individuals</Text>
                </VStack>
              </Button>
              
              <Button
                as={RouterLink}
                to="/investors"
                leftIcon={<Icon as={FaChartLine} />}
                variant="invest"
                size="lg"
                height="auto"
                whiteSpace="normal"
                p={6}
              >
                <VStack spacing={2}>
                  <Text fontWeight="bold">Find Investors</Text>
                  <Text fontSize="sm" opacity={0.8}>Get funding for your startup</Text>
                </VStack>
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Avatar size="sm" name="TechStart" bg="startup.500" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="semibold">New collaboration request from TechStart</Text>
                  <Text fontSize="sm" color="gray.500">2 hours ago</Text>
                </VStack>
                <Badge colorScheme="blue">New</Badge>
              </HStack>
              
              <HStack>
                <Avatar size="sm" name="John Investor" bg="invest.500" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="semibold">John Investor viewed your profile</Text>
                  <Text fontSize="sm" color="gray.500">1 day ago</Text>
                </VStack>
              </HStack>
              
              <HStack>
                <Avatar size="sm" name="AI Startup" bg="brand.500" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="semibold">AI Startup accepted your collaboration</Text>
                  <Text fontSize="sm" color="gray.500">3 days ago</Text>
                </VStack>
                <Badge colorScheme="green">Success</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default Dashboard