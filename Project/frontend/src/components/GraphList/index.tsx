import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import {
  GRAPH_LIST_API_PATH,
  GraphStatus,
  GRAPH_DELETE_API_PATH,
} from '../../constant';

import './index.css';

interface IGraphList {
  id: string;
  name: string;
  status: GraphStatus;
  location: string;
  created_at: string;
  updated_at: string | null;
}

const getStatusText = (status: GraphStatus) => {
  return status === GraphStatus.DOC_UPLOADED ? 'Document uploaded' : 'Graph generated';
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString();
};

const GraphList = () => {
  const [graphs, setGraphs] = React.useState<IGraphList[]>([]);
  const [offset, setOffset] = React.useState<number>(0);
  const [limit, setLimit] = React.useState<number>(100);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const fetchGraphs = React.useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load the knowledge graph');
      }
      const graphData = await response.json();
      setGraphs(graphData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteGraph = React.useCallback(async (graphId: string) => {
    const requestURL = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_DELETE_API_PATH}/${graphId}`;
    try {
      const response = await fetch(requestURL, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete the knowledge graph');
      }
      const listURL = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_LIST_API_PATH}?offset=${offset}&limit=${limit}`;
      await fetchGraphs(listURL);
    } catch (e: any) {
      setError(e.message);
    }
  }, [offset, limit, fetchGraphs]);

  React.useEffect(() => {
    const listURL = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_LIST_API_PATH}?offset=${offset}&limit=${limit}`;
    fetchGraphs(listURL);
  }, [offset, limit, fetchGraphs]);

  return (
    <TableContainer component={Paper}>
      {isLoading && (
        <Box className="loading_graph_list">
          <CircularProgress />
          <p>Loading existing knowledge graphs...</p>
        </Box>
      )}
      {error && (
        <Alert severity="error" className="error_graph_list">
          {error}
        </Alert>
      )}
       {!isLoading && !error && (
        <Table sx={{ minWidth: 650 }} aria-label="knowledge graph table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Created at</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {graphs.map((graph) => (
              <TableRow
                key={graph.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {graph.name}
                </TableCell>
                <TableCell>{formatDate(graph.created_at)}</TableCell>
                <TableCell>{getStatusText(graph.status)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/graph/${graph.id}`)}
                    >
                      View
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default GraphList;

