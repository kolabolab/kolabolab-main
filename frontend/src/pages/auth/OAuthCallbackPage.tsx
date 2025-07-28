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
          // Decode and validate the token
          const userData = JSON.parse(atob(token));
          
          // SECURITY: Validate user is in registered list
          const registeredUsers = [
            'your-email@gmail.com',
            'admin@kolabolab.com'
          ];
          
          if (!registeredUsers.includes(userData.email)) {
            console.error('SECURITY BREACH: Unregistered user attempted login:', userData.email);
            toast({
              title: 'Access Denied',
              description: `Email ${userData.email} is not registered. Please register first.`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            navigate('/register?error=not_registered');
            return;
          }

          // Store tokens only for registered users
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refreshToken);

          // Set authenticated user
          setAuth(userData, { accessToken: token, refreshToken });
          
          toast({
            title: 'Welcome!',
            description: `Successfully signed in as ${userData.email}`,
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