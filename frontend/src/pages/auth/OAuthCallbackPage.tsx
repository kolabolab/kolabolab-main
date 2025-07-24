import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Spinner, Text, VStack, useToast } from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { setAuth } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: 'Authentication Failed',
          description: 'There was an error signing in with your social account. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
        return;
      }

      if (token && refreshToken) {
        try {
          // Store tokens
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refreshToken);

          // Fetch user profile
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = await response.json();
            setAuth(user, token);
            
            toast({
              title: 'Welcome!',
              description: 'You have been successfully signed in.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });

            navigate('/dashboard');
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: 'Authentication Error',
            description: 'There was an error completing your sign in. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/login');
        }
      } else {
        toast({
          title: 'Invalid Authentication',
          description: 'No authentication tokens received. Please try signing in again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast, setAuth]);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">
          Completing your sign in...
        </Text>
      </VStack>
    </Box>
  );
};

export default OAuthCallbackPage;