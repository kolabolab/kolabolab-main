import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Collapse,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { COMMITMENT_OPTIONS } from '@/types/roles';

export interface RoleDetailState {
  description: string;
  skillsInput: string;
  commitment: string;
}

export interface RoleExpansionPanelProps {
  roleTitle: string;
  details: RoleDetailState;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (details: RoleDetailState) => void;
  errors?: { description?: string; skills?: string };
}

export const RoleExpansionPanel: React.FC<RoleExpansionPanelProps> = ({
  roleTitle,
  details,
  isExpanded,
  onToggleExpand,
  onChange,
  errors,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const charCountColor = useColorModeValue('gray.500', 'gray.400');

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...details, description: e.target.value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...details, skillsInput: e.target.value });
  };

  const handleCommitmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...details, commitment: e.target.value });
  };

  return (
    <Box
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      bg={cardBg}
      overflow="hidden"
    >
      {/* Collapsible Header */}
      <HStack
        as="button"
        type="button"
        w="full"
        px={4}
        py={3}
        bg={headerBg}
        justify="space-between"
        cursor="pointer"
        onClick={onToggleExpand}
        _hover={{ opacity: 0.8 }}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${roleTitle}`}
      >
        <Text fontWeight="semibold" color={titleColor}>
          {roleTitle}
        </Text>
        <IconButton
          icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          size="sm"
          variant="ghost"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          pointerEvents="none"
        />
      </HStack>

      {/* Collapsible Content */}
      <Collapse in={isExpanded} animateOpacity>
        <VStack spacing={4} p={4} align="stretch">
          {/* Description Field */}
          <FormControl isInvalid={!!errors?.description}>
            <FormLabel fontSize="sm">Description</FormLabel>
            <Textarea
              value={details.description}
              onChange={handleDescriptionChange}
              placeholder="Describe what this role involves..."
              rows={3}
              maxLength={500}
            />
            <HStack justify="space-between" mt={1}>
              {errors?.description ? (
                <FormErrorMessage mt={0}>{errors.description}</FormErrorMessage>
              ) : (
                <Box />
              )}
              <Text fontSize="xs" color={charCountColor}>
                {details.description.length}/500
              </Text>
            </HStack>
          </FormControl>

          {/* Skills Field */}
          <FormControl isInvalid={!!errors?.skills}>
            <FormLabel fontSize="sm">Skills</FormLabel>
            <Input
              value={details.skillsInput}
              onChange={handleSkillsChange}
              placeholder="e.g., React, TypeScript, Node.js"
            />
            {errors?.skills ? (
              <FormErrorMessage>{errors.skills}</FormErrorMessage>
            ) : (
              <Text fontSize="xs" color={charCountColor} mt={1}>
                Comma-separated, max 50 characters each
              </Text>
            )}
          </FormControl>

          {/* Commitment Field */}
          <FormControl>
            <FormLabel fontSize="sm">Commitment</FormLabel>
            <Select
              value={details.commitment}
              onChange={handleCommitmentChange}
              placeholder="Select commitment level"
            >
              {COMMITMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>
        </VStack>
      </Collapse>
    </Box>
  );
};

export default RoleExpansionPanel;
