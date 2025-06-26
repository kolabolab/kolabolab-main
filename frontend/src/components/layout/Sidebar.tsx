import React from 'react'
import {
  Box,
  VStack,
  Link,
  Icon,
  Text,
  useColorModeValue,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  FiHome,
  FiSearch,
  FiUsers,
  FiDollarSign,
  FiUser,
  FiSettings,
  FiPlusCircle,
  FiTrendingUp,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

interface SidebarLinkProps {
  to: string
  icon: any
  children: React.ReactNode
  badge?: string | number
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, children, badge }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  
  return (
    <Link
      as={RouterLink}
      to={to}
      display="flex"
      alignItems="center"
      p={3}
      rounded="md"
      bg={isActive ? 'brand.500' : 'transparent'}
      color={isActive ? 'white' : useColorModeValue('gray.700', 'gray.200')}
      _hover={{
        bg: isActive ? 'brand.600' : useColorModeValue('gray.100', 'gray.700'),
        textDecoration: 'none',
      }}
      transition="all 0.2s"
      w="full"
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center">
        <Icon as={icon} mr={3} />
        <Text fontWeight="medium">{children}</Text>
      </Box>
      {badge && (
        <Badge
          colorScheme={isActive ? 'white' : 'brand'}
          variant={isActive ? 'outline' : 'solid'}
          size="sm"
        >
          {badge}
        </Badge>
      )}
    </Link>
  )
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  if (!user) return null

  const isEntrepreneur = user.roles?.includes('entrepreneur')
  const isInvestor = user.roles?.includes('investor')
  const isCollaborator = user.roles?.includes('collaborator')

  return (
    <Box
      position="fixed"
      left={0}
      top="64px" // Height of navbar
      h="calc(100vh - 64px)"
      w="250px"
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      overflowY="auto"
      display={{ base: 'none', md: 'block' }}
      zIndex={100}
    >
      <VStack spacing={1} p={4} align="stretch">
        {/* Main Navigation */}
        <SidebarLink to="/dashboard" icon={FiHome}>
          Dashboard
        </SidebarLink>
        
        <SidebarLink to="/search" icon={FiSearch}>
          Search
        </SidebarLink>

        <Divider my={2} />

        {/* Role-based navigation */}
        {isEntrepreneur && (
          <>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" px={3} pt={2}>
              ENTREPRENEUR
            </Text>
            <SidebarLink to="/create-startup" icon={FiPlusCircle}>
              Create Startup
            </SidebarLink>
            <SidebarLink to="/my-startups" icon={FiTrendingUp}>
              My Startups
            </SidebarLink>
          </>
        )}

        {(isCollaborator || isEntrepreneur) && (
          <>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" px={3} pt={2}>
              COLLABORATION
            </Text>
            <SidebarLink to="/collaborations" icon={FiUsers} badge="3">
              Collaborations
            </SidebarLink>
            <SidebarLink to="/startups" icon={FiSearch}>
              Find Projects
            </SidebarLink>
          </>
        )}

        {isInvestor && (
          <>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" px={3} pt={2}>
              INVESTMENT
            </Text>
            <SidebarLink to="/investments" icon={FiDollarSign} badge="2">
              My Investments
            </SidebarLink>
            <SidebarLink to="/deal-flow" icon={FiTrendingUp}>
              Deal Flow
            </SidebarLink>
          </>
        )}

        <Divider my={2} />

        {/* Settings & Profile */}
        <Text fontSize="xs" fontWeight="bold" color="gray.500" px={3} pt={2}>
          ACCOUNT
        </Text>
        <SidebarLink to="/profile" icon={FiUser}>
          Profile
        </SidebarLink>
        <SidebarLink to="/settings" icon={FiSettings}>
          Settings
        </SidebarLink>
      </VStack>

      {/* User info at bottom */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={4}
        borderTop="1px"
        borderColor={borderColor}
        bg={bg}
      >
        <VStack spacing={1} align="start">
          <Text fontSize="sm" fontWeight="bold">
            {user.firstName} {user.lastName}
          </Text>
          <Text fontSize="xs" color="gray.500">
            @{user.username}
          </Text>
          <Box>
            {user.roles?.map((role) => (
              <Badge
                key={role}
                size="sm"
                colorScheme="brand"
                mr={1}
                mb={1}
                textTransform="capitalize"
              >
                {role}
              </Badge>
            ))}
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}