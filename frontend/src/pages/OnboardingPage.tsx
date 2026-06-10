import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/apiClient';
import { RoleSelector } from '../components/RoleSelector';

const OnboardingPage: React.FC = () => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/onboarding/complete', {
        roles: selectedRoles,
      });

      const { user } = response.data;
      updateUser({
        roles: user.roles,
        onboardingCompleted: true,
      });

      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Onboarding - KolaboLab</title>
        <meta
          name="description"
          content="Select your roles to personalize your KolaboLab experience"
        />
      </Helmet>

      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center">
        <Container maxW="4xl" py={12}>
          <VStack spacing={10} align="stretch">
            <Heading size="xl" textAlign="center">
              What brings you to KolaboLab?
            </Heading>

            <RoleSelector
              selectedRoles={selectedRoles}
              onChange={setSelectedRoles}
              disabled={isSubmitting}
            />

            <VStack spacing={4} align="stretch">
              <Button
                colorScheme="brand"
                size="lg"
                isDisabled={selectedRoles.length === 0}
                isLoading={isSubmitting}
                loadingText="Saving..."
                onClick={handleSubmit}
                alignSelf="center"
                px={12}
              >
                Continue
              </Button>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription flex="1">{error}</AlertDescription>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={handleSubmit}
                    ml={2}
                  >
                    Try Again
                  </Button>
                </Alert>
              )}
            </VStack>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default OnboardingPage;
