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
      bg="chakra-subtle-bg"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <VStack spacing={4}>
        <Spinner 
          size={size} 
          color="interactive-accent" 
          thickness="4px"
          speed="0.65s"
        />
        <Text 
          color="text-secondary" 
          fontSize="lg"
          fontWeight="medium"
        >
          {message}
        </Text>
      </VStack>
    </Flex>
  )
})