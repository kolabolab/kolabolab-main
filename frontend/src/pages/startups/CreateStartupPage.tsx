import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'

const CreateStartupPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Create Startup - KolaboLab</title>
        <meta 
          name="description" 
          content="Submit your startup to KolaboLab. Share your innovative idea and connect with collaborators and investors." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Create Startup Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              This is a placeholder for the Create Startup page. Form to submit new startup profiles will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default CreateStartupPage