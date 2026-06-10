import React, { useState } from 'react'
import {
  Box,
  Textarea,
  Button,
  HStack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useCreateUpdate } from '@/hooks/useStartupUpdates'

const MAX_CHARS = 2000

interface UpdateComposeBoxProps {
  startupId: string
  onUpdatePosted: () => void
}

const UpdateComposeBox: React.FC<UpdateComposeBoxProps> = ({ startupId, onUpdatePosted }) => {
  const [content, setContent] = useState('')
  const toast = useToast()
  const createUpdate = useCreateUpdate()

  const trimmedLength = content.trim().length
  const isDisabled = trimmedLength === 0 || content.length > MAX_CHARS

  const handlePost = async () => {
    if (isDisabled) return

    try {
      await createUpdate.mutateAsync({ startupId, content: content.trim() })
      setContent('')
      onUpdatePosted()
      toast({
        title: 'Update posted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch {
      toast({
        title: 'Failed to post update',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200" _dark={{ borderColor: 'gray.600' }}>
      <Textarea
        placeholder="Share a progress update..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        resize="vertical"
        minH="100px"
        mb={2}
      />
      <HStack justify="space-between">
        <Text fontSize="xs" color={content.length > MAX_CHARS ? 'red.500' : 'gray.500'}>
          {content.length}/{MAX_CHARS}
        </Text>
        <Button
          size="sm"
          colorScheme="brand"
          onClick={handlePost}
          isDisabled={isDisabled}
          isLoading={createUpdate.isPending}
        >
          Post Update
        </Button>
      </HStack>
    </Box>
  )
}

export default UpdateComposeBox
