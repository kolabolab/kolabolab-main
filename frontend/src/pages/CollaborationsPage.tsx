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
import { FiArrowUpRight, FiUsers } from 'react-icons/fi';
import { PageHeader, PageShell } from '../components/layout/PageHeader';
import { ErrorState } from '../components/ErrorState';
import { useMyApplications, useReceivedApplications } from '../hooks/useApplications';
import type { ApplicationWithDetails } from '../types/applications';

/**
 * Collaborations.
 *
 * This page used to be a stub: a centred "Collaborations Page" title over three
 * cards with hardcoded copy ("You don't have any active collaborations yet")
 * that never called the API, so it said the same thing regardless of data.
 *
 * There is no /api/collaborations endpoint, but a collaboration IS an accepted
 * application — either one you submitted that was accepted, or one submitted to
 * your startup that you accepted. So this is composed from the two real
 * endpoints that do exist.
 */

const RelationCard: React.FC<{
  app: ApplicationWithDetails;
  /** 'outgoing' = I applied to them. 'incoming' = they applied to my startup. */
  direction: 'outgoing' | 'incoming';
}> = ({ app, direction }) => (
  <Card variant="outline">
    <CardBody>
      <HStack justify="space-between" align="flex-start" spacing={4} mb={3}>
        <Box minW="0">
          <Text fontFamily="heading" fontWeight="700" fontSize="lg" letterSpacing="-0.01em">
            {direction === 'outgoing' ? app.startupName : app.applicantName}
          </Text>
          <Text fontSize="sm" color="text-secondary">
            {app.roleTitle}
            {direction === 'incoming' && ` · ${app.startupName}`}
          </Text>
        </Box>
        <Badge colorScheme={app.status === 'accepted' ? 'success' : 'gray'}>
          {app.status}
        </Badge>
      </HStack>
      {app.message && (
        <Text fontSize="sm" color="text-secondary" noOfLines={2} mb={3}>
          {app.message}
        </Text>
      )}
      {app.highlightedSkills?.length > 0 && (
        <HStack spacing={2} flexWrap="wrap">
          {app.highlightedSkills.slice(0, 4).map((s) => (
            <Tag key={s} size="sm">
              {s}
            </Tag>
          ))}
        </HStack>
      )}
    </CardBody>
  </Card>
);

const Section: React.FC<{
  title: string;
  count?: number;
  children: React.ReactNode;
}> = ({ title, count, children }) => (
  <Box>
    <HStack spacing={3} mb={4} align="center">
      <Heading as="h2" fontSize="xl" letterSpacing="-0.02em">
        {title}
      </Heading>
      {typeof count === 'number' && count > 0 && (
        <Badge colorScheme="accent" borderRadius="full">
          {count}
        </Badge>
      )}
    </HStack>
    {children}
  </Box>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
          <Box as={FiUsers} color="text-tertiary" aria-hidden="true" />
        </Box>
        <Text color="text-secondary" textAlign="center" maxW="46ch" fontSize="sm">
          {children}
        </Text>
      </VStack>
    </CardBody>
  </Card>
);

const CollaborationsPage: React.FC = () => {
  const mine = useMyApplications();
  const received = useReceivedApplications();

  const myApps = mine.data?.applications ?? [];
  const receivedApps = received.data?.applications ?? [];

  const activeOutgoing = myApps.filter((a) => a.status === 'accepted');
  const activeIncoming = receivedApps.filter((a) => a.status === 'accepted');
  const pendingIncoming = receivedApps.filter((a) => a.status === 'pending');

  const isLoading = mine.isLoading || received.isLoading;
  const error = (mine.error || received.error) as Error | null;
  const activeCount = activeOutgoing.length + activeIncoming.length;

  return (
    <>
      <Helmet>
        <title>Collaborations - KolaboLab</title>
        <meta
          name="description"
          content="Your active collaborations and incoming requests on KolaboLab."
        />
      </Helmet>

      <PageShell>
        <PageHeader
          eyebrow="Working together"
          title="Collaborations"
          lede="Accepted applications — both the teams you've joined and the people who joined yours."
          actions={
            <Button
              as={RouterLink}
              to="/startups"
              variant="outline"
              rightIcon={<FiArrowUpRight aria-hidden="true" />}
            >
              Find a team
            </Button>
          }
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={16}>
            <Spinner size="lg" color="accent.500" />
          </Box>
        ) : error ? (
          <ErrorState
            error={error.message}
            onRetry={() => {
              mine.refetch();
              received.refetch();
            }}
          />
        ) : (
          <VStack align="stretch" spacing={{ base: 10, md: 12 }}>
            <Section title="Active collaborations" count={activeCount}>
              {activeCount === 0 ? (
                <Empty>
                  Nothing active yet. When an application is accepted — yours or one to your
                  startup — it appears here.
                </Empty>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {activeOutgoing.map((a) => (
                    <RelationCard key={a.id} app={a} direction="outgoing" />
                  ))}
                  {activeIncoming.map((a) => (
                    <RelationCard key={a.id} app={a} direction="incoming" />
                  ))}
                </SimpleGrid>
              )}
            </Section>

            <Divider />

            <Section title="Requests to your startups" count={pendingIncoming.length}>
              {pendingIncoming.length === 0 ? (
                <Empty>
                  No pending requests. Applications to your startups show up here for you to
                  accept or decline.
                </Empty>
              ) : (
                <>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} mb={4}>
                    {pendingIncoming.slice(0, 4).map((a) => (
                      <RelationCard key={a.id} app={a} direction="incoming" />
                    ))}
                  </SimpleGrid>
                  <Button as={RouterLink} to="/applications/received" variant="outline" size="sm">
                    Review all requests
                  </Button>
                </>
              )}
            </Section>
          </VStack>
        )}
      </PageShell>
    </>
  );
};

export default CollaborationsPage;
