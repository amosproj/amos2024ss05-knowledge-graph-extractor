import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SliderControl from './SliderControl';

const FloatingControlCard = ({
  layout,
  setLayout,
  physicsOptions,
  handlePhysicsChange,
  restartStabilization,
}) => {
  const handleSliderChange = (name) => (event, value) => {
    handlePhysicsChange(name, value);
    restartStabilization();
  };

  const renderSliders = () => {
    switch (layout) {
      case 'barnesHut':
        return (
          <Box>
            <SliderControl
              label="Gravitational Constant"
              value={physicsOptions.gravitationalConstant}
              min={-30000}
              max={0}
              step={1000}
              onChange={handleSliderChange('gravitationalConstant')}
            />
            <SliderControl
              label="Spring Length"
              value={physicsOptions.springLength}
              min={50}
              max={300}
              step={10}
              onChange={handleSliderChange('springLength')}
            />
            <SliderControl
              label="Spring Constant"
              value={physicsOptions.springConstant}
              min={0.01}
              max={0.5}
              step={0.01}
              onChange={handleSliderChange('springConstant')}
            />
            <SliderControl
              label="Damping"
              value={physicsOptions.damping}
              min={0.01}
              max={1}
              step={0.01}
              onChange={handleSliderChange('damping')}
            />
          </Box>
        );
      case 'forceAtlas2Based':
        return (
          <Box>
            <SliderControl
              label="Gravitational Constant"
              value={physicsOptions.gravitationalConstant}
              min={-200}
              max={0}
              step={10}
              onChange={handleSliderChange('gravitationalConstant')}
            />
            <SliderControl
              label="Spring Length"
              value={physicsOptions.springLength}
              min={50}
              max={300}
              step={10}
              onChange={handleSliderChange('springLength')}
            />
            <SliderControl
              label="Spring Constant"
              value={physicsOptions.springConstant}
              min={0.01}
              max={0.5}
              step={0.01}
              onChange={handleSliderChange('springConstant')}
            />
            <SliderControl
              label="Damping"
              value={physicsOptions.damping}
              min={0.01}
              max={1}
              step={0.01}
              onChange={handleSliderChange('damping')}
            />
          </Box>
        );
      case 'hierarchical':
        return (
          <Box>
            <SliderControl
              label="Level Separation"
              value={physicsOptions.levelSeparation}
              min={50}
              max={500}
              step={10}
              onChange={handleSliderChange('levelSeparation')}
            />
            <SliderControl
              label="Node Spacing"
              value={physicsOptions.nodeSpacing}
              min={50}
              max={200}
              step={10}
              onChange={handleSliderChange('nodeSpacing')}
            />
            <SliderControl
              label="Tree Spacing"
              value={physicsOptions.treeSpacing}
              min={50}
              max={500}
              step={10}
              onChange={handleSliderChange('treeSpacing')}
            />
            <SliderControl
              label="Block Shifting"
              value={physicsOptions.blockShifting ? 1 : 0}
              min={0}
              max={1}
              step={1}
              onChange={handleSliderChange('blockShifting')}
            />
            <SliderControl
              label="Edge Minimization"
              value={physicsOptions.edgeMinimization ? 1 : 0}
              min={0}
              max={1}
              step={1}
              onChange={handleSliderChange('edgeMinimization')}
            />
            <SliderControl
              label="Parent Centralization"
              value={physicsOptions.parentCentralization ? 1 : 0}
              min={0}
              max={1}
              step={1}
              onChange={handleSliderChange('parentCentralization')}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Direction</InputLabel>
              <Select
                value={physicsOptions.direction}
                onChange={(e) => {
                  handlePhysicsChange('direction', e.target.value);
                  restartStabilization();
                }}
              >
                <MenuItem value="UD">UD</MenuItem>
                <MenuItem value="DU">DU</MenuItem>
                <MenuItem value="LR">LR</MenuItem>
                <MenuItem value="RL">RL</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Sort Method</InputLabel>
              <Select
                value={physicsOptions.sortMethod}
                onChange={(e) => {
                  handlePhysicsChange('sortMethod', e.target.value);
                  restartStabilization();
                }}
              >
                <MenuItem value="hubsize">Hubsize</MenuItem>
                <MenuItem value="directed">Directed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Shake Towards</InputLabel>
              <Select
                value={physicsOptions.shakeTowards}
                onChange={(e) => {
                  handlePhysicsChange('shakeTowards', e.target.value);
                  restartStabilization();
                }}
              >
                <MenuItem value="roots">Roots</MenuItem>
                <MenuItem value="leaves">Leaves</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 'repulsion':
        return (
          <Box>
            <SliderControl
              label="Node Distance"
              value={physicsOptions.nodeDistance}
              min={50}
              max={500}
              step={10}
              onChange={handleSliderChange('nodeDistance')}
            />
            <SliderControl
              label="Central Gravity"
              value={physicsOptions.centralGravity}
              min={0}
              max={1}
              step={0.01}
              onChange={handleSliderChange('centralGravity')}
            />
            <SliderControl
              label="Spring Length"
              value={physicsOptions.springLength}
              min={50}
              max={300}
              step={10}
              onChange={handleSliderChange('springLength')}
            />
            <SliderControl
              label="Spring Constant"
              value={physicsOptions.springConstant}
              min={0.01}
              max={0.5}
              step={0.01}
              onChange={handleSliderChange('springConstant')}
            />
            <SliderControl
              label="Damping"
              value={physicsOptions.damping}
              min={0.01}
              max={1}
              step={0.01}
              onChange={handleSliderChange('damping')}
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
        right: '46px',
        width: '300px',
        // background: '#121826',
        color: '#fff',
        zIndex: 1000,
      }}
    >
      <Accordion style={{ backgroundColor: '#0d1117' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: '#fff' }} />}
          style={{ color: '#c9d1d9' }}
        >
          <Typography>Physics Options</Typography>
        </AccordionSummary>
        <AccordionDetails style={{ color: '#c9d1d9' }}>
          <CardContent>
            <FormControl fullWidth margin="normal">
              <InputLabel style={{ color: '#fff' }}>Layout</InputLabel>
              <Select
                value={layout}
                onChange={(e) => {
                  setLayout(e.target.value);
                  restartStabilization();
                }}
                style={{ color: '#fff' }}
              >
                <MenuItem value="barnesHut">Barnes Hut</MenuItem>
                <MenuItem value="forceAtlas2Based">
                  Force Atlas 2 Based
                </MenuItem>
                <MenuItem value="hierarchicalRepulsion">
                  Hierarchical Repulsion
                </MenuItem>
                <MenuItem value="repulsion">Repulsion</MenuItem>
                <MenuItem value="hierarchical">Hierarchical</MenuItem>
              </Select>
            </FormControl>
            {renderSliders()}
            <SliderControl
              label="Stabilization Iterations"
              value={physicsOptions.iterations}
              min={0}
              max={5000}
              step={100}
              onChange={handleSliderChange('iterations')}
            />
          </CardContent>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default FloatingControlCard;
