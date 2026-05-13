import React, { useState, useRef } from 'react';
// Fixed FiQuote icon issue - using FiMessageCircle instead
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Icon,
  useColorModeValue,
  Button,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiStar, FiMessageCircle, FiArrowRight, FiChevronLeft, FiChevronRight, FiUsers, FiTrendingUp, FiZap } from 'react-icons/fi';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    company: 'GreenTech Solutions',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    content: 'KolaboLab connected us with the perfect technical co-founder. Within 3 months, we went from idea to MVP. The platform\'s focus on social impact startups is exactly what the world needs.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Lead Developer',
    company: 'EduAccess Initiative',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'As a developer passionate about education equity, I found my dream team on KolaboLab. The quality of projects and people here is outstanding. We\'ve impacted over 10,000 students so far.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Dr. Amara Okafor',
    role: 'Impact Investor',
    company: 'Future Fund Ventures',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    content: 'KolaboLab has become our go-to platform for discovering early-stage social impact startups. The caliber of entrepreneurs and their commitment to solving real problems is impressive.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Alex Rivera',
    role: 'Product Designer',
    company: 'CleanWater Co.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    content: 'The collaboration tools and community support on KolaboLab are game-changing. We built our water purification startup from scratch and now serve communities across 3 countries.',
    rating: 5,
  },
  {
    id: '5',
    name: 'Priya Sharma',
    role: 'Social Entrepreneur',
    company: 'HealthBridge Network',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    content: 'KolaboLab isn\'t just a platform—it\'s a movement. The mentorship, funding connections, and collaborative spirit here helped us scale our healthcare solution to reach rural communities.',
    rating: 5,
  },
  {
    id: '6',
    name: 'James Thompson',
    role: 'Angel Investor',
    company: 'Impact Capital Group',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    content: 'I\'ve invested in 12 startups through KolaboLab, and the success rate is remarkable. The platform\'s vetting process and focus on sustainable impact creates exceptional investment opportunities.',
    rating: 5,
  },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <HStack spacing={1} className="star-rating-container">
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          as={FiStar}
          color={i < rating ? 'yellow.400' : 'gray.300'}
          fill={i < rating ? 'yellow.400' : 'transparent'}
          className="star-rating-icon"
        />
      ))}
    </HStack>
  );
};

const TestimonialCard: React.FC<{ testimonial: Testimonial; isCarousel?: boolean }> = ({ testimonial, isCarousel = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const shouldTruncate = testimonial.content.length > 150;
  const displayContent = shouldTruncate && !isExpanded 
    ? testimonial.content.substring(0, 150) + "..."
    : testimonial.content;

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      shadow="lg"
      _hover={{
        shadow: 'xl',
        transform: 'translateY(-4px)',
      }}
      transition="all 0.3s ease"
      h="full"
      minW={isCarousel ? "350px" : "auto"}
      maxW={isCarousel ? "400px" : "auto"}
      flex={isCarousel ? "0 0 auto" : "1"}
    >
      <CardBody p={6}>
        <VStack align="start" spacing={4} h="full">
          <HStack spacing={3} w="full" className="testimonial-header">
            <Icon as={FiMessageCircle} color="brand.500" className="testimonial-icon" />
            <StarRating rating={testimonial.rating} />
          </HStack>
          
          <VStack align="start" spacing={2} flex="1">
            <Text
              fontSize="md"
              lineHeight="tall"
              color="gray.600"
              fontStyle="italic"
            >
              "{displayContent}"
            </Text>
            
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                color="brand.500"
                fontWeight="medium"
                p={0}
                h="auto"
                onClick={() => setIsExpanded(!isExpanded)}
                _hover={{ color: "brand.600" }}
              >
                {isExpanded ? "Read Less" : "Read More"}
              </Button>
            )}
          </VStack>
          
          <HStack spacing={3} w="full" pt={2} className="avatar-text-container">
            <Avatar
              size="md"
              src={testimonial.avatar}
              name={testimonial.name}
              className="avatar-container"
            />
            <VStack align="start" spacing={0} flex="1" className="text-info-container">
              <Text fontWeight="bold" fontSize="sm">
                {testimonial.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {testimonial.role}
              </Text>
              <Text fontSize="xs" color="brand.500" fontWeight="medium">
                {testimonial.company}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionBg = useColorModeValue('gray.50', 'gray.900');

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 400; // maxW of cards + spacing
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1;
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const newIndex = currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  // Auto-scroll functionality
  React.useEffect(() => {
    const interval = setInterval(() => {
      scrollRight();
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <Box bg={sectionBg} py={20} className="full-width-site">
      <Container maxW="100%" className="content-max-width">
        <VStack spacing={12}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center" maxW="3xl">
            <Heading
              as="h2"
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="bold"
              lineHeight="shorter"
              className="gradient-text"
            >
              What People Are Saying About KolaboLab
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              maxW="2xl"
              lineHeight="tall"
            >
              Join thousands of entrepreneurs, developers, and investors who are building 
              the future of social impact through collaboration.
            </Text>
          </VStack>

          {/* Desktop Carousel */}
          <Box w="full" display={{ base: 'none', md: 'block' }}>
            <Box position="relative">
              {/* Navigation Buttons */}
              <IconButton
                aria-label="Previous testimonial"
                icon={<FiChevronLeft />}
                position="absolute"
                left="-20px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                colorScheme="brand"
                variant="ghost"
                size="lg"
                onClick={scrollLeft}
                _hover={{ bg: 'brand.50' }}
              />
              
              <IconButton
                aria-label="Next testimonial"
                icon={<FiChevronRight />}
                position="absolute"
                right="-20px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                colorScheme="brand"
                variant="ghost"
                size="lg"
                onClick={scrollRight}
                _hover={{ bg: 'brand.50' }}
              />

              {/* Carousel Container */}
              <Box
                ref={scrollRef}
                overflowX="auto"
                overflowY="hidden"
                css={{
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  '-ms-overflow-style': 'none',
                  'scrollbar-width': 'none',
                }}
              >
                <Flex gap={6} pb={4}>
                  {testimonials.map((testimonial) => (
                    <TestimonialCard 
                      key={testimonial.id} 
                      testimonial={testimonial} 
                      isCarousel={true}
                    />
                  ))}
                </Flex>
              </Box>

              {/* Dots Indicator */}
              <HStack justify="center" spacing={2} mt={6}>
                {testimonials.map((_, index) => (
                  <Box
                    key={index}
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={index === currentIndex ? 'brand.500' : 'gray.300'}
                    cursor="pointer"
                    transition="all 0.3s ease"
                    onClick={() => scrollToIndex(index)}
                    _hover={{ bg: index === currentIndex ? 'brand.600' : 'gray.400' }}
                  />
                ))}
              </HStack>
            </Box>
          </Box>

          {/* Mobile Stacked Layout */}
          <VStack spacing={6} w="full" display={{ base: 'flex', md: 'none' }}>
            {testimonials.slice(0, 3).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </VStack>

          {/* Call to Action */}
          <VStack spacing={4} textAlign="center">
            <Text fontSize="lg" color="gray.600">
              Ready to join our community of changemakers?
            </Text>
            <HStack spacing={4} className="button-group-aligned">
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                colorScheme="brand"
                rightIcon={<Icon as={FiArrowRight} />}
                className="button-aligned"
              >
                Get Started Today
              </Button>
              <Button
                as={RouterLink}
                to="/startups"
                size="lg"
                variant="outline"
                colorScheme="brand"
                className="button-aligned"
              >
                Explore Projects
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};