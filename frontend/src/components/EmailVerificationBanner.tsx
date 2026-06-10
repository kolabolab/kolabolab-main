import React, { useState } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  useToast,
  CloseButton,
  Box,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/apiClient';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't render if user is verified or banner is dismissed
  if (!user || user.isEmailVerified || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const result = await authAPI.resendVerification();
      toast({
        title: 'Verification link generated',
        description: `Verification URL: ${result.verificationUrl}`,
        status: 'success',
        duration: 15000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to resend verification',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Alert status="warning" borderRadius="md" mb={4}>
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>Email not verified</AlertTitle>
        <AlertDescription>
          Please verify your email address to unlock all features (creating startups, applying to roles, sending messages).
        </AlertDescription>
      </Box>
      <HStack spacing={2}>
        <Button
          size="sm"
          colorScheme="orange"
          variant="solid"
          onClick={handleResend}
          isLoading={isLoading}
          loadingText="Sending..."
        >
          Resend Verification
        </Button>
        <CloseButton onClick={() => setIsDismissed(true)} />
      </HStack>
    </Alert>
  );
};

export default EmailVerificationBanner;
