import React from 'react'
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
  HStack,
  VStack,
  Divider,
  Icon,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { ExternalLinkIcon } from '@chakra-ui/icons'

export const Footer: React.FC = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTop="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      mt="auto"
    >
      <Container as={Stack} maxW="6xl" py={10}>
        <Stack spacing={8}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
            {/* Brand section */}
            <VStack align="start" spacing={4} flex={1}>
              <Text fontSize="lg" fontWeight="bold" color="brand.500">
                KolaboLab
              </Text>
              <Text fontSize="sm" maxW="300px">
                Connecting entrepreneurs, collaborators, and investors to build 
                the future of technology with social impact.
              </Text>
            </VStack>

            {/* Platform links */}
            <VStack align="start" spacing={3} flex={1}>
              <Text fontWeight="bold">Platform</Text>
              <Link as={RouterLink} to="/startups" fontSize="sm">
                Browse Startups
              </Link>
              <Link as={RouterLink} to="/search" fontSize="sm">
                Search Projects
              </Link>
              <Link as={RouterLink} to="/register" fontSize="sm">
                Join Community
              </Link>
            </VStack>

            {/* Resources links */}
            <VStack align="start" spacing={3} flex={1}>
              <Text fontWeight="bold">Resources</Text>
              <Link href="/docs" fontSize="sm" isExternal>
                Documentation <Icon as={ExternalLinkIcon} mx="2px" />
              </Link>
              <Link href="/blog" fontSize="sm" isExternal>
                Blog <Icon as={ExternalLinkIcon} mx="2px" />
              </Link>
              <Link href="/api" fontSize="sm" isExternal>
                API Reference <Icon as={ExternalLinkIcon} mx="2px" />
              </Link>
            </VStack>

            {/* Support links */}
            <VStack align="start" spacing={3} flex={1}>
              <Text fontWeight="bold">Support</Text>
              <Link href="/help" fontSize="sm" isExternal>
                Help Center <Icon as={ExternalLinkIcon} mx="2px" />
              </Link>
              <Link href="/contact" fontSize="sm" isExternal>
                Contact Us <Icon as={ExternalLinkIcon} mx="2px" />
              </Link>
              <Link href="/community" fontSize="sm" isExternal>
                Community <Icon as={ExternalLinkIcon} mx="2px" />
              </Link>
            </VStack>
          </Stack>

          <Divider />

          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            spacing={4}
          >
            <Text fontSize="sm">
              © {new Date().getFullYear()} KolaboLab. All rights reserved.
            </Text>
            
            <HStack spacing={6}>
              <Link href="/privacy" fontSize="sm" isExternal>
                Privacy Policy
              </Link>
              <Link href="/terms" fontSize="sm" isExternal>
                Terms of Service
              </Link>
              <Link href="/cookies" fontSize="sm" isExternal>
                Cookie Policy
              </Link>
            </HStack>
          </Stack>

          {/* Accessibility statement */}
          <Box pt={4}>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              KolaboLab is committed to digital accessibility. We continually improve 
              the user experience for everyone and apply the relevant accessibility standards.
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}