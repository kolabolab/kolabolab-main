import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Heading,
  VStack,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react';

export const ResponsiveDemo: React.FC = () => {
  const columns = useBreakpointValue({ 
    base: 1, 
    md: 2, 
    lg: 3, 
    xl: 4, 
    '2xl': 5, 
    '3xl': 6 
  });

  const containerWidth = useBreakpointValue({
    base: 'container.sm',
    md: 'container.md', 
    lg: 'container.lg',
    xl: 'container.xl',
    '2xl': '90%',
    '3xl': '85%',
    '4xl': '80%'
  });

  return (
    <Box py={8} bg="gray.50">
      <Container maxW={containerWidth}>
        <VStack spacing={6} mb={8}>
          <Heading size="lg" textAlign="center">
            Wide Screen Responsive Layout Demo
          </Heading>
          <Text textAlign="center" color="gray.600">
            This layout adapts to your screen size. On wide screens (2xl+), it uses percentage-based widths instead of fixed containers.
          </Text>
          <Badge colorScheme="blue" fontSize="sm" p={2}>
            Current columns: {columns} | Container: {containerWidth}
          </Badge>
        </VStack>
        
        <SimpleGrid columns={columns} spacing={6}>
          {Array.from({ length: 12 }, (_, i) => (
            <Card key={i} variant="outline">
              <CardBody>
                <VStack spacing={3}>
                  <Box w={8} h={8} bg="blue.500" borderRadius="md" />
                  <Text fontWeight="semibold">Card {i + 1}</Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    This card adapts to screen width
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};