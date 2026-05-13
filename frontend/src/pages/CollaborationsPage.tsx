import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const CollaborationsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Collaborations - KolaboLab</title>
        <meta 
          name="description" 
          content="Manage your collaborations on KolaboLab. Track active projects, team communications, and partnership opportunities." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Collaborations Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Manage your startup collaborations, partnerships, and team coordination. Connect with other entrepreneurs and build meaningful business relationships.
            </Text>
            
            <VStack spacing={6} align="stretch" mt={8}>
              <Box p={6} bg="white" borderRadius="xl" shadow="md">
                <Heading size="md" mb={4}>Active Collaborations</Heading>
                <Text color="gray.600">
                  You don't have any active collaborations yet. Start by exploring startups and reaching out to potential partners.
                </Text>
                <Button as={RouterLink} to="/startups" colorScheme="brand" mt={4}>
                  Explore Startups
                </Button>
              </Box>
              
              <Box p={6} bg="white" borderRadius="xl" shadow="md">
                <Heading size="md" mb={4}>Partnership Requests</Heading>
                <Text color="gray.600">
                  No pending partnership requests at this time.
                </Text>
              </Box>
              
              <Box p={6} bg="white" borderRadius="xl" shadow="md">
                <Heading size="md" mb={4}>Team Coordination</Heading>
                <Text color="gray.600">
                  Manage your team members and coordinate project activities.
                </Text>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default CollaborationsPage