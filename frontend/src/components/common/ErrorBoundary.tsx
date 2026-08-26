import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Collapse,
  useDisclosure
} from '@chakra-ui/react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
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
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  onReset: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box
      minH="400px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <VStack spacing={6} maxW="md" textAlign="center">
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {error?.message || 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.'}
            </AlertDescription>
          </Box>
        </Alert>

        <VStack spacing={4}>
          <Button colorScheme="brand" onClick={onReset}>
            Try Again
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isOpen ? 'Hide' : 'Show'} Error Details
          </Button>
        </VStack>

        <Collapse in={isOpen}>
          <Box
            p={4}
            bg="chakra-subtle-bg"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            textAlign="left"
            maxW="full"
            overflow="auto"
          >
            <Heading size="sm" mb={2}>Error Details:</Heading>
            {error && (
              <VStack spacing={2} align="stretch">
                <Text fontSize="sm" fontWeight="semibold">Message:</Text>
                <Code p={2} borderRadius="md" fontSize="xs">
                  {error.message}
                </Code>
                
                {error.stack && (
                  <>
                    <Text fontSize="sm" fontWeight="semibold" mt={2}>Stack Trace:</Text>
                    <Code p={2} borderRadius="md" fontSize="xs" whiteSpace="pre-wrap">
                      {error.stack}
                    </Code>
                  </>
                )}
              </VStack>
            )}
          </Box>
        </Collapse>
      </VStack>
    </Box>
  )
}

export default ErrorBoundary