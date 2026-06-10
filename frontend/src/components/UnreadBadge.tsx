import React from 'react'
import { Box } from '@chakra-ui/react'
import { useMessageUnreadCount } from '../hooks/useMessages'

/**
 * UnreadBadge displays a small red badge with the total unread message count.
 * Hides when the count is zero. Uses polling via useMessageUnreadCount hook.
 */
export const UnreadBadge: React.FC = () => {
  const { data } = useMessageUnreadCount()
  const count = data?.unreadCount ?? 0

  if (count === 0) return null

  const displayCount = count > 99 ? '99+' : String(count)

  return (
    <Box
      as="span"
      data-testid="unread-badge"
      bg="red.500"
      color="white"
      fontSize="xs"
      fontWeight="bold"
      lineHeight="1"
      minW="18px"
      h="18px"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="full"
      px="1"
      ml={1}
      aria-label={`${count} unread messages`}
    >
      {displayCount}
    </Box>
  )
}
