import React, { useState } from 'react'
import {
  VStack,
  Box,
  HStack,
  Text,
  Badge,
  Avatar,
  Button,
  Skeleton,
} from '@chakra-ui/react'
import { useDashboardFeed } from '@/hooks/useStartupUpdates'

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const DashboardFeed: React.FC = () => {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useDashboardFeed(page)

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch">
        <Skeleton height="80px" borderRadius="md" />
        <Skeleton height="80px" borderRadius="md" />
      </VStack>
    )
  }

  const updates = data?.updates || []
  const pagination = data?.pagination

  if (updates.length === 0) {
    return (
      <Text color="gray.500" textAlign="center" py={4}>
        No recent updates from your startups.
      </Text>
    )
  }

  return (
    <VStack spacing={3} align="stretch">
      {updates.map((update) => (
        <Box
          key={update.id}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor="gray.200"
          _dark={{ borderColor: 'gray.600' }}
        >
          <HStack justify="space-between" mb={2}>
            <HStack spacing={3}>
              <Avatar size="sm" name={update.authorName} />
              <Box>
                <HStack spacing={2}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {update.authorName}
                  </Text>
                  <Badge colorScheme="brand" fontSize="xs">
                    {update.startupName}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {formatRelativeTime(update.createdAt)}
                </Text>
              </Box>
            </HStack>
          </HStack>
          <Text whiteSpace="pre-wrap" fontSize="sm" pl={11}>
            {update.content}
          </Text>
        </Box>
      ))}

      {pagination && pagination.totalPages > 1 && (
        <Button
          variant="outline"
          size="sm"
          alignSelf="center"
          onClick={() => setPage((p) => p + 1)}
          isDisabled={page >= pagination.totalPages}
        >
          {page >= pagination.totalPages ? 'No more updates' : 'Load more'}
        </Button>
      )}
    </VStack>
  )
}

export default DashboardFeed
