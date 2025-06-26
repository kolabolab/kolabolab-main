import { Box, Text, Heading } from '@chakra-ui/react'

const TestLanding = () => {
  return (
    <Box p={8}>
      <Heading size="lg" color="blue.500" mb={4}>
        Welcome to Kolabolab
      </Heading>
      <Text fontSize="lg">
        This is a simple test page to verify the frontend is working.
      </Text>
      <Text mt={4}>
        If you can see this text, the React application is rendering correctly.
      </Text>
    </Box>
  )
}

export default TestLanding