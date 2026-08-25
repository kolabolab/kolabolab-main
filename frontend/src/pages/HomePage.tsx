import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  SimpleGrid,
  Icon,
  Badge,
  Flex,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FiArrowRight,
  FiArrowUpRight,
  FiGlobe,
  FiMic,
  FiShield,
  FiType,
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

/**
 * KolaboLab landing — "Three sides, one table."
 *
 * Design thesis: this is a three-sided market (founders / collaborators /
 * investors). The page is built around that convergence rather than the
 * centered-hero + three-identical-cards template.
 *
 * Layout rules used here:
 *  - Asymmetric editorial grid. Nothing is centre-stacked.
 *  - One accent (iris) for interaction, lime reserved for signal moments.
 *  - Content is visible by default; motion is a progressive enhancement.
 */

type Role = 'founder' | 'collaborator' | 'investor';

const ROLES: Record<
  Role,
  { label: string; lede: string; cta: string; to: string; sideNote: string }
> = {
  founder: {
    label: 'I’m building',
    lede:
      'Publish what you’re actually building and get matched with collaborators and backers who care about the problem — not your alma mater.',
    cta: 'Start your startup',
    to: '/register',
    sideNote: 'Founders keep full control of what’s public.',
  },
  collaborator: {
    label: 'I want to build',
    lede:
      'Show the work, not the résumé. Get surfaced for roles that match what you can do, with translation and screen-reader support in the core.',
    cta: 'Find work worth doing',
    to: '/register',
    sideNote: 'Skills are matched before names are shown.',
  },
  investor: {
    label: 'I back builders',
    lede:
      'See ventures at the moment they become investable, with a consistent signal set instead of whatever the warm intro happened to mention.',
    cta: 'Browse ventures',
    to: '/startups',
    sideNote: 'Every venture answers the same questions.',
  },
};

const SIDES: Array<{ tag: Role; title: string; blurb: string; offset: number }> = [
  {
    tag: 'founder',
    title: 'Founders',
    blurb: 'Bring the problem and the plan.',
    offset: 0,
  },
  {
    tag: 'collaborator',
    title: 'Collaborators',
    blurb: 'Bring the craft that ships it.',
    offset: 28,
  },
  {
    tag: 'investor',
    title: 'Investors',
    blurb: 'Bring the runway to scale it.',
    offset: 12,
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Publish the substance',
    body:
      'A venture profile answers the same structured questions for everyone: the problem, the stage, what’s missing. No pitch-deck theatre.',
  },
  {
    n: '02',
    title: 'Match on merit',
    body:
      'Matching reads skills, stage and intent — deliberately not seniority signals or who shares your network. Same questions, same surface, for everyone.',
  },
  {
    n: '03',
    title: 'Move to real work',
    body:
      'Applications, threads and investment conversations live in one place, so a promising match becomes a working relationship instead of a dead inbox.',
  },
];

const ACCESS = [
  { icon: FiGlobe, title: 'Real-time translation', body: 'Collaborate across languages without switching tools.' },
  { icon: FiMic, title: 'Voice input', body: 'Dictate profiles and messages end to end.' },
  { icon: FiType, title: 'Screen-reader native', body: 'Semantics and focus order are part of the build, not a retrofit.' },
  { icon: FiShield, title: 'WCAG 2.2 AA', body: 'Contrast and target sizes are enforced in the test suite.' },
];

