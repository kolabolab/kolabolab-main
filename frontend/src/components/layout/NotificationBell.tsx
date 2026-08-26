import React from 'react'
import { Box, IconButton } from '@chakra-ui/react'
import { FiBell } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useUnreadCount } from '../../hooks/useNotifications'

/**
 * NotificationBell displays a bell icon with an unread count badge.
 * Clicking navigates to the /notifications page.
 * Uses useUnreadCount() hook for polling-based unread count.
 */
export const NotificationBell: React.FC = () => {
  const navigate = useNavigate()
  const { data } = useUnreadCount()

  const count = data?.unreadCount ?? 0
  const displayCount = count > 99 ? '99+' : String(count)
  const ariaLabel = count > 0
    ? `Notifications, ${count} unread`
    : 'Notifications'

  return (
    <Box position="relative" display="inline-flex">
      <IconButton
        aria-label={ariaLabel}
        icon={<FiBell size="20" />}
        variant="ghost"
        size="md"
        borderRadius="lg"
        onClick={() => navigate('/notifications')}
        _hover={{
          bg: 'interactive-hover',
          transform: 'translateY(-1px)',
        }}
        transition="all 0.2s"
      />
      {count > 0 && (
        <Box
          as="span"
          data-testid="notification-badge"
          position="absolute"
          top="1"
          right="1"
          bg="red.500"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          lineHeight="1"
          minW="18px"
          h="18px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          px="1"
          pointerEvents="none"
          aria-hidden="true"
        >
          {displayCount}
        </Box>
      )}
    </Box>
  )
}
