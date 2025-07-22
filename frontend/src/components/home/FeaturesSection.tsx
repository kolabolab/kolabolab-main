import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FiUsers, FiTrendingUp, FiTarget, FiZap, FiGlobe, FiHeart, FiShield, FiAward } from 'react-icons/fi';

interface Feature {
  title: string;
  description: string;
  icon: any;
  color: string;
}

const features: Feature[] = [
  {
    title: 'Smart Matching',
    description: 'Our AI-powered algorithm connects you with the perfect co-founders, team members, and investors based on skills, values, and project goals.',
    icon: FiTarget,
    color: 'blue.500',
  },
  {
    title: 'Global Community',
    description: 'Join a diverse network of 15,000+ entrepreneurs, developers, designers, and investors from 45+ countries, all passionate about social impact.',
    icon: FiGlobe,
    color: 'green.500',
  },
  {
    title: 'Collaboration Tools',
    description: 'Built-in project management, communication, and file sharing tools designed specifically for startup teams and remote collaboration.',
    icon: FiUsers,
    color: 'purple.500',
  },
  {
    title: 'Funding Opportunities',
    description: 'Access to impact investors, grant opportunities, and crowdfunding campaigns specifically focused on social and environmental solutions.',
    icon: FiTrendingUp,
    color: 'orange.500',
  },
  {
    title: 'Mentorship Network',
    description: 'Connect with experienced entrepreneurs, industry experts, and thought leaders who provide guidance and support for your startup journey.',
    icon: FiAward,
    color: 'red.500',
  },
  {
    title: 'Impact Measurement',
    description: 'Track and showcase your social and environmental impact with our comprehensive metrics dashboard and reporting tools.',
    icon: FiHeart,
    color: 'pink.500',
  },
  {
    title: 'Secure Platform',
    description: 'Enterprise-grade security, privacy protection, and intellectual property safeguards to keep your ideas and data safe.',
    icon: FiShield,
    color: 'gray.500',
  },
  {
    title: 'Rapid Development',
    description: 'Accelerate your startup with our curated resources, templates, legal guidance, and technical infrastructure support.',
    icon: FiZap,
    color: 'yellow.500',
  },
];

const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      shadow="md"
      _hover={{
        shadow: 'xl',
        transform: 'translateY(-4px)',
      }}
      transition="all 0.3s ease"
      h="full"
    >
      <CardBody p={8}>
        <VStack align="start" spacing={4} h="full">
          <Box
            p={3}
            borderRadius="lg"
            bg={`${feature.color.split('.')[0]}.50`}
            display="inline-block"
          >
            <Icon
              as={feature.icon}
              w={6}
              h={6}
              color={feature.color}
            />
          </Box>
          
          <VStack align="start" spacing={3} flex="1">
            <Heading
              as="h3"
              fontSize="xl"
              fontWeight="bold"
              lineHeight="shorter"
            >
              {feature.title}
            </Heading>
            
            <Text
              color="gray.600"
              lineHeight="tall"
              fontSize="md"
            >
              {feature.description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export const FeaturesSection: React.FC = () => {
  return (
    <Box py={20}>
      <Container maxW="7xl">
        <VStack spacing={16}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center" maxW="3xl">
            <Heading
              as="h2"
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="bold"
              lineHeight="shorter"
            >
              Everything You Need to{' '}
              <Text as="span" className="gradient-text">
                Build Impact
              </Text>
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              lineHeight="tall"
            >
              From idea to scale, KolaboLab provides the tools, community, and resources 
              to turn your vision into a thriving social impact startup.
            </Text>
          </VStack>

          {/* Features Grid */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={8}
            w="full"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
              />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};