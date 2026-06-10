import React from 'react';
import { Box, VStack, Text, Button, Icon, useColorModeValue } from '@chakra-ui/react';
import { Rocket } from 'lucide-react';
import { FiPlus } from 'react-icons/fi';

interface EmptyStateStartupsProps {
  onCreateStartup?: () => void;
}

export const EmptyStateStartups: React.FC<EmptyStateStartupsProps> = ({ onCreateStartup }) => {
  const iconBg = useColorModeValue('brand.50', 'brand.900');
  const iconColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box py={12} textAlign="center">
      <VStack spacing={5}>
        <Box
          p={5}
          borderRadius="full"
          bg={iconBg}
        >
          <Icon as={Rocket} boxSize={10} color={iconColor} />
        </Box>

        <VStack spacing={2}>
          <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.700', 'gray.200')}>
            No startups yet
          </Text>
          <Text fontSize="md" color="gray.500" maxW="sm">
            Launch your entrepreneurial journey by creating your first startup on KolaboLab.
          </Text>
        </VStack>

        <Button
          colorScheme="brand"
          size="lg"
          leftIcon={<FiPlus />}
          onClick={onCreateStartup}
          aria-label="Create Your First Startup"
        >
          Create Your First Startup
        </Button>
      </VStack>
    </Box>
  );
};

export default EmptyStateStartups;
