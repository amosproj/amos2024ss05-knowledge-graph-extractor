import React from 'react';

import { Button, Container, Stack, Typography } from '@mui/material';

import GraphList from '../GraphList';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="lg">
      <Stack direction={'column'} spacing={1} sx={{ padding: 1 }}>
        <Stack>
          <Typography variant="h4" component="h4" gutterBottom>
            Welcome to Graph Masters
          </Typography>
          <Typography
            variant="h6"
            component="h6"
            gutterBottom
            color={(theme) => theme.palette.text.secondary}
          >
            Create, View & Query Knowledge Graphs
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/upload')}
          >
            Create Graph
          </Button>
        </Stack>
      </Stack>

      <section className="graph_list_container">
        <GraphList />
      </section>
    </Container>
  );
};

export default LandingPage;
