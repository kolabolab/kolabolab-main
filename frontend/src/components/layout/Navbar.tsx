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
  useColorModeValue,
  Stack,
  Avatar,
  Text,
  Link as ChakraLink,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons'
import { useAuth } from '../../hooks/useAuth'

const NavLink = ({ children, to }: { children: React.ReactNode; to: string }) => (
  <ChakraLink
    as={RouterLink}
    to={to}
    px={2}
    py={1}
    rounded="md"
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    fontWeight="medium"
  >
    {children}
  </ChakraLink>
)

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
        bg={useColorModeValue('white', 'gray.900')} 
        px={4} 
        shadow="sm"
        borderBottom="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        position="sticky"
        top={0}
        zIndex={1000}
      >
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Toggle Navigation"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />

          <HStack spacing={8} alignItems="center">
            <Box>
              <ChakraLink
                as={RouterLink}
                to="/"
                fontSize="xl"
                fontWeight="bold"
                color="brand.500"
                _hover={{ textDecoration: 'none' }}
              >
                KolaboLab
              </ChakraLink>
            </Box>
            <HStack
              as="nav"
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
            >
              <NavLink to="/startups">Startups</NavLink>
              <NavLink to="/search">Search</NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/collaborations">Collaborations</NavLink>
                </>
              )}
            </HStack>
          </HStack>

          <Flex alignItems="center">
            {isAuthenticated ? (
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/create-startup"
                  variant="solid"
                  colorScheme="brand"
                  size="sm"
                  leftIcon={<AddIcon />}
                  display={{ base: 'none', md: 'flex' }}
                >
                  Create Startup
                </Button>
                
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded="full"
                    variant="link"
                    cursor="pointer"
                    minW={0}
                  >
                    <Avatar
                      size="sm"
                      src={user?.avatar}
                      name={`${user?.firstName} ${user?.lastName}`}
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={RouterLink} to="/profile">
                      <VStack spacing={0} align="start">
                        <Text fontWeight="bold">
                          {user?.firstName} {user?.lastName}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          @{user?.username}
                        </Text>
                      </VStack>
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem as={RouterLink} to="/dashboard">
                      Dashboard
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/profile">
                      Profile Settings
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/collaborations">
                      Collaborations
                    </MenuItem>
                    {user?.roles?.includes('investor') && (
                      <MenuItem as={RouterLink} to="/investments">
                        Investments
                      </MenuItem>
                    )}
                    <MenuDivider />
                    <MenuItem onClick={handleLogout} color="red.500">
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            ) : (
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  variant="solid"
                  colorScheme="brand"
                  size="sm"
                >
                  Sign Up
                </Button>
              </HStack>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Mobile menu */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <Box p={4}>
            <VStack spacing={4} align="stretch">
              <NavLink to="/startups">Startups</NavLink>
              <NavLink to="/search">Search</NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/collaborations">Collaborations</NavLink>
                  <NavLink to="/create-startup">Create Startup</NavLink>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    colorScheme="red"
                    size="sm"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Sign In</NavLink>
                  <NavLink to="/register">Sign Up</NavLink>
                </>
              )}
            </VStack>
          </Box>
        </DrawerContent>
      </Drawer>
    </>
  )
}