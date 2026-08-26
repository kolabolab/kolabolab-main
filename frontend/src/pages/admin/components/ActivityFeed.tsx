import React from 'react';
import { Box, Heading, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import type { ActivityEvent } from '../../../types/analytics';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const getEventBadge = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'signup':
      return { label: 'Signup', colorScheme: 'green' };
    case 'startup_created':
      return { label: 'Startup', colorScheme: 'blue' };
    case 'application_submitted':
      return { label: 'Application', colorScheme: 'purple' };
    default:
      return { label: 'Event', colorScheme: 'gray' };
  }
};

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <Box>
        <Heading size="sm" mb={3}>Recent Activity</Heading>
        <Text color="text-tertiary" fontSize="sm">No recent activity</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="sm" mb={3}>Recent Activity</Heading>
      <VStack spacing={2} align="stretch">
        {events.map((event, index) => {
          const badge = getEventBadge(event.type);
          return (
            <HStack
              key={`${event.type}-${event.timestamp}-${index}`}
              spacing={3}
              p={2}
              borderRadius="md"
              _hover={{ bg: 'gray.50' }}
            >
              <Badge colorScheme={badge.colorScheme} fontSize="xs" flexShrink={0}>
                {badge.label}
              </Badge>
              <Text fontSize="sm" flex={1} noOfLines={1}>
                {event.description}
              </Text>
              <Text fontSize="xs" color="text-tertiary" flexShrink={0}>
                {formatRelativeTime(event.timestamp)}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
};

export default ActivityFeed;
