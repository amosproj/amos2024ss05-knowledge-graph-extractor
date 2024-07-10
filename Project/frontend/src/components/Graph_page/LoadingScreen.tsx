import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ marginLeft: '10px' }}>
        Loading graph...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
