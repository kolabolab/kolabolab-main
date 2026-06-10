import React from 'react';
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import type { TimeSeriesDataPoint } from '../../../types/analytics';

interface TimeSeriesChartProps {
  title: string;
  data: TimeSeriesDataPoint[];
  color: string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ title, data, color }) => {
  if (!data || data.length === 0) {
    return (
      <Box>
        <Heading size="sm" mb={3}>{title}</Heading>
        <Text color="gray.500" fontSize="sm">No data available</Text>
      </Box>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Box>
      <Heading size="sm" mb={3}>{title}</Heading>
      <VStack spacing={2} align="stretch">
        {data.map((point) => (
          <HStack key={point.period} spacing={3}>
            <Text fontSize="xs" minW="80px" color="gray.600" flexShrink={0}>
              {point.period}
            </Text>
            <Box flex={1} position="relative">
              <Box
                bg={color}
                h="20px"
                borderRadius="sm"
                width={`${(point.count / maxCount) * 100}%`}
                minW={point.count > 0 ? '4px' : '0px'}
                transition="width 0.3s ease"
              />
            </Box>
            <Text fontSize="xs" fontWeight="bold" minW="30px" textAlign="right" flexShrink={0}>
              {point.count}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default TimeSeriesChart;
