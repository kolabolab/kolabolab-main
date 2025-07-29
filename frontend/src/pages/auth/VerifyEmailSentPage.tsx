import React from 'react';
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
  Icon,
  Alert,
  AlertIcon,
  Link,
} from '@chakra-ui/react';
import { FiMail, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const VerifyEmailSentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleResendEmail = async () => {
    try {
      // Call backend API to resend verification email via Resend
      const response = await fetch('http://localhost:3001/auth/resend-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          firstName: 'User', // You might want to store this in localStorage during registration
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update localStorage with new token
        const pendingVerifications = JSON.parse(localStorage.getItem('pendingVerifications') || '{}');
        if (pendingVerifications[email]) {
          pendingVerifications[email].token = result.verificationToken;
          pendingVerifications[email].sentAt = new Date().toISOString();
          localStorage.setItem('pendingVerifications', JSON.stringify(pendingVerifications));
        }

        alert('Verification email resent successfully! Please check your email.');
        console.log('Verification email resent via Resend API');
      } else {
        alert(`Failed to resend email: ${result.error}`);
        console.error('Failed to resend verification email:', result.error);
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Error resending verification email. Please try again later.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Check Your Email - KolaboLab</title>
        <meta name="description" content="Please verify your email address to complete registration" />
      </Helmet>

      <Box minH="100vh" bg={bgColor} py={8}>
        <Container maxW="md">
          <VStack spacing={8}>
            
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              alignSelf="flex-start"
              as={RouterLink}
              to="/login"
            >
              Back to Login
            </Button>

            <Card bg={cardBg} w="full" shadow="xl">
              <CardBody p={8} textAlign="center">
                <VStack spacing={6}>
                  
                  <Icon as={FiMail} boxSize={16} color="brand.500" />
                  
                  <Heading size="lg" color="brand.600">
                    Check Your Email
                  </Heading>
                  
                  <Text color="gray.600" fontSize="lg" lineHeight="tall">
                    We've sent a verification link to:
                  </Text>
                  
                  <Text fontWeight="bold" fontSize="lg" color="brand.600">
                    {email}
                  </Text>
                  
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Please verify your email</Text>
                      <Text fontSize="sm">
                        Click the verification link in your email to activate your account and access your dashboard.
                      </Text>
                    </Box>
                  </Alert>
                  
                  <VStack spacing={4} w="full">
                    <Text color="gray.600" fontSize="sm">
                      Didn't receive the email? Check your spam folder or:
                    </Text>
                    
                    <Button
                      leftIcon={<FiRefreshCw />}
                      variant="outline"
                      colorScheme="brand"
                      onClick={handleResendEmail}
                      w="full"
                    >
                      Resend Verification Email
                    </Button>
                  </VStack>
                  
                  <Text fontSize="sm" color="gray.500">
                    Need help?{' '}
                    <Link color="brand.500" href="mailto:support@kolabolab.com">
                      Contact Support
                    </Link>
                  </Text>
                  
                </VStack>
              </CardBody>
            </Card>

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default VerifyEmailSentPage;