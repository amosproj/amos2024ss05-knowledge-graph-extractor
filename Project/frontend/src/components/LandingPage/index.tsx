import React from 'react';

import { Typography, Container, Box } from '@mui/material';

import "./index.css";
import GraphList from '../GraphList';

const LandingPage = () => {
  return (
    <Container maxWidth="lg">
      <Box className="landing_page_content">
        <Typography variant="h4" component="h4" gutterBottom>
          Welcome to Graph Masters
        </Typography>
        <Typography variant="h6" component="h6" gutterBottom color={theme => theme.palette.text.secondary}>
          Create, View & Query Knowledge Graphs
        </Typography>
      </Box>

      <section className="graph_list_container">
        <GraphList />
      </section>
    </Container>
  );
};

export default LandingPage;
