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
import { authAPI } from '../../services/apiClient';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const result = await authAPI.verifyEmail(token);
        
        if (result.message === 'Email verified successfully' || result.message === 'Email is already verified') {
          setVerificationStatus('success');
          toast({
            title: 'Email Verified!',
            description: 'Your account is now fully active. You can now log in.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Redirect to login after 3 seconds (user needs to sign in)
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(error?.message || error?.details?.error || 'Verification failed. The link may be expired.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast]);

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const result = await authAPI.resendVerification();
      toast({
        title: 'Verification email sent!',
        description: 'Check your inbox for the new verification link.',
        status: 'success',
        duration: 8000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Could not resend verification email. Please log in first.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setResendLoading(false);
    }
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
                      <Spinner size="xl" color="interactive-accent" thickness="4px" />
                      <Heading size="lg">Verifying Your Email</Heading>
                      <Text color="text-secondary">
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
                      <Text color="text-secondary" fontSize="lg">
                        Your account is now active. You'll be redirected to sign in shortly.
                      </Text>
                      <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        Your email is verified! Please sign in to access your account.
                      </Alert>
                      <Button
                        rightIcon={<FiArrowRight />}
                        colorScheme="green"
                        size="lg"
                        onClick={() => navigate('/login')}
                      >
                        Sign In Now
                      </Button>
                    </>
                  )}

                  {verificationStatus === 'error' && (
                    <>
                      <Icon as={FiXCircle} boxSize={16} color="text-error" />
                      <Heading size="lg" color="red.600">
                        Verification Failed
                      </Heading>
                      <Text color="text-secondary" fontSize="lg">
                        {errorMessage}
                      </Text>
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Box textAlign="left">
                          <Text fontWeight="bold">What can you do?</Text>
                          <Text fontSize="sm">
                            • Check if you clicked the correct link from your email<br/>
                            • Request a new verification email below<br/>
                            • Log in first if you need to resend
                          </Text>
                        </Box>
                      </Alert>
                      <VStack spacing={3} w="full">
                        <Button
                          colorScheme="brand"
                          onClick={handleResend}
                          isLoading={resendLoading}
                          loadingText="Sending..."
                          w="full"
                        >
                          Resend Verification Email
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
