import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Icon,
  Image,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiTrendingUp, FiGlobe, FiHeart } from 'react-icons/fi';

const stats = [
  {
    label: 'Active Projects',
    value: '2,500+',
    icon: FiTrendingUp,
  },
  {
    label: 'Community Members',
    value: '15,000+',
    icon: FiUsers,
  },
  {
    label: 'Countries Reached',
    value: '45+',
    icon: FiGlobe,
  },
  {
    label: 'Lives Impacted',
    value: '1M+',
    icon: FiHeart,
  },
];

export const HeroSection: React.FC = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, white, gray.50, green.50)',
    'linear(to-br, gray.900, gray.800, green.900)'
  );
  
  const statBg = useColorModeValue('white', 'gray.800');
  const statBorder = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bgGradient={bgGradient} pt={20} pb={16}>
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">
          {/* Left Column - Content */}
          <VStack align="start" spacing={8}>
            <VStack align="start" spacing={6}>
              <Heading
                as="h1"
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="bold"
                lineHeight="shorter"
                letterSpacing="tight"
              >
                <Text as="span" className="gradient-text">
                  Collaborate.
                </Text>{' '}
                <Text as="span" className="gradient-text">
                  Innovate.
                </Text>{' '}
                <Text as="span" className="gradient-text">
                  Impact.
                </Text>
              </Heading>
              
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                color="gray.600"
                lineHeight="tall"
                maxW="xl"
              >
                Connect with passionate entrepreneurs, skilled developers, and impact investors 
                to build startups that solve the world's most pressing challenges.
              </Text>
            </VStack>

            {/* CTA Buttons */}
            <HStack spacing={4} flexWrap="wrap">
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                colorScheme="brand"
                rightIcon={<Icon as={FiArrowRight} />}
                px={8}
                py={6}
                fontSize="lg"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                Start Building Today
              </Button>
              
              <Button
                as={RouterLink}
                to="/startups"
                size="lg"
                variant="outline"
                colorScheme="brand"
                px={8}
                py={6}
                fontSize="lg"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                }}
                transition="all 0.3s ease"
              >
                Explore Projects
              </Button>
            </HStack>

            {/* Trust Indicators */}
            <VStack align="start" spacing={3} pt={4}>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                TRUSTED BY LEADING ORGANIZATIONS
              </Text>
              <HStack spacing={6} opacity={0.7}>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  United Nations
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  World Bank
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  Gates Foundation
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  Y Combinator
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Right Column - Visual */}
          <Box position="relative">
            <Box
              bg="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)"
              borderRadius="2xl"
              p={8}
              position="relative"
              overflow="hidden"
            >
              {/* Placeholder for hero image/illustration */}
              <VStack spacing={6} textAlign="center" py={12}>
                <Box
                  w={20}
                  h={20}
                  bg="brand.500"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  className="float-animation"
                >
                  <Icon as={FiHeart} w={10} h={10} color="white" />
                </Box>
                <Text fontSize="lg" fontWeight="medium" color="gray.700">
                  Building the Future of Social Impact
                </Text>
                <Text fontSize="sm" color="gray.600" maxW="sm">
                  Join a global community of changemakers creating solutions for 
                  climate change, education, healthcare, and social justice.
                </Text>
              </VStack>

              {/* Decorative elements */}
              <Box
                position="absolute"
                top={4}
                right={4}
                w={16}
                h={16}
                bg="blue.100"
                borderRadius="full"
                opacity={0.6}
                className="float-animation"
                style={{ animationDelay: '1s' }}
              />
              <Box
                position="absolute"
                bottom={4}
                left={4}
                w={12}
                h={12}
                bg="green.100"
                borderRadius="full"
                opacity={0.6}
                className="float-animation"
                style={{ animationDelay: '2s' }}
              />
            </Box>
          </Box>
        </SimpleGrid>

        {/* Stats Section */}
        <SimpleGrid
          columns={{ base: 2, md: 4 }}
          spacing={6}
          mt={16}
          pt={12}
          borderTop="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          {stats.map((stat, index) => (
            <Stat
              key={index}
              bg={statBg}
              p={6}
              borderRadius="xl"
              border="1px solid"
              borderColor={statBorder}
              textAlign="center"
              _hover={{
                transform: 'translateY(-4px)',
                shadow: 'lg',
              }}
              transition="all 0.3s ease"
            >
              <VStack spacing={3}>
                <Icon
                  as={stat.icon}
                  w={8}
                  h={8}
                  color="brand.500"
                />
                <StatNumber
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight="bold"
                  className="gradient-text"
                >
                  {stat.value}
                </StatNumber>
                <StatLabel
                  fontSize="sm"
                  color="gray.600"
                  fontWeight="medium"
                >
                  {stat.label}
                </StatLabel>
              </VStack>
            </Stat>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};