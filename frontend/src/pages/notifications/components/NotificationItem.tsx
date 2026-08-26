import React from 'react'
import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FiInbox,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useMarkAsRead } from '../../../hooks/useNotifications'
import type { Notification, NotificationType } from '../../../types/notifications'

const typeIconMap: Record<NotificationType, React.ComponentType> = {
  application_received: FiInbox,
  application_accepted: FiCheck,
  application_rejected: FiX,
  new_message: FiMessageSquare,
  startup_approved: FiCheckCircle,
  startup_rejected: FiAlertCircle,
}

const typeColorMap: Record<NotificationType, string> = {
  application_received: 'blue.500',
  application_accepted: 'green.500',
  application_rejected: 'red.500',
  new_message: 'purple.500',
  startup_approved: 'green.500',
  startup_rejected: 'orange.500',
}

function getNavigationTarget(type: NotificationType, referenceId: string): string {
  switch (type) {
    case 'application_received':
      return '/applications/received'
    case 'application_accepted':
    case 'application_rejected':
      return '/applications/mine'
    case 'new_message':
      return '/messages'
    case 'startup_approved':
    case 'startup_rejected':
      return `/startups/${referenceId}`
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

interface NotificationItemProps {
  notification: Notification
  onRead?: () => void
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
}) => {
  const navigate = useNavigate()
  const markAsRead = useMarkAsRead()

  const unreadBg = useColorModeValue('brand.50', 'blue.900')
  const readBg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  const handleClick = async () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id)
      onRead?.()
    }
    const target = getNavigationTarget(notification.type, notification.referenceId)
    navigate(target)
  }

  const iconComponent = typeIconMap[notification.type]
  const iconColor = typeColorMap[notification.type]

  return (
    <Box
      as="button"
      w="100%"
      textAlign="left"
      p={4}
      borderRadius="md"
      bg={notification.isRead ? readBg : unreadBg}
      _hover={{ bg: hoverBg, transform: 'translateX(2px)' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={handleClick}
      role="button"
      aria-label={`${notification.isRead ? '' : 'Unread: '}${notification.title}`}
    >
      <HStack spacing={4} align="start">
        <Icon
          as={iconComponent}
          boxSize={5}
          color={iconColor}
          mt={1}
          flexShrink={0}
        />
        <VStack align="start" spacing={1} flex={1} minW={0}>
          <Text
            fontWeight={notification.isRead ? 'normal' : 'bold'}
            fontSize="sm"
            noOfLines={1}
          >
            {notification.title}
          </Text>
          <Text
            fontSize="sm"
            color="text-secondary"
            noOfLines={2}
          >
            {notification.message}
          </Text>
        </VStack>
        <Text
          fontSize="xs"
          color="text-tertiary"
          flexShrink={0}
          whiteSpace="nowrap"
        >
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </HStack>
    </Box>
  )
}
