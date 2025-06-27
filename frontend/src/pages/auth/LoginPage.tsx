import React, { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  Divider,
  Link,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiGithub } from 'react-icons/fi'
import { FaGoogle, FaLinkedin } from 'react-icons/fa'
import { Helmet } from 'react-helmet-async'

interface LoginForm {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Mock successful login
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please try again.' });
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'linkedin' | 'github') => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual OAuth implementation
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login`,
        description: 'OAuth integration coming soon!',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'OAuth Error',
        description: 'Something went wrong with OAuth login.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - KolaboLab</title>
        <meta 
          name="description" 
          content="Sign in to your KolaboLab account to access your dashboard and connect with the startup community." 
        />
      </Helmet>

      <Box className="primary-context" minH="100vh" display="flex" alignItems="center" py={12}>
        <Container maxW="md">
          <VStack spacing={8}>
            {/* Header */}
            <VStack spacing={3} textAlign="center">
              <Heading 
                as="h1" 
                fontSize={{ base: '2xl', md: '3xl' }}
                className="gradient-text"
              >
                Welcome Back
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Sign in to continue your startup journey
              </Text>
            </VStack>

            {/* Login Card */}
            <Card className="glass-panel" w="full" maxW="md">
              <CardBody p={8}>
                <VStack spacing={6}>
                  {/* Error Alert */}
                  {errors.general && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {errors.general}
                    </Alert>
                  )}

                  {/* OAuth Buttons */}
                  <VStack spacing={3} w="full">
                    <Button
                      variant="outline"
                      size="lg"
                      w="full"
                      leftIcon={<FaGoogle />}
                      onClick={() => handleOAuthLogin('google')}
                      isLoading={isLoading}
                      className="btn btn-outline btn-lg"
                    >
                      Continue with Google
                    </Button>
                    <HStack spacing={3} w="full">
                      <Button
                        variant="outline"
                        size="lg"
                        flex={1}
                        leftIcon={<FaLinkedin />}
                        onClick={() => handleOAuthLogin('linkedin')}
                        isLoading={isLoading}
                        className="btn btn-outline btn-lg"
                      >
                        LinkedIn
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        flex={1}
                        leftIcon={<FiGithub />}
                        onClick={() => handleOAuthLogin('github')}
                        isLoading={isLoading}
                        className="btn btn-outline btn-lg"
                      >
                        GitHub
                      </Button>
                    </HStack>
                  </VStack>

                  {/* Divider */}
                  <HStack w="full">
                    <Divider />
                    <Text color="gray.500" fontSize="sm" whiteSpace="nowrap">
                      Or continue with email
                    </Text>
                    <Divider />
                  </HStack>

                  {/* Login Form */}
                  <Box as="form" onSubmit={handleSubmit} w="full">
                    <VStack spacing={4}>
                      {/* Email Field */}
                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel>Email Address</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FiMail} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            size="lg"
                            className="glass-panel"
                          />
                        </InputGroup>
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                      </FormControl>

                      {/* Password Field */}
                      <FormControl isInvalid={!!errors.password}>
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FiLock} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            size="lg"
                            className="glass-panel"
                          />
                          <InputRightElement>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.400" />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                      </FormControl>

                      {/* Forgot Password */}
                      <HStack w="full" justify="flex-end">
                        <Link 
                          as={RouterLink} 
                          to="/forgot-password" 
                          color="brand.500"
                          fontSize="sm"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          Forgot password?
                        </Link>
                      </HStack>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        variant="solid"
                        colorScheme="brand"
                        size="lg"
                        w="full"
                        isLoading={isLoading}
                        loadingText="Signing in..."
                        className="btn btn-primary btn-lg"
                      >
                        Sign In
                      </Button>
                    </VStack>
                  </Box>

                  {/* Sign Up Link */}
                  <HStack spacing={2}>
                    <Text color="gray.600" fontSize="sm">
                      Don't have an account?
                    </Text>
                    <Link 
                      as={RouterLink} 
                      to="/register" 
                      color="brand.500"
                      fontWeight="semibold"
                      fontSize="sm"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Sign up for free
                    </Link>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Help Text */}
            <Text color="gray.500" fontSize="sm" textAlign="center" maxW="md">
              By signing in, you agree to our{' '}
              <Link color="brand.500" _hover={{ textDecoration: 'underline' }}>
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link color="brand.500" _hover={{ textDecoration: 'underline' }}>
                Privacy Policy
              </Link>
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default LoginPage