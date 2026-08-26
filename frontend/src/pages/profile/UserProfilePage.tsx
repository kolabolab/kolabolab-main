import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Tag,
  Wrap,
  WrapItem,
  Button,
  Card,
  CardBody,
  Spinner,
  Link as ChakraLink,
  useColorModeValue,
  useToast,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiEdit2, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile, useUpdateProfile } from '../../hooks/useUserProfile';
import { ProfileEditModal } from './ProfileEditModal';
import { StartupInvolvementList } from './StartupInvolvementList';
import type { ProfileUpdateData } from '../../types/profile';

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { data, isLoading, isError, error } = useUserProfile(id);
  const updateProfile = useUpdateProfile();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const isOwner = currentUser?.id === id;

  const handleSave = (profileData: ProfileUpdateData) => {
    updateProfile.mutate(profileData, {
      onSuccess: () => {
        toast({
          title: 'Profile updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      },
      onError: (err: any) => {
        toast({
          title: 'Failed to update profile',
          description: err?.message || 'Something went wrong',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="interactive-accent" />
      </Box>
    );
  }

  if (isError || !data) {
    const is404 = (error as any)?.status === 404;
    return (
      <Box minH="100vh" bg={bgColor}>
        <Container maxW="4xl" py={16} textAlign="center">
          <VStack spacing={4}>
            <Heading size="lg" color="text-secondary">
              {is404 ? 'User not found' : 'Something went wrong'}
            </Heading>
            <Text color="text-tertiary">
              {is404
                ? 'The profile you are looking for does not exist.'
                : 'Failed to load profile. Please try again later.'}
            </Text>
            <Button as={Link} to="/" colorScheme="brand" variant="outline">
              Go Home
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  const { user: profile, startups } = data;

  return (
    <>
      <Helmet>
        <title>{profile.firstName} {profile.lastName} - KolaboLab</title>
        <meta name="description" content={`${profile.firstName} ${profile.lastName}'s profile on KolaboLab`} />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW="4xl" py={8}>
          <VStack spacing={6} align="stretch">
            {/* Profile Header */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={6} align="start" flexWrap="wrap">
                  <Avatar
                    size="2xl"
                    name={`${profile.firstName} ${profile.lastName}`}
                    src={profile.avatarUrl || undefined}
                  />
                  <VStack align="start" spacing={2} flex={1}>
                    <HStack justify="space-between" w="full" flexWrap="wrap">
                      <Heading size="lg">
                        {profile.firstName} {profile.lastName}
                      </Heading>
                      {isOwner && (
                        <Button
                          leftIcon={<FiEdit2 />}
                          size="sm"
                          colorScheme="brand"
                          variant="outline"
                          onClick={onOpen}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </HStack>

                    {profile.roles.length > 0 && (
                      <Wrap spacing={2}>
                        {profile.roles.map((role) => (
                          <WrapItem key={role}>
                            <Badge colorScheme="brand" variant="subtle">
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    )}

                    {profile.bio && (
                      <Text color="text-secondary" mt={2}>
                        {profile.bio}
                      </Text>
                    )}

                    {profile.linkedinUrl && (
                      <ChakraLink
                        href={profile.linkedinUrl}
                        isExternal
                        color="interactive-accent"
                        fontSize="sm"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        LinkedIn <FiExternalLink />
                      </ChakraLink>
                    )}

                    <Text fontSize="xs" color="text-tertiary">
                      Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Skills */}
            {profile.skills.length > 0 && (
              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="sm" mb={3}>Skills</Heading>
                  <Wrap spacing={2}>
                    {profile.skills.map((skill) => (
                      <WrapItem key={skill}>
                        <Tag size="md" colorScheme="brand" variant="subtle">
                          {skill}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CardBody>
              </Card>
            )}

            {/* Experience */}
            {profile.experience && (
              <Card bg={cardBg}>
                <CardBody>
                  <Heading size="sm" mb={3}>Experience</Heading>
                  <Text color="text-secondary" whiteSpace="pre-wrap">
                    {profile.experience}
                  </Text>
                </CardBody>
              </Card>
            )}

            {/* Startup Involvement */}
            <Card bg={cardBg}>
              <CardBody>
                <StartupInvolvementList startups={startups} />
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      {/* Edit Modal */}
      {isOwner && (
        <ProfileEditModal
          isOpen={isOpen}
          onClose={onClose}
          currentProfile={{
            bio: profile.bio,
            skills: profile.skills,
            experience: profile.experience,
            avatarUrl: profile.avatarUrl,
            linkedinUrl: profile.linkedinUrl,
          }}
          onSave={handleSave}
          isSaving={updateProfile.isPending}
        />
      )}
    </>
  );
};

export default UserProfilePage;
