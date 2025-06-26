import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'

const ProfilePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Profile - KolaboLab</title>
        <meta 
          name="description" 
          content="Manage your KolaboLab profile. Update your skills, experience, and preferences to better connect with opportunities." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Profile Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              This is a placeholder for the Profile page. User profile management and settings will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default ProfilePage