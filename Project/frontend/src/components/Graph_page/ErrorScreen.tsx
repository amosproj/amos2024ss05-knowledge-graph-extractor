import React from 'react';
import { Box, Typography } from '@mui/material';

const ErrorScreen: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h6">Sorry, an error has occurred!</Typography>
    </Box>
  );
};

export default ErrorScreen;
