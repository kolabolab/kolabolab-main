import { Box, Text, Heading } from '@chakra-ui/react'

const ChakraTest = () => {
  return (
    <Box p={8} bg="blue.50">
      <Heading size="lg" color="blue.600" mb={4}>
        Welcome to Kolabolab
      </Heading>
      <Text fontSize="lg" color="gray.700">
        This tests if Chakra UI is working with React 18 types.
      </Text>
      <Text mt={4} color="green.600">
        If you see this with styling, Chakra UI is working correctly.
      </Text>
    </Box>
  )
}

export default ChakraTest