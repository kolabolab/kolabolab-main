import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
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
              This is a placeholder for the Investments page. Investment opportunities and portfolio management will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default InvestmentsPage