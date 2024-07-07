import * as React from 'react';
import { useNavigate } from 'react-router-dom';
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

import {
  GRAPH_DELETE_API_PATH,
  GRAPH_LIST_API_PATH,
  GraphStatus,
  GENERATE_API_PATH,
  messageSeverity,
} from '../../constant';

import './index.css';
import CustomizedSnackbars from '../Snackbar';

interface IGraphList {
  id: string;
  name: string;
  status: GraphStatus;
  location: string;
  created_at: string;
  updated_at: string | null;
}

interface notification {
  show: boolean;
  severity: messageSeverity;
  message: string;
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
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<notification>({
    show: false,
    severity: messageSeverity.SUCCESS,
    message: '',
  });

  React.useEffect(() => {
    fetchItems(offset);
  }, [offset]);

  const fetchItems = async (offset: number) => {
    const API = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_LIST_API_PATH}?offset=${offset}`;

    setLoading(true);
    setError(null);

    fetch(API)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Problem occurred while loading the knowledge graph');
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
  };

  const handleClick = () => {
    setNotification({
      show: true,
      severity: messageSeverity.SUCCESS,
      message: 'message',
    });
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({
      show: false,
      severity: notification.severity,
      message: notification.message,
    });
  };

  const notify = (n: notification) => {
    setNotification(n);
  };

  const handleDelete = async (id: string) => {
    const API = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_DELETE_API_PATH.replace(':fileId', id)}`;
    try {
      await fetch(API, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      fetchItems(offset);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    const API = `${import.meta.env.VITE_BACKEND_HOST}${GENERATE_API_PATH.replace(':fileId', id)}`;
    try {
      await fetch(API, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ id }),
      });
      fetchItems(offset);
      notify({
        show: true,
        severity: messageSeverity.SUCCESS,
        message: 'Success!',
      });
    } catch (error) {
      console.error('Error generating graph:', error);
      notify({
        show: true,
        severity: messageSeverity.ERROR,
        message: 'Error!',
      });
    } finally {
      setGenerating(null);
    }
  };

  const navigate = useNavigate();

  const handleChangePage = (event: unknown, newPage: number) => {
    setOffset(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setOffset(0);
  };

  return (
    <main>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer
          component={Paper}
          sx={{ border: '1px solid #ccc', borderRadius: '4px', maxHeight: 440 }}
        >
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
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="sticky table"
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderBottom: '1px solid #ccc' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ccc' }}>
                    Created at
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ccc' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ccc' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{getDate(row.created_at)}</TableCell>
                    <TableCell>{getStatus(row.status)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2}>
                        {row.status === GraphStatus.GRAPH_READY ? (
                          <Button
                            color="primary"
                            variant="contained"
                            size="small"
                            className="main_action_button"
                            onClick={() => navigate(`/graph/${row.id}`)}
                            disabled={row.status !== GraphStatus.GRAPH_READY}
                          >
                            View
                          </Button>
                        ) : (
                          <Button
                            color="success"
                            variant="contained"
                            size="small"
                            className="main_action_button"
                            disabled={generating !== null}
                            onClick={() => handleGenerate(row.id)}
                          >
                            {generating === row.id ? (
                              <>
                                <CircularProgress size={15} />
                                <Box sx={{ ml: 2 }}>Working...</Box>
                              </>
                            ) : (
                              'Generate Graph'
                            )}
                          </Button>
                        )}
                        <Button
                          color="error"
                          variant="contained"
                          size="small"
                          onClick={() => handleDelete(row.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
      <CustomizedSnackbars
        open={notification.show}
        handleClick={handleClick}
        handleClose={handleClose}
        message={notification.message}
        severity_value={notification.severity}
      />
    </main>
  );
};

export default GraphList;
