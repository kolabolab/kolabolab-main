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
      <Container maxW="6xl">
        <SimpleGrid 
          columns={{ base: 1, lg: 2 }} 
          spacing={{ base: 12, lg: 8 }} 
          alignItems="flex-start"
          templateColumns={{ base: "1fr", lg: "1fr 0.8fr" }}
        >
          {/* Left Column - Content */}
          <VStack align="start" spacing={8} pt={{ base: 0, lg: 4 }}>
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
                fontSize={{ base: 'lg', md: 'xl' }}
                color="gray.700"
                lineHeight="relaxed"
                maxW="xl"
                fontWeight="400"
              >
                Connect with passionate entrepreneurs, skilled developers, and impact investors 
                to build startups that solve the world's most pressing challenges.
              </Text>
            </VStack>

            {/* CTA Buttons */}
            <HStack 
              spacing={4} 
              flexWrap="wrap" 
              pt={2}
              justify={{ base: "center", lg: "flex-start" }}
              w="full"
              className="hero-cta-buttons button-group-aligned"
            >
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                colorScheme="brand"
                rightIcon={<Icon as={FiArrowRight} />}
                className="button-aligned"
                px={10}
                fontSize="lg"
                fontWeight="600"
                borderRadius="xl"
                bg="brand.500"
                color="white"
                boxShadow="0 4px 14px 0 rgba(16, 185, 129, 0.25)"
                _hover={{
                  bg: "brand.600",
                  transform: 'translateY(-3px)',
                  boxShadow: "0 8px 25px 0 rgba(16, 185, 129, 0.35)",
                }}
                _active={{
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Start Building Today
              </Button>
              
              <Button
                as={RouterLink}
                to="/startups"
                size="lg"
                variant="outline"
                className="button-aligned"
                borderColor="gray.500"
                color="gray.800"
                px={8}
                fontSize="md"
                fontWeight="600"
                borderRadius="xl"
                borderWidth="2px"
                bg="white"
                _hover={{
                  borderColor: "brand.500",
                  color: "brand.700",
                  bg: "brand.50",
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
                _active={{
                  transform: 'translateY(0px)',
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Explore Projects
              </Button>
            </HStack>

            {/* Trust Indicators */}
            <VStack 
              align={{ base: "center", lg: "start" }} 
              spacing={3} 
              pt={4}
              w="full"
              className="trust-indicators"
            >
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                TRUSTED BY LEADING ORGANIZATIONS
              </Text>
              <HStack 
                spacing={6} 
                opacity={0.7}
                flexWrap="wrap"
                justify={{ base: "center", lg: "flex-start" }}
                className="alignment-fix"
              >
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
          <Box 
            position="relative" 
            pt={{ base: 0, lg: 4 }}
            className="hero-right-card"
          >
            <Box
              bg="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)"
              borderRadius="2xl"
              p={8}
              position="relative"
              overflow="hidden"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              shadow="lg"
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
              cursor="pointer"
              position="relative"
              overflow="hidden"
              _hover={{
                transform: 'translateY(-6px)',
                shadow: 'xl',
                borderColor: 'brand.200',
                bg: useColorModeValue('brand.25', 'gray.750'),
              }}
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                bg: 'brand.500',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              _hover_before={{
                transform: 'scaleX(1)',
              }}
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              <VStack spacing={4} alignItems="center" justifyContent="center" minH="120px">
                <Box
                  p={3}
                  borderRadius="lg"
                  bg={useColorModeValue('brand.50', 'brand.900')}
                  transition="all 0.3s ease"
                  _groupHover={{
                    bg: useColorModeValue('brand.100', 'brand.800'),
                    transform: 'scale(1.1)',
                  }}
                >
                  <Icon
                    as={stat.icon}
                    w={8}
                    h={8}
                    color="brand.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  />
                </Box>
                <VStack spacing={1} alignItems="center">
                  <StatNumber
                    fontSize={{ base: '2xl', md: '3xl' }}
                    fontWeight="bold"
                    className="gradient-text"
                    lineHeight="1"
                  >
                    {stat.value}
                  </StatNumber>
                  <StatLabel
                    fontSize="sm"
                    color={useColorModeValue('gray.600', 'gray.400')}
                    fontWeight="medium"
                    lineHeight="1.2"
                  >
                    {stat.label}
                  </StatLabel>
                </VStack>
              </VStack>
            </Stat>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};