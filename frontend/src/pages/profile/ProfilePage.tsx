import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Textarea,
  Button,
  Avatar,
  AvatarBadge,
  IconButton,
  useColorModeValue,
  useToast,
  SimpleGrid,
  Badge,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiCamera, FiSave, FiUser, FiMail, FiExternalLink } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from '../../components/layout/PageHeader';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RoleSelector } from '../../components/RoleSelector';
import { apiClient } from '../../services/apiClient';

const ProfilePage: React.FC = () => {
  const { user, setAuth, updateUser } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Role editing state
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user?.roles || []);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    company: user?.company || '',
    location: user?.location || '',
    avatar: user?.avatar || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user in auth context
      const updatedUser = {
        ...user!,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        bio: formData.bio,
        company: formData.company,
        location: formData.location,
        avatar: formData.avatar,
      };
      
      // Update auth state
      setAuth(updatedUser, { 
        accessToken: localStorage.getItem('accessToken') || '', 
        refreshToken: localStorage.getItem('refreshToken') || '' 
      });
      
      // Update registered users in localStorage for persistence
      const registeredUsers = {
        'your-email@gmail.com': {
          ...updatedUser,
          id: 'user_001',
          roles: ['entrepreneur', 'user'],
        },
        'admin@kolabolab.com': {
          ...updatedUser,
          id: 'admin_001',
          roles: ['admin', 'moderator', 'user'],
        }
      };
      
      localStorage.setItem('userProfiles', JSON.stringify(registeredUsers));
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      company: user?.company || '',
      location: user?.location || '',
      avatar: user?.avatar || '',
    });
    setIsEditing(false);
  };

  // Avatar is a user-supplied image URL persisted with the rest of the profile.
  // This previously cycled through five hardcoded Unsplash photos of real
  // strangers ("for demo purposes"), which assigned a stock face to the account.
  const handleAvatarPromptChange = () => {
    const next = window.prompt(
      'Paste an image URL for your avatar (leave blank to remove):',
      formData.avatar || ''
    );
    if (next === null) return; // cancelled
    handleInputChange('avatar', next.trim());
  };

  const handleRoleChange = (newRoles: string[]) => {
    // Prevent deselecting the last remaining role
    if (newRoles.length === 0) return;
    setSelectedRoles(newRoles);
  };

  const handleSaveRoles = async () => {
    setIsSavingRoles(true);
    const previousRoles = user?.roles || [];

    try {
      const response = await apiClient.put('/api/user/roles', { roles: selectedRoles });
      const updatedRoles = response.data.roles || selectedRoles;

      // Update auth store with new roles
      updateUser({ roles: updatedRoles });

      toast({
        title: 'Roles Updated',
        description: 'Your roles have been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Revert UI to previous roles
      setSelectedRoles(previousRoles);

      toast({
        title: 'Update Failed',
        description: 'There was an error updating your roles. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSavingRoles(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile Settings - KolaboLab</title>
        <meta name="description" content="Edit your profile and personal information" />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW="4xl" py={8}>
          <VStack spacing={8} align="stretch">
            
            {/* Header */}
            <Box>
              <PageHeader
                eyebrow="Account"
                title="Profile settings"
                lede="Your public identity on KolaboLab, and the roles you operate under."
              />
              {user?.id && (
                <Button
                  as={Link}
                  to={`/users/${user.id}`}
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  mt={3}
                  rightIcon={<FiExternalLink />}
                >
                  View Public Profile
                </Button>
              )}
            </Box>

            {/* Profile Overview Card */}
            <Card bg={cardBg}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Personal Information</Heading>
                  {!isEditing ? (
                    <Button 
                      leftIcon={<FiUser />} 
                      colorScheme="brand" 
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <HStack spacing={2}>
                      <Button 
                        variant="ghost" 
                        onClick={handleCancelEdit}
                        isDisabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button 
                        leftIcon={<FiSave />} 
                        colorScheme="brand"
                        onClick={handleSaveProfile}
                        isLoading={isSaving}
                        loadingText="Saving..."
                      >
                        Save Changes
                      </Button>
                    </HStack>
                  )}
                </HStack>
              </CardHeader>
              
              <CardBody>
                <VStack spacing={6} align="stretch">
                  
                  {/* Avatar Section */}
                  <HStack spacing={6}>
                    <Box position="relative">
                      <Avatar 
                        size="2xl" 
                        name={`${formData.firstName} ${formData.lastName}`}
                        src={formData.avatar}
                      >
                        {isEditing && (
                          <AvatarBadge 
                            as={IconButton}
                            size="sm"
                            rounded="full"
                            top="-10px"
                            colorScheme="brand"
                            aria-label="Change avatar"
                            icon={<FiCamera />}
                            onClick={handleAvatarPromptChange}
                          />
                        )}
                      </Avatar>
                    </Box>
                    
                    <VStack align="start" spacing={1}>
                      <Heading size="lg">
                        {formData.firstName} {formData.lastName}
                      </Heading>
                      <Text color="text-secondary">@{formData.username}</Text>
                      <HStack spacing={2}>
                        {user?.roles?.map((role) => (
                          <Badge 
                            key={role}
                            colorScheme={role === 'admin' ? 'red' : role === 'entrepreneur' ? 'brand' : 'green'} 
                            variant="subtle"
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  </HStack>

                  <Divider />

                  {/* Form Fields */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        isReadOnly={!isEditing}
                        bg={isEditing ? 'bg-surface' : 'chakra-subtle-bg'}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        isReadOnly={!isEditing}
                        bg={isEditing ? 'bg-surface' : 'chakra-subtle-bg'}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Username</FormLabel>
                      <Input
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        isReadOnly={!isEditing}
                        bg={isEditing ? 'bg-surface' : 'chakra-subtle-bg'}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <InputGroup>
                        <Input value={user?.email} isReadOnly bg="chakra-subtle-bg" />
                        <InputRightElement pointerEvents="none" color="text-tertiary">
                          <FiMail aria-hidden="true" />
                        </InputRightElement>
                      </InputGroup>
                      <Text fontSize="sm" color="text-tertiary" mt={1}>
                        Email cannot be changed
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Company</FormLabel>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        isReadOnly={!isEditing}
                        bg={isEditing ? 'bg-surface' : 'chakra-subtle-bg'}
                        placeholder="Your company name"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Location</FormLabel>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        isReadOnly={!isEditing}
                        bg={isEditing ? 'bg-surface' : 'chakra-subtle-bg'}
                        placeholder="City, Country"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Bio</FormLabel>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      isReadOnly={!isEditing}
                      bg={isEditing ? 'bg-surface' : 'chakra-subtle-bg'}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </FormControl>

                  {isEditing && (
                    <Alert status="info">
                      <AlertIcon />
                      Changes will be saved to your profile and visible across the platform.
                    </Alert>
                  )}

                </VStack>
              </CardBody>
            </Card>

            {/* Role Editing Section */}
            <Card bg={cardBg}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Your Roles</Heading>
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="brand"
                    onClick={handleSaveRoles}
                    isLoading={isSavingRoles}
                    loadingText="Saving..."
                    isDisabled={
                      JSON.stringify(selectedRoles.slice().sort()) ===
                      JSON.stringify((user?.roles || []).slice().sort())
                    }
                  >
                    Save
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Text color="text-secondary">
                    Select the roles that describe how you use KolaboLab. At least one role must remain selected.
                  </Text>
                  <RoleSelector
                    selectedRoles={selectedRoles}
                    onChange={handleRoleChange}
                    disabled={isSavingRoles}
                  />
                </VStack>
              </CardBody>
            </Card>

            {/* Account Information */}
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Account Information</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="semibold">Account Status</Text>
                    <Badge colorScheme="success" size="lg">Active</Badge>
                  </VStack>
                  
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="semibold">Email Verified</Text>
                    <Badge colorScheme="success" size="lg">Verified</Badge>
                  </VStack>
                  
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="semibold">Member Since</Text>
                    <Text color="text-secondary">January 2024</Text>
                  </VStack>
                  
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="semibold">User ID</Text>
                    <Text color="text-secondary" fontFamily="mono">{user?.id}</Text>
                  </VStack>
                </SimpleGrid>
              </CardBody>
            </Card>

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default ProfilePage;