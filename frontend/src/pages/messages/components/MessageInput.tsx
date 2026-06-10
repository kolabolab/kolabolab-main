import React, { useState, useRef } from 'react'
import {
  HStack,
  Textarea,
  IconButton,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiSend } from 'react-icons/fi'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  isLoading: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading }) => {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const toast = useToast()

  const inputBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const isDisabled = !content.trim() || isSending || isLoading

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed) return

    setIsSending(true)
    try {
      await onSend(trimmed)
      setContent('')
    } catch {
      toast({
        title: 'Failed to send message',
        description: 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isDisabled) {
        handleSend()
      }
    }
  }

  return (
    <HStack
      spacing={2}
      p={3}
      borderTop="1px solid"
      borderColor={borderColor}
      bg={inputBg}
    >
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        resize="none"
        rows={1}
        minH="40px"
        maxH="120px"
        overflow="auto"
        disabled={isSending || isLoading}
        aria-label="Message input"
      />
      <IconButton
        aria-label="Send message"
        icon={<FiSend />}
        colorScheme="brand"
        onClick={handleSend}
        isDisabled={isDisabled}
        isLoading={isSending || isLoading}
        size="md"
        borderRadius="full"
      />
    </HStack>
  )
}

export default MessageInput
