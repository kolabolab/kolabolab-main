import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
  Card,
  CardBody,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiHome, FiSearch, FiArrowLeft, FiMapPin } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - KolaboLab</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to KolaboLab and continue your startup journey." />
      </Helmet>

      <Box minH="100vh" display="flex" alignItems="center" className="collaboration-context">
        <Container maxW="4xl">
          <VStack spacing={12} textAlign="center">
            {/* 404 Visual */}
            <VStack spacing={6}>
              <Box position="relative">
                <Text
                  fontSize={{ base: '8xl', md: '12xl' }}
                  fontWeight="800"
                  className="gradient-text"
                  fontFamily="heading"
                  lineHeight="1"
                  opacity={0.1}
                >
                  404
                </Text>
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  className="float-animation"
                >
                  <Icon as={FiMapPin} boxSize={16} color="interactive-accent" />
                </Box>
              </Box>
              
              <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight="700"
                maxW="3xl"
              >
                Oops! This Page Got Lost in the{' '}
                <Text as="span" className="startup-gradient-text">
                  Innovation
                </Text>{' '}
                Space
              </Heading>
              
              <Text fontSize="xl" maxW="2xl" opacity={0.8}>
                The page you're looking for might have been moved, deleted, or doesn't exist. 
                Let's get you back on track to building the future.
              </Text>
            </VStack>

            {/* Action Cards */}
            <HStack
              spacing={6}
              wrap="wrap"
              justify="center"
              w="full"
              maxW="3xl"
            >
              <Card variant="glass" className="card-hover" flex="1" minW="280px">
                <CardBody p={8} textAlign="center">
                  <VStack spacing={4}>
                    <Box
                      p={4}
                      borderRadius="full"
                      bg="rgba(24, 144, 255, 0.1)"
                      className="float-animation"
                    >
                      <Icon as={FiHome} w={8} h={8} color="interactive-accent" />
                    </Box>
                    <Heading size="md">Return Home</Heading>
                    <Text fontSize="sm" opacity={0.8}>
                      Go back to the homepage and discover amazing startups
                    </Text>
                    <Button
                      as={RouterLink}
                      to="/"
                      colorScheme="brand"
                      size="lg"
                      leftIcon={<FiHome />}
                      className="interactive-element"
                      w="full"
                    >
                      Go Home
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card variant="glass" className="card-hover" flex="1" minW="280px">
                <CardBody p={8} textAlign="center">
                  <VStack spacing={4}>
                    <Box
                      p={4}
                      borderRadius="full"
                      bg="rgba(255, 149, 0, 0.1)"
                      className="float-animation"
                      style={{ animationDelay: '1s' }}
                    >
                      <Icon as={FiSearch} w={8} h={8} color="startup.500" />
                    </Box>
                    <Heading size="md">Explore Startups</Heading>
                    <Text fontSize="sm" opacity={0.8}>
                      Browse innovative startups and find collaboration opportunities
                    </Text>
                    <Button
                      as={RouterLink}
                      to="/startups"
                      variant="startup"
                      size="lg"
                      leftIcon={<FiSearch />}
                      className="interactive-element"
                      w="full"
                    >
                      Browse Startups
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </HStack>

            {/* Additional Actions */}
            <VStack spacing={4}>
              <Text fontSize="sm" opacity={0.6}>
                Still can't find what you're looking for?
              </Text>
              <HStack spacing={4} wrap="wrap" justify="center">
                <Button
                  as={RouterLink}
                  to="/search"
                  variant="ghost"
                  size="md"
                  leftIcon={<FiSearch />}
                  className="interactive-element"
                >
                  Search Platform
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant="ghost"
                  size="md"
                  leftIcon={<FiArrowLeft />}
                  className="interactive-element"
                >
                  Go Back
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default NotFoundPage