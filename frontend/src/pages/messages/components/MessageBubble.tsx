import React from 'react'
import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import type { MessageWithSender } from '../../../types/messages'

function formatMessageTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  if (diffDays === 0) return timeStr
  if (diffDays === 1) return `Yesterday ${timeStr}`
  if (diffDays < 7) {
    const dayName = date.toLocaleDateString([], { weekday: 'short' })
    return `${dayName} ${timeStr}`
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` ${timeStr}`
}

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const ownBg = useColorModeValue('brand.500', 'brand.600')
  const ownColor = 'white'
  const otherBg = useColorModeValue('gray.100', 'gray.700')
  const otherColor = useColorModeValue('gray.800', 'gray.100')
  const timestampColor = useColorModeValue(
    isOwn ? 'whiteAlpha.800' : 'gray.500',
    isOwn ? 'whiteAlpha.700' : 'gray.400'
  )

  return (
    <Box
      display="flex"
      justifyContent={isOwn ? 'flex-end' : 'flex-start'}
      w="full"
    >
      <VStack
        align={isOwn ? 'flex-end' : 'flex-start'}
        spacing={1}
        maxW="70%"
      >
        {!isOwn && (
          <Text fontSize="xs" color="text-tertiary" fontWeight="medium" px={1}>
            {message.senderName}
          </Text>
        )}
        <Box
          bg={isOwn ? ownBg : otherBg}
          color={isOwn ? ownColor : otherColor}
          px={4}
          py={2}
          borderRadius="lg"
          borderBottomRightRadius={isOwn ? 'sm' : 'lg'}
          borderBottomLeftRadius={isOwn ? 'lg' : 'sm'}
          wordBreak="break-word"
          whiteSpace="pre-wrap"
        >
          <Text fontSize="sm">{message.content}</Text>
        </Box>
        <Text fontSize="xs" color={timestampColor} px={1}>
          {formatMessageTime(message.createdAt)}
        </Text>
      </VStack>
    </Box>
  )
}

export default MessageBubble
