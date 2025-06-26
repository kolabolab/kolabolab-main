import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  Badge,
  Avatar,
  useColorModeValue,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { FaSearch, FaUsers, FaHeart } from 'react-icons/fa'

const Collaborate = () => {
  const cardBg = useColorModeValue('white', 'gray.800')

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            Find Collaborators
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="lg">
            Connect with talented individuals and build amazing things together
          </Text>
        </Box>

        <InputGroup size="lg" maxW="md" mx="auto">
          <InputLeftElement>
            <Icon as={FaSearch} color="gray.500" />
          </InputLeftElement>
          <Input placeholder="Search by skills or location..." />
        </InputGroup>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} bg={cardBg}>
              <CardBody>
                <VStack spacing={4}>
                  <Avatar size="lg" name={`User ${i}`} bg="brand.500" />
                  <VStack spacing={1}>
                    <Text fontWeight="bold">Developer {i}</Text>
                    <Text fontSize="sm" color="gray.500">Full Stack Developer</Text>
                  </VStack>
                  <HStack>
                    <Badge>React</Badge>
                    <Badge>Node.js</Badge>
                    <Badge>Python</Badge>
                  </HStack>
                  <Text fontSize="sm" textAlign="center" noOfLines={2}>
                    Passionate about building accessible web applications with modern technologies.
                  </Text>
                  <Button leftIcon={<Icon as={FaUsers} />} colorScheme="brand" size="sm">
                    Connect
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  )
}

export default Collaborate