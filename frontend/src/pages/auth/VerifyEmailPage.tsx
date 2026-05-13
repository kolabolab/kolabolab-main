import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  Button,
  useColorModeValue,
  useToast,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { setAuth } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      setUserEmail(email);

      try {
        // Simulate API verification delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if verification token exists and is valid
        const pendingVerifications = JSON.parse(localStorage.getItem('pendingVerifications') || '{}');
        const verification = pendingVerifications[email];

        if (!verification || verification.token !== token) {
          setVerificationStatus('error');
          setErrorMessage('Invalid or expired verification token. Please request a new verification email.');
          return;
        }

        // Get user profiles
        const savedProfiles = localStorage.getItem('userProfiles');
        let userProfiles: any = {};
        
        if (savedProfiles) {
          userProfiles = JSON.parse(savedProfiles);
        }

        const user = userProfiles[email];
        if (!user) {
          setVerificationStatus('error');
          setErrorMessage('User account not found. Please register again.');
          return;
        }

        // Mark user as verified
        const verifiedUser = {
          ...user,
          isEmailVerified: true,
          emailVerifiedAt: new Date().toISOString(),
        };

        // Update user profiles
        userProfiles[email] = verifiedUser;
        localStorage.setItem('userProfiles', JSON.stringify(userProfiles));

        // Remove from pending verifications
        delete pendingVerifications[email];
        localStorage.setItem('pendingVerifications', JSON.stringify(pendingVerifications));

        // Create tokens and log user in
        const mockTokens = {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
        };

        localStorage.setItem('accessToken', mockTokens.accessToken);
        localStorage.setItem('refreshToken', mockTokens.refreshToken);

        // Set authentication state
        setAuth(verifiedUser, mockTokens);

        setVerificationStatus('success');

        toast({
          title: 'Email Verified Successfully!',
          description: `Welcome to KolaboLab, ${verifiedUser.firstName}! Your account is now active.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast, setAuth]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRequestNewLink = () => {
    navigate(`/verify-email-sent?email=${encodeURIComponent(userEmail)}`);
  };

  return (
    <>
      <Helmet>
        <title>Email Verification - KolaboLab</title>
        <meta name="description" content="Verifying your email address" />
      </Helmet>

      <Box minH="100vh" bg={bgColor} py={8}>
        <Container maxW="md">
          <VStack spacing={8}>

            <Card bg={cardBg} w="full" shadow="xl">
              <CardBody p={8} textAlign="center">
                <VStack spacing={6}>
                  
                  {verificationStatus === 'loading' && (
                    <>
                      <Spinner size="xl" color="brand.500" thickness="4px" />
                      <Heading size="lg">Verifying Your Email</Heading>
                      <Text color="gray.600">
                        Please wait while we verify your email address...
                      </Text>
                    </>
                  )}

                  {verificationStatus === 'success' && (
                    <>
                      <Icon as={FiCheckCircle} boxSize={16} color="green.500" />
                      <Heading size="lg" color="green.600">
                        Email Verified Successfully!
                      </Heading>
                      <Text color="gray.600" fontSize="lg">
                        Your account has been activated. You will be redirected to your dashboard shortly.
                      </Text>
                      <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        Welcome to KolaboLab! Your account is now ready to use.
                      </Alert>
                      <Button
                        rightIcon={<FiArrowRight />}
                        colorScheme="success"
                        size="lg"
                        onClick={handleGoToDashboard}
                      >
                        Go to Dashboard
                      </Button>
                    </>
                  )}

                  {verificationStatus === 'error' && (
                    <>
                      <Icon as={FiXCircle} boxSize={16} color="red.500" />
                      <Heading size="lg" color="red.600">
                        Verification Failed
                      </Heading>
                      <Text color="gray.600" fontSize="lg">
                        {errorMessage}
                      </Text>
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Box textAlign="left">
                          <Text fontWeight="bold">What can you do?</Text>
                          <Text fontSize="sm">
                            • Check if you clicked the correct link from your email
                            • Request a new verification email
                            • Contact support if the problem persists
                          </Text>
                        </Box>
                      </Alert>
                      <VStack spacing={3} w="full">
                        <Button
                          colorScheme="brand"
                          variant="outline"
                          onClick={handleRequestNewLink}
                          w="full"
                        >
                          Request New Verification Email
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate('/login')}
                          w="full"
                        >
                          Back to Login
                        </Button>
                      </VStack>
                    </>
                  )}

                </VStack>
              </CardBody>
            </Card>

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default VerifyEmailPage;