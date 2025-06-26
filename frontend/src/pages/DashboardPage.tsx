import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'

const DashboardPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard - KolaboLab</title>
        <meta 
          name="description" 
          content="Your personalized KolaboLab dashboard. Manage your startups, collaborations, and investment activities." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Dashboard Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              This is a placeholder for the Dashboard page. User dashboard with personalized content will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default DashboardPage