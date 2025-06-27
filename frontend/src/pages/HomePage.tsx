import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiTrendingUp, FiTarget, FiZap, FiGlobe, FiHeart } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

interface FeatureProps {
  title: string;
  text: string;
  icon: any;
  variant?: 'startup' | 'investor' | 'default';
  gradient?: string;
}

const Feature: React.FC<FeatureProps> = ({ title, text, icon, variant = 'default' }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in', 'visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getCardVariant = () => {
    switch (variant) {
      case 'startup': return 'startup';
      case 'investor': return 'investor';
      default: return 'glass';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'startup': return 'startup.500';
      case 'investor': return 'investor.500';
      default: return 'brand.500';
    }
  };

  const getGradientText = () => {
    switch (variant) {
      case 'startup': return 'startup-gradient-text';
      case 'investor': return 'investor-gradient-text';
      default: return 'gradient-text';
    }
  };

  return (
    <Card
      ref={cardRef}
      variant={getCardVariant()}
      className="fade-in card-hover"
      cursor="pointer"
      height="100%"
    >
      <CardBody p={8} textAlign="center">
        <VStack spacing={6}>
          <Box
            p={4}
            borderRadius="full"
            bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.1)')}
            className="float-animation"
          >
            <Icon as={icon} w={8} h={8} color={getIconColor()} />
          </Box>
          <Heading size="lg" className={getGradientText()}>
            {title}
          </Heading>
          <Text fontSize="md" lineHeight="tall">
            {text}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

const StatsCard: React.FC<{ number: string; label: string; icon: any }> = ({ number, label, icon }) => (
  <Card variant="glass" className="card-hover">
    <CardBody p={6} textAlign="center">
      <VStack spacing={3}>
        <Icon as={icon} w={6} h={6} color="brand.500" />
        <Heading size="xl" className="gradient-text">
          {number}
        </Heading>
        <Text fontSize="sm" opacity={0.8}>
          {label}
        </Text>
      </VStack>
    </CardBody>
  </Card>
);

const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in', 'visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>KolaboLab - Revolutionary Startup Collaboration Platform</title>
        <meta
          name="description"
          content="Join KolaboLab's revolutionary platform connecting entrepreneurs, collaborators, and investors. Build the future of technology with AI-powered matching and global accessibility."
        />
        <meta name="keywords" content="startup, collaboration, investment, entrepreneur, innovation, technology, social impact" />
      </Helmet>

      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Box as="main" id="main-content">
        {/* Hero Section with Gradient Background */}
        <Box
          className="collaboration-context"
          position="relative"
          overflow="hidden"
          minH="100vh"
          display="flex"
          alignItems="center"
        >
          {/* Floating Elements */}
          <Box
            position="absolute"
            top="10%"
            right="10%"
            w="100px"
            h="100px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%)"
            className="float-animation"
            style={{ animationDelay: '0s' }}
          />
          <Box
            position="absolute"
            bottom="20%"
            left="5%"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(255, 149, 0, 0.05) 100%)"
            className="float-animation"
            style={{ animationDelay: '2s' }}
          />
          <Box
            position="absolute"
            top="50%"
            left="80%"
            w="60px"
            h="60px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%)"
            className="float-animation"
            style={{ animationDelay: '4s' }}
          />

          <Container maxW="6xl" py={20}>
            <VStack
              ref={heroRef}
              spacing={10}
              textAlign="center"
              className="fade-in"
            >
              <Badge
                px={4}
                py={2}
                borderRadius="full"
                variant="subtle"
                colorScheme="brand"
                fontSize="sm"
                className="glass-panel"
              >
                <HStack spacing={2}>
                  <Icon as={FiZap} />
                  <Text>Powered by AI & Global Accessibility</Text>
                </HStack>
              </Badge>

              <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                fontWeight="800"
                letterSpacing="tight"
                lineHeight="shorter"
                maxW="4xl"
              >
                Revolutionary Platform for{' '}
                <Text as="span" className="startup-gradient-text">
                  Startup
                </Text>{' '}
                Collaboration &{' '}
                <Text as="span" className="investor-gradient-text">
                  Investment
                </Text>
              </Heading>

              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                maxW="3xl"
                opacity={0.9}
                lineHeight="tall"
              >
                Connect with co-founders, find skilled collaborators, and secure funding through our 
                AI-powered matching system. Built for global accessibility and bias-free connections.
              </Text>

              <HStack
                spacing={6}
                wrap="wrap"
                justify="center"
                pt={4}
              >
                <Button
                  as={RouterLink}
                  to="/register"
                  variant="startup"
                  size="xl"
                  rightIcon={<FiArrowRight />}
                  className="interactive-element"
                >
                  Launch Your Startup
                </Button>
                <Button
                  as={RouterLink}
                  to="/startups"
                  variant="investor"
                  size="xl"
                  className="interactive-element"
                >
                  Discover Opportunities
                </Button>
              </HStack>

              {/* Stats Section */}
              <SimpleGrid
                columns={{ base: 2, md: 4 }}
                spacing={6}
                pt={12}
                w="full"
                maxW="2xl"
              >
                <StatsCard number="50+" label="Languages Supported" icon={FiGlobe} />
                <StatsCard number="AI" label="Powered Matching" icon={FiZap} />
                <StatsCard number="WCAG" label="2.2 AA Compliant" icon={FiHeart} />
                <StatsCard number="∞" label="Global Reach" icon={FiUsers} />
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Features Section */}
        <Box py={24} className="startup-context">
          <Container maxW="6xl">
            <VStack spacing={6} mb={16} textAlign="center">
              <Badge
                px={4}
                py={2}
                borderRadius="full"
                variant="subtle"
                colorScheme="startup"
                fontSize="sm"
              >
                For Every Visionary
              </Badge>
              <Heading
                as="h2"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight="700"
                maxW="4xl"
              >
                Designed for Entrepreneurs, Collaborators & Investors
              </Heading>
              <Text fontSize="xl" maxW="3xl" opacity={0.8}>
                Our platform adapts to your role, providing tailored experiences that drive meaningful connections and successful partnerships.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <Feature
                variant="startup"
                icon={FiTarget}
                title="For Entrepreneurs"
                text="Launch your vision with AI-powered co-founder matching, access to skilled collaborators, and direct connections to investors who align with your mission."
              />
              <Feature
                variant="default"
                icon={FiUsers}
                title="For Collaborators"
                text="Discover exciting projects that match your skills and interests. Build your portfolio while contributing to innovations that create positive impact."
              />
              <Feature
                variant="investor"
                icon={FiTrendingUp}
                title="For Investors"
                text="Access curated opportunities in social impact technology. Use our analytics to identify promising startups and make informed investment decisions."
              />
            </SimpleGrid>
          </Container>
        </Box>

        {/* Innovation Section */}
        <Box py={24} className="investor-context">
          <Container maxW="6xl">
            <Card variant="glass" size="lg" className="card-hover">
              <CardBody p={12}>
                <Flex
                  direction={{ base: 'column', lg: 'row' }}
                  align="center"
                  gap={10}
                >
                  <VStack align={{ base: 'center', lg: 'start' }} spacing={6} flex={1}>
                    <Badge
                      px={4}
                      py={2}
                      borderRadius="full"
                      variant="subtle"
                      colorScheme="investor"
                      fontSize="sm"
                    >
                      Revolutionary Technology
                    </Badge>
                    <Heading
                      as="h2"
                      fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                      fontWeight="700"
                      textAlign={{ base: 'center', lg: 'left' }}
                    >
                      Built for{' '}
                      <Text as="span" className="gradient-text">
                        Accessibility
                      </Text>{' '}
                      & Global Impact
                    </Heading>
                    <Text fontSize="lg" textAlign={{ base: 'center', lg: 'left' }}>
                      Our platform breaks down barriers with real-time translation, screen reader compatibility, 
                      voice input support, and bias-free AI matching algorithms that ensure equal opportunities for all.
                    </Text>
                    <HStack spacing={4} pt={4}>
                      <Button
                        as={RouterLink}
                        to="/about"
                        variant="ghost"
                        size="lg"
                        rightIcon={<FiArrowRight />}
                      >
                        Learn More
                      </Button>
                    </HStack>
                  </VStack>
                  <Spacer />
                  <Box flex={1} textAlign="center">
                    <SimpleGrid columns={2} spacing={4}>
                      <Card variant="glass" className="card-hover">
                        <CardBody p={6} textAlign="center">
                          <Icon as={FiGlobe} w={8} h={8} color="brand.500" mb={3} />
                          <Text fontWeight="600">50+ Languages</Text>
                          <Text fontSize="sm" opacity={0.7}>Real-time Translation</Text>
                        </CardBody>
                      </Card>
                      <Card variant="glass" className="card-hover">
                        <CardBody p={6} textAlign="center">
                          <Icon as={FiHeart} w={8} h={8} color="startup.500" mb={3} />
                          <Text fontWeight="600">WCAG 2.2 AA</Text>
                          <Text fontSize="sm" opacity={0.7}>Accessibility Standard</Text>
                        </CardBody>
                      </Card>
                      <Card variant="glass" className="card-hover">
                        <CardBody p={6} textAlign="center">
                          <Icon as={FiZap} w={8} h={8} color="investor.500" mb={3} />
                          <Text fontWeight="600">AI Matching</Text>
                          <Text fontSize="sm" opacity={0.7}>Bias-Free Algorithm</Text>
                        </CardBody>
                      </Card>
                      <Card variant="glass" className="card-hover">
                        <CardBody p={6} textAlign="center">
                          <Icon as={FiUsers} w={8} h={8} color="brand.500" mb={3} />
                          <Text fontWeight="600">Global Community</Text>
                          <Text fontSize="sm" opacity={0.7}>Inclusive Platform</Text>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box py={24}>
          <Container maxW="4xl">
            <Card variant="glass" className="card-hover">
              <CardBody p={12}>
                <VStack spacing={8} textAlign="center">
                  <Badge
                    px={4}
                    py={2}
                    borderRadius="full"
                    variant="subtle"
                    colorScheme="brand"
                    fontSize="sm"
                  >
                    Join the Revolution
                  </Badge>
                  <Heading
                    as="h2"
                    fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                    fontWeight="700"
                    className="gradient-text"
                  >
                    Ready to Transform Your Future?
                  </Heading>
                  <Text fontSize="xl" maxW="2xl" opacity={0.9}>
                    Join thousands of entrepreneurs, collaborators, and investors who are already building the future through KolaboLab.
                  </Text>
                  <HStack spacing={6} wrap="wrap" justify="center" pt={4}>
                    <Button
                      as={RouterLink}
                      to="/register"
                      variant="asymmetric"
                      size="xl"
                      rightIcon={<FiArrowRight />}
                      className="interactive-element"
                    >
                      Get Started Free
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/demo"
                      variant="glass"
                      size="xl"
                      className="interactive-element"
                    >
                      View Demo
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* Floating Action Button */}
      <Button
        as={RouterLink}
        to="/register"
        className="btn-fab"
        aria-label="Quick Registration"
        title="Quick Registration"
      >
        <FiArrowRight />
      </Button>
    </>
  );
};

export default HomePage;