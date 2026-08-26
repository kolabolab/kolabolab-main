import React from 'react';
import { SimpleGrid, Box, VStack, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { Rocket, Users, TrendingUp } from 'lucide-react';

interface RoleOption {
  id: 'entrepreneur' | 'collaborator' | 'investor';
  title: string;
  description: string;
  icon: React.ComponentType;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'I want to create and grow a startup',
    icon: Rocket,
  },
  {
    id: 'collaborator',
    title: 'Collaborator',
    description: 'I have skills and want to join a startup team',
    icon: Users,
  },
  {
    id: 'investor',
    title: 'Investor',
    description: 'I want to discover and invest in startups',
    icon: TrendingUp,
  },
];

export interface RoleSelectorProps {
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRoles,
  onChange,
  disabled = false,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const selectedBg = useColorModeValue('brand.50', 'brand.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBorderColor = useColorModeValue('brand.500', 'accent.400');
  const iconColor = useColorModeValue('gray.400', 'gray.500');
  const selectedIconColor = useColorModeValue('brand.500', 'accent.300');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  // gray.500 measured 4.47:1 on the selected-card background — just under AA.
  const descColor = useColorModeValue('gray.600', 'gray.300');

  const handleToggle = (roleId: string) => {
    if (disabled) return;

    if (selectedRoles.includes(roleId)) {
      onChange(selectedRoles.filter((r) => r !== roleId));
    } else {
      onChange([...selectedRoles, roleId]);
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
      {ROLE_OPTIONS.map((role) => {
        const isSelected = selectedRoles.includes(role.id);

        return (
          <Box
            key={role.id}
            as="button"
            type="button"
            onClick={() => handleToggle(role.id)}
            disabled={disabled}
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor={isSelected ? selectedBorderColor : borderColor}
            bg={isSelected ? selectedBg : cardBg}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            opacity={disabled ? 0.6 : 1}
            transition="all 0.2s ease"
            _hover={
              disabled
                ? {}
                : {
                    borderColor: selectedBorderColor,
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }
            }
            _focusVisible={{
              outline: '3px solid',
              outlineColor: 'accent.500',
              outlineOffset: '2px',
            }}
            textAlign="center"
            aria-pressed={isSelected}
            aria-label={`${role.title}: ${role.description}`}
          >
            <VStack spacing={3}>
              <Icon
                as={role.icon}
                boxSize={10}
                color={isSelected ? selectedIconColor : iconColor}
              />
              <Text fontSize="lg" fontWeight="semibold" color={titleColor}>
                {role.title}
              </Text>
              <Text fontSize="sm" color={descColor}>
                {role.description}
              </Text>
            </VStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};

export default RoleSelector;
