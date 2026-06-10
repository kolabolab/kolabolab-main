import React from 'react'
import {
  Box,
  Container,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
  HStack,
  VStack,
  Icon,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi'

export const Footer: React.FC = React.memo(() => {
  return (
    <Box bg={useColorModeValue('brand.900', 'gray.900')} color="gray.400" mt="auto">
      <Container maxW="6xl" py={10}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} mb={8}>
          <VStack align="start" spacing={2}>
            <Text fontWeight="600" color="white" fontSize="sm" mb={1}>Platform</Text>
            <Link as={RouterLink} to="/startups" fontSize="sm" _hover={{ color: 'accent.400' }}>Browse Startups</Link>
            <Link as={RouterLink} to="/search" fontSize="sm" _hover={{ color: 'accent.400' }}>Find Collaborators</Link>
            <Link as={RouterLink} to="/create-startup" fontSize="sm" _hover={{ color: 'accent.400' }}>Create a Startup</Link>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontWeight="600" color="white" fontSize="sm" mb={1}>Company</Text>
            <Link as={RouterLink} to="/about" fontSize="sm" _hover={{ color: 'accent.400' }}>About Us</Link>
            <Link href="mailto:hello@kolabolab.com" fontSize="sm" _hover={{ color: 'accent.400' }}>Contact</Link>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontWeight="600" color="white" fontSize="sm" mb={1}>Legal</Text>
            <Link as={RouterLink} to="/privacy" fontSize="sm" _hover={{ color: 'accent.400' }}>Privacy Policy</Link>
            <Link as={RouterLink} to="/terms" fontSize="sm" _hover={{ color: 'accent.400' }}>Terms of Service</Link>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontWeight="600" color="white" fontSize="sm" mb={1}>Connect</Text>
            <HStack spacing={4}>
              <Link href="https://twitter.com/kolabolab" isExternal aria-label="Twitter">
                <Icon as={FiTwitter} w={4} h={4} _hover={{ color: 'accent.400' }} transition="color 0.2s" />
              </Link>
              <Link href="https://linkedin.com/company/kolabolab" isExternal aria-label="LinkedIn">
                <Icon as={FiLinkedin} w={4} h={4} _hover={{ color: 'accent.400' }} transition="color 0.2s" />
              </Link>
              <Link href="https://github.com/kolabolab" isExternal aria-label="GitHub">
                <Icon as={FiGithub} w={4} h={4} _hover={{ color: 'accent.400' }} transition="color 0.2s" />
              </Link>
            </HStack>
          </VStack>
        </SimpleGrid>

        <Divider borderColor="whiteAlpha.200" />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          pt={6}
          gap={2}
        >
          <Text fontSize="xs" color="gray.500">
            © {new Date().getFullYear()} KolaboLab. All rights reserved.
          </Text>
          <Text fontSize="xs" color="gray.500">
            Connect · Collaborate · Grow
          </Text>
        </Flex>
      </Container>
    </Box>
  )
})
