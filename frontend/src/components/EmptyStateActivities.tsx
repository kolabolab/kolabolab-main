import React from 'react'
import { Box, VStack, Text, Icon, useColorModeValue } from '@chakra-ui/react'
import { FiClock } from 'react-icons/fi'

export const EmptyStateActivities: React.FC = () => {
  const iconColor = useColorModeValue('gray.400', 'gray.500')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const subtextColor = useColorModeValue('gray.500', 'gray.500')

  return (
    <Box py={10} textAlign="center">
      <VStack spacing={3}>
        <Icon as={FiClock} boxSize={10} color={iconColor} />
        <Text fontSize="lg" fontWeight="medium" color={textColor}>
          No recent activity
        </Text>
        <Text fontSize="sm" color={subtextColor}>
          Your activity feed will appear here as you interact with the platform.
        </Text>
      </VStack>
    </Box>
  )
}
