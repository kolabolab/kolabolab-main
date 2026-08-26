import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  FormErrorMessage,
  Checkbox,
  FormHelperText,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { FiGithub } from 'react-icons/fi';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../services/apiClient';

const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { setAuth } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: searchParams.get('email') || '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeToEmails: false,
  });
  const [errors, setErrors] = useState<any>({});

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
      const newErrors: any = {};

      if (!formData.firstName.trim()) newErrors.firstName = 'Please enter First Name';
      if (!formData.lastName.trim()) newErrors.lastName = 'Please enter Last Name';
      if (!formData.email.trim()) {
        newErrors.email = 'Please enter email address';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one letter, one number, and one special character';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'Agree to terms of service';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the centralized register API
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
      });

      toast({
        title: 'Registration Successful!',
        description: `Please check your email (${formData.email}) to verify your account before signing in.`,
        status: 'success',
        duration: 8000,
        isClosable: true,
      });

      // Redirect to email verification page
      navigate(`/verify-email-sent?email=${encodeURIComponent(formData.email)}`);

    } catch (error: any) {
      let errorMessage = 'There was an error creating your account.';
      
      // Handle specific API errors
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    // Get API base URL - production by default, dev only for dev hostnames
    const devHosts = ['kolabolab-api-dev', '0fc93d16', 'localhost', 'kolabolab-dev'];
    const isDev = devHosts.some(h => window.location.hostname.indexOf(h) !== -1);
    const apiBaseUrl = isDev
      ? 'https://kolabolab-api-dev.beryour.workers.dev'
      : 'https://kolabolab-api.beryour.workers.dev';
    
    // Redirect to OAuth provider
    const providerPath = provider.toLowerCase();
    window.location.href = `${apiBaseUrl}/auth/${providerPath}`;
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - KolaboLab</title>
        <meta name="description" content="Join KolaboLab and start your startup collaboration journey" />
      </Helmet>

      <Box minH="100vh" bg={bgColor} py={8}>
        <Container maxW="md">
          <VStack spacing={8}>
            
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" className="gradient-text">
                Join KolaboLab
              </Heading>
              <Text color="text-secondary" fontSize="lg">
                Start your startup collaboration journey today
              </Text>
            </VStack>

            {searchParams.get('error') === 'not_registered' && (
              <Alert status="info">
                <AlertIcon />
                Please register first before using social login.
              </Alert>
            )}

            <Card bg={cardBg} w="full" shadow="xl">
              <CardBody p={8}>
                <VStack spacing={6}>
                  
                  {/* Social Signup Buttons */}
                  <VStack spacing={4} w="full">
                    <Text color="text-secondary" fontSize="sm" textAlign="center">
                      Sign up with your social account
                    </Text>
                    
                    <Box display="flex" justifyContent="center" alignItems="center" gap={3} w="full">
                      <Button
                        leftIcon={<Icon as={FiGithub} w={4} h={4} />}
                        variant="outline"
                        size="md"
                        w="130px"
                        h="44px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => handleSocialSignup('GitHub')}
                        _hover={{ bg: 'blue.50', borderColor: 'blue.400' }}
                        borderColor="blue.300"
                        color="interactive-accent"
                      >
                        GitHub
                      </Button>
                      
                      <Button
                        leftIcon={<Icon as={FaLinkedin} color="#0077B5" w={4} h={4} />}
                        variant="outline"
                        size="md"
                        w="130px"
                        h="44px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => handleSocialSignup('LinkedIn')}
                        _hover={{ bg: 'blue.50', borderColor: '#0077B5' }}
                        borderColor="blue.300"
                        color="interactive-accent"
                      >
                        LinkedIn
                      </Button>
                      
                      <Button
                        leftIcon={<Icon as={FaGoogle} color="#DB4437" w={4} h={4} />}
                        variant="outline"
                        size="md"
                        w="130px"
                        h="44px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => handleSocialSignup('Google')}
                        _hover={{ bg: 'blue.50', borderColor: '#DB4437' }}
                        borderColor="blue.300"
                        color="interactive-accent"
                      >
                        Google
                      </Button>
                    </Box>
                  </VStack>

                  {/* Divider */}
                  <HStack w="full">
                    <Divider />
                    <Text fontSize="sm" color="text-tertiary" px={3} whiteSpace="nowrap">
                      Or sign up with email
                    </Text>
                    <Divider />
                  </HStack>

                <form onSubmit={handleRegister}>
                  <VStack spacing={6}>
                    
                    <FormControl isInvalid={!!errors.firstName}>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                      <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                      <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.username}>
                      <FormLabel>Username</FormLabel>
                      <Input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="johndoe"
                      />
                      <FormErrorMessage>{errors.username}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter your password"
                      />
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.confirmPassword}>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                      />
                      <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                    </FormControl>

                    {/* Email Subscription Checkbox */}
                    <FormControl>
                      <Checkbox
                        isChecked={formData.subscribeToEmails}
                        onChange={(e) => handleInputChange('subscribeToEmails', e.target.checked)}
                        colorScheme="brand"
                      >
                        I would like to receive occasional emails from KolaboLab about events and projects (Optional)
                      </Checkbox>
                    </FormControl>

                    {/* Terms and Conditions Checkbox */}
                    <FormControl isInvalid={!!errors.agreeToTerms}>
                      <Checkbox
                        isChecked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        colorScheme="brand"
                      >
                        I have read and accepted the{' '}
                        <Link color="interactive-accent" href="/terms" target="_blank" textDecoration="underline">
                          Terms of Volunteering
                        </Link>{' '}
                        and{' '}
                        <Link color="interactive-accent" href="/privacy" target="_blank" textDecoration="underline">
                          Privacy Policy
                        </Link>
                      </Checkbox>
                      <FormErrorMessage>{errors.agreeToTerms}</FormErrorMessage>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      w="full"
                      isLoading={isLoading}
                      loadingText="Creating Account..."
                    >
                      Create Account
                    </Button>

                    <Text textAlign="center" color="text-secondary">
                      Already have an account?{' '}
                      <Link as={RouterLink} to="/login" color="interactive-accent" fontWeight="semibold">
                        Sign in here
                      </Link>
                    </Text>

                  </VStack>
                </form>
                
                </VStack>
              </CardBody>
            </Card>

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default RegisterPage;