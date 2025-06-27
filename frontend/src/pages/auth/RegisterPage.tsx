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
  Checkbox,
  Select,
  Textarea,
  RadioGroup,
  Radio,
  useToast,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiGithub, FiMapPin } from 'react-icons/fi'
import { FaGoogle, FaLinkedin } from 'react-icons/fa'
import { Helmet } from 'react-helmet-async'

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'entrepreneur' | 'collaborator' | 'investor' | '';
  location: string;
  experience: string;
  bio: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

interface RegisterErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  location?: string;
  agreeToTerms?: string;
  general?: string;
}

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    location: '',
    experience: '',
    bio: '',
    agreeToTerms: false,
    subscribeNewsletter: true,
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const validateStep = (currentStep: number): boolean => {
    const newErrors: RegisterErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (currentStep === 2) {
      if (!formData.role) newErrors.role = 'Please select your role';
      if (!formData.location) newErrors.location = 'Location is required';
    }

    if (currentStep === 3) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/login?registered=true');
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
      toast({
        title: 'Registration failed',
        description: 'Please try again or contact support.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthRegister = async (provider: 'google' | 'linkedin' | 'github') => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual OAuth implementation
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Registration`,
        description: 'OAuth integration coming soon!',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'OAuth Error',
        description: 'Something went wrong with OAuth registration.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegisterErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'entrepreneur': return '🚀';
      case 'collaborator': return '🤝';
      case 'investor': return '💰';
      default: return '';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'entrepreneur': return 'Launch your startup and find co-founders';
      case 'collaborator': return 'Contribute skills to exciting projects';
      case 'investor': return 'Discover investment opportunities';
      default: return '';
    }
  };

  return (
    <>
      <Helmet>
        <title>Join KolaboLab - Create Your Account</title>
        <meta 
          name="description" 
          content="Join KolaboLab community. Create your account to connect with entrepreneurs, collaborators, and investors." 
        />
      </Helmet>

      <Box className="primary-context" minH="100vh" display="flex" alignItems="center" py={12}>
        <Container maxW="2xl">
          <VStack spacing={8}>
            {/* Header */}
            <VStack spacing={3} textAlign="center">
              <Heading 
                as="h1" 
                fontSize={{ base: '2xl', md: '3xl' }}
                className="gradient-text"
              >
                Join KolaboLab
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Connect with the global startup ecosystem
              </Text>
              
              {/* Progress Steps */}
              <HStack spacing={4} mt={4}>
                {[1, 2, 3].map((stepNumber) => (
                  <HStack key={stepNumber} spacing={2}>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={step >= stepNumber ? 'brand.500' : 'gray.200'}
                      color={step >= stepNumber ? 'white' : 'gray.500'}
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {stepNumber}
                    </Box>
                    <Text 
                      fontSize="sm" 
                      color={step >= stepNumber ? 'brand.500' : 'gray.500'}
                      fontWeight={step === stepNumber ? 'bold' : 'normal'}
                    >
                      {stepNumber === 1 && 'Account'}
                      {stepNumber === 2 && 'Profile'}
                      {stepNumber === 3 && 'Confirm'}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </VStack>

            {/* Registration Card */}
            <Card className="glass-panel" w="full" maxW="2xl">
              <CardBody p={8}>
                <VStack spacing={6}>
                  {/* Error Alert */}
                  {errors.general && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {errors.general}
                    </Alert>
                  )}

                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <>
                      {/* OAuth Buttons */}
                      <VStack spacing={3} w="full">
                        <Button
                          variant="outline"
                          size="lg"
                          w="full"
                          leftIcon={<FaGoogle />}
                          onClick={() => handleOAuthRegister('google')}
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
                            onClick={() => handleOAuthRegister('linkedin')}
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
                            onClick={() => handleOAuthRegister('github')}
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
                          Or create account with email
                        </Text>
                        <Divider />
                      </HStack>

                      {/* Basic Info Form */}
                      <VStack spacing={4} w="full">
                        {/* Name Fields */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                          <FormControl isInvalid={!!errors.firstName}>
                            <FormLabel>First Name</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={FiUser} color="gray.400" />
                              </InputLeftElement>
                              <Input
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleInputChange('firstName')}
                                size="lg"
                                className="glass-panel"
                              />
                            </InputGroup>
                            <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                          </FormControl>

                          <FormControl isInvalid={!!errors.lastName}>
                            <FormLabel>Last Name</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={FiUser} color="gray.400" />
                              </InputLeftElement>
                              <Input
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleInputChange('lastName')}
                                size="lg"
                                className="glass-panel"
                              />
                            </InputGroup>
                            <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>

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

                        {/* Password Fields */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                          <FormControl isInvalid={!!errors.password}>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={FiLock} color="gray.400" />
                              </InputLeftElement>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create password"
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

                          <FormControl isInvalid={!!errors.confirmPassword}>
                            <FormLabel>Confirm Password</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={FiLock} color="gray.400" />
                              </InputLeftElement>
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange('confirmPassword')}
                                size="lg"
                                className="glass-panel"
                              />
                              <InputRightElement>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  <Icon as={showConfirmPassword ? FiEyeOff : FiEye} color="gray.400" />
                                </Button>
                              </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>

                        {/* Next Button */}
                        <Button
                          onClick={handleNext}
                          variant="solid"
                          colorScheme="brand"
                          size="lg"
                          w="full"
                          className="btn btn-primary btn-lg"
                        >
                          Continue
                        </Button>
                      </VStack>
                    </>
                  )}

                  {/* Step 2: Profile Information */}
                  {step === 2 && (
                    <VStack spacing={6} w="full">
                      <Heading size="md" textAlign="center">Tell us about yourself</Heading>
                      
                      {/* Role Selection */}
                      <FormControl isInvalid={!!errors.role}>
                        <FormLabel>What describes you best?</FormLabel>
                        <RadioGroup value={formData.role} onChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}>
                          <VStack spacing={3} align="stretch">
                            {(['entrepreneur', 'collaborator', 'investor'] as const).map((role) => (
                              <Card 
                                key={role}
                                variant={formData.role === role ? 'solid' : 'outline'}
                                colorScheme={formData.role === role ? 'brand' : undefined}
                                cursor="pointer"
                                onClick={() => setFormData(prev => ({ ...prev, role }))}
                                _hover={{ borderColor: 'brand.300' }}
                              >
                                <CardBody p={4}>
                                  <HStack spacing={3}>
                                    <Radio value={role} size="lg" />
                                    <Box>
                                      <HStack spacing={2}>
                                        <Text fontSize="lg">{getRoleIcon(role)}</Text>
                                        <Text fontWeight="semibold" textTransform="capitalize">
                                          {role}
                                        </Text>
                                      </HStack>
                                      <Text fontSize="sm" color="gray.600">
                                        {getRoleDescription(role)}
                                      </Text>
                                    </Box>
                                  </HStack>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </RadioGroup>
                        <FormErrorMessage>{errors.role}</FormErrorMessage>
                      </FormControl>

                      {/* Location and Experience */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl isInvalid={!!errors.location}>
                          <FormLabel>Location</FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={FiMapPin} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="City, Country"
                              value={formData.location}
                              onChange={handleInputChange('location')}
                              size="lg"
                              className="glass-panel"
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.location}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Experience Level</FormLabel>
                          <Select
                            placeholder="Select experience"
                            value={formData.experience}
                            onChange={handleInputChange('experience')}
                            size="lg"
                            className="glass-panel"
                          >
                            <option value="beginner">Beginner (0-2 years)</option>
                            <option value="intermediate">Intermediate (3-5 years)</option>
                            <option value="experienced">Experienced (6-10 years)</option>
                            <option value="expert">Expert (10+ years)</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      {/* Bio */}
                      <FormControl>
                        <FormLabel>Tell us about yourself (Optional)</FormLabel>
                        <Textarea
                          placeholder="Share your background, interests, or what you're looking for..."
                          value={formData.bio}
                          onChange={handleInputChange('bio')}
                          rows={4}
                          className="glass-panel"
                        />
                      </FormControl>

                      {/* Navigation Buttons */}
                      <HStack spacing={4} w="full">
                        <Button
                          onClick={handleBack}
                          variant="outline"
                          size="lg"
                          flex={1}
                          className="btn btn-outline btn-lg"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleNext}
                          variant="solid"
                          colorScheme="brand"
                          size="lg"
                          flex={1}
                          className="btn btn-primary btn-lg"
                        >
                          Continue
                        </Button>
                      </HStack>
                    </VStack>
                  )}

                  {/* Step 3: Confirmation */}
                  {step === 3 && (
                    <VStack spacing={6} w="full">
                      <Heading size="md" textAlign="center">Almost there!</Heading>
                      
                      {/* Summary */}
                      <Card variant="outline" w="full">
                        <CardBody p={6}>
                          <VStack spacing={4} align="start">
                            <HStack spacing={3}>
                              <Text fontWeight="semibold">Name:</Text>
                              <Text>{formData.firstName} {formData.lastName}</Text>
                            </HStack>
                            <HStack spacing={3}>
                              <Text fontWeight="semibold">Email:</Text>
                              <Text>{formData.email}</Text>
                            </HStack>
                            <HStack spacing={3}>
                              <Text fontWeight="semibold">Role:</Text>
                              <Badge colorScheme="brand" px={3} py={1}>
                                {getRoleIcon(formData.role)} {formData.role}
                              </Badge>
                            </HStack>
                            <HStack spacing={3}>
                              <Text fontWeight="semibold">Location:</Text>
                              <Text>{formData.location}</Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Terms and Conditions */}
                      <VStack spacing={4} w="full">
                        <FormControl isInvalid={!!errors.agreeToTerms}>
                          <Checkbox
                            isChecked={formData.agreeToTerms}
                            onChange={handleInputChange('agreeToTerms')}
                            size="lg"
                          >
                            <Text fontSize="sm">
                              I agree to the{' '}
                              <Link color="brand.500" _hover={{ textDecoration: 'underline' }}>
                                Terms of Service
                              </Link>
                              {' '}and{' '}
                              <Link color="brand.500" _hover={{ textDecoration: 'underline' }}>
                                Privacy Policy
                              </Link>
                            </Text>
                          </Checkbox>
                          <FormErrorMessage>{errors.agreeToTerms}</FormErrorMessage>
                        </FormControl>

                        <Checkbox
                          isChecked={formData.subscribeNewsletter}
                          onChange={handleInputChange('subscribeNewsletter')}
                        >
                          <Text fontSize="sm" color="gray.600">
                            Subscribe to our newsletter for updates and opportunities
                          </Text>
                        </Checkbox>
                      </VStack>

                      {/* Final Submit */}
                      <Box as="form" onSubmit={handleSubmit} w="full">
                        <VStack spacing={4}>
                          <HStack spacing={4} w="full">
                            <Button
                              onClick={handleBack}
                              variant="outline"
                              size="lg"
                              flex={1}
                              className="btn btn-outline btn-lg"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              variant="solid"
                              colorScheme="brand"
                              size="lg"
                              flex={1}
                              isLoading={isLoading}
                              loadingText="Creating account..."
                              className="btn btn-primary btn-lg"
                            >
                              Create Account
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  )}

                  {/* Login Link */}
                  <HStack spacing={2}>
                    <Text color="gray.600" fontSize="sm">
                      Already have an account?
                    </Text>
                    <Link 
                      as={RouterLink} 
                      to="/login" 
                      color="brand.500"
                      fontWeight="semibold"
                      fontSize="sm"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Sign in
                    </Link>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default RegisterPage