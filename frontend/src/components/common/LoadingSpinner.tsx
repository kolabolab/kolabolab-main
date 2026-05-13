import React from 'react'
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({ 
  message = 'Loading...', 
  size = 'xl' 
}) => {
  return (
    <Flex 
      justify="center" 
      align="center" 
      minH="100vh" 
      bg="gray.50"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <VStack spacing={4}>
        <Spinner 
          size={size} 
          color="brand.500" 
          thickness="4px"
          speed="0.65s"
        />
        <Text 
          color="gray.600" 
          fontSize="lg"
          fontWeight="medium"
        >
          {message}
        </Text>
      </VStack>
    </Flex>
  )
})