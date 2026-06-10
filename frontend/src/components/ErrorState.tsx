import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
} from '@chakra-ui/react'

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="lg"
      p={6}
    >
      <AlertIcon boxSize="24px" mr={0} mb={2} />
      <AlertTitle mt={2} mb={1} fontSize="md">
        Failed to load data
      </AlertTitle>
      <AlertDescription maxWidth="sm" mb={4}>
        {error}
      </AlertDescription>
      <Flex>
        <Button colorScheme="red" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </Flex>
    </Alert>
  )
}
