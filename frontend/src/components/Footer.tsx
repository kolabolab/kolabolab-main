import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  HStack,
  VStack,
  IconButton,
  Heading,
  Grid,
  GridItem,
  Input,
  Button,
  useColorModeValue,
  Divider,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa'
import { Link as RouterLink } from 'react-router-dom'

const Footer = () => {
  const bg = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  return (
    <Box bg={bg} color={useColorModeValue('gray.700', 'gray.200')} as="footer" role="contentinfo">
      <Container as={Stack} maxW="6xl" py={10}>
        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr 1fr' }} gap={8}>
          {/* Brand and Description */}
          <GridItem>
            <VStack align="start" spacing={4}>
              <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                Kolabolab
              </Text>
              <Text fontSize="sm" maxW="300px">
                Connecting entrepreneurs, collaborators, and investors from all walks of life. 
                Building an inclusive startup ecosystem where innovation thrives through diversity.
              </Text>
              <HStack spacing={4}>
                <IconButton
                  as="a"
                  href="https://twitter.com/kolabolab"
                  aria-label="Follow us on Twitter"
                  icon={<FaTwitter />}
                  variant="ghost"
                  size="sm"
                  _hover={{ color: 'brand.500' }}
                />
                <IconButton
                  as="a"
                  href="https://linkedin.com/company/kolabolab"
                  aria-label="Follow us on LinkedIn"
                  icon={<FaLinkedin />}
                  variant="ghost"
                  size="sm"
                  _hover={{ color: 'brand.500' }}
                />
                <IconButton
                  as="a"
                  href="https://github.com/kolabolab"
                  aria-label="View our GitHub"
                  icon={<FaGithub />}
                  variant="ghost"
                  size="sm"
                  _hover={{ color: 'brand.500' }}
                />
                <IconButton
                  as="a"
                  href="https://instagram.com/kolabolab"
                  aria-label="Follow us on Instagram"
                  icon={<FaInstagram />}
                  variant="ghost"
                  size="sm"
                  _hover={{ color: 'brand.500' }}
                />
              </HStack>
            </VStack>
          </GridItem>

          {/* Platform Links */}
          <GridItem>
            <VStack align="start" spacing={3}>
              <Heading size="sm" color={useColorModeValue('gray.900', 'white')}>
                Platform
              </Heading>
              <Link as={RouterLink} to="/startups" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Browse Startups
              </Link>
              <Link as={RouterLink} to="/collaborate" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Find Collaborators
              </Link>
              <Link as={RouterLink} to="/investors" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Investor Dashboard
              </Link>
              <Link as={RouterLink} to="/volunteer" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Volunteer Opportunities
              </Link>
              <Link as={RouterLink} to="/success-stories" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Success Stories
              </Link>
            </VStack>
          </GridItem>

          {/* Resources */}
          <GridItem>
            <VStack align="start" spacing={3}>
              <Heading size="sm" color={useColorModeValue('gray.900', 'white')}>
                Resources
              </Heading>
              <Link as={RouterLink} to="/help" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Help Center
              </Link>
              <Link as={RouterLink} to="/blog" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Blog
              </Link>
              <Link as={RouterLink} to="/api" fontSize="sm" _hover={{ color: 'brand.500' }}>
                API Documentation
              </Link>
              <Link as={RouterLink} to="/accessibility" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Accessibility
              </Link>
              <Link as={RouterLink} to="/community" fontSize="sm" _hover={{ color: 'brand.500' }}>
                Community Guidelines
              </Link>
            </VStack>
          </GridItem>

          {/* Newsletter Signup */}
          <GridItem>
            <VStack align="start" spacing={3}>
              <Heading size="sm" color={useColorModeValue('gray.900', 'white')}>
                Stay Updated
              </Heading>
              <Text fontSize="sm">
                Get the latest startup opportunities and platform updates.
              </Text>
              <Stack direction={{ base: 'column', sm: 'row' }} w="full" spacing={2}>
                <FormControl>
                  <FormLabel htmlFor="email-newsletter" srOnly>
                    Email address
                  </FormLabel>
                  <Input
                    id="email-newsletter"
                    placeholder="Enter your email"
                    size="sm"
                    bg={useColorModeValue('white', 'gray.800')}
                    border={1}
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                    _focus={{
                      borderColor: 'brand.500',
                    }}
                  />
                </FormControl>
                <Button 
                  size="sm" 
                  colorScheme="brand"
                  aria-label="Subscribe to newsletter"
                  whiteSpace="nowrap"
                >
                  Subscribe
                </Button>
              </Stack>
            </VStack>
          </GridItem>
        </Grid>

        <Divider my={8} borderColor={borderColor} />

        {/* Bottom section */}
        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          spacing={4}
        >
          <Text fontSize="sm">
            © {new Date().getFullYear()} Kolabolab. All rights reserved.
          </Text>
          
          <HStack spacing={6}>
            <Link as={RouterLink} to="/privacy" fontSize="sm" _hover={{ color: 'brand.500' }}>
              Privacy Policy
            </Link>
            <Link as={RouterLink} to="/terms" fontSize="sm" _hover={{ color: 'brand.500' }}>
              Terms of Service
            </Link>
            <Link as={RouterLink} to="/cookies" fontSize="sm" _hover={{ color: 'brand.500' }}>
              Cookie Policy
            </Link>
            <Link as={RouterLink} to="/contact" fontSize="sm" _hover={{ color: 'brand.500' }}>
              Contact Us
            </Link>
          </HStack>
        </Stack>

        {/* Accessibility statement */}
        <Box mt={4} p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
          <Text fontSize="sm" textAlign="center">
            <strong>Accessibility Commitment:</strong> Kolabolab is designed to be accessible to everyone. 
            We maintain WCAG 2.2 AA compliance and welcome{' '}
            <Link as={RouterLink} to="/accessibility-feedback" color="brand.500" textDecoration="underline">
              accessibility feedback
            </Link>
            .
          </Text>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer