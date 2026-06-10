import React from 'react';
import { ButtonGroup, Button } from '@chakra-ui/react';
import type { PeriodGranularity } from '../../../types/analytics';

interface GranularitySelectorProps {
  value: PeriodGranularity;
  onChange: (period: PeriodGranularity) => void;
}

const GranularitySelector: React.FC<GranularitySelectorProps> = ({ value, onChange }) => {
  const options: { label: string; value: PeriodGranularity }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  return (
    <ButtonGroup size="sm" isAttached variant="outline">
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => onChange(option.value)}
          colorScheme={value === option.value ? 'brand' : 'gray'}
          variant={value === option.value ? 'solid' : 'outline'}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default GranularitySelector;
