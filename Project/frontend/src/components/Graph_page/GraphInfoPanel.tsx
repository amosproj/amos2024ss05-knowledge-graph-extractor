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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SearchResult {
  merged_node: string;
  original_nodes: string[];
  similarity: number;
  individual_similarities: {
    [key: string]: number;
  };
}

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
  performSearch: (query: string) => void;
  searchResults: SearchResult[];
  searchIsLoading: boolean;
  fileId: string;
}

const GraphInfoPanel: React.FC<GraphInfoPanelProps> = ({
  open,
  toggleDrawer,
  graphData,
  keywords,
  searchQuery,
  setSearchQuery,
  performSearch,
  searchResults,
  searchIsLoading,
  fileId,
}) => {
  return (
    <Drawer
      sx={{
        width: open ? 450 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 450,
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
                  onClick={() => {
                    setSearchQuery(keyword);
                    performSearch(keyword);
                  }}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              performSearch(searchQuery);
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon onClick={() => performSearch(searchQuery)} />
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: '10px' }}
        />
        {searchIsLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <CircularProgress size={15} />
            <Box sx={{ ml: 2 }}>Searching...</Box>
          </Box>
        )}
        {searchResults.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {searchResults.map((result, index) => (
              <Accordion key={index}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}a-content`}
                  id={`panel${index}a-header`}
                >
                  <Typography>{result.merged_node}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2">Similarity: {result.similarity.toFixed(4)}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Original Nodes:</Typography>
                  {result.original_nodes.map((node, idx) => (
                    <Box key={idx} sx={{ ml: 2, mt: 1 }}>
                      <Typography>{node}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Similarity: {result.individual_similarities[node].toFixed(4)}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default GraphInfoPanel;