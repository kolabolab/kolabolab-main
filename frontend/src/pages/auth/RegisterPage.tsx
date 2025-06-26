import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'

const RegisterPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Register - KolaboLab</title>
        <meta 
          name="description" 
          content="Join KolaboLab community. Create your account to connect with entrepreneurs, collaborators, and investors." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Register Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              This is a placeholder for the Registration page. User registration functionality will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default RegisterPage