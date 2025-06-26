import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'

const SearchPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Search - KolaboLab</title>
        <meta 
          name="description" 
          content="Search KolaboLab for startups, collaborators, investors, and opportunities. Find exactly what you're looking for." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="brand.500">
              Search Page
            </Heading>
            <Text fontSize="lg" color="gray.600">
              This is a placeholder for the Search page. Advanced search and filtering functionality will be implemented here.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default SearchPage