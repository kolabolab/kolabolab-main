import React from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  HStack,
  Heading,
  SimpleGrid,
  Spinner,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiArrowUpRight, FiPieChart } from 'react-icons/fi';
import { PageHeader, PageShell } from '../components/layout/PageHeader';
import { ErrorState } from '../components/ErrorState';
import apiClient from '../services/apiClient';

/**
 * Investments.
 *
 * Was a stub: a centred "Investments Page" title over three cards of hardcoded
 * copy that never called the API.
 *
 * There is no investment-tracking backend yet, so this page does NOT invent a
 * portfolio or fabricate returns. It shows the part that is real — ventures
 * open to funding, from /api/startups/public — and states plainly that
 * position tracking isn't available rather than faking numbers.
 */

interface PublicStartup {
  id: string;
  name: string;
  stage: string;
  fundingGoal: string;
  status: string;
  description: string;
  industry: string;
  location: string;
  teamSize: number;
  tags: string[];
  logo: string;
  featured: boolean;
  lookingFor: unknown[];
}

const VentureCard: React.FC<{ s: PublicStartup }> = ({ s }) => (
  <Card variant="outline" as={RouterLink} to={`/startups/${s.id}`} role="group">
    <CardBody>
      <HStack justify="space-between" align="flex-start" spacing={4} mb={2}>
        <Text fontFamily="heading" fontWeight="700" fontSize="lg" letterSpacing="-0.01em" noOfLines={1}>
          {s.name}
        </Text>
        {s.stage && (
          <Badge colorScheme="accent" flexShrink={0}>
            {s.stage}
          </Badge>
        )}
      </HStack>

      <Text fontSize="sm" color="text-secondary" noOfLines={2} minH="2.6em">
        {s.description || 'No description provided yet.'}
      </Text>

      <HStack spacing={4} mt={4} flexWrap="wrap">
        {s.industry && (
          <Text fontSize="xs" color="text-tertiary">
            {s.industry}
          </Text>
        )}
        {s.location && (
          <Text fontSize="xs" color="text-tertiary">
            {s.location}
          </Text>
        )}
        {s.teamSize > 0 && (
          <Text fontSize="xs" color="text-tertiary">
            {s.teamSize} {s.teamSize === 1 ? 'person' : 'people'}
          </Text>
        )}
      </HStack>

      {s.tags?.length > 0 && (
        <HStack spacing={2} mt={3} flexWrap="wrap">
          {s.tags.slice(0, 3).map((t) => (
            <Tag key={t} size="sm">
              {t}
            </Tag>
          ))}
        </HStack>
      )}
    </CardBody>
  </Card>
);

const InvestmentsPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery<{ startups: PublicStartup[] }>({
    queryKey: ['startups', 'public'],
    queryFn: async () => (await apiClient.get('/api/startups/public')).data,
  });

  const startups = data?.startups ?? [];

  return (
    <>
      <Helmet>
        <title>Investments - KolaboLab</title>
        <meta
          name="description"
          content="Discover ventures open to funding on KolaboLab."
        />
      </Helmet>

      <PageShell>
        <PageHeader
          eyebrow="Capital"
          title="Investments"
          lede="Ventures currently open to funding. Every profile answers the same structured questions, so you're comparing like with like."
          actions={
            <Button
              as={RouterLink}
              to="/search"
              variant="outline"
              rightIcon={<FiArrowUpRight aria-hidden="true" />}
            >
              Search all ventures
            </Button>
          }
        />

        <VStack align="stretch" spacing={{ base: 10, md: 12 }}>
          <Box>
            <HStack spacing={3} mb={4} align="center">
              <Heading as="h2" fontSize="xl" letterSpacing="-0.02em">
                Open to funding
              </Heading>
              {startups.length > 0 && (
                <Badge colorScheme="accent" borderRadius="full">
                  {startups.length}
                </Badge>
              )}
            </HStack>

            {isLoading ? (
              <Box display="flex" justifyContent="center" py={16}>
                <Spinner size="lg" color="accent.500" />
              </Box>
            ) : error ? (
              <ErrorState error={(error as Error).message} onRetry={() => refetch()} />
            ) : startups.length === 0 ? (
              <Card variant="outline">
                <CardBody py={10}>
                  <VStack spacing={3}>
                    <Text color="text-secondary" textAlign="center" maxW="46ch" fontSize="sm">
                      No ventures are open to funding right now. New profiles appear here as
                      founders publish them.
                    </Text>
                    <Button as={RouterLink} to="/startups" variant="outline" size="sm">
                      Browse all startups
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                {startups.map((s) => (
                  <VentureCard key={s.id} s={s} />
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Divider />

          <Box>
            <Heading as="h2" fontSize="xl" letterSpacing="-0.02em" mb={4}>
              Your positions
            </Heading>
            <Card variant="outline">
              <CardBody py={10}>
                <VStack spacing={3}>
                  <Box
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    bg="chakra-subtle-bg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box as={FiPieChart} color="text-tertiary" aria-hidden="true" />
                  </Box>
                  <Text color="text-secondary" textAlign="center" maxW="52ch" fontSize="sm">
                    Position tracking isn't available yet — KolaboLab doesn't record committed
                    capital, so there are no holdings to show. Conversations you start with a
                    founder live in your messages.
                  </Text>
                  <Button as={RouterLink} to="/messages" variant="outline" size="sm">
                    Go to messages
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </VStack>
      </PageShell>
    </>
  );
};

export default InvestmentsPage;
