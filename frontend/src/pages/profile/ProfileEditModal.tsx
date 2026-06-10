import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  VStack,
  Text,
} from '@chakra-ui/react';
import { SkillTagInput } from './SkillTagInput';
import type { ProfileUpdateData } from '../../types/profile';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    bio: string | null;
    skills: string[];
    experience: string | null;
    avatarUrl: string | null;
    linkedinUrl: string | null;
  };
  onSave: (data: ProfileUpdateData) => void;
  isSaving: boolean;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
  isSaving,
}) => {
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [skills, setSkills] = useState<string[]>(currentProfile.skills || []);
  const [experience, setExperience] = useState(currentProfile.experience || '');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatarUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentProfile.linkedinUrl || '');

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setBio(currentProfile.bio || '');
      setSkills(currentProfile.skills || []);
      setExperience(currentProfile.experience || '');
      setAvatarUrl(currentProfile.avatarUrl || '');
      setLinkedinUrl(currentProfile.linkedinUrl || '');
    }
  }, [isOpen, currentProfile]);

  const bioTooLong = bio.length > 2000;
  const experienceTooLong = experience.length > 5000;
  const isInvalid = bioTooLong || experienceTooLong;

  const handleSave = () => {
    const data: ProfileUpdateData = {};
    if (bio !== (currentProfile.bio || '')) data.bio = bio;
    if (JSON.stringify(skills) !== JSON.stringify(currentProfile.skills || [])) data.skills = skills;
    if (experience !== (currentProfile.experience || '')) data.experience = experience;
    if (avatarUrl !== (currentProfile.avatarUrl || '')) data.avatarUrl = avatarUrl;
    if (linkedinUrl !== (currentProfile.linkedinUrl || '')) data.linkedinUrl = linkedinUrl;

    onSave(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5}>
            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
                rows={4}
                isInvalid={bioTooLong}
              />
              <FormHelperText>
                <Text as="span" color={bioTooLong ? 'red.500' : undefined}>
                  {bio.length}/2000
                </Text>
              </FormHelperText>
            </FormControl>

            <SkillTagInput skills={skills} onChange={setSkills} />

            <FormControl>
              <FormLabel>Experience</FormLabel>
              <Textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Describe your professional experience..."
                rows={5}
                isInvalid={experienceTooLong}
              />
              <FormHelperText>
                <Text as="span" color={experienceTooLong ? 'red.500' : undefined}>
                  {experience.length}/5000
                </Text>
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Avatar URL</FormLabel>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <FormHelperText>Must be a valid URL starting with http:// or https://</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>LinkedIn URL</FormLabel>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/yourprofile"
              />
              <FormHelperText>Must start with https://linkedin.com/ or https://www.linkedin.com/</FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSaving}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={isInvalid || isSaving}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileEditModal;
