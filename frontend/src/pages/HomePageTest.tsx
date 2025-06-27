import React from 'react';
import { Box, Container, Heading, Text, Button } from '@chakra-ui/react';

const HomePageTest: React.FC = () => {
  return (
    <Box py={20}>
      <Container maxW="6xl">
        <Heading size="xl" mb={4}>
          Test HomePage - This Should Work
        </Heading>
        <Text>
          If you can see this, the routing is working and the issue is with the main HomePage component.
        </Text>
        <Button mt={4} colorScheme="blue">
          Test Button
        </Button>
      </Container>
    </Box>
  );
};

export default HomePageTest;