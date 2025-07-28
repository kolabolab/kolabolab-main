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
  InputGroup,
  InputRightElement,
  Button,
  IconButton,
  Checkbox,
  Link,
  Divider,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  FormErrorMessage,
  Select,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  company: string;
  location: string;
  role: string;
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { setAuth } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: searchParams.get('email') || '',
    username: '',
    password: '',
    confirmPassword: '',
    company: '',
    location: '',
    role: 'entrepreneur',
    agreeToTerms: false,
  });

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
      // Check if user already exists
      const savedProfiles = localStorage.getItem('userProfiles');
      let existingUsers: any = {};
      
      if (savedProfiles) {
        try {
          existingUsers = JSON.parse(savedProfiles);
        } catch (error) {
          console.error('Error parsing saved profiles:', error);
        }
      }

      if (existingUsers[formData.email]) {
        throw new Error('An account with this email already exists. Please login instead.');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new user profile
      const newUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: [formData.role, 'user'],
        avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1472099645785-5658abf4ff4e' : '1494790108755-2616b612b786'}?w=150&h=150&fit=crop&crop=face`,
        bio: `${formData.role === 'entrepreneur' ? 'Entrepreneur' : 'Investor'} passionate about innovation and collaboration.`,
        company: formData.company || 'Startup Enthusiast',
        location: formData.location || 'Global',
        isEmailVerified: true,
      };

      // Save to localStorage
      const updatedProfiles = {
        ...existingUsers,
        [formData.email]: newUser
      };
      localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));

      // Create mock tokens
      const mockTokens = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };

      // Store tokens
      localStorage.setItem('accessToken', mockTokens.accessToken);
      localStorage.setItem('refreshToken', mockTokens.refreshToken);

      // Set authentication state
      setAuth(newUser, mockTokens);

      toast({
        title: 'Registration Successful!',
        description: `Welcome to KolaboLab, ${formData.firstName}! Your account has been created.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'There was an error creating your account. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
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
            
            {/* Header */}
            <VStack spacing={4} textAlign="center">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                alignSelf="flex-start"
                as={RouterLink}
                to="/"
              >
                Back to Home
              </Button>
              
              <Heading size="xl" className="gradient-text">
                Join KolaboLab
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Start your startup collaboration journey today
              </Text>
            </VStack>

            {/* Error Alert */}
            {searchParams.get('error') === 'not_registered' && (
              <Alert status="info">
                <AlertIcon />
                Please register first before using social login.
              </Alert>
            )}

            {/* Registration Form */}
            <Card bg={cardBg} w="full" shadow="xl">
              <CardBody p={8}>
                <form onSubmit={handleRegister}>
                  <VStack spacing={6}>
                    
                    {/* Name Fields */}
                    <HStack spacing={4} w="full">
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
                    </HStack>

                    {/* Email */}
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email Address</FormLabel>
                      <InputGroup>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="john@example.com"
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    {/* Username */}
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

                    {/* Password */}
                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter your password"
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>

                    {/* Confirm Password */}
                    <FormControl isInvalid={!!errors.confirmPassword}>
                      <FormLabel>Confirm Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                    </FormControl>

                    {/* Optional Fields */}
                    <HStack spacing={4} w="full">
                      <FormControl>
                        <FormLabel>Company (Optional)</FormLabel>
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Your Company"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Location (Optional)</FormLabel>
                        <Input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="City, Country"
                        />
                      </FormControl>
                    </HStack>

                    {/* Role Selection */}
                    <FormControl>
                      <FormLabel>I am a...</FormLabel>
                      <Select
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                      >
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="investor">Investor</option>
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="mentor">Mentor</option>
                      </Select>
                    </FormControl>

                    {/* Terms and Conditions */}
                    <FormControl isInvalid={!!errors.agreeToTerms}>
                      <Checkbox
                        isChecked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      >
                        I agree to the{' '}
                        <Link color="brand.500" href="/terms" target="_blank">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link color="brand.500" href="/privacy" target="_blank">
                          Privacy Policy
                        </Link>
                      </Checkbox>
                      <FormErrorMessage>{errors.agreeToTerms}</FormErrorMessage>
                    </FormControl>

                    {/* Submit Button */}
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

                    {/* Login Link */}
                    <Text textAlign="center" color="gray.600">
                      Already have an account?{' '}
                      <Link as={RouterLink} to="/login" color="brand.500" fontWeight="semibold">
                        Sign in here
                      </Link>
                    </Text>

                  </VStack>
                </form>
              </CardBody>
            </Card>

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default RegisterPage;