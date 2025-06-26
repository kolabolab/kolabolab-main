import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'

const StartupListPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Startups - KolaboLab</title>
        <meta 
          name="description" 
          content="Explore innovative startups on KolaboLab. Discover tech companies with social impact looking for collaborators and investors." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Startup List Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              This is a placeholder for the Startup List page. Browse and filter startups will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default StartupListPage