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

import { GRAPH_LIST_API_PATH, GraphStatus } from '../../constant';

import './index.css';

interface IGraphList {
  id: string;
  name: string;
  status: GraphStatus;
  location: string;
  created_at: string;
  updated_at: string | null;
}

const getStatus = (status: GraphStatus) => {
  if (status === GraphStatus.DOC_UPLOADED) {
    return 'Document uploaded';
  }
  return 'Graph generated';
};

const getDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString();
};

const GraphList = () => {
  const [list, setList] = React.useState<IGraphList[]>([]);
  const [offset, setOffset] = React.useState<number>(0);
  const [limit, setLimit] = React.useState<number>(100);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const API = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_LIST_API_PATH}?offset=${offset}&limit=${limit}`;

    setLoading(true);
    setError(null);

    fetch(API)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Problem occured while loading the knowledge graph');
        }
        return res.json();
      })
      .then((graphData: IGraphList[]) => {
        setList(graphData);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [offset, limit]);

  return (
    <TableContainer component={Paper}>
      {loading && (
        <Box className="loading_graph_list">
          <CircularProgress />
          <p>Existing knowledge graphs list is loading...</p>
        </Box>
      )}
      {error && (
        <Alert severity="error" className="error_graph_list">
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Created at</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>{getDate(row.created_at)}</TableCell>
                <TableCell>{getStatus(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default GraphList;
