import React, { useState } from 'react'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Avatar,
  Text,
  Link as ChakraLink,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  VStack,
  Badge,
  Icon,
  Container,
  Portal,
  Image,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons'
import { FiTrendingUp, FiUsers, FiLogOut, FiFolderPlus, FiUser, FiChevronDown, FiShield, FiBell, FiMessageSquare } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { NotificationBell } from './NotificationBell'
import { UnreadBadge } from '../UnreadBadge'

const NavLink = ({ children, to, variant = 'default' }: { 
  children: React.ReactNode; 
  to: string;
  variant?: 'default' | 'startup' | 'investor';
}) => {
  const getHoverBg = () => {
    switch (variant) {
      case 'startup': return 'rgba(255, 149, 0, 0.08)';
      case 'investor': return 'rgba(82, 196, 26, 0.08)';
      default: return 'rgba(27, 42, 74, 0.08)';
    }
  };

  return (
    <ChakraLink
      as={RouterLink}
      to={to}
      px={4}
      py={0}
      rounded="lg"
      className="nav-link"
      height="44px"
      minHeight="44px"
      minWidth="44px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      lineHeight="1"
      _hover={{
        textDecoration: 'none',
        bg: getHoverBg(),
        transform: 'translateY(-1px)',
      }}
      fontWeight="500"
      fontSize="sm"
      transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
    >
      {children}
    </ChakraLink>
  );
};

