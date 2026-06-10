import React, { useEffect, useRef } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Button,
  IconButton,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuthStore } from '../../hooks/useAuth'
import {
  useConversationMessages,
  useSendMessage,
  useMarkConversationAsRead,
} from '../../hooks/useMessages'
import MessageBubble from './components/MessageBubble'
import MessageInput from './components/MessageInput'

const ConversationViewPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const { data, isLoading, isError, refetch } = useConversationMessages(conversationId ?? '')
  const sendMessage = useSendMessage()
  const markAsRead = useMarkConversationAsRead(conversationId ?? '')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMarkedRead = useRef(false)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const headerBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Mark conversation as read on load
  useEffect(() => {
    if (data && conversationId && !hasMarkedRead.current) {
      hasMarkedRead.current = true
      markAsRead.mutate()
    }
  }, [data, conversationId, markAsRead])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  const handleSend = async (content: string) => {
    if (!data?.conversation.participantId) return
    await sendMessage.mutateAsync({
      recipientId: data.conversation.participantId,
      content,
    })
  }

  const conversation = data?.conversation
  const messages = data?.messages ?? []

  return (
    <>
      <Helmet>
        <title>
          {conversation ? `Chat with ${conversation.participantName}` : 'Conversation'} - KolaboLab
        </title>
      </Helmet>

      <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
        <Container maxW={{ base: '7xl', '2xl': '90%' }} py={4} flex={1} display="flex" flexDirection="column">
          {/* Header */}
          <Box
            bg={headerBg}
            borderRadius="lg"
            borderBottomRadius={0}
            p={4}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3}>
              <IconButton
                aria-label="Back to messages"
                icon={<FiArrowLeft />}
                variant="ghost"
                size="sm"
                onClick={() => navigate('/messages')}
              />
              {conversation && (
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={conversation.participantName}
                    src={conversation.participantAvatar || undefined}
                  />
                  <Heading size="sm">{conversation.participantName}</Heading>
                </HStack>
              )}
            </HStack>
          </Box>

          {/* Messages Area */}
          <Box
            flex={1}
            bg={cardBg}
            overflowY="auto"
            display="flex"
            flexDirection="column"
          >
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" flex={1} py={8}>
                <Spinner size="lg" color="brand.500" />
              </Box>
            ) : isError ? (
              <VStack spacing={4} py={8} flex={1} justify="center">
                <Text color="red.500">
                  Failed to load messages. Please try again.
                </Text>
                <Button
                  colorScheme="brand"
                  variant="outline"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </VStack>
            ) : messages.length === 0 ? (
              <VStack spacing={4} py={12} flex={1} justify="center" textAlign="center">
                <Text fontSize="lg" color="gray.500">
                  No messages yet. Send the first message to start the conversation.
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} p={4} align="stretch">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === user?.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </VStack>
            )}
          </Box>

          {/* Message Input */}
          <Box
            bg={cardBg}
            borderRadius="lg"
            borderTopRadius={0}
          >
            <MessageInput
              onSend={handleSend}
              isLoading={sendMessage.isPending}
            />
          </Box>
        </Container>
      </Box>
    </>
  )
}

export default ConversationViewPage
