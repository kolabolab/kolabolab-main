import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Spinner,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';
import { adminAPI } from '../../services/apiClient';
import type { AnalyticsResponse, PeriodGranularity } from '../../types/analytics';
import GranularitySelector from './components/GranularitySelector';
import TimeSeriesChart from './components/TimeSeriesChart';
import PlatformMetricsGrid from './components/PlatformMetricsGrid';
import PopularRolesList from './components/PopularRolesList';
import ActivityFeed from './components/ActivityFeed';

const AnalyticsSection: React.FC = () => {
  const [period, setPeriod] = useState<PeriodGranularity>('weekly');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.800');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminAPI.getAnalytics(period);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <Box>
        <Heading size="md" mb={4}>Analytics</Heading>
        <Box display="flex" justifyContent="center" py={8}>
          <Spinner size="lg" color="interactive-accent" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Heading size="md" mb={4}>Analytics</Heading>
        <VStack spacing={4} py={8}>
          <Text color="red.500">{error}</Text>
          <Button onClick={fetchAnalytics} colorScheme="brand" size="sm">
            Retry
          </Button>
        </VStack>
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box>
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
        <Heading size="md">Analytics</Heading>
        <GranularitySelector value={period} onChange={setPeriod} />
      </HStack>

      <VStack spacing={6} align="stretch">
        {/* Platform Metrics */}
        <PlatformMetricsGrid metrics={data.platformMetrics} />

        {/* Time Series Charts */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          <Card bg={cardBg}>
            <CardBody>
              <TimeSeriesChart
                title="Signups"
                data={data.timeSeries.signups}
                color="green.400"
              />
            </CardBody>
          </Card>
          <Card bg={cardBg}>
            <CardBody>
              <TimeSeriesChart
                title="Startups Created"
                data={data.timeSeries.startups}
                color="blue.400"
              />
            </CardBody>
          </Card>
          <Card bg={cardBg}>
            <CardBody>
              <TimeSeriesChart
                title="Applications"
                data={data.timeSeries.applications}
                color="purple.400"
              />
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Popular Roles and Activity Feed */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card bg={cardBg}>
            <CardBody>
              <PopularRolesList roles={data.popularRoles} />
            </CardBody>
          </Card>
          <Card bg={cardBg}>
            <CardBody>
              <ActivityFeed events={data.recentActivity} />
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default AnalyticsSection;
