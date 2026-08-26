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
      const accessToken = searchParams.get('access');
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
          // Decode and validate the token (base64 user data)
          const userData = JSON.parse(atob(token));
          
          // Basic validation of user data structure
          if (!userData.email || !userData.id) {
            throw new Error('Invalid user data received from OAuth provider');
          }

          // Ensure onboardingCompleted is a boolean (default to false if missing)
          const user = {
            ...userData,
            onboardingCompleted: userData.onboardingCompleted ?? false,
            roles: userData.roles ?? [],
          };

          // Store the real JWT access token (or fall back to the base64 token)
          const jwtToken = accessToken || token;
          localStorage.setItem('accessToken', jwtToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Set authenticated user
          setAuth(user, { accessToken: jwtToken, refreshToken });
          
          toast({
            title: 'Welcome!',
            description: `Successfully signed in as ${user.email}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          navigate('/dashboard');
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
      bg="chakra-subtle-bg"
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="interactive-accent" thickness="4px" />
        <Text fontSize="lg" color="text-secondary">
          Completing your sign in...
        </Text>
      </VStack>
    </Box>
  );
};

export default OAuthCallbackPage;