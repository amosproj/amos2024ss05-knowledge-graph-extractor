import React from 'react';
import { Card, CardContent, FormControl, InputLabel, Select, MenuItem, Slider, Typography, Box } from '@mui/material';

const FloatingControlCard = ({ layout, setLayout, physicsOptions, handlePhysicsChange }) => {
  const handleSliderChange = (name) => (event, value) => {
    handlePhysicsChange(name, value);
  };

  const renderSliders = () => {
    return (
      <Box>
        <Typography gutterBottom>Iterations</Typography>
        <Slider
          value={physicsOptions.iterations || 0}
          onChange={handleSliderChange('iterations')}
          min={0}
          max={5000}
          step={100}
          valueLabelDisplay="auto"
          style={{ color: '#fff' }}
        />
        <Typography gutterBottom>Barnes Hut Theta</Typography>
        <Slider
          value={physicsOptions.barnesHutTheta || 0.5}
          onChange={handleSliderChange('barnesHutTheta')}
          min={0.1}
          max={1}
          step={0.1}
          valueLabelDisplay="auto"
          style={{ color: '#fff' }}
        />
        <Typography gutterBottom>Gravity</Typography>
        <Slider
          value={physicsOptions.gravity || 1}
          onChange={handleSliderChange('gravity')}
          min={0}
          max={10}
          step={1}
          valueLabelDisplay="auto"
          style={{ color: '#fff' }}
        />
        <Typography gutterBottom>Scaling Ratio</Typography>
        <Slider
          value={physicsOptions.scalingRatio || 10}
          onChange={handleSliderChange('scalingRatio')}
          min={0.1}
          max={10}
          step={0.1}
          valueLabelDisplay="auto"
          style={{ color: '#fff' }}
        />
        <Typography gutterBottom>Edge Weight Influence</Typography>
        <Slider
          value={physicsOptions.edgeWeightInfluence || 1}
          onChange={handleSliderChange('edgeWeightInfluence')}
          min={0}
          max={10}
          step={1}
          valueLabelDisplay="auto"
          style={{ color: '#fff' }}
        />
        <Typography gutterBottom>Edge Length</Typography>
        <Slider
          value={physicsOptions.edgeLength || 100}
          onChange={handleSliderChange('edgeLength')}
          min={50}
          max={2000}
          step={10}
          valueLabelDisplay="auto"
          style={{ color: '#fff' }}
        />
      </Box>
    );
  };

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
            onChange={(e) => {
              setLayout(e.target.value);
              handlePhysicsChange('iterations', physicsOptions.iterations + 1); // Trigger restart
            }}
            style={{ color: '#fff' }}
          >
            <MenuItem value="barnesHut">Barnes Hut</MenuItem>
            <MenuItem value="forceAtlas2Based">Force Atlas 2 Based</MenuItem>
            <MenuItem value="hierarchicalRepulsion">Hierarchical Repulsion</MenuItem>
            <MenuItem value="repulsion">Repulsion</MenuItem>
            <MenuItem value="hierarchical">Hierarchical</MenuItem>
          </Select>
        </FormControl>
        {renderSliders()}
      </CardContent>
    </Card>
  );
};

export default FloatingControlCard;