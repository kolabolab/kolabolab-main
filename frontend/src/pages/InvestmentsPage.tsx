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

const InvestmentsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Investments - KolaboLab</title>
        <meta 
          name="description" 
          content="Explore investment opportunities on KolaboLab. Discover promising startups and manage your investment portfolio." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Investments Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Discover investment opportunities and manage your startup portfolio. Connect with promising startups and track your investments.
            </Text>
            
            <VStack spacing={6} align="stretch" mt={8}>
              <Box p={6} bg="white" borderRadius="xl" shadow="md">
                <Heading size="md" mb={4}>Investment Opportunities</Heading>
                <Text color="gray.600">
                  Explore promising startups looking for funding. Review their business models, team, and growth potential.
                </Text>
                <Button as={RouterLink} to="/startups" colorScheme="brand" mt={4}>
                  Browse Startups
                </Button>
              </Box>
              
              <Box p={6} bg="white" borderRadius="xl" shadow="md">
                <Heading size="md" mb={4}>My Portfolio</Heading>
                <Text color="gray.600">
                  You haven't made any investments yet. Start by exploring startups that match your investment criteria.
                </Text>
              </Box>
              
              <Box p={6} bg="white" borderRadius="xl" shadow="md">
                <Heading size="md" mb={4}>Investment Analytics</Heading>
                <Text color="gray.600">
                  Track the performance of your investments and get insights into market trends.
                </Text>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default InvestmentsPage