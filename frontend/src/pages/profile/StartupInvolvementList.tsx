import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { StartupInvolvement } from '../../types/profile';

interface StartupInvolvementListProps {
  startups: StartupInvolvement;
}

export const StartupInvolvementList: React.FC<StartupInvolvementListProps> = ({ startups }) => {
  const hasCreated = startups.created.length > 0;
  const hasMemberships = startups.memberOf.length > 0;

  if (!hasCreated && !hasMemberships) {
    return (
      <Box>
        <Heading size="sm" mb={3}>Startup Involvement</Heading>
        <Text color="text-tertiary" fontSize="sm">
          No startup involvement yet.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="sm" mb={3}>Startup Involvement</Heading>
      <VStack spacing={3} align="stretch">
        {hasCreated && (
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="text-tertiary" textTransform="uppercase" mb={2}>
              Founded
            </Text>
            <VStack spacing={2} align="stretch">
              {startups.created.map((startup) => (
                <Card key={startup.id} size="sm" variant="outline">
                  <CardBody py={2} px={3}>
                    <HStack justify="space-between">
                      <ChakraLink
                        as={Link}
                        to={`/startups/${startup.id}`}
                        fontWeight="medium"
                        fontSize="sm"
                        color="interactive-accent"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {startup.name}
                      </ChakraLink>
                      <HStack spacing={2}>
                        <Badge size="sm" colorScheme="purple" variant="subtle">
                          {startup.stage}
                        </Badge>
                        <Badge
                          size="sm"
                          colorScheme={startup.status === 'active' ? 'green' : 'gray'}
                          variant="subtle"
                        >
                          {startup.status}
                        </Badge>
                      </HStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>
        )}

        {hasMemberships && (
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="text-tertiary" textTransform="uppercase" mb={2}>
              Team Member
            </Text>
            <VStack spacing={2} align="stretch">
              {startups.memberOf.map((membership) => (
                <Card key={`${membership.id}-${membership.roleTitle}`} size="sm" variant="outline">
                  <CardBody py={2} px={3}>
                    <HStack justify="space-between">
                      <ChakraLink
                        as={Link}
                        to={`/startups/${membership.id}`}
                        fontWeight="medium"
                        fontSize="sm"
                        color="interactive-accent"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {membership.name}
                      </ChakraLink>
                      <Badge size="sm" colorScheme="blue" variant="subtle">
                        {membership.roleTitle}
                      </Badge>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default StartupInvolvementList;
