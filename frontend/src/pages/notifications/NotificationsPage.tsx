import React, { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { useNotificationList, useMarkAllAsRead } from '../../hooks/useNotifications'
import { NotificationItem } from './components/NotificationItem'

const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useNotificationList(page)
  const markAllAsRead = useMarkAllAsRead()

  const cardBg = useColorModeValue('white', 'gray.800')
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  const notifications = data?.notifications ?? []
  const totalPages = data?.pagination?.totalPages ?? 1
  const hasUnread = notifications.some((n) => !n.isRead)

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  return (
    <>
      <Helmet>
        <title>Notifications - KolaboLab</title>
        <meta name="description" content="View your notifications" />
      </Helmet>

      <Box minH="100vh" bg={bgColor}>
        <Container maxW={{ base: '7xl', '2xl': '90%' }} py={8}>
          <VStack spacing={8} align="stretch">
            {/* Page Header */}
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <Box>
                <Heading size="xl" className="gradient-text">
                  Notifications
                </Heading>
                <Text color="gray.600" fontSize="lg" mt={2}>
                  Stay up to date with your activity
                </Text>
              </Box>
              <Button
                colorScheme="brand"
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                isDisabled={!hasUnread}
                isLoading={markAllAsRead.isPending}
              >
                Mark All as Read
              </Button>
            </HStack>

            {/* Notifications List */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" py={8}>
                    <Spinner size="lg" color="brand.500" />
                  </Box>
                ) : isError ? (
                  <VStack spacing={4} py={8}>
                    <Text color="red.500">
                      Failed to load notifications. Please try again.
                    </Text>
                    <Button
                      colorScheme="brand"
                      variant="outline"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </VStack>
                ) : notifications.length === 0 ? (
                  <VStack spacing={4} py={12} textAlign="center">
                    <Text fontSize="lg" color="gray.500">
                      No notifications yet
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      You'll see notifications here when there's activity on your account.
                    </Text>
                  </VStack>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Pagination Controls */}
            {!isLoading && !isError && notifications.length > 0 && totalPages > 1 && (
              <HStack justify="center" spacing={4}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  isDisabled={page <= 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Page {page} of {totalPages}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  isDisabled={page >= totalPages}
                >
                  Next
                </Button>
              </HStack>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default NotificationsPage
