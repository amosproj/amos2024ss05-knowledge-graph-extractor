import React, { useMemo, useCallback } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SliderControl from './SliderControl';

const drawerWidth = 300;

const PersistentDrawerControls = ({
  open,
  toggleDrawer,
  layout,
  setLayout,
  physicsOptions,
  handlePhysicsChange,
  restartStabilization,
}) => {
  const handleSliderChange = useCallback(
    (name) => (event, value) => {
      handlePhysicsChange(name, value);
      restartStabilization();
    },
    [handlePhysicsChange, restartStabilization],
  );

  const renderSliders = useMemo(() => {
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
  }, [layout, physicsOptions, handleSliderChange, restartStabilization]);

  return (
    <Box
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiBox-root': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px', // Height of AppBar
          padding: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1, marginLeft: 2 }}>
          Layout Controls
        </Typography>
      </Box>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Layout Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: '#fff' }}>Layout</InputLabel>
            <Select
              value={layout}
              onChange={(e) => {
                setLayout(e.target.value);
                restartStabilization();
              }}
              sx={{ color: '#fff' }}
            >
              <MenuItem value="barnesHut">Barnes Hut</MenuItem>
              <MenuItem value="forceAtlas2Based">Force Atlas 2 Based</MenuItem>
              <MenuItem value="hierarchicalRepulsion">
                Hierarchical Repulsion
              </MenuItem>
              <MenuItem value="repulsion">Repulsion</MenuItem>
              <MenuItem value="hierarchical">Hierarchical</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Physics Options</Typography>
        </AccordionSummary>
        <AccordionDetails>{renderSliders}</AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default PersistentDrawerControls;
