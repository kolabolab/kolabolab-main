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

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - KolaboLab</title>
        <meta 
          name="description" 
          content="The page you're looking for doesn't exist. Return to KolaboLab home page or explore our platform." 
        />
      </Helmet>

      <Box>
        <Container maxW="6xl" py={20}>
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl" color="brand.500">
              404
            </Heading>
            <Heading size="xl" color="gray.700">
              Page Not Found
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="md">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </Text>
            <Button
              as={RouterLink}
              to="/"
              size="lg"
              colorScheme="brand"
            >
              Return to Home
            </Button>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default NotFoundPage