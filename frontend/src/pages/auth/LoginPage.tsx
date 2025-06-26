import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'

const LoginPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Login - KolaboLab</title>
        <meta 
          name="description" 
          content="Sign in to your KolaboLab account to access your dashboard and connect with the startup community." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Login Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              This is a placeholder for the Login page. Authentication functionality will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default LoginPage