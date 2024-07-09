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
            <Typography gutterBottom>Gravitational Constant</Typography>
            <Slider
              value={physicsOptions.gravitationalConstant}
              onChange={handleSliderChange('gravitationalConstant')}
              min={-30000}
              max={0}
              step={1000}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Length</Typography>
            <Slider
              value={physicsOptions.springLength}
              onChange={handleSliderChange('springLength')}
              min={50}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Constant</Typography>
            <Slider
              value={physicsOptions.springConstant}
              onChange={handleSliderChange('springConstant')}
              min={0.01}
              max={0.5}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Damping</Typography>
            <Slider
              value={physicsOptions.damping}
              onChange={handleSliderChange('damping')}
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
              onChange={handleSliderChange('gravitationalConstant')}
              min={-200}
              max={0}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Length</Typography>
            <Slider
              value={physicsOptions.springLength}
              onChange={handleSliderChange('springLength')}
              min={50}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Constant</Typography>
            <Slider
              value={physicsOptions.springConstant}
              onChange={handleSliderChange('springConstant')}
              min={0.01}
              max={0.5}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Damping</Typography>
            <Slider
              value={physicsOptions.damping}
              onChange={handleSliderChange('damping')}
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
              onChange={handleSliderChange('levelSeparation')}
              min={50}
              max={500}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Node Spacing</Typography>
            <Slider
              value={physicsOptions.nodeSpacing}
              onChange={handleSliderChange('nodeSpacing')}
              min={50}
              max={200}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Tree Spacing</Typography>
            <Slider
              value={physicsOptions.treeSpacing}
              onChange={handleSliderChange('treeSpacing')}
              min={50}
              max={500}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Block Shifting</Typography>
            <Slider
              value={physicsOptions.blockShifting ? 1 : 0}
              onChange={handleSliderChange('blockShifting')}
              min={0}
              max={1}
              step={1}
              marks={[
                { value: 0, label: 'Off' },
                { value: 1, label: 'On' },
              ]}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Edge Minimization</Typography>
            <Slider
              value={physicsOptions.edgeMinimization ? 1 : 0}
              onChange={handleSliderChange('edgeMinimization')}
              min={0}
              max={1}
              step={1}
              marks={[
                { value: 0, label: 'Off' },
                { value: 1, label: 'On' },
              ]}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Parent Centralization</Typography>
            <Slider
              value={physicsOptions.parentCentralization ? 1 : 0}
              onChange={handleSliderChange('parentCentralization')}
              min={0}
              max={1}
              step={1}
              marks={[
                { value: 0, label: 'Off' },
                { value: 1, label: 'On' },
              ]}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Direction</Typography>
            <Select
              value={physicsOptions.direction}
              onChange={(e) => {
                handlePhysicsChange('direction', e.target.value);
                restartStabilization();
              }}
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
              onChange={(e) => {
                handlePhysicsChange('sortMethod', e.target.value);
                restartStabilization();
              }}
              style={{ color: '#fff' }}
            >
              <MenuItem value="hubsize">Hubsize</MenuItem>
              <MenuItem value="directed">Directed</MenuItem>
            </Select>
            <Typography gutterBottom>Shake Towards</Typography>
            <Select
              value={physicsOptions.shakeTowards}
              onChange={(e) => {
                handlePhysicsChange('shakeTowards', e.target.value);
                restartStabilization();
              }}
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
              onChange={handleSliderChange('nodeDistance')}
              min={50}
              max={500}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Central Gravity</Typography>
            <Slider
              value={physicsOptions.centralGravity}
              onChange={handleSliderChange('centralGravity')}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Length</Typography>
            <Slider
              value={physicsOptions.springLength}
              onChange={handleSliderChange('springLength')}
              min={50}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Spring Constant</Typography>
            <Slider
              value={physicsOptions.springConstant}
              onChange={handleSliderChange('springConstant')}
              min={0.01}
              max={0.5}
              step={0.01}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
            <Typography gutterBottom>Damping</Typography>
            <Slider
              value={physicsOptions.damping}
              onChange={handleSliderChange('damping')}
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
        right: '46px',
        width: '300px',
        // padding: '16px',
        background: '#121826',
        color: '#fff',
        zIndex: 1000,
      }}
    >
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: '#fff' }} />}
          style={{ backgroundColor: '#ff0000', color: '#fff' }}
        >
          <Typography>Physics Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
            <Typography gutterBottom>Stabilization Iterations</Typography>
            <Slider
              value={physicsOptions.iterations}
              onChange={handleSliderChange('iterations')}
              min={0} // Minimum auf 0 gesetzt
              max={5000}
              step={100}
              valueLabelDisplay="auto"
              style={{ color: '#fff' }}
            />
          </CardContent>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default FloatingControlCard;
