import React from 'react'
import {
  Box,
  HStack,
  Text,
  IconButton,
  Avatar,
} from '@chakra-ui/react'
import { FiTrash2 } from 'react-icons/fi'
import type { StartupUpdate } from '@/types/startupUpdates'

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

interface UpdateCardProps {
  update: StartupUpdate
  isCreator: boolean
  onDelete?: (updateId: string) => void
}

const UpdateCard: React.FC<UpdateCardProps> = ({ update, isCreator, onDelete }) => {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      _dark={{ borderColor: 'gray.600' }}
    >
      <HStack justify="space-between" align="start" mb={2}>
        <HStack spacing={3}>
          <Avatar size="sm" name={update.authorName} />
          <Box>
            <Text fontWeight="semibold" fontSize="sm">
              {update.authorName}
            </Text>
            <Text fontSize="xs" color="text-tertiary">
              {formatRelativeTime(update.createdAt)}
            </Text>
          </Box>
        </HStack>
        {isCreator && onDelete && (
          <IconButton
            aria-label="Delete update"
            icon={<FiTrash2 />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => onDelete(update.id)}
          />
        )}
      </HStack>
      <Text whiteSpace="pre-wrap" fontSize="sm" pl={11}>
        {update.content}
      </Text>
    </Box>
  )
}

export default UpdateCard
