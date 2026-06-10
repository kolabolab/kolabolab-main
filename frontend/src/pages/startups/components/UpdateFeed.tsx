import React, { useState } from 'react'
import {
  VStack,
  Text,
  Button,
  Skeleton,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
} from '@chakra-ui/react'
import { useStartupUpdates, useDeleteUpdate } from '@/hooks/useStartupUpdates'
import UpdateCard from './UpdateCard'
import UpdateComposeBox from './UpdateComposeBox'

interface UpdateFeedProps {
  startupId: string
  isCreator: boolean
}

const UpdateFeed: React.FC<UpdateFeedProps> = ({ startupId, isCreator }) => {
  const [page, setPage] = useState(1)
  const { data, isLoading, refetch } = useStartupUpdates(startupId, page)
  const deleteUpdate = useDeleteUpdate()
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const handleDeleteClick = (updateId: string) => {
    setDeleteTargetId(updateId)
    onOpen()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    try {
      await deleteUpdate.mutateAsync({ startupId, updateId: deleteTargetId })
      toast({
        title: 'Update deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch {
      toast({
        title: 'Failed to delete update',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
    onClose()
    setDeleteTargetId(null)
  }

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch">
        <Skeleton height="80px" borderRadius="md" />
        <Skeleton height="80px" borderRadius="md" />
        <Skeleton height="80px" borderRadius="md" />
      </VStack>
    )
  }

  const updates = data?.updates || []
  const pagination = data?.pagination

  return (
    <VStack spacing={4} align="stretch">
      {isCreator && (
        <UpdateComposeBox startupId={startupId} onUpdatePosted={() => refetch()} />
      )}

      {updates.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={6}>
          No updates yet.{isCreator ? ' Share your first progress update!' : ''}
        </Text>
      ) : (
        updates.map((update) => (
          <UpdateCard
            key={update.id}
            update={update}
            isCreator={isCreator}
            onDelete={handleDeleteClick}
          />
        ))
      )}

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

      {/* Delete confirmation dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Update
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this update? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={deleteUpdate.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  )
}

export default UpdateFeed
