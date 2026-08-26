import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Button,
  Text,
  Icon,
  IconButton,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  Badge,
  Collapse,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiX, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { SearchFilters } from '../../../hooks/useStartupSearch';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string | string[]) => void;
  onClearFilters: () => void;
  total: number;
  loading: boolean;
}

const INDUSTRIES = [
  'FinTech',
  'HealthTech',
  'EdTech',
  'CleanTech',
  'AI/ML',
  'SaaS',
  'E-commerce',
  'Social Impact',
  'AgriTech',
  'Blockchain',
  'Cybersecurity',
  'Other',
];

const STAGES = ['Idea', 'MVP', 'Early Stage', 'Growth', 'Scale'];

const ROLE_TYPES = ['equity', 'volunteer', 'paid', 'hybrid', 'internship'];

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  total,
  loading,
}) => {
  const { isOpen: showAdvanced, onToggle: toggleAdvanced } = useDisclosure({ defaultIsOpen: false });
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const activeFilterCount = [
    filters.q ? 1 : 0,
    filters.industry ? 1 : 0,
    filters.stage.length > 0 ? 1 : 0,
    filters.roleType.length > 0 ? 1 : 0,
    filters.skills.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Box w="full" maxW="4xl">
      <VStack spacing={4} align="stretch">
        {/* Search Input */}
        <InputGroup size="lg">
          <InputLeftElement>
            <Icon as={FiSearch} color="text-tertiary" aria-hidden="true" />
          </InputLeftElement>
          <Input
            placeholder="Search startups, technologies, or industries..."
            value={filters.q}
            onChange={(e) => onFilterChange('q', e.target.value)}
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
            aria-label="Search startups"
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--brand-ink, #232838)',
            }}
          />
          {filters.q && (
            <InputRightElement>
              <IconButton
                aria-label="Clear search"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                onClick={() => onFilterChange('q', '')}
              />
            </InputRightElement>
          )}
        </InputGroup>

        {/* Filter Row */}
        <HStack
          spacing={4}
          w="full"
          flexWrap="wrap"
          justify="center"
          align="center"
        >
          <HStack spacing={2}>
            <Icon as={FiFilter} color="text-tertiary" aria-hidden="true" />
            <Text fontSize="sm" color="text-secondary">
              Filters:
            </Text>
            {hasActiveFilters && (
              <Badge colorScheme="brand" borderRadius="full" px={2}>
                {activeFilterCount}
              </Badge>
            )}
          </HStack>

          {/* Industry Dropdown */}
          <Select
            placeholder="All Industries"
            value={filters.industry}
            onChange={(e) => onFilterChange('industry', e.target.value)}
            maxW={{ base: 'full', md: '180px' }}
            size="sm"
            aria-label="Filter by industry"
          >
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </Select>

          {/* Advanced Filters Toggle */}
          <Button
            size="sm"
            variant="ghost"
            rightIcon={showAdvanced ? <FiChevronUp /> : <FiChevronDown />}
            onClick={toggleAdvanced}
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters"
          >
            More Filters
          </Button>

          {/* Clear All */}
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              leftIcon={<FiX />}
              onClick={onClearFilters}
            >
              Clear all filters
            </Button>
          )}
        </HStack>

        {/* Advanced Filters */}
        <Collapse in={showAdvanced} animateOpacity>
          <Box
            id="advanced-filters"
            p={4}
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
          >
            <VStack spacing={4} align="stretch">
              {/* Stage Multi-Select */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2} color="text-secondary">
                  Stage
                </Text>
                <CheckboxGroup
                  value={filters.stage}
                  onChange={(values) => onFilterChange('stage', values as string[])}
                >
                  <Wrap spacing={3}>
                    {STAGES.map((stage) => (
                      <WrapItem key={stage}>
                        <Checkbox value={stage} size="sm">
                          {stage}
                        </Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
              </Box>

              {/* Role Type Multi-Select */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2} color="text-secondary">
                  Role Type
                </Text>
                <CheckboxGroup
                  value={filters.roleType}
                  onChange={(values) => onFilterChange('roleType', values as string[])}
                >
                  <Wrap spacing={3}>
                    {ROLE_TYPES.map((role) => (
                      <WrapItem key={role}>
                        <Checkbox value={role} size="sm" textTransform="capitalize">
                          {role}
                        </Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
              </Box>

              {/* Skills Input */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2} color="text-secondary">
                  Skills (comma-separated)
                </Text>
                <Input
                  placeholder="e.g. React, Python, Machine Learning"
                  value={filters.skills.join(', ')}
                  onChange={(e) => {
                    const skills = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    onFilterChange('skills', skills);
                  }}
                  size="sm"
                  aria-label="Filter by skills"
                />
              </Box>
            </VStack>
          </Box>
        </Collapse>

        {/* Result Count */}
        <Text fontSize="sm" color="text-tertiary" textAlign="center">
          {loading ? 'Searching...' : `${total} startup${total !== 1 ? 's' : ''} found`}
        </Text>
      </VStack>
    </Box>
  );
};

export default FilterPanel;