/** The convergence diagram: three sides meeting at one node. */
const ConvergenceDiagram: React.FC<{ active: Role; onPick: (r: Role) => void }> = ({
  active,
  onPick,
}) => {
  const spine = useColorModeValue('rgba(9,10,15,0.14)', 'rgba(255,255,255,0.16)');
  return (
    <Box position="relative" pl={{ base: 6, md: 10 }} py={2} role="group">
      {/* vertical spine */}
      <Box
        position="absolute"
        left={{ base: '10px', md: '14px' }}
        top="14%"
        bottom="14%"
        w="2px"
        bg={spine}
        aria-hidden="true"
      />
      {/* convergence node */}
      <Box
        position="absolute"
        left={{ base: '3px', md: '7px' }}
        top="50%"
        transform="translateY(-50%)"
        w="16px"
        h="16px"
        borderRadius="full"
        bg="accent.500"
        boxShadow="0 0 0 5px var(--chakra-colors-accent-100)"
        aria-hidden="true"
      />
      <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
        {SIDES.map((s) => {
          const isActive = s.tag === active;
          return (
            <Box
              key={s.tag}
              as="button"
              type="button"
              onClick={() => onPick(s.tag)}
              aria-pressed={isActive}
              textAlign="left"
              position="relative"
              ml={{ base: 0, md: `${s.offset}px` }}
              bg="bg-surface"
              border="1px solid"
              borderColor={isActive ? 'accent.400' : 'border-subtle'}
              borderRadius="lg"
              px={{ base: 4, md: 5 }}
              py={{ base: 3, md: 4 }}
              boxShadow={isActive ? 'lg' : 'sm'}
              transform={isActive ? 'translateX(6px)' : 'none'}
              transition="all 0.2s cubic-bezier(0.4,0,0.2,1)"
              _hover={{ borderColor: 'accent.300', transform: 'translateX(6px)' }}
              _focusVisible={{
                outline: '2px solid transparent',
                boxShadow: '0 0 0 3px rgba(107,110,242,0.4)',
              }}
            >
              {/* connector stub back to the spine */}
              <Box
                position="absolute"
                left={{ base: '-24px', md: `-${s.offset + 26}px` }}
                top="50%"
                h="2px"
                w={{ base: '24px', md: `${s.offset + 26}px` }}
                bg={isActive ? 'accent.400' : spine}
                aria-hidden="true"
              />
              <HStack justify="space-between" align="center" spacing={4}>
                <Box>
                  <Text
                    fontFamily="heading"
                    fontWeight="700"
                    fontSize={{ base: 'md', md: 'lg' }}
                    letterSpacing="-0.01em"
                  >
                    {s.title}
                  </Text>
                  <Text fontSize="sm" color="text-secondary">
                    {s.blurb}
                  </Text>
                </Box>
                <Icon
                  as={FiArrowUpRight}
                  boxSize={4}
                  color={isActive ? 'accent.500' : 'text-tertiary'}
                  aria-hidden="true"
                />
              </HStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

const HomePage: React.FC = () => {
  const [role, setRole] = useState<Role>('founder');
  const active = ROLES[role];
  const inkPanel = useColorModeValue('brand.600', 'brand.800');

  return (
    <>
      <Helmet>
        <title>KolaboLab — Three sides, one table</title>
        <meta
          name="description"
          content="KolaboLab matches founders, collaborators and investors on what they've actually built. Accessibility and translation in the core, not bolted on."
        />
      </Helmet>

      <Box as="main" id="main-content">
        {/* ---------------------------------------------------------------- hero */}
        <Box borderBottom="1px solid" borderColor="border-subtle">
          <Container maxW="7xl" px={{ base: 5, md: 8 }} pt={{ base: 12, md: 20 }} pb={{ base: 14, md: 20 }}>
            <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 12, lg: 10 }} alignItems="center">
              {/* left: the argument */}
              <Box gridColumn={{ lg: 'span 7' }}>
                <HStack spacing={3} mb={{ base: 5, md: 7 }}>
                  <Box w="28px" h="2px" bg="accent.500" aria-hidden="true" />
                  <Text
                    fontFamily="heading"
                    fontSize="xs"
                    fontWeight="600"
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    color="text-secondary"
                  >
                    Collaboration infrastructure
                  </Text>
                </HStack>

                <Heading
                  as="h1"
                  fontSize={{ base: '2.5rem', sm: '3.25rem', md: '4rem', xl: '4.5rem' }}
                  lineHeight="0.98"
                  letterSpacing="-0.035em"
                  maxW="20ch"
                >
                  The introduction shouldn’t depend on{' '}
                  <Box as="span" color="accent.500">
                    who you already know
                  </Box>
                  .
                </Heading>

                <Text
                  mt={{ base: 5, md: 7 }}
                  fontSize={{ base: 'md', md: 'lg' }}
                  color="text-secondary"
                  maxW="52ch"
                  lineHeight="1.65"
                >
                  {active.lede}
                </Text>

                {/* role switcher */}
                <Box mt={{ base: 7, md: 9 }}>
                  <Text
                    as="span"
                    id="role-switch-label"
                    fontSize="xs"
                    fontWeight="600"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="text-tertiary"
                  >
                    Choose your side
                  </Text>
                  <HStack
                    mt={3}
                    spacing={0}
                    border="1px solid"
                    borderColor="border-default"
                    borderRadius="full"
                    p="3px"
                    display="inline-flex"
                    role="group"
                    aria-labelledby="role-switch-label"
                    flexWrap="wrap"
                  >
                    {(Object.keys(ROLES) as Role[]).map((r) => (
                      <Button
                        key={r}
                        onClick={() => setRole(r)}
                        aria-pressed={role === r}
                        size="sm"
                        variant={role === r ? 'solid' : 'ghost'}
                        colorScheme={role === r ? 'brand' : undefined}
                        borderRadius="full"
                        minH="40px"
                        px={5}
                        fontSize="sm"
                      >
                        {ROLES[r].label}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                <HStack mt={{ base: 7, md: 8 }} spacing={3} flexWrap="wrap">
                  <Button
                    as={RouterLink}
                    to={active.to}
                    size="lg"
                    variant="solid"
                    colorScheme="brand"
                    rightIcon={<FiArrowRight aria-hidden="true" />}
                  >
                    {active.cta}
                  </Button>
                  <Button as={RouterLink} to="/search" size="lg" variant="outline">
                    See how matching works
                  </Button>
                </HStack>

                <Text mt={5} fontSize="sm" color="text-tertiary">
                  {active.sideNote}
                </Text>
              </Box>

              {/* right: the convergence */}
              <Box gridColumn={{ lg: 'span 5' }} w="100%">
                <ConvergenceDiagram active={role} onPick={setRole} />
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        {/* ------------------------------------------------- capability band */}
        <Box borderBottom="1px solid" borderColor="border-subtle" bg="bg-surface">
          <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 8, md: 10 }}>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={0}>
              {ACCESS.map((a, i) => (
                <HStack
                  key={a.title}
                  align="flex-start"
                  spacing={4}
                  px={{ base: 0, lg: 6 }}
                  py={{ base: 4, lg: 2 }}
                  borderLeft={{ base: 'none', lg: i === 0 ? 'none' : '1px solid' }}
                  borderColor="border-subtle"
                >
                  <Icon as={a.icon} boxSize={5} color="accent.500" mt="2px" aria-hidden="true" />
                  <Box>
                    <Text fontFamily="heading" fontWeight="700" fontSize="sm">
                      {a.title}
                    </Text>
                    <Text fontSize="sm" color="text-secondary" lineHeight="1.5">
                      {a.body}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* ------------------------------------------------------ how it works */}
        <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 16, md: 24 }}>
          <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 10, lg: 8 }}>
            <Box gridColumn={{ lg: 'span 4' }}>
              <Heading
                as="h2"
                fontSize={{ base: '2rem', md: '2.75rem' }}
                lineHeight="1.05"
                letterSpacing="-0.03em"
                position={{ lg: 'sticky' }}
                top={{ lg: '96px' }}
              >
                How a match
                <br />
                becomes work.
              </Heading>
            </Box>

            <Box gridColumn={{ lg: 'span 8' }}>
              <VStack align="stretch" spacing={0}>
                {STEPS.map((s, i) => (
                  <Box
                    key={s.n}
                    pt={i === 0 ? 0 : { base: 8, md: 10 }}
                    pb={{ base: 8, md: 10 }}
                    borderTop={i === 0 ? 'none' : '1px solid'}
                    borderColor="border-subtle"
                    pl={{ lg: `${i * 32}px` }}
                    transition="padding 0.2s ease"
                  >
                    <HStack align="flex-start" spacing={{ base: 5, md: 8 }}>
                      <Text
                        fontFamily="heading"
                        fontSize={{ base: '2rem', md: '2.75rem' }}
                        fontWeight="700"
                        lineHeight="1"
                        letterSpacing="-0.03em"
                        color="transparent"
                        sx={{
                          WebkitTextStroke: '1px var(--chakra-colors-accent-400)',
                        }}
                        aria-hidden="true"
                        flexShrink={0}
                      >
                        {s.n}
                      </Text>
                      <Box>
                        <Heading as="h3" fontSize={{ base: 'xl', md: '2xl' }} letterSpacing="-0.02em">
                          {s.title}
                        </Heading>
                        <Text mt={3} color="text-secondary" maxW="58ch" lineHeight="1.65">
                          {s.body}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </SimpleGrid>
        </Container>

        {/* --------------------------------------------------- bias statement */}
        <Box bg={inkPanel} color="white">
          <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 16, md: 24 }}>
            <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 8, lg: 10 }} alignItems="end">
              <Box gridColumn={{ lg: 'span 8' }}>
                <Badge
                  bg="signal.400"
                  color="brand.700"
                  fontFamily="heading"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                  fontSize="xs"
                  px={3}
                  py={1}
                >
                  Why we built it this way
                </Badge>
                <Text
                  as="p"
                  mt={{ base: 6, md: 8 }}
                  fontFamily="heading"
                  fontWeight="700"
                  fontSize={{ base: '1.75rem', md: '2.75rem', xl: '3.25rem' }}
                  lineHeight="1.08"
                  letterSpacing="-0.03em"
                  maxW="30ch"
                >
                  Most opportunity still moves through private networks. That is a{' '}
                  <Box as="span" color="signal.400">
                    distribution problem
                  </Box>
                  , not a talent problem.
                </Text>
              </Box>
              <Box gridColumn={{ lg: 'span 4' }}>
                <Text color="whiteAlpha.800" lineHeight="1.7">
                  So the same structured questions are asked of every venture, matching reads
                  substance over signalling, and translation, voice input and screen-reader support
                  are in the core product rather than an accessibility page.
                </Text>
                <Button
                  as={RouterLink}
                  to="/register"
                  mt={7}
                  size="lg"
                  variant="solid"
                  colorScheme="gray"
                  rightIcon={<FiArrowRight aria-hidden="true" />}
                >
                  Join KolaboLab
                </Button>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        {/* ------------------------------------------------------------- close */}
        <Container maxW="7xl" px={{ base: 5, md: 8 }} py={{ base: 16, md: 24 }}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'flex-start', md: 'flex-end' }}
            justify="space-between"
            gap={8}
          >
            <Box>
              <Heading
                as="h2"
                fontSize={{ base: '2rem', md: '3rem' }}
                lineHeight="1.02"
                letterSpacing="-0.03em"
                maxW="22ch"
              >
                Bring your side of the table.
              </Heading>
              <Text mt={4} color="text-secondary" maxW="46ch">
                Free to join. Publish a venture, a skill set, or a thesis — and get matched on what
                it actually says.
              </Text>
            </Box>
            <HStack spacing={3} flexShrink={0} flexWrap="wrap">
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                variant="asymmetric"
                rightIcon={<FiArrowRight aria-hidden="true" />}
              >
                Create your account
              </Button>
              <Button as={RouterLink} to="/startups" size="lg" variant="outline">
                Browse ventures
              </Button>
            </HStack>
          </Flex>
          <Divider mt={{ base: 12, md: 16 }} />
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
