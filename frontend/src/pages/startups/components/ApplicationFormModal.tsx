import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Text,
  VStack,
  HStack,
  CheckboxGroup,
  Checkbox,
  useToast,
} from '@chakra-ui/react'
import { useSubmitApplication } from '../../../hooks/useApplications'

interface ApplicationFormModalProps {
  isOpen: boolean
  onClose: () => void
  startupId: string
  roleTitle: string
  roleSkills: string[]
}

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  startupId,
  roleTitle,
  roleSkills,
}) => {
  const [message, setMessage] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const toast = useToast()
  const submitApplication = useSubmitApplication()

  const messageLength = message.length
  const isMessageTooShort = messageLength > 0 && messageLength < 10
  const isSubmitDisabled =
    messageLength < 10 || messageLength > 1000 || submitApplication.isPending

  const resetForm = () => {
    setMessage('')
    setSelectedSkills([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    try {
      await submitApplication.mutateAsync({
        startupId,
        roleTitle,
        message: message.trim(),
        highlightedSkills: selectedSkills.length > 0 ? selectedSkills : undefined,
      })

      toast({
        title: 'Application submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      resetForm()
      onClose()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'

      toast({
        title: 'Application failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Apply for {roleTitle}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel>Your Message</FormLabel>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the startup why you're a great fit for this role..."
                rows={6}
                maxLength={1000}
              />
              <HStack justify="space-between" mt={1}>
                {isMessageTooShort ? (
                  <FormHelperText color="red.500">
                    Minimum 10 characters required
                  </FormHelperText>
                ) : (
                  <FormHelperText>&nbsp;</FormHelperText>
                )}
                <Text fontSize="sm" color="gray.500">
                  {messageLength}/1000
                </Text>
              </HStack>
            </FormControl>

            {roleSkills.length > 0 && (
              <FormControl>
                <FormLabel>Highlight Your Skills</FormLabel>
                <CheckboxGroup
                  value={selectedSkills}
                  onChange={(values) => setSelectedSkills(values as string[])}
                >
                  <VStack align="start" spacing={2}>
                    {roleSkills.map((skill) => (
                      <Checkbox key={skill} value={skill} colorScheme="brand">
                        {skill}
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSubmit}
              isDisabled={isSubmitDisabled}
              isLoading={submitApplication.isPending}
              loadingText="Submitting"
            >
              Submit Application
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ApplicationFormModal
