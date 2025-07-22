import React from 'react'
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
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons'
import { FiZap, FiTrendingUp, FiUsers, FiSettings, FiLogOut, FiFolderPlus, FiUser, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

const NavLink = ({ children, to, variant = 'default' }: { 
  children: React.ReactNode; 
  to: string;
  variant?: 'default' | 'startup' | 'investor';
}) => {
  const getHoverBg = () => {
    switch (variant) {
      case 'startup': return 'rgba(255, 149, 0, 0.08)';
      case 'investor': return 'rgba(82, 196, 26, 0.08)';
      default: return 'rgba(24, 144, 255, 0.08)';
    }
  };

  return (
    <ChakraLink
      as={RouterLink}
      to={to}
      px={4}
      py={2}
      rounded="lg"
      className="nav-link"
      height="44px"
      minWidth="44px"
      display="inline-flex"
      alignItems="center"
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

export const Navbar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, isAuthenticated, clearAuth } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <>
      <Box 
        className="nav-glass"
        px={0}
        shadow="md"
        position="sticky"
        top={0}
        zIndex={1000}
      >
        <Container maxW="6xl">
          <Flex h={20} alignItems="center" justifyContent="space-between">
            <IconButton
              size="lg"
              width="48px"
              height="48px"
              aria-expanded={isOpen}
              icon={isOpen ? <CloseIcon boxSize={5} /> : <HamburgerIcon boxSize={6} />}
              aria-label="Toggle Navigation Menu"
              display={{ md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
              variant="glass"
              className="interactive-element"
            />

            <HStack spacing={8} alignItems="center">
              {/* Logo */}
              <Box>
                <ChakraLink
                  as={RouterLink}
                  to="/"
                  minH="44px"
                  display="flex"
                  alignItems="center"
                  px={2}
                  _hover={{ textDecoration: 'none' }}
                  className="interactive-element"
                >
                  <HStack spacing={2}>
                    <Icon as={FiZap} color="brand.500" boxSize={6} />
                    <Text
                      fontSize="xl"
                      fontWeight="800"
                      className="gradient-text"
                      fontFamily="heading"
                    >
                      KolaboLab
                    </Text>
                  </HStack>
                </ChakraLink>
              </Box>

              {/* Desktop Navigation */}
              <HStack
                as="nav"
                spacing={2}
                display={{ base: 'none', md: 'flex' }}
              >
                <NavLink to="/startups" variant="startup">Startups</NavLink>
                <NavLink to="/search">Search</NavLink>
                {isAuthenticated && (
                  <>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/collaborations">Collaborations</NavLink>
                    {user?.roles?.includes('investor') && (
                      <NavLink to="/investments" variant="investor">Investments</NavLink>
                    )}
                  </>
                )}
              </HStack>
            </HStack>

            {/* Right side actions */}
            <Flex alignItems="center">
              {isAuthenticated ? (
                <HStack spacing={4}>
                  <Button
                    as={RouterLink}
                    to="/create-startup"
                    variant="startup"
                    size="md"
                    leftIcon={<AddIcon />}
                    display={{ base: 'none', lg: 'flex' }}
                    className="interactive-element"
                  >
                    Create Startup
                  </Button>
                  
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      cursor="pointer"
                      p={2}
                      pr={3}
                      borderRadius="xl"
                      className="interactive-element"
                      _hover={{
                        bg: 'rgba(24, 144, 255, 0.08)',
                        transform: 'translateY(-1px)',
                      }}
                      _active={{
                        bg: 'rgba(24, 144, 255, 0.12)',
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          src={user?.avatar}
                          name={`${user?.firstName} ${user?.lastName}`}
                          border="2px solid"
                          borderColor="brand.100"
                        />
                        <VStack spacing={0} align="start" display={{ base: 'none', lg: 'flex' }}>
                          <Text fontWeight="600" fontSize="sm" lineHeight="1.2">
                            {user?.firstName} {user?.lastName}
                          </Text>
                          <HStack spacing={1}>
                            <Text fontSize="xs" color="gray.500">
                              @{user?.username}
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
                          </HStack>
                        </VStack>
                        <Icon as={FiChevronDown} w={4} h={4} color="gray.500" />
                      </HStack>
                    </MenuButton>
                    <MenuList 
                      className="glass-panel" 
                      border="1px solid"
                      borderColor="gray.200"
                      shadow="xl"
                      borderRadius="xl"
                      py={2}
                      minW="220px"
                    >
                      {/* User Info Header */}
                      <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                        <VStack spacing={1} align="start">
                          <Text fontWeight="700" fontSize="md">
                            {user?.firstName} {user?.lastName}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            @{user?.username}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {user?.email}
                          </Text>
                          {user?.roles?.includes('investor') && (
                            <Badge
                              variant="subtle"
                              colorScheme="green"
                              fontSize="xs"
                              mt={1}
                            >
                              <Icon as={FiTrendingUp} mr={1} w={3} h={3} />
                              Investor Account
                            </Badge>
                          )}
                        </VStack>
                      </Box>

                      {/* Menu Items */}
                      <Box py={1}>
                        <MenuItem 
                          as={RouterLink} 
                          to="/startups?filter=my-projects" 
                          icon={<FiFolderPlus />}
                          fontSize="sm"
                          fontWeight="500"
                          py={3}
                          _hover={{ bg: 'brand.50' }}
                        >
                          My Projects
                        </MenuItem>
                        <MenuItem 
                          as={RouterLink} 
                          to="/profile" 
                          icon={<FiUser />}
                          fontSize="sm"
                          fontWeight="500"
                          py={3}
                          _hover={{ bg: 'brand.50' }}
                        >
                          My Profile
                        </MenuItem>
                        <MenuDivider my={2} />
                        <MenuItem 
                          onClick={handleLogout} 
                          color="red.500" 
                          icon={<FiLogOut />}
                          fontSize="sm"
                          fontWeight="500"
                          py={3}
                          _hover={{ bg: 'red.50', color: 'red.600' }}
                        >
                          Logout
                        </MenuItem>
                      </Box>
                    </MenuList>
                  </Menu>
                </HStack>
              ) : (
                <HStack spacing={3} align="center">
                  <Button
                    as={RouterLink}
                    to="/login"
                    variant="ghost"
                    size="md"
                    className="interactive-element"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    Sign In
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/register"
                    variant="asymmetric"
                    size="md"
                    className="interactive-element"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
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
        <DrawerContent className="glass-panel">
          <Box as="nav" role="navigation" aria-label="Main Navigation" p={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack justify="space-between" align="center" mb={8}>
                  <HStack spacing={2}>
                    <Icon as={FiZap} color="brand.500" boxSize={6} />
                    <Text fontSize="xl" fontWeight="800" className="gradient-text">
                      KolaboLab
                    </Text>
                  </HStack>
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
                  _hover={{ bg: "rgba(24, 144, 255, 0.08)" }}
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
                          borderColor="brand.200"
                        />
                        <VStack spacing={0} align="start" flex="1">
                          <Text fontWeight="700" fontSize="md">
                            {user?.firstName} {user?.lastName}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            @{user?.username}
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
                      _hover={{ bg: "rgba(24, 144, 255, 0.08)" }}
                      onClick={onClose}
                    >
                      <HStack>
                        <Icon as={FiUsers} />
                        <Text>Dashboard</Text>
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
                      onClick={onClose}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      Sign In
                    </Button>
                    
                    <Button
                      as={RouterLink}
                      to="/register"
                      variant="asymmetric"
                      size="lg"
                      width="100%"
                      mt={2}
                      onClick={onClose}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
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
}