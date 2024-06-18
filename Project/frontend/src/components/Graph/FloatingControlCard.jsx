import React from 'react';
import { Card, CardContent, FormControl, InputLabel, Select, MenuItem, Slider, Typography, Box } from '@mui/material';

const FloatingControlCard = ({ layout, setLayout, physicsOptions, handlePhysicsChange }) => {
  const renderSliders = () => {
    switch (layout) {
      case 'barnesHut':
        return (
          <Box>
            <Typography gutterBottom>Gravitational Constant</Typography>
            <Slider
              value={physicsOptions.gravitationalConstant}
              onChange={(e, value) => handlePhysicsChange('gravitationalConstant', value)}
              min={-30000}
              max={0}
              step={1000}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Length</Typography>
            <Slider
              value={physicsOptions.springLength}
              onChange={(e, value) => handlePhysicsChange('springLength', value)}
              min={50}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Constant</Typography>
            <Slider
              value={physicsOptions.springConstant}
              onChange={(e, value) => handlePhysicsChange('springConstant', value)}
              min={0.01}
              max={0.5}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Damping</Typography>
            <Slider
              value={physicsOptions.damping}
              onChange={(e, value) => handlePhysicsChange('damping', value)}
              min={0.01}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
          </Box>
        );
      case 'forceAtlas2Based':
        return (
          <Box>
            <Typography gutterBottom>Gravitational Constant</Typography>
            <Slider
              value={physicsOptions.gravitationalConstant}
              onChange={(e, value) => handlePhysicsChange('gravitationalConstant', value)}
              min={-200}
              max={0}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Length</Typography>
            <Slider
              value={physicsOptions.springLength}
              onChange={(e, value) => handlePhysicsChange('springLength', value)}
              min={50}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Constant</Typography>
            <Slider
              value={physicsOptions.springConstant}
              onChange={(e, value) => handlePhysicsChange('springConstant', value)}
              min={0.01}
              max={0.5}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Damping</Typography>
            <Slider
              value={physicsOptions.damping}
              onChange={(e, value) => handlePhysicsChange('damping', value)}
              min={0.01}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
          </Box>
        );
      case 'hierarchical':
        return (
          <Box>
            <Typography gutterBottom>Level Separation</Typography>
            <Slider
              value={physicsOptions.levelSeparation}
              onChange={(e, value) => handlePhysicsChange('levelSeparation', value)}
              min={50}
              max={500}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Node Spacing</Typography>
            <Slider
              value={physicsOptions.nodeSpacing}
              onChange={(e, value) => handlePhysicsChange('nodeSpacing', value)}
              min={50}
              max={200}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Tree Spacing</Typography>
            <Slider
              value={physicsOptions.treeSpacing}
              onChange={(e, value) => handlePhysicsChange('treeSpacing', value)}
              min={50}
              max={500}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Block Shifting</Typography>
            <Slider
              value={physicsOptions.blockShifting ? 1 : 0}
              onChange={(e, value) => handlePhysicsChange('blockShifting', value === 1)}
              min={0}
              max={1}
              step={1}
              marks={[{ value: 0, label: 'Off' }, { value: 1, label: 'On' }]}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Edge Minimization</Typography>
            <Slider
              value={physicsOptions.edgeMinimization ? 1 : 0}
              onChange={(e, value) => handlePhysicsChange('edgeMinimization', value === 1)}
              min={0}
              max={1}
              step={1}
              marks={[{ value: 0, label: 'Off' }, { value: 1, label: 'On' }]}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Parent Centralization</Typography>
            <Slider
              value={physicsOptions.parentCentralization ? 1 : 0}
              onChange={(e, value) => handlePhysicsChange('parentCentralization', value === 1)}
              min={0}
              max={1}
              step={1}
              marks={[{ value: 0, label: 'Off' }, { value: 1, label: 'On' }]}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Direction</Typography>
            <Select
              value={physicsOptions.direction}
              onChange={(e) => handlePhysicsChange('direction', e.target.value)}
              style={{ color: '#fff' }}
            >
              <MenuItem value="UD">UD</MenuItem>
              <MenuItem value="DU">DU</MenuItem>
              <MenuItem value="LR">LR</MenuItem>
              <MenuItem value="RL">RL</MenuItem>
            </Select>
            <Typography gutterBottom>Sort Method</Typography>
            <Select
              value={physicsOptions.sortMethod}
              onChange={(e) => handlePhysicsChange('sortMethod', e.target.value)}
              style={{ color: '#fff' }}
            >
              <MenuItem value="hubsize">Hubsize</MenuItem>
              <MenuItem value="directed">Directed</MenuItem>
            </Select>
            <Typography gutterBottom>Shake Towards</Typography>
            <Select
              value={physicsOptions.shakeTowards}
              onChange={(e) => handlePhysicsChange('shakeTowards', e.target.value)}
              style={{ color: '#fff' }}
            >
              <MenuItem value="roots">Roots</MenuItem>
              <MenuItem value="leaves">Leaves</MenuItem>
            </Select>
          </Box>
        );
      case 'repulsion':
        return (
          <Box>
            <Typography gutterBottom>Node Distance</Typography>
            <Slider
              value={physicsOptions.nodeDistance}
              onChange={(e, value) => handlePhysicsChange('nodeDistance', value)}
              min={50}
              max={500}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Central Gravity</Typography>
            <Slider
              value={physicsOptions.centralGravity}
              onChange={(e, value) => handlePhysicsChange('centralGravity', value)}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Length</Typography>
            <Slider
              value={physicsOptions.springLength}
              onChange={(e, value) => handlePhysicsChange('springLength', value)}
              min={50}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Constant</Typography>
            <Slider
              value={physicsOptions.springConstant}
              onChange={(e, value) => handlePhysicsChange('springConstant', value)}
              min={0.01}
              max={0.5}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Damping</Typography>
            <Slider
              value={physicsOptions.damping}
              onChange={(e, value) => handlePhysicsChange('damping', value)}
              min={0.01}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
          </Box>
        );
      default:
        return null;
    }
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
            onChange={(e) => setLayout(e.target.value)}
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
        <Typography gutterBottom>Stabilization Iterations</Typography>
        <Slider
          value={physicsOptions.iterations}
          onChange={(e, value) => handlePhysicsChange('iterations', value)}
          min={0}
          max={5000}
          step={100}
          valueLabelDisplay="auto"
          style={{ color: '#fff' }}
        />
      </CardContent>
    </Card>
  );
};

export default FloatingControlCard;