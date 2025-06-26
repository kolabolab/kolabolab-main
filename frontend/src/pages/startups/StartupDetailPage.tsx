import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'

const StartupDetailPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Startup Details - KolaboLab</title>
        <meta 
          name="description" 
          content="View detailed information about a startup, including team, funding status, and collaboration opportunities." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Startup Detail Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              This is a placeholder for the Startup Detail page. Individual startup profiles and details will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default StartupDetailPage