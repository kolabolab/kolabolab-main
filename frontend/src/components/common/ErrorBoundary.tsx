import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Button, Heading, Text, VStack, Alert, AlertIcon } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          minH="100vh" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          p={8}
          bg="gray.50"
        >
          <VStack spacing={6} maxW="md" textAlign="center">
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              Something went wrong
            </Alert>
            
            <Heading size="lg" color="gray.800">
              Oops! Something went wrong
            </Heading>
            
            <Text color="gray.600" fontSize="md">
              We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </Text>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box 
                p={4} 
                bg="red.50" 
                borderRadius="md" 
                border="1px solid" 
                borderColor="red.200"
                fontSize="sm"
                fontFamily="mono"
                color="red.800"
                textAlign="left"
                overflowX="auto"
                maxW="100%"
              >
                <Text fontWeight="bold" mb={2}>Error Details:</Text>
                <Text>{this.state.error.message}</Text>
                {this.state.error.stack && (
                  <Text mt={2} fontSize="xs" opacity={0.8}>
                    {this.state.error.stack}
                  </Text>
                )}
              </Box>
            )}
            
            <Button 
              colorScheme="brand" 
              onClick={() => window.location.reload()}
              size="lg"
            >
              Refresh Page
            </Button>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}