import React, { useState } from 'react';
import {
  Box,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react';

interface SkillTagInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  maxLength?: number;
}

export const SkillTagInput: React.FC<SkillTagInputProps> = ({
  skills,
  onChange,
  maxSkills = 30,
  maxLength = 50,
}) => {
  const [inputValue, setInputValue] = useState('');

  const addSkill = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed.length > maxLength) return;
    if (skills.length >= maxSkills) return;
    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) return;

    onChange([...skills, trimmed]);
    setInputValue('');
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      parts.forEach((part, i) => {
        if (i < parts.length - 1) {
          addSkill(part);
        } else {
          setInputValue(part);
        }
      });
    } else {
      setInputValue(val);
    }
  };

  return (
    <FormControl>
      <FormLabel>Skills</FormLabel>
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={2}
        minH="80px"
      >
        <Wrap spacing={2} mb={skills.length > 0 ? 2 : 0}>
          {skills.map((skill, index) => (
            <WrapItem key={`${skill}-${index}`}>
              <Tag size="md" colorScheme="brand" variant="subtle">
                <TagLabel>{skill}</TagLabel>
                <TagCloseButton onClick={() => removeSkill(index)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
        <Input
          variant="unstyled"
          placeholder={skills.length >= maxSkills ? 'Max skills reached' : 'Type a skill and press Enter...'}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          isDisabled={skills.length >= maxSkills}
          size="sm"
          px={1}
        />
      </Box>
      <FormHelperText>
        <Text as="span" color={skills.length >= maxSkills ? 'red.500' : undefined}>
          {skills.length}/{maxSkills} skills
        </Text>
        {' · '}Press Enter or comma to add
      </FormHelperText>
    </FormControl>
  );
};

export default SkillTagInput;
