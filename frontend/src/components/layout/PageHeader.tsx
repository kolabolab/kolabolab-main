import React from 'react';
import { Box, Container, Flex, HStack, Heading, Text } from '@chakra-ui/react';

/**
 * Shared page chrome.
 *
 * Before this existed every page invented its own header: some centred with a
 * centred lede, some left-aligned, container widths ranging from 4xl to 7xl,
 * and vertical padding from py={8} to py={20}. That read as several different
 * products stitched together.
 *
 * One editorial language, matching the landing page: accent rule + uppercase
 * eyebrow, left-aligned tight-tracked H1, optional lede on a readable measure,
 * optional actions pinned right on desktop.
 */

export interface PageHeaderProps {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: React.ReactNode;
  /** Supporting sentence. Keep it to one line of real information. */
  lede?: React.ReactNode;
  /** Buttons / controls, right-aligned on desktop. */
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, lede, actions }) => (
  <Box as="header" mb={{ base: 8, md: 10 }}>
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'flex-start', md: 'flex-end' }}
      justify="space-between"
      gap={{ base: 5, md: 8 }}
    >
      <Box minW="0">
        {eyebrow && (
          <HStack spacing={3} mb={3}>
            <Box w="24px" h="2px" bg="accent.500" flexShrink={0} aria-hidden="true" />
            <Text
              as="span"
              fontFamily="heading"
              fontSize="xs"
              fontWeight="600"
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="text-secondary"
            >
              {eyebrow}
            </Text>
          </HStack>
        )}
        <Heading
          as="h1"
          fontSize={{ base: '1.875rem', md: '2.5rem' }}
          lineHeight="1.05"
          letterSpacing="-0.03em"
        >
          {title}
        </Heading>
        {lede && (
          <Text mt={3} color="text-secondary" maxW="60ch" lineHeight="1.6">
            {lede}
          </Text>
        )}
      </Box>
      {actions && (
        <HStack spacing={3} flexShrink={0} flexWrap="wrap">
          {actions}
        </HStack>
      )}
    </Flex>
  </Box>
);

export interface PageShellProps {
  children: React.ReactNode;
  /** Narrow for forms/reading, default for lists/dashboards. */
  width?: 'default' | 'narrow';
}

/** Consistent container width + vertical rhythm for every routed page. */
export const PageShell: React.FC<PageShellProps> = ({ children, width = 'default' }) => (
  <Box as="main" id="main-content" minH="70vh">
    <Container
      maxW={width === 'narrow' ? '3xl' : '7xl'}
      px={{ base: 5, md: 8 }}
      py={{ base: 8, md: 12 }}
    >
      {children}
    </Container>
  </Box>
);

export default PageHeader;
