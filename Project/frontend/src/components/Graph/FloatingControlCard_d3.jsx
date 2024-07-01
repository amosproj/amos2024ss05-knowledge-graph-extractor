import React from 'react';
import { Card, CardContent, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const FloatingControlCard = ({ layout, setLayout }) => {
  return (
    <Card
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        width: '300px',
        padding: '16px',
        background: '#121826',
        color: '#fff',
        zIndex: 1000,
      }}
    >
      <CardContent>
        <FormControl fullWidth margin="normal">
          <InputLabel style={{ color: '#fff' }}>Layout</InputLabel>
          <Select
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            style={{ color: '#fff' }}
          >
            <MenuItem value="force">Force-Directed</MenuItem>
            <MenuItem value="hierarchical">Hierarchical</MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
};

export default FloatingControlCard;