export const Navbar: React.FC = React.memo(() => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, isAuthenticated, clearAuth } = useAuth()
  const navigate = useNavigate()
  const [logoError, setLogoError] = useState(false)
  // The mark's primary form is ink, which disappears on the dark navbar, so the
  // dark surface gets a variant with that form lifted to paper.
  const logoSrc = useColorModeValue('/kolabolab-logo.png', '/kolabolab-logo-dark.png')
  
  // No custom dropdown state needed - using Chakra UI Menu

  const handleLogout = () => {
    try {
      clearAuth()
      // Clear any cached data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Force navigation to home
      navigate('/', { replace: true })
      // Optional: Show success message
      console.log('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Box 
        className="nav-glass"
        px={0}
        shadow="md"
        position="sticky"
        top={0}
        zIndex={1000}
        role="banner"
        aria-label="Site header"
        overflow="visible"
      >
        <Container 
          maxW={{ base: "container.xl", "2xl": "90%" }} 
          px={{ base: 4, md: 6 }}
          overflow="visible"
        >
          <Flex 
            h={28} 
            alignItems="center" 
            justifyContent="space-between" 
            gap={4} 
            position="relative"
            overflow="visible"
          >
            <IconButton
              size="lg"
              width="48px"
              height="48px"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              icon={isOpen ? <CloseIcon boxSize={5} /> : <HamburgerIcon boxSize={6} />}
              aria-label={isOpen ? "Close navigation menu" : "Toggle navigation menu"}
              display={{ md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
              onKeyDown={(e) => handleKeyDown(e, isOpen ? onClose : onOpen)}
              variant="glass"
              className="interactive-element"
            />

            <HStack spacing={{ base: 4, md: 8 }} alignItems="center" flex="1" minW="0">
              {/* Logo */}
              <ChakraLink
                as={RouterLink}
                to="/"
                flexShrink={0}
                display="flex"
                alignItems="center"
                h="44px"
                _hover={{ textDecoration: 'none' }}
              >
                {logoError ? (
                  <Text
                    as="span"
                    fontSize={{ base: "lg", md: "xl" }}
                    fontWeight="800"
                    className="gradient-text"
                    fontFamily="heading"
                    lineHeight="1"
                    whiteSpace="nowrap"
                    display="block"
                    mb={0}
                  >
                    KolaboLab
                  </Text>
                ) : (
                  <HStack spacing={2.5} align="center">
                    <Image
                      src={logoSrc}
                      alt="KolaboLab - Connect, Collaborate, Grow"
                      height={{ base: "26px", md: "30px" }}
                      maxH={{ base: "26px", md: "30px" }}
                      objectFit="contain"
                      display="block"
                      onError={() => setLogoError(true)}
                    />
                    <Text
                      as="span"
                      fontSize={{ base: "lg", md: "xl" }}
                      fontWeight="800"
                      fontFamily="heading"
                      letterSpacing="-0.02em"
                      lineHeight="1"
                      whiteSpace="nowrap"
                      display={{ base: 'none', sm: 'block' }}
                      className="gradient-text"
                    >
                      KolaboLab
                    </Text>
                  </HStack>
                )}
              </ChakraLink>

              {/* Desktop Navigation */}
              <HStack
                as="nav"
                spacing={1}
                display={{ base: 'none', md: 'none', lg: 'flex' }}
              className="responsive-nav base-hidden md-hidden lg-flex"
                flexShrink={0}
                role="navigation"
                aria-label="Main navigation"
              >
                <NavLink to="/startups" variant="startup">Startups</NavLink>
                <NavLink to="/search">Search</NavLink>
                {isAuthenticated && (
                  <>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/collaborations">Collaborations</NavLink>
                    <NavLink to="/applications/mine">Applications</NavLink>
                    {user?.roles?.includes('investor') && (
                      <NavLink to="/investments" variant="investor">Investments</NavLink>
                    )}
                    {user?.roles?.includes('admin') && (
                      <NavLink to="/admin">Admin</NavLink>
                    )}
                  </>
                )}
              </HStack>
            </HStack>

            {/* Right side actions */}
            <Flex alignItems="center" flexShrink={0}>
              {isAuthenticated ? (
                <HStack spacing={{ base: 2, md: 4 }} alignItems="center">
                  <Button
                    as={RouterLink}
                    to="/create-startup"
                    variant="startup"
                    size="md"
                    leftIcon={<AddIcon />}
                    display={{ base: 'none', md: 'none', xl: 'flex' }}
                  className="responsive-button base-hidden md-hidden xl-flex"
                    whiteSpace="nowrap"
                  >
                    Create Startup
                  </Button>

                  {/* Notification Bell */}
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <NotificationBell />
                  </Box>

                  {/* Messages Link */}
                  <Box display={{ base: 'none', md: 'flex' }} alignItems="center">
                    <ChakraLink
                      as={RouterLink}
                      to="/messages"
                      display="flex"
                      alignItems="center"
                      px={2}
                      py={1}
                      rounded="lg"
                      _hover={{
                        textDecoration: 'none',
                        bg: 'rgba(27, 42, 74, 0.08)',
                      }}
                      aria-label="Messages"
                    >
                      <Icon as={FiMessageSquare} w={5} h={5} />
                      <UnreadBadge />
                    </ChakraLink>
                  </Box>
                  
                  {/* Proper Chakra UI Menu */}
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      cursor="pointer"
                      p={2}
                      pr={3}
                      borderRadius="xl"
                      className="interactive-element"
                      height="40px"
                      alignItems="center"
                      justifyContent="center"
                      _hover={{
                        bg: 'rgba(27, 42, 74, 0.08)',
                        transform: 'translateY(-1px)',
                      }}
                      _active={{
                        bg: 'rgba(27, 42, 74, 0.12)',
                      }}
                      transition="all 0.2s"
                      aria-label={`${user?.firstName} ${user?.lastName} user menu`}
                      aria-haspopup="menu"
                      aria-describedby="user-menu-description"
                    >
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          src={user?.avatar}
                          name={`${user?.firstName} ${user?.lastName}`}
                          border="2px solid"
                          borderColor="accent.200"
                        />
                        <VStack spacing={0} align="start" display={{ base: 'none', md: 'none', lg: 'flex' }} className="responsive-user-info base-hidden md-hidden lg-flex">
                          <Text fontWeight="600" fontSize="sm" lineHeight="1.2">
                            {user?.firstName} {user?.lastName}
                          </Text>
                          {user?.roles?.includes('investor') && (
                            <Badge
                              variant="subtle"
                              colorScheme="green"
                              fontSize="xs"
                              px={1}
                              py={0}
                            >
                              Investor
                            </Badge>
                          )}
                        </VStack>
                        <Icon as={FiChevronDown} w={4} h={4} color="text-tertiary" />
                      </HStack>
                    </MenuButton>
                    
                    <Portal>
                      <MenuList
                        bg="bg-surface"
                        border="2px solid"
                        borderColor="brand.100"
                        borderRadius="xl"
                        p={2}
                        minW="220px"
                        shadow="xl"
                        zIndex={1500}
                        position="relative"
                        data-chakra-component="MenuList"
                        role="menu"
                        aria-labelledby="user-menu-button"
                      >
                      {/* Hidden description for screen readers */}
                      <div id="user-menu-description" className="sr-only">
                        User account menu with profile options and logout
                      </div>
                      {/* User Info Header */}
                      <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.100" mb={2}>
                        <Text fontWeight="600" fontSize="sm" color="text-primary">
                          {user?.firstName} {user?.lastName}
                        </Text>
                        <Text fontSize="xs" color="text-tertiary">
                          User Menu
                        </Text>
                      </Box>

                      {/* Menu Items */}
                      <MenuItem
                        icon={<Icon as={FiFolderPlus} />}
                        onClick={() => navigate('/startups?filter=my-projects')}
                        borderRadius="md"
                        _hover={{ bg: 'brand.50' }}
                        _focus={{ bg: 'brand.50' }}
                      >
                        My Projects
                      </MenuItem>
                      
                      <MenuItem
                        icon={<Icon as={FiUser} />}
                        onClick={() => navigate('/profile')}
                        borderRadius="md"
                        _hover={{ bg: 'brand.50' }}
                        _focus={{ bg: 'brand.50' }}
                      >
                        My Profile
                      </MenuItem>

                      <MenuItem
                        icon={<Icon as={FiUsers} />}
                        onClick={() => navigate('/applications/mine')}
                        borderRadius="md"
                        _hover={{ bg: 'brand.50' }}
                        _focus={{ bg: 'brand.50' }}
                      >
                        My Applications
                      </MenuItem>
                      
                      <MenuDivider />
                      
                      <MenuItem
                        icon={<Icon as={FiLogOut} />}
                        onClick={handleLogout}
                        borderRadius="md"
                        color="red.600"
                        _hover={{ bg: 'red.50', color: 'red.700' }}
                        _focus={{ bg: 'red.50', color: 'red.700' }}
                      >
                        Logout
                      </MenuItem>
                    </MenuList>
                  </Portal>
                  </Menu>
                </HStack>
              ) : (
                <HStack 
                  spacing={3}
                  alignItems="center"
                  display={{ base: 'none', sm: 'flex' }}
                  flexShrink={0}
                >
                  <Button
                    as={RouterLink}
                    to="/login"
                    variant="ghost"
                    size="md"
                    whiteSpace="nowrap"
                  >
                    Sign In
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/register"
                    variant="asymmetric"
                    size="md"
                    whiteSpace="nowrap"
                  >
                    Sign Up
                  </Button>
                </HStack>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Mobile menu */}
      <Drawer 
        isOpen={isOpen} 
        placement="left" 
        onClose={onClose} 
        autoFocus={true} 
        returnFocusOnClose={true}
      >
        <DrawerOverlay />
        <DrawerContent className="glass-panel" id="mobile-navigation">
          <Box as="nav" role="navigation" aria-label="Mobile Navigation" p={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack justify="space-between" align="center" mb={8}>
                  {logoError ? (
                    <Text fontSize="xl" fontWeight="800" className="gradient-text">
                      KolaboLab
                    </Text>
                  ) : (
                    <Image
                      src="/kolabolab-logo.png"
                      alt="KolaboLab - Connect, Collaborate, Grow"
                      height="32px"
                      maxH="32px"
                      objectFit="contain"
                      display="block"
                      onError={() => setLogoError(true)}
                    />
                  )}
                  <IconButton
                    size="md"
                    icon={<CloseIcon boxSize={4} />}
                    aria-label="Close Navigation"
                    onClick={onClose}
                    variant="ghost"
                  />
                </HStack>
              </Box>
              
              <VStack spacing={3} align="stretch">
                <ChakraLink
                  as={RouterLink}
                  to="/startups"
                  px={4}
                  py={3}
                  w="100%"
                  rounded="lg"
                  minH="48px"
                  fontWeight="500"
                  _hover={{ bg: "rgba(255, 149, 0, 0.08)" }}
                  onClick={onClose}
                  className="startup-context"
                >
                  <HStack>
                    <Text>🚀</Text>
                    <Text>Startups</Text>
                  </HStack>
                </ChakraLink>
                
                <ChakraLink
                  as={RouterLink}
                  to="/search"
                  px={4}
                  py={3}
                  w="100%"
                  rounded="lg"
                  minH="48px"
                  fontWeight="500"
                  _hover={{ bg: "rgba(27, 42, 74, 0.08)" }}
                  onClick={onClose}
                >
                  <HStack>
                    <Text>🔍</Text>
                    <Text>Search</Text>
                  </HStack>
                </ChakraLink>
                
                {isAuthenticated ? (
                  <>
                    {/* User Profile Section */}
                    <Box 
                      px={4} 
                      py={4} 
                      bg="brand.50" 
                      rounded="xl" 
                      border="1px solid" 
                      borderColor="brand.100"
                      mb={4}
                    >
                      <HStack spacing={3}>
                        <Avatar
                          size="md"
                          src={user?.avatar}
                          name={`${user?.firstName} ${user?.lastName}`}
                          border="2px solid"
                          borderColor="accent.200"
                        />
                        <VStack spacing={0} align="start" flex="1">
                          <Text fontWeight="700" fontSize="md">
                            {user?.firstName} {user?.lastName}
                          </Text>
                          {user?.roles?.includes('investor') && (
                            <Badge
                              variant="subtle"
                              colorScheme="green"
                              fontSize="xs"
                              mt={1}
                            >
                              <Icon as={FiTrendingUp} mr={1} w={3} h={3} />
                              Investor
                            </Badge>
                          )}
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Navigation Links */}
                    <ChakraLink
                      as={RouterLink}
                      to="/startups?filter=my-projects"
                      px={4}
                      py={3}
                      w="100%" 
                      rounded="lg"
                      minH="48px"
                      fontWeight="500"
                      _hover={{ bg: "brand.50" }}
                      onClick={onClose}
                    >
                      <HStack>
                        <Icon as={FiFolderPlus} />
                        <Text>My Projects</Text>
                      </HStack>
                    </ChakraLink>
                    
                    <ChakraLink
                      as={RouterLink}
                      to="/profile"
                      px={4}
                      py={3}
                      w="100%"
                      rounded="lg"
                      minH="48px"
                      fontWeight="500"
                      _hover={{ bg: "brand.50" }}
                      onClick={onClose}
                    >
                      <HStack>
                        <Icon as={FiUser} />
                        <Text>My Profile</Text>
                      </HStack>
                    </ChakraLink>
                    
                    <ChakraLink
                      as={RouterLink}
                      to="/dashboard"
                      px={4}
                      py={3}
                      w="100%" 
                      rounded="lg"
                      minH="48px"
                      fontWeight="500"
                      _hover={{ bg: "rgba(27, 42, 74, 0.08)" }}
                      onClick={onClose}
                    >
                      <HStack>
                        <Icon as={FiUsers} />
                        <Text>Dashboard</Text>
                      </HStack>
                    </ChakraLink>

                    <ChakraLink
                      as={RouterLink}
                      to="/notifications"
                      px={4}
                      py={3}
                      w="100%"
                      rounded="lg"
                      minH="48px"
                      fontWeight="500"
                      _hover={{ bg: "rgba(27, 42, 74, 0.08)" }}
                      onClick={onClose}
                    >
                      <HStack>
                        <Icon as={FiBell} />
                        <Text>Notifications</Text>
                      </HStack>
                    </ChakraLink>

                    <ChakraLink
                      as={RouterLink}
                      to="/messages"
                      px={4}
                      py={3}
                      w="100%"
                      rounded="lg"
                      minH="48px"
                      fontWeight="500"
                      _hover={{ bg: "rgba(27, 42, 74, 0.08)" }}
                      onClick={onClose}
                    >
                      <HStack>
                        <Icon as={FiMessageSquare} />
                        <Text>Messages</Text>
                        <UnreadBadge />
                      </HStack>
                    </ChakraLink>

                    <ChakraLink
                      as={RouterLink}
                      to="/applications/mine"
                      px={4}
                      py={3}
                      w="100%"
                      rounded="lg"
                      minH="48px"
                      fontWeight="500"
                      _hover={{ bg: "rgba(27, 42, 74, 0.08)" }}
                      onClick={onClose}
                    >
                      <HStack>
                        <Icon as={FiUsers} />
                        <Text>My Applications</Text>
                      </HStack>
                    </ChakraLink>

                    {user?.roles?.includes('investor') && (
                      <ChakraLink
                        as={RouterLink}
                        to="/investments"
                        px={4}
                        py={3}
                        w="100%"
                        rounded="lg"
                        minH="48px"
                        fontWeight="500"
                        _hover={{ bg: "rgba(82, 196, 26, 0.08)" }}
                        onClick={onClose}
                        className="investor-context"
                      >
                        <HStack>
                          <Icon as={FiTrendingUp} />
                          <Text>Investments</Text>
                        </HStack>
                      </ChakraLink>
                    )}

                    {user?.roles?.includes('admin') && (
                      <ChakraLink
                        as={RouterLink}
                        to="/admin"
                        px={4}
                        py={3}
                        w="100%"
                        rounded="lg"
                        minH="48px"
                        fontWeight="500"
                        _hover={{ bg: "rgba(27, 42, 74, 0.08)" }}
                        onClick={onClose}
                      >
                        <HStack>
                          <Icon as={FiShield} />
                          <Text>Admin</Text>
                        </HStack>
                      </ChakraLink>
                    )}
                    
                    <Button
                      as={RouterLink}
                      to="/create-startup"
                      variant="startup"
                      size="lg"
                      leftIcon={<AddIcon />}
                      width="100%"
                      mt={4}
                      onClick={onClose}
                    >
                      Create Startup
                    </Button>
                    
                    <Button
                      onClick={() => {
                        handleLogout();
                        onClose();
                      }}
                      variant="outline"
                      colorScheme="red"
                      size="lg"
                      width="100%"
                      mt={2}
                      leftIcon={<FiLogOut />}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      as={RouterLink}
                      to="/login"
                      variant="ghost"
                      size="lg"
                      width="100%"
                      height="48px"
                      minHeight="48px"
                      onClick={onClose}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="md"
                      fontWeight="500"
                      lineHeight="1"
                      py={0}
                    >
                      Sign In
                    </Button>
                    
                    <Button
                      as={RouterLink}
                      to="/register"
                      variant="asymmetric"
                      size="lg"
                      width="100%"
                      height="48px"
                      minHeight="48px"
                      mt={2}
                      onClick={onClose}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="md"
                      fontWeight="500"
                      lineHeight="1"
                      py={0}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </VStack>
            </VStack>
          </Box>
        </DrawerContent>
      </Drawer>
    </>
  )
})