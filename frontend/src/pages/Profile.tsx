import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Avatar,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react'
import { useAuthStore } from '../stores/authStore'

const Profile = () => {
  const { user } = useAuthStore()
  const cardBg = useColorModeValue('white', 'gray.800')

  if (!user) {
    return (
      <Container maxW="6xl" py={8}>
        <Text>Please log in to view your profile.</Text>
      </Container>
    )
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={6}>
              <Avatar size="2xl" name={`${user.firstName} ${user.lastName}`} bg="brand.500" />
              <VStack spacing={2}>
                <Heading size="lg">{user.firstName} {user.lastName}</Heading>
                <Badge colorScheme="brand" fontSize="md" p={2}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <Text color="gray.500">{user.email}</Text>
              </VStack>
              <Button colorScheme="brand">Edit Profile</Button>
            </VStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card bg={cardBg}>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md">Skills</Heading>
                <HStack wrap="wrap">
                  {user.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md">Languages</Heading>
                <HStack wrap="wrap">
                  {user.languages.map((language) => (
                    <Badge key={language} colorScheme="green" variant="outline">
                      {language}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {user.location && (
          <Card bg={cardBg}>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Heading size="md">Location</Heading>
                <Text>{user.location.city}, {user.location.country}</Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
}

export default Profile