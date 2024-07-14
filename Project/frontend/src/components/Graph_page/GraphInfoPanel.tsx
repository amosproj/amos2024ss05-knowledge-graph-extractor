import React from 'react';
import {
  Drawer,
  Chip,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface GraphInfoPanelProps {
  open: boolean;
  toggleDrawer: () => void;
  graphData: {
    document_name: string;
    graph_created_at: string;
  };
  keywords: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchGraph: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

const drawerWidth = 450;

const GraphInfoPanel: React.FC<GraphInfoPanelProps> = ({
  open,
  toggleDrawer,
  graphData,
  keywords,
  searchQuery,
  setSearchQuery,
  searchGraph,
}) => {
  return (
    <Drawer
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px', // Height of AppBar
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Box sx={{ overflow: 'auto', padding: 2 }}>
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="h6">Document Information</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1">Document Name</Typography>
            <Typography variant="body2" color="text.secondary">
              {graphData.document_name}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1">Created At</Typography>
            <Typography variant="body2" color="text.secondary">
              {graphData.graph_created_at}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="h6">Graph Keywords</Typography>
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 1 }}
            >
              {keywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onClick={() => setSearchQuery(keyword)}
                  sx={{ margin: '2px' }}
                  clickable
                />
              ))}
            </Box>
          </CardContent>
        </Card>
        <TextField
          placeholder="Search for keywords"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={searchGraph}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: '10px' }}
        />
        <TextField
          placeholder="Answer to your search will be displayed here!"
          fullWidth
          multiline
          rows={8}
          InputProps={{
            readOnly: true,
          }}
          sx={{ marginBottom: '10px' }}
        />
      </Box>
    </Drawer>
  );
};

export default GraphInfoPanel;
