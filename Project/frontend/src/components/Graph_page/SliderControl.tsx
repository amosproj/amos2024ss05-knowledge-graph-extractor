import React from 'react';
import { Box, Slider, Typography } from '@mui/material';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (event: Event, value: number | number[]) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
}) => {
  return (
    <Box>
      <Typography gutterBottom>{label}</Typography>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        style={{ color: '#fff' }}
      />
    </Box>
  );
};

export default SliderControl;
