import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useColorMode,
  useBreakpointValue,
  useDisclosure,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
} from '@chakra-ui/react'
import { 
  FaBars, 
  FaTimes, 
  FaChevronDown, 
  FaChevronRight, 
  FaMoon, 
  FaSun, 
  FaBell 
} from 'react-icons/fa'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: string
  icon?: any
  requiresAuth?: boolean
  roles?: Array<'entrepreneur' | 'investor' | 'collaborator' | 'mentor'>
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Startups',
    children: [
      {
        label: 'Browse Startups',
        subLabel: 'Discover innovative ideas and join teams',
        href: '/startups',
      },
      {
        label: 'Create Startup',
        subLabel: 'Share your idea and find collaborators',
        href: '/startups/create',
        requiresAuth: true,
      },
      {
        label: 'Success Stories',
        subLabel: 'Read testimonials from successful founders',
        href: '/success-stories',
      },
    ],
  },
  {
    label: 'Collaborate',
    href: '/collaborate',
    children: [
      {
        label: 'Find Collaborators',
        subLabel: 'Connect with developers, designers, and experts',
        href: '/collaborate',
      },
      {
        label: 'Volunteer Opportunities',
        subLabel: 'Support startups with your skills pro-bono',
        href: '/volunteer',
      },
    ],
  },
  {
    label: 'Investors',
    children: [
      {
        label: 'Investor Dashboard',
        subLabel: 'Manage your investment portfolio',
        href: '/investors',
        requiresAuth: true,
        roles: ['investor'],
      },
      {
        label: 'Funding Opportunities',
        subLabel: 'Discover startups seeking investment',
        href: '/funding',
      },
      {
        label: 'Angel Network',
        subLabel: 'Connect with other angel investors',
        href: '/angels',
        requiresAuth: true,
      },
    ],
  },
  {
    label: 'Community',
    children: [
      {
        label: 'Events',
        subLabel: 'Join startup events and networking sessions',
        href: '/events',
      },
      {
        label: 'Mentorship',
        subLabel: 'Get guidance from experienced entrepreneurs',
        href: '/mentorship',
      },
      {
        label: 'Resources',
        subLabel: 'Access tools and guides for startups',
        href: '/resources',
      },
    ],
  },
]

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout()
      navigate('/')
    } else {
      navigate('/auth')
    }
  }

  return (
    <Box>
      <Flex
        bg={bg}
        color={useColorModeValue('gray.600', 'white')}
        minH="60px"
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={borderColor}
        align="center"
        position="sticky"
        top={0}
        zIndex={1000}
        role="navigation"
        aria-label="Main navigation"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <FaTimes w={3} h={3} /> : <FaBars w={5} h={5} />}
            variant="ghost"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isOpen}
          />
        </Flex>

        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Link
            as={RouterLink}
            to="/"
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily="heading"
            color={useColorModeValue('brand.500', 'white')}
            fontSize="2xl"
            fontWeight="bold"
            _hover={{ textDecoration: 'none' }}
            _focus={{
              outline: '2px solid',
              outlineColor: 'brand.500',
              outlineOffset: '2px',
            }}
          >
            Kolabolab
          </Link>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify="flex-end"
          direction="row"
          spacing={6}
          align="center"
        >
          {/* Color mode toggle */}
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />

          {isAuthenticated ? (
            <HStack spacing={4}>
              {/* Notifications */}
              <IconButton
                aria-label="Notifications"
                icon={<FaBell />}
                variant="ghost"
                size="sm"
                position="relative"
              >
                <Badge
                  position="absolute"
                  top="-1px"
                  right="-1px"
                  px={2}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  bg="startup.500"
                  color="white"
                >
                  3
                </Badge>
              </IconButton>

              {/* User menu */}
              <Menu>
                <MenuButton as={Button} rounded="full" variant="link" cursor="pointer" minW={0}>
                  <Avatar
                    size="sm"
                    src={user?.avatar}
                    name={`${user?.firstName} ${user?.lastName}`}
                    bg="brand.500"
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/dashboard">
                    Dashboard
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/settings">
                    Settings
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleAuthAction}>
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          ) : (
            <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Button
                as={RouterLink}
                to="/auth"
                fontSize="sm"
                fontWeight={400}
                variant="link"
                color={useColorModeValue('gray.600', 'gray.200')}
                _hover={{
                  color: useColorModeValue('brand.500', 'brand.200'),
                }}
              >
                Sign In
              </Button>
              <Button
                as={RouterLink}
                to="/auth?mode=register"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize="sm"
                fontWeight={600}
                colorScheme="brand"
                bg="brand.500"
                _hover={{
                  bg: 'brand.600',
                }}
              >
                Get Started
              </Button>
            </HStack>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  )
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200')
  const linkHoverColor = useColorModeValue('brand.500', 'white')
  const popoverContentBgColor = useColorModeValue('white', 'gray.800')
  const { user } = useAuthStore()

  const filteredNavItems = NAV_ITEMS.filter(navItem => {
    if (navItem.requiresAuth && !user) return false
    if (navItem.roles && user && !navItem.roles.includes(user.role)) return false
    return true
  })

  return (
    <Stack direction="row" spacing={4}>
      {filteredNavItems.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <Link
                as={RouterLink}
                to={navItem.href ?? '#'}
                p={2}
                fontSize="sm"
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
                _focus={{
                  outline: '2px solid',
                  outlineColor: 'brand.500',
                  outlineOffset: '2px',
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow="xl"
                bg={popoverContentBgColor}
                p={4}
                rounded="xl"
                minW="sm"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      as={RouterLink}
      to={href || '#'}
      role="group"
      display="block"
      p={2}
      rounded="md"
      _hover={{ bg: useColorModeValue('brand.50', 'gray.900') }}
      _focus={{
        outline: '2px solid',
        outlineColor: 'brand.500',
        outlineOffset: '2px',
      }}
    >
      <Stack direction="row" align="center">
        <Box>
          <Text
            transition="all .3s ease"
            _groupHover={{ color: 'brand.400' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
            {subLabel}
          </Text>
        </Box>
        <Flex
          transition="all .3s ease"
          transform="translateX(-10px)"
          opacity={0}
          _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
          justify="flex-end"
          align="center"
          flex={1}
        >
          <Icon color="brand.400" w={5} h={5} as={FaChevronRight} />
        </Flex>
      </Stack>
    </Link>
  )
}

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify="space-between"
        align="center"
        _hover={{
          textDecoration: 'none',
        }}
        _focus={{
          outline: '2px solid',
          outlineColor: 'brand.500',
          outlineOffset: '2px',
        }}
      >
        <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={FaChevronDown}
            transition="all .25s ease-in-out"
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle="solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align="start"
        >
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                as={RouterLink}
                to={child.href || '#'}
                py={2}
                _focus={{
                  outline: '2px solid',
                  outlineColor: 'brand.500',
                  outlineOffset: '2px',
                }}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}