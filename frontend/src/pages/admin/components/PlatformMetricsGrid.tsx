import React from 'react';
import {
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';
import type { PlatformMetrics } from '../../../types/analytics';

interface PlatformMetricsGridProps {
  metrics: PlatformMetrics;
}

const PlatformMetricsGrid: React.FC<PlatformMetricsGridProps> = ({ metrics }) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  const items = [
    { label: 'Total Users', value: metrics.totalUsers },
    { label: 'Total Startups', value: metrics.totalStartups },
    { label: 'Total Applications', value: metrics.totalApplications },
    { label: 'Total Messages', value: metrics.totalMessages },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
      {items.map((item) => (
        <Card key={item.label} bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>{item.label}</StatLabel>
              <StatNumber>{item.value}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default PlatformMetricsGrid;
