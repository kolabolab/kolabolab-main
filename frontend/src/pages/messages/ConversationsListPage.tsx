import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Badge,
  Spinner,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useConversations } from '../../hooks/useMessages'
import type { ConversationListItem } from '../../types/messages'

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function truncateMessage(message: string, maxLength = 50): string {
  if (message.length <= maxLength) return message
  return message.slice(0, maxLength) + '…'
}

const ConversationsListPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useConversations()
  const navigate = useNavigate()

  const cardBg = useColorModeValue('white', 'gray.800')
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  const conversations = data?.conversations ?? []

  return (
    <>
      <Helmet>
        <title>Messages - KolaboLab</title>
        <meta name="description" content="View your conversations" />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW={{ base: '7xl', '2xl': '90%' }} py={8}>
          <VStack spacing={8} align="stretch">
            {/* Page Header */}
            <Box>
              <Heading size="xl" className="gradient-text">
                Messages
              </Heading>
              <Text color="gray.600" fontSize="lg" mt={2}>
                Your conversations
              </Text>
            </Box>

            {/* Conversations List */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" py={8}>
                    <Spinner size="lg" color="brand.500" />
                  </Box>
                ) : isError ? (
                  <VStack spacing={4} py={8}>
                    <Text color="red.500">
                      Failed to load conversations. Please try again.
                    </Text>
                    <Button
                      colorScheme="brand"
                      variant="outline"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </VStack>
                ) : conversations.length === 0 ? (
                  <VStack spacing={4} py={12} textAlign="center">
                    <Text fontSize="lg" color="gray.500">
                      No conversations yet. Connect with others to start messaging.
                    </Text>
                  </VStack>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {conversations.map((conversation: ConversationListItem) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        hoverBg={hoverBg}
                        onClick={() => navigate(`/messages/${conversation.id}`)}
                      />
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

interface ConversationItemProps {
  conversation: ConversationListItem
  hoverBg: string
  onClick: () => void
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, hoverBg, onClick }) => {
  const unreadBg = useColorModeValue('brand.50', 'blue.900')
  const readBg = useColorModeValue('white', 'gray.800')

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      p={4}
      borderRadius="md"
      bg={conversation.unreadCount > 0 ? unreadBg : readBg}
      _hover={{ bg: hoverBg, transform: 'translateX(2px)' }}
      transition="all 0.2s"
      cursor="pointer"
      _focus={{ boxShadow: 'outline' }}
    >
      <HStack spacing={4} align="center">
        <Avatar
          size="md"
          name={conversation.participantName}
          src={conversation.participantAvatar || undefined}
        />
        <VStack align="start" spacing={0} flex={1} minW={0}>
          <HStack spacing={2} w="full" justify="space-between">
            <Text
              fontWeight="bold"
              fontSize="sm"
              noOfLines={1}
            >
              {conversation.participantName}
            </Text>
            <Text fontSize="xs" color="gray.500" flexShrink={0} whiteSpace="nowrap">
              {formatRelativeTime(conversation.lastActivityAt)}
            </Text>
          </HStack>
          <HStack spacing={2} w="full" justify="space-between">
            <Text
              fontSize="sm"
              color="gray.600"
              noOfLines={1}
              flex={1}
            >
              {truncateMessage(conversation.lastMessage)}
            </Text>
            {conversation.unreadCount > 0 && (
              <Badge
                colorScheme="brand"
                borderRadius="full"
                px={2}
                fontSize="xs"
                flexShrink={0}
              >
                {conversation.unreadCount}
              </Badge>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  )
}

export default ConversationsListPage